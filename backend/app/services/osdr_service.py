from typing import Dict, Any

from app.repositories.osdr_repository import OSDRRepository
from app.core.exceptions import NotFoundError
from app.models.osdr import OSDRItem


class OSDRService:
    """Service for NASA OSDR (Open Science Data Repository) business logic."""

    def __init__(self, repository: OSDRRepository):
        self.repository = repository

    async def list_datasets(
        self,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        List OSDR datasets with pagination.

        Args:
            limit: Maximum number of datasets to return
            offset: Number of datasets to skip
        """
        datasets = await self.repository.list_datasets(limit=limit, offset=offset)
        total = await self.repository.count_datasets()

        return {
            "items": [self._format_dataset(d) for d in datasets],
            "count": len(datasets),
            "total": total,
            "limit": limit,
            "offset": offset
        }

    async def get_dataset(self, dataset_id: str) -> Dict[str, Any]:
        """
        Get specific dataset by ID.

        Raises NotFoundError if dataset doesn't exist.
        """
        dataset = await self.repository.get_by_dataset_id(dataset_id)

        if dataset is None:
            raise NotFoundError(f"Dataset '{dataset_id}' not found")

        return self._format_dataset(dataset, include_raw=True)

    def _format_dataset(
        self,
        dataset: OSDRItem,
        include_raw: bool = False
    ) -> Dict[str, Any]:
        """Format OSDR dataset for API response."""
        result = {
            "dataset_id": dataset.dataset_id,
            "title": dataset.title,
            "status": dataset.status,
            "updated_at": dataset.updated_at.isoformat() if dataset.updated_at else None,
        }

        if include_raw and dataset.raw:
            result["details"] = dataset.raw

        return result
