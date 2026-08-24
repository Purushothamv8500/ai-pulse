import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from datetime import date
from app.core.config import settings
from app.core.database import AsyncSessionLocal

logger = structlog.get_logger()

scheduler = AsyncIOScheduler(timezone="UTC")


async def run_ingestion():
    logger.info("ingestion_job_started")
    from app.ingestion.pipeline import pipeline
    async with AsyncSessionLocal() as db:
        try:
            stats = await pipeline.run_all_sources(db)
            await db.commit()
            logger.info("ingestion_job_completed", **stats)
        except Exception as e:
            await db.rollback()
            logger.error("ingestion_job_failed", error=str(e))


async def run_briefing_generation():
    logger.info("briefing_job_started")
    from app.services.briefing_service import briefing_service
    async with AsyncSessionLocal() as db:
        try:
            briefing = await briefing_service.generate_daily_briefing(db, date.today())
            await db.commit()
            if briefing:
                await _send_briefing_emails(db, briefing)
            logger.info("briefing_job_completed")
        except Exception as e:
            await db.rollback()
            logger.error("briefing_job_failed", error=str(e))


async def _send_briefing_emails(db, briefing):
    from app.models.user import User, UserPreferences
    from app.services.email_service import email_service
    from sqlalchemy import select

    result = await db.execute(
        select(User).where(User.is_active == True, User.onboarding_complete == True)
    )
    users = result.scalars().all()

    for user in users:
        prefs_result = await db.execute(
            select(UserPreferences).where(UserPreferences.user_id == user.id)
        )
        prefs = prefs_result.scalar_one_or_none()
        if prefs and not prefs.email_enabled:
            continue
        await email_service.send_daily_briefing(user.email, user.full_name, briefing)


def start_scheduler():
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
    logger.info("scheduler_started")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("scheduler_stopped")
