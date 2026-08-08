import pytest
from fastapi.testclient import TestClient

from app.api.dependencies.repositories import get_repository_service
from app.ingestion.errors import (
    GitHubAPIError,
    GitHubNetworkError,
    GitHubRateLimitError,
    InvalidRepositoryURLError,
    RepositoryEmptyError,
    RepositoryNotFoundError,
)
from app.main import app
from app.schemas.repositories import DocumentResponse, IngestResponse

client = TestClient(app)


def _sample_response() -> IngestResponse:
    return IngestResponse(
        repository="octocat/Hello-World",
        files_processed=1,
        files_skipped=2,
        documents=[
            DocumentResponse(
                repository="octocat/Hello-World",
                file_path="src/main.py",
                file_name="main.py",
                language="Python",
                size=21,
                content_preview="print('hello')",
            )
        ],
    )


class FakeRepositoryService:
    def __init__(self) -> None:
        self.last_url = None
        self.response = _sample_response()

    async def ingest(self, repository_url):
        self.last_url = repository_url
        return self.response


class RaisingRepositoryService:
    def __init__(self, error) -> None:
        self.error = error

    async def ingest(self, repository_url):
        raise self.error


fake = FakeRepositoryService()


@pytest.fixture(autouse=True)
def _use_fake_service():
    app.dependency_overrides[get_repository_service] = lambda: fake
    yield
    app.dependency_overrides.clear()


def test_ingest_endpoint_returns_response():
    response = client.post(
        "/api/v1/repositories/ingest",
        json={"repository_url": "https://github.com/octocat/Hello-World"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["repository"] == "octocat/Hello-World"
    assert body["files_processed"] == 1
    assert body["files_skipped"] == 2
    assert len(body["documents"]) == 1
    assert body["documents"][0]["file_path"] == "src/main.py"
    assert fake.last_url == "https://github.com/octocat/Hello-World"


def test_ingest_endpoint_rejects_missing_repository_url():
    response = client.post("/api/v1/repositories/ingest", json={})
    assert response.status_code == 422


def test_ingest_endpoint_rejects_empty_repository_url():
    response = client.post(
        "/api/v1/repositories/ingest", json={"repository_url": "   "}
    )
    assert response.status_code == 422


@pytest.mark.parametrize(
    "error,status_code",
    [
        (InvalidRepositoryURLError("invalid url"), 400),
        (RepositoryNotFoundError("not found"), 404),
        (RepositoryEmptyError("empty"), 422),
        (GitHubRateLimitError("rate limited"), 429),
        (GitHubAPIError("upstream failure"), 502),
        (GitHubNetworkError("network down"), 502),
    ],
)
def test_ingest_errors_map_to_clean_api_responses(error, status_code):
    app.dependency_overrides[get_repository_service] = lambda: RaisingRepositoryService(
        error
    )
    response = client.post(
        "/api/v1/repositories/ingest",
        json={"repository_url": "https://github.com/octocat/Hello-World"},
    )
    assert response.status_code == status_code
    assert "GITHUB_TOKEN" not in response.text
