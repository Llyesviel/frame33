from typing import Any, Optional, Union
from enum import Enum


class ErrorCode(str, Enum):
    """Error codes for API responses."""
    NO_DATA = "NO_DATA"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    UPSTREAM_4XX = "UPSTREAM_4XX"
    UPSTREAM_5XX = "UPSTREAM_5XX"
    RATE_LIMITED = "RATE_LIMITED"
    NOT_FOUND = "NOT_FOUND"
    INTERNAL_ERROR = "INTERNAL_ERROR"


def success_response(data: Any, trace_id: str) -> dict:
    """
    Create a successful API response.

    Format: { "ok": true, "data": {...}, "trace_id": "..." }
    """
    return {
        "ok": True,
        "data": data,
        "trace_id": trace_id
    }


def error_response(code: Union[ErrorCode, str], message: str, trace_id: str) -> dict:
    """
    Create an error API response.

    Format: { "ok": false, "error": { "code": "...", "message": "..." }, "trace_id": "..." }

    Note: Per TASK.md requirements, HTTP status is always 200 for business errors.
    """
    error_code = code.value if isinstance(code, ErrorCode) else code
    return {
        "ok": False,
        "error": {
            "code": error_code,
            "message": message
        },
        "trace_id": trace_id
    }
