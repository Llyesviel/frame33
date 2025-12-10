from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
import logging

from app.repositories.iss_repository import ISSRepository
from app.core.config import get_settings
from app.core.exceptions import NoDataError
from app.models.iss import ISSFetchLog

logger = logging.getLogger(__name__)
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

        If data is stale (> 10 mins) or missing, triggers immediate refresh.
        Raises NoDataError if data is still unavailable/stale after refresh attempt.
        """
        # Import here to avoid potential circular imports with scheduler/collector setup
        from app.collectors.iss_collector import collect_iss_position

        latest = await self.repository.get_latest()
        
        freshness_cutoff = datetime.now(timezone.utc) - timedelta(
            minutes=settings.iss_freshness_minutes
        )

        is_stale = False
        if latest is None:
            is_stale = True
        elif latest.timestamp.replace(tzinfo=timezone.utc) < freshness_cutoff:
            is_stale = True

        if is_stale:
            logger.warning("ISS data is stale or missing. Triggering on-demand refresh.")
            try:
                # Trigger collection (uses its own DB session)
                await collect_iss_position()
                
                # Re-query DB (assumes transaction isolation allows reading committed data)
                # In some cases we might need to refresh/expire current session, 
                # but usually a new query fetches fresh data.
                latest = await self.repository.get_latest()
            except Exception as e:
                logger.error(f"On-demand refresh failed: {e}")
                # We will fall through to check 'latest' again, if it's still stale we raise error.

        if latest is None:
             raise NoDataError("No ISS position data available")

        # Check freshness again
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
