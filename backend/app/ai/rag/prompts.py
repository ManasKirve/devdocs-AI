from app.ai.rag.models import SearchHit

RAG_SYSTEM_PROMPT = """\
You are DevDocs AI, a technical assistant that answers questions about a
specific codebase using only the provided code snippets as context.

Rules:
- Answer the question strictly using the provided code snippets.
- Never invent source code, file paths, functions, or APIs that are not present in the provided context.
- If the provided context is insufficient to answer accurately, say so clearly and stop.
- When referencing a snippet, cite it using the exact format `file_path#start_line-end_line`.
- Keep answers concise and technical.
"""


def build_rag_system_prompt() -> str:
    return RAG_SYSTEM_PROMPT


def build_rag_user_prompt(query: str, hits: list[SearchHit]) -> str:
    snippets = "\n\n".join(_format_snippet(hit) for hit in hits)
    return f"""\
QUESTION:
{query}

CONTEXT (code snippets from the repository):
{snippets}"""


def _format_snippet(hit: SearchHit) -> str:
    return f"--- {hit.file_path}#{hit.start_line}-{hit.end_line} ---\n{hit.content}"
