from pydantic import BaseModel


class VectorStoreItem(BaseModel):
    """A chunk stored in the vector store together with its embedding."""

    repository: str
    file_path: str
    language: str
    chunk_index: int
    start_line: int
    end_line: int
    content: str
    embedding: list[float]

    @classmethod
    def from_embedding_result(cls, result) -> "VectorStoreItem":
        return cls(**result.model_dump())


class SearchHit(BaseModel):
    """A stored chunk together with its similarity score."""

    repository: str
    file_path: str
    language: str
    chunk_index: int
    start_line: int
    end_line: int
    content: str
    score: float
