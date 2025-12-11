from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.models.space_cache import SpaceCache
from app.repositories.base import BaseRepository


class SpaceCacheRepository(BaseRepository[SpaceCache]):
    """
    Repository for space data cache operations.

    Supports caching with TTL (Time To Live) for various sources:
    - apod: 24 hours
    - neo, flr, cme, spacex: 6 hours
    """

    def __init__(self, session: AsyncSession):
        super().__init__(session, SpaceCache)

    async def get_latest_by_source(self, source: str) -> Optional[SpaceCache]:
        """Get the most recent cached data for a source."""
        result = await self.session.execute(
            select(SpaceCache)
            .where(SpaceCache.source == source)
            .order_by(SpaceCache.fetched_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_fresh_by_source(
        self,
        source: str,
        ttl_hours: int
    ) -> Optional[SpaceCache]:
        """
        Get cached data only if fresher than TTL.
        Returns None if cache is stale or doesn't exist.
        """
        cutoff = datetime.now(timezone.utc) - timedelta(hours=ttl_hours)
        result = await self.session.execute(
            select(SpaceCache)
            .where(SpaceCache.source == source)
            .where(SpaceCache.fetched_at >= cutoff)
            .order_by(SpaceCache.fetched_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def cache_data(self, source: str, payload: dict) -> SpaceCache:
        """Store new data in cache."""
        cache = SpaceCache(
            source=source,
            fetched_at=datetime.now(timezone.utc),
            payload=payload
        )
        self.session.add(cache)
        await self.session.commit()
        await self.session.refresh(cache)
        return cache

    async def cleanup_old_cache(
        self,
        source: str,
        keep_latest: int = 5
    ) -> int:
        """
        Keep only the N most recent entries per source.
        Returns the number of deleted records.
        """
        # Get IDs of entries to keep
        keep_result = await self.session.execute(
            select(SpaceCache.id)
            .where(SpaceCache.source == source)
            .order_by(SpaceCache.fetched_at.desc())
            .limit(keep_latest)
        )
        keep_ids = [row[0] for row in keep_result.all()]

        if not keep_ids:
            return 0

        # Delete all other entries for this source
        result = await self.session.execute(
            delete(SpaceCache)
            .where(SpaceCache.source == source)
            .where(SpaceCache.id.notin_(keep_ids))
        )
        await self.session.commit()
        return result.rowcount

    async def invalidate_source(self, source: str) -> int:
        """Delete all cached data for a source."""
        result = await self.session.execute(
            delete(SpaceCache).where(SpaceCache.source == source)
        )
        await self.session.commit()
        return result.rowcount
