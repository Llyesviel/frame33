from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone

from app.core.database import Base


class SpaceCache(Base):
    """
    Universal JSON cache for space data sources.

    Stores cached data from various APIs:
    - apod: NASA Astronomy Picture of the Day (TTL: 24h)
    - neo: NASA Near Earth Objects (TTL: 6h)
    - flr: NASA DONKI Solar Flares (TTL: 6h)
    - cme: NASA DONKI Coronal Mass Ejections (TTL: 6h)
    - spacex: SpaceX next launch (TTL: 6h)
    """
    __tablename__ = "space_cache"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(
        String(50),
        nullable=False,
        comment="Data source identifier (apod, neo, flr, cme, spacex)"
    )
    fetched_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        comment="Time when data was fetched"
    )
    payload = Column(
        JSONB,
        nullable=False,
        comment="Cached JSON payload"
    )

    __table_args__ = (
        Index("ix_space_cache_source_fetched", "source", "fetched_at"),
    )

    def __repr__(self) -> str:
        return f"<SpaceCache(id={self.id}, source={self.source}, fetched_at={self.fetched_at})>"
