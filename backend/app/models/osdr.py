from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone

from app.core.database import Base


class OSDRItem(Base):
    """
    NASA OSDR (Open Science Data Repository) items table.

    Stores datasets fetched every 600 seconds.
    Uses upsert by dataset_id to avoid duplicates.
    """
    __tablename__ = "osdr_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dataset_id = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique dataset identifier"
    )
    title = Column(Text, nullable=True, comment="Dataset title")
    status = Column(String(50), nullable=True, comment="Dataset status")
    updated_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Last update time from source"
    )
    raw = Column(JSONB, nullable=True, comment="Raw API response")
    inserted_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="Record insertion time"
    )

    def __repr__(self) -> str:
        return f"<OSDRItem(id={self.id}, dataset_id={self.dataset_id}, title={self.title[:30] if self.title else None})>"
