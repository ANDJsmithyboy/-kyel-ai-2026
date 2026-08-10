"""
GabomaAI — Clerk JWT Auth (RS256 JWKS) · SmartANDJ AI Technologies
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

security_scheme = HTTPBearer()


@lru_cache(maxsize=1)
def _cached_jwks_url() -> str:
    return settings.clerk_jwks_url


async def get_clerk_jwks() -> dict:
    """Récupère les clés publiques Clerk via JWKS endpoint."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(_cached_jwks_url())
        resp.raise_for_status()
        return resp.json()


async def _get_signing_key(token: str) -> jwt.algorithms.RSAAlgorithm:
    """Extrait la clé publique RSA correspondant au kid du token."""
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")
    if not kid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token JWT invalide : kid manquant",
        )

    jwks = await get_clerk_jwks()
    for key_data in jwks.get("keys", []):
        if key_data.get("kid") == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key_data)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Clé publique Clerk introuvable pour ce token",
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict:
    """
    Dépendance FastAPI : vérifie le JWT Clerk RS256 et charge l'utilisateur Neon.
    Retourne un dict avec toutes les colonnes de la table users.
    """
    token = credentials.credentials

    try:
        public_key = await _get_signing_key(token)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expiré",
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token invalide : {e}",
        )

    clerk_user_id: Optional[str] = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide : sub manquant",
        )

    # Charger l'utilisateur depuis Neon
    from core.database import get_user_by_clerk_id
    user = await get_user_by_clerk_id(clerk_user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé dans la base de données",
        )

    if user.get("is_banned", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Compte suspendu : {user.get('ban_reason', 'Contactez le support')}",
        )

    return user


async def require_admin(
    user: dict = Depends(get_current_user),
) -> dict:
    """Dépendance qui vérifie que l'utilisateur est admin (Daniel uniquement)."""
    if not user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs",
        )
    return user
