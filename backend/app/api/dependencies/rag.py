from app.ai.embeddings.local import LocalEmbeddingProvider
from app.ai.llm.groq import GroqProvider
from app.ai.rag.retrieval import RetrievalService
from app.ai.rag.store import vector_store
from app.core.config import get_settings
from app.services.rag_service import RAGService


def get_rag_service() -> RAGService:
    settings = get_settings()
    embedding = LocalEmbeddingProvider(model=settings.embedding_model)
    llm = GroqProvider(
        api_key=settings.groq_api_key,
        model=settings.groq_rag_model,
        base_url=settings.groq_base_url,
        timeout_seconds=settings.groq_timeout_seconds,
    )
    return RAGService(
        embedding=embedding,
        retrieval=RetrievalService(store=vector_store),
        llm=llm,
    )