class EmbeddingProviderError(Exception):
    """Base class for all embedding provider errors."""


class EmbeddingConfigurationError(EmbeddingProviderError):
    """The embedding provider is not configured."""


class EmbeddingAuthenticationError(EmbeddingProviderError):
    """The embedding provider rejected the API credentials."""


class EmbeddingRequestError(EmbeddingProviderError):
    """The embedding provider request failed."""


class EmbeddingRateLimitError(EmbeddingRequestError):
    """The embedding provider rate limit was exceeded."""


class EmbeddingTimeoutError(EmbeddingProviderError):
    """The embedding provider request timed out."""


class EmbeddingResponseError(EmbeddingProviderError):
    """The embedding provider returned an invalid response."""
