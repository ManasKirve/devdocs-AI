"""Lightweight logical boundary detection for supported content types.

Blocks are returned as 0-based, half-open line ranges (start, end) over the
source line list. Returns None when no reliable logical boundaries could be
found so the caller can fall back to size-based splitting.
"""

import re

HEADING_RE = re.compile(r"^#{1,6}\s+\S")
YAML_KEY_RE = re.compile(r"^[^ \t#\-][^:]*:")
XML_ELEMENT_RE = re.compile(r"^<(?![/?!])[A-Za-z_]")
TOP_LEVEL_DECL_RE = re.compile(r"^(?:async\s+def|def|class|module)\b")
DECORATOR_RE = re.compile(r"^@\S")
BRACE_DECL_RE = re.compile(
    r"^\s*(?:(?:export|default|async|public|private|protected|internal|open|"
    r"final|sealed|abstract|override|static|synchronized|native|data)\s+)*"
    r"(?:class|interface|struct|enum|trait|impl|type|func|function|fun|def|fn|"
    r"protocol|extension|module|namespace|import|package|using|record|object|"
    r"const|let|var|mod|use|deinit|init)\b"
)
CONTROL_FLOW_RE = re.compile(
    r"^\s*(?:if|else|for|while|switch|do|try|catch|finally|match|case)\b"
)

_BRACE_LANGUAGES = {
    "javascript",
    "jsx",
    "typescript",
    "tsx",
    "java",
    "c",
    "cpp",
    "go",
    "rust",
    "php",
    "swift",
    "kotlin",
}
_SIGNATURE_LANGUAGES = {"c", "cpp", "go", "rust"}
_LANGUAGE_ALIASES = {"c++": "cpp"}


def logical_blocks(lines: list[str], language: str | None) -> list[tuple[int, int]] | None:
    """Return logical line-range blocks for the given language, or None."""
    lang = _LANGUAGE_ALIASES.get((language or "").lower(), (language or "").lower())

    if lang in ("python", "ruby"):
        return _python_blocks(lines)
    if lang in _BRACE_LANGUAGES:
        return _brace_blocks(lines, lang)
    if lang in ("markdown", "mdx"):
        return _markdown_blocks(lines)
    if lang == "text":
        return _paragraph_blocks(lines)
    if lang == "json":
        return _json_blocks(lines)
    if lang == "yaml":
        return _yaml_blocks(lines)
    if lang == "xml":
        return _xml_blocks(lines)
    return None


def paragraph_blocks(lines: list[str]) -> list[tuple[int, int]] | None:
    """Split a line list into blank-line-separated paragraph ranges."""
    ranges: list[tuple[int, int]] = []
    start = None
    for i, line in enumerate(lines):
        if line.strip():
            if start is None:
                start = i
        elif start is not None:
            ranges.append((start, i))
            start = None
    if start is not None:
        ranges.append((start, len(lines)))
    return ranges or None


def _python_blocks(lines: list[str]) -> list[tuple[int, int]] | None:
    boundaries: list[int] = []
    n = len(lines)
    i = 0
    while i < n:
        if TOP_LEVEL_DECL_RE.match(lines[i]):
            start = i
            while start > 0 and DECORATOR_RE.match(lines[start - 1]):
                start -= 1
            boundaries.append(start)
        i += 1
    return _ranges_from_boundaries(boundaries, n)


def _brace_blocks(
    lines: list[str], language: str
) -> list[tuple[int, int]] | None:
    boundaries: list[int] = []
    depth = 0
    for i, line in enumerate(lines):
        if depth == 0 and _is_declaration_line(line, language):
            boundaries.append(i)
        depth += line.count("{") - line.count("}")
        if depth < 0:
            depth = 0
    return _ranges_from_boundaries(boundaries, len(lines))


def _is_declaration_line(line: str, language: str) -> bool:
    if BRACE_DECL_RE.match(line):
        return True
    if language in _SIGNATURE_LANGUAGES:
        stripped = line.strip()
        if (
            stripped.endswith("{")
            and not CONTROL_FLOW_RE.match(line)
            and stripped not in ("{", "};")
        ):
            return True
    return False


def _markdown_blocks(lines: list[str]) -> list[tuple[int, int]] | None:
    boundaries = [i for i, line in enumerate(lines) if HEADING_RE.match(line)]
    if not boundaries:
        return paragraph_blocks(lines)
    return _ranges_from_boundaries(boundaries, len(lines))


def _json_blocks(lines: list[str]) -> list[tuple[int, int]] | None:
    boundaries: list[int] = []
    depth = 0
    for i, line in enumerate(lines):
        trimmed = line.strip()
        if depth == 1 and (
            trimmed.startswith("{")
            or trimmed.startswith("[")
            or (trimmed.startswith('"') and trimmed.rstrip().endswith(":"))
        ):
            boundaries.append(i)
        depth += line.count("{") + line.count("[") - line.count("}") - line.count("]")
        if depth < 0:
            depth = 0
    return _ranges_from_boundaries(boundaries, len(lines))


def _yaml_blocks(lines: list[str]) -> list[tuple[int, int]] | None:
    boundaries = [
        i
        for i, line in enumerate(lines)
        if YAML_KEY_RE.match(line) or line.strip() == "---"
    ]
    return _ranges_from_boundaries(boundaries, len(lines))


def _xml_blocks(lines: list[str]) -> list[tuple[int, int]] | None:
    boundaries = [i for i, line in enumerate(lines) if XML_ELEMENT_RE.match(line)]
    return _ranges_from_boundaries(boundaries, len(lines))


def _ranges_from_boundaries(
    boundaries: list[int], total_lines: int
) -> list[tuple[int, int]] | None:
    if not boundaries:
        return None
    ranges: list[tuple[int, int]] = []
    start = 0
    for boundary in boundaries:
        if boundary > start:
            ranges.append((start, boundary))
        start = boundary
    if start < total_lines:
        ranges.append((start, total_lines))
    return ranges
