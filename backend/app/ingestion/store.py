from app.ingestion.chunking.models import Chunk
from app.ingestion.documents import Document


class InMemoryDocumentStore:
    """Process-local store that keeps extracted documents in memory."""

    def __init__(self) -> None:
        self._documents: dict[str, list[Document]] = {}
        self._chunks: dict[str, list[Chunk]] = {}

    def save(self, repository: str, documents: list[Document]) -> None:
        self._documents[repository] = documents

    def get(self, repository: str) -> list[Document]:
        return self._documents.get(repository, [])

    def save_chunks(self, repository: str, chunks: list[Chunk]) -> None:
        self._chunks[repository] = chunks

    def get_chunks(self, repository: str) -> list[Chunk]:
        return self._chunks.get(repository, [])

    def clear(self, repository: str) -> None:
        self._documents.pop(repository, None)
        self._chunks.pop(repository, None)

    def clear_all(self) -> None:
        self._documents.clear()
        self._chunks.clear()


document_store = InMemoryDocumentStore()
