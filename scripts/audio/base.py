"""Provider contract for Phase 0 audio generation.

No provider in this package creates audio files.  A future implementation must
return actual, validated assets and document the mono/24 kbps Opus contract.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class AudioProvider(ABC):
    """Minimal provider interface kept independent of model dependencies."""

    name = "base"

    @abstractmethod
    def generate(self, spoken_text: str, *, language: str, content_sha256: str) -> Any:
        """Generate one asset; unimplemented providers must fail loudly."""
        raise NotImplementedError

    def dry_run(self, spoken_text: str, *, language: str, content_sha256: str) -> dict[str, str]:
        """Describe work without creating an asset."""
        return {
            "language": language,
            "spokenText": spoken_text,
            "contentSha256": content_sha256,
        }
