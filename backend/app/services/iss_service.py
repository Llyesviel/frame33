from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List

from app.repositories.iss_repository import ISSRepository
from app.core.config import get_settings
from app.core.exceptions import NoDataError
from app.models.iss import ISSFetchLog

settings = get_settings()


class ISSService:
    """
    Service for ISS position business logic.

    Key requirement: ISS data must be fresher than 10 minutes,
    otherwise NO_DATA error is returned.
    """

    def __init__(self, repository: ISSRepository):
        self.repository = repository

    async def get_latest_position(self) -> Dict[str, Any]:
        """
        Get the latest ISS position.

        Raises NoDataError if:
        - No data exists in database
        - Data is older than ISS_FRESHNESS_MINUTES (10 min by default)
        """
        latest = await self.repository.get_latest()

        if latest is None:
            raise NoDataError("No ISS position data available")

        # Check freshness requirement (must be < 10 minutes old)
        freshness_cutoff = datetime.now(timezone.utc) - timedelta(
            minutes=settings.iss_freshness_minutes
        )

        if latest.timestamp.replace(tzinfo=timezone.utc) < freshness_cutoff:
            raise NoDataError(
                f"ISS data is stale (last update: {latest.timestamp.isoformat()}). "
                f"Data must be fresher than {settings.iss_freshness_minutes} minutes."
            )

        return self._format_position(latest)

    async def get_trend(
        self,
        hours: int = 24,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Get ISS movement history for the specified time period.

        Args:
            hours: Number of hours to look back
            limit: Maximum number of positions to return
        """
        records = await self.repository.get_trend(hours=hours, limit=limit)

        return {
            "positions": [self._format_position(r) for r in records],
            "count": len(records),
            "hours": hours
        }

    def _format_position(self, record: ISSFetchLog) -> Dict[str, Any]:
        """Format ISS position record for API response."""
        raw = record.raw or {}
        location_info = raw.get("location_info", {})

        return {
            "latitude": record.lat,
            "longitude": record.lon,
            "altitude_km": record.alt_km,
            "velocity_kmh": record.velocity_kmh,
            "visibility": raw.get("visibility"),
            "timestamp": record.timestamp.isoformat(),
            "country_code": location_info.get("country_code"),
            "timezone_id": location_info.get("timezone_id"),
        }
