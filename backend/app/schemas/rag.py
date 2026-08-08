from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.search import QueryText


class RAGRequest(BaseModel):
    query: QueryText
    top_k: int = Field(default=5, ge=1, le=100)
    repository: Optional[str] = None


class RAGSource(BaseModel):
    file_path: str
    language: str
    chunk_index: int
    start_line: int
    end_line: int
    score: float


class RAGResponse(BaseModel):
    query: str
    answer: str
    format: str = "text"
    sources: list[RAGSource] = Field(default_factory=list)
