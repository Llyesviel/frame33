import pytest
from datetime import datetime, timedelta, timezone
from app.services.space_cache_service import SpaceCacheService
from app.models.space_cache import SpaceCache
from app.core.exceptions import NoDataError

@pytest.mark.asyncio
async def test_cache_hit_fresh(mocker):
    """Test retrieving fresh data from cache."""
    mock_repo = mocker.AsyncMock()
    
    # Mock fresh data
    fresh_entry = SpaceCache(
        source="test_source",
        payload={"value": 1},
        fetched_at=datetime.now(timezone.utc)
    )
    mock_repo.get_fresh_by_source.return_value = fresh_entry
    
    service = SpaceCacheService(repository=mock_repo)
    
    # Patch SOURCE_TTL to include test_source
    mocker.patch.dict("app.services.space_cache_service.SOURCE_TTL", {"test_source": 1})
    
    result = await service.get_latest("test_source")
    
    assert result["data"] == {"value": 1}
    assert result["source"] == "test_source"
    assert result.get("is_stale", False) is False
    mock_repo.get_fresh_by_source.assert_called_once()

@pytest.mark.asyncio
async def test_cache_miss_trigger_refresh(mocker):
    """Test cache miss triggers refresh and fallback to stale data if needed."""
    mock_repo = mocker.AsyncMock()
    mock_repo.get_fresh_by_source.return_value = None # No fresh data
    
    # Old stale data
    stale_entry = SpaceCache(
        source="test_source",
        payload={"value": "old"},
        fetched_at=datetime.now(timezone.utc) - timedelta(hours=5)
    )
    # get_latest calls get_fresh_by_source (returns None), then _refresh_source, then get_fresh_by_source again.
    # If that returns None again, it calls get_latest_by_source.
    
    # We need to configure the side_effect for get_fresh_by_source to return None always
    mock_repo.get_fresh_by_source.return_value = None
    mock_repo.get_latest_by_source.return_value = stale_entry
    
    service = SpaceCacheService(repository=mock_repo)
    
    # Mock the collector function
    mock_collector = mocker.AsyncMock()
    
    # Patch the COLLECTORS dictionary in the service module
    mocker.patch.dict("app.services.space_cache_service.COLLECTORS", {"test_source": mock_collector})
    # Patch SOURCE_TTL
    mocker.patch.dict("app.services.space_cache_service.SOURCE_TTL", {"test_source": 1})
    
    result = await service.get_latest("test_source")
    
    # It should have tried to refresh
    mock_collector.assert_called_once()
    
    # It should return stale data because fresh fetch (simulated) didn't immediately update DB return value
    # In real world, collector writes to DB, then we query again.
    # Since we mocked get_fresh_by_source to ALWAYS return None, it falls back to get_latest_by_source.
    
    assert result["data"] == {"value": "old"}
    assert result.get("is_stale", False) is True

@pytest.mark.asyncio
async def test_no_data_error(mocker):
    """Test NoDataError when cache is empty and refresh fails."""
    mock_repo = mocker.AsyncMock()
    mock_repo.get_fresh_by_source.return_value = None
    mock_repo.get_latest_by_source.return_value = None
    
    service = SpaceCacheService(repository=mock_repo)
    
    mock_collector = mocker.AsyncMock()
    mock_collector.side_effect = Exception("API Error")
    
    mocker.patch.dict("app.services.space_cache_service.COLLECTORS", {"test_source": mock_collector})
    mocker.patch.dict("app.services.space_cache_service.SOURCE_TTL", {"test_source": 1})
    
    with pytest.raises(NoDataError):
        await service.get_latest("test_source")
