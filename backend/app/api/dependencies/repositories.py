from app.core.config import get_settings
from app.ingestion.github import GitHubClient
from app.services.repository_service import RepositoryIngestionService


def get_repository_service() -> RepositoryIngestionService:
    settings = get_settings()
    client = GitHubClient(
        token=settings.github_token,
        base_url=settings.github_api_url,
        timeout_seconds=settings.github_timeout_seconds,
    )
    return RepositoryIngestionService(github=client)
