from fastapi import APIRouter, Request, Query, Depends
from typing import Optional

from app.core.response import success_response
from app.core.dependencies import get_astro_service
from app.services.astro_service import AstroService

router = APIRouter()


@router.get("/events")
async def get_astronomy_events(
    request: Request,
    latitude: float = Query(..., ge=-90, le=90, description="Observer latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Observer longitude"),
    elevation: int = Query(default=0, ge=0, description="Observer elevation in meters"),
    from_date: Optional[str] = Query(default=None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(default=None, description="End date (YYYY-MM-DD)"),
    body: Optional[str] = Query(default=None, description="Celestial body filter"),
    service: AstroService = Depends(get_astro_service)
):
    """
    Get astronomical events for given coordinates.

    Proxies to AstronomyAPI with error handling.

    Args:
        latitude: Observer latitude (-90 to 90)
        longitude: Observer longitude (-180 to 180)
        elevation: Observer elevation in meters
        from_date: Start date filter
        to_date: End date filter
        body: Specific celestial body filter
    """
    trace_id = request.state.trace_id
    data = await service.get_events(
        latitude=latitude,
        longitude=longitude,
        elevation=elevation,
        from_date=from_date,
        to_date=to_date,
        body=body
    )
    return success_response(data, trace_id)
