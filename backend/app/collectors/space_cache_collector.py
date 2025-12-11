import logging
from typing import Awaitable, Callable, Dict, Any

from app.clients.nasa_client import NASAClient
from app.clients.spacex_client import SpaceXClient
from app.repositories.space_cache_repository import SpaceCacheRepository
from app.core.database import async_session_factory

logger = logging.getLogger(__name__)


async def _cache_data(source: str, payload: dict) -> None:
    """Helper to store data in cache and cleanup old entries."""
    async with async_session_factory() as session:
        repository = SpaceCacheRepository(session)
        await repository.cache_data(source, payload)
        await repository.cleanup_old_cache(source, keep_latest=5)


async def _collect_with_nasa(
    source: str,
    fetcher: Callable[[NASAClient], Awaitable[Any]],
    payload_builder: Callable[[Any], Dict[str, Any]],
    log_builder: Callable[[Any], str]
) -> None:
    """Execute a NASA collection job with shared boilerplate."""
    client = NASAClient()
    try:
        data = await fetcher(client)
        payload = payload_builder(data)
        await _cache_data(source, payload)
        logger.info(log_builder(data))
    except Exception as e:
        logger.exception(f"{source.upper()} collection failed: {e}")
    finally:
        await client.close()


async def collect_apod() -> None:
    """
    Collect NASA APOD (Astronomy Picture of the Day).

    Runs every 24 hours per TASK.md requirements.
    """
    logger.info("Collecting APOD")

    await _collect_with_nasa(
        "apod",
        lambda client: client.get_apod(),
        lambda data: data,
        lambda data: f"APOD cached: {data.get('title', 'Unknown')}"
    )


async def collect_neo() -> None:
    """
    Collect NASA NEO (Near Earth Objects).

    Runs every 2 hours per TASK.md requirements.
    """
    logger.info("Collecting NEO")

    await _collect_with_nasa(
        "neo",
        lambda client: client.get_neo_feed(),
        lambda data: data,
        lambda data: f"NEO cached: {data.get('element_count', 0)} objects"
    )


async def collect_donki_flr() -> None:
    """
    Collect DONKI Solar Flares.

    Runs every 1 hour per TASK.md requirements.
    """
    logger.info("Collecting DONKI FLR")

    await _collect_with_nasa(
        "flr",
        lambda client: client.get_donki_flr(),
        lambda data: {"flares": data},
        lambda data: f"DONKI FLR cached: {len(data) if isinstance(data, list) else 0} flares"
    )


async def collect_donki_cme() -> None:
    """
    Collect DONKI Coronal Mass Ejections.

    Runs every 1 hour per TASK.md requirements.
    """
    logger.info("Collecting DONKI CME")

    await _collect_with_nasa(
        "cme",
        lambda client: client.get_donki_cme(),
        lambda data: {"events": data},
        lambda data: f"DONKI CME cached: {len(data) if isinstance(data, list) else 0} events"
    )


async def collect_spacex() -> None:
    """
    Collect SpaceX next launch.

    Runs every 1 hour per TASK.md requirements.
    """
    logger.info("Collecting SpaceX launch")

    client = SpaceXClient()
    try:
        data = await client.get_next_launch()
        await _cache_data("spacex", data)
        logger.info(f"SpaceX cached: {data.get('name', 'Unknown launch')}")
    except Exception as e:
        logger.exception(f"SpaceX collection failed: {e}")
    finally:
        await client.close()


async def refresh_all_caches() -> dict:
    """
    Trigger refresh of all caches.

    Returns status of each collector.
    """
    results = {}

    collectors = [
        ("apod", collect_apod),
        ("neo", collect_neo),
        ("flr", collect_donki_flr),
        ("cme", collect_donki_cme),
        ("spacex", collect_spacex),
    ]

    for name, collector in collectors:
        try:
            await collector()
            results[name] = "success"
        except Exception as e:
            logger.exception(f"Refresh {name} failed: {e}")
            results[name] = f"error: {str(e)}"

    return results
