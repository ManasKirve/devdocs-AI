import asyncio
import json

import httpx
import pytest

from app.ai.embeddings.errors import (
    EmbeddingConfigurationError,
    EmbeddingRequestError,
    EmbeddingResponseError,
)
from app.ai.embeddings.xai import XAIEmbeddingProvider
from app.ingestion.chunking.models import Chunk
from app.services.embedding_service import EmbeddingService


def _run(coro):
    return asyncio.run(coro)


def _chunk(
    text,
    index=0,
    repository="octocat/Hello-World",
    file_path="src/app.py",
    language="Python",
):
    return Chunk(
        repository=repository,
        file_path=file_path,
        language=language,
        chunk_index=index,
        start_line=1,
        end_line=1,
        content=text,
    )


def _provider(handler, api_key="test-api-key", model="text-embedding-3-large"):
    return XAIEmbeddingProvider(
        api_key=api_key,
        model=model,
        base_url="https://api.x.ai/v1",
        transport=httpx.MockTransport(handler),
    )


def test_successful_embedding_generation():
    def handler(request: httpx.Request) -> httpx.Response:
        assert str(request.url) == "https://api.x.ai/v1/embeddings"
        assert request.headers["Authorization"] == "Bearer test-api-key"
        payload = json.loads(request.content)
        assert payload["model"] == "text-embedding-3-large"
        assert payload["input"] == ["hello world"]
        return httpx.Response(
            200,
            json={
                "object": "list",
                "model": "text-embedding-3-large",
                "data": [
                    {"object": "embedding", "index": 0, "embedding": [0.1, 0.2]}
                ],
                "usage": {"prompt_tokens": 2, "total_tokens": 2},
            },
        )

    provider = _provider(handler)
    service = EmbeddingService(provider=provider, batch_size=10)
    results = _run(service.embed_chunks([_chunk("hello world")]))
    assert len(results) == 1
    assert results[0].content == "hello world"
    assert results[0].embedding == [0.1, 0.2]


def test_multiple_chunks_produce_multiple_results():
    def handler(request: httpx.Request) -> httpx.Response:
        texts = json.loads(request.content)["input"]
        return httpx.Response(
            200,
            json={
                "data": [
                    {"embedding": [float(i), 0.0]} for i in range(len(texts))
                ]
            },
        )

    provider = _provider(handler)
    service = EmbeddingService(provider=provider, batch_size=10)
    chunks = [_chunk(f"text {i}", index=i) for i in range(5)]
    results = _run(service.embed_chunks(chunks))
    assert len(results) == 5
    assert [r.chunk_index for r in results] == [0, 1, 2, 3, 4]
    assert [r.content for r in results] == [f"text {i}" for i in range(5)]


def test_empty_chunk_list_makes_no_api_call():
    called = False

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal called
        called = True
        return httpx.Response(500, json={})

    provider = _provider(handler)
    service = EmbeddingService(provider=provider)
    results = _run(service.embed_chunks([]))
    assert results == []
    assert called is False


def test_batch_processing_splits_requests():
    request_inputs = []

    def handler(request: httpx.Request) -> httpx.Response:
        texts = json.loads(request.content)["input"]
        request_inputs.append(texts)
        return httpx.Response(
            200,
            json={
                "data": [
                    {"embedding": [float(i), 0.0, 0.0]}
                    for i in range(len(texts))
                ]
            },
        )

    provider = _provider(handler)
    service = EmbeddingService(provider=provider, batch_size=2)
    chunks = [_chunk(f"text {i}", index=i) for i in range(5)]
    results = _run(service.embed_chunks(chunks))
    assert len(results) == 5
    assert request_inputs == [["text 0", "text 1"], ["text 2", "text 3"], ["text 4"]]


def test_provider_api_failure_raises_request_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, json={"error": "internal error"})

    provider = _provider(handler)
    service = EmbeddingService(provider=provider)
    with pytest.raises(EmbeddingRequestError):
        _run(service.embed_chunks([_chunk("text")]))


def test_missing_api_key_raises_configuration_error():
    with pytest.raises(EmbeddingConfigurationError):
        XAIEmbeddingProvider(api_key="", model="text-embedding-3-large")


def test_invalid_provider_response_raises_response_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"data": [{"embedding": "not-a-list"}]})

    provider = _provider(handler)
    service = EmbeddingService(provider=provider)
    with pytest.raises(EmbeddingResponseError):
        _run(service.embed_chunks([_chunk("text")]))


def test_embedding_metadata_is_preserved():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"data": [{"embedding": [1.0]}]})

    provider = _provider(handler)
    service = EmbeddingService(provider=provider)
    chunk = Chunk(
        repository="acme/widgets",
        file_path="src/module.py",
        language="Python",
        chunk_index=7,
        start_line=10,
        end_line=42,
        content="def f():\n    pass",
    )
    results = _run(service.embed_chunks([chunk]))
    assert len(results) == 1
    result = results[0]
    assert result.repository == "acme/widgets"
    assert result.file_path == "src/module.py"
    assert result.language == "Python"
    assert result.chunk_index == 7
    assert result.start_line == 10
    assert result.end_line == 42
    assert result.content == "def f():\n    pass"
    assert result.embedding == [1.0]


def test_embedding_dimensions_are_consistent():
    def handler(request: httpx.Request) -> httpx.Response:
        texts = json.loads(request.content)["input"]
        return httpx.Response(
            200,
            json={"data": [{"embedding": [0.5] * 8} for _ in texts]},
        )

    provider = _provider(handler)
    service = EmbeddingService(provider=provider, batch_size=2)
    chunks = [_chunk(f"text {i}", index=i) for i in range(6)]
    results = _run(service.embed_chunks(chunks))
    assert len(results) == 6
    assert {len(result.embedding) for result in results} == {8}
