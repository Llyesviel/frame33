from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_session

router = APIRouter()


@router.get("/health")
async def health_check(session: AsyncSession = Depends(get_session)):
    """
    Health check endpoint.

    Returns:
        Status of the API and database connection.
    """
    try:
        await session.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "error"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "database": db_status,
        "service": "Space Dashboard API"
    }
