import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.ai.llm.errors import (
    LLMProviderAuthenticationError,
    LLMProviderConfigurationError,
    LLMProviderError,
    LLMProviderRequestError,
    LLMProviderResponseError,
    LLMProviderTimeoutError,
)

logger = logging.getLogger("devdocs_ai")

_ERROR_RESPONSES = {
    LLMProviderConfigurationError: (
        503,
        "The AI provider is not configured. Please contact the administrator.",
    ),
    LLMProviderAuthenticationError: (
        502,
        "The AI provider rejected the API credentials.",
    ),
    LLMProviderRequestError: (502, "The AI provider request failed."),
    LLMProviderTimeoutError: (
        504,
        "The AI provider request timed out. Please try again.",
    ),
    LLMProviderResponseError: (
        502,
        "The AI provider returned an unexpected response.",
    ),
}


def _error_handler(status_code: int, message: str):
    def handler(request: Request, exc: LLMProviderError) -> JSONResponse:
        logger.error("AI provider error: %s", exc)
        return JSONResponse(status_code=status_code, content={"detail": message})

    return handler


def register_exception_handlers(app: FastAPI) -> None:
    for exc_type, (status_code, message) in _ERROR_RESPONSES.items():
        app.add_exception_handler(exc_type, _error_handler(status_code, message))
