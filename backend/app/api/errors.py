import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.ai.embeddings.errors import (
    EmbeddingAuthenticationError,
    EmbeddingConfigurationError,
    EmbeddingProviderError,
    EmbeddingRateLimitError,
    EmbeddingRequestError,
    EmbeddingResponseError,
    EmbeddingTimeoutError,
)
from app.ai.llm.errors import (
    LLMProviderAuthenticationError,
    LLMProviderConfigurationError,
    LLMProviderError,
    LLMProviderRequestError,
    LLMProviderResponseError,
    LLMProviderTimeoutError,
)
from app.ai.rag.errors import (
    DimensionMismatchError,
    EmptyVectorError,
    InvalidTopKError,
    SearchError,
    SearchQueryError,
    SearchRepositoryNotFoundError,
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

_EMBEDDING_ERROR_RESPONSES = {
    EmbeddingConfigurationError: (
        503,
        "The embedding provider is not configured. Please contact the administrator.",
    ),
    EmbeddingAuthenticationError: (
        502,
        "The embedding provider rejected the API credentials.",
    ),
    EmbeddingRequestError: (502, "The embedding request failed."),
    EmbeddingRateLimitError: (
        429,
        "The embedding provider rate limit was exceeded. Please try again later.",
    ),
    EmbeddingTimeoutError: (
        504,
        "The embedding request timed out. Please try again.",
    ),
    EmbeddingResponseError: (
        502,
        "The embedding provider returned an unexpected response.",
    ),
}

_SEARCH_ERROR_RESPONSES = {
    SearchQueryError: (400, "The search query is empty or could not be embedded."),
    InvalidTopKError: (400, "top_k must be between 1 and 100."),
    SearchRepositoryNotFoundError: (404, "No matching repository has been indexed."),
    DimensionMismatchError: (
        500,
        "The query embedding dimension does not match the indexed embeddings.",
    ),
    EmptyVectorError: (500, "An embedding vector was empty."),
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


def _embedding_error_handler(status_code: int, message: str):
    def handler(request: Request, exc: EmbeddingProviderError) -> JSONResponse:
        logger.error("Embedding provider error: %s", exc)
        return JSONResponse(status_code=status_code, content={"detail": message})

    return handler


def _search_error_handler(status_code: int, message: str):
    def handler(request: Request, exc: SearchError) -> JSONResponse:
        logger.error("Semantic search error: %s", exc)
        return JSONResponse(status_code=status_code, content={"detail": message})

    return handler


def register_exception_handlers(app: FastAPI) -> None:
    for exc_type, (status_code, message) in _ERROR_RESPONSES.items():
        app.add_exception_handler(exc_type, _error_handler(status_code, message))
    for exc_type, (status_code, message) in _EMBEDDING_ERROR_RESPONSES.items():
        app.add_exception_handler(
            exc_type, _embedding_error_handler(status_code, message)
        )
    for exc_type, (status_code, message) in _SEARCH_ERROR_RESPONSES.items():
        app.add_exception_handler(
            exc_type, _search_error_handler(status_code, message)
        )
    for exc_type, (status_code, message) in _INGESTION_ERROR_RESPONSES.items():
        app.add_exception_handler(
            exc_type, _ingestion_error_handler(status_code, message)
        )
