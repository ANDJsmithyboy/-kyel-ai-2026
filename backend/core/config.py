"""
Ñkyel AI — Configuration · SmartANDJ AI Technologies
Settings Pydantic v2 pour tout le backend.
Fondateur : Daniel Jonathan ANDJ
"""

import os
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    """Configuration centralisée de Ñkyel AI."""

    # ── Application ──────────────────────────────────────────────
    app_name: str = "Ñkyel AI"
    app_version: str = "2.0.0"
    app_url: str = "https://nkyel.smartandjai.com"
    company_name: str = "SmartANDJ AI Technologies (Libreville, Gabon)"
    founder: str = "Daniel Jonathan ANDJ (Akare Ntoutoume Daniel Jonathan)"
    environment: str = "development"
    app_env: str = "development"
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

    # ── Groq (AURATA / SONAR & Pool) ────────────────────────
    groq_api_key: str = ""
    groq_api_keys: str = ""
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
    nkyel_primary_model: str = "gemini-3.5-flash-lite"
    nkyel_planning_model: str = "gemini-3.6-flash"

    # ── Tavily (Web Search pour DeerFlow & Agent Pool) ──────
    tavily_api_key: str = ""
    tavily_api_keys: str = ""

    # ── Fireworks AI ────────────────────────────────────────
    fireworks_api_key: str = ""
    fireworks_base_url: str = "https://api.fireworks.ai/inference/v1"

    # ── Together AI ─────────────────────────────────────────
    together_api_key: str = ""
    together_base_url: str = "https://api.together.xyz/v1"

    # ── ElevenLabs (Speech) ─────────────────────────────────
    elevenlabs_api_key: str = ""
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"

    # ── E2B (Sandbox) ───────────────────────────────────────
    e2b_api_key: str = ""

    # ── Brave Search ────────────────────────────────────────
    brave_search_api_key: str = ""

    # ── Sentry ──────────────────────────────────────────────
    sentry_dsn: str = ""

    # ── OpenTelemetry ───────────────────────────────────────
    otel_exporter_otlp_endpoint: str = ""
    otel_service_name: str = "nkyel-backend"

    # ── Google Capability Fabric & Feature Flags ────────────
    google_fabric_enabled: bool = True
    google_search_enabled: bool = True
    google_maps_enabled: bool = True
    google_media_enabled: bool = True
    google_workspace_enabled: bool = False
    google_drive_enabled: bool = False
    google_docs_enabled: bool = False
    google_sheets_enabled: bool = False
    google_gmail_enabled: bool = False
    google_calendar_enabled: bool = False
    google_computer_use_enabled: bool = False

    # ── Google Review Private Access Quotas ─────────────────
    google_review_enabled: bool = True
    google_review_invite_ttl_days: int = 35
    google_review_token_per_mission: int = 500000
    google_review_token_soft_daily: int = 1000000
    google_review_token_hard_daily: int = 1500000
    google_review_image_limit: int = 5
    google_review_video_limit: int = 2

    # ── Current Official Google Model Identifiers ───────────
    google_primary_model: str = "gemini-3.7-flash"
    google_fast_model: str = "gemini-3.6-flash"
    google_reasoning_model: str = "gemini-3.1-pro-preview"
    google_planning_model: str = "gemini-3.7-flash"
    google_image_fast_model: str = "gemini-3.1-flash-image"
    google_image_pro_model: str = "gemini-3-pro-image"
    google_video_model: str = "veo-3.1-generate-preview"
    google_showcase_mode: bool = False
    google_video_fast_model: str = "veo-3.1-fast-generate-preview"

    # ── Runway Model Router & Multi-Keys ────────────────────
    runway_api_key: str = ""
    runway_api_keys: str = ""
    runwayml_api_secret: str = ""
    runway_base_url: str = "https://api.runwayml.com/v1"
    runway_image_model: str = "gen3a_turbo"
    runway_video_model: str = "gen3a_turbo"

    # ── Multimedia Providers (Fal.ai, SiliconFlow, Pollinations) ──
    fal_key: str = ""
    fal_api_key: str = ""
    siliconflow_api_key: str = ""
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
    cors_origins: str = "http://localhost:3000,http://localhost:8081,http://localhost:5173,http://localhost:5175,https://nkyel.smartandjai.com,https://demo.nkyel.smartandjai.com,https://nkyel.ai,https://nkyel-fd.vercel.app,https://nkyel-fd-two.vercel.app"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        env = self.app_env or self.environment
        return env.lower() in ("production", "prod")

    @property
    def clerk_jwks_url(self) -> str:
        return f"https://{self.clerk_domain}/.well-known/jwks.json"

    @property
    def google_keys_pool(self) -> List[str]:
        keys = []
        if getattr(self, 'google_api_keys', None):
            keys.extend([k.strip() for k in self.google_api_keys.split(",") if k.strip()])
        for i in range(1, 21):
            env_k = os.getenv(f"GOOGLE_API_KEY_{i}") or os.getenv(f"GOOGLE_GENERATIVE_AI_API_KEY_{i}")
            if env_k and env_k.strip() and env_k.strip() not in keys:
                keys.append(env_k.strip())
        if self.google_api_key and self.google_api_key not in keys:
            keys.insert(0, self.google_api_key)
        if getattr(self, 'google_generative_ai_api_key', None) and self.google_generative_ai_api_key not in keys:
            keys.insert(0, self.google_generative_ai_api_key)
        return keys

    @property
    def groq_keys_pool(self) -> List[str]:
        keys = []
        if self.groq_api_keys:
            keys.extend([k.strip() for k in self.groq_api_keys.split(",") if k.strip()])
        for i in range(1, 21):
            env_k = os.getenv(f"GROQ_API_KEY_{i}")
            if env_k and env_k.strip() and env_k.strip() not in keys:
                keys.append(env_k.strip())
        if self.groq_api_key and self.groq_api_key not in keys:
            keys.insert(0, self.groq_api_key)
        return keys

    @property
    def runway_keys_pool(self) -> List[str]:
        keys = []
        if self.runway_api_keys:
            keys.extend([k.strip() for k in self.runway_api_keys.split(",") if k.strip()])
        for i in range(1, 21):
            env_k = os.getenv(f"RUNWAY_API_KEY_{i}")
            if env_k and env_k.strip() and env_k.strip() not in keys:
                keys.append(env_k.strip())
        if self.runway_api_key and self.runway_api_key not in keys:
            keys.insert(0, self.runway_api_key)
        return keys

    @property
    def tavily_keys_pool(self) -> List[str]:
        keys = []
        if self.tavily_api_keys:
            keys.extend([k.strip() for k in self.tavily_api_keys.split(",") if k.strip()])
        for i in range(1, 21):
            env_k = os.getenv(f"TAVILY_API_KEY_{i}")
            if env_k and env_k.strip() and env_k.strip() not in keys:
                keys.append(env_k.strip())
        if self.tavily_api_key and self.tavily_api_key not in keys:
            keys.insert(0, self.tavily_api_key)
        return keys

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }


settings = Settings()

