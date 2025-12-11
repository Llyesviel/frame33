from sqlalchemy import Column, Integer, Float, String, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone

from app.core.database import Base


class ISSFetchLog(Base):
    """
    ISS position fetch log table.

    Stores ISS position data fetched every 120 seconds.
    Data is append-only with 7-14 days retention.
    """
    __tablename__ = "iss_fetch_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lat = Column(Float, nullable=False, comment="Latitude")
    lon = Column(Float, nullable=False, comment="Longitude")
    alt_km = Column(Float, nullable=False, comment="Altitude in kilometers")
    velocity_kmh = Column(Float, nullable=False, comment="Velocity in km/h")
    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        comment="Timestamp of the position"
    )
    source_url = Column(String(500), nullable=False, comment="API source URL")
    raw = Column(JSONB, nullable=True, comment="Raw API response")
    inserted_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="Record insertion time"
    )

    __table_args__ = (
        Index("ix_iss_fetch_log_timestamp", "timestamp"),
    )

    def __repr__(self) -> str:
        return f"<ISSFetchLog(id={self.id}, lat={self.lat}, lon={self.lon}, timestamp={self.timestamp})>"
