import asyncio
import json

import httpx
import pytest

from app.ai.llm.errors import (
    LLMProviderAuthenticationError,
    LLMProviderConfigurationError,
    LLMProviderRequestError,
    LLMProviderResponseError,
)
from app.ai.llm.groq import GroqProvider


def _run(coro):
    return asyncio.run(coro)


def _provider(handler, api_key="test-api-key"):
    return GroqProvider(
        api_key=api_key,
        model="llama-3.3-70b-versatile",
        base_url="https://api.groq.com/openai/v1",
        transport=httpx.MockTransport(handler),
    )


def test_generate_response_returns_normalized_result():
    def handler(request: httpx.Request) -> httpx.Response:
        assert (
            str(request.url) == "https://api.groq.com/openai/v1/chat/completions"
        )
        assert request.headers["Authorization"] == "Bearer test-api-key"
        payload = json.loads(request.content)
        assert payload["model"] == "llama-3.3-70b-versatile"
        assert payload["messages"][0] == {"role": "system", "content": "Be helpful"}
        assert payload["messages"][1] == {"role": "user", "content": "Hello"}
        assert payload["temperature"] == 0.2
        assert payload["max_tokens"] == 256
        return httpx.Response(
            200,
            json={
                "id": "chatcmpl-test",
                "model": "llama-3.3-70b-versatile",
                "choices": [
                    {"index": 0, "message": {"role": "assistant", "content": "Hi there"}}
                ],
            },
        )

    provider = _provider(handler)
    result = _run(
        provider.generate_response(
            system_prompt="Be helpful",
            user_prompt="Hello",
            temperature=0.2,
            max_tokens=256,
        )
    )
    assert result.content == "Hi there"
    assert result.model == "llama-3.3-70b-versatile"
    assert result.provider == "groq"


def test_max_tokens_omitted_when_not_provided():
    def handler(request: httpx.Request) -> httpx.Response:
        payload = json.loads(request.content)
        assert "max_tokens" not in payload
        return httpx.Response(
            200,
            json={
                "model": "llama-3.3-70b-versatile",
                "choices": [
                    {"index": 0, "message": {"role": "assistant", "content": "ok"}}
                ],
            },
        )

    provider = _provider(handler)
    result = _run(provider.generate_response(system_prompt="s", user_prompt="u"))
    assert result.content == "ok"


def test_missing_api_key_raises_configuration_error():
    with pytest.raises(LLMProviderConfigurationError):
        GroqProvider(api_key="", model="llama-3.3-70b-versatile")


def test_invalid_api_key_raises_authentication_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, json={"error": {"message": "invalid api key"}})

    provider = _provider(handler)
    with pytest.raises(LLMProviderAuthenticationError):
        _run(provider.generate_response(system_prompt="s", user_prompt="u"))


def test_upstream_error_raises_request_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(429, json={"error": {"message": "rate limited"}})

    provider = _provider(handler)
    with pytest.raises(LLMProviderRequestError):
        _run(provider.generate_response(system_prompt="s", user_prompt="u"))


def test_malformed_response_raises_response_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"unexpected": "shape"})

    provider = _provider(handler)
    with pytest.raises(LLMProviderResponseError):
        _run(provider.generate_response(system_prompt="s", user_prompt="u"))


def test_non_json_response_raises_response_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=b"not json")

    provider = _provider(handler)
    with pytest.raises(LLMProviderResponseError):
        _run(provider.generate_response(system_prompt="s", user_prompt="u"))