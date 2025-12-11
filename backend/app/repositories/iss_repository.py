from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from datetime import datetime, timedelta, timezone
from typing import Optional, List

from app.models.iss import ISSFetchLog
from app.repositories.base import BaseRepository


class ISSRepository(BaseRepository[ISSFetchLog]):
    """Repository for ISS position data operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(session, ISSFetchLog)

    async def get_latest(self) -> Optional[ISSFetchLog]:
        """Get the most recent ISS position."""
        result = await self.session.execute(
            select(ISSFetchLog)
            .order_by(ISSFetchLog.timestamp.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_trend(self, hours: int = 24, limit: int = 100) -> List[ISSFetchLog]:
        """Get ISS position history for the specified time period."""
        since = datetime.now(timezone.utc) - timedelta(hours=hours)
        result = await self.session.execute(
            select(ISSFetchLog)
            .where(ISSFetchLog.timestamp >= since)
            .order_by(ISSFetchLog.timestamp.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def insert_position(
        self,
        lat: float,
        lon: float,
        alt_km: float,
        velocity_kmh: float,
        source_url: str,
        raw: Optional[dict] = None
    ) -> ISSFetchLog:
        """Insert a new ISS position record."""
        log = ISSFetchLog(
            lat=lat,
            lon=lon,
            alt_km=alt_km,
            velocity_kmh=velocity_kmh,
            timestamp=datetime.now(timezone.utc),
            source_url=source_url,
            raw=raw
        )
        self.session.add(log)
        await self.session.commit()
        await self.session.refresh(log)
        return log

    async def cleanup_old_records(self, retention_days: int = 14) -> int:
        """
        Delete records older than retention period.
        Returns the number of deleted records.
        """
        cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)
        result = await self.session.execute(
            delete(ISSFetchLog).where(ISSFetchLog.timestamp < cutoff)
        )
        await self.session.commit()
        return result.rowcount
