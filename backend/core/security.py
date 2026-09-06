"""
Ñkyel AI — Core Security · SmartANDJ AI Technologies
Authentification Clerk RS256 (via SDK officiel clerk-backend-api)
+ fallback JWT local HS256 pour dev.
Fondateur : Daniel Jonathan ANDJ
"""

import os
import time
import asyncio
import hmac
import hashlib
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from functools import lru_cache

import httpx
import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.config import settings

logger = logging.getLogger(__name__)

security_scheme = HTTPBearer(auto_error=False)

# ── Superadministrateurs avec accès illimités ─────────────────
SUPERADMIN_EMAILS = frozenset({
    "jonathanakarentoutoume@gmail.com",
    "smartandjiatechnologies@gmail.com",
    "smartandjaitechnologies@gmail.com",
})

SUPERADMIN_MASTER_PASSWORD = os.environ.get("SUPERADMIN_MASTER_PASSWORD", "")

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


# ══════════════════════════════════════════════════════════════
# UPSERT: Crée l'utilisateur en base Neon s'il n'existe pas
# ══════════════════════════════════════════════════════════════

async def _upsert_user_from_clerk(clerk_user_id: str, email: str, name: str = "") -> dict:
    """
    Vérifie si l'utilisateur existe dans Neon. Sinon, le crée (UPSERT).
    Retourne toujours un dict utilisateur valide.
    """
    from core.database import get_user_by_clerk_id
    user = await get_user_by_clerk_id(clerk_user_id)
    if user:
        return user

    # L'utilisateur n'existe pas encore → INSERT
    try:
        from db.session import async_session
        from sqlalchemy import text

        is_super = email.lower() in SUPERADMIN_EMAILS if email else False
        async with async_session() as session:
            result = await session.execute(
                text("""
                    INSERT INTO users (clerk_user_id, primary_email, display_name, created_at, updated_at)
                    VALUES (:clerk_user_id, :primary_email, :display_name, NOW(), NOW())
                    ON CONFLICT (clerk_user_id) DO UPDATE SET primary_email = EXCLUDED.primary_email, updated_at = NOW()
                    RETURNING *
                """),
                {
                    "clerk_user_id": clerk_user_id,
                    "primary_email": email or "",
                    "display_name": name or "",
                },
            )
            await session.commit()
            row = result.mappings().first()
            if row:
                internal_user_id = row["id"]
                # Ensure personal workspace exists
                await session.execute(
                    text("""
                        INSERT INTO workspaces (id, name, slug, workspace_type, owner_user_id, status, created_at, updated_at)
                        VALUES (gen_random_uuid(), :ws_name, :ws_slug, 'PERSONAL', :owner_id, 'ACTIVE', NOW(), NOW())
                        ON CONFLICT (slug) DO NOTHING
                    """),
                    {
                        "ws_name": f"{name or 'User'}'s Workspace",
                        "ws_slug": f"personal-{internal_user_id}",
                        "owner_id": internal_user_id
                    }
                )
                
                # Fetch the workspace ID to ensure we add the user as a member
                ws_res = await session.execute(
                    text("SELECT id FROM workspaces WHERE owner_user_id = :owner_id AND workspace_type = 'PERSONAL' LIMIT 1"),
                    {"owner_id": internal_user_id}
                )
                ws_row = ws_res.mappings().first()
                if ws_row:
                    ws_id = ws_row["id"]
                    await session.execute(
                        text("""
                            INSERT INTO workspace_members (id, workspace_id, user_id, role, status, joined_at, created_at, updated_at)
                            VALUES (gen_random_uuid(), :ws_id, :user_id, 'OWNER', 'ACTIVE', NOW(), NOW(), NOW())
                            ON CONFLICT (workspace_id, user_id) DO NOTHING
                        """),
                        {"ws_id": ws_id, "user_id": internal_user_id}
                    )
                await session.commit()
                
                logger.info(f"✅ Nouvel utilisateur créé/mis à jour dans Neon: {clerk_user_id} ({email})")
                d = dict(row)
                d["clerk_id"] = d.get("clerk_user_id")
                d["email"] = d.get("primary_email")
                d["name"] = d.get("display_name")
                d["is_admin"] = is_super
                d["role"] = "admin" if is_super else "member"
                d["credits"] = 999999999 if is_super else 100
                return d
    except Exception as e:
        logger.warning(f"⚠️ Impossible d'insérer l'utilisateur {clerk_user_id}: {e}")

    # Fallback: retourner un dict minimal sans persistance
    is_super = email.lower() in SUPERADMIN_EMAILS if email else False
    return {
        "id": clerk_user_id,
        "clerk_id": clerk_user_id,
        "name": name or ("Jonathan ANDJ" if is_super else ""),
        "email": email or "",
        "credits": 999999999 if is_super else 100,
        "is_admin": is_super,
        "role": "admin" if is_super else "member",
    }


# ══════════════════════════════════════════════════════════════
# CLERK RS256 JWKS Verification (Cached + Rotation + Strict Claims)
# ══════════════════════════════════════════════════════════════

class ClerkJWKSManager:
    """
    Gestionnaire robuste de JWKS Clerk avec cache mémoire, TTL,
    rotation automatique des clés et gestion des erreurs/timeouts.
    """
    def __init__(self, jwks_url: str, ttl_seconds: int = 3600, timeout: float = 5.0):
        self.jwks_url = jwks_url
        self.ttl_seconds = ttl_seconds
        self.timeout = timeout
        self._keys: Dict[str, Any] = {}
        self._last_fetched: float = 0.0
        self._lock = asyncio.Lock()

    async def _fetch_jwks(self) -> Dict[str, Any]:
        """Télécharge le JWKS public depuis l'URL Clerk."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(self.jwks_url)
            resp.raise_for_status()
            data = resp.json()
            jwk_set = jwt.PyJWKSet.from_dict(data)
            new_keys = {}
            for jwk in jwk_set.keys:
                new_keys[jwk.key_id] = jwk.key
            return new_keys

    async def get_signing_key(self, kid: str) -> Any:
        """
        Récupère la clé de signature correspondant au kid.
        Si la clé n'est pas trouvée ou si le cache a expiré,
        rafraîchit le JWKS une fois (rotation de clé Clerk).
        """
        now = time.time()
        # 1. Vérifier si la clé est déjà en cache valide
        if kid in self._keys and (now - self._last_fetched < self.ttl_seconds):
            return self._keys[kid]

        # 2. Clé manquante ou cache expiré -> rafraîchir sous lock
        async with self._lock:
            # Re-check après acquisition du lock
            now = time.time()
            if kid in self._keys and (now - self._last_fetched < self.ttl_seconds):
                return self._keys[kid]

            try:
                logger.info(f"🔄 Rafraîchissement JWKS Clerk depuis {self.jwks_url}...")
                new_keys = await self._fetch_jwks()
                self._keys = new_keys
                self._last_fetched = time.time()
            except Exception as e:
                logger.error(f"❌ Échec de récupération JWKS Clerk ({self.jwks_url}): {e}")
                if kid in self._keys:
                    return self._keys[kid]
                raise

            if kid not in self._keys:
                raise jwt.InvalidTokenError(
                    f"Clé de signature Clerk 'kid={kid}' introuvable dans le JWKS."
                )

            return self._keys[kid]


_jwks_manager: Optional[ClerkJWKSManager] = None


def _get_clerk_jwks_manager() -> ClerkJWKSManager:
    global _jwks_manager
    if _jwks_manager is None or _jwks_manager.jwks_url != settings.clerk_jwks_url:
        _jwks_manager = ClerkJWKSManager(settings.clerk_jwks_url, ttl_seconds=3600, timeout=5.0)
    return _jwks_manager


async def _verify_clerk_token(token: str) -> dict:
    """
    Vérifie un JWT Clerk de manière stricte:
    1. Algorithme RS256 obligatoire
    2. Lookup kid & rotation automatique des clés JWKS
    3. Option B (clerk_jwt_key) en fallback/mode offline
    4. Validation stricte de exp, nbf, iat
    5. Validation de iss (Issuer)
    6. Validation de azp (Authorized Party)
    """
    # 1. Décoder le header sans vérifier pour inspecter alg et kid
    try:
        unverified_header = jwt.get_unverified_header(token)
    except Exception as e:
        raise jwt.InvalidTokenError(f"Header JWT malformé: {e}")

    alg = unverified_header.get("alg")
    if alg != "RS256":
        raise jwt.InvalidAlgorithmError(
            f"Algorithme JWT non autorisé: '{alg}'. Seul RS256 est accepté."
        )

    kid = unverified_header.get("kid")

    # 2. Obtenir la clé publique de signature
    signing_key = None

    # Option B: Clé PEM statique configurée (fallback / local)
    if settings.clerk_jwt_key:
        try:
            pem_key = settings.clerk_jwt_key.strip()
            if not pem_key.startswith("-----BEGIN"):
                pem_key = f"-----BEGIN PUBLIC KEY-----\n{pem_key}\n-----END PUBLIC KEY-----"
            signing_key = pem_key
        except Exception as e:
            logger.warning(f"⚠️ Erreur parsing clerk_jwt_key: {e}")

    # Option A: JWKS dynamique (recommandé en production)
    if not signing_key:
        if not kid:
            raise jwt.InvalidTokenError("Token JWT Clerk sans 'kid' dans le header.")
        manager = _get_clerk_jwks_manager()
        signing_key = await manager.get_signing_key(kid)

    # 3. Validation du token avec vérification exp, nbf, iss, azp
    decode_kwargs: Dict[str, Any] = {
        "algorithms": ["RS256"],
        "options": {
            "verify_signature": True,
            "verify_exp": True,
            "verify_nbf": True,
            "verify_iat": True,
            "verify_aud": False,  # Clerk n'inclut pas aud par défaut
        },
        "leeway": 10,  # 10 secondes de tolérance horloge
    }

    # Validation de l'issuer si configuré
    if settings.clerk_issuer:
        decode_kwargs["issuer"] = settings.clerk_issuer
        decode_kwargs["options"]["verify_iss"] = True

    payload = jwt.decode(token, signing_key, **decode_kwargs)

    # 4. Validation explicite et stricte de l'authorized party (azp)
    authorized_parties = [p.rstrip("/") for p in settings.clerk_authorized_parties_list]
    if authorized_parties:
        azp = str(payload.get("azp") or "").rstrip("/")
        if not azp:
            raise jwt.InvalidTokenError(
                "Token Clerk rejeté: claim 'azp' (authorized party) absent."
            )
        if azp not in authorized_parties:
            raise jwt.InvalidTokenError(
                f"Token azp '{azp}' non autorisé. Origines autorisées: {authorized_parties}"
            )

    return payload


# ══════════════════════════════════════════════════════════════
# MAIN AUTH DEPENDENCY
# ══════════════════════════════════════════════════════════════

async def get_current_user(
    request: Request = None,  # type: ignore[assignment]
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> dict:
    """
    Dépendance FastAPI : vérifie le JWT Clerk RS256 ou JWT local,
    ou session d'évaluation Google Review isolée.
    Attribue automatiquement les droits illimités aux superadmins.
    """
    token = credentials.credentials if credentials else ""

    # ── Vérification session Google Review isolée ─────────────
    if (not token or token.startswith("rev_sess_")) and request:
        try:
            from middleware.review_auth import get_current_review_session
            review_session = await get_current_review_session(request)
            if review_session:
                from db.session import async_session
                from sqlalchemy import text
                async with async_session() as db:
                    res = await db.execute(text("SELECT id, clerk_user_id, primary_email, display_name FROM users WHERE clerk_user_id = 'user_google_reviewer'"))
                    user_row = res.fetchone()
                    if user_row:
                        return {
                            "id": str(user_row[0]),
                            "clerk_id": str(user_row[1]),
                            "email": str(user_row[2] or "google-reviewer@nkyel.smartandjai.com"),
                            "name": str(user_row[3] or "Google Reviewer"),
                            "credits": 500000,
                            "is_admin": False,
                            "role": "reviewer",
                            "is_review": True,
                            "review_session_id": str(review_session.id),
                        }
        except Exception as e:
            logger.warning(f"Review session resolution notice: {e}")

    # ── Pas de token ──────────────────────────────────────────
    if not token:
        if _is_development():
            return _DEMO_USER
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise. Fournissez un token Bearer valide.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Token démo (development uniquement) ───────────────────
    if token in _DEMO_TOKENS:
        if _is_development():
            return _DEMO_USER
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tokens de démonstration non acceptés en production.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Vérification token local HS256 (development uniquement) ──
    try:
        if not _is_development():
            raise jwt.InvalidTokenError("HS256 local tokens are development-only.")
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
        payload = await _verify_clerk_token(token)
        clerk_user_id: Optional[str] = payload.get("sub")
        if not clerk_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token JWT invalide : identifiant utilisateur manquant.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        email = str(payload.get("email", "")).lower()
        name = payload.get("name", "")
        is_super = email in SUPERADMIN_EMAILS

        # UPSERT: Crée l'utilisateur en base Neon s'il n'existe pas
        user = await _upsert_user_from_clerk(clerk_user_id, email, name)

        if user.get("email", "").lower() in SUPERADMIN_EMAILS or is_super:
            user["is_admin"] = True
            user["role"] = "super_admin"
            user["plan"] = "internal_unlimited"
            user["billing_exempt"] = True
            user["credits"] = 999999999
        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expiré. Veuillez vous reconnecter.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"⚠️ Clerk JWT rejeté: {type(e).__name__}: {e}")
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
        return await get_current_user(request=None, credentials=credentials)
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
    request: Request = None,  # type: ignore[assignment]
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
