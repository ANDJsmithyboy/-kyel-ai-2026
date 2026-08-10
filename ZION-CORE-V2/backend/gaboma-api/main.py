# FILE: gaboma-api/main.py
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import auth, chat, payments, tiers

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Cycle de vie applicatif du Gateway GabomaGPT."""
    app.state.settings = settings
    yield


app = FastAPI(
    title=settings.app_name,
    description=(
        "Gateway souverain GabomaGPT. "
        "L'application Android ne parle jamais directement à Open WebUI, Deer Flow ou E-Billing."
    ),
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Request-ID"],
)


@app.get(
    "/health",
    summary="Healthcheck racine",
    description="Vérifie que le Gateway FastAPI est vivant.",
)
async def healthcheck() -> dict[str, str]:
    """Healthcheck utilisé par Coolify, Docker et les probes."""
    return {
        "status": "ok",
        "service": settings.app_name,
        "env": settings.app_env,
    }


@app.get(
    f"{settings.api_prefix}/health",
    summary="Healthcheck API",
    description="Healthcheck sous le préfixe API public.",
)
async def api_healthcheck() -> dict[str, str]:
    """Healthcheck exposé sous /api pour les clients."""
    return {
        "status": "ok",
        "service": settings.app_name,
        "env": settings.app_env,
    }


app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(chat.router, prefix=settings.api_prefix)
app.include_router(payments.router, prefix=settings.api_prefix)
app.include_router(tiers.router, prefix=settings.api_prefix)
