"""
GabomaGPT — API v1 Feedback · SmartANDJ AI Technologies
Feedback loop — Section 16 du prompt
Fondateur : Daniel Jonathan ANDJ
"""

from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

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
async def submit_feedback(req: FeedbackRequest):
    """Record user feedback linked to a specific message."""
    import uuid
    # TODO: Write to Neon via SQLAlchemy when DB is connected
    feedback_id = str(uuid.uuid4())
    return FeedbackResponse(id=feedback_id, status="recorded")


@router.get("/feedback/stats", response_model=FeedbackStats)
async def get_feedback_stats():
    """Aggregated feedback stats for admin dashboard."""
    # TODO: Replace with real DB aggregations
    return FeedbackStats(
        total=3847,
        thumbs_up=3416,
        thumbs_down=431,
        avg_rating=4.3,
        thumbs_down_rate=0.112,
        top_motifs=[
            {"motif": "Réponse incomplète", "count": 87},
            {"motif": "Hallucination factuelle", "count": 54},
            {"motif": "Mauvaise langue", "count": 43},
            {"motif": "Réponse trop lente", "count": 38},
            {"motif": "Mauvais ton", "count": 31},
        ],
    )
