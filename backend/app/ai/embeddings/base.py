from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):
    """Abstraction over a provider that turns text into vector embeddings."""

    @abstractmethod
    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Return one embedding vector per input text, in the same order."""
        raise NotImplementedError
