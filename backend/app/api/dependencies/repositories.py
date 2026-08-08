from app.ai.embeddings.xai import XAIEmbeddingProvider
from app.core.config import get_settings
from app.ingestion.chunking.service import ChunkingService
from app.ingestion.github import GitHubClient
from app.services.embedding_service import EmbeddingService
from app.services.repository_service import RepositoryIngestionService


def get_repository_service() -> RepositoryIngestionService:
    settings = get_settings()
    client = GitHubClient(
        token=settings.github_token,
        base_url=settings.github_api_url,
        timeout_seconds=settings.github_timeout_seconds,
    )
    provider = XAIEmbeddingProvider(
        api_key=settings.xai_api_key,
        model=settings.xai_embedding_model,
        base_url=settings.xai_base_url,
        timeout_seconds=settings.xai_timeout_seconds,
    )
    return RepositoryIngestionService(
        github=client,
        chunker=ChunkingService(),
        embedder=EmbeddingService(provider=provider),
    )
