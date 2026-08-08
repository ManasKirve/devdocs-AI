from typing import Annotated, Optional

from pydantic import BaseModel, Field, StringConstraints

QueryText = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=2048),
]


class SearchRequest(BaseModel):
    query: QueryText
    top_k: int = Field(default=5, ge=1, le=100)
    repository: Optional[str] = None


class SearchResultItem(BaseModel):
    file_path: str
    language: str
    chunk_index: int
    start_line: int
    end_line: int
    content: str
    score: float


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem] = Field(default_factory=list)
