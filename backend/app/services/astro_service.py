import logging
import random
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from app.clients.astronomy_client import AstronomyClient
from app.core.exceptions import UpstreamError, SpaceDashboardError

logger = logging.getLogger(__name__)


class AstroService:
    """
    Service for astronomical events data.

    Mocks data since API key is not available.
    """

    def __init__(self, client: Optional[AstronomyClient] = None):
        self.client = client or AstronomyClient()

    def _random_deg(self, min_val=0, max_val=360):
        val = random.uniform(min_val, max_val)
        return f"{val:.4f}°"

    def _random_ra(self):
        h = random.randint(0, 23)
        m = random.randint(0, 59)
        s = random.randint(0, 59)
        return f"{h}h {m}m {s}s"

    def _random_dec(self):
        d = random.randint(-90, 90)
        m = random.randint(0, 59)
        s = random.randint(0, 59)
        return f"{d:+d}° {m}' {s}\""

    def _random_time(self, hour_start, hour_end):
        if hour_end < hour_start:
            hour_end += 24
        h = random.randint(hour_start, hour_end) % 24
        m = random.randint(0, 59)
        return f"{h:02d}:{m:02d}"

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
        Returns mocked data to simulate Astronomy API.
        """
        try:
            # Mock Data Generation
            now = datetime.utcnow()
            
            # 1. Celestial Bodies
            bodies = [
                {
                    "name": "Sun", 
                    "azimuth": self._random_deg(170, 190), 
                    "altitude": self._random_deg(40, 50), 
                    "ra": self._random_ra(), 
                    "dec": self._random_dec(), 
                    "rise": self._random_time(5, 7), 
                    "set": self._random_time(17, 19), 
                    "culmination": self._random_time(11, 13)
                },
                {
                    "name": "Moon", 
                    "azimuth": self._random_deg(80, 100), 
                    "altitude": self._random_deg(20, 40), 
                    "ra": self._random_ra(), 
                    "dec": self._random_dec(), 
                    "rise": self._random_time(17, 19), 
                    "set": self._random_time(5, 7), 
                    "culmination": self._random_time(23, 1), 
                    "phase": random.choice(["Waxing Gibbous", "Waning Gibbous", "Full Moon", "New Moon", "First Quarter"])
                },
                {
                    "name": "Mars", 
                    "azimuth": self._random_deg(0, 360), 
                    "altitude": self._random_deg(-10, 80), 
                    "ra": self._random_ra(), 
                    "dec": self._random_dec(), 
                    "rise": self._random_time(13, 15), 
                    "set": self._random_time(1, 3), 
                    "culmination": self._random_time(19, 21)
                },
                {
                    "name": "Venus", 
                    "azimuth": self._random_deg(0, 360), 
                    "altitude": self._random_deg(-10, 80), 
                    "ra": self._random_ra(), 
                    "dec": self._random_dec(), 
                    "rise": self._random_time(4, 6), 
                    "set": self._random_time(16, 18), 
                    "culmination": self._random_time(10, 12)
                },
                {
                    "name": "Jupiter", 
                    "azimuth": self._random_deg(0, 360), 
                    "altitude": self._random_deg(-10, 80), 
                    "ra": self._random_ra(), 
                    "dec": self._random_dec(), 
                    "rise": self._random_time(15, 17), 
                    "set": self._random_time(3, 5), 
                    "culmination": self._random_time(21, 23)
                },
                {
                    "name": "Saturn", 
                    "azimuth": self._random_deg(0, 360), 
                    "altitude": self._random_deg(-10, 80), 
                    "ra": self._random_ra(), 
                    "dec": self._random_dec(), 
                    "rise": self._random_time(18, 20), 
                    "set": self._random_time(6, 8), 
                    "culmination": self._random_time(0, 2)
                },
            ]

            # 2. Events & Phenomena
            events = [
                {"category": "Dawn/Dusk", "name": "Civil Dawn", "time": self._random_time(5, 5)},
                {"category": "Dawn/Dusk", "name": "Nautical Dawn", "time": self._random_time(4, 5)},
                {"category": "Dawn/Dusk", "name": "Astronomical Dawn", "time": self._random_time(4, 4)},
                {"category": "Moon Cycle", "name": "Next New Moon", "date": (now + timedelta(days=random.randint(10, 20))).strftime("%Y-%m-%d")},
                {"category": "Eclipse", "name": "Solar Eclipse", "date": (now + timedelta(days=random.randint(100, 365))).strftime("%Y-%m-%d"), "status": "Total"},
            ]

            # 3. Time Data
            sidereal_h = random.randint(0, 23)
            sidereal_m = random.randint(0, 59)
            sidereal_s = random.randint(0, 59)
            
            time_data = {
                "sidereal_time": f"{sidereal_h:02d}:{sidereal_m:02d}:{sidereal_s:02d}",
                "julian_date": 2460000.5 + random.uniform(0, 1000),
                "timezone": "UTC+3",
                "local_time": now.strftime("%H:%M:%S")
            }

            # 4. Observer
            observer = {
                "latitude": latitude,
                "longitude": longitude,
                "location": "Mock City, Earth" # Simple mock
            }

            # 5. Configurations
            configs = [
                {"type": "Conjunction", "body1": "Venus", "body2": "Jupiter", "date": (now + timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d")},
                {"type": "Opposition", "body": "Mars", "date": (now + timedelta(days=random.randint(30, 90))).strftime("%Y-%m-%d")},
            ]

            return {
                "coordinates": {
                    "latitude": latitude,
                    "longitude": longitude,
                    "elevation": elevation
                },
                "bodies": bodies,
                "phenomena": events,
                "time": time_data,
                "observer": observer,
                "configurations": configs,
                # Legacy support for existing frontend just in case, though we will update it
                "events": [] 
            }

        except Exception as e:
            logger.exception(f"Unexpected error in mock astro service: {e}")
            raise UpstreamError(500, "Failed to generate astronomy data")

    async def close(self):
        """Close the underlying HTTP client."""
        await self.client.close()
