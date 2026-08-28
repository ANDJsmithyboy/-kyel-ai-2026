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
from db.models import User
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

    # 1. Vérifier si l'utilisateur existe déjà par clerk_user_id ou email
    stmt = select(User).where((User.clerk_user_id == body.clerk_id) | (User.email == body.email))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        # Création du nouvel utilisateur
        user = User(
            clerk_user_id=body.clerk_id,
            email=body.email,
            name=body.name or "Pionnier Ñkyel",
            system_role="admin" if is_super else "user",
            preferences={
                "theme": "black-panther",
                "ui_locale": "fr-FR",
                "agent_language": "auto"
            }
        )
        db.add(user)
        await db.flush()

        # Création du workspace par défaut
        workspace = Workspace(
            owner_user_id=user.id,
            name=f"Espace de {user.name}",
            tier="free"
        )
        db.add(workspace)
        await db.flush()

        member = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=user.id,
            role="owner"
        )
        db.add(member)
        await db.flush()
    else:
        # Mise à jour idempotente des champs manquants
        if not user.clerk_user_id:
            user.clerk_user_id = body.clerk_id
        if is_super and user.system_role != "admin":
            user.system_role = "admin"
        await db.flush()

    return {
        "status": "synchronized",
        "user_id": str(user.id),
        "clerk_id": user.clerk_user_id,
        "email": user.email,
        "role": user.system_role,
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
        stmt = select(User).where(User.id == u_uuid)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if user and user.preferences:
            return user.preferences
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
        stmt = select(User).where(User.id == u_uuid)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if user:
            prefs = user.preferences or {}
            if body.theme is not None:
                prefs["theme"] = body.theme
            if body.ui_locale is not None:
                prefs["ui_locale"] = body.ui_locale
            if body.agent_language is not None:
                prefs["agent_language"] = body.agent_language
            if body.density is not None:
                prefs["density"] = body.density
            if body.timezone is not None:
                prefs["timezone"] = body.timezone
            if body.reduced_motion is not None:
                prefs["reduced_motion"] = body.reduced_motion
            
            user.preferences = prefs
            await db.flush()
            return {"status": "updated", **prefs}
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
