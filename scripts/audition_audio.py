#!/usr/bin/env python3
"""Six local Hindi voice auditions only; never builds the release audio set."""
from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import os
import platform
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from time import perf_counter

try:
    from .providers.indic_parler import IndicParlerProvider, TTS_CONFIG_PATH
    from .generate_audio import content_sha256, generation_input_sha256
except ImportError:
    from providers.indic_parler import IndicParlerProvider, TTS_CONFIG_PATH
    from generate_audio import content_sha256, generation_input_sha256

ROOT = Path(__file__).resolve().parents[1]


def load_config(path: Path) -> dict:
    config = json.loads(path.read_text(encoding="utf-8"))
    for field in ("modelRevision", "descriptionTokenizerRevision"):
        if not re.fullmatch(r"[0-9a-f]{40}", config[field]):
            raise ValueError(f"{field} must be an immutable commit, not main")
    template = config["voiceDescriptionTemplate"]
    if template.count("{speaker}") != 1 or "{" in template.replace("{speaker}", "") or "}" in template.replace("{speaker}", ""):
        raise ValueError("voice description must have only one {speaker} placeholder")
    audition = config["audition"]
    if audition["language"] != "hi" or audition["speakers"] != ["Rohit", "Divya"]:
        raise ValueError("this audition compares only Hindi Rohit then Divya")
    if len(audition["clips"]) != 3:
        raise ValueError("exactly three clips per speaker are required")
    if type(audition["cpuThreads"]) is not int or not 1 <= audition["cpuThreads"] <= 32:
        raise ValueError("cpuThreads must be one through 32")
    generation = config["generation"]
    if type(generation["doSample"]) is not bool or type(generation["seed"]) is not int or not 0 <= generation["seed"] < 2**32:
        raise ValueError("use a boolean doSample and an explicit non-negative fixed seed")
    return config


def narration_clips(config: dict, content_root: Path = ROOT / "src/content") -> list[dict]:
    entries = json.loads((content_root / "hi/narration.json").read_text(encoding="utf-8"))
    by_id = {entry["id"]: entry for entry in entries}
    if len(by_id) != len(entries):
        raise ValueError("duplicate narration IDs")
    clips = []
    for clip in config["audition"]["clips"]:
        if not re.fullmatch(r"[a-z0-9-]+", clip["id"]) or not clip["narrationIds"]:
            raise ValueError("invalid audition clip id or empty narration list")
        texts = [by_id[narration_id]["spokenText"] for narration_id in clip["narrationIds"]]
        if any(not isinstance(text, str) or not text.strip() or re.search(r"[0-9A-Za-z₹%×{}]", text) for text in texts):
            raise ValueError("audition speech must use non-empty Hindi spokenText, without numeric/Latin notation")
        spoken = " ".join(text.strip() for text in texts)
        clips.append({**clip, "spokenText": spoken, "contentSha256": content_sha256(spoken),
                      "contentStatuses": [by_id[narration_id]["status"] for narration_id in clip["narrationIds"]]})
    if len({clip["id"] for clip in clips}) != 3:
        raise ValueError("clip IDs must be unique")
    return clips


def cache_tokenizer(config: dict) -> str:
    """Explicit one-time online operation: tokenizer files only, never T5 weights."""
    from huggingface_hub import snapshot_download
    from transformers import AutoTokenizer
    path = snapshot_download(
        repo_id=config["descriptionTokenizerId"],
        revision=config["descriptionTokenizerRevision"],
        allow_patterns=["tokenizer.json", "tokenizer_config.json", "special_tokens_map.json", "spiece.model", "config.json"],
        token=False,
    )
    AutoTokenizer.from_pretrained(path, local_files_only=True, trust_remote_code=False)
    return path


def provider_for(config: dict, model_dir: Path, tokenizer_dir: Path | None = None) -> IndicParlerProvider:
    return IndicParlerProvider(
        model_id=config["modelId"], model_revision=config["modelRevision"], model_dir=model_dir,
        description_tokenizer_id=config["descriptionTokenizerId"],
        description_tokenizer_revision=config["descriptionTokenizerRevision"],
        description_tokenizer_dir=tokenizer_dir,
        description=config["voiceDescriptionTemplate"].format(speaker=config["audition"]["speakers"][0]),
        device="cpu", seed=config["generation"]["seed"], do_sample=config["generation"]["doSample"],
        max_new_tokens=config["generation"]["maxNewTokens"],
    )


def checked_output_dir(path: Path) -> Path:
    path = path.resolve()
    if path.is_relative_to(ROOT) and not path.is_relative_to(ROOT / "artifacts/tts-auditions"):
        raise ValueError("inside this repo, auditions must stay in gitignored artifacts/tts-auditions, not src/public/dist")
    if path.exists() and any(path.iterdir()):
        raise ValueError("audition output directory must be new or empty; existing clips are never overwritten")
    return path


def wav_metrics(path: Path) -> dict:
    import numpy as np
    import soundfile as sf
    audio, rate = sf.read(path, always_2d=True)
    if len(audio) == 0 or audio.shape[1] != 1 or not np.isfinite(audio).all():
        raise ValueError("generated WAV must be non-empty, finite, mono")
    peak = float(np.max(np.abs(audio)))
    rms = float(np.sqrt(np.mean(audio**2)))
    if peak == 0:
        raise ValueError("generated WAV is silent")
    return {"durationSeconds": len(audio) / rate, "sampleRate": rate, "frames": len(audio),
            "channels": audio.shape[1], "peak": peak, "rms": rms,
            "rmsDbfs": 20 * math.log10(rms),
            "clippedSampleFraction": float(np.mean(np.abs(audio) >= 0.999)),
            "wavSha256": hashlib.sha256(path.read_bytes()).hexdigest()}


def quality_warnings(metrics: dict, model_config: dict, max_new_tokens: int) -> list[str]:
    """Diagnostics, not listening/voice approval; preserve the raw WAV even if flagged."""
    warnings = []
    if metrics["rms"] < 0.001:
        warnings.append("Very low signal: RMS below -60 dBFS; listen before comparing voices.")
    encoder = model_config["audio_encoder"]
    seconds_at_cap = max_new_tokens * encoder["hop_length"] / encoder["sampling_rate"]
    if metrics["durationSeconds"] >= 0.98 * seconds_at_cap:
        warnings.append("Duration near the configured token limit; possible non-termination/truncation.")
    return warnings


def write_report(path: Path, report: dict) -> None:
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    temporary.replace(path)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=TTS_CONFIG_PATH)
    parser.add_argument("--model-dir", type=Path)
    parser.add_argument("--description-tokenizer-dir", type=Path)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "artifacts/tts-auditions/greedy-seed0")
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--cache-tokenizer", action="store_true", help="one online cache preparation; no speech/weights")
    modes.add_argument("--check", action="store_true", help="offline import and both-tokenizer check; no generation")
    modes.add_argument("--dry-run", action="store_true", help="print the six transcripts/descriptions; no model imports")
    args = parser.parse_args(argv)
    try:
        config = load_config(args.config)
        clips = narration_clips(config)
        if args.cache_tokenizer:
            print(cache_tokenizer(config))
            return 0
        if args.dry_run:
            print(json.dumps({"config": config, "clips": clips, "clipCount": 6, "assetsGenerated": False}, ensure_ascii=False, indent=2))
            return 0
        if args.model_dir is None:
            raise ValueError("--model-dir is required")
        # Set before lazy model/hub imports. The provider independently uses local_files_only.
        os.environ["HF_HUB_OFFLINE"] = "1"
        os.environ["TRANSFORMERS_OFFLINE"] = "1"
        os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
        provider = provider_for(config, args.model_dir, args.description_tokenizer_dir)
        if args.check:
            print(json.dumps(provider.check_requirements(), ensure_ascii=False, indent=2))
            return 0
        output = checked_output_dir(args.output_dir)
        model_dir = args.model_dir.resolve()
        if output.is_relative_to(model_dir) or model_dir.is_relative_to(output):
            raise ValueError("output and model directories must be separate")
        output.mkdir(parents=True, exist_ok=True)
        report = {"kind": "tts-audition", "status": "loading", "releaseApproved": False,
                  "startedAt": datetime.now(timezone.utc).isoformat(), "config": config,
                  "configSha256": hashlib.sha256(args.config.read_bytes()).hexdigest(),
                  "narrationFileSha256": hashlib.sha256((ROOT / "src/content/hi/narration.json").read_bytes()).hexdigest(),
                  "python": platform.python_version(), "platform": platform.platform(),
                  "cpuThreads": config["audition"]["cpuThreads"], "clips": [],
                  "timingMethod": "perf_counter wall seconds per tokenize+generate+PCM16 WAV write; excludes model loading and WAV metrics; no warmup"}
        report_path = output / "run.json"
        write_report(report_path, report)
        try:
            started = perf_counter()
            import torch
            torch.set_num_threads(config["audition"]["cpuThreads"])
            torch.set_num_interop_threads(1)
            provider.prepare()
            report["modelLoadSeconds"] = perf_counter() - started
            report["provenance"] = provider.provenance()
            report["versions"] = {name: importlib.metadata.version(name) for name in (
                "torch", "torchaudio", "parler-tts", "transformers", "huggingface-hub", "soundfile", "numpy", "descript-audiotools")}
            model_config = json.loads((model_dir / "config.json").read_text(encoding="utf-8"))
            report["status"] = "generating"
            write_report(report_path, report)
            print(f"Model loaded in {report['modelLoadSeconds']:.2f}s; generating six clips only.", flush=True)
            for speaker in config["audition"]["speakers"]:
                description = config["voiceDescriptionTemplate"].format(speaker=speaker)
                provider.set_voice_description(description)
                for clip in clips:
                    wav = output / f"{speaker.lower()}-{clip['id']}.wav"
                    print(f"START {wav.name}", flush=True)
                    started = perf_counter()
                    provider.generate(clip["spokenText"], language="hi", content_sha256=clip["contentSha256"], output_wav=wav)
                    elapsed = perf_counter() - started
                    metrics = wav_metrics(wav)
                    entry = {**clip, "speaker": speaker, "voiceDescription": description, "file": wav.name,
                             "generationSeconds": elapsed, **metrics,
                             "qualityWarnings": quality_warnings(metrics, model_config, config["generation"]["maxNewTokens"]),
                             "realTimeFactor": elapsed / metrics["durationSeconds"],
                             "inputSha256": generation_input_sha256(clip["spokenText"], language="hi", provider=provider)}
                    report["clips"].append(entry)
                    write_report(report_path, report)
                    print(f"DONE {wav.name}: {elapsed:.2f}s CPU wall; {metrics['durationSeconds']:.2f}s audio; {entry['realTimeFactor']:.2f}x real-time", flush=True)
            report["status"] = "complete"
            report["qualityStatus"] = "failed-numerical-screen" if any(clip["qualityWarnings"] for clip in report["clips"]) else "listening-review-required"
        except Exception as exc:
            report["status"] = "failed"
            report["error"] = f"{type(exc).__name__}: {exc}"
            raise
        finally:
            write_report(report_path, report)
        print(f"Auditions and timings: {output}; quality: {report['qualityStatus']}", flush=True)
        return 0
    except Exception as exc:
        parser.exit(2, f"audition failed: {exc}\n")


if __name__ == "__main__":
    raise SystemExit(main())
