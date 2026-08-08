from pydantic import BaseModel

from app.ingestion.filters import detect_language

CONTENT_PREVIEW_LENGTH = 2000


class Document(BaseModel):
    """A single indexed file kept in memory."""

    repository: str
    file_path: str
    file_name: str
    language: str
    content: str
    size: int


def create_document(repository: str, file_path: str, content: str) -> Document:
    """Build an in-memory Document for a repository file."""
    file_name = file_path.rsplit("/", 1)[-1]
    return Document(
        repository=repository,
        file_path=file_path,
        file_name=file_name,
        language=detect_language(file_name),
        content=content,
        size=len(content.encode("utf-8")),
    )


def content_preview(content: str) -> str:
    """Return a limited preview of a document's content."""
    if len(content) <= CONTENT_PREVIEW_LENGTH:
        return content
    return content[:CONTENT_PREVIEW_LENGTH] + "\n... (preview truncated)"
