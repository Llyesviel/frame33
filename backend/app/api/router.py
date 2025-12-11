from fastapi import APIRouter

from app.api import health, iss, osdr, space, jwst, astro, cms

# Main API router
api_router = APIRouter(prefix="/api")

# Include all route modules
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(iss.router, prefix="/iss", tags=["ISS"])
api_router.include_router(osdr.router, prefix="/osdr", tags=["OSDR"])
api_router.include_router(space.router, prefix="/space", tags=["Space Cache"])
api_router.include_router(jwst.router, prefix="/jwst", tags=["JWST"])
api_router.include_router(astro.router, prefix="/astro", tags=["Astronomy"])
api_router.include_router(cms.router, prefix="/cms", tags=["CMS"])
