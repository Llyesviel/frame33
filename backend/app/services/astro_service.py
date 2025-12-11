import logging
from typing import Dict, Any, Optional

from app.clients.astronomy_client import AstronomyClient
from app.core.exceptions import UpstreamError, SpaceDashboardError

logger = logging.getLogger(__name__)


class AstroService:
    """
    Service for astronomical events data.

    Proxies requests to AstronomyAPI with error handling.
    """

    def __init__(self, client: Optional[AstronomyClient] = None):
        self.client = client or AstronomyClient()

    async def get_events(
        self,
        latitude: float,
        longitude: float,
        elevation: int = 0,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        body: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get astronomical events for given coordinates.

        Args:
            latitude: Observer latitude (-90 to 90)
            longitude: Observer longitude (-180 to 180)
            elevation: Observer elevation in meters
            from_date: Start date (YYYY-MM-DD)
            to_date: End date (YYYY-MM-DD)
            body: Specific celestial body filter

        Returns:
            Astronomical events data
        """
        try:
            data = await self.client.get_events(
                latitude=latitude,
                longitude=longitude,
                elevation=elevation,
                from_date=from_date,
                to_date=to_date,
                body=body
            )

            # Extract events from response
            events = data.get("data", {}).get("events", []) if isinstance(data, dict) else []

            return {
                "coordinates": {
                    "latitude": latitude,
                    "longitude": longitude,
                    "elevation": elevation
                },
                "filters": {
                    "from_date": from_date,
                    "to_date": to_date,
                    "body": body
                },
                "events": events
            }
        except SpaceDashboardError:
            raise
        except Exception as e:
            logger.exception(f"Unexpected error fetching astronomy events: {e}")
            raise UpstreamError(500, "Failed to fetch astronomy events")

    async def close(self):
        """Close the underlying HTTP client."""
        await self.client.close()
