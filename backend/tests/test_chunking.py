from app.ingestion.chunking.config import TARGET_CHARS
from app.ingestion.chunking.service import ChunkingService
from app.ingestion.documents import Document


def _document(
    content,
    *,
    repository="octocat/Hello-World",
    file_path="src/app.py",
    language="Python",
):
    return Document(
        repository=repository,
        file_path=file_path,
        file_name=file_path.rsplit("/", 1)[-1],
        language=language,
        content=content,
        size=len(content.encode("utf-8")),
    )


chunker = ChunkingService()


def test_small_file_produces_single_chunk():
    content = "line one\nline two\nline three\n"
    chunks = chunker.chunk_document(_document(content))
    assert len(chunks) == 1
    assert chunks[0].chunk_index == 0
    assert chunks[0].start_line == 1
    assert chunks[0].end_line == 3
    assert chunks[0].content == "line one\nline two\nline three"


def test_large_file_produces_multiple_chunks():
    lines = [f"line {i} " + "x" * 60 for i in range(300)]
    content = "\n".join(lines)
    chunks = chunker.chunk_document(
        _document(content, language="CSS", file_path="styles.css")
    )
    assert len(chunks) > 1
    assert [c.chunk_index for c in chunks] == list(range(len(chunks)))
    assert chunks[0].start_line == 1
    assert chunks[-1].end_line == len(lines)
    for chunk in chunks:
        assert chunk.start_line <= chunk.end_line
        assert len(chunk.content) <= TARGET_CHARS + 70


def _python_source():
    header = '"""Module docstring."""\n\nimport os\nimport sys\n\n'
    functions = []
    for i in range(20):
        functions.append(
            f"def process_{i}(items, config=None):\n"
            f'    """Handle items for worker {i}."""\n'
            f"    results = []\n"
            f"    for index, item in enumerate(items):\n"
            f"        if config and config.get('enabled', False):\n"
            f"            results.append((index, item, {i}))\n"
            f"        else:\n"
            f"            results.append((index, item))\n"
            f"    return results\n"
        )
    return header + "\n".join(functions)


def test_python_source_preserves_top_level_declarations():
    content = _python_source()
    lines = content.splitlines()
    chunks = chunker.chunk_document(_document(content))
    assert len(chunks) >= 2
    assert chunks[0].start_line == 1
    assert [c.chunk_index for c in chunks] == list(range(len(chunks)))
    for chunk in chunks[1:]:
        assert lines[chunk.start_line - 1].startswith("def ")


def _typescript_source():
    parts = [
        "interface Config {",
        "  enabled: boolean;",
        "  retries: number;",
        "}",
        "",
        "const DEFAULT_CONFIG: Config = {",
        "  enabled: true,",
        "  retries: 3,",
        "};",
        "",
    ]
    functions = []
    for i in range(20):
        functions.append(
            f"export function handle_{i}("
            f"input: string, options: Record<string, unknown>): string {{\n"
            f"  const normalized = input.trim().toLowerCase();\n"
            f"  const prefix = options['prefix'] ?? 'item';\n"
            f"  if (normalized.length === 0) return '';\n"
            f"  return `${{prefix}}-{{normalized}}-{i}`;\n"
            f"}}\n"
        )
    return "\n".join(parts) + "\n" + "\n".join(functions)


def test_typescript_source_preserves_declarations():
    content = _typescript_source()
    lines = content.splitlines()
    chunks = chunker.chunk_document(
        _document(content, language="TypeScript", file_path="src/handlers.ts")
    )
    assert len(chunks) >= 2
    assert chunks[0].start_line == 1
    for chunk in chunks[1:]:
        assert lines[chunk.start_line - 1].startswith("export function ")


def _markdown_source():
    sections = []
    for i in range(6):
        paragraphs = "\n\n".join(
            f"Content paragraph {j} of section {i}. This sentence is filler text."
            for j in range(18)
        )
        sections.append(f"## Section {i}\n\n{paragraphs}")
    return "\n\n".join(sections)


def test_markdown_splits_by_sections():
    content = _markdown_source()
    chunks = chunker.chunk_document(
        _document(content, language="Markdown", file_path="README.md")
    )
    assert len(chunks) >= 2
    assert chunks[0].start_line == 1
    for chunk in chunks:
        assert chunk.content.startswith("## Section ")


def test_chunk_ordering_is_sequential():
    lines = [f"line {i} " + "y" * 80 for i in range(200)]
    content = "\n".join(lines)
    chunks = chunker.chunk_document(
        _document(content, language="CSS", file_path="styles.css")
    )
    assert len(chunks) >= 2
    assert [c.chunk_index for c in chunks] == list(range(len(chunks)))
    for prev, nxt in zip(chunks, chunks[1:]):
        assert nxt.start_line > prev.start_line
        assert nxt.end_line > prev.end_line


def test_line_numbers_are_tracked_correctly():
    content = "def a():\n    pass\n\n\ndef b():\n    return 1\n"
    lines = content.splitlines()
    chunks = chunker.chunk_document(_document(content))
    assert len(chunks) == 1
    assert chunks[0].start_line == 1
    assert chunks[0].end_line == len(lines)


def test_chunk_metadata_is_preserved():
    doc = _document(
        "def f():\n    pass\n",
        repository="acme/widgets",
        file_path="src/module.py",
        language="Python",
    )
    chunks = chunker.chunk_document(doc)
    assert len(chunks) == 1
    chunk = chunks[0]
    assert chunk.repository == "acme/widgets"
    assert chunk.file_path == "src/module.py"
    assert chunk.language == "Python"
    assert chunk.chunk_index == 0
    assert chunk.start_line == 1
    assert chunk.end_line == 2
    assert chunk.content == "def f():\n    pass"


def test_fallback_overlap_between_chunks():
    lines = [f"line {i} " + "z" * 60 for i in range(200)]
    content = "\n".join(lines)
    chunks = chunker.chunk_document(
        _document(content, language="CSS", file_path="styles.css")
    )
    assert len(chunks) >= 2
    for prev, nxt in zip(chunks, chunks[1:]):
        assert nxt.start_line <= prev.end_line
        overlap_lines = prev.end_line - nxt.start_line + 1
        assert overlap_lines >= 1
        prev_tail = prev.content.splitlines()[-overlap_lines:]
        nxt_head = nxt.content.splitlines()[:overlap_lines]
        assert prev_tail == nxt_head


def test_empty_document_produces_no_chunks():
    assert chunker.chunk_document(_document("")) == []
    assert chunker.chunk_document(_document("\n\n  \n")) == []
