"""
GabomaAI — API v1 Admin Stats · SmartANDJ AI Technologies
Dashboard KPI de l'administration.
Protégé par Clerk JWKS + vérification du rôle (Daniel ANDJ).
Fondateur : Daniel Jonathan ANDJ
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from core.security import require_admin
from core.database import get_admin_stats as fetch_db_admin_stats

router = APIRouter(prefix="/v1/admin", tags=["Admin v1"])


class AdminStats(BaseModel):
    total_users: int
    total_conversations: int
    total_messages: int
    total_tokens: int
    total_credits_used: int
    waitlist_pending: int
    total_agent_sessions: int


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(user: dict = Depends(require_admin)):
    """
    Statistiques globales pour le tableau de bord administrateur.
    Accessibles uniquement à Daniel ANDJ (is_admin = TRUE).
    """
    stats = await fetch_db_admin_stats()
    
    return AdminStats(
        total_users=stats.get("total_users", 0),
        total_conversations=stats.get("total_conversations", 0),
        total_messages=stats.get("total_messages", 0),
        total_tokens=stats.get("total_tokens", 0),
        total_credits_used=stats.get("total_credits_used", 0),
        waitlist_pending=stats.get("waitlist_pending", 0),
        total_agent_sessions=stats.get("total_agent_sessions", 0),
    )
