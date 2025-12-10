import pytest
from app.core.response import ErrorCode
from app.main import app

@pytest.mark.asyncio
async def test_astro_api_mock_data(client):
    """Test Astro API returns valid mock data structure."""
    response = await client.get("/api/astro/events", params={"latitude": 55.75, "longitude": 37.61})
    
    assert response.status_code == 200
    json_data = response.json()
    
    assert json_data["ok"] is True
    data = json_data["data"]
    
    # Check structure keys
    assert "bodies" in data
    assert "phenomena" in data
    assert "time" in data
    assert "observer" in data
    
    # Check mock data content
    assert len(data["bodies"]) > 0
    assert data["bodies"][0]["name"] == "Sun"
    
    # Check time data
    assert "sidereal_time" in data["time"]
    assert "julian_date" in data["time"]

@pytest.mark.asyncio
async def test_iss_api_endpoint(client, mocker):
    """Test ISS endpoint (requires mocking since it uses DB)."""
    
    # Mock the ISS service to return a dummy position
    # The dependency is in app.api.iss
    from app.api.iss import get_iss_service
    
    mock_service = mocker.AsyncMock()
    # The method called is get_latest_position
    mock_service.get_latest_position.return_value = {
        "latitude": 10.0,
        "longitude": 20.0,
        "altitude_km": 400.0,
        "velocity_kmh": 27000.0,
        "timestamp": "2024-01-01T12:00:00Z"
    }
    
    app.dependency_overrides[get_iss_service] = lambda: mock_service
    
    try:
        # Endpoint is /api/iss/last
        response = await client.get("/api/iss/last")
        assert response.status_code == 200
        json_data = response.json()
        assert json_data["ok"] is True
        assert json_data["data"]["latitude"] == 10.0
    finally:
        app.dependency_overrides.clear()
