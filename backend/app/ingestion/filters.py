from pathlib import Path

MAX_FILE_SIZE = 512 * 1024
MAX_FILES_PROCESSED = 100
MAX_TREE_ENTRIES = 5000

SUPPORTED_EXTENSIONS = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".go",
    ".rs",
    ".php",
    ".rb",
    ".swift",
    ".kt",
    ".css",
    ".scss",
    ".html",
    ".json",
    ".yaml",
    ".yml",
    ".xml",
    ".md",
    ".mdx",
    ".txt",
    ".sql",
    ".sh",
}

EXTENSION_LANGUAGES = {
    ".py": "Python",
    ".js": "JavaScript",
    ".jsx": "JSX",
    ".ts": "TypeScript",
    ".tsx": "TSX",
    ".java": "Java",
    ".c": "C",
    ".cpp": "C++",
    ".h": "C",
    ".hpp": "C++",
    ".go": "Go",
    ".rs": "Rust",
    ".php": "PHP",
    ".rb": "Ruby",
    ".swift": "Swift",
    ".kt": "Kotlin",
    ".css": "CSS",
    ".scss": "SCSS",
    ".html": "HTML",
    ".json": "JSON",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".xml": "XML",
    ".md": "Markdown",
    ".mdx": "MDX",
    ".txt": "Text",
    ".sql": "SQL",
    ".sh": "Shell",
}

IGNORED_DIRECTORIES = {
    ".git",
    "node_modules",
    "venv",
    ".venv",
    "__pycache__",
    "dist",
    "build",
    "coverage",
    ".next",
    ".cache",
}

IGNORED_FILES = {
    ".env",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
}

# Binary extensions that are never indexed. Anything not in
# SUPPORTED_EXTENSIONS is skipped anyway; this set documents the intent.
IGNORED_BINARY_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".pdf",
    ".zip",
    ".tar",
    ".gz",
    ".mp4",
    ".mp3",
    ".exe",
    ".dll",
    ".so",
    ".class",
    ".jar",
}


def _is_env_variant(name: str) -> bool:
    return name == ".env" or name.startswith(".env.")


def should_index_file(file_path: str, size: int) -> bool:
    """Return True when the given repository-relative file should be indexed."""
    path = file_path.replace("\\", "/").strip("/")
    if not path:
        return False

    parts = path.split("/")
    file_name = parts[-1]

    if any(part in IGNORED_DIRECTORIES for part in parts[:-1]):
        return False

    if file_name in IGNORED_FILES or _is_env_variant(file_name):
        return False

    extension = Path(file_name).suffix.lower()
    if extension not in SUPPORTED_EXTENSIONS:
        return False

    if size < 0 or size > MAX_FILE_SIZE:
        return False

    return True


def detect_language(file_name: str) -> str:
    extension = Path(file_name).suffix.lower()
    return EXTENSION_LANGUAGES.get(extension, "Text")
