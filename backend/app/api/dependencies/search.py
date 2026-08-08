from app.ai.embeddings.xai import XAIEmbeddingProvider
from app.ai.rag.retrieval import RetrievalService
from app.ai.rag.store import vector_store
from app.core.config import get_settings
from app.services.search_service import SearchService


def get_search_service() -> SearchService:
    settings = get_settings()
    provider = XAIEmbeddingProvider(
        api_key=settings.xai_api_key,
        model=settings.xai_embedding_model,
        base_url=settings.xai_base_url,
        timeout_seconds=settings.xai_timeout_seconds,
    )
    return SearchService(
        provider=provider,
        retrieval=RetrievalService(store=vector_store),
    )
