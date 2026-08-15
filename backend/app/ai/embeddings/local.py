import asyncio
import logging
from functools import lru_cache

from app.ai.embeddings.base import EmbeddingProvider
from app.ai.embeddings.errors import (
    EmbeddingConfigurationError,
    EmbeddingRequestError,
    EmbeddingResponseError,
)

logger = logging.getLogger("devdocs_ai")

DEFAULT_MODEL = "BAAI/bge-small-en-v1.5"
DEFAULT_DIMENSION = 384


@lru_cache(maxsize=1)
def _load_model(model_name: str):
    """Load and cache the local ONNX embedding model for this process.

    The first call downloads the model from Hugging Face and caches it on
    disk; subsequent calls reuse the in-memory ONNX Runtime session.
    """
    from fastembed import TextEmbedding

    return TextEmbedding(model_name=model_name)


def _embed(model, texts: list[str]) -> list[list[float]]:
    return [[float(value) for value in vector] for vector in model.embed(texts)]


class LocalEmbeddingProvider(EmbeddingProvider):
    """Runs a small sentence-transformer model locally on the CPU.

    Free, open-source, and API-key-free. Uses FastEmbed (ONNX Runtime) so
    no GPU and no heavy PyTorch stack are required.
    """

    def __init__(self, *, model: str = DEFAULT_MODEL) -> None:
        if not model or not model.strip():
            raise EmbeddingConfigurationError(
                "The local embedding model is not configured."
            )
        self._model = model

    @property
    def model(self) -> str:
        return self._model

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        try:
            model = await asyncio.to_thread(_load_model, self._model)
        except Exception as exc:
            logger.exception(
                "Failed to load the local embedding model %s", self._model
            )
            raise EmbeddingConfigurationError(
                "The local embedding model could not be loaded."
            ) from exc

        try:
            vectors = await asyncio.to_thread(_embed, model, texts)
        except Exception as exc:
            logger.exception(
                "Local embedding inference failed for model %s", self._model
            )
            raise EmbeddingRequestError(
                "The local embedding model failed to generate embeddings."
            ) from exc

        if len(vectors) != len(texts):
            raise EmbeddingResponseError(
                "The embedding provider returned a mismatched number of embeddings."
            )
        for vector in vectors:
            if not vector:
                raise EmbeddingResponseError(
                    "The embedding provider returned an empty vector."
                )

        return vectors