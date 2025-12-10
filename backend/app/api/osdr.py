from fastapi import APIRouter, Depends, Request, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.response import success_response
from app.repositories.osdr_repository import OSDRRepository
from app.services.osdr_service import OSDRService

router = APIRouter()


def get_osdr_service(session: AsyncSession = Depends(get_session)) -> OSDRService:
    """Dependency to get OSDR service instance."""
    repository = OSDRRepository(session)
    return OSDRService(repository)


@router.get("/list")
async def list_datasets(
    request: Request,
    limit: int = Query(default=50, ge=1, le=200, description="Max datasets"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination"),
    service: OSDRService = Depends(get_osdr_service)
):
    """
    List NASA OSDR datasets with pagination.

    Args:
        limit: Maximum number of datasets to return (1-200)
        offset: Number of datasets to skip
    """
    trace_id = request.state.trace_id

    data = await service.list_datasets(limit=limit, offset=offset)
    return success_response(data, trace_id)


@router.get("/{dataset_id}")
async def get_dataset(
    request: Request,
    dataset_id: str = Path(..., min_length=1, description="Dataset ID"),
    service: OSDRService = Depends(get_osdr_service)
):
    """
    Get specific OSDR dataset by ID.

    Returns NOT_FOUND error if dataset doesn't exist.
    """
    trace_id = request.state.trace_id

    data = await service.get_dataset(dataset_id)
    return success_response(data, trace_id)


@router.get("/export/csv")
async def export_csv(
    service: OSDRService = Depends(get_osdr_service)
):
    """
    Export all OSDR datasets as CSV.
    """
    from fastapi.responses import StreamingResponse
    import io
    import csv

    # Fetch all datasets (high limit)
    data = await service.list_datasets(limit=1000, offset=0)
    datasets = data["datasets"]

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["id", "name", "description", "mission", "platform", "date_start", "date_end", "link"])
    
    # Rows
    for ds in datasets:
        writer.writerow([
            ds["id"],
            ds["name"],
            ds.get("description", "")[:100] + "..." if ds.get("description") else "", # Truncate description
            ds.get("mission", ""),
            ds.get("platform", ""),
            ds.get("date_start", ""),
            ds.get("date_end", ""),
            ds.get("link", "")
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=osdr_datasets.csv"}
    )
