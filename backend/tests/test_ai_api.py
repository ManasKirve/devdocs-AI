import types

import pytest
from fastapi.testclient import TestClient

from app.ai.llm.errors import (
    LLMProviderAuthenticationError,
    LLMProviderConfigurationError,
    LLMProviderRequestError,
    LLMProviderResponseError,
    LLMProviderTimeoutError,
)
from app.api.dependencies.ai import get_ai_service
from app.main import app


class FakeAIService:
    def __init__(self) -> None:
        self.last_prompt = None
        self.last_temperature = None

    async def generate_response(self, prompt, *, temperature=0.7, max_tokens=None):
        self.last_prompt = prompt
        self.last_temperature = temperature
        return types.SimpleNamespace(content=f"Echo: {prompt}")


class RaisingAIService:
    def __init__(self, error) -> None:
        self.error = error

    async def generate_response(self, prompt, *, temperature=0.7, max_tokens=None):
        raise self.error


fake = FakeAIService()
client = TestClient(app)


@pytest.fixture(autouse=True)
def _use_fake_service():
    app.dependency_overrides[get_ai_service] = lambda: fake
    yield
    app.dependency_overrides.clear()


def test_generate_endpoint_returns_response():
    response = client.post(
        "/api/v1/ai/generate", json={"prompt": "Explain FastAPI dependency injection"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body == {"response": "Echo: Explain FastAPI dependency injection"}
    assert fake.last_prompt == "Explain FastAPI dependency injection"
    assert fake.last_temperature == 0.7


def test_generate_endpoint_accepts_optional_parameters():
    response = client.post(
        "/api/v1/ai/generate",
        json={"prompt": "Hi", "temperature": 0.3, "max_tokens": 512},
    )
    assert response.status_code == 200
    assert fake.last_temperature == 0.3


def test_generate_endpoint_rejects_empty_prompt():
    response = client.post("/api/v1/ai/generate", json={"prompt": ""})
    assert response.status_code == 422


def test_generate_endpoint_rejects_invalid_temperature():
    response = client.post(
        "/api/v1/ai/generate", json={"prompt": "Hi", "temperature": 3.0}
    )
    assert response.status_code == 422


@pytest.mark.parametrize(
    "error,status_code",
    [
        (LLMProviderConfigurationError("not configured"), 503),
        (LLMProviderAuthenticationError("bad credentials"), 502),
        (LLMProviderRequestError("upstream failure"), 502),
        (LLMProviderTimeoutError("timed out"), 504),
        (LLMProviderResponseError("malformed"), 502),
    ],
)
def test_provider_errors_map_to_clean_api_responses(error, status_code):
    app.dependency_overrides[get_ai_service] = lambda: RaisingAIService(error)
    response = client.post("/api/v1/ai/generate", json={"prompt": "Hi"})
    assert response.status_code == status_code
    assert "XAI_API_KEY" not in response.text
    assert "Bearer" not in response.text
