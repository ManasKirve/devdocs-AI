class SearchError(Exception):
    """Base class for all semantic search errors."""


class SearchQueryError(SearchError):
    """The search query is empty or could not be embedded."""


class InvalidTopKError(SearchError):
    """The requested top_k value is outside the allowed range."""


class SearchRepositoryNotFoundError(SearchError):
    """No repository matching the requested one has been indexed."""


class DimensionMismatchError(SearchError):
    """The query embedding dimension differs from the indexed embeddings."""


class EmptyVectorError(SearchError):
    """An embedding vector is empty and cannot be compared."""
