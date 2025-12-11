from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import TypeVar, Generic, Type, Optional, List

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """Base repository with common CRUD operations."""

    def __init__(self, session: AsyncSession, model: Type[T]):
        self.session = session
        self.model = model

    async def get_by_id(self, id: int) -> Optional[T]:
        """Get entity by ID."""
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[T]:
        """Get all entities with pagination."""
        result = await self.session.execute(
            select(self.model).limit(limit).offset(offset)
        )
        return list(result.scalars().all())

    async def create(self, entity: T) -> T:
        """Create a new entity."""
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity

    async def delete(self, entity: T) -> None:
        """Delete an entity."""
        await self.session.delete(entity)
        await self.session.commit()

    async def commit(self) -> None:
        """Commit current transaction."""
        await self.session.commit()
