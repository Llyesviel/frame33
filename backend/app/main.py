import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.middleware.trace_id import TraceIdMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.collectors.scheduler import start_scheduler, shutdown_scheduler, run_initial_collection
from app.core.config import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.

    Startup:
    - Start background scheduler
    - Run initial data collection

    Shutdown:
    - Stop scheduler gracefully
    """
    # Startup
    logger.info(f"Starting {settings.app_name}")
    start_scheduler()

    # Run initial collection to populate data
    try:
        await run_initial_collection()
    except Exception as e:
        logger.warning(f"Initial collection failed: {e}")

    yield

    # Shutdown
    shutdown_scheduler()
    logger.info(f"{settings.app_name} shut down")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="Space Dashboard API - Data from space APIs",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add custom middleware (order matters)
# Trace/Errors first, CORS last to ensure CORS headers are added even for handled errors.
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(TraceIdMiddleware)

# Add CORS middleware with configurable origins (outermost)
cors_origins = settings.cors_origins or ["*"]
allow_credentials = settings.cors_allow_credentials

if "*" in cors_origins and allow_credentials:
    logger.warning(
        "CORS credentials disabled because wildcard origin is configured. "
        "Set explicit origins via CORS_ORIGINS to allow credentials."
    )
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }
