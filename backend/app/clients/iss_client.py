from typing import Dict, Any

from app.clients.base_client import BaseAPIClient, split_base_and_path
from app.core.config import get_settings

settings = get_settings()


class ISSClient(BaseAPIClient):
    """
    Client for WhereTheISS API.

    API: https://api.wheretheiss.at/v1/satellites/25544
    No authentication required.
    """

    def __init__(self):
        base_url, path = split_base_and_path(settings.iss_api_url)
        super().__init__(base_url=base_url)
        self._position_path = path

    async def get_position(self) -> Dict[str, Any]:
        """
        Fetch current ISS position and location info.

        Returns:
            Dict with keys: latitude, longitude, altitude, velocity, visibility, raw
            raw includes 'location_info' from coordinates endpoint.
        """
        data = await self.get(self._position_path)
        
        # Enrich with location info (country, timezone)
        location_info = {}
        try:
            lat = data.get("latitude")
            lon = data.get("longitude")
            if lat is not None and lon is not None:
                location_info = await self.get(f"/v1/coordinates/{lat},{lon}")
        except Exception:
            # Ignore location fetch errors, main position is more important
            pass

        # Merge location info into raw data
        full_data = {**data, "location_info": location_info}

        return {
            "latitude": data.get("latitude"),
            "longitude": data.get("longitude"),
            "altitude": data.get("altitude"),
            "velocity": data.get("velocity"),
            "visibility": data.get("visibility"),
            "source_url": settings.iss_api_url,
            "raw": full_data
        }
