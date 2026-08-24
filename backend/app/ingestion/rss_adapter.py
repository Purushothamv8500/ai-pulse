import feedparser
import httpx
from datetime import datetime
from bs4 import BeautifulSoup
import structlog
from app.ingestion.base import SourceAdapter, RawContent
from urllib.parse import urlparse, urlunparse

logger = structlog.get_logger()


class RSSAdapter(SourceAdapter):
    async def fetch(self, source_url: str) -> list[RawContent]:
        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                response = await client.get(source_url)
                response.raise_for_status()
                content = response.text

            feed = feedparser.parse(content)
            results = []

            for entry in feed.entries[:50]:
                title = entry.get("title", "").strip()
                url = entry.get("link", "").strip()

                if not title or not url:
                    continue

                raw_content = self._extract_content(entry)
                published_at = self._parse_date(entry)

                results.append(RawContent(
                    title=title,
                    url=url,
                    content=raw_content,
                    author=entry.get("author"),
                    published_at=published_at,
                    source_url=source_url,
                    source_name=feed.feed.get("title", source_url),
                ))

            logger.info("rss_fetched", source=source_url, count=len(results))
            return results

        except Exception as e:
            logger.error("rss_fetch_failed", source=source_url, error=str(e))
            return []

    def _extract_content(self, entry) -> str:
        content = ""
        if hasattr(entry, "content") and entry.content:
            content = entry.content[0].get("value", "")
        elif hasattr(entry, "summary"):
            content = entry.summary or ""
        elif hasattr(entry, "description"):
            content = entry.description or ""

        if content:
            soup = BeautifulSoup(content, "html.parser")
            content = soup.get_text(separator=" ", strip=True)

        return content[:5000]

    def _parse_date(self, entry) -> datetime | None:
        for field in ("published", "updated", "created"):
            if hasattr(entry, f"{field}_parsed") and getattr(entry, f"{field}_parsed"):
                try:
                    t = getattr(entry, f"{field}_parsed")
                    return datetime(*t[:6])
                except Exception:
                    pass
        return None

    def normalize_url(self, url: str) -> str:
        try:
            parsed = urlparse(url)
            normalized = urlunparse((
                parsed.scheme.lower(),
                parsed.netloc.lower().rstrip("/"),
                parsed.path.rstrip("/"),
                "",
                "",
                "",
            ))
            return normalized
        except Exception:
            return url
