#!/usr/bin/env python3
"""Bounded Hindi number-word diagnostic for the parked audio blocker.

This is a *diagnostic*, not a production build and not a release gate. It
answers one question with controlled evidence: for the exact pinned
model/tokenizer/voice and sampled decode, does the synthesised Hindi number
word carry the nasalisation (``पाँच``/``पांच``) that ``openai/whisper-small``
must observe, and can that recogniser observe it at all?

It performs a small, fixed set of isolated-word and in-context generations with
per-input deterministic seeds, writes the WAVs and a JSON report under an
ignored output directory, and stops. It does not enter ``public/audio``, does
not alter the production cache or manifest, and does not relax any gate.

No human listened and no native speaker reviewed the output; a recogniser pass
or failure here is evidence about the pipeline, never about naturalness.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")

try:
    from .audio_quality import Measure, OfflineAsr, assess_transcript, signal_metrics
    from .providers.indic_parler import IndicParlerProvider
except ImportError:
    from audio_quality import Measure, OfflineAsr, assess_transcript, signal_metrics
    from providers.indic_parler import IndicParlerProvider

ROOT = Path(__file__).resolve().parents[1]
BASE = json.loads((ROOT / "scripts/config/tts.json").read_text())
PROD = json.loads((ROOT / "scripts/config/tts-production.json").read_text())

SPEAKER = "Divya"

# Exact content sentence plus controlled spelling variants. "दस" (ten) and
# "नीचे" (below) are known-good controls from tracks that already passed.
# Exact content sentence plus controlled spelling variants. "दस" (ten) and
# "नीचे" (below) are known-good controls from tracks that already passed. The
# non-nasal spellings isolate whether the pinned TTS renders the nasal mark at
# all: they are acoustic controls, never production text.
VARIANTS = (
    ("isolated.paanch-chandrabindu", "पाँच"),
    ("isolated.paanch-anusvara", "पांच"),
    ("isolated.paach-nonasal", "पाच"),
    ("isolated.paaj-nonasal", "पाज"),
    ("isolated.das-control", "दस"),
    ("isolated.neechhe-control", "नीचे"),
    ("sentence.paanch-chandrabindu", "रास्ता शुरुआत से पाँच प्रतिशत नीचे है।"),
    ("sentence.paanch-anusvara", "रास्ता शुरुआत से पांच प्रतिशत नीचे है।"),
    ("sentence.paach-nonasal", "रास्ता शुरुआत से पाच प्रतिशत नीचे है।"),
    ("sentence.das-control", "रास्ता शुरुआत से दस प्रतिशत नीचे है।"),
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "artifacts/tts-number-diagnostic")
    parser.add_argument("--device", choices=("cpu", "auto", "cuda", "cuda:0"), default="cpu")
    args = parser.parse_args()

    output_dir = args.output_dir.resolve()
    model_dir = args.model_dir.resolve()
    if output_dir == model_dir or output_dir.is_relative_to(model_dir) or model_dir.is_relative_to(output_dir):
        parser.error("unsafe output location")
    for existing in output_dir.glob("*.wav"):
        existing.unlink()

    provider = IndicParlerProvider(
        model_dir=args.model_dir,
        model_revision=BASE["modelRevision"],
        description_tokenizer_id=BASE["descriptionTokenizerId"],
        description_tokenizer_revision=BASE["descriptionTokenizerRevision"],
        do_sample=True,
        device=args.device,
    )
    with Measure() as load_measure:
        provider.prepare()
    with Measure() as asr_measure:
        asr = OfflineAsr(PROD["asr"])

    provider.set_voice_description(BASE["voiceDescriptionTemplate"].format(speaker=SPEAKER))
    report = {
        "kind": "tts-number-diagnostic",
        "speaker": SPEAKER,
        "modelRevision": BASE["modelRevision"],
        "asr": PROD["asr"],
        "load": {"ttsSeconds": load_measure.seconds, "asrSeconds": asr_measure.seconds},
        "variants": [],
    }
    for name, text in VARIANTS:
        # One fixed seed for every variant so the spoken text is the only
        # variable: the acoustic comparison is not confounded by prosody.
        seed = 424242
        provider.set_generation_settings(seed=seed, max_new_tokens=690, do_sample=True)
        wav = output_dir / f"{name}.wav"
        with Measure() as synthesis_measure:
            provider.generate(text, language="hi", content_sha256=name, output_wav=wav)
        metrics = signal_metrics(wav)
        with Measure() as transcribe_measure:
            result = asr.transcribe(wav, "hi", text)
        row = {
            "name": name,
            "spokenText": text,
            "seed": seed,
            "synthesisSeconds": synthesis_measure.seconds,
            "asrSeconds": transcribe_measure.seconds,
            "signal": {k: metrics.get(k) for k in ("finite", "durationSeconds", "rmsDbfs", "peak", "silenceRatio", "clippedRatio", "wavSha256")},
            **assess_transcript(text, result["transcript"], "hi"),
            "transcript": result["transcript"],
        }
        report["variants"].append(row)
        print(f"{name}: {result['transcript']} cer={row['cer']:.4f} quantitiesMatch={row['quantitiesMatch']}", flush=True)

    (output_dir / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"wrote {output_dir / 'report.json'}", flush=True)


if __name__ == "__main__":
    main()
