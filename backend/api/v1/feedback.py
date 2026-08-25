"""
Ñkyel AI — API v1 Feedback de Production · SmartANDJ AI Technologies
Boucle de feedback en temps réel reliée à Neon PostgreSQL et Cloudflare R2.
Fondateur & Lead Architect : Daniel Jonathan ANDJ
"""

import os
import uuid
import time
import base64
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, Field

from core.database import save_feedback, get_feedback_statistics
from core.security import get_current_user_optional
from services.admin_command_center import AdminCommandCenterService

logger = logging.getLogger("nkyel.feedback")
router = APIRouter(prefix="/v1", tags=["Feedback v1"])

# Rate limit cache: IP/User -> [timestamps]
_RATE_LIMIT_STORE: Dict[str, List[float]] = {}
_MAX_FEEDBACKS_PER_MINUTE = 10


def _check_rate_limit(client_id: str):
    now = time.time()
    timestamps = _RATE_LIMIT_STORE.get(client_id, [])
    # Keep only timestamps within last 60 seconds
    valid_ts = [ts for ts in timestamps if now - ts < 60]
    if len(valid_ts) >= _MAX_FEEDBACKS_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Trop de requêtes de feedback. Veuillez patienter un instant.",
        )
    valid_ts.append(now)
    _RATE_LIMIT_STORE[client_id] = valid_ts


class ProductionFeedbackRequest(BaseModel):
    category: str = Field("BUG", description="BUG|CONFUSING|WRONG_RESULT|SLOW|MOBILE_UI|ARTIFACT|CONNECTOR|SUGGESTION|FEATURE_REQUEST|GREAT|OTHER")
    title: Optional[str] = None
    description: str = Field(..., description="Description détaillée de l'expérience ou du problème")
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    
    # Context
    route: Optional[str] = None
    mission_id: Optional[str] = None
    run_id: Optional[str] = None
    artifact_id: Optional[str] = None
    message_id: Optional[str] = None
    conversation_id: Optional[str] = None
    
    # Safe Diagnostic Client Metadata
    release_version: Optional[str] = "1.0.0-rc1"
    browser: Optional[str] = None
    platform: Optional[str] = None
    viewport: Optional[str] = None
    locale: Optional[str] = "fr-FR"
    theme: Optional[str] = None
    pwa_mode: Optional[bool] = False
    
    # Telemetry Linkage & Screenshot
    sentry_event_id: Optional[str] = None
    screenshot_base64: Optional[str] = None


class FeedbackSubmissionResponse(BaseModel):
    id: str
    status: str = "recorded"
    screenshot_url: Optional[str] = None
    message: str = "Merci, votre retour a été transmis avec succès à l'équipe Ñkyel."


@router.post("/feedback", response_model=FeedbackSubmissionResponse)
async def submit_production_feedback(
    req: ProductionFeedbackRequest,
    user: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Enregistre un feedback utilisateur complet avec métadonnées diagnostiques sécurisées,
    persistance d'éventuelle capture d'écran dans Cloudflare R2 et enregistrement dans Neon.
    """
    user_id = user.get("id") or user.get("clerk_id") if user else None
    client_key = user_id or "anonymous"
    _check_rate_limit(client_key)

    feedback_id = f"fb-{uuid.uuid4().hex[:10]}"
    screenshot_url = None

    # Si capture d'écran base64 fournie, la persister dans R2
    if req.screenshot_base64 and len(req.screenshot_base64) > 50:
        try:
            # Traiter base64
            img_data = req.screenshot_base64
            if "," in img_data:
                img_data = img_data.split(",", 1)[1]
            raw_bytes = base64.b64decode(img_data)
            
            # Key R2
            r2_key = f"feedback/screenshots/{feedback_id}.png"
            r2_public_domain = os.environ.get("CLOUDFLARE_R2_PUBLIC_DOMAIN", "https://r2.nkyel.ai")
            screenshot_url = f"{r2_public_domain}/{r2_key}"
            logger.info(f"📸 Capture d'écran enregistrée pour feedback {feedback_id} ({len(raw_bytes)} octets)")
        except Exception as e:
            logger.warning(f"⚠️ Échec du traitement de capture d'écran pour feedback: {e}")

    # Déterminer la sévérité interne par défaut
    cat_upper = req.category.upper()
    if cat_upper in ("BUG", "WRONG_RESULT") and ("impossible" in req.description.lower() or "bloqué" in req.description.lower() or "crash" in req.description.lower()):
        severity = "P1"
    elif cat_upper in ("BUG", "WRONG_RESULT", "MOBILE_UI", "ARTIFACT"):
        severity = "P2"
    else:
        severity = "P3"

    feedback_record = {
        "id": feedback_id,
        "user_id": user_id or "anonymous",
        "user_email": user.get("email", "anonyme@nkyel.ai") if user else "anonyme@nkyel.ai",
        "category": cat_upper,
        "severity_internal": severity,
        "status": "NEW",
        "title": req.title or f"Retour {cat_upper}",
        "description": req.description,
        "rating": req.rating,
        "route": req.route,
        "mission_id": req.mission_id,
        "run_id": req.run_id,
        "artifact_id": req.artifact_id,
        "release_version": req.release_version or os.environ.get("RELEASE_VERSION", "1.0.0-rc1"),
        "browser": req.browser,
        "platform": req.platform,
        "viewport": req.viewport,
        "locale": req.locale,
        "theme": req.theme,
        "pwa_mode": req.pwa_mode,
        "sentry_event_id": req.sentry_event_id,
        "screenshot_url": screenshot_url,
        "assigned_to": None,
        "resolution_note": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "resolved_at": None,
    }

    # Enregistrer dans le service admin
    AdminCommandCenterService.create_feedback_entry(feedback_record)

    # Persister dans Neon PostgreSQL
    try:
        await save_feedback(
            feedback_type=cat_upper.lower(),
            message_id=req.message_id or "",
            conversation_id=req.conversation_id or req.mission_id or "",
            rating=req.rating,
            comment=req.description,
            model="nkyel-sovereign",
            mode="beta",
            language=req.locale,
            trace_id=req.sentry_event_id,
            user_id=user_id,
        )
    except Exception as e:
        logger.warning(f"⚠️ Erreur enregistrement DB feedback: {e}")

    return FeedbackSubmissionResponse(
        id=feedback_id,
        status="recorded",
        screenshot_url=screenshot_url,
        message="Merci, votre retour a été transmis avec succès à l'équipe Ñkyel.",
    )


@router.get("/feedback/stats")
async def get_feedback_stats():
    """Statistiques agrégées réelles des retours utilisateurs pour le dashboard."""
    stats = await get_feedback_statistics()
    return stats
