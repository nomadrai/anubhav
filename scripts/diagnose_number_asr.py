#!/usr/bin/env python3
"""Independent second-recogniser diagnostic for the parked Hindi number blocker.

This is a *diagnostic*, not a production build and not a release gate. The
pinned production gate uses ``openai/whisper-small`` and did not transcribe the
nasalised number ``पाँच`` from any of the three retained ``hi:DRAWDOWN_5``
WAVs. This script asks a *larger, independently trained member of the same
Apache-2.0 Whisper family*, pinned by immutable revision and loaded
``local_files_only``, whether those WAVs carry the nasalised number.

Controls decide whether the second recogniser is trustworthy for this question:
the isolated diagnostic WAVs whose spoken text is known (a genuinely non-nasal
``पाज``/``पाच`` and the nasal ``पाँच``/``पांच``). If the recogniser cannot tell
those apart, its verdict on the production WAVs is *not* treated as evidence.

No human listened and no native speaker reviewed the output. A recogniser
result is evidence about the pipeline, never about naturalness or pronunciation.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")

try:
    from .audio_quality import Measure, OfflineAsr
except ImportError:
    from audio_quality import Measure, OfflineAsr

ROOT = Path(__file__).resolve().parents[1]

# The exact production reference for the parked track.
PRODUCTION_REFERENCE = "रास्ता शुरुआत से पाँच प्रतिशत नीचे है।"
PRODUCTION_WAVS = (
    ROOT / "artifacts/audio-build/272e9a351189d8701c7a4de1b983beb3aa9d5400755b90bf9bcd5d14348d8748/speech.wav",
    ROOT / "artifacts/audio-build/beed52956c2d2e1b9026f209af06fdf094bd73bb65905e0143c4c03a12e40ffb/speech.wav",
    ROOT / "artifacts/audio-build/fa3cc3575807e05cdaf34494662f67c85e2d321ab9710e0780592324579487f7/speech.wav",
)

# Known-text controls: the spoken text of each WAV is fixed by the diagnostic
# that produced it, so a recogniser's spelling can be checked against truth.
# Isolated single syllables are hard; in-context sentence controls are the
# relevant validation for an in-context production sentence.
CONTROL_REFERENCE = {
    "isolated.paaj-nonasal": "पाज",
    "isolated.paach-nonasal": "पाच",
    "isolated.paanch-chandrabindu": "पाँच",
    "isolated.paanch-anusvara": "पांच",
    "sentence.paach-nonasal": "रास्ता शुरुआत से पाच प्रतिशत नीचे है।",
    "sentence.paanch-chandrabindu": "रास्ता शुरुआत से पाँच प्रतिशत नीचे है।",
    "sentence.paanch-anusvara": "रास्ता शुरुआत से पांच प्रतिशत नीचे है।",
    "sentence.das-control": "रास्ता शुरुआत से दस प्रतिशत नीचे है।",
}


def _row(path: Path, reference: str, asr: OfflineAsr, language: str = "hi") -> dict:
    if not path.is_file():
        return {"path": str(path), "missing": True}
    with Measure() as measure:
        result = asr.transcribe(path, language, reference)
    return {
        "path": str(path.relative_to(ROOT)),
        "reference": reference,
        "transcript": result["transcript"],
        "cer": result["cer"],
        "quantitiesMatch": result["quantitiesMatch"],
        "seconds": measure.seconds,
        "asrModelId": result["modelId"],
        "asrRevision": result["revision"],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-id", default="openai/whisper-medium")
    parser.add_argument("--revision", required=True)
    parser.add_argument("--model-dir", type=Path, default=None)
    parser.add_argument("--output", type=Path, default=ROOT / "artifacts/tts-number-diagnostic/second-recogniser.json")
    args = parser.parse_args()

    config = {
        "modelId": str(args.model_dir) if args.model_dir else args.model_id,
        "revision": args.revision,
        "sampleRate": 16000,
        "doSample": False,
    }

    diagnostic_dir = ROOT / "artifacts/tts-number-diagnostic"
    report = {
        "kind": "second-recogniser-diagnostic",
        "asr": {"modelId": args.model_id, "revision": args.revision, "modelDir": str(args.model_dir) if args.model_dir else None},
        "caveat": "Automated recogniser evidence only; no human listening and no native-speaker review.",
        "controls": {},
        "production": [],
        "controlSeparation": None,
    }

    asr = OfflineAsr(config)
    for name, reference in CONTROL_REFERENCE.items():
        row = _row(diagnostic_dir / f"{name}.wav", reference, asr)
        report["controls"][name] = row
        print(f"control {name}: {row.get('transcript')}", flush=True)

    # A recogniser is trustworthy for the production sentence only if, on the
    # same speaker/seed controls, it keeps an in-context non-nasal number
    # non-nasal and renders an in-context nasal number with a nasal mark.
    def _nasal_mark(text: str) -> bool:
        return "ँ" in text or "ं" in text

    def _reads_as_nasal_five(text: str) -> bool:
        # The trailing copula "हैं/है" always carries an anusvara, so drop it
        # before looking for a nasal mark on the number itself. Either the
        # nasalised number word or the plain numeral counts as hearing five.
        without_copula = text.replace("हैं", " ").replace("है", " ")
        return _nasal_mark(without_copula) or "5" in text

    def _group(nonnasal: tuple[str, ...], nasal: tuple[str, ...]) -> dict:
        nonnasal_ok = all(not _reads_as_nasal_five(report["controls"][n].get("transcript") or "") for n in nonnasal)
        nasal_ok = all(_reads_as_nasal_five(report["controls"][n].get("transcript") or "") for n in nasal)
        return {"nonNasalControlsRemainNonNasal": nonnasal_ok, "nasalControlsReadAsNasalOrNumeral": nasal_ok,
                "separates": bool(nonnasal_ok and nasal_ok)}

    groups = {
        "isolated": _group(("isolated.paaj-nonasal", "isolated.paach-nonasal"),
                           ("isolated.paanch-chandrabindu", "isolated.paanch-anusvara")),
        "sentence": _group(("sentence.paach-nonasal",),
                           ("sentence.paanch-chandrabindu", "sentence.paanch-anusvara")),
    }
    report["controlSeparation"] = {
        **groups,
        # The production target is an in-context sentence, so the sentence
        # controls are the ones that decide trustworthiness in context.
        "trustworthyForProduction": groups["sentence"]["separates"],
    }

    for path in PRODUCTION_WAVS:
        row = _row(path, PRODUCTION_REFERENCE, asr)
        report["production"].append(row)
        print(f"production {path.parent.name[:8]}: {row.get('transcript')} quantitiesMatch={row.get('quantitiesMatch')}", flush=True)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"wrote {args.output}", flush=True)


if __name__ == "__main__":
    main()
