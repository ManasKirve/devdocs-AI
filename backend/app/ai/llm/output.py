import re

_CODE_FENCE_PATTERN = re.compile(
    r"^```([A-Za-z0-9_+#.-]*)[ \t]*\r?\n(.*?)^```[ \t]*\r?$",
    re.DOTALL | re.MULTILINE,
)


def extract_content(text: str) -> tuple[str, str]:
    """Extract the last fenced code block from an LLM response.

    Returns a ``(content, format)`` tuple. The format is the fence language
    label (lowercased) or ``"text"`` when the response has no fenced block.
    Fences and surrounding whitespace are stripped while the block's inner
    indentation is preserved.
    """
    stripped = text.strip()
    if not stripped:
        return "", "text"

    matches = list(_CODE_FENCE_PATTERN.finditer(stripped))
    if not matches:
        return stripped, "text"

    match = matches[-1]
    language = match.group(1).strip().lower() or "text"
    return match.group(2).strip(), language
