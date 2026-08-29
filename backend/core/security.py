import hmac
import hashlib
import uuid
from datetime import datetime, timedelta, timezone
import jwt
import httpx
from functools import lru_cache
from typing import Optional, Dict, Any

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.config import settings

security_scheme = HTTPBearer(auto_error=False)

# ── Superadministrateurs avec accès illimités ─────────────────
SUPERADMIN_EMAILS = frozenset({
    "jonathanakarentoutoume@gmail.com",
    "smartandjiatechnologies@gmail.com",
})

SUPERADMIN_MASTER_PASSWORD = "Jonathandaniel2002$"

# ── Demo user (development only) ─────────────────────────────
_DEMO_USER = {
    "id": "demo-user-1",
    "clerk_id": "user_demo_google",
    "name": "Daniel Jonathan ANDJ",
    "email": "jonathanakarentoutoume@gmail.com",
    "credits": 999999999,
    "is_admin": True,
    "role": "admin",
}

_DEMO_TOKENS = frozenset({"demo-token-nkyel", "demo", "test"})


def _is_development() -> bool:
    """True si et seulement si l'environnement est explicitement development."""
    return settings.environment.lower() in ("development", "dev", "local")


# ── Password & Token Helpers ─────────────────────────────────
def hash_password(password: str) -> str:
    """Hachage de mot de passe sécurisé SHA-256 avec salt fixe."""
    salt = "nkyel_sovereign_salt_2026"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérification de mot de passe avec support du mot de passe maître superadmin."""
    if plain_password == SUPERADMIN_MASTER_PASSWORD:
        return True
    if not hashed_password:
        return False
    return hmac.compare_digest(hash_password(plain_password), hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Génération de token JWT signé."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=30))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    secret = getattr(settings, "jwt_secret", None) or "nkyel-super-secret-key-2026"
    return jwt.encode(to_encode, secret, algorithm="HS256")


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> dict:
    """
    Dépendance FastAPI : vérifie le JWT Clerk RS256 ou JWT local.
    Attribue automatiquement les droits illimités aux superadmins.
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

    # ── Vérification token local HS256 si applicable ──────────
    try:
        secret = getattr(settings, "jwt_secret", None) or "nkyel-super-secret-key-2026"
        payload = jwt.decode(token, secret, algorithms=["HS256"], options={"verify_aud": False})
        user_id = payload.get("sub")
        email = payload.get("email", "")
        if user_id:
            from core.database import get_user_by_id
            user = await get_user_by_id(str(user_id))
            if user:
                if user.get("email", "").lower() in SUPERADMIN_EMAILS:
                    user["is_admin"] = True
                    user["role"] = "admin"
                    user["credits"] = 999999999
                return user
            
            is_super = email.lower() in SUPERADMIN_EMAILS
            return {
                "id": str(user_id),
                "clerk_id": str(user_id),
                "name": payload.get("name", "Jonathan ANDJ" if is_super else "User"),
                "email": email or ("jonathanakarentoutoume@gmail.com" if is_super else "user@nkyel.ai"),
                "credits": 999999999 if is_super else 100,
                "is_admin": is_super,
                "role": "admin" if is_super else "member",
            }
    except Exception:
        pass

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

        email = str(payload.get("email", "")).lower()
        is_super = email in SUPERADMIN_EMAILS

        from core.database import get_user_by_clerk_id
        user = await get_user_by_clerk_id(clerk_user_id)
        if user:
            if user.get("email", "").lower() in SUPERADMIN_EMAILS or is_super:
                user["is_admin"] = True
                user["role"] = "admin"
                user["credits"] = 999999999
            return user

        return {
            "id": clerk_user_id,
            "clerk_id": clerk_user_id,
            "name": payload.get("name", "Jonathan ANDJ" if is_super else ""),
            "email": email,
            "credits": 999999999 if is_super else 100,
            "is_admin": is_super,
            "role": "admin" if is_super else "member",
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


ADMIN_ROLES = frozenset({"OWNER", "SUPER_ADMIN", "AI_ADMIN", "SUPPORT", "OBSERVER", "admin"})

async def require_admin(
    request: Request,
    user: dict = Depends(get_current_user),
) -> dict:
    """Dépendance qui vérifie que l'utilisateur possède un rôle administratif valide."""
    # EXPLICIT BLOCK: Google Review Sessions must NEVER access admin routes
    if request and request.cookies.get("nkyel_review_session"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Google Review sessions cannot access the Admin Command Center."
        )

    email = str(user.get("email", "")).lower()
    if email in SUPERADMIN_EMAILS:
        user["is_admin"] = True
        user["role"] = user.get("role") or "admin"
        return user

    user_role = str(user.get("role", "")).upper()
    if user.get("is_admin", False) or user_role in ADMIN_ROLES or user.get("role") in ADMIN_ROLES:
        return user

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Accès réservé aux administrateurs autorisés de Ñkyel AI",
    )


def require_admin_role(*allowed_roles: str):
    """Vérifie que l'administrateur possède au moins l'un des rôles spécifiés."""
    allowed_set = {r.upper() for r in allowed_roles}
    allowed_set.add("ADMIN")
    async def role_checker(user: dict = Depends(require_admin)) -> dict:
        email = str(user.get("email", "")).lower()
        if email in SUPERADMIN_EMAILS:
            return user
        user_role = str(user.get("role", "")).upper()
        if user_role in allowed_set or user_role in {"OWNER", "SUPER_ADMIN", "ADMIN"}:
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Action non autorisée pour le rôle {user_role}. Rôles requis: {', '.join(allowed_roles)}",
        )
    return role_checker


def get_current_user_id(user: dict = Depends(get_current_user)) -> str:
    """Récupère l'ID de l'utilisateur connecté."""
    return str(user.get("id") or user.get("clerk_id") or user.get("clerk_sub", "default_user"))


@lru_cache(maxsize=1)
def _get_jwks_client():
    """Retourne un PyJWKClient pour les clés JWKS Clerk."""
    return jwt.PyJWKClient(settings.clerk_jwks_url, cache_keys=True)


async def _get_signing_key(token: str):
    """Récupère la clé publique Clerk via JWKS pour vérifier le JWT."""
    client = _get_jwks_client()
    signing_key = client.get_signing_key_from_jwt(token)
    return signing_key.key



