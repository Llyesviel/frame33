from typing import Dict, Any, List

from app.repositories.cms_repository import CMSRepository
from app.core.exceptions import NotFoundError
from app.models.cms import CMSPage


class CMSService:
    """Service for CMS page business logic."""

    def __init__(self, repository: CMSRepository):
        self.repository = repository

    async def get_page_by_slug(self, slug: str) -> Dict[str, Any]:
        """
        Get CMS page by slug.

        Raises NotFoundError if page not found or inactive.
        """
        page = await self.repository.get_by_slug(slug)

        if page is None:
            raise NotFoundError(f"CMS page with slug '{slug}' not found")

        return self._format_page(page)

    async def get_all_pages(self) -> Dict[str, Any]:
        """Get all active CMS pages."""
        pages = await self.repository.get_all_active()

        return {
            "pages": [self._format_page(p) for p in pages],
            "count": len(pages)
        }

    def _format_page(self, page: CMSPage) -> Dict[str, Any]:
        """Format CMS page for API response."""
        return {
            "slug": page.slug,
            "title": page.title,
            "html_body": page.html_body,
            "created_at": page.created_at.isoformat(),
            "updated_at": page.updated_at.isoformat(),
        }
