from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Index
from datetime import datetime, timezone

from app.core.database import Base


class CMSPage(Base):
    """
    CMS pages/blocks table.

    Stores CMS content blocks that can be displayed on the dashboard.
    Content is fetched by unique slug identifier.
    """
    __tablename__ = "cms_pages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(255), unique=True, nullable=False, comment="Unique slug identifier")
    title = Column(String(500), nullable=False, comment="Block title")
    html_body = Column(Text, nullable=True, comment="HTML content")
    is_active = Column(Boolean, default=True, nullable=False, comment="Whether block is active")
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="Creation timestamp"
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="Last update timestamp"
    )

    __table_args__ = (
        Index("ix_cms_pages_slug", "slug"),
        Index("ix_cms_pages_is_active", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<CMSPage(id={self.id}, slug='{self.slug}', title='{self.title}')>"
