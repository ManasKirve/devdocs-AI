import json
from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    xai_api_key: str = ""
    xai_model: str = "grok-4.5"
    xai_base_url: str = "https://api.x.ai/v1"
    xai_timeout_seconds: float = 60.0
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173"]
    api_v1_prefix: str = "/api/v1"
    api_version: str = "0.1.0"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            value = value.strip()
            if value.startswith("["):
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return []
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
