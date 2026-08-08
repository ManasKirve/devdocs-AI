import asyncio

import pytest
from fastapi.testclient import TestClient

from app.ai.embeddings.errors import EmbeddingRequestError
from app.ai.rag.errors import (
    DimensionMismatchError,
    SearchQueryError,
    SearchRepositoryNotFoundError,
)
from app.ai.rag.models import SearchHit, VectorStoreItem
from app.ai.rag.retrieval import RetrievalService
from app.ai.rag.similarity import cosine_similarity
from app.ai.rag.store import InMemoryVectorStore
from app.api.dependencies.search import get_search_service
from app.main import app
from app.services.search_service import SearchService

client = TestClient(app)


def _run(coro):
    return asyncio.run(coro)


def _item(repository, file_path, chunk_index, embedding):
    return VectorStoreItem(
        repository=repository,
        file_path=file_path,
        language="Python",
        chunk_index=chunk_index,
        start_line=1,
        end_line=10,
        content=file_path,
        embedding=embedding,
    )


def _store_with_items():
    store = InMemoryVectorStore()
    store.add(
        [
            _item("acme/widgets", "src/app.py", 0, [1.0, 0.0]),
            _item("acme/widgets", "src/auth.py", 1, [0.9, 0.1]),
            _item("acme/widgets", "src/util.py", 2, [0.0, 1.0]),
            _item("acme/widgets", "src/other.py", 3, [-1.0, 0.0]),
        ]
    )
    return store


class FakeSearchService:
    def __init__(self) -> None:
        self.hits = []
        self.last_query = None
        self.last_repository = None
        self.last_top_k = None

    async def search(self, query, *, repository=None, top_k=None):
        self.last_query = query
        self.last_repository = repository
        self.last_top_k = top_k
        return self.hits


fake = FakeSearchService()


@pytest.fixture(autouse=True)
def _use_fake_search_service():
    fake.hits = []
    fake.last_query = None
    fake.last_repository = None
    fake.last_top_k = None
    app.dependency_overrides[get_search_service] = lambda: fake
    yield
    app.dependency_overrides.clear()


def test_vector_insertion():
    store = InMemoryVectorStore()
    store.add(
        [
            _item("acme/widgets", "src/a.py", 0, [1.0, 0.0]),
            _item("acme/widgets", "src/b.py", 1, [0.0, 1.0]),
        ]
    )
    assert store.indexed_repositories() == ["acme/widgets"]
    assert store.count() == 2

    store.add([_item("acme/widgets", "src/c.py", 2, [1.0, 1.0])])
    assert store.count() == 1

    store.add([_item("other/repo", "doc.md", 0, [0.5, 0.5])])
    assert store.indexed_repositories() == ["acme/widgets", "other/repo"]
    assert store.count() == 2


def test_cosine_similarity():
    assert cosine_similarity([1.0, 0.0], [1.0, 0.0]) == pytest.approx(1.0)
    assert cosine_similarity([1.0, 0.0], [0.0, 1.0]) == pytest.approx(0.0)
    assert cosine_similarity([1.0, 0.0], [-1.0, 0.0]) == pytest.approx(-1.0)
    assert cosine_similarity([3.0, 4.0], [6.0, 8.0]) == pytest.approx(1.0)


def test_zero_vectors_have_zero_similarity():
    assert cosine_similarity([0.0, 0.0], [1.0, 0.0]) == 0.0
    assert cosine_similarity([1.0, 0.0], [0.0, 0.0]) == 0.0
    assert cosine_similarity([0.0, 0.0], [0.0, 0.0]) == 0.0


def test_cosine_similarity_rejects_dimension_mismatch():
    with pytest.raises(DimensionMismatchError):
        cosine_similarity([1.0, 2.0], [1.0, 2.0, 3.0])
    with pytest.raises(DimensionMismatchError):
        cosine_similarity([1.0, 2.0, 3.0], [1.0, 2.0])


def test_top_k_retrieval():
    store = _store_with_items()
    retrieval = RetrievalService(store=store)
    hits = retrieval.search([1.0, 0.0], repository="acme/widgets", top_k=2)
    assert [hit.chunk_index for hit in hits] == [0, 1]
    hits = retrieval.search([1.0, 0.0], repository="acme/widgets", top_k=1)
    assert [hit.chunk_index for hit in hits] == [0]


def test_retrieval_sorts_by_similarity_descending():
    store = _store_with_items()
    retrieval = RetrievalService(store=store)
    hits = retrieval.search([1.0, 0.0], repository="acme/widgets")
    assert [hit.chunk_index for hit in hits] == [0, 1, 2, 3]
    scores = [hit.score for hit in hits]
    assert scores == sorted(scores, reverse=True)
    assert scores[0] == pytest.approx(1.0)
    assert scores[-1] == pytest.approx(-1.0)
    assert hits[0].content == "src/app.py"


def test_search_is_isolated_by_repository():
    store = _store_with_items()
    store.add(
        [
            _item("other/repo", "doc.md", 0, [1.0, 0.0]),
            _item("other/repo", "doc2.md", 1, [1.0, 0.0]),
        ]
    )
    retrieval = RetrievalService(store=store)

    hits = retrieval.search([1.0, 0.0], repository="acme/widgets")
    assert len(hits) == 4
    assert all(hit.repository == "acme/widgets" for hit in hits)

    hits = retrieval.search([1.0, 0.0], repository="other/repo")
    assert len(hits) == 2
    assert all(hit.repository == "other/repo" for hit in hits)

    with pytest.raises(SearchRepositoryNotFoundError):
        retrieval.search([1.0, 0.0], repository="unknown/repo")

    hits = retrieval.search([1.0, 0.0])
    assert all(hit.repository == "other/repo" for hit in hits)


def test_empty_vector_store_returns_empty_results():
    store = InMemoryVectorStore()
    assert store.search([1.0, 0.0], repository="anything") == []
    retrieval = RetrievalService(store=store)
    with pytest.raises(SearchRepositoryNotFoundError):
        retrieval.search([1.0, 0.0])

    indexed = InMemoryVectorStore()
    indexed.add([_item("acme/widgets", "src/app.py", 0, [1.0, 0.0])])
    indexed.clear("acme/widgets")
    assert "acme/widgets" in indexed.indexed_repositories()
    assert indexed.search([1.0, 0.0], repository="acme/widgets") == []
    retrieval = RetrievalService(store=indexed)
    assert retrieval.search([1.0, 0.0], repository="acme/widgets") == []


def test_empty_query_is_rejected():
    calls = []

    class RecordingProvider:
        async def embed_texts(self, texts):
            calls.append(texts)
            return [[1.0, 0.0]]

    service = SearchService(
        provider=RecordingProvider(),
        retrieval=RetrievalService(store=InMemoryVectorStore()),
    )
    with pytest.raises(SearchQueryError):
        _run(service.search(""))
    with pytest.raises(SearchQueryError):
        _run(service.search("   "))
    assert calls == []


def test_search_api_returns_results():
    fake.hits = [
        SearchHit(
            repository="octocat/Hello-World",
            file_path="src/app.py",
            language="Python",
            chunk_index=0,
            start_line=1,
            end_line=20,
            content="def auth",
            score=0.91,
        ),
        SearchHit(
            repository="octocat/Hello-World",
            file_path="README.md",
            language="Markdown",
            chunk_index=0,
            start_line=1,
            end_line=5,
            content="# Hello",
            score=0.8,
        ),
    ]
    response = client.post("/api/v1/search", json={"query": "how does auth work?"})
    assert response.status_code == 200
    body = response.json()
    assert body["query"] == "how does auth work?"
    assert len(body["results"]) == 2
    first = body["results"][0]
    assert first["file_path"] == "src/app.py"
    assert first["language"] == "Python"
    assert first["chunk_index"] == 0
    assert first["start_line"] == 1
    assert first["end_line"] == 20
    assert first["content"] == "def auth"
    assert first["score"] == 0.91
    assert "repository" not in first
    assert "embedding" not in first
    assert fake.last_query == "how does auth work?"
    assert fake.last_repository is None
    assert fake.last_top_k == 5


def test_search_api_passes_top_k_and_repository():
    response = client.post(
        "/api/v1/search",
        json={"query": "auth", "top_k": 3, "repository": "octocat/Hello-World"},
    )
    assert response.status_code == 200
    assert fake.last_top_k == 3
    assert fake.last_repository == "octocat/Hello-World"


def test_search_api_rejects_empty_query():
    response = client.post("/api/v1/search", json={"query": "   "})
    assert response.status_code == 422


def test_search_api_rejects_invalid_top_k():
    for value in (0, 101, -5):
        response = client.post(
            "/api/v1/search", json={"query": "auth", "top_k": value}
        )
        assert response.status_code == 422


def test_search_api_returns_empty_results_when_nothing_matches():
    fake.hits = []
    response = client.post("/api/v1/search", json={"query": "auth"})
    assert response.status_code == 200
    assert response.json() == {"query": "auth", "results": []}


def test_query_embedding_failure_returns_502():
    class RaisingProvider:
        async def embed_texts(self, texts):
            raise EmbeddingRequestError("boom")

    app.dependency_overrides[get_search_service] = lambda: SearchService(
        provider=RaisingProvider(),
        retrieval=RetrievalService(store=InMemoryVectorStore()),
    )
    response = client.post("/api/v1/search", json={"query": "auth"})
    assert response.status_code == 502
