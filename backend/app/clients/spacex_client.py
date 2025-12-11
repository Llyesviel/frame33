from typing import Dict, Any

from app.clients.base_client import BaseAPIClient, split_base_and_path
from app.core.config import get_settings

settings = get_settings()


class SpaceXClient(BaseAPIClient):
    """
    Client for SpaceX API.

    API: https://api.spacexdata.com/v4/
    No authentication required.
    """

    def __init__(self):
        base_url, next_path = split_base_and_path(settings.spacex_api_url)
        super().__init__(base_url=base_url)
        self._next_path = next_path

    async def get_next_launch(self) -> Dict[str, Any]:
        """
        Get next scheduled SpaceX launch.

        Returns:
            Launch data including name, date_utc, rocket, launchpad, etc.
        """
        return await self.get(self._next_path)

    async def get_latest_launch(self) -> Dict[str, Any]:
        """
        Get most recent SpaceX launch.

        Returns:
            Launch data for the latest completed launch
        """
        return await self.get("/v4/launches/latest")

    async def get_upcoming_launches(self) -> list:
        """
        Get all upcoming SpaceX launches.

        Returns:
            List of upcoming launches
        """
        return await self.get("/v4/launches/upcoming")
