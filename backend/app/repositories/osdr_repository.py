from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime, timezone
from typing import Optional, List

from app.models.osdr import OSDRItem
from app.repositories.base import BaseRepository


class OSDRRepository(BaseRepository[OSDRItem]):
    """
    Repository for NASA OSDR (Open Science Data Repository) operations.

    Key feature: upsert by dataset_id to avoid duplicates.
    """

    def __init__(self, session: AsyncSession):
        super().__init__(session, OSDRItem)

    async def get_by_dataset_id(self, dataset_id: str) -> Optional[OSDRItem]:
        """Get dataset by its unique dataset_id."""
        result = await self.session.execute(
            select(OSDRItem).where(OSDRItem.dataset_id == dataset_id)
        )
        return result.scalar_one_or_none()

    async def list_datasets(
        self,
        limit: int = 50,
        offset: int = 0
    ) -> List[OSDRItem]:
        """List datasets with pagination, ordered by update time."""
        result = await self.session.execute(
            select(OSDRItem)
            .order_by(OSDRItem.updated_at.desc().nullslast())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def count_datasets(self) -> int:
        """Count total number of datasets."""
        from sqlalchemy import func
        result = await self.session.execute(
            select(func.count(OSDRItem.id))
        )
        return result.scalar_one()

    async def upsert_dataset(
        self,
        dataset_id: str,
        title: Optional[str] = None,
        status: Optional[str] = None,
        updated_at: Optional[datetime] = None,
        raw: Optional[dict] = None
    ) -> OSDRItem:
        """
        Upsert dataset by dataset_id.

        If dataset exists, updates title, status, updated_at, and raw.
        If not, creates a new record.
        This is a key requirement from TASK.md to avoid duplicate inserts.
        """
        stmt = insert(OSDRItem).values(
            dataset_id=dataset_id,
            title=title,
            status=status,
            updated_at=updated_at,
            raw=raw,
            inserted_at=datetime.now(timezone.utc)
        )

        # ON CONFLICT DO UPDATE
        stmt = stmt.on_conflict_do_update(
            index_elements=["dataset_id"],
            set_={
                "title": stmt.excluded.title,
                "status": stmt.excluded.status,
                "updated_at": stmt.excluded.updated_at,
                "raw": stmt.excluded.raw,
            }
        )

        await self.session.execute(stmt)
        await self.session.commit()

        # Return the upserted record
        return await self.get_by_dataset_id(dataset_id)

    async def bulk_upsert(self, datasets: List[dict]) -> int:
        """
        Bulk upsert multiple datasets.
        Returns the number of processed datasets.
        """
        if not datasets:
            return 0

        count = 0
        for data in datasets:
            try:
                await self.upsert_dataset(
                    dataset_id=data.get("dataset_id") or data.get("id"),
                    title=data.get("title"),
                    status=data.get("status"),
                    updated_at=data.get("updated_at"),
                    raw=data
                )
                count += 1
            except Exception:
                # Log and continue with other datasets
                continue

        return count
