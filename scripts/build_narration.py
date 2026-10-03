#!/usr/bin/env python3
"""Offline, resumable bilingual speech build with objective gates and Opus output.

Auditions and rejected WAVs stay in ignored artifacts/audio-build. Only passed
tracks enter public/audio; an incomplete manifest is explicitly not releasable.
Human listening and native-speaker review are NOT implied by these gates.
"""
from __future__ import annotations
import argparse
import hashlib
import importlib.metadata
import json
import os
import subprocess
from pathlib import Path

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")

try:
    from .audio_quality import Measure, OfflineAsr, assess_transcript, signal_metrics, signal_failures, stable_seed, token_cap
    from .providers.indic_parler import IndicParlerProvider
except ImportError:
    from audio_quality import Measure, OfflineAsr, assess_transcript, signal_metrics, signal_failures, stable_seed, token_cap
    from providers.indic_parler import IndicParlerProvider

ROOT = Path(__file__).resolve().parents[1]
BASE = json.loads((ROOT / "scripts/config/tts.json").read_text())
CONFIG = json.loads((ROOT / "scripts/config/tts-production.json").read_text())


def digest(value):
    return hashlib.sha256(value).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2)+"\n")
    temporary.replace(path)


def content_tracks(root=ROOT):
    tracks = []
    for language in ("en", "hi"):
        for file, key, prefix in (("narration.json", "id", ""), ("glossary.json", "termId", "glossary.")):
            for entry in json.loads((root / "src/content" / language / file).read_text()):
                if entry["status"] == "planned":
                    continue
                if entry["status"] not in ("agent-checked", "reviewed"):
                    raise ValueError(f"unapproved draft text: {language}:{entry[key]}")
                tracks.append({"id": prefix+entry[key], "language": language, "spokenText": entry["spokenText"].strip()})
    return tracks


class Builder:
    def __init__(self, model_dir, cache, *, device="cpu"):
        import torch
        torch.set_num_threads(CONFIG["cpuThreads"])
        torch.set_num_interop_threads(1)
        self.cache = cache.resolve()
        self.cache.mkdir(parents=True, exist_ok=True)
        self.hashes = {}
        self.events = []
        self.versions = {name: importlib.metadata.version(name) for name in ("torch", "transformers", "parler-tts", "soundfile", "psutil")}
        self.provider = IndicParlerProvider(model_dir=model_dir, model_revision=BASE["modelRevision"],
            description_tokenizer_id=BASE["descriptionTokenizerId"], description_tokenizer_revision=BASE["descriptionTokenizerRevision"],
            do_sample=True, device=device)
        with Measure() as measure:
            self.provider.prepare()
        self.load = {"ttsSeconds": measure.seconds, "ttsPeakRssBytes": measure.peak}
        with Measure() as measure:
            self.asr = OfflineAsr(CONFIG["asr"])
        self.load.update({"asrSeconds": measure.seconds, "asrPeakRssBytes": measure.peak})

    def generate(self, track, speaker):
        text, language, track_id = track["spokenText"], track["language"], track["id"]
        self.provider.set_voice_description(BASE["voiceDescriptionTemplate"].format(speaker=speaker))
        for attempt in range(CONFIG["maxAttempts"]):
            seed = stable_seed(language, track_id, text, attempt, CONFIG["baseSeed"])
            cap = token_cap(text, CONFIG)
            self.provider.set_generation_settings(seed=seed, max_new_tokens=cap, do_sample=CONFIG["doSample"])
            fingerprint = {"pipelineVersion": 1, "track": track, "generation": self.provider.generation_config(),
                           "policy": CONFIG, "versions": self.versions}
            input_hash = digest(json.dumps(fingerprint, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode())
            folder = self.cache / input_hash
            folder.mkdir(exist_ok=True)
            wav, report_path = folder / "speech.wav", folder / "quality.json"
            row = None
            if report_path.exists() and wav.exists():
                candidate = json.loads(report_path.read_text())
                if candidate.get("wavSha256") == digest(wav.read_bytes()) and candidate.get("inputSha256") == input_hash:
                    row = candidate
                    row["cacheHit"] = True
            if row is None:
                print(f"GENERATE {language}:{track_id} {speaker} attempt={attempt+1} cap={cap}", flush=True)
                with Measure() as measure:
                    self.provider.generate(text, language=language, content_sha256=digest(text.encode()), output_wav=wav)
                metrics = signal_metrics(wav)
                termination = self.provider.last_generation()
                failures = signal_failures(metrics, text, termination, CONFIG, self.hashes)
                row = {**track, **metrics, **termination, "inputSha256": input_hash, "seed": seed, "attempt": attempt+1,
                       "speaker": speaker, "ttsWallSeconds": measure.seconds, "peakRssBytes": measure.peak,
                       "failures": failures, "cacheHit": False}
                # Never feed known silence/cap artifacts to a hallucination-prone ASR.
                if not failures:
                    with Measure() as asr_measure:
                        result = self.asr.transcribe(wav, language, text)
                    result["threshold"] = CONFIG["quality"]["maximumCer"][language]
                    result["status"] = "passed" if result["cer"] <= result["threshold"] and result["quantitiesMatch"] else "failed"
                    row["asr"] = result
                    row["asrWallSeconds"] = asr_measure.seconds
                    row["peakRssBytes"] = max(row["peakRssBytes"], asr_measure.peak)
                    if result["status"] != "passed":
                        row["failures"].append("asr-character-error-rate")
                row["passed"] = not row["failures"]
                write_json(report_path, row)
            if row.get("asr") and row["asr"].get("normalizationVersion") != 2:
                # Gate-only formatting bug fix: retain measured waveform/transcript,
                # raw CER and prior decision; no new synthesis or ASR inference.
                asr = row["asr"]
                asr["previousAssessment"] = {key: asr.get(key) for key in ("cer", "status", "normalization")}
                asr.update(assess_transcript(text, asr["transcript"], language))
                asr["status"] = "passed" if asr["cer"] <= asr["threshold"] and asr["quantitiesMatch"] else "failed"
                row["failures"] = [failure for failure in row["failures"] if failure != "asr-character-error-rate"]
                if asr["status"] != "passed":
                    row["failures"].append("asr-character-error-rate")
                row["passed"] = not row["failures"]
                write_json(report_path, row)
            # Check cross-text duplicate evidence even for individually valid cached tracks.
            old_text = self.hashes.get(row.get("wavSha256"))
            if old_text is not None and old_text != text:
                row["passed"] = False
                row["failures"] = list(set(row["failures"] + ["duplicate-audio-for-different-text"]))
            self.hashes[row.get("wavSha256")] = text
            self.events.append(row)
            write_json(self.cache / "progress.json", {"load": self.load, "events": self.events})
            print(f"RESULT {language}:{track_id} {speaker} passed={row['passed']} duration={row.get('durationSeconds',0):.2f}s time={row['ttsWallSeconds']:.2f}s CER={row.get('asr',{}).get('cer')} failures={row['failures']}", flush=True)
            if row["passed"]:
                return row, wav
        return None

    def audition(self, tracks):
        by_id = {t["id"]: t for t in tracks if t["language"] == "hi"}
        clips = [{"id": "audition."+clip["id"], "language": "hi", "spokenText": " ".join(by_id[i]["spokenText"] for i in clip["narrationIds"])}
                 for clip in BASE["audition"]["clips"]]
        candidates = []
        for speaker in BASE["audition"]["speakers"]:
            results = [self.generate(clip, speaker) for clip in clips]
            good = [result[0] for result in results if result]
            candidates.append({"speaker": speaker, "passedClips": len(good), "requiredClips": len(clips),
                               "meanCer": sum(row["asr"]["cer"] for row in good)/len(good) if good else None,
                               "meanTtsSeconds": sum(row["ttsWallSeconds"] for row in good)/len(good) if good else None,
                               "clips": good})
        eligible = [candidate for candidate in candidates if candidate["passedClips"] == len(clips)]
        winner = min(eligible, key=lambda candidate: (candidate["meanCer"], candidate["meanTtsSeconds"])) if eligible else None
        result = {"candidates": candidates, "selected": winner["speaker"] if winner else None,
                  "selectionRule": "all three gates pass, then lowest mean CER, then lowest mean wall time",
                  "humanListened": False, "nativeReview": False, "config": CONFIG, "load": self.load, "versions": self.versions}
        write_json(self.cache / "auditions.json", result)
        return result


def encode(wav, output):
    output.parent.mkdir(parents=True, exist_ok=True)
    encoding = CONFIG["encoding"]
    subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav),
                    "-af", f"loudnorm=I={encoding['integratedLufs']}:TP={encoding['truePeakDb']}:LRA={encoding['loudnessRange']}",
                    "-ac", "1", "-ar", str(encoding["sampleRate"]), "-c:a", "libopus", "-b:a", "24k", str(output)], check=True, capture_output=True)
    # Check the shipped codec output too, not only its pre-normalization WAV.
    metrics = signal_metrics(output)
    if not metrics.get("finite") or metrics["clippedRatio"] > CONFIG["quality"]["maximumClippedRatio"]:
        raise ValueError("encoded asset failed finite/clipping gate")
    return metrics


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument("--cache-dir", type=Path, default=ROOT / "artifacts/audio-build")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "public/audio")
    parser.add_argument("--device", choices=("cpu", "auto", "cuda", "cuda:0"), default="cpu")
    parser.add_argument("--audition-only", action="store_true")
    args = parser.parse_args()
    # Outputs must never mingle with source code, model files, or raw data.
    for output in (args.cache_dir.resolve(), args.output_dir.resolve()):
        model = args.model_dir.resolve()
        if output == model or output.is_relative_to(model) or model.is_relative_to(output) or output.is_relative_to(ROOT / "src"):
            parser.error("unsafe output location")
    tracks = content_tracks()
    builder = Builder(args.model_dir, args.cache_dir, device=args.device)
    auditions = builder.audition(tracks)
    if auditions["selected"] is None:
        raise SystemExit("No voice passed all three auditions; no production audio approved.")
    print("AUTOMATED VOICE SELECTION:", auditions["selected"], "(no human listened)", flush=True)
    if args.audition_only:
        return
    manifest = {"schemaVersion": 2, "complete": False, "status": "agent-checked",
                "voices": {"en": auditions["selected"], "hi": auditions["selected"]},
                "provenance": {"modelId": BASE["modelId"], "modelRevision": BASE["modelRevision"],
                    "descriptionTokenizerId": BASE["descriptionTokenizerId"], "descriptionTokenizerRevision": BASE["descriptionTokenizerRevision"],
                    "voiceDescriptionTemplate": BASE["voiceDescriptionTemplate"], "buildConfig": CONFIG,
                    "versions": builder.versions, "humanListened": False, "nativeReview": False,
                    "selection": "automated Hindi auditions; English individually gated; no subjective voice claim"}, "tracks": []}
    failed = []
    for track in tracks:
        result = builder.generate(track, auditions["selected"])
        if result is None:
            failed.append(f"{track['language']}:{track['id']}")
            continue
        row, wav = result
        output = args.output_dir / track["language"] / (row["inputSha256"]+".opus")
        metrics = encode(wav, output)
        manifest["tracks"].append({**track, "path": f"/audio/{track['language']}/{output.name}",
            "contentSha256": digest(track["spokenText"].encode()), "inputSha256": row["inputSha256"], "assetSha256": digest(output.read_bytes()),
            "durationSeconds": metrics["durationSeconds"], "bytes": output.stat().st_size, "status": "agent-checked",
            "seed": row["seed"], "quality": {"passed": True, "eos": row["eos"], "asr": row["asr"],
                "sourceMetrics": {k: row[k] for k in ("rmsDbfs", "peak", "silenceRatio", "generatedSteps", "maxNewTokens")},
                "encodedMetrics": metrics}})
        write_json(args.output_dir / "manifest.json", manifest)
    manifest["complete"] = not failed and len(manifest["tracks"]) == len(tracks)
    manifest["failedTracks"] = failed
    write_json(args.output_dir / "manifest.json", manifest)
    # Remove superseded locally generated hashed Opus assets, never raw/model files.
    # A former passing candidate can become rejected after a stricter gate repair.
    retained = {Path(track["path"]).name for track in manifest["tracks"]}
    for language in ("en", "hi"):
        for asset in (args.output_dir / language).glob("*.opus"):
            if len(asset.stem) == 64 and all(c in "0123456789abcdef" for c in asset.stem) and asset.name not in retained:
                asset.unlink()
    write_json(args.cache_dir / "build-report.json", {"expected": len(tracks), "passed": len(manifest["tracks"]), "failed": failed,
        "audioBytes": sum(t["bytes"] for t in manifest["tracks"]), "audioSeconds": sum(t["durationSeconds"] for t in manifest["tracks"]),
        "load": builder.load, "events": builder.events})
    print(f"BUILD {len(manifest['tracks'])}/{len(tracks)} passed; failed={failed}", flush=True)
    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
