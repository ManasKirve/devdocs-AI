from typing import Optional

import httpx

from app.ai.embeddings.base import EmbeddingProvider
from app.ai.embeddings.errors import (
    EmbeddingAuthenticationError,
    EmbeddingConfigurationError,
    EmbeddingRateLimitError,
    EmbeddingRequestError,
    EmbeddingResponseError,
    EmbeddingTimeoutError,
)

DEFAULT_BASE_URL = "https://api.x.ai/v1"


class XAIEmbeddingProvider(EmbeddingProvider):
    """xAI embeddings provider backed by POST /v1/embeddings."""

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
            raise EmbeddingConfigurationError("XAI_API_KEY is not configured")
        self._api_key = api_key
        self._model = model
        self._base_url = base_url.rstrip("/")
        self._timeout = httpx.Timeout(timeout_seconds)
        self._transport = transport

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        payload = {"model": self._model, "input": texts}
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(
                base_url=self._base_url,
                headers=headers,
                timeout=self._timeout,
                transport=self._transport,
            ) as client:
                response = await client.post("/embeddings", json=payload)
                response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise EmbeddingTimeoutError("The embedding request timed out.") from exc
        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            if status_code in (401, 403):
                raise EmbeddingAuthenticationError(
                    "The embedding provider rejected the API credentials."
                ) from exc
            if status_code == 429:
                raise EmbeddingRateLimitError(
                    "The embedding provider rate limit was exceeded."
                ) from exc
            raise EmbeddingRequestError(
                f"The embedding request failed with status {status_code}."
            ) from exc
        except httpx.HTTPError as exc:
            raise EmbeddingRequestError("The embedding request failed.") from exc

        try:
            body = response.json()
            data = body.get("data")
            if not isinstance(data, list) or len(data) != len(texts):
                raise EmbeddingResponseError(
                    "The embedding provider returned an unexpected response."
                )
            embeddings: list[list[float]] = []
            for item in data:
                vector = item.get("embedding")
                if not isinstance(vector, list):
                    raise EmbeddingResponseError(
                        "The embedding provider returned an unexpected response."
                    )
                embeddings.append([float(value) for value in vector])
        except EmbeddingResponseError:
            raise
        except (AttributeError, TypeError, ValueError) as exc:
            raise EmbeddingResponseError(
                "The embedding provider returned an invalid response."
            ) from exc

        return embeddings
