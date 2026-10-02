"""Provider contract for Phase 0; implementations must not fake audio."""
from abc import ABC, abstractmethod
from typing import Any
class AudioProvider(ABC):
    name = 'base'
    @abstractmethod
    def generate(self, spoken_text: str, *, language: str, content_sha256: str) -> Any:
        raise NotImplementedError
    def dry_run(self, spoken_text: str, *, language: str, content_sha256: str) -> dict[str, str]:
        return {'language': language, 'spokenText': spoken_text, 'contentSha256': content_sha256}
