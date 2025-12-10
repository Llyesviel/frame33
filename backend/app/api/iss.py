from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.response import success_response
from app.repositories.iss_repository import ISSRepository
from app.services.iss_service import ISSService

router = APIRouter()


def get_iss_service(session: AsyncSession = Depends(get_session)) -> ISSService:
    """Dependency to get ISS service instance."""
    repository = ISSRepository(session)
    return ISSService(repository)


@router.get("/last")
async def get_latest_position(
    request: Request,
    service: ISSService = Depends(get_iss_service)
):
    """
    Get the latest ISS position.

    Returns position data if fresh (< 10 minutes old), otherwise NO_DATA error.
    Per TASK.md: HTTP status is always 200.
    """
    trace_id = request.state.trace_id

    data = await service.get_latest_position()
    return success_response(data, trace_id)


@router.get("/trend")
async def get_trend(
    request: Request,
    hours: int = Query(default=24, ge=1, le=168, description="Hours to look back"),
    limit: int = Query(default=100, ge=1, le=1000, description="Max positions"),
    service: ISSService = Depends(get_iss_service)
):
    """
    Get ISS movement history.

    Args:
        hours: Number of hours to look back (1-168)
        limit: Maximum number of positions to return (1-1000)
    """
    trace_id = request.state.trace_id

    data = await service.get_trend(hours=hours, limit=limit)
    return success_response(data, trace_id)


@router.get("/export/csv")
async def export_csv(
    hours: int = Query(default=24, ge=1, le=168, description="Hours to look back"),
    service: ISSService = Depends(get_iss_service)
):
    """
    Export ISS position history as CSV.
    """
    from fastapi.responses import StreamingResponse
    import io
    import csv

    # Fetch data (no limit, or high limit)
    data = await service.get_trend(hours=hours, limit=10000)
    positions = data["positions"]

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["timestamp", "latitude", "longitude", "altitude_km", "velocity_kmh", "visibility", "country_code"])
    
    # Rows
    for pos in positions:
        writer.writerow([
            pos["timestamp"],
            pos["latitude"],
            pos["longitude"],
            pos["altitude_km"],
            pos["velocity_kmh"],
            pos.get("visibility", ""),
            pos.get("country_code", "")
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=iss_history_{hours}h.csv"}
    )
