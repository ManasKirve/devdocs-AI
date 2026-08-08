class RepositoryIngestionError(Exception):
    """Base class for all repository ingestion errors."""


class InvalidRepositoryURLError(RepositoryIngestionError):
    """The provided URL is not a valid GitHub repository URL."""


class RepositoryNotFoundError(RepositoryIngestionError):
    """The repository does not exist or is not accessible."""


class RepositoryEmptyError(RepositoryIngestionError):
    """The repository exists but contains no indexable files."""


class GitHubAPIError(RepositoryIngestionError):
    """The GitHub API returned an unexpected error response."""

    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.status_code = status_code


class GitHubRateLimitError(GitHubAPIError):
    """The GitHub API rate limit was exceeded."""


class GitHubNetworkError(RepositoryIngestionError):
    """A network error occurred while contacting the GitHub API."""
