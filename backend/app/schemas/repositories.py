from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints

RepositoryURL = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=2048),
]


class IngestRequest(BaseModel):
    repository_url: RepositoryURL


class DocumentResponse(BaseModel):
    repository: str
    file_path: str
    file_name: str
    language: str
    size: int
    content_preview: str


class IngestResponse(BaseModel):
    repository: str
    files_processed: int
    files_skipped: int
    chunks_created: int = 0
    documents: list[DocumentResponse] = Field(default_factory=list)
