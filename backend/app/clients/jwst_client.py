from typing import Dict, Any, Optional

from app.clients.base_client import BaseAPIClient, split_base_and_path
from app.core.config import get_settings

settings = get_settings()


class JWSTClient(BaseAPIClient):
    """
    Client for JWST (James Webb Space Telescope) API.

    API: https://api.jwstapi.com
    Authentication: x-api-key header
    """

    def __init__(self):
        base_url, _ = split_base_and_path(settings.jwst_api_url)
        super().__init__(
            base_url=base_url,
            headers={"x-api-key": settings.jwst_api_key}
        )

    async def get_program_list(self) -> Dict[str, Any]:
        """
        Get list of JWST programs.

        Returns:
            List of observation programs
        """
        return await self.get("/program/list")

    async def get_suffix_list(
        self,
        suffix: str = "jpg",
        page: int = 1,
        per_page: int = 20
    ) -> Dict[str, Any]:
        """
        Get images by file suffix.

        Args:
            suffix: File extension (jpg, png, fits, etc.)
            page: Page number (1-indexed)
            per_page: Number of images per page

        Returns:
            List of images with that suffix
        """
        return await self.get(
            f"/suffix/{suffix}",
            params={"page": page, "perPage": per_page}
        )

    async def get_all_images(
        self,
        page: int = 1,
        per_page: int = 20
    ) -> Dict[str, Any]:
        """
        Get paginated list of all JWST images.

        Args:
            page: Page number (1-indexed)
            per_page: Number of images per page

        Returns:
            Paginated image list
        """
        return await self.get(
            "/all",
            params={"page": page, "perPage": per_page}
        )

    async def get_image_by_id(self, image_id: str) -> Dict[str, Any]:
        """
        Get specific image by ID.

        Args:
            image_id: Image identifier

        Returns:
            Image details
        """
        return await self.get(f"/id/{image_id}")
