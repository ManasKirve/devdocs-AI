from pydantic import BaseModel


class EmbeddingResult(BaseModel):
    """A chunk together with its vector embedding."""

    repository: str
    file_path: str
    language: str
    chunk_index: int
    start_line: int
    end_line: int
    content: str
    embedding: list[float]
