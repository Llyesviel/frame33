import base64
from typing import Dict, Any, Optional

from app.clients.base_client import BaseAPIClient, split_base_and_path
from app.core.config import get_settings

settings = get_settings()


class AstronomyClient(BaseAPIClient):
    """
    Client for AstronomyAPI.

    API: https://api.astronomyapi.com
    Authentication: Basic Auth (app_id:app_secret)
    """

    def __init__(self):
        # Create Basic Auth header
        credentials = f"{settings.astronomy_api_id}:{settings.astronomy_api_secret}"
        auth_header = base64.b64encode(credentials.encode()).decode()

        base_url, events_path = split_base_and_path(settings.astronomy_api_url)
        positions_base, positions_path = split_base_and_path(
            settings.astronomy_positions_api_url
        )
        super().__init__(
            base_url=base_url,
            headers={"Authorization": f"Basic {auth_header}"}
        )
        if positions_base != base_url:
            # Positions endpoint should share base; if not, fall back to same base.
            positions_path = "/api/v2/bodies/positions"
        self._events_path = events_path
        self._positions_path = positions_path

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
            body: Specific celestial body to filter events

        Returns:
            Astronomical events data
        """
        params: Dict[str, Any] = {
            "latitude": latitude,
            "longitude": longitude,
            "elevation": elevation
        }

        if from_date:
            params["from_date"] = from_date
        if to_date:
            params["to_date"] = to_date
        if body:
            params["body"] = body

        return await self.get(self._events_path, params=params)

    async def get_bodies_positions(
        self,
        latitude: float,
        longitude: float,
        elevation: int = 0,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get positions of celestial bodies.

        Args:
            latitude: Observer latitude
            longitude: Observer longitude
            elevation: Observer elevation in meters
            from_date: Start date
            to_date: End date

        Returns:
            Positions data for celestial bodies
        """
        params: Dict[str, Any] = {
            "latitude": latitude,
            "longitude": longitude,
            "elevation": elevation
        }

        if from_date:
            params["from_date"] = from_date
        if to_date:
            params["to_date"] = to_date

        return await self.get(self._positions_path, params=params)
