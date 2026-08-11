"""
Ñkyel AI · Configuration
Pydantic BaseSettings — charge les variables depuis .env
"""

from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    # ── App ──
    app_env: str = "development"
    app_secret: str = "change-me-in-production"
    cors_origins: str = "http://localhost:3000,https://nkyelai.vercel.app"

    # ── LLM (Groq) ──
    groq_api_key: str = ""

    # ── NkyelSeer (Vision) ──
    hf_api_key: str = ""
    nkyelseer_mode: str = "hf_api"
    nkyelseer_url: str = "https://api-inference.huggingface.co/models/THUdyh/Oryx-1.5-32B"

    # ── WANDANA (Recherche web) ──
    tavily_api_key: str = ""

    # ── Auth (Clerk) ──
    clerk_secret_key: str = ""

    # ── Database (Neon Postgres) ──
    database_url: str = ""

    # ── Vector Store (Qdrant) ──
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: Optional[str] = None

    # ── Cache (Redis) ──
    redis_url: str = "redis://localhost:6379/0"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
