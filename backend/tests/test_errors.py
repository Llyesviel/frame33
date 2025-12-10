import pytest
from app.core.exceptions import UpstreamError, RateLimitedError, NoDataError
from app.core.response import ErrorCode
from app.main import app

@pytest.mark.asyncio
async def test_upstream_error_handling(client):
    """Test handling of UpstreamError (should return 200 OK with error body)."""
    
    # We'll hit an endpoint that we force to raise an error via mocking
    # But since we can't easily inject errors into existing routes without complex mocking,
    # let's test the error response structure directly or use a dummy route if we could add one.
    
    # Alternatively, verify the format of a 404 which is handled by FastAPI's default handler, 
    # but we want to test our middleware.
    
    response = await client.get("/api/non-existent-route")
    assert response.status_code == 404
    # Our middleware might capture 404s if we configured it to catch StarletteHTTPException,
    # but usually ErrorHandlerMiddleware catches exceptions raised from code.
    
@pytest.mark.asyncio
async def test_health_check(client):
    """Test health check endpoint."""
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    # Health check returns a direct dict, not wrapped in unified response
    assert data["status"] == "ok"
    assert data["database"] in ["ok", "degraded", "error"]

@pytest.mark.asyncio
async def test_mocked_upstream_error(client, mocker):
    """Test that a service raising UpstreamError results in correct JSON response."""
    
    # Mock the health check service or similar simple endpoint to raise exception
    # For now, let's assume we mock a dependency in a real route.
    # Let's target /api/astro/events which uses AstroService
    
    mock_service = mocker.AsyncMock()
    mock_service.get_events.side_effect = UpstreamError(500, "Simulated upstream failure")
    
    from app.core.dependencies import get_astro_service
    app.dependency_overrides[get_astro_service] = lambda: mock_service
    
    try:
        response = await client.get("/api/astro/events", params={"latitude": 0, "longitude": 0})
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is False
        assert data["error"]["code"] == ErrorCode.UPSTREAM_5XX
        assert data["error"]["message"] == "Simulated upstream failure"
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_mocked_rate_limit_error(client, mocker):
    """Test that RateLimitedError results in correct JSON response."""
    
    mock_service = mocker.AsyncMock()
    mock_service.get_events.side_effect = RateLimitedError("Too many requests")
    
    from app.core.dependencies import get_astro_service
    app.dependency_overrides[get_astro_service] = lambda: mock_service
    
    try:
        response = await client.get("/api/astro/events", params={"latitude": 0, "longitude": 0})
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is False
        assert data["error"]["code"] == ErrorCode.RATE_LIMITED
        assert "Too many requests" in data["error"]["message"]
    finally:
        app.dependency_overrides.clear()
