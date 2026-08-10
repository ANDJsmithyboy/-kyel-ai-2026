"""
GabomaAI — Configuration · SmartANDJ AI Technologies
Settings Pydantic v2 pour tout le backend.
Fondateur : Daniel Jonathan ANDJ
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    """Configuration centralisée de GabomaAI."""

    # ── Application ──────────────────────────────────────────
    app_name: str = "GabomaAI"
    app_version: str = "2.0.0"
    company_name: str = "SmartANDJ AI Technologies"
    founder: str = "Daniel Jonathan ANDJ"
    environment: str = "development"
    debug: bool = True

    # ── Base de données Neon PostgreSQL ──────────────────────
    database_url: str = "postgresql+asyncpg://localhost:5432/gabomai"

    # ── Redis (Upstash) ─────────────────────────────────────
    redis_url: str = "redis://localhost:6379"

    # ── Clerk Auth (JWKS RS256) ─────────────────────────────
    clerk_domain: str = "clerk.gaboma.ai"
    clerk_secret_key: str = ""

    # ── Groq (AURATA / SONAR) ───────────────────────────────
    groq_api_key: str = ""
    aurata_model: str = "llama-3.3-70b-versatile"
    sonar_model: str = "llama-3.3-70b-versatile"

    # ── DeerFlow Agent (ONYX / BLACK_PANTHER) ───────────────
    deerflow_url: str = "http://localhost:8080"

    # ── Qdrant (LOXO RAG) ──────────────────────────────────
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    qdrant_collection: str = "gaboma_loxo"

    # ── Tavily (Web Search pour DeerFlow) ───────────────────
    tavily_api_key: str = ""

    # ── Sentry ──────────────────────────────────────────────
    sentry_dsn: str = ""

    # ── CORS ────────────────────────────────────────────────
    cors_origins: str = "http://localhost:3000,http://localhost:8081"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def clerk_jwks_url(self) -> str:
        return f"https://{self.clerk_domain}/.well-known/jwks.json"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }


settings = Settings()
