from fastapi import APIRouter, Request, Query, Depends
from typing import Optional

from app.core.response import success_response
from app.core.dependencies import get_jwst_service
from app.services.jwst_service import JWSTService

router = APIRouter()


@router.get("/feed")
async def get_jwst_feed(
    request: Request,
    page: int = Query(default=1, ge=1, description="Page number"),
    per_page: int = Query(default=20, ge=1, le=100, description="Images per page"),
    suffix: Optional[str] = Query(default=None, description="File suffix filter (jpg, png, etc.)"),
    service: JWSTService = Depends(get_jwst_service)
):
    """
    Get JWST images feed.

    Proxies to JWST API with error handling.

    Args:
        page: Page number (1-indexed)
        per_page: Number of images per page (1-100)
        suffix: Optional file suffix filter
    """
    trace_id = request.state.trace_id
    data = await service.get_feed(page=page, per_page=per_page, suffix=suffix)
    return success_response(data, trace_id)
