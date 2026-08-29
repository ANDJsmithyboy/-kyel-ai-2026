"""
Ñkyel AI — Backend FastAPI Principal · SmartANDJ AI Technologies
Points d'entrée API v1.
Fondateur : Daniel Jonathan ANDJ
"""

import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from core.context import NkyelContextMiddleware
from core.errors import NkyelAPIError, nkyel_error_handler
from core.telemetry import configure_structured_logging, telemetry_registry
from core.cancellation import cancellation_manager
from db.session import init_db, close_db

# Imports des routeurs v1 — PRODUCTION
# from api.v1.workspaces import router as workspaces_router
# from api.v1.missions import router as missions_router
# from api.v1.workgraph import router as workgraph_router
# from api.v1.conversations import router as conversations_router
# from api.v1.events import router as events_router
# from api.v1.user_settings import router as settings_router
# from api.v1.artifacts_v2 import router as artifacts_v2_router
from api.auth import router as auth_router
from api.v1.clerk_webhook import router as clerk_webhook_router

# Routeurs existants réactivés
from api.v1.chat import router as chat_router
from api.v1.agent import router as agent_router
from api.v1.feedback import router as feedback_router
# from api.v1.media import router as media_router
from api.v1.artifacts import router as artifacts_router
from api.v1.review import router as review_router
from services.language_registry_service import language_service

logger = logging.getLogger(__name__)

# ── Startup timestamp for uptime tracking ────────────────────
_STARTUP_TIME: float = 0.0
_STARTUP_COMPLETE: bool = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gère le démarrage et l'arrêt de l'application."""
    global _STARTUP_TIME, _STARTUP_COMPLETE

    # ── Démarrage ────────────────────────────────────────────
    _STARTUP_TIME = time.time()

    # Initialiser le logging structuré
    log_level = "DEBUG" if settings.debug else "INFO"
    configure_structured_logging(level=log_level)

    # Initialiser Sentry si configuré
    if settings.sentry_dsn and not settings.sentry_dsn.startswith("https://xxxxxxxx"):
        try:
            import sentry_sdk
            sentry_sdk.init(
                dsn=settings.sentry_dsn,
                environment=settings.environment,
                traces_sample_rate=0.2 if settings.is_production else 1.0,
                send_default_pii=False,
            )
            logger.info("🛡️ Sentry Observability activé avec succès.")
        except Exception as e:
            logger.warning(f"⚠️ Initialisation Sentry ignorée: {e}")

    logger.info(
        f"🚀 Démarrage de Ñkyel AI ({settings.app_name}) v{settings.app_version}...",
        extra={"environment": settings.environment},
    )

    try:
        await init_db()
        logger.info("✅ Connexion à Neon PostgreSQL établie.")
    except Exception as e:
        logger.warning(f"⚠️ Note DB: {e}. Le serveur continue de tourner.")

    _STARTUP_COMPLETE = True
    logger.info(
        f"✅ Ñkyel AI Backend prêt en {int((time.time() - _STARTUP_TIME) * 1000)}ms"
    )

    yield

    # ── Arrêt gracieux ───────────────────────────────────────
    logger.info("🛑 Arrêt du backend Ñkyel AI — sauvegarde des états actifs...")

    # Annuler proprement toutes les missions actives
    status = cancellation_manager.status()
    active_missions = status.get("active_missions", [])
    for mission in active_missions:
        cancellation_manager.cancel_mission(
            mission["mission_id"], reason="server_shutdown"
        )

    # Finaliser tous les trackers de coûts actifs
    global_status = telemetry_registry.global_status()
    for mid in list(global_status.get("active_missions", {}).keys()):
        summary = telemetry_registry.finalize_mission(mid)
        if summary:
            logger.info(
                f"📊 Mission {mid} finalisée: ${summary['total_cost_usd']:.6f}",
            )

    try:
        await close_db()
    except Exception:
        pass

    logger.info("🛑 Backend Ñkyel AI arrêté proprement.")



app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=f"API Backend propulsée par {settings.company_name} (Fondateur : {settings.founder})",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# ── Middleware: Context Tracing (DOIT être avant CORS) ───────
app.add_middleware(NkyelContextMiddleware)

# ── Configuration CORS ───────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Exception Handler: NkyelAPIError ─────────────────────────
app.add_exception_handler(NkyelAPIError, nkyel_error_handler)


# ── Gestionnaire d'erreurs global ────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"❌ Erreur globale: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "code": "INTERNAL_ERROR",
            "message": "Une erreur interne du serveur est survenue.",
        },
    )


# ── Montage des routeurs ─────────────────────────────────────
app.include_router(auth_router)
# app.include_router(workspaces_router, prefix="/api/v1")
# app.include_router(missions_router, prefix="/api/v1")
# app.include_router(workgraph_router, prefix="/api/v1")
# app.include_router(conversations_router, prefix="/api/v1")
# app.include_router(events_router, prefix="/api/v1")
# app.include_router(settings_router, prefix="/api/v1")
# app.include_router(artifacts_v2_router, prefix="/api/v1")
app.include_router(clerk_webhook_router)

# Routeurs existants réactivés
app.include_router(chat_router, prefix="/api/v1")
app.include_router(agent_router, prefix="/api/v1")
app.include_router(feedback_router, prefix="/api/v1")
# app.include_router(media_router, prefix="/api/v1")
app.include_router(artifacts_router, prefix="/api/v1")
app.include_router(review_router, prefix="/api/v1")



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


# ══════════════════════════════════════════════════════════════
# Health Endpoints (K8s / BetterStack / Railway)
# ══════════════════════════════════════════════════════════════

@app.get("/", tags=["System"])
@app.get("/api", tags=["System"])
async def root_index():
    """Point d'entrée racine de l'API."""
    return {
        "app": settings.app_name,
        "status": "online",
        "message": "Bienvenue sur l'API de Ñkyel AI",
        "documentation": "/docs" if settings.debug else "private"
    }

@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
async def health_check():
    """Health check ultra-rapide (RunPod / K8s / BetterStack)."""
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "uptime_seconds": int(time.time() - _STARTUP_TIME) if _STARTUP_TIME else 0,
    }


@app.get("/readiness", tags=["System"])
@app.get("/api/readiness", tags=["System"])
@app.get("/health/readiness", tags=["System"])
async def health_readiness():
    """
    Readiness probe — le service est prêt à accepter du trafic.
    Vérifie les dépendances critiques (DB, Model Gateway).
    """
    checks: dict = {}
    all_ok = True

    # Check DB
    try:
        from db.session import async_session
        async with async_session() as session:
            from sqlalchemy import text
            await session.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {type(e).__name__}"
        all_ok = False

    # Check Model Gateway circuits
    try:
        from services.model_gateway import circuit_breaker
        cb_status = circuit_breaker.status()
        open_circuits = [
            p for p, s in cb_status.items() if s["state"] == "open"
        ]
        if open_circuits:
            checks["model_gateway"] = f"degraded: {', '.join(open_circuits)} circuits open"
        else:
            checks["model_gateway"] = "ok"
    except Exception:
        checks["model_gateway"] = "ok"

    # Check cancellation manager
    checks["active_missions"] = cancellation_manager.active_count

    status_code = 200 if all_ok else 503
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if all_ok else "not_ready",
            "checks": checks,
        },
    )



@app.get("/health/startup", tags=["System"])
async def health_startup():
    """
    Startup probe — le service a terminé son initialisation.
    K8s attend que cette route retourne 200 avant d'envoyer du trafic.
    """
    if not _STARTUP_COMPLETE:
        return JSONResponse(
            status_code=503,
            content={"status": "starting", "message": "Initialisation en cours..."},
        )
    return {
        "status": "started",
        "startup_duration_ms": int((time.time() - _STARTUP_TIME) * 1000) if _STARTUP_TIME else 0,
    }


# ══════════════════════════════════════════════════════════════
# System Status (Admin / Observability)
# ══════════════════════════════════════════════════════════════

@app.get("/api/v1/system/status", tags=["System"])
async def system_status():
    """
    Statut complet du système pour le dashboard admin.
    Inclut Model Gateway, Memory, Cancellation, Telemetry.
    """
    from services.model_gateway import get_gateway_status
    from services.memory_manager import memory_manager

    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "uptime_seconds": int(time.time() - _STARTUP_TIME) if _STARTUP_TIME else 0,
        "model_gateway": get_gateway_status(),
        "memory": memory_manager.status(),
        "cancellation": cancellation_manager.status(),
        "telemetry": telemetry_registry.global_status(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.debug)

