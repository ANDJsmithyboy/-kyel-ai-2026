"""
Ñkyel AI — API v1 Review / Google Private Access
SmartANDJ AI Technologies
"""

import uuid
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.config import settings
from db.session import get_db
from db.models import ReviewInvitation, ReviewSession, ReviewQuotaUsage
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
    # Dans un cas réel, vous vérifieriez l'identité admin avec Clerk.
    # Ici, une simple clé secrète partagée pour la démo / bootstrap.
    if req.admin_secret != "NKYEL_ADMIN_1337_SECURE":
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

@router.post("/auth/{token}")
async def authenticate_review_token(
    token: str,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Vérifie le token secret et initie une session HttpOnly.
    """
    stmt = select(ReviewInvitation).where(
        ReviewInvitation.token_hash == token,
        (ReviewInvitation.expires_at > datetime.now(timezone.utc)) | (ReviewInvitation.expires_at == None),
        ReviewInvitation.revoked_at == None
    )
    result = await db.execute(stmt)
    invitation = result.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Lien invalide ou expiré.")

    # Créer la session
    session_token = f"rev_sess_{secrets.token_urlsafe(32)}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=1)
    
    new_session = ReviewSession(
        invitation_id=invitation.id,
        session_token_hash=session_token,
        expires_at=expires_at,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    quota = ReviewQuotaUsage(session_id=new_session.id)
    
    invitation.use_count += 1
    invitation.last_used_at = datetime.now(timezone.utc)
    
    db.add(new_session)
    db.add(quota)
    await db.commit()

    # Définir le cookie HttpOnly
    response.set_cookie(
        key="nkyel_review_session",
        value=session_token,
        httponly=True,
        secure=True, 
        samesite="lax",
        max_age=86400 # 24h
    )

    return {"status": "success", "message": "Accès autorisé pour Google Review."}

@router.get("/status")
async def get_review_status(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Vérifier si on est en session de review active."""
    session = await get_current_review_session(request)
    if not session:
        return {"active": False}
    return {"active": True, "session_id": str(session.id)}
