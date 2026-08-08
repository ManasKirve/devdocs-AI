from app.ai.embeddings.xai import XAIEmbeddingProvider
from app.ai.llm.grok import GrokProvider
from app.ai.rag.retrieval import RetrievalService
from app.ai.rag.store import vector_store
from app.core.config import get_settings
from app.services.rag_service import RAGService


def get_rag_service() -> RAGService:
    settings = get_settings()
    embedding = XAIEmbeddingProvider(
        api_key=settings.xai_api_key,
        model=settings.xai_embedding_model,
        base_url=settings.xai_base_url,
        timeout_seconds=settings.xai_timeout_seconds,
    )
    llm = GrokProvider(
        api_key=settings.xai_api_key,
        model=settings.xai_rag_model,
        base_url=settings.xai_base_url,
        timeout_seconds=settings.xai_timeout_seconds,
    )
    return RAGService(
        embedding=embedding,
        retrieval=RetrievalService(store=vector_store),
        llm=llm,
    )
