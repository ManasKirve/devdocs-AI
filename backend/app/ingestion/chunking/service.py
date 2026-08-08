from app.ingestion.chunking.config import OVERLAP_CHARS, TARGET_CHARS
from app.ingestion.chunking.models import Chunk
from app.ingestion.chunking.splitters import logical_blocks, paragraph_blocks
from app.ingestion.documents import Document

_PARAGRAPH_LANGUAGES = {"markdown", "mdx", "text"}


def _size_of(lines: list[str], start: int, end: int) -> int:
    return sum(len(line) + 1 for line in lines[start:end])


class ChunkingService:
    """Splits documents into logical, size-bounded chunks with overlap."""

    def __init__(
        self,
        *,
        target_chars: int = TARGET_CHARS,
        overlap_chars: int = OVERLAP_CHARS,
    ) -> None:
        self._target_chars = target_chars
        self._overlap_chars = overlap_chars

    def chunk_document(self, document: Document) -> list[Chunk]:
        content = document.content
        if not content or not content.strip():
            return []

        lines = content.splitlines()
        if not lines:
            return []

        blocks = logical_blocks(lines, document.language)
        if not blocks:
            blocks = [(0, len(lines))]

        ranges = self._build_ranges(lines, blocks, document.language)

        return [
            Chunk(
                repository=document.repository,
                file_path=document.file_path,
                language=document.language,
                chunk_index=index,
                start_line=start + 1,
                end_line=end,
                content="\n".join(lines[start:end]),
            )
            for index, (start, end) in enumerate(ranges)
        ]

    def _build_ranges(
        self,
        lines: list[str],
        blocks: list[tuple[int, int]],
        language: str | None,
    ) -> list[tuple[int, int]]:
        expanded: list[tuple[int, int]] = []
        for start, end in blocks:
            if _size_of(lines, start, end) <= self._target_chars:
                expanded.append((start, end))
                continue

            sub_blocks = self._sub_blocks(lines, start, end, language)
            if not sub_blocks:
                expanded.extend(self._fallback_split(lines, start, end))
                continue

            for sub_start, sub_end in sub_blocks:
                if _size_of(lines, sub_start, sub_end) <= self._target_chars:
                    expanded.append((sub_start, sub_end))
                else:
                    expanded.extend(self._fallback_split(lines, sub_start, sub_end))

        return self._pack(lines, expanded)

    def _sub_blocks(
        self,
        lines: list[str],
        start: int,
        end: int,
        language: str | None,
    ) -> list[tuple[int, int]] | None:
        if (language or "").lower() not in _PARAGRAPH_LANGUAGES:
            return None
        blocks = paragraph_blocks(lines[start:end])
        if not blocks:
            return None
        return [(start + s, start + e) for s, e in blocks]

    def _fallback_split(
        self,
        lines: list[str],
        start: int,
        end: int,
    ) -> list[tuple[int, int]]:
        ranges: list[tuple[int, int]] = []
        i = start
        while i < end:
            j = i
            chars = 0
            while j < end and chars + len(lines[j]) + 1 <= self._target_chars:
                chars += len(lines[j]) + 1
                j += 1
            if j == i:
                j = i + 1

            ranges.append((i, j))
            if j >= end:
                break

            k = j
            overlap = 0
            while k > i and overlap < self._overlap_chars:
                k -= 1
                overlap += len(lines[k]) + 1
            i = max(i + 1, k)
        return ranges

    def _pack(
        self,
        lines: list[str],
        blocks: list[tuple[int, int]],
    ) -> list[tuple[int, int]]:
        ranges: list[tuple[int, int]] = []
        current_start: int | None = None
        current_end: int | None = None
        current_chars = 0

        for start, end in blocks:
            chars = _size_of(lines, start, end)
            if (
                current_start is not None
                and current_chars + chars > self._target_chars
            ):
                ranges.append((current_start, current_end))
                current_start, current_end, current_chars = start, end, chars
            else:
                if current_start is None:
                    current_start = start
                current_end = end
                current_chars += chars

        if current_start is not None:
            ranges.append((current_start, current_end))
        return ranges
