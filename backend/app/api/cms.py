from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.response import success_response, error_response
from app.core.exceptions import SpaceDashboardError
from app.repositories.cms_repository import CMSRepository
from app.services.cms_service import CMSService

router = APIRouter()


def get_cms_service(session: AsyncSession = Depends(get_session)) -> CMSService:
    """Dependency to get CMS service instance."""
    repository = CMSRepository(session)
    return CMSService(repository)


@router.get("/{slug}")
async def get_cms_page(
    slug: str,
    request: Request,
    service: CMSService = Depends(get_cms_service)
):
    """
    Get CMS page by slug.

    Returns page content if found and active, otherwise NOT_FOUND error.
    Per TASK.md: HTTP status is always 200.
    """
    trace_id = request.state.trace_id

    try:
        data = await service.get_page_by_slug(slug)
        return success_response(data, trace_id)
    except SpaceDashboardError as e:
        return error_response(e.code, e.message, trace_id)


@router.get("/")
async def get_all_cms_pages(
    request: Request,
    service: CMSService = Depends(get_cms_service)
):
    """
    Get all active CMS pages.

    Returns list of all active CMS pages.
    """
    trace_id = request.state.trace_id

    try:
        data = await service.get_all_pages()
        return success_response(data, trace_id)
    except SpaceDashboardError as e:
        return error_response(e.code, e.message, trace_id)
