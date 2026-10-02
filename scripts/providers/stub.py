from typing import Any
from .base import AudioProvider
class StubProvider(AudioProvider):
    name = 'stub'
    def generate(self, spoken_text: str, *, language: str, content_sha256: str) -> Any:
        raise NotImplementedError('stub provider never generates silent or fake audio; use --dry-run')
