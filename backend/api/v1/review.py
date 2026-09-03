"""
Ñkyel AI — API v1 Review / Google Private Access
SmartANDJ AI Technologies
"""

import os
import hmac
import uuid
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.config import settings
from db.session import get_db
from db.models import ReviewInvitation, ReviewSession, ReviewQuotaUsage, Workspace
from middleware.review_auth import get_current_review_session

router = APIRouter(prefix="/review", tags=["Review Access"])

class CreateInvitationRequest(BaseModel):
    audience: str = "google_reviewers"
    expires_in_days: int = settings.google_review_invite_ttl_days
    admin_secret: str

@router.post("/invitations")
async def create_invitation(
    req: CreateInvitationRequest,
    db: AsyncSession = Depends(get_db)
):
    """(Usage interne) Créer un lien privé pour Google Review."""
    expected_secret = os.getenv("REVIEW_ADMIN_SECRET", "NKYEL_ADMIN_1337_SECURE")
    if not hmac.compare_digest(req.admin_secret, expected_secret):
        raise HTTPException(status_code=403, detail="Forbidden")

    token_raw = f"g_rev_{secrets.token_urlsafe(32)}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=req.expires_in_days)
    
    invitation = ReviewInvitation(
        token_hash=token_raw,
        audience=req.audience,
        expires_at=expires_at
    )
    db.add(invitation)
    await db.commit()
    
    return {
        "invite_token": token_raw,
        "expires_at": expires_at,
        "url": f"/review/google/{token_raw}"
    }
 
@router.api_route("/google/session", methods=["GET", "POST"])
async def get_or_create_google_review_session(
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Initialise directement et de manière idempotente la session Google Review
    pour l'accès officiel sans redirection : https://nkyel.smartandjai.com/review/google/
    """
    canonical_token = "g_rev_7SMNAzSmcavmHI8xWVqzy28k1CMPTheFNNeIclTmw-0"
    return await authenticate_review_token(token=canonical_token, response=response, request=request, db=db)

@router.post("/auth/{token}")
async def authenticate_review_token(
    token: str,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Vérifie le token secret de review et initie une session de review sécurisée.
    Enforce la période exacte persistée en base (35 jours).
    """
    now = datetime.now(timezone.utc)
    stmt = select(ReviewInvitation).where(
        ReviewInvitation.token_hash == token,
        (ReviewInvitation.expires_at > now) | (ReviewInvitation.expires_at == None),
        ReviewInvitation.revoked_at == None
    )
    result = await db.execute(stmt)
    invitation = result.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Lien d'évaluation invalide ou expiré.")

    # Session expiration strictly capped by invitation expiration (35 days from database)
    session_expires_at = invitation.expires_at if invitation.expires_at else (now + timedelta(days=35))
    remaining_seconds = max(1, int((session_expires_at - now).total_seconds()))

    # Check for existing active session or create new
    stmt_sess = select(ReviewSession).where(
        ReviewSession.invitation_id == invitation.id,
        ReviewSession.is_active == True,
        ReviewSession.expires_at > now
    ).order_by(ReviewSession.created_at.desc())
    res_sess = await db.execute(stmt_sess)
    existing_session = res_sess.scalar_one_or_none()

    if existing_session:
        session_token = existing_session.session_token_hash
        active_session = existing_session
    else:
        session_token = f"rev_sess_{secrets.token_urlsafe(32)}"
        active_session = ReviewSession(
            invitation_id=invitation.id,
            session_token_hash=session_token,
            expires_at=session_expires_at,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            is_active=True
        )
        db.add(active_session)
        await db.flush()

        # Quota usage linked to session with canonical GOOGLE_REVIEW profile
        quota = ReviewQuotaUsage(
            session_id=active_session.id,
            quota_profile="GOOGLE_REVIEW",
            tokens_input=0,
            tokens_output=0,
            images_generated=0,
            videos_generated=0,
            searches_performed=0
        )
        db.add(quota)

    invitation.use_count += 1
    invitation.last_used_at = now
    await db.commit()

    # Dedicated Google Review Workspace isolation
    stmt_ws = select(Workspace).where(Workspace.name == "Google Review Workspace")
    res_ws = await db.execute(stmt_ws)
    google_ws = res_ws.scalar_one_or_none()
    workspace_id = str(google_ws.id) if google_ws else None

    # Set secure HttpOnly cookie matching remaining review window
    response.set_cookie(
        key="nkyel_review_session",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=remaining_seconds
    )

    days_remaining = max(0, (session_expires_at - now).days)

    db_quotas = invitation.access_profile if (invitation and invitation.access_profile) else {}

    return {
        "status": "success",
        "message": "Accès autorisé pour Google Review.",
        "session_token": session_token,
        "workspace_id": workspace_id,
        "expires_at": session_expires_at.isoformat(),
        "days_remaining": days_remaining,
        "quota_profile": db_quotas.get("quota_profile", "GOOGLE_REVIEW"),
        "quotas": {
            "tier_name": db_quotas.get("tier_name", "GOOGLE_REVIEWER"),
            "max_active_missions": db_quotas.get("max_active_missions", 1),
            "max_queued_missions": db_quotas.get("max_queued_missions", 8),
            "token_per_mission": db_quotas.get("token_per_mission", settings.google_review_token_per_mission),
            "token_soft_daily": db_quotas.get("token_soft_daily", settings.google_review_token_soft_daily),
            "token_hard_daily": db_quotas.get("token_hard_daily", settings.google_review_token_hard_daily),
            "weekly_token_budget": db_quotas.get("weekly_token_budget", 7000000),
            "deep_research_per_day": db_quotas.get("deep_research_per_day", 10),
            "searches_per_mission": db_quotas.get("searches_per_mission", 50),
            "sources_per_mission": db_quotas.get("sources_per_mission", 80),
            "artifacts_per_day": db_quotas.get("artifacts_per_day", 30),
            "image_limit": db_quotas.get("image_limit", settings.google_review_image_limit),
            "video_limit": db_quotas.get("video_limit", settings.google_review_video_limit),
            "video_duration_max": db_quotas.get("video_duration_max", 5)
        }
    }

@router.get("/status")
async def get_review_status(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Vérifier l'état de la session de review active et retourner les quotas réels."""
    session = await get_current_review_session(request)
    now = datetime.now(timezone.utc)

    if not session or session.expires_at <= now:
        return {
            "active": False,
            "reason": "REVIEW_ACCESS_EXPIRED",
            "message": "This review access period has ended."
        }

    # Fetch invitation
    stmt_inv = select(ReviewInvitation).where(ReviewInvitation.id == session.invitation_id)
    res_inv = await db.execute(stmt_inv)
    invitation = res_inv.scalar_one_or_none()

    # Fetch quota usage
    stmt_q = select(ReviewQuotaUsage).where(ReviewQuotaUsage.session_id == session.id)
    res_q = await db.execute(stmt_q)
    quota = res_q.scalar_one_or_none()

    # Fetch Google Review Workspace
    stmt_ws = select(Workspace).where(Workspace.name == "Google Review Workspace")
    res_ws = await db.execute(stmt_ws)
    google_ws = res_ws.scalar_one_or_none()

    days_remaining = max(0, (session.expires_at - now).days)
    db_quotas = invitation.access_profile if (invitation and invitation.access_profile) else {}

    return {
        "active": True,
        "session_id": str(session.id),
        "workspace_id": str(google_ws.id) if google_ws else None,
        "expires_at": session.expires_at.isoformat(),
        "days_remaining": days_remaining,
        "quota_profile": db_quotas.get("quota_profile", "GOOGLE_REVIEW"),
        "quotas": {
            "tier_name": db_quotas.get("tier_name", "GOOGLE_REVIEWER"),
            "max_active_missions": db_quotas.get("max_active_missions", 1),
            "max_queued_missions": db_quotas.get("max_queued_missions", 8),
            "token_per_mission": db_quotas.get("token_per_mission", settings.google_review_token_per_mission),
            "token_soft_daily": db_quotas.get("token_soft_daily", settings.google_review_token_soft_daily),
            "token_hard_daily": db_quotas.get("token_hard_daily", settings.google_review_token_hard_daily),
            "weekly_token_budget": db_quotas.get("weekly_token_budget", 7000000),
            "deep_research_per_day": db_quotas.get("deep_research_per_day", 10),
            "searches_per_mission": db_quotas.get("searches_per_mission", 50),
            "sources_per_mission": db_quotas.get("sources_per_mission", 80),
            "artifacts_per_day": db_quotas.get("artifacts_per_day", 30),
            "image_limit": db_quotas.get("image_limit", settings.google_review_image_limit),
            "video_limit": db_quotas.get("video_limit", settings.google_review_video_limit),
            "video_duration_max": db_quotas.get("video_duration_max", 5),
            "tokens_used": (quota.tokens_input + quota.tokens_output) if quota else 0,
            "images_generated": quota.images_generated if quota else 0,
            "videos_generated": quota.videos_generated if quota else 0,
            "searches_performed": quota.searches_performed if quota else 0,
        }
    }


