import logging
from typing import Dict, Any, Set, Callable, Awaitable, Optional

from app.repositories.space_cache_repository import SpaceCacheRepository
from app.core.config import get_settings
from app.core.exceptions import NoDataError
from app.collectors.space_cache_collector import (
    collect_apod,
    collect_neo,
    collect_donki_flr,
    collect_donki_cme,
    collect_spacex,
)

logger = logging.getLogger(__name__)

settings = get_settings()

# TTL configuration per source (in hours)
SOURCE_TTL: Dict[str, int] = {
    "apod": settings.cache_ttl_long_hours,   # 24 hours
    "neo": settings.cache_ttl_short_hours,   # 6 hours
    "flr": settings.cache_ttl_short_hours,   # 6 hours
    "cme": settings.cache_ttl_short_hours,   # 6 hours
    "spacex": settings.cache_ttl_short_hours,  # 6 hours
}

# Aliases used by frontend/OpenAPI to keep compatibility
SOURCE_ALIASES: Dict[str, str] = {
    "donki_flr": "flr",
    "donki_cme": "cme",
}

VALID_SOURCES: Set[str] = set(SOURCE_TTL.keys()) | set(SOURCE_ALIASES.keys())

COLLECTORS: Dict[str, Callable[[], Awaitable[None]]] = {
    "apod": collect_apod,
    "neo": collect_neo,
    "flr": collect_donki_flr,
    "cme": collect_donki_cme,
    "spacex": collect_spacex,
}


class SpaceCacheService:
    """
    Service for space data cache business logic.

    Manages cached data from various sources with different TTLs:
    - apod: 24 hours (Astronomy Picture of the Day)
    - neo: 6 hours (Near Earth Objects)
    - flr: 6 hours (Solar Flares)
    - cme: 6 hours (Coronal Mass Ejections)
    - spacex: 6 hours (SpaceX launches)
    """

    def __init__(self, repository: SpaceCacheRepository):
        self.repository = repository

    async def get_latest(self, source: str) -> Dict[str, Any]:
        """
        Get latest cached data for a source, respecting TTL.

        Raises NoDataError if:
        - Source is unknown
        - No fresh data exists (TTL expired)
        """
        normalized_source = SOURCE_ALIASES.get(source, source)

        if normalized_source not in SOURCE_TTL:
            raise NoDataError(
                f"Unknown source: '{source}'. Valid sources: {sorted(VALID_SOURCES)}"
            )

        ttl = SOURCE_TTL[normalized_source]
        cached = await self.repository.get_fresh_by_source(
            normalized_source,
            ttl_hours=ttl
        )

        # If nothing fresh is available try to refresh the cache on demand
        refresh_error = None
        if cached is None:
            refresh_error = await self._refresh_source(normalized_source)
            if refresh_error is None:
                cached = await self.repository.get_fresh_by_source(
                    normalized_source,
                    ttl_hours=ttl
                )

        # Fall back to the latest cached entry even if it is stale
        if cached is None:
            latest = await self.repository.get_latest_by_source(normalized_source)
            if latest is None:
                msg = f"No fresh data for source '{source}'"
                if refresh_error:
                    msg += f". Error: {str(refresh_error)}"
                raise NoDataError(msg)

            return self._build_payload(source, latest, ttl, is_stale=True)

        return self._build_payload(source, cached, ttl, is_stale=False)

    async def get_latest_any(self, source: str) -> Dict[str, Any]:
        """
        Get latest cached data regardless of TTL.
        Useful as fallback when fresh data is unavailable.
        """
        normalized_source = SOURCE_ALIASES.get(source, source)

        if normalized_source not in SOURCE_TTL:
            raise NoDataError(f"Unknown source: '{source}'")

        cached = await self.repository.get_latest_by_source(normalized_source)

        if cached is None:
            raise NoDataError(f"No data for source '{source}'")

        ttl = SOURCE_TTL[normalized_source]
        return self._build_payload(source, cached, ttl, is_stale=False)

    @staticmethod
    def get_valid_sources() -> Set[str]:
        """Return set of valid source names."""
        return VALID_SOURCES

    async def _refresh_source(self, source: str) -> Optional[Exception]:
        """
        Trigger a collector for the specific source when cache is empty.

        Returns None if success, otherwise the exception.
        """
        collector = COLLECTORS.get(source)
        if collector is None:
            return Exception(f"No collector for source {source}")

        try:
            await collector()
            return None
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.warning(
                "Failed to refresh cache for source %s: %s",
                source,
                exc,
                exc_info=True
            )
            return exc

    @staticmethod
    def _build_payload(
        requested_source: str,
        cached_record,
        ttl_hours: int,
        is_stale: bool
    ) -> Dict[str, Any]:
        """
        Normalize cache records into API payload structure.
        """
        payload = cached_record.payload
        response = {
            "source": requested_source,
            "fetched_at": cached_record.fetched_at.isoformat(),
            "ttl_hours": ttl_hours,
            "data": payload,
            "payload": payload,
        }

        if is_stale:
            response["is_stale"] = True

        return response
