import base64
import re
from urllib.parse import quote, urlsplit

import httpx

from app.ingestion.errors import (
    GitHubAPIError,
    GitHubNetworkError,
    GitHubRateLimitError,
    InvalidRepositoryURLError,
    RepositoryNotFoundError,
)

_GITHUB_HOSTS = {"github.com", "www.github.com"}
_GITHUB_SSH_PATTERN = re.compile(r"^(?:[^@]+@)?github\.com:(.+)$")
_SEGMENT_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+$")

MAX_TREE_ENTRIES = 5000


def parse_repository_url(url: str) -> tuple[str, str]:
    """Return (owner, repo) for a GitHub repository URL or raise an error."""
    if not url or not isinstance(url, str):
        raise InvalidRepositoryURLError("A GitHub repository URL is required.")

    url = url.strip()
    if not url:
        raise InvalidRepositoryURLError("A GitHub repository URL is required.")

    ssh_match = _GITHUB_SSH_PATTERN.match(url)
    if ssh_match:
        path = ssh_match.group(1)
    else:
        if "://" not in url:
            url = f"https://{url}"
        try:
            parsed = urlsplit(url)
        except ValueError as exc:
            raise InvalidRepositoryURLError(
                "Invalid GitHub repository URL."
            ) from exc
        if parsed.hostname not in _GITHUB_HOSTS:
            raise InvalidRepositoryURLError(
                "URL must point to a GitHub repository."
            )
        path = parsed.path

    parts = [part for part in path.split("/") if part]
    if len(parts) < 2:
        raise InvalidRepositoryURLError(
            "URL must include a repository owner and name."
        )

    owner, repo = parts[0], parts[1]
    if repo.endswith(".git"):
        repo = repo[:-4]

    if not _SEGMENT_PATTERN.match(owner) or not _SEGMENT_PATTERN.match(repo):
        raise InvalidRepositoryURLError(
            "URL must include a valid repository owner and name."
        )

    return owner, repo


class GitHubClient:
    """Thin async client for the GitHub REST API."""

    def __init__(
        self,
        *,
        token: str = "",
        base_url: str = "https://api.github.com",
        timeout_seconds: float = 20.0,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._token = token
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout_seconds
        self._transport = transport

    def _client(self) -> httpx.AsyncClient:
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if self._token:
            headers["Authorization"] = f"Bearer {self._token}"
        return httpx.AsyncClient(
            base_url=self._base_url,
            headers=headers,
            timeout=self._timeout,
            transport=self._transport,
        )

    async def get_repository(self, owner: str, repo: str) -> dict:
        """Fetch repository metadata (used to resolve the default branch)."""
        response = await self._request(
            "GET", f"/repos/{quote(owner)}/{quote(repo)}"
        )
        return response.json()

    async def get_tree(self, owner: str, repo: str, branch: str) -> list[dict]:
        """Fetch the recursive file tree for a branch."""
        params = {"recursive": "1"}
        response = await self._request(
            "GET",
            f"/repos/{quote(owner)}/{quote(repo)}/git/trees/{quote(branch, safe='')}",
            params=params,
        )
        entries = response.json().get("tree", [])
        blobs = [
            {
                "path": entry["path"],
                "size": entry.get("size", 0),
            }
            for entry in entries
            if entry.get("type") == "blob"
        ]
        return blobs[:MAX_TREE_ENTRIES]

    async def get_file_content(self, owner: str, repo: str, path: str, ref: str) -> str:
        """Fetch and decode a single file's text content."""
        params = {"ref": ref}
        response = await self._request(
            "GET",
            f"/repos/{quote(owner)}/{quote(repo)}/contents/{quote(path, safe='/')}",
            params=params,
        )
        payload = response.json()
        content = payload.get("content", "")
        if payload.get("encoding") == "base64" and content:
            try:
                decoded = base64.b64decode(content)
            except (ValueError, TypeError) as exc:
                raise GitHubAPIError(
                    f"Failed to decode file content for {path}."
                ) from exc
        else:
            decoded = content.encode("utf-8")
        return decoded.decode("utf-8", errors="replace")

    async def _request(self, method: str, path: str, **kwargs) -> httpx.Response:
        try:
            async with self._client() as client:
                response = await client.request(method, path, **kwargs)
        except httpx.HTTPError as exc:
            raise GitHubNetworkError(
                f"Could not reach the GitHub API: {exc.__class__.__name__}."
            ) from exc
        self._raise_for_github_error(response)
        return response

    def _raise_for_github_error(self, response: httpx.Response) -> None:
        status_code = response.status_code
        if status_code == 404:
            raise RepositoryNotFoundError(
                "The repository was not found or is not accessible."
            )
        if status_code == 429:
            raise GitHubRateLimitError(
                "The GitHub API rate limit was exceeded. Try again later or "
                "configure a GITHUB_TOKEN."
            )
        if status_code == 403:
            if response.headers.get("X-RateLimit-Remaining") == "0":
                raise GitHubRateLimitError(
                    "The GitHub API rate limit was exceeded. Try again later or "
                    "configure a GITHUB_TOKEN."
                )
            raise GitHubAPIError(
                "The GitHub API rejected the request.", status_code=status_code
            )
        if status_code >= 400:
            raise GitHubAPIError(
                "The GitHub API returned an unexpected response.",
                status_code=status_code,
            )
