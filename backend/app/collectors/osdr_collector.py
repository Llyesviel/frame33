import logging
from datetime import datetime
from dateutil import parser as date_parser

from app.clients.nasa_client import OSDRClient
from app.repositories.osdr_repository import OSDRRepository
from app.core.database import async_session_factory

logger = logging.getLogger(__name__)


async def collect_osdr_datasets() -> None:
    """
    Collector task: Fetch OSDR datasets and upsert by dataset_id.

    Runs every 600 seconds per TASK.md requirements.
    Uses upsert pattern to avoid duplicate inserts.
    """
    logger.info("Starting OSDR datasets collection")

    client = OSDRClient()

    try:
        async with async_session_factory() as session:
            repository = OSDRRepository(session)

            # Fetch from API
            response = await client.get_datasets(limit=100)

            # OSDR API returns dict with dataset_id as key: {"OSD-1": {...}, "OSD-2": {...}}
            if isinstance(response, dict):
                datasets = [(k, v) for k, v in response.items() if k.startswith("OSD-")]
            else:
                datasets = []

            logger.info(f"Fetched {len(datasets)} OSDR datasets")

            # Upsert each dataset
            count = 0
            for dataset_id, ds in datasets:
                try:
                    # ds contains REST_URL, we need to fetch details or just store basic info
                    rest_url = ds.get("REST_URL", "") if isinstance(ds, dict) else ""

                    await repository.upsert_dataset(
                        dataset_id=dataset_id,
                        title=dataset_id,  # Use ID as title for now
                        status="published",
                        updated_at=None,
                        raw={"rest_url": rest_url}
                    )
                    count += 1
                except Exception as e:
                    logger.warning(f"Failed to upsert dataset {dataset_id}: {e}")

            logger.info(f"OSDR collection complete: {count} datasets upserted")

    except Exception as e:
        logger.exception(f"OSDR collection failed: {e}")
    finally:
        await client.close()
