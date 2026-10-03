"""Small, explicit contract shared by offline audio providers."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Mapping


class AudioProviderError(RuntimeError):
    """A fail-closed provider error that can be shown by the CLI."""


@dataclass(frozen=True)
class GeneratedAudio:
    """A provider's temporary WAV and the provenance needed for a manifest."""

    wav_path: Path
    sample_rate: int
    provenance: Mapping[str, Any] = field(default_factory=dict)


class AudioProvider(ABC):
    """Offline provider contract; providers never download or call a service."""

    name = "base"

    @abstractmethod
    def generate(
        self,
        spoken_text: str,
        *,
        language: str,
        content_sha256: str,
        output_wav: Path | None = None,
    ) -> GeneratedAudio:
        raise NotImplementedError

    def dry_run(
        self,
        spoken_text: str,
        *,
        language: str,
        content_sha256: str,
    ) -> dict[str, Any]:
        return {
            "language": language,
            "spokenText": spoken_text,
            "contentSha256": content_sha256,
        }

    def generation_config(self) -> dict[str, Any]:
        """Stable configuration included in each deterministic input hash."""

        return {}

    def provenance(self) -> dict[str, Any]:
        """Provider/model evidence to write to a generated manifest."""

        return {"provider": self.name}

    def check_requirements(self) -> dict[str, Any]:
        """Validate optional prerequisites before a generation run."""

        return {"provider": self.name, "ready": True}
