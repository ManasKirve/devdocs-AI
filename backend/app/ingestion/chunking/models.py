from pydantic import BaseModel


class Chunk(BaseModel):
    """A contiguous slice of a document produced by the chunking service."""

    repository: str
    file_path: str
    language: str
    chunk_index: int
    start_line: int
    end_line: int
    content: str
