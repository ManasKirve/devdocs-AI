from abc import ABC, abstractmethod

from app.ai.rag.models import SearchHit, VectorStoreItem
from app.ai.rag.similarity import cosine_similarity


class VectorStore(ABC):
    @abstractmethod
    def add(self, items: list[VectorStoreItem]) -> None:
        raise NotImplementedError

    @abstractmethod
    def search(self, query_vector: list[float], *, repository: str) -> list[SearchHit]:
        raise NotImplementedError

    @abstractmethod
    def indexed_repositories(self) -> list[str]:
        raise NotImplementedError


class InMemoryVectorStore(VectorStore):
    """Process-local vector store using brute-force cosine similarity."""

    def __init__(self) -> None:
        self._repository_items: dict[str, list[VectorStoreItem]] = {}
        self._index_order: list[str] = []

    def add(self, items: list[VectorStoreItem]) -> None:
        if not items:
            return
        by_repository: dict[str, list[VectorStoreItem]] = {}
        for item in items:
            by_repository.setdefault(item.repository, []).append(item)
        for repository, repository_items in by_repository.items():
            if repository not in self._repository_items:
                self._index_order.append(repository)
            self._repository_items[repository] = repository_items

    def search(self, query_vector: list[float], *, repository: str) -> list[SearchHit]:
        items = self._repository_items.get(repository, [])
        hits = [
            SearchHit(
                repository=item.repository,
                file_path=item.file_path,
                language=item.language,
                chunk_index=item.chunk_index,
                start_line=item.start_line,
                end_line=item.end_line,
                content=item.content,
                score=cosine_similarity(query_vector, item.embedding),
            )
            for item in items
        ]
        hits.sort(key=lambda hit: hit.score, reverse=True)
        return hits

    def indexed_repositories(self) -> list[str]:
        return list(self._index_order)

    def count(self) -> int:
        return sum(len(items) for items in self._repository_items.values())

    def clear(self, repository: str) -> None:
        self._repository_items.pop(repository, None)

    def clear_all(self) -> None:
        self._repository_items.clear()
        self._index_order.clear()


vector_store = InMemoryVectorStore()
