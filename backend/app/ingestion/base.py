from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class RawContent:
    title: str
    url: str
    content: str
    author: Optional[str]
    published_at: Optional[datetime]
    source_url: str
    source_name: str


class SourceAdapter(ABC):
    @abstractmethod
    async def fetch(self, source_url: str) -> list[RawContent]:
        pass

    @abstractmethod
    def normalize_url(self, url: str) -> str:
        pass
