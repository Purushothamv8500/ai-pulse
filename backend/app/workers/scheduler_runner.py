"""
Standalone APScheduler runner — used as the Render Background Worker service.

This module starts the scheduler in its own process, separate from the API.
The API service runs with ENABLE_SCHEDULER=false; this service handles all
periodic tasks (ingestion, briefing generation).
"""
import asyncio
import signal
import sys
import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

logger = structlog.get_logger()


async def main() -> None:
    from app.core.config import settings
    from app.core.database import init_db
    from app.workers.scheduler import run_ingestion, run_briefing_generation

    logger.info("standalone_scheduler_starting", env=settings.APP_ENV)

    await init_db()
    await _seed_default_sources()

    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(
        run_ingestion,
        IntervalTrigger(hours=settings.INGESTION_INTERVAL_HOURS),
        id="ingestion",
        replace_existing=True,
        misfire_grace_time=300,
    )
    scheduler.add_job(
        run_briefing_generation,
        CronTrigger(
            hour=settings.BRIEFING_GENERATION_HOUR,
            minute=settings.BRIEFING_GENERATION_MINUTE,
            timezone="UTC",
        ),
        id="briefing_generation",
        replace_existing=True,
        misfire_grace_time=300,
    )
    scheduler.start()
    logger.info("standalone_scheduler_started")

    stop_event = asyncio.Event()
    loop = asyncio.get_running_loop()

    def _handle_signal(sig):
        logger.info("signal_received", signal=sig)
        stop_event.set()

    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, _handle_signal, sig.name)

    await stop_event.wait()

    scheduler.shutdown(wait=False)
    logger.info("standalone_scheduler_stopped")


async def _seed_default_sources() -> None:
    from app.core.database import AsyncSessionLocal
    from app.models.source import Source
    from sqlalchemy import select

    default_sources = [
        {"name": "The Verge AI", "url": "https://www.theverge.com/ai-artificial-intelligence", "feed_url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "credibility": "high", "credibility_score": 0.8},
        {"name": "MIT Technology Review AI", "url": "https://www.technologyreview.com/topic/artificial-intelligence/", "feed_url": "https://www.technologyreview.com/feed/", "credibility": "very_high", "credibility_score": 0.95, "is_primary": True},
        {"name": "VentureBeat AI", "url": "https://venturebeat.com/category/ai/", "feed_url": "https://venturebeat.com/category/ai/feed/", "credibility": "high", "credibility_score": 0.8},
        {"name": "Hugging Face Blog", "url": "https://huggingface.co/blog", "feed_url": "https://huggingface.co/blog/feed.xml", "credibility": "very_high", "credibility_score": 0.95, "is_primary": True},
        {"name": "OpenAI Blog", "url": "https://openai.com/blog", "feed_url": "https://openai.com/blog/rss.xml", "credibility": "very_high", "credibility_score": 0.98, "is_primary": True},
        {"name": "Anthropic News", "url": "https://www.anthropic.com/news", "feed_url": "https://www.anthropic.com/rss.xml", "credibility": "very_high", "credibility_score": 0.98, "is_primary": True},
        {"name": "Papers With Code", "url": "https://paperswithcode.com", "feed_url": "https://paperswithcode.com/rss.xml", "credibility": "high", "credibility_score": 0.85, "is_primary": True},
    ]

    async with AsyncSessionLocal() as db:
        for src_data in default_sources:
            existing = await db.execute(select(Source).where(Source.url == src_data["url"]))
            if not existing.scalar_one_or_none():
                source = Source(**src_data)
                db.add(source)
        await db.commit()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(0)
