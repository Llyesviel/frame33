from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "Space Dashboard API"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://space:space_secret@localhost:5432/space_dashboard"
    db_pool_size: int = 10
    db_max_overflow: int = 20

    # NASA API
    nasa_api_key: str = "DEMO_KEY"

    # JWST API
    jwst_api_key: str = ""

    # AstronomyAPI
    astronomy_api_id: str = ""
    astronomy_api_secret: str = ""

    # ISS API URLs
    iss_api_url: str = "https://api.wheretheiss.at/v1/satellites/25544"
    iss_poll_interval_seconds: int = 120
    iss_freshness_minutes: int = 10
    iss_retention_days: int = 14

    # NASA API URLs
    osdr_api_url: str = "https://visualization.osdr.nasa.gov/biodata/api/v2/datasets/"
    osdr_poll_interval_seconds: int = 600
    apod_api_url: str = "https://api.nasa.gov/planetary/apod"
    neo_api_url: str = "https://api.nasa.gov/neo/rest/v1/feed"
    donki_flr_url: str = "https://api.nasa.gov/DONKI/FLR"
    donki_cme_url: str = "https://api.nasa.gov/DONKI/CME"

    # SpaceX
    spacex_api_url: str = "https://api.spacexdata.com/v4/launches/next"

    # JWST & Astronomy
    jwst_api_url: str = "https://api.jwstapi.com"
    astronomy_api_url: str = "https://api.astronomyapi.com/api/v2/bodies/events"
    astronomy_positions_api_url: str = "https://api.astronomyapi.com/api/v2/bodies/positions"

    # Cache TTLs (hours)
    cache_ttl_short_hours: int = 6
    cache_ttl_long_hours: int = 24

    # HTTP Client
    http_timeout_seconds: int = 30
    http_max_retries: int = 3

    # CORS
    cors_origins: List[str] = ["http://localhost:3000"]
    cors_allow_credentials: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
