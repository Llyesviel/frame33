import uuid
import contextvars
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

# Context variable for trace_id - thread-safe storage
trace_id_var: contextvars.ContextVar[str] = contextvars.ContextVar("trace_id", default="")


class TraceIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware that generates or propagates trace_id for request tracing.

    - If X-Trace-ID header is present, uses that value
    - Otherwise generates a new UUID
    - Sets trace_id in request.state and response header
    """

    async def dispatch(self, request: Request, call_next):
        # Get or generate trace_id
        trace_id = request.headers.get("X-Trace-ID", str(uuid.uuid4()))

        # Store in context variable (for access in services/repositories)
        trace_id_var.set(trace_id)

        # Store in request state (for access in route handlers)
        request.state.trace_id = trace_id

        # Process request
        response = await call_next(request)

        # Add trace_id to response headers
        response.headers["X-Trace-ID"] = trace_id

        return response


def get_trace_id() -> str:
    """
    Get the current trace_id from context.
    Falls back to generating a new UUID if not in request context.
    """
    trace_id = trace_id_var.get()
    return trace_id if trace_id else str(uuid.uuid4())
