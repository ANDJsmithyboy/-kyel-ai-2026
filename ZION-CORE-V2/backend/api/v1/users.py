"""
GabomaAI — API v1 Users · SmartANDJ AI Technologies
Profil utilisateur.
Protégé par Clerk JWKS.
Fondateur : Daniel Jonathan ANDJ
"""

from fastapi import APIRouter, Depends
from core.security import get_current_user

router = APIRouter(prefix="/v1", tags=["Users v1"])


@router.get("/users/me")
async def get_me(user: dict = Depends(get_current_user)):
    """
    Retourne le profil de l'utilisateur connecté depuis Neon.
    """
    # Masquer les champs sensibles si nécessaire, bien que `user` soit un dict Neon.
    # Les JWT Clerk et informations publiques sont déjà safe.
    
    # On renvoie les clés principales
    return {
        "id": user.get("id"),
        "clerk_id": user.get("clerk_id"),
        "email": user.get("email"),
        "full_name": user.get("full_name"),
        "avatar_url": user.get("avatar_url"),
        "tier": user.get("tier"),
        "credits": user.get("credits"),
        "credits_used": user.get("credits_used"),
        "is_admin": user.get("is_admin", False),
        "beta_pioneer": user.get("beta_pioneer", False),
        "created_at": user.get("created_at")
    }
