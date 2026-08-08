from app.ingestion.documents import Document


class InMemoryDocumentStore:
    """Process-local store that keeps extracted documents in memory."""

    def __init__(self) -> None:
        self._documents: dict[str, list[Document]] = {}

    def save(self, repository: str, documents: list[Document]) -> None:
        self._documents[repository] = documents

    def get(self, repository: str) -> list[Document]:
        return self._documents.get(repository, [])

    def clear(self, repository: str) -> None:
        self._documents.pop(repository, None)

    def clear_all(self) -> None:
        self._documents.clear()


document_store = InMemoryDocumentStore()
