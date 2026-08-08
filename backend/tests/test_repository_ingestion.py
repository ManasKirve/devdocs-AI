import asyncio
import base64

import httpx
import pytest

from app.ingestion.errors import InvalidRepositoryURLError, RepositoryEmptyError
from app.ingestion.filters import detect_language, should_index_file
from app.ingestion.github import GitHubClient, parse_repository_url
from app.ingestion.store import document_store
from app.ai.rag.store import vector_store
from app.services.embedding_service import EmbeddingService
from app.services.repository_service import RepositoryIngestionService


class FakeEmbeddingProvider:
    async def embed_texts(self, texts):
        return [[1.0, 2.0, 3.0] for _ in texts]


def _run(coro):
    return asyncio.run(coro)


@pytest.mark.parametrize(
    "url,expected",
    [
        ("https://github.com/octocat/Hello-World", ("octocat", "Hello-World")),
        ("https://github.com/octocat/Hello-World/", ("octocat", "Hello-World")),
        ("https://github.com/octocat/Hello-World.git", ("octocat", "Hello-World")),
        (
            "https://github.com/octocat/Hello-World/tree/main",
            ("octocat", "Hello-World"),
        ),
        ("http://github.com/octocat/Hello-World", ("octocat", "Hello-World")),
        ("github.com/octocat/Hello-World", ("octocat", "Hello-World")),
        ("git@github.com:octocat/Hello-World.git", ("octocat", "Hello-World")),
        ("https://www.github.com/octocat/Hello-World", ("octocat", "Hello-World")),
    ],
)
def test_parse_repository_url_accepts_common_formats(url, expected):
    assert parse_repository_url(url) == expected


@pytest.mark.parametrize(
    "url",
    [
        "",
        "   ",
        "not-a-url",
        "https://gitlab.com/owner/repo",
        "https://github.com/single-segment",
        "https://example.com/owner/repo",
    ],
)
def test_parse_repository_url_rejects_invalid(url):
    with pytest.raises(InvalidRepositoryURLError):
        parse_repository_url(url)


def test_should_index_file_accepts_supported_source_file():
    assert should_index_file("src/main.py", 100)
    assert should_index_file("frontend/app.tsx", 100)


def test_should_index_file_rejects_unsupported_extension():
    assert not should_index_file("assets/logo.png", 100)
    assert not should_index_file("docs/report.pdf", 100)


def test_should_index_file_rejects_ignored_directories():
    assert not should_index_file("node_modules/pkg/index.js", 100)
    assert not should_index_file(".git/config", 100)
    assert not should_index_file("venv/bin/activate", 100)
    assert not should_index_file("dist/app.js", 100)


def test_should_index_file_rejects_ignored_files():
    assert not should_index_file(".env", 100)
    assert not should_index_file(".env.production", 100)
    assert not should_index_file("config/.env.local", 100)
    assert not should_index_file("package-lock.json", 100)


def test_should_index_file_rejects_large_files():
    assert not should_index_file("big.py", 1024 * 1024)


def test_detect_language_maps_extension():
    assert detect_language("app.py") == "Python"
    assert detect_language("app.tsx") == "TSX"
    assert detect_language("README.md") == "Markdown"
    assert detect_language("unknown.txt") == "Text"


def _tree_handler(requests):
    def handle(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        url = str(request.url)
        if url.endswith("/repos/octocat/Hello-World"):
            return httpx.Response(
                200,
                json={
                    "full_name": "octocat/Hello-World",
                    "default_branch": "main",
                },
            )
        if "git/trees/main" in url:
            return httpx.Response(
                200,
                json={
                    "tree": [
                        {"path": "src/app.py", "type": "blob", "size": 21},
                        {"path": "README.md", "type": "blob", "size": 14},
                        {"path": "assets/logo.png", "type": "blob", "size": 999},
                        {"path": "node_modules/x/index.js", "type": "blob", "size": 5},
                    ]
                },
            )
        if "/contents/" in url:
            path = url.split("/contents/", 1)[1].split("?", 1)[0]
            content = (
                "print('hello')" if path == "src/app.py" else "# Hello World"
            )
            return httpx.Response(
                200,
                json={
                    "encoding": "base64",
                    "content": base64.b64encode(content.encode("utf-8")).decode(
                        "ascii"
                    ),
                },
            )
        return httpx.Response(404, json={})

    return handle


def test_ingest_indexes_supported_files():
    document_store.clear_all()
    vector_store.clear_all()
    requests = []
    client = GitHubClient(transport=httpx.MockTransport(_tree_handler(requests)))
    embedder = EmbeddingService(provider=FakeEmbeddingProvider())
    service = RepositoryIngestionService(github=client, embedder=embedder)

    result = _run(service.ingest("https://github.com/octocat/Hello-World"))

    assert result.repository == "octocat/Hello-World"
    assert result.files_processed == 2
    assert result.files_skipped == 2
    assert result.chunks_created == 2
    assert result.embeddings_created == 2
    assert [doc.file_path for doc in result.documents] == ["src/app.py", "README.md"]
    assert result.documents[0].language == "Python"
    assert result.documents[0].content_preview == "print('hello')"
    assert len(document_store.get("octocat/Hello-World")) == 2
    assert len(document_store.get_chunks("octocat/Hello-World")) == 2
    assert len(document_store.get_embeddings("octocat/Hello-World")) == 2
    assert vector_store.count() == 2
    hits = vector_store.search([1.0, 2.0, 3.0], repository="octocat/Hello-World")
    assert len(hits) == 2
    assert {hit.file_path for hit in hits} == {"src/app.py", "README.md"}
    assert all(hit.score == pytest.approx(1.0) for hit in hits)


def test_ingest_raises_for_empty_repository():
    def handler(request: httpx.Request) -> httpx.Response:
        if "git/trees/main" in str(request.url):
            return httpx.Response(200, json={"tree": []})
        return httpx.Response(200, json={"default_branch": "main"})

    client = GitHubClient(transport=httpx.MockTransport(handler))
    service = RepositoryIngestionService(github=client)

    with pytest.raises(RepositoryEmptyError):
        _run(service.ingest("https://github.com/octocat/Hello-World"))


def test_client_sends_token_header():
    seen = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request.headers.get("Authorization"))
        return httpx.Response(200, json={"default_branch": "main"})

    client = GitHubClient(token="secret-token", transport=httpx.MockTransport(handler))
    _run(client.get_repository("octocat", "Hello-World"))
    assert seen == ["Bearer secret-token"]
