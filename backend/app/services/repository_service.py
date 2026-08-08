import logging

from app.ai.embeddings.models import EmbeddingResult
from app.ai.embeddings.xai import XAIEmbeddingProvider
from app.ai.rag.models import VectorStoreItem
from app.ai.rag.store import InMemoryVectorStore, vector_store as default_vector_store
from app.core.config import get_settings
from app.ingestion.chunking.models import Chunk
from app.ingestion.chunking.service import ChunkingService
from app.ingestion.documents import Document, content_preview, create_document
from app.ingestion.errors import (
    GitHubAPIError,
    GitHubNetworkError,
    GitHubRateLimitError,
    RepositoryEmptyError,
    RepositoryNotFoundError,
)
from app.ingestion.filters import MAX_FILES_PROCESSED, should_index_file
from app.ingestion.github import GitHubClient, parse_repository_url
from app.ingestion.store import InMemoryDocumentStore, document_store
from app.schemas.repositories import DocumentResponse, IngestResponse
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger("devdocs_ai")


def _default_embedder() -> EmbeddingService:
    settings = get_settings()
    provider = XAIEmbeddingProvider(
        api_key=settings.xai_api_key,
        model=settings.xai_embedding_model,
        base_url=settings.xai_base_url,
        timeout_seconds=settings.xai_timeout_seconds,
    )
    return EmbeddingService(provider=provider)


class RepositoryIngestionService:
    """Orchestrates GitHub fetch -> files -> documents -> chunks -> embeddings."""

    def __init__(
        self,
        github: GitHubClient,
        *,
        store: InMemoryDocumentStore | None = None,
        chunker: ChunkingService | None = None,
        embedder: EmbeddingService | None = None,
        vector_store: InMemoryVectorStore | None = None,
    ) -> None:
        self._github = github
        self._store = store if store is not None else document_store
        self._chunker = chunker if chunker is not None else ChunkingService()
        self._embedder = embedder
        self._vector_store = (
            vector_store if vector_store is not None else default_vector_store
        )

    async def ingest(self, repository_url: str) -> IngestResponse:
        owner, repo = parse_repository_url(repository_url)
        repository = f"{owner}/{repo}"

        metadata = await self._github.get_repository(owner, repo)
        default_branch = metadata.get("default_branch") or "HEAD"

        tree = await self._github.get_tree(owner, repo, default_branch)
        if not tree:
            raise RepositoryEmptyError(
                "The repository is empty or contains no files."
            )

        documents: list[Document] = []
        files_processed = 0
        files_skipped = 0

        candidates = [
            entry
            for entry in tree
            if should_index_file(entry["path"], entry["size"])
        ]
        files_skipped += len(tree) - len(candidates)

        for entry in candidates:
            if files_processed >= MAX_FILES_PROCESSED:
                files_skipped += 1
                continue
            try:
                content = await self._github.get_file_content(
                    owner, repo, entry["path"], default_branch
                )
            except GitHubRateLimitError:
                raise
            except GitHubNetworkError:
                raise
            except (RepositoryNotFoundError, GitHubAPIError) as exc:
                logger.warning(
                    "Skipping file %s in %s: %s", entry["path"], repository, exc
                )
                files_skipped += 1
                continue

            documents.append(create_document(repository, entry["path"], content))
            files_processed += 1

        if files_processed == 0:
            raise RepositoryEmptyError(
                "The repository contains no indexable files."
            )

        chunks: list[Chunk] = []
        for document in documents:
            chunks.extend(self._chunker.chunk_document(document))

        embeddings: list[EmbeddingResult] = []
        if chunks:
            embedder = (
                self._embedder
                if self._embedder is not None
                else _default_embedder()
            )
            embeddings = await embedder.embed_chunks(chunks)

        self._store.save(repository, documents)
        self._store.save_chunks(repository, chunks)
        self._store.save_embeddings(repository, embeddings)
        if embeddings:
            self._vector_store.add(
                [
                    VectorStoreItem.from_embedding_result(result)
                    for result in embeddings
                ]
            )

        return IngestResponse(
            repository=repository,
            files_processed=files_processed,
            files_skipped=files_skipped,
            chunks_created=len(chunks),
            embeddings_created=len(embeddings),
            documents=[
                self._to_document_response(document) for document in documents
            ],
        )

    @staticmethod
    def _to_document_response(document: Document) -> DocumentResponse:
        return DocumentResponse(
            repository=document.repository,
            file_path=document.file_path,
            file_name=document.file_name,
            language=document.language,
            size=document.size,
            content_preview=content_preview(document.content),
        )
