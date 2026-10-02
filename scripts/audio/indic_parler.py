"""Reserved Indic Parler provider contract.

No dependency or model is selected in Phase 0.  It intentionally fails rather
than pretending that audio was generated.
"""

from __future__ import annotations

from typing import Any

from .base import AudioProvider


class IndicParlerProvider(AudioProvider):
    name = "indic_parler"

    def generate(self, spoken_text: str, *, language: str, content_sha256: str) -> Any:
        raise NotImplementedError(
            "Indic Parler audio is not implemented: no dependency or model has been selected"
        )

    def dry_run(self, spoken_text: str, *, language: str, content_sha256: str) -> dict[str, str]:
        raise NotImplementedError(
            "Indic Parler planning is not implemented until a dependency and model are selected"
        )
