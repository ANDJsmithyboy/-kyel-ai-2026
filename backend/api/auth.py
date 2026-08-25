"""
Ñkyel AI — Authentification & Synchronisation Utilisateurs · SmartANDJ AI Technologies
Gère :
- Synchronisation idempotente Clerk → Neon PostgreSQL sur première connexion
- Persistance et chargement des préférences utilisateur (UserPreference)
- Consultation des plafonds et quotas de la Beta Publique (QuotaService)
- Gestion des rôles, permissions et détection superadmin souveraine

Fondateur : Daniel Jonathan ANDJ
"""

import uuid
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_user_id,
    SUPERADMIN_EMAILS,
)
from db.models import User, UserRole, Language, UserPreference, QuotaUsage, BetaAccess, BetaStatus
from db.session import get_db
from services.quota_service import QuotaService

router = APIRouter(prefix="/api/auth", tags=["Authentification & Profils"])


# ── Schémas Pydantic ─────────────────────────────────────────

class SyncClerkUserRequest(BaseModel):
    clerk_id: str
    email: EmailStr
    name: Optional[str] = ""
    avatar_url: Optional[str] = ""


class UserPreferencesUpdateRequest(BaseModel):
    theme: Optional[str] = None
    ui_locale: Optional[str] = None
    agent_language: Optional[str] = None
    density: Optional[str] = None
    timezone: Optional[str] = None
    reduced_motion: Optional[bool] = None


# ── Routes API ───────────────────────────────────────────────

@router.post("/sync-clerk-user", status_code=200)
async def sync_clerk_user(
    body: SyncClerkUserRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Synchronisation idempotente d'un utilisateur Clerk dans Neon PostgreSQL :
    - Crée le profil User s'il n'existe pas encore
    - Initialise les préférences par défaut (UserPreference)
    - Initialise le quota d'accès Beta (QuotaUsage & BetaAccess)
    """
    email_lower = body.email.lower()
    is_super = email_lower in SUPERADMIN_EMAILS

    # 1. Vérifier si l'utilisateur existe déjà par clerk_sub ou email
    stmt = select(User).where((User.clerk_sub == body.clerk_id) | (User.email == body.email))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        # Création du nouvel utilisateur
        user = User(
            clerk_sub=body.clerk_id,
            email=body.email,
            name=body.name or "Pionnier Ñkyel",
            role=UserRole.admin if is_super else UserRole.pro,
            preferred_language=Language.fr,
        )
        db.add(user)
        await db.flush()

        # Initialisation des préférences
        pref = UserPreference(
            user_id=user.id,
            theme="black-panther",
            ui_locale="fr-FR",
            agent_language="auto",
        )
        db.add(pref)

        # Initialisation du suivi de quota
        q_usage = QuotaUsage(
            user_id=user.id,
            images_used=0,
            max_images=3,
            videos_used=0,
            max_videos=1,
            missions_today=0,
            max_missions_day=15,
        )
        db.add(q_usage)

        # Éligibilité Beta
        b_access = BetaAccess(
            user_id=user.id,
            status=BetaStatus.ACTIVE,
            tier="BETA_PIONEER",
        )
        db.add(b_access)
        await db.flush()
    else:
        # Mise à jour idempotente des champs manquants
        if not user.clerk_sub:
            user.clerk_sub = body.clerk_id
        if is_super and user.role != UserRole.admin:
            user.role = UserRole.admin
        await db.flush()

    return {
        "status": "synchronized",
        "user_id": str(user.id),
        "clerk_id": user.clerk_sub,
        "email": user.email,
        "role": user.role.value,
        "is_admin": is_super,
    }


@router.get("/preferences")
async def get_user_preferences(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Récupère les préférences persistées de l'utilisateur."""
    user_id = current_user.get("id")
    try:
        u_uuid = uuid.UUID(str(user_id))
        stmt = select(UserPreference).where(UserPreference.user_id == u_uuid)
        result = await db.execute(stmt)
        pref = result.scalar_one_or_none()
        if pref:
            return {
                "theme": pref.theme,
                "ui_locale": pref.ui_locale,
                "agent_language": pref.agent_language,
                "density": pref.density,
                "timezone": pref.timezone,
                "reduced_motion": pref.reduced_motion,
            }
    except Exception:
        pass

    # Préférences par défaut si non encore persisté
    return {
        "theme": "black-panther",
        "ui_locale": "fr-FR",
        "agent_language": "auto",
        "density": "comfortable",
        "timezone": "Africa/Libreville",
        "reduced_motion": False,
    }


@router.put("/preferences")
async def update_user_preferences(
    body: UserPreferencesUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Met à jour les préférences de l'utilisateur de manière persistante."""
    user_id = current_user.get("id")
    try:
        u_uuid = uuid.UUID(str(user_id))
        stmt = select(UserPreference).where(UserPreference.user_id == u_uuid)
        result = await db.execute(stmt)
        pref = result.scalar_one_or_none()

        if not pref:
            pref = UserPreference(user_id=u_uuid)
            db.add(pref)

        if body.theme is not None:
            pref.theme = body.theme
        if body.ui_locale is not None:
            pref.ui_locale = body.ui_locale
        if body.agent_language is not None:
            pref.agent_language = body.agent_language
        if body.density is not None:
            pref.density = body.density
        if body.timezone is not None:
            pref.timezone = body.timezone
        if body.reduced_motion is not None:
            pref.reduced_motion = body.reduced_motion

        await db.flush()
        return {"status": "updated", "theme": pref.theme, "ui_locale": pref.ui_locale}
    except Exception as e:
        return {"status": "saved_locally", "theme": body.theme or "black-panther"}


@router.get("/quotas")
async def get_user_quotas(
    current_user: dict = Depends(get_current_user),
):
    """Retourne les allocations et quotas produit sans exposition d'infrastructure interne."""
    user_id = str(current_user.get("id", "demo"))
    return QuotaService.get_user_allowance_display(user_id)


@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user),
):
    """Retourne l'identité et le profil complet de l'utilisateur authentifié."""
    return current_user
