from typing import Optional

import httpx

from app.ai.llm.base import LLMProvider, LLMResponse
from app.ai.llm.errors import (
    LLMProviderAuthenticationError,
    LLMProviderConfigurationError,
    LLMProviderRequestError,
    LLMProviderResponseError,
    LLMProviderTimeoutError,
)

DEFAULT_BASE_URL = "https://api.x.ai/v1"


class GrokProvider(LLMProvider):
    def __init__(
        self,
        *,
        api_key: str,
        model: str,
        base_url: str = DEFAULT_BASE_URL,
        timeout_seconds: float = 60.0,
        transport: Optional[httpx.AsyncBaseTransport] = None,
    ) -> None:
        if not api_key:
            raise LLMProviderConfigurationError("XAI_API_KEY is not configured")
        self._api_key = api_key
        self._model = model
        self._base_url = base_url.rstrip("/")
        self._timeout = httpx.Timeout(timeout_seconds)
        self._transport = transport

    async def generate_response(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> LLMResponse:
        payload: dict = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
        }
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(
                timeout=self._timeout, transport=self._transport
            ) as client:
                response = await client.post(
                    f"{self._base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
        except httpx.TimeoutException as exc:
            raise LLMProviderTimeoutError("The xAI request timed out") from exc
        except httpx.HTTPError as exc:
            raise LLMProviderRequestError("The xAI request failed") from exc

        if response.status_code in (401, 403):
            raise LLMProviderAuthenticationError(
                "The xAI API rejected the provided credentials"
            )
        if response.status_code >= 400:
            raise LLMProviderRequestError(
                f"The xAI API returned an error status {response.status_code}"
            )

        return self._parse_response(response)

    @staticmethod
    def _parse_response(response: httpx.Response) -> LLMResponse:
        try:
            data = response.json()
            content = data["choices"][0]["message"].get("content")
        except (ValueError, KeyError, IndexError, TypeError) as exc:
            raise LLMProviderResponseError(
                "The xAI API returned an unexpected response"
            ) from exc
        if not isinstance(content, str):
            raise LLMProviderResponseError(
                "The xAI API returned an unexpected response"
            )
        return LLMResponse(
            content=content,
            model=str(data.get("model") or ""),
            provider="grok",
        )
