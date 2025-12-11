from fastapi import Request
from typing import AsyncGenerator

from app.services.jwst_service import JWSTService
from app.services.astro_service import AstroService


def get_trace_id(request: Request) -> str:
    """FastAPI dependency to get trace_id from request state."""
    return getattr(request.state, "trace_id", "unknown")


async def get_jwst_service() -> AsyncGenerator[JWSTService, None]:
    """Provide a JWSTService instance and ensure cleanup."""
    service = JWSTService()
    try:
        yield service
    finally:
        await service.close()


async def get_astro_service() -> AsyncGenerator[AstroService, None]:
    """Provide an AstroService instance and ensure cleanup."""
    service = AstroService()
    try:
        yield service
    finally:
        await service.close()
