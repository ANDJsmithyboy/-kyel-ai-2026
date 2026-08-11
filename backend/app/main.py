"""
Ñkyel AI · FastAPI Application
Point d'entrée principal — CORS, routes, health check
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import chat, vision, agents, models


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Cycle de vie de l'application — initialisation et nettoyage."""
    print("Ñkyel AI Backend · Démarrage...")
    yield
    print("Ñkyel AI Backend · Arrêt.")


app = FastAPI(
    title="Ñkyel AI API",
    description="API backend pour Ñkyel AI — IA souveraine du Gabon",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ──
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(vision.router, prefix="/api", tags=["Vision"])
app.include_router(agents.router, prefix="/api", tags=["Agents"])
app.include_router(models.router, prefix="/api", tags=["Models"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Ñkyel AI", "version": "1.0.0"}
