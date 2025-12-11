import logging

from app.clients.iss_client import ISSClient
from app.repositories.iss_repository import ISSRepository
from app.core.database import async_session_factory
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def collect_iss_position() -> None:
    """
    Collector task: Fetch ISS position and store in database.

    Runs every 120 seconds per TASK.md requirements.
    On failure, logs error and continues (collector never crashes).
    """
    logger.info("Starting ISS position collection")

    client = ISSClient()

    try:
        async with async_session_factory() as session:
            repository = ISSRepository(session)

            # Fetch from API
            position = await client.get_position()

            # Store in database (append)
            record = await repository.insert_position(
                lat=position["latitude"],
                lon=position["longitude"],
                alt_km=position["altitude"],
                velocity_kmh=position["velocity"],
                source_url=position["source_url"],
                raw=position["raw"]
            )

            logger.info(
                f"ISS position stored: lat={record.lat:.4f}, lon={record.lon:.4f}, "
                f"alt={record.alt_km:.2f}km, vel={record.velocity_kmh:.2f}km/h"
            )

            # Cleanup old records (retention: 7-14 days)
            deleted = await repository.cleanup_old_records(settings.iss_retention_days)
            if deleted > 0:
                logger.info(f"Cleaned up {deleted} old ISS records")

    except Exception as e:
        # Per requirements: collector doesn't crash, just logs error
        logger.exception(f"ISS collection failed: {e}")
    finally:
        await client.close()
