from typing import Any
from .base import AudioProvider
class IndicParlerProvider(AudioProvider):
    name = 'indic_parler'
    def generate(self, spoken_text: str, *, language: str, content_sha256: str) -> Any:
        raise NotImplementedError('Indic Parler provider is not implemented; no model or dependency selected')
