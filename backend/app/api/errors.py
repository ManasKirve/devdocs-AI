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
from app.ingestion.errors import (
    GitHubAPIError,
    GitHubNetworkError,
    GitHubRateLimitError,
    InvalidRepositoryURLError,
    RepositoryEmptyError,
    RepositoryIngestionError,
    RepositoryNotFoundError,
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

_INGESTION_ERROR_RESPONSES = {
    InvalidRepositoryURLError: (400, "Invalid GitHub repository URL."),
    RepositoryNotFoundError: (
        404,
        "The repository was not found or is not accessible.",
    ),
    RepositoryEmptyError: (
        422,
        "The repository contains no indexable files.",
    ),
    GitHubRateLimitError: (
        429,
        "The GitHub API rate limit was exceeded. Please try again later.",
    ),
    GitHubAPIError: (502, "The GitHub API request failed."),
    GitHubNetworkError: (
        502,
        "Could not reach the GitHub API. Please try again.",
    ),
}


def _error_handler(status_code: int, message: str):
    def handler(request: Request, exc: LLMProviderError) -> JSONResponse:
        logger.error("AI provider error: %s", exc)
        return JSONResponse(status_code=status_code, content={"detail": message})

    return handler


def _ingestion_error_handler(status_code: int, message: str):
    def handler(request: Request, exc: RepositoryIngestionError) -> JSONResponse:
        logger.error("Repository ingestion error: %s", exc)
        return JSONResponse(status_code=status_code, content={"detail": message})

    return handler


def register_exception_handlers(app: FastAPI) -> None:
    for exc_type, (status_code, message) in _ERROR_RESPONSES.items():
        app.add_exception_handler(exc_type, _error_handler(status_code, message))
    for exc_type, (status_code, message) in _INGESTION_ERROR_RESPONSES.items():
        app.add_exception_handler(
            exc_type, _ingestion_error_handler(status_code, message)
        )
