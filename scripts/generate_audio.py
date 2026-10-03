#!/usr/bin/env python3
"""Legacy schema-1 episode fixture builder; not a release speech-quality gate.

Use build_narration.py for the full gated schema-2 narration/glossary bundle.

The stub provider remains planning-only. The optional Indic Parler provider
requires a caller-supplied local checkpoint and never downloads model files.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any, Callable, Iterable

try:  # Works both as `python scripts/generate_audio.py` and as a module.
    from .providers.base import AudioProvider, AudioProviderError
    from .providers.indic_parler import (
        DEFAULT_DESCRIPTION, DEFAULT_MODEL_ID,
        DEFAULT_TOKENIZER_ID, DEFAULT_TOKENIZER_REVISION,
        IndicParlerProvider,
    )
    from .providers.stub import StubProvider
except ImportError:  # pragma: no cover - direct script execution path
    from providers.base import AudioProvider, AudioProviderError
    from providers.indic_parler import (
        DEFAULT_DESCRIPTION, DEFAULT_MODEL_ID,
        DEFAULT_TOKENIZER_ID, DEFAULT_TOKENIZER_REVISION,
        IndicParlerProvider,
    )
    from providers.stub import StubProvider


class AudioCliError(ValueError):
    """A user-correctable audio CLI error."""


_TRACK_FIELDS = ("periodText", "whatHappenedText")
_LANGUAGES = ("en", "hi")
_SAFE_COMPONENT = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]*\Z")


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
    for field in _TRACK_FIELDS:
        values = reveal.get(field)
        if not isinstance(values, dict) or any(
            not isinstance(values.get(lang), str) or not values[lang].strip()
            for lang in _LANGUAGES
        ):
            raise AudioCliError(
                f"episode reveal.{field} must contain non-empty en and hi strings"
            )
    return data


def content_sha256(spoken_text: str) -> str:
    """Hash the exact UTF-8 spoken string used by the provider."""

    return hashlib.sha256(spoken_text.encode("utf-8")).hexdigest()


def _tracks(episode: dict[str, Any]) -> list[tuple[str, str, str, str]]:
    reveal = episode["reveal"]
    result = []
    for language in _LANGUAGES:
        for field in _TRACK_FIELDS:
            spoken = reveal[field][language].strip()
            result.append((language, field, spoken, content_sha256(spoken)))
    return result


def build_dry_run_plan(episode: dict[str, Any], provider: AudioProvider) -> dict[str, Any]:
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


def generation_input_sha256(
    spoken_text: str,
    *,
    language: str,
    provider: AudioProvider,
) -> str:
    """Hash all public inputs that can change a generated track.

    Private participant responses are never inputs to this build-time hash.
    """

    payload = {
        "contentSha256": content_sha256(spoken_text),
        "language": language,
        "provider": provider.name,
        "generationConfig": provider.generation_config(),
    }
    canonical = json.dumps(
        payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _safe_component(value: Any, *, label: str) -> str:
    if not isinstance(value, str) or not _SAFE_COMPONENT.fullmatch(value):
        raise AudioCliError(
            f"{label} must contain only letters, digits, '.', '_' or '-' and cannot be empty"
        )
    if value in {".", ".."}:
        raise AudioCliError(f"{label} cannot be a path traversal component")
    return value


def _safe_output_dir(path: Path) -> Path:
    candidate = Path(path).expanduser()
    if candidate.exists() and candidate.is_symlink():
        raise AudioCliError(f"refusing symlink output directory: {candidate}")
    try:
        candidate.mkdir(parents=True, exist_ok=True)
    except OSError as exc:
        raise AudioCliError(f"cannot create output directory {candidate}: {exc}") from exc
    resolved = candidate.resolve()
    if not resolved.is_dir():
        raise AudioCliError(f"audio output is not a directory: {resolved}")
    return resolved


def _inside(root: Path, child: Path, *, label: str) -> Path:
    resolved = child.resolve()
    try:
        resolved.relative_to(root)
    except ValueError as exc:
        raise AudioCliError(f"{label} must stay inside {root}") from exc
    return resolved


def _file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    try:
        with path.open("rb") as handle:
            for block in iter(lambda: handle.read(1024 * 1024), b""):
                digest.update(block)
    except OSError as exc:
        raise AudioCliError(f"cannot hash generated audio {path}: {exc}") from exc
    return digest.hexdigest()


def convert_wav_to_opus(
    wav_path: Path,
    opus_path: Path,
    *,
    ffmpeg: str = "ffmpeg",
    overwrite: bool = False,
    runner: Callable[..., Any] = subprocess.run,
    executable_finder: Callable[[str], str | None] = shutil.which,
) -> Path:
    """Convert one provider WAV to the approved mono 24 kbps Opus contract."""

    wav_path = Path(wav_path).resolve()
    opus_path = Path(opus_path).resolve()
    if not wav_path.is_file() or wav_path.stat().st_size == 0:
        raise AudioCliError(f"provider WAV is missing or empty: {wav_path}")
    if opus_path.suffix.lower() != ".opus":
        raise AudioCliError("audio output must use the .opus extension")
    if opus_path.exists() and not overwrite:
        raise AudioCliError(
            f"refusing to overwrite existing audio asset {opus_path}; pass --overwrite"
        )
    opus_path.parent.mkdir(parents=True, exist_ok=True)
    executable = executable_finder(ffmpeg)
    if executable is None:
        raise AudioCliError(
            f"ffmpeg executable {ffmpeg!r} was not found; WAV-to-Opus conversion is required"
        )
    command = [
        executable,
        "-nostdin",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        str(wav_path),
        "-ac",
        "1",
        "-c:a",
        "libopus",
        "-b:a",
        "24k",
        str(opus_path),
    ]
    try:
        runner(command, check=True, capture_output=True, text=True)
    except FileNotFoundError as exc:
        raise AudioCliError(f"cannot execute ffmpeg {executable!r}: {exc}") from exc
    except subprocess.CalledProcessError as exc:
        detail = (exc.stderr or exc.stdout or "").strip()
        suffix = f": {detail[-500:]}" if detail else ""
        raise AudioCliError("ffmpeg failed to convert WAV to Opus" + suffix) from exc
    if not opus_path.is_file() or opus_path.stat().st_size == 0:
        raise AudioCliError("ffmpeg completed without producing a non-empty Opus file")
    return opus_path


def _provider_model_dir(provider: AudioProvider) -> Path | None:
    config = getattr(provider, "config", None)
    model_dir = getattr(config, "model_dir", None)
    return Path(model_dir).resolve() if model_dir is not None else None


def _atomic_write_json(path: Path, value: dict[str, Any]) -> None:
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", dir=path.parent, prefix=".manifest-", suffix=".tmp", delete=False
        ) as handle:
            temporary = Path(handle.name)
            json.dump(value, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        temporary.replace(path)
    except OSError as exc:
        raise AudioCliError(f"cannot write audio manifest {path}: {exc}") from exc
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink(missing_ok=True)


def build_audio_manifest(
    episode: dict[str, Any],
    provider: AudioProvider,
    entries: list[dict[str, Any]],
) -> dict[str, Any]:
    """Create the stable manifest envelope after every asset has succeeded."""

    return {
        "schemaVersion": 1,
        "kind": "audio-manifest",
        "episodeId": episode.get("id"),
        "provider": provider.name,
        "provenance": provider.provenance(),
        "entries": entries,
        "manifestGenerated": True,
        "assetsGenerated": True,
    }


def generate_audio_assets(
    episode: dict[str, Any],
    provider: AudioProvider,
    output_dir: Path,
    *,
    ffmpeg: str = "ffmpeg",
    overwrite: bool = False,
    runner: Callable[..., Any] = subprocess.run,
    executable_finder: Callable[[str], str | None] = shutil.which,
) -> dict[str, Any]:
    """Generate WAVs in a temp directory, then atomically publish Opus assets."""

    episode_id = _safe_component(episode.get("id"), label="episode id")
    output_root = _safe_output_dir(output_dir)
    model_dir = _provider_model_dir(provider)
    if model_dir is not None and (
        output_root == model_dir
        or output_root.is_relative_to(model_dir)
        or model_dir.is_relative_to(output_root)
    ):
        raise AudioCliError(
            "audio output and model directory must be separate paths; refusing to mix weights and assets"
        )
    try:
        provider.check_requirements()
    except AudioProviderError:
        raise
    except Exception as exc:
        raise AudioCliError(f"audio provider requirements failed: {exc}") from exc
    if executable_finder(ffmpeg) is None:
        raise AudioCliError(
            f"ffmpeg executable {ffmpeg!r} was not found; WAV-to-Opus conversion is required"
        )

    manifest_path = _inside(output_root, output_root / "manifest.json", label="manifest")
    if manifest_path.exists() and not overwrite:
        raise AudioCliError(
            f"refusing to overwrite existing audio manifest {manifest_path}; pass --overwrite"
        )

    entries: list[dict[str, Any]] = []
    pending_assets: list[tuple[Path, Path]] = []
    with tempfile.TemporaryDirectory(prefix="anubhav-audio-") as temporary_dir:
        temporary_root = Path(temporary_dir)
        for language, field, spoken, text_digest in _tracks(episode):
            input_digest = generation_input_sha256(
                spoken, language=language, provider=provider
            )
            filename = f"{episode_id}.{language}.{field}.{input_digest[:16]}.opus"
            opus_path = _inside(output_root, output_root / filename, label="audio asset")
            if opus_path.exists() and not overwrite:
                raise AudioCliError(
                    f"refusing to overwrite existing audio asset {opus_path}; pass --overwrite"
                )
            temporary_opus_path = temporary_root / filename
            wav_path = temporary_root / f"{language}.{field}.wav"
            try:
                generated = provider.generate(
                    spoken,
                    language=language,
                    content_sha256=text_digest,
                    output_wav=wav_path,
                )
            except AudioProviderError:
                raise
            except Exception as exc:
                raise AudioCliError(f"audio provider failed for {language}.{field}: {exc}") from exc
            if not generated.wav_path.is_file():
                raise AudioCliError(
                    f"provider returned a missing WAV for {language}.{field}: {generated.wav_path}"
                )
            convert_wav_to_opus(
                generated.wav_path,
                temporary_opus_path,
                ffmpeg=ffmpeg,
                overwrite=True,
                runner=runner,
                executable_finder=executable_finder,
            )
            pending_assets.append((temporary_opus_path, opus_path))
            entries.append(
                {
                    "id": f"{episode_id}.{language}.{field}",
                    "episodeId": episode_id,
                    "language": language,
                    "field": field,
                    "spokenText": spoken,
                    "contentSha256": text_digest,
                    "inputSha256": input_digest,
                    "path": opus_path.name,
                    "format": {
                        "container": "ogg",
                        "codec": "opus",
                        "channels": 1,
                        "bitrate": "24k",
                    },
                    "sampleRate": generated.sample_rate,
                    "assetSha256": _file_sha256(temporary_opus_path),
                }
            )
        for temporary_opus_path, opus_path in pending_assets:
            try:
                temporary_opus_path.replace(opus_path)
            except OSError as exc:
                raise AudioCliError(
                    f"cannot publish generated audio asset {opus_path}: {exc}"
                ) from exc

    manifest = build_audio_manifest(episode, provider, entries)
    _atomic_write_json(manifest_path, manifest)
    return manifest


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Offline audio plan or optional local Indic Parler generation. "
            "No model is downloaded."
        )
    )
    parser.add_argument("--episode", type=Path, required=True, help="prepared episode JSON")
    parser.add_argument("--provider", choices=("stub", "indic_parler"), default="stub")
    parser.add_argument("--dry-run", action="store_true", help="emit a plan; never writes audio")
    parser.add_argument("--check", action="store_true", help="check local provider prerequisites only")
    parser.add_argument("--output", type=Path, help="write a dry-run or check JSON here")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("public/audio"),
        help="ignored generated asset directory (default: public/audio)",
    )
    parser.add_argument("--overwrite", action="store_true", help="replace existing ignored assets/manifest")
    parser.add_argument("--model-dir", type=Path, help="local, already-accessible model checkpoint directory")
    parser.add_argument("--model-id", default=DEFAULT_MODEL_ID, help="model provenance id")
    parser.add_argument("--model-revision", help="required model revision or immutable commit used locally")
    parser.add_argument("--description", default=DEFAULT_DESCRIPTION, help="local voice description prompt")
    parser.add_argument("--description-tokenizer-dir", type=Path, help="optional local description tokenizer (otherwise use pinned HF cache)")
    parser.add_argument("--description-tokenizer-id", default=DEFAULT_TOKENIZER_ID)
    parser.add_argument("--description-tokenizer-revision", default=DEFAULT_TOKENIZER_REVISION)
    parser.add_argument("--do-sample", action=argparse.BooleanOptionalAction, default=True, help="checkpoint sampling default; --no-do-sample only reproduces the failed greedy experiment")
    parser.add_argument("--max-new-tokens", type=int, default=2048)
    parser.add_argument("--device", default="cpu", help="cpu, cuda[:N], or auto (default: cpu)")
    parser.add_argument("--seed", type=int, default=0, help="deterministic generation seed")
    parser.add_argument("--ffmpeg", default="ffmpeg", help="ffmpeg executable for Opus conversion")
    return parser


def _write_or_print(value: dict[str, Any], path: Path | None) -> None:
    rendered = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    if path:
        try:
            path.write_text(rendered, encoding="utf-8")
        except OSError as exc:
            raise AudioCliError(f"cannot write JSON output {path}: {exc}") from exc
    else:
        sys.stdout.write(rendered)


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.dry_run and args.check:
        parser.error("--dry-run and --check are mutually exclusive")
    if args.provider == "stub" and not args.dry_run:
        parser.error("stub provider is planning-only; pass --dry-run to create a plan")
    try:
        episode = _load_episode(args.episode)
        if args.provider == "stub":
            _write_or_print(build_dry_run_plan(episode, StubProvider()), args.output)
            return 0

        provider = IndicParlerProvider(
            model_id=args.model_id,
            model_revision=args.model_revision,
            model_dir=args.model_dir,
            description=args.description,
            device=args.device,
            seed=args.seed,
            description_tokenizer_dir=args.description_tokenizer_dir,
            description_tokenizer_id=args.description_tokenizer_id,
            description_tokenizer_revision=args.description_tokenizer_revision,
            do_sample=args.do_sample,
            max_new_tokens=args.max_new_tokens,
        )
        if args.dry_run:
            _write_or_print(build_dry_run_plan(episode, provider), args.output)
        elif args.check:
            result = provider.check_requirements()
            result["kind"] = "audio-provider-check"
            _write_or_print(result, args.output)
        else:
            if args.output is not None:
                raise AudioCliError("--output is only for --dry-run or --check JSON")
            _write_or_print(
                generate_audio_assets(
                    episode,
                    provider,
                    args.output_dir,
                    ffmpeg=args.ffmpeg,
                    overwrite=args.overwrite,
                ),
                None,
            )
        return 0
    except (AudioCliError, AudioProviderError) as exc:
        parser.error(str(exc))
    return 2  # pragma: no cover


if __name__ == "__main__":
    raise SystemExit(main())
