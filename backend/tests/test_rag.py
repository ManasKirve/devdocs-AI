import asyncio
import types

import pytest
from fastapi.testclient import TestClient

from app.ai.llm.errors import LLMProviderTimeoutError
from app.ai.llm.output import extract_content
from app.ai.rag.errors import RAGEmptyContextError, SearchQueryError
from app.ai.rag.models import SearchHit, VectorStoreItem
from app.ai.rag.prompts import (
    build_rag_system_prompt,
    build_rag_user_prompt,
)
from app.ai.rag.retrieval import RetrievalService
from app.ai.rag.store import InMemoryVectorStore
from app.api.dependencies.rag import get_rag_service
from app.main import app
from app.services.rag_service import RAGService

client = TestClient(app)


def _run(coro):
    return asyncio.run(coro)


def _hit(
    repository="octocat/Hello-World",
    file_path="src/auth.py",
    content="def login():",
    score=0.95,
):
    return SearchHit(
        repository=repository,
        file_path=file_path,
        language="Python",
        chunk_index=0,
        start_line=1,
        end_line=10,
        content=content,
        score=score,
    )


def _store_with_items():
    store = InMemoryVectorStore()
    store.add(
        [
            VectorStoreItem(
                repository="octocat/Hello-World",
                file_path="src/auth.py",
                language="Python",
                chunk_index=0,
                start_line=1,
                end_line=10,
                content="def login():",
                embedding=[1.0, 0.0],
            ),
            VectorStoreItem(
                repository="octocat/Hello-World",
                file_path="src/app.py",
                language="Python",
                chunk_index=1,
                start_line=1,
                end_line=5,
                content="from auth import login",
                embedding=[0.9, 0.1],
            ),
        ]
    )
    return store


class FakeEmbedding:
    async def embed_texts(self, texts):
        return [[1.0, 0.0]]


class FakeLLM:
    def __init__(self, content=None, error=None) -> None:
        self.content = content or "```python\nprint('ok')\n```"
        self.error = error
        self.last_system_prompt = None
        self.last_user_prompt = None

    async def generate_response(
        self, *, system_prompt, user_prompt, temperature=0.7, max_tokens=None
    ):
        self.last_system_prompt = system_prompt
        self.last_user_prompt = user_prompt
        if self.error:
            raise self.error
        return types.SimpleNamespace(content=self.content)


def _service(llm=None, store=None):
    return RAGService(
        embedding=FakeEmbedding(),
        retrieval=RetrievalService(store=store or _store_with_items()),
        llm=llm or FakeLLM(),
    )


class TestExtractContent:
    def test_plain_text(self):
        assert extract_content("  plain answer  ") == ("plain answer", "text")

    def test_blank_text(self):
        assert extract_content("") == ("", "text")
        assert extract_content("   \n  ") == ("", "text")

    def test_fenced_block(self):
        text = "```python\ndef f():\n    return 1\n```"
        assert extract_content(text) == ("def f():\n    return 1", "python")

    def test_uses_last_fenced_block(self):
        text = "```text\nfirst\n```\n```python\nsecond\n```"
        assert extract_content(text) == ("second", "python")

    def test_fence_without_language_is_text(self):
        text = "```\ncode\n```"
        assert extract_content(text) == ("code", "text")

    def test_leading_explanation_is_dropped(self):
        text = "Here you go:\n```python\nprint('hi')\n```\n"
        assert extract_content(text) == ("print('hi')", "python")

    def test_inner_indentation_is_preserved(self):
        text = "```python\nif x:\n    return 1\n```"
        assert extract_content(text)[0] == "if x:\n    return 1"

    def test_language_label_is_lowercased(self):
        text = "```Python\ncode\n```"
        assert extract_content(text) == ("code", "python")


class TestPrompts:
    def test_system_prompt_is_stable(self):
        assert build_rag_system_prompt() == build_rag_system_prompt()

    def test_user_prompt_includes_query_and_citations(self):
        prompt = build_rag_user_prompt("auth", [_hit()])
        assert "auth" in prompt
        assert "src/auth.py#1-10" in prompt
        assert "def login():" in prompt


class TestRAGService:
    def test_generate_returns_answer_format_and_sources(self):
        llm = FakeLLM(content="```python\nprint('hello')\n```")
        service = _service(llm=llm)
        result = _run(service.generate("how do I login?"))

        assert result.answer == "print('hello')"
        assert result.format == "python"
        assert [source.file_path for source in result.sources] == [
            "src/auth.py",
            "src/app.py",
        ]
        assert llm.last_user_prompt.startswith("QUESTION:\nhow do I login?")
        assert "def login():" in llm.last_user_prompt
        assert llm.last_system_prompt == build_rag_system_prompt()

    def test_generate_uses_last_fenced_block(self):
        llm = FakeLLM(
            content="First pass:\n```text\nold\n```\n\nFinal answer:\n"
            "```python\nprint('new')\n```"
        )
        result = _run(_service(llm=llm).generate("auth"))
        assert result.answer == "print('new')"
        assert result.format == "python"

    def test_generate_plain_text_answer(self):
        llm = FakeLLM(content="The login flow is handled in auth.py.")
        result = _run(_service(llm=llm).generate("where is login?"))
        assert result.answer == "The login flow is handled in auth.py."
        assert result.format == "text"

    def test_generate_rejects_empty_query(self):
        llm = FakeLLM()
        service = _service(llm=llm)
        with pytest.raises(SearchQueryError):
            _run(service.generate(""))
        with pytest.raises(SearchQueryError):
            _run(service.generate("   "))
        assert llm.last_user_prompt is None

    def test_generate_raises_empty_context_when_no_snippets(self):
        store = _store_with_items()
        store.clear("octocat/Hello-World")
        service = _service(store=store)
        with pytest.raises(RAGEmptyContextError):
            _run(service.generate("how do I login?"))

    def test_generate_passes_repository_and_top_k_to_retrieval(self):
        store = InMemoryVectorStore()
        store.add(
            [
                VectorStoreItem(
                    repository="acme/widgets",
                    file_path="a.py",
                    language="Python",
                    chunk_index=0,
                    start_line=1,
                    end_line=5,
                    content="a",
                    embedding=[1.0, 0.0],
                ),
                VectorStoreItem(
                    repository="other/repo",
                    file_path="b.py",
                    language="Python",
                    chunk_index=0,
                    start_line=1,
                    end_line=5,
                    content="b",
                    embedding=[0.9, 0.1],
                ),
            ]
        )
        service = _service(store=store)
        result = _run(
            service.generate("auth", repository="acme/widgets", top_k=1)
        )
        assert [source.file_path for source in result.sources] == ["a.py"]

    def test_generate_llm_failure_propagates(self):
        llm = FakeLLM(error=LLMProviderTimeoutError("timed out"))
        with pytest.raises(LLMProviderTimeoutError):
            _run(_service(llm=llm).generate("how do I login?"))


class FakeRAGService:
    def __init__(self) -> None:
        self.result = None
        self.error = None
        self.last_query = None
        self.last_repository = None
        self.last_top_k = None

    async def generate(self, query, *, repository=None, top_k=None):
        self.last_query = query
        self.last_repository = repository
        self.last_top_k = top_k
        if self.error:
            raise self.error
        return self.result


def _rag_result():
    return types.SimpleNamespace(
        answer="def login(): ...",
        format="python",
        sources=[_hit()],
    )


fake = FakeRAGService()


@pytest.fixture(autouse=True)
def _use_fake_rag_service():
    fake.result = _rag_result()
    fake.error = None
    fake.last_query = None
    fake.last_repository = None
    fake.last_top_k = None
    app.dependency_overrides[get_rag_service] = lambda: fake
    yield
    app.dependency_overrides.clear()


class TestRAGAPI:
    def test_rag_api_returns_answer_and_sources(self):
        response = client.post(
            "/api/v1/rag", json={"query": "how does login work?"}
        )
        assert response.status_code == 200
        body = response.json()
        assert body["query"] == "how does login work?"
        assert body["answer"] == "def login(): ..."
        assert body["format"] == "python"
        assert len(body["sources"]) == 1
        assert body["sources"][0] == {
            "file_path": "src/auth.py",
            "language": "Python",
            "chunk_index": 0,
            "start_line": 1,
            "end_line": 10,
            "score": 0.95,
        }
        assert "repository" not in body["sources"][0]
        assert "content" not in body["sources"][0]
        assert fake.last_query == "how does login work?"
        assert fake.last_repository is None
        assert fake.last_top_k == 5

    def test_rag_api_passes_top_k_and_repository(self):
        response = client.post(
            "/api/v1/rag",
            json={"query": "auth", "top_k": 3, "repository": "octocat/Hello-World"},
        )
        assert response.status_code == 200
        assert fake.last_top_k == 3
        assert fake.last_repository == "octocat/Hello-World"

    def test_rag_api_rejects_empty_query(self):
        response = client.post("/api/v1/rag", json={"query": "   "})
        assert response.status_code == 422

    def test_rag_api_rejects_invalid_top_k(self):
        for value in (0, 101, -5):
            response = client.post(
                "/api/v1/rag", json={"query": "auth", "top_k": value}
            )
            assert response.status_code == 422

    def test_rag_api_empty_context_returns_404(self):
        fake.error = RAGEmptyContextError(
            "No relevant code snippets were found for your query."
        )
        response = client.post("/api/v1/rag", json={"query": "auth"})
        assert response.status_code == 404
        assert response.json() == {
            "detail": "No relevant code snippets were found for your query."
        }

    def test_rag_api_llm_failure_returns_504(self):
        fake.error = LLMProviderTimeoutError("timed out")
        response = client.post("/api/v1/rag", json={"query": "auth"})
        assert response.status_code == 504
        assert "XAI_API_KEY" not in response.text
