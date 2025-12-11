from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from app.clients.base_client import BaseAPIClient, split_base_and_path
from app.core.config import get_settings

settings = get_settings()


class NASAClient(BaseAPIClient):
    """
    Client for NASA APIs.

    Supports:
    - APOD (Astronomy Picture of the Day)
    - NEO (Near Earth Objects)
    - DONKI FLR (Solar Flares)
    - DONKI CME (Coronal Mass Ejections)

    All endpoints require api_key parameter.
    """

    def __init__(self):
        base_url, apod_path = split_base_and_path(settings.apod_api_url)
        super().__init__(base_url=base_url)
        self.api_key = settings.nasa_api_key
        _, self._neo_path = split_base_and_path(settings.neo_api_url)
        _, self._flr_path = split_base_and_path(settings.donki_flr_url)
        _, self._cme_path = split_base_and_path(settings.donki_cme_url)
        self._apod_path = apod_path

    async def get_apod(self, date: Optional[str] = None) -> Dict[str, Any]:
        """
        Get Astronomy Picture of the Day.

        Args:
            date: Optional date in YYYY-MM-DD format

        Returns:
            APOD data including title, explanation, url, hdurl, etc.
        """
        params = {"api_key": self.api_key}
        if date:
            params["date"] = date

        return await self.get(self._apod_path, params=params)

    async def get_neo_feed(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get Near Earth Objects feed.

        Args:
            start_date: Start date in YYYY-MM-DD format (default: today)
            end_date: End date in YYYY-MM-DD format (default: today)

        Returns:
            NEO feed data with near_earth_objects grouped by date
        """
        today = datetime.utcnow().strftime("%Y-%m-%d")
        params = {
            "api_key": self.api_key,
            "start_date": start_date or today,
            "end_date": end_date or today
        }

        return await self.get(self._neo_path, params=params)

    async def get_donki_flr(
        self,
        start_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get DONKI Solar Flare data.

        Args:
            start_date: Start date (default: 30 days ago)

        Returns:
            List of solar flare events
        """
        start = start_date or (
            datetime.utcnow() - timedelta(days=30)
        ).strftime("%Y-%m-%d")
        params = {
            "api_key": self.api_key,
            "startDate": start
        }

        return await self.get(self._flr_path, params=params)

    async def get_donki_cme(
        self,
        start_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get DONKI Coronal Mass Ejection data.

        Args:
            start_date: Start date (default: 30 days ago)

        Returns:
            List of CME events
        """
        start = start_date or (
            datetime.utcnow() - timedelta(days=30)
        ).strftime("%Y-%m-%d")
        params = {
            "api_key": self.api_key,
            "startDate": start
        }

        return await self.get(self._cme_path, params=params)


class OSDRClient(BaseAPIClient):
    """
    Client for NASA OSDR (Open Science Data Repository) API.

    API: https://visualization.osdr.nasa.gov/biodata/api/v2/datasets/
    """

    def __init__(self):
        base_url, path = split_base_and_path(settings.osdr_api_url)
        super().__init__(base_url=base_url)
        self._datasets_path = path

    async def get_datasets(self, limit: int = 100) -> Dict[str, Any]:
        """
        Fetch NASA OSDR datasets.

        Args:
            limit: Maximum number of datasets to fetch

        Returns:
            Dict with 'results' containing list of datasets
        """
        params = {
            "format": "json",
            "limit": limit
        }

        return await self.get(self._datasets_path, params=params)
