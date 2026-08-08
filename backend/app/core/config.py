from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    xai_api_key: str = ""
    xai_model: str = "grok-4.5"
    xai_base_url: str = "https://api.x.ai/v1"
    xai_timeout_seconds: float = 60.0
    cors_origins: list[str] = ["http://localhost:5173"]
    api_v1_prefix: str = "/api/v1"


@lru_cache
def get_settings() -> Settings:
    return Settings()
