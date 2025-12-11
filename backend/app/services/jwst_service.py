import logging
from typing import Dict, Any, Optional

from app.clients.jwst_client import JWSTClient
from app.core.exceptions import UpstreamError, SpaceDashboardError

logger = logging.getLogger(__name__)


class JWSTService:
    """
    Service for JWST (James Webb Space Telescope) data.

    Proxies requests to JWST API with error handling.
    """

    def __init__(self, client: Optional[JWSTClient] = None):
        self.client = client or JWSTClient()

    async def get_feed(
        self,
        page: int = 1,
        per_page: int = 20,
        suffix: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get JWST images feed.

        Args:
            page: Page number (1-indexed)
            per_page: Images per page
            suffix: Optional file suffix filter (jpg, png, etc.)

        Returns:
            Paginated image list
        """
        try:
            if suffix:
                data = await self.client.get_suffix_list(
                    suffix=suffix,
                    page=page,
                    per_page=per_page
                )
                images = data.get("body", []) if isinstance(data, dict) else data
            else:
                data = await self.client.get_all_images(page=page, per_page=per_page)
                images = data.get("body", []) if isinstance(data, dict) else data

            image_list = images if isinstance(images, list) else []
            return {
                "page": page,
                "per_page": per_page,
                "suffix": suffix,
                "images": image_list,
                "body": image_list  # maintain legacy contract expected by frontend
            }
        except SpaceDashboardError:
            raise
        except Exception as e:
            logger.exception(f"Unexpected error fetching JWST data: {e}")
            raise UpstreamError(500, "Failed to fetch JWST data")

    async def close(self):
        """Close the underlying HTTP client."""
        await self.client.close()
