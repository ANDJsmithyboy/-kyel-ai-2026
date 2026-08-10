# FILE: gaboma-api/config.py
from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration centralisée du Gateway GabomaGPT."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = Field(default="GabomaGPT Gateway", alias="APP_NAME")
    app_env: str = Field(default="local", alias="APP_ENV")
    api_prefix: str = Field(default="/api", alias="API_PREFIX")

    cors_origins: List[str] = Field(
        default_factory=lambda: ["http://localhost:8080"],
        alias="CORS_ORIGINS",
    )

    jwt_secret: str = Field(default="change-me-local-only", alias="JWT_SECRET")
    jwt_issuer: str = Field(default="gabomagpt.smartandj", alias="JWT_ISSUER")
    jwt_audience: str = Field(default="gabomagpt-mobile", alias="JWT_AUDIENCE")

    openwebui_base_url: str = Field(
        default="http://open-webui:8080",
        alias="OPENWEBUI_BASE_URL",
    )
    openwebui_admin_api_key: str = Field(
        default="change-me",
        alias="OPENWEBUI_ADMIN_API_KEY",
    )

    deerflow_base_url: str = Field(
        default="http://deerflow:8001",
        alias="DEERFLOW_BASE_URL",
    )
    deerflow_api_key: str = Field(default="change-me", alias="DEERFLOW_API_KEY")

    ebilling_base_url: str = Field(
        default="https://billing-easy.net",
        alias="EBILLING_BASE_URL",
    )
    ebilling_api_key: str = Field(default="change-me", alias="EBILLING_API_KEY")
    ebilling_merchant_id: str = Field(
        default="change-me",
        alias="EBILLING_MERCHANT_ID",
    )

    redis_url: str = Field(default="redis://redis:6379/0", alias="REDIS_URL")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> List[str]:
        """Accepte une liste JSON ou une chaîne séparée par virgules."""
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        if isinstance(value, list):
            return [str(origin).strip() for origin in value if str(origin).strip()]
        return ["http://localhost:8080"]


@lru_cache
def get_settings() -> Settings:
    """Retourne une configuration mémorisée pour éviter les lectures répétées."""
    return Settings()
