"""
Ñkyel AI — Middlewares pour l'accès privé (Google Review)
SmartANDJ AI Technologies
"""

import logging
from typing import Optional
from fastapi import Request, HTTPException, status
from db.session import async_session
from db.models import ReviewSession
from sqlalchemy import select
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

async def get_current_review_session(request: Request) -> Optional[ReviewSession]:
    """
    Vérifie si la requête possède un cookie 'nkyel_review_session' valide.
    """
    session_token = request.cookies.get("nkyel_review_session")
    if not session_token:
        return None

    try:
        async with async_session() as db:
            stmt = select(ReviewSession).where(
                ReviewSession.session_token_hash == session_token,
                ReviewSession.is_active == True,
                ReviewSession.expires_at > datetime.now(timezone.utc)
            )
            result = await db.execute(stmt)
            review_session = result.scalar_one_or_none()
            return review_session
    except Exception as e:
        logger.error(f"Erreur de validation de session review: {e}")
        return None

async def require_review_session(request: Request) -> ReviewSession:
    """
    Dependency pour bloquer l'accès si la session review n'est pas valide.
    """
    session = await get_current_review_session(request)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session d'évaluation invalide ou expirée."
        )
    return session
