import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.response import error_response, ErrorCode
from app.core.exceptions import SpaceDashboardError
from app.middleware.trace_id import get_trace_id

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Global error handler middleware.

    Catches all unhandled exceptions and returns a unified error response.
    Per TASK.md requirements: HTTP status is always 200 for business errors.
    """

    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except SpaceDashboardError as e:
            # Known business error
            trace_id = get_trace_id()
            logger.warning(
                f"Business error: {e.code.value} - {e.message}",
                extra={"trace_id": trace_id}
            )
            return JSONResponse(
                status_code=200,  # Always 200 per requirements
                content=error_response(e.code, e.message, trace_id)
            )
        except Exception as e:
            # Unknown error
            trace_id = get_trace_id()
            logger.exception(
                f"Unhandled exception: {e}",
                extra={"trace_id": trace_id}
            )
            return JSONResponse(
                status_code=200,  # Always 200 per requirements
                content=error_response(
                    ErrorCode.INTERNAL_ERROR,
                    "An internal error occurred",
                    trace_id
                )
            )
