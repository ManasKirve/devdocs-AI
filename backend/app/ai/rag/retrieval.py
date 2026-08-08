from app.ai.rag.errors import (
    EmptyVectorError,
    InvalidTopKError,
    SearchRepositoryNotFoundError,
)
from app.ai.rag.models import SearchHit
from app.ai.rag.store import VectorStore

DEFAULT_TOP_K = 5
MAX_TOP_K = 100


class RetrievalService:
    """Validates a query embedding and returns the top K search hits."""

    def __init__(
        self,
        store: VectorStore,
        *,
        default_top_k: int = DEFAULT_TOP_K,
        max_top_k: int = MAX_TOP_K,
    ) -> None:
        self._store = store
        self._default_top_k = default_top_k
        self._max_top_k = max_top_k

    def search(
        self,
        query_embedding: list[float],
        *,
        repository: str | None = None,
        top_k: int | None = None,
    ) -> list[SearchHit]:
        if top_k is None:
            top_k = self._default_top_k
        if (
            not isinstance(top_k, int)
            or isinstance(top_k, bool)
            or top_k < 1
            or top_k > self._max_top_k
        ):
            raise InvalidTopKError(
                f"top_k must be between 1 and {self._max_top_k}."
            )
        if not query_embedding:
            raise EmptyVectorError("The query embedding must not be empty.")

        repositories = self._store.indexed_repositories()
        if repository is None:
            if not repositories:
                raise SearchRepositoryNotFoundError(
                    "No repository has been indexed yet."
                )
            repository = repositories[-1]
        elif repository not in repositories:
            raise SearchRepositoryNotFoundError(
                f"Repository {repository!r} has not been indexed."
            )

        hits = self._store.search(query_embedding, repository=repository)
        return hits[:top_k]
