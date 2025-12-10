import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from typing import AsyncGenerator, Generator

from app.main import app
from app.core.database import get_session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import get_settings

# Use a separate test database or mock if possible
# For simplicity in this environment, we'll use an in-memory SQLite or mock session
# But since the app uses Postgres, we'll mock the DB session dependencies

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for each test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="module")
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async client for testing API."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

@pytest.fixture
def mock_db_session(mocker):
    """Mock database session."""
    mock_session = mocker.AsyncMock(spec=AsyncSession)
    return mock_session

@pytest.fixture
def override_get_db(mock_db_session):
    """Override get_session dependency."""
    async def _get_db():
        yield mock_db_session
    
    app.dependency_overrides[get_session] = _get_db
    yield
    app.dependency_overrides.clear()
