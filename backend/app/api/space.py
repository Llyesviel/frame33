import asyncio
from fastapi import APIRouter, Depends, Request, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.response import success_response
from app.repositories.space_cache_repository import SpaceCacheRepository
from app.services.space_cache_service import SpaceCacheService, VALID_SOURCES
from app.collectors.space_cache_collector import refresh_all_caches

router = APIRouter()


def get_space_service(session: AsyncSession = Depends(get_session)) -> SpaceCacheService:
    """Dependency to get Space Cache service instance."""
    repository = SpaceCacheRepository(session)
    return SpaceCacheService(repository)


@router.get("/{source}/latest")
async def get_latest_by_source(
    request: Request,
    source: str = Path(
        ...,
        description=f"Data source. Valid: {sorted(VALID_SOURCES)}"
    ),
    service: SpaceCacheService = Depends(get_space_service)
):
    """
    Get latest cached data by source.

    Valid sources: apod, neo, flr, cme, spacex

    Returns cached data if fresh (within TTL), otherwise NO_DATA error.
    """
    trace_id = request.state.trace_id

    data = await service.get_latest(source)
    return success_response(data, trace_id)


@router.post("/refresh")
async def refresh_cache(request: Request):
    """
    Trigger manual refresh of all space data caches.

    Starts background refresh for: apod, neo, flr, cme, spacex.
    Does not wait for completion.
    """
    trace_id = request.state.trace_id

    # Run refresh in background
    asyncio.create_task(refresh_all_caches())

    return success_response(
        {
            "status": "refresh_triggered",
            "sources": sorted(VALID_SOURCES)
        },
        trace_id
    )
