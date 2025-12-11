import httpx
import logging
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential_jitter,
    retry_if_exception_type
)
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlsplit

from app.core.config import get_settings
from app.core.exceptions import UpstreamError, RateLimitedError

logger = logging.getLogger(__name__)
settings = get_settings()


def split_base_and_path(url: str) -> Tuple[str, str]:
    """Split absolute URL into base URL and path."""
    parsed = urlsplit(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}"
    path = parsed.path or "/"
    if parsed.query:
        path = f"{path}?{parsed.query}"
    return base_url, path


class BaseAPIClient:
    """
    Base HTTP client with retry logic and error handling.

    Features:
    - Automatic retry with exponential backoff and jitter
    - Timeout handling
    - Rate limit detection
    - Upstream error classification (4xx vs 5xx)
    """

    def __init__(
        self,
        base_url: str,
        timeout: Optional[int] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        self.base_url = base_url
        self.timeout = timeout or settings.http_timeout_seconds
        self.headers = headers or {}
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=self.timeout,
                headers=self.headers
            )
        return self._client

    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential_jitter(initial=1, max=10, jitter=2),
        retry=retry_if_exception_type((httpx.ConnectError, httpx.ReadTimeout)),
        reraise=True
    )
    async def get(
        self,
        path: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a GET request with automatic retry.

        Args:
            path: URL path (relative to base_url)
            params: Query parameters

        Returns:
            JSON response as dict

        Raises:
            RateLimitedError: If rate limited (429)
            UpstreamError: If upstream returns 4xx/5xx
        """
        client = await self._get_client()

        try:
            response = await client.get(path, params=params)
        except httpx.TimeoutException:
            logger.warning(f"Timeout fetching {self.base_url}{path}")
            raise UpstreamError(504, f"Timeout fetching {path}")
        except httpx.ConnectError as e:
            logger.warning(f"Connection error fetching {self.base_url}{path}: {e}")
            raise

        if response.status_code == 429:
            logger.warning(f"Rate limited by {self.base_url}")
            raise RateLimitedError()

        if response.status_code >= 400:
            logger.warning(
                f"Upstream error from {self.base_url}{path}: {response.status_code}"
            )
            raise UpstreamError(
                response.status_code,
                f"Upstream API error: {response.status_code}"
            )

        return response.json()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential_jitter(initial=1, max=10, jitter=2),
        retry=retry_if_exception_type((httpx.ConnectError, httpx.ReadTimeout)),
        reraise=True
    )
    async def post(
        self,
        path: str,
        data: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make a POST request with automatic retry."""
        client = await self._get_client()

        try:
            response = await client.post(path, data=data, json=json)
        except httpx.TimeoutException:
            logger.warning(f"Timeout posting to {self.base_url}{path}")
            raise UpstreamError(504, f"Timeout posting to {path}")
        except httpx.ConnectError as e:
            logger.warning(f"Connection error posting to {self.base_url}{path}: {e}")
            raise

        if response.status_code == 429:
            raise RateLimitedError()

        if response.status_code >= 400:
            raise UpstreamError(
                response.status_code,
                f"Upstream API error: {response.status_code}"
            )

        return response.json()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
