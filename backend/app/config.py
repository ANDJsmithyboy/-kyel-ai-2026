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
    cors_origins: str = "http://localhost:3000,http://localhost:8081,http://localhost:5173,http://localhost:5175,https://nkyel.smartandjai.com,https://demo.nkyel.smartandjai.com,https://nkyel-fd.vercel.app,https://nkyel-fd-two.vercel.app"

    # ── LLM (Groq) ──
    groq_api_key: str = ""

    # ── NkyelSeer (Vision) ──
    hf_api_key: str = ""
    nkyelseer_mode: str = "hf_api"
    nkyelseer_url: str = "https://api-inference.huggingface.co/models/THUdyh/Oryx-1.5-32B"

    # ── WANDANA (Recherche web) ──
    tavily_api_key: str = ""

    # ── Auth (Clerk) ──
    clerk_domain: str = "clerk.smartandjai.com"
    clerk_frontend_api_url: str = "https://clerk.smartandjai.com"
    clerk_backend_api_url: str = "https://api.clerk.com"
    clerk_jwks_url_override: str = ""
    clerk_issuer: str = "https://clerk.smartandjai.com"
    clerk_jwt_key: str = ""
    clerk_secret_key: str = ""
    clerk_publishable_key: str = ""
    clerk_webhook_secret: str = ""
    clerk_authorized_parties: str = "https://nkyel.smartandjai.com,https://demo.nkyel.smartandjai.com,https://nkyel-fd.vercel.app,http://localhost:3000"
    frontend_url: str = "https://nkyel.smartandjai.com"

    @property
    def clerk_jwks_url(self) -> str:
        if self.clerk_jwks_url_override:
            return self.clerk_jwks_url_override
        return f"https://{self.clerk_domain}/.well-known/jwks.json"

    @property
    def clerk_authorized_parties_list(self) -> List[str]:
        if not self.clerk_authorized_parties:
            return []
        return [p.strip() for p in self.clerk_authorized_parties.split(",") if p.strip()]

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
