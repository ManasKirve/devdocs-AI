from app.ai.embeddings.base import EmbeddingProvider
from app.ai.rag.errors import SearchQueryError
from app.ai.rag.models import SearchHit
from app.ai.rag.retrieval import RetrievalService


class SearchService:
    """Embeds a query and returns the most relevant indexed chunks."""

    def __init__(
        self,
        *,
        provider: EmbeddingProvider,
        retrieval: RetrievalService,
    ) -> None:
        self._provider = provider
        self._retrieval = retrieval

    async def search(
        self,
        query: str,
        *,
        repository: str | None = None,
        top_k: int | None = None,
    ) -> list[SearchHit]:
        if not query or not query.strip():
            raise SearchQueryError("The search query must not be empty.")

        vectors = await self._provider.embed_texts([query])
        if not vectors or not vectors[0]:
            raise SearchQueryError("The query could not be embedded.")

        return self._retrieval.search(
            vectors[0], repository=repository, top_k=top_k
        )
