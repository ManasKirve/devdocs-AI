import asyncio

import pytest

from app.ai.embeddings import local as local_module
from app.ai.embeddings.errors import (
    EmbeddingConfigurationError,
    EmbeddingRequestError,
    EmbeddingResponseError,
)
from app.ai.embeddings.local import DEFAULT_DIMENSION, DEFAULT_MODEL, LocalEmbeddingProvider
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


class FakeModel:
    def __init__(self, vector_factory=None):
        self._vector_factory = vector_factory or (lambda i, text: [1.0, 2.0])
        self.calls = []

    def embed(self, texts):
        self.calls.append(list(texts))
        return [
            [float(value) for value in self._vector_factory(i, text)]
            for i, text in enumerate(texts)
        ]


def _provider_with_fake_model(monkeypatch, model=None):
    fake_model = model or FakeModel()
    monkeypatch.setattr(local_module, "_load_model", lambda name: fake_model)
    return fake_model, LocalEmbeddingProvider(model=DEFAULT_MODEL)


def test_successful_embedding_generation(monkeypatch):
    fake_model, provider = _provider_with_fake_model(
        monkeypatch, FakeModel(lambda i, text: [0.1, 0.2])
    )
    service = EmbeddingService(provider=provider, batch_size=10)
    results = _run(service.embed_chunks([_chunk("hello world")]))
    assert len(results) == 1
    assert results[0].content == "hello world"
    assert results[0].embedding == [0.1, 0.2]
    assert fake_model.calls == [["hello world"]]


def test_multiple_chunks_produce_multiple_results(monkeypatch):
    fake_model, provider = _provider_with_fake_model(
        monkeypatch, FakeModel(lambda i, text: [float(i), 0.0])
    )
    service = EmbeddingService(provider=provider, batch_size=10)
    chunks = [_chunk(f"text {i}", index=i) for i in range(5)]
    results = _run(service.embed_chunks(chunks))
    assert len(results) == 5
    assert [r.chunk_index for r in results] == [0, 1, 2, 3, 4]
    assert [r.content for r in results] == [f"text {i}" for i in range(5)]


def test_empty_chunk_list_makes_no_model_call(monkeypatch):
    called = False

    def fail_if_called(name):
        nonlocal called
        called = True
        raise AssertionError("model should not be loaded for an empty batch")

    monkeypatch.setattr(local_module, "_load_model", fail_if_called)
    provider = LocalEmbeddingProvider(model=DEFAULT_MODEL)
    service = EmbeddingService(provider=provider)
    assert _run(service.embed_chunks([])) == []
    assert called is False


def test_batch_processing_splits_requests(monkeypatch):
    fake_model, provider = _provider_with_fake_model(
        monkeypatch, FakeModel(lambda i, text: [float(i), 0.0, 0.0])
    )
    service = EmbeddingService(provider=provider, batch_size=2)
    chunks = [_chunk(f"text {i}", index=i) for i in range(5)]
    results = _run(service.embed_chunks(chunks))
    assert len(results) == 5
    assert fake_model.calls == [
        ["text 0", "text 1"],
        ["text 2", "text 3"],
        ["text 4"],
    ]


def test_missing_model_raises_configuration_error():
    with pytest.raises(EmbeddingConfigurationError):
        LocalEmbeddingProvider(model="")


def test_model_load_failure_raises_configuration_error(monkeypatch):
    def boom(name):
        raise RuntimeError("download failed")

    monkeypatch.setattr(local_module, "_load_model", boom)
    provider = LocalEmbeddingProvider(model=DEFAULT_MODEL)
    with pytest.raises(EmbeddingConfigurationError):
        _run(provider.embed_texts(["text"]))


def test_inference_failure_raises_request_error(monkeypatch):
    class ExplodingModel:
        def embed(self, texts):
            raise RuntimeError("inference failed")

    _, provider = _provider_with_fake_model(monkeypatch, ExplodingModel())
    with pytest.raises(EmbeddingRequestError):
        _run(provider.embed_texts(["text"]))


def test_mismatched_result_count_raises_response_error(monkeypatch):
    class ShortModel:
        def embed(self, texts):
            return [[1.0]]

    _, provider = _provider_with_fake_model(monkeypatch, ShortModel())
    with pytest.raises(EmbeddingResponseError):
        _run(provider.embed_texts(["a", "b"]))


def test_empty_vector_raises_response_error(monkeypatch):
    class EmptyModel:
        def embed(self, texts):
            return [[] for _ in texts]

    _, provider = _provider_with_fake_model(monkeypatch, EmptyModel())
    with pytest.raises(EmbeddingResponseError):
        _run(provider.embed_texts(["text"]))


def test_embedding_metadata_is_preserved(monkeypatch):
    _, provider = _provider_with_fake_model(
        monkeypatch, FakeModel(lambda i, text: [1.0])
    )
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


def test_embedding_dimensions_are_consistent(monkeypatch):
    _, provider = _provider_with_fake_model(
        monkeypatch, FakeModel(lambda i, text: [0.5] * 8)
    )
    service = EmbeddingService(provider=provider, batch_size=2)
    chunks = [_chunk(f"text {i}", index=i) for i in range(6)]
    results = _run(service.embed_chunks(chunks))
    assert len(results) == 6
    assert {len(result.embedding) for result in results} == {8}


def test_default_model_configuration_is_consistent():
    assert DEFAULT_DIMENSION == 384
    assert LocalEmbeddingProvider(model=DEFAULT_MODEL).model == DEFAULT_MODEL