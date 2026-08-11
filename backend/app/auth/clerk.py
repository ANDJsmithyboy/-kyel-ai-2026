"""
Ñkyel AI · Clerk JWT Auth Middleware
Vérifie les tokens Clerk pour sécuriser les endpoints.
"""

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
from functools import lru_cache

from app.config import settings

security = HTTPBearer(auto_error=False)

# Cache des clés publiques Clerk (JWKS)
_jwks_cache: dict = {}


async def _fetch_clerk_jwks() -> dict:
    """Récupère les clés publiques Clerk pour la vérification JWT."""
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.clerk.dev/v1/jwks",
                headers={"Authorization": f"Bearer {settings.clerk_secret_key}"},
            )
            resp.raise_for_status()
            _jwks_cache = resp.json()
            return _jwks_cache
    except Exception:
        return {}


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Dépendance FastAPI — extrait et vérifie le JWT Clerk.
    Retourne le payload décodé avec sub, email, etc.
    """
    # En développement, autoriser sans auth si pas de clé Clerk
    if not settings.clerk_secret_key:
        return {"sub": "dev-user", "email": "dev@nkyelai.com", "dev_mode": True}

    if not credentials:
        raise HTTPException(status_code=401, detail="Token d'authentification requis")

    token = credentials.credentials

    try:
        jwks = await _fetch_clerk_jwks()
        if not jwks or "keys" not in jwks:
            raise HTTPException(status_code=500, detail="Impossible de récupérer les clés Clerk")

        # Décoder le header pour trouver le bon kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == kid:
                rsa_key = key
                break

        if not rsa_key:
            raise HTTPException(status_code=401, detail="Clé de signature inconnue")

        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return payload

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token invalide: {str(e)}")
