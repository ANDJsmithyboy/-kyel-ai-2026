"""
Ñkyel AI — API v1 Beta & Télémétrie · SmartANDJ AI Technologies
Routes pour la Bêta Privée :
- Statut temps réel & machine à états
- Attribution atomique des 100 places
- Formulaire de feedback structuré
- Métriques administrateur & export pour le dossier Google

Fondateur : Daniel Jonathan ANDJ
"""

import io
import csv
import json
import uuid
from typing import Optional, Dict, Any, Tuple
from fastapi import APIRouter, Depends, HTTPException, status, Header, Response

from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db
from db.models import User
from services.beta_service import BetaService, BetaStateMachine
from core.security import get_current_user_optional, require_current_user, require_admin

router = APIRouter(prefix="/api/v1/beta", tags=["Beta 2026"])


# ── Modèles Pydantic ─────────────────────────────────────────

class BetaEnrollRequest(BaseModel):
    locale: str = Field(default="fr", description="Locale utilisateur (fr, fang, mpongwe, punu)")
    terms_version: str = Field(default="1.0", description="Version des conditions acceptées")
    metadata: Optional[Dict[str, Any]] = None


class BetaFeedbackRequest(BaseModel):
    overall_rating: int = Field(..., ge=1, le=5, description="Note globale de 1 à 5")
    goal_attempted: str = Field(..., min_length=3, description="Objectif que l'utilisateur tentait d'accomplir")
    task_succeeded: bool = Field(..., description="Si l'objectif a été atteint")
    favorite_feature: str = Field(..., min_length=2, description="Fonctionnalité préférée")
    issues_encountered: Optional[str] = Field(default=None, description="Problèmes ou lenteurs rencontrés")
    priority_improvement: str = Field(..., min_length=3, description="Amélioration prioritaire")
    likely_to_reuse: int = Field(..., ge=1, le=5, description="Probabilité de réutilisation (1 à 5)")
    nps_score: int = Field(..., ge=0, le=10, description="Score NPS de recommandation (0 à 10)")
    willingness_to_pay: str = Field(..., description="Volonté de payer (oui, non, peut-être)")
    price_bracket: Optional[str] = Field(default=None, description="Fourchette de prix acceptable")
    african_context_interest: str = Field(..., description="Intérêt pour les spécificités Gabon/Afrique")
    locale_used: str = Field(default="fr", description="Langue principale utilisée")
    quote_consent: bool = Field(default=False, description="Autorisation d'utiliser une citation anonymisée")


# ── Endpoints ────────────────────────────────────────────────

def _extract_user_info(user: Any) -> Tuple[uuid.UUID, str]:
    if isinstance(user, dict):
        uid_val = user.get("id") or str(uuid.uuid4())
        try:
            uid = uuid.UUID(str(uid_val))
        except Exception:
            uid = uuid.uuid5(uuid.NAMESPACE_DNS, str(uid_val))
        csub = user.get("clerk_id") or user.get("clerk_sub") or str(uid)
        return uid, csub
    else:
        return user.id, (getattr(user, "clerk_sub", None) or str(user.id))


@router.get("/status")
async def get_beta_status(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[Any] = Depends(get_current_user_optional),
):
    """
    Retourne l'état complet du serveur pour la Bêta 42h.
    Non bloquant, ouvert au public pour afficher le countdown et la capacité.
    """
    clerk_id = None
    if current_user:
        _, clerk_id = _extract_user_info(current_user)
    return await BetaService.get_beta_status(db, user_clerk_id=clerk_id)


from fastapi.responses import JSONResponse

@router.post("/enroll")
async def enroll_in_beta(
    req: BetaEnrollRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(require_current_user),
):
    """
    Attribution atomique et transactionnelle d'une place parmi les 100 max.
    Requiert une session Clerk authentifiée.
    """
    user_id, clerk_user_id = _extract_user_info(current_user)
    success, message, seat_number = await BetaService.enroll_user_atomic(
        session=db,
        user_id=user_id,
        clerk_user_id=clerk_user_id,
        locale=req.locale,
        terms_version=req.terms_version,
        metadata=req.metadata,
    )

    if not success:
        if "Toutes les places" in message:
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={
                    "admitted": False,
                    "reason": "BETA_FULL",
                    "capacity": 100,
                    "message": message
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message,
            )

    return {
        "admitted": True,
        "success": True,
        "message": message,
        "seat_number": seat_number,
        "capacity": 100,
        "remaining": max(0, 100 - (seat_number if seat_number and seat_number <= 100 else 100)),
    }


@router.post("/feedback")
async def submit_beta_feedback(
    req: BetaFeedbackRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(require_current_user),
):
    """
    Enregistrement du retour d'expérience structuré de la Bêta.
    """
    user_id, clerk_user_id = _extract_user_info(current_user)
    feedback_id = await BetaService.record_feedback(
        session=db,
        user_id=user_id,
        clerk_user_id=clerk_user_id,
        overall_rating=req.overall_rating,
        goal_attempted=req.goal_attempted,
        task_succeeded=req.task_succeeded,
        favorite_feature=req.favorite_feature,
        issues_encountered=req.issues_encountered,
        priority_improvement=req.priority_improvement,
        likely_to_reuse=req.likely_to_reuse,
        nps_score=req.nps_score,
        willingness_to_pay=req.willingness_to_pay,
        price_bracket=req.price_bracket,
        african_context_interest=req.african_context_interest,
        locale_used=req.locale_used,
        quote_consent=req.quote_consent,
    )


    return {
        "success": True,
        "message": "Merci ! Votre retour d'expérience a été enregistré pour la version finale.",
        "feedback_id": str(feedback_id),
    }


@router.get("/admin/metrics")
async def get_beta_admin_metrics(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """
    Métriques complètes réelles de la bêta pour l'administrateur et le dossier Google.
    """
    return await BetaService.get_admin_metrics(db)


@router.get("/admin/export")
async def export_beta_metrics(
    format: str = "json",
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """
    Exporte les métriques de la bêta au format JSON ou CSV pour le dossier Google.
    """
    metrics = await BetaService.get_admin_metrics(db)

    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Metric Category", "Metric Name", "Value"])

        for category, values in metrics.items():
            if isinstance(values, dict):
                for k, v in values.items():
                    writer.writerow([category, k, str(v)])
            else:
                writer.writerow(["general", category, str(values)])

        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=nkyel_beta_metrics_export.csv"}
        )

    return metrics
