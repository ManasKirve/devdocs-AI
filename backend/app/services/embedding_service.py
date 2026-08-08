from app.ai.embeddings.base import EmbeddingProvider
from app.ai.embeddings.errors import EmbeddingResponseError
from app.ai.embeddings.models import EmbeddingResult
from app.ingestion.chunking.models import Chunk

DEFAULT_BATCH_SIZE = 16


class EmbeddingService:
    """Accepts chunks, batches them, and returns EmbeddingResults."""

    def __init__(
        self,
        provider: EmbeddingProvider,
        *,
        batch_size: int = DEFAULT_BATCH_SIZE,
    ) -> None:
        if batch_size < 1:
            raise ValueError("batch_size must be >= 1")
        self._provider = provider
        self._batch_size = batch_size

    async def embed_chunks(self, chunks: list[Chunk]) -> list[EmbeddingResult]:
        if not chunks:
            return []

        results: list[EmbeddingResult] = []
        for start in range(0, len(chunks), self._batch_size):
            batch = chunks[start : start + self._batch_size]
            vectors = await self._provider.embed_texts(
                [chunk.content for chunk in batch]
            )
            if len(vectors) != len(batch):
                raise EmbeddingResponseError(
                    "The embedding provider returned a mismatched number of embeddings."
                )
            results.extend(
                EmbeddingResult(
                    repository=chunk.repository,
                    file_path=chunk.file_path,
                    language=chunk.language,
                    chunk_index=chunk.chunk_index,
                    start_line=chunk.start_line,
                    end_line=chunk.end_line,
                    content=chunk.content,
                    embedding=vector,
                )
                for chunk, vector in zip(batch, vectors)
            )
        return results
