from app.core.response import ErrorCode


class SpaceDashboardError(Exception):
    """Base exception for Space Dashboard application."""

    def __init__(self, code: ErrorCode, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


class NoDataError(SpaceDashboardError):
    """Raised when no data is available."""

    def __init__(self, message: str = "No data available"):
        super().__init__(ErrorCode.NO_DATA, message)


class ValidationError(SpaceDashboardError):
    """Raised when validation fails."""

    def __init__(self, message: str = "Validation error"):
        super().__init__(ErrorCode.VALIDATION_ERROR, message)


class UpstreamError(SpaceDashboardError):
    """Raised when an upstream API returns an error."""

    def __init__(self, status_code: int, message: str):
        code = ErrorCode.UPSTREAM_4XX if 400 <= status_code < 500 else ErrorCode.UPSTREAM_5XX
        super().__init__(code, message)
        self.status_code = status_code


class RateLimitedError(SpaceDashboardError):
    """Raised when rate limited by upstream API."""

    def __init__(self, message: str = "Rate limited by upstream API"):
        super().__init__(ErrorCode.RATE_LIMITED, message)


class NotFoundError(SpaceDashboardError):
    """Raised when a resource is not found."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(ErrorCode.NOT_FOUND, message)


class InternalError(SpaceDashboardError):
    """Raised for internal server errors."""

    def __init__(self, message: str = "Internal server error"):
        super().__init__(ErrorCode.INTERNAL_ERROR, message)
