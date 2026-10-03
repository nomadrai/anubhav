from pathlib import Path
from typing import Any

from .base import AudioProvider, AudioProviderError, GeneratedAudio


class StubProvider(AudioProvider):
    name = "stub"

    def generate(
        self,
        spoken_text: str,
        *,
        language: str,
        content_sha256: str,
        output_wav: Path | None = None,
    ) -> GeneratedAudio:
        raise AudioProviderError(
            "stub provider never generates silent or fake audio; use --dry-run"
        )

    def check_requirements(self) -> dict[str, Any]:
        return {
            "provider": self.name,
            "ready": False,
            "reason": "stub provider is planning-only",
        }
