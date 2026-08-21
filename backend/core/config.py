"""
Ñkyel AI — Configuration · SmartANDJ AI Technologies
Settings Pydantic v2 pour tout le backend.
Fondateur : Daniel Jonathan ANDJ
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    """Configuration centralisée de Ñkyel AI."""

    # ── Application ──────────────────────────────────────────────
    app_name: str = "Ñkyel AI"
    app_version: str = "2.0.0"
    company_name: str = "SmartANDJ AI Technologies (Libreville, Gabon)"
    founder: str = "Daniel Jonathan ANDJ (Akare Ntoutoume Daniel Jonathan)"
    environment: str = "development"
    debug: bool = True

    # ── Base de données Neon PostgreSQL ──────────────────────
    database_url: str = "postgresql+asyncpg://localhost:5432/nkyelai"
    database_url_unpooled: str = ""

    # ── Redis (Upstash) ─────────────────────────────────────
    redis_url: str = "redis://localhost:6379"
    upstash_redis_rest_url: str = ""
    upstash_redis_rest_token: str = ""

    # ── QStash ──────────────────────────────────────────────
    qstash_url: str = ""
    qstash_token: str = ""

    # ── Clerk Auth (JWKS RS256) ─────────────────────────────
    clerk_domain: str = "clerk.nkyel.ai"
    clerk_secret_key: str = ""
    clerk_webhook_secret: str = ""

    # ── Groq (AURATA / SONAR) ───────────────────────────────
    groq_api_key: str = ""
    aurata_model: str = "openai/gpt-oss-120b"
    sonar_model: str = "groq/compound"

    # ── DeerFlow Agent (ONYX / BLACK_PANTHER) ───────────────
    deerflow_url: str = "http://localhost:8080"

    # ── Qdrant (LOXO RAG) ──────────────────────────────────
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    qdrant_collection: str = "nkyel_knowledge"

    # ── Gemini (Primary Model) ──────────────────────────────
    google_api_key: str = ""
    google_generative_ai_api_key: str = ""
    nkyel_primary_model: str = "gemini-2.5-flash"
    nkyel_planning_model: str = "gemini-2.5-pro"

    # ── Tavily (Web Search pour DeerFlow) ───────────────────
    tavily_api_key: str = ""

    # ── Sentry ──────────────────────────────────────────────
    sentry_dsn: str = ""

    # ── Multimedia Providers ────────────────────────────────
    pollinations_api_key: str = ""
    cloudflare_account_id: str = ""
    cloudflare_api_token: str = ""
    pexels_api_key: str = ""
    pixabay_api_key: str = ""
    runpod_api_key: str = ""
    comfyui_url: str = "http://localhost:8188"
    comfyui_api_key: str = ""

    # ── Stockage d'Artefacts & R2 ───────────────────────────
    artifacts_storage_path: str = "./storage/artifacts"
    cloudflare_r2_bucket: str = "nkyel-media-sovereign"
    cloudflare_r2_public_domain: str = "https://media.nkyel.ai"
    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = "nkyel-artifacts"
    r2_public_url: str = "https://artifacts.nkyel.ai"

    # ── CORS ────────────────────────────────────────────────
    cors_origins: str = "http://localhost:3000,http://localhost:8081,http://localhost:5173,http://localhost:5175"

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

