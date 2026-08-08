from dataclasses import dataclass

from app.ai.embeddings.base import EmbeddingProvider
from app.ai.llm.base import LLMProvider
from app.ai.llm.output import extract_content
from app.ai.rag.errors import RAGEmptyContextError, SearchQueryError
from app.ai.rag.models import SearchHit
from app.ai.rag.prompts import build_rag_system_prompt, build_rag_user_prompt
from app.ai.rag.retrieval import RetrievalService


@dataclass(frozen=True)
class RAGResult:
    answer: str
    format: str
    sources: list[SearchHit]


class RAGService:
    """Retrieves relevant code snippets and generates an answer from them."""

    def __init__(
        self,
        *,
        embedding: EmbeddingProvider,
        retrieval: RetrievalService,
        llm: LLMProvider,
    ) -> None:
        self._embedding = embedding
        self._retrieval = retrieval
        self._llm = llm

    async def generate(
        self,
        query: str,
        *,
        repository: str | None = None,
        top_k: int | None = None,
    ) -> RAGResult:
        if not query or not query.strip():
            raise SearchQueryError("The RAG query must not be empty.")

        vectors = await self._embedding.embed_texts([query])
        if not vectors or not vectors[0]:
            raise SearchQueryError("The query could not be embedded.")

        hits = self._retrieval.search(
            vectors[0], repository=repository, top_k=top_k
        )
        if not hits:
            raise RAGEmptyContextError(
                "No relevant code snippets were found for your query."
            )

        response = await self._llm.generate_response(
            system_prompt=build_rag_system_prompt(),
            user_prompt=build_rag_user_prompt(query, hits),
        )
        answer, fmt = extract_content(response.content)
        return RAGResult(answer=answer, format=fmt, sources=hits)
