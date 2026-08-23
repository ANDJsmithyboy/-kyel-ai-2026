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

# ── Demo user (development only) ─────────────────────────────
_DEMO_USER = {
    "id": "demo-user-1",
    "clerk_id": "user_demo_google",
    "name": "Daniel Jonathan ANDJ",
    "email": "founder@nkyel.ai",
    "credits": 999999,
    "is_admin": True,
    "role": "admin",
}

_DEMO_TOKENS = frozenset({"demo-token-nkyel", "demo", "test"})


def _is_development() -> bool:
    """True si et seulement si l'environnement est explicitement development."""
    return settings.environment.lower() in ("development", "dev", "local")


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> dict:
    """
    Dépendance FastAPI : vérifie le JWT Clerk RS256.

    RÈGLES DE SÉCURITÉ :
    - Production : token obligatoire, JWT vérifié via JWKS, échec = 401
    - Development : tokens démo acceptés, absence de token = demo_user
    """
    # ── Pas de token ──────────────────────────────────────────
    if not credentials or not credentials.credentials:
        if _is_development():
            return _DEMO_USER
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise. Fournissez un token Bearer valide.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # ── Token démo (development uniquement) ───────────────────
    if token in _DEMO_TOKENS:
        if _is_development():
            return _DEMO_USER
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tokens de démonstration non acceptés en production.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Vérification JWT Clerk RS256 via JWKS ─────────────────
    try:
        public_key = await _get_signing_key(token)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        clerk_user_id: Optional[str] = payload.get("sub")
        if not clerk_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token JWT invalide : identifiant utilisateur manquant.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        from core.database import get_user_by_clerk_id
        user = await get_user_by_clerk_id(clerk_user_id)
        if user:
            return user

        # Utilisateur Clerk valide mais pas encore dans notre DB
        # → le créer ou retourner un profil minimal
        return {
            "id": clerk_user_id,
            "clerk_id": clerk_user_id,
            "name": payload.get("name", ""),
            "email": payload.get("email", ""),
            "credits": 100,
            "is_admin": False,
            "role": "member",
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expiré. Veuillez vous reconnecter.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token JWT invalide : {type(e).__name__}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception as e:
        # En production, JAMAIS de fallback silencieux
        if _is_development():
            return _DEMO_USER
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Erreur de vérification d'authentification.",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> Optional[dict]:
    """Retourne l'utilisateur connecté s'il existe, ou None si non authentifié."""
    if not credentials or not credentials.credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


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


@lru_cache(maxsize=1)
def _get_jwks_client():
    """Retourne un PyJWKClient pour les clés JWKS Clerk."""
    return jwt.PyJWKClient(settings.clerk_jwks_url, cache_keys=True)


async def _get_signing_key(token: str):
    """Récupère la clé publique Clerk via JWKS pour vérifier le JWT."""
    client = _get_jwks_client()
    signing_key = client.get_signing_key_from_jwt(token)
    return signing_key.key


