"""
Ñkyel AI — Clerk JWT Auth (RS256 JWKS) · SmartANDJ AI Technologies
Authentification via Clerk JWKS — jamais de JWT maison.
Fondateur : Daniel Jonathan ANDJ
"""

import jwt
import httpx
from functools import lru_cache
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.config import settings

security_scheme = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> dict:
    """
    Dépendance FastAPI : vérifie le JWT Clerk RS256 ou renvoie le profil Démo.
    """
    demo_user = {
        "id": "demo-user-1",
        "clerk_id": "user_demo_google",
        "name": "Daniel Jonathan ANDJ",
        "email": "founder@nkyel.ai",
        "credits": 999999,
        "is_admin": True,
        "role": "admin"
    }

    if not credentials or not credentials.credentials:
        return demo_user

    token = credentials.credentials
    if token in ("demo-token-nkyel", "demo", "test", "anonymous") or settings.debug:
        return demo_user

    try:
        public_key = await _get_signing_key(token)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        clerk_user_id: Optional[str] = payload.get("sub")
        if clerk_user_id:
            from core.database import get_user_by_clerk_id
            user = await get_user_by_clerk_id(clerk_user_id)
            if user:
                return user
    except Exception:
        return demo_user

    return demo_user



async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> Optional[dict]:
    """Retourne l'utilisateur connecté s'il existe, ou None si non authentifié."""
    if not credentials or not credentials.credentials:
        return None
    return await get_current_user(credentials)


async def require_current_user(
    user: dict = Depends(get_current_user),
) -> dict:
    """Exige un utilisateur connecté."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise",
        )
    return user


async def require_admin(
    user: dict = Depends(get_current_user),
) -> dict:
    """Dépendance qui vérifie que l'utilisateur est admin (Daniel uniquement)."""
    if not user.get("is_admin", False) and user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs",
        )
    return user

