#!/usr/bin/env python3
"""Phase 0 audio CLI: only a no-file dry-run plan is available."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any, Iterable

try:  # Works both as `python scripts/generate_audio.py` and as a module.
    from .providers.stub import StubProvider
except ImportError:  # pragma: no cover - direct script execution path
    from providers.stub import StubProvider


class AudioCliError(ValueError):
    """A user-correctable audio CLI error."""


def _load_episode(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise AudioCliError(f"cannot read episode {path}: {exc}") from exc
    except json.JSONDecodeError as exc:
        raise AudioCliError(f"episode is not valid JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise AudioCliError("episode JSON root must be an object")
    reveal = data.get("reveal")
    if not isinstance(reveal, dict):
        raise AudioCliError("episode must contain reveal text")
    for field in ("periodText", "whatHappenedText"):
        values = reveal.get(field)
        if not isinstance(values, dict) or any(not isinstance(values.get(lang), str) or not values[lang].strip() for lang in ("en", "hi")):
            raise AudioCliError(f"episode reveal.{field} must contain non-empty en and hi strings")
    return data


def _tracks(episode: dict[str, Any]) -> list[tuple[str, str, str, str]]:
    reveal = episode["reveal"]
    result = []
    for language in ("en", "hi"):
        for field in ("periodText", "whatHappenedText"):
            spoken = reveal[field][language].strip()
            digest = hashlib.sha256(spoken.encode("utf-8")).hexdigest()
            result.append((language, field, spoken, digest))
    return result


def build_dry_run_plan(episode: dict[str, Any], provider: StubProvider) -> dict[str, Any]:
    tracks = []
    for language, field, spoken, digest in _tracks(episode):
        track = provider.dry_run(spoken, language=language, content_sha256=digest)
        track["field"] = field
        tracks.append(track)
    return {
        "kind": "audio-dry-run-plan",
        "provider": provider.name,
        "episodeId": episode.get("id"),
        "tracks": tracks,
        "manifestGenerated": False,
        "assetsGenerated": False,
        "note": "Planning only: no audio files or manifest are produced.",
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Phase 0 audio stub. Only --dry-run plans are supported; no audio or manifest is generated."
    )
    parser.add_argument("--episode", type=Path, required=True, help="prepared episode JSON")
    parser.add_argument("--provider", choices=("stub", "indic_parler"), default="stub")
    parser.add_argument("--dry-run", action="store_true", help="emit a plan; required and never writes audio")
    parser.add_argument("--output", type=Path, help="write the dry-run plan JSON here (not a manifest)")
    return parser


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if not args.dry_run:
        parser.error("Phase 0 cannot generate audio; pass --dry-run to create a plan")
    try:
        episode = _load_episode(args.episode)
        if args.provider == "indic_parler":
            raise NotImplementedError("Indic Parler audio is not implemented: no dependency or model has been selected")
        plan = build_dry_run_plan(episode, StubProvider())
        rendered = json.dumps(plan, ensure_ascii=False, indent=2) + "\n"
        if args.output:
            try:
                args.output.write_text(rendered, encoding="utf-8")
            except OSError as exc:
                raise AudioCliError(f"cannot write plan {args.output}: {exc}") from exc
        else:
            sys.stdout.write(rendered)
        return 0
    except AudioCliError as exc:
        parser.error(str(exc))
    except NotImplementedError as exc:
        parser.error(str(exc))
    return 2  # pragma: no cover


if __name__ == "__main__":
    raise SystemExit(main())
