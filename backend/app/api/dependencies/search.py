from app.ai.embeddings.local import LocalEmbeddingProvider
from app.ai.rag.retrieval import RetrievalService
from app.ai.rag.store import vector_store
from app.core.config import get_settings
from app.services.search_service import SearchService


def get_search_service() -> SearchService:
    settings = get_settings()
    provider = LocalEmbeddingProvider(model=settings.embedding_model)
    return SearchService(
        provider=provider,
        retrieval=RetrievalService(store=vector_store),
    )