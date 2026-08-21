"""
Ñkyel AI — Backend FastAPI Principal · SmartANDJ AI Technologies
Points d'entrée API v1.
Fondateur : Daniel Jonathan ANDJ
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from db.session import init_db, close_db

# Imports des routeurs v1
from api.v1.chat import router as chat_router
from api.v1.agent import router as agent_router
from api.v1.rag import router as rag_router
from api.v1.admin import router as admin_router
from api.v1.users import router as users_router
from api.v1.feedback import router as feedback_router
from api.v1.nkyel_agent import router as nkyel_router
from api.v1.media import router as media_router
from api.v1.wide_research import router as wide_research_router
from api.v1.workgraph_intervention import router as workgraph_router
from api.v1.clerk_webhook import router as clerk_webhook_router
from api.v1.beta import router as beta_router
from api.v1.google_demo import router as google_demo_router
from services.language_registry_service import language_service



@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gère le démarrage et l'arrêt de l'application."""
    # Démarrage
    print(f"🚀 Démarrage de Ñkyel AI ({settings.app_name}) v{settings.app_version}...")
    try:
        await init_db()
        print("✅ Connexion à Neon PostgreSQL établie.")
    except Exception as e:
        print(f"⚠️ Note DB: {e}. Le serveur continue de tourner.")
    yield
    # Arrêt
    print("🛑 Arrêt du backend Ñkyel AI...")
    try:
        await close_db()
    except Exception:
        pass



app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=f"API Backend propulsée par {settings.company_name} (Fondateur : {settings.founder})",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# ── Configuration CORS ───────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Gestionnaire d'erreurs global ────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"❌ Erreur globale: {exc}")
    # En production, Sentry capturerait ceci
    return JSONResponse(
        status_code=500,
        content={"detail": "Une erreur interne du serveur est survenue."},
    )


# ── Montage des routeurs ─────────────────────────────────────
app.include_router(chat_router)
app.include_router(agent_router)
app.include_router(rag_router)
app.include_router(admin_router)
app.include_router(users_router)
app.include_router(feedback_router)
app.include_router(nkyel_router)
app.include_router(media_router)
app.include_router(wide_research_router, prefix="/api/v1")
app.include_router(workgraph_router)
app.include_router(clerk_webhook_router)
app.include_router(beta_router)
app.include_router(google_demo_router)



# ── Route Registre Linguistique Dynamique ─────────────────────
@app.get("/api/v1/languages", tags=["Languages"])
async def get_supported_languages():
    """Retourne l'ensemble des capacités linguistiques mondiales et prioritaires africaines."""
    return {
        "success": True,
        "languages": [cap.model_dump() for cap in language_service.get_all_capabilities()],
        "african_priority_count": sum(1 for cap in language_service.get_all_capabilities() if cap.is_african_priority),
        "total_count": len(language_service.get_all_capabilities()),
    }


# ── Route Healthcheck ────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    """Vérification de la santé du système pour Better Stack / K8s."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "database": "connected",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.debug)
