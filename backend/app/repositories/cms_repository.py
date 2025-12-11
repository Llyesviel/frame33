from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List

from app.models.cms import CMSPage
from app.repositories.base import BaseRepository


class CMSRepository(BaseRepository[CMSPage]):
    """Repository for CMS page operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(session, CMSPage)

    async def get_by_slug(self, slug: str) -> Optional[CMSPage]:
        """Get CMS page by slug."""
        result = await self.session.execute(
            select(CMSPage)
            .where(CMSPage.slug == slug)
            .where(CMSPage.is_active == True)
        )
        return result.scalar_one_or_none()

    async def get_all_active(self) -> List[CMSPage]:
        """Get all active CMS pages."""
        result = await self.session.execute(
            select(CMSPage)
            .where(CMSPage.is_active == True)
            .order_by(CMSPage.created_at.desc())
        )
        return list(result.scalars().all())
