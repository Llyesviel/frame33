import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Global scheduler instance
scheduler = AsyncIOScheduler()


def setup_scheduler() -> None:
    """Configure all collector jobs with their intervals."""
    from app.collectors.iss_collector import collect_iss_position
    from app.collectors.osdr_collector import collect_osdr_datasets
    from app.collectors.space_cache_collector import (
        collect_apod,
        collect_neo,
        collect_donki_flr,
        collect_donki_cme,
        collect_spacex
    )

    # ISS: every 120 seconds (per TASK.md)
    scheduler.add_job(
        collect_iss_position,
        IntervalTrigger(seconds=settings.iss_poll_interval_seconds),
        id="iss_collector",
        name="ISS Position Collector",
        replace_existing=True
    )
    logger.info(f"ISS collector scheduled: every {settings.iss_poll_interval_seconds}s")

    # OSDR: every 600 seconds (per TASK.md)
    scheduler.add_job(
        collect_osdr_datasets,
        IntervalTrigger(seconds=settings.osdr_poll_interval_seconds),
        id="osdr_collector",
        name="OSDR Datasets Collector",
        replace_existing=True
    )
    logger.info(f"OSDR collector scheduled: every {settings.osdr_poll_interval_seconds}s")

    # APOD: every 24 hours
    scheduler.add_job(
        collect_apod,
        IntervalTrigger(hours=24),
        id="apod_collector",
        name="NASA APOD Collector",
        replace_existing=True
    )
    logger.info("APOD collector scheduled: every 24h")

    # NEO: every 2 hours
    scheduler.add_job(
        collect_neo,
        IntervalTrigger(hours=2),
        id="neo_collector",
        name="NASA NEO Collector",
        replace_existing=True
    )
    logger.info("NEO collector scheduled: every 2h")

    # DONKI FLR: every 1 hour
    scheduler.add_job(
        collect_donki_flr,
        IntervalTrigger(hours=1),
        id="donki_flr_collector",
        name="NASA DONKI FLR Collector",
        replace_existing=True
    )
    logger.info("DONKI FLR collector scheduled: every 1h")

    # DONKI CME: every 1 hour
    scheduler.add_job(
        collect_donki_cme,
        IntervalTrigger(hours=1),
        id="donki_cme_collector",
        name="NASA DONKI CME Collector",
        replace_existing=True
    )
    logger.info("DONKI CME collector scheduled: every 1h")

    # SpaceX: every 1 hour
    scheduler.add_job(
        collect_spacex,
        IntervalTrigger(hours=1),
        id="spacex_collector",
        name="SpaceX Launch Collector",
        replace_existing=True
    )
    logger.info("SpaceX collector scheduled: every 1h")

    logger.info("All collector jobs configured")


async def run_initial_collection() -> None:
    """Run initial data collection for all sources."""
    from app.collectors.iss_collector import collect_iss_position
    from app.collectors.osdr_collector import collect_osdr_datasets
    from app.collectors.space_cache_collector import (
        collect_apod,
        collect_neo,
        collect_donki_flr,
        collect_donki_cme,
        collect_spacex
    )

    logger.info("Running initial data collection...")

    # Run ISS first (needed immediately)
    await collect_iss_position()

    # Run other collectors
    await collect_osdr_datasets()
    await collect_apod()
    await collect_neo()
    await collect_donki_flr()
    await collect_donki_cme()
    await collect_spacex()

    logger.info("Initial data collection complete")


def start_scheduler() -> None:
    """Set up and start the scheduler."""
    setup_scheduler()
    scheduler.start()
    logger.info("Scheduler started")


def shutdown_scheduler() -> None:
    """Shutdown the scheduler gracefully."""
    scheduler.shutdown(wait=False)
    logger.info("Scheduler shut down")
