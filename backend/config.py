"""
backend/config.py — Centralised settings loaded from .env
All environment variables are accessed exclusively through this module;
never import os.getenv() directly in route handlers or services.
"""
from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ─── Groq ──────────────────────────────────────────────────
    groq_api_key: str = Field(default="", env="GROQ_API_KEY")

    # ─── Server ────────────────────────────────────────────────
    port: int = Field(default=8000, env="PORT")
    app_env: str = Field(default="development", env="APP_ENV")

    # ─── CORS ──────────────────────────────────────────────────
    allowed_origins: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"],
        env="ALLOWED_ORIGINS",
    )

    # ─── Upload limits ─────────────────────────────────────────
    max_image_size_mb: int = Field(default=10, env="MAX_IMAGE_SIZE_MB")

    @property
    def max_image_size_bytes(self) -> int:
        return self.max_image_size_mb * 1024 * 1024

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()
