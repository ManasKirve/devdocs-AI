from math import sqrt

from app.ai.rag.errors import DimensionMismatchError, EmptyVectorError


def cosine_similarity(a: list[float], b: list[float]) -> float:
    if len(a) != len(b):
        raise DimensionMismatchError(
            f"Embedding dimension mismatch: {len(a)} vs {len(b)}."
        )
    if not a:
        raise EmptyVectorError("Embedding vectors must not be empty.")

    dot_product = sum(x * y for x, y in zip(a, b))
    magnitude_a = sqrt(sum(x * x for x in a))
    magnitude_b = sqrt(sum(y * y for y in b))

    if magnitude_a == 0.0 or magnitude_b == 0.0:
        return 0.0

    return dot_product / (magnitude_a * magnitude_b)
