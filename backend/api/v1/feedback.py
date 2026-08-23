"""
Ñkyel AI — API v1 Feedback · SmartANDJ AI Technologies
Boucle de feedback en temps réel reliée à Neon PostgreSQL.
Fondateur : Daniel Jonathan ANDJ
"""

from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from core.database import save_feedback, get_feedback_statistics
from core.security import get_current_user_optional

router = APIRouter(prefix="/v1", tags=["Feedback v1"])


class FeedbackRequest(BaseModel):
    type: str = Field(..., description="thumbs_up|thumbs_down|rating|comment|hallucination|bad_tone|wrong_language|too_slow")
    message_id: str
    conversation_id: str
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    comment: Optional[str] = None
    model_public_name: Optional[str] = None
    mode: Optional[str] = None
    language: Optional[str] = None
    latency_ms: Optional[int] = None
    tokens_in: Optional[int] = None
    tokens_out: Optional[int] = None
    trace_id: Optional[str] = None
    device: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    status: str = "recorded"


class FeedbackStats(BaseModel):
    total: int
    thumbs_up: int
    thumbs_down: int
    avg_rating: float
    thumbs_down_rate: float
    top_motifs: list[dict]


@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(
    req: FeedbackRequest,
    user: Optional[dict] = Depends(get_current_user_optional),
):
    """Enregistre un retour utilisateur réel lié à un message et une conversation."""
    user_id = user.get("id") if user else None
    feedback_id = await save_feedback(
        feedback_type=req.type,
        message_id=req.message_id,
        conversation_id=req.conversation_id,
        rating=req.rating,
        comment=req.comment,
        model=req.model_public_name,
        mode=req.mode,
        language=req.language,
        latency_ms=req.latency_ms,
        tokens_in=req.tokens_in,
        tokens_out=req.tokens_out,
        trace_id=req.trace_id,
        user_id=user_id,
    )
    return FeedbackResponse(id=feedback_id, status="recorded")


@router.get("/feedback/stats", response_model=FeedbackStats)
async def get_feedback_stats():
    """Statistiques agrégées réelles des retours utilisateurs pour le dashboard admin."""
    stats = await get_feedback_statistics()
    return FeedbackStats(**stats)
