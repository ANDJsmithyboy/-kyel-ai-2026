"""
Ñkyel AI — User Settings API · Neon PostgreSQL  
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

PRODUCTION CONTRACT: Settings persist in Neon, NOT localStorage.
After refresh: theme, language, model, density — all restored.
"""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import get_current_user, get_current_user_id
from db.models import User, UserSettings, WorkspaceSettings, Workspace, WorkspaceMember
from db.session import get_db

router = APIRouter(prefix="/settings", tags=["Settings"])


# ── Schemas ─────────────────────────────────────────────────

class UserSettingsResp(BaseModel):
    theme: Optional[str] = "DARK"
    accent: Optional[str] = "GOLD"
    text_size: Optional[str] = "MEDIUM"
    density: Optional[str] = "COMFORTABLE"
    language: Optional[str] = "fr-FR"
    default_model_profile: Optional[str] = "NKYEL_RESEARCH"
    reduced_motion: bool = False
    sidebar_collapsed: bool = False
    show_sources: bool = True
    show_artifacts: bool = True
    show_reasoning: bool = False
    developer_mode: bool = False
    keyboard_shortcuts: bool = True

    class Config:
        from_attributes = True


class UserSettingsUpdateReq(BaseModel):
    theme: Optional[str] = None
    accent: Optional[str] = None
    text_size: Optional[str] = None
    density: Optional[str] = None
    language: Optional[str] = None
    default_model_profile: Optional[str] = None
    reduced_motion: Optional[bool] = None
    sidebar_collapsed: Optional[bool] = None
    show_sources: Optional[bool] = None
    show_artifacts: Optional[bool] = None
    show_reasoning: Optional[bool] = None
    developer_mode: Optional[bool] = None
    keyboard_shortcuts: Optional[bool] = None


class UserProfileResp(BaseModel):
    id: str
    clerk_user_id: str
    primary_email: Optional[str]
    display_name: Optional[str]
    avatar_url: Optional[str]
    locale: Optional[str]
    status: str
    settings: Optional[UserSettingsResp]

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════
# USER PROFILE & SETTINGS
# ══════════════════════════════════════════════════════════════

@router.get("/profile", response_model=UserProfileResp)
async def get_my_profile(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get current user profile with settings from Neon."""
    # First try by clerk_id, then by uuid
    stmt = select(User).where(User.clerk_user_id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        try:
            uid = uuid.UUID(user_id)
            stmt = select(User).where(User.id == uid)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
        except ValueError:
            pass

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable dans Neon")

    return user


@router.get("/user", response_model=UserSettingsResp)
async def get_user_settings(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get user settings from Neon. Returns defaults if none exist."""
    # Find user by clerk_id
    stmt = select(User).where(User.clerk_user_id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        # Return defaults if user not yet synced
        return UserSettingsResp()

    stmt = select(UserSettings).where(UserSettings.user_id == user.id)
    result = await db.execute(stmt)
    settings = result.scalar_one_or_none()

    if not settings:
        # Create default settings
        settings = UserSettings(user_id=user.id)
        db.add(settings)
        await db.flush()
        await db.refresh(settings)

    return settings


@router.patch("/user", response_model=UserSettingsResp)
async def update_user_settings(
    req: UserSettingsUpdateReq,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update user settings in Neon. Creates if not exists."""
    # Find user
    stmt = select(User).where(User.clerk_user_id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    stmt = select(UserSettings).where(UserSettings.user_id == user.id)
    result = await db.execute(stmt)
    settings = result.scalar_one_or_none()

    if not settings:
        settings = UserSettings(user_id=user.id)
        db.add(settings)
        await db.flush()

    # Apply updates
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(settings, key, value)

    await db.flush()
    await db.refresh(settings)
    return settings


# ══════════════════════════════════════════════════════════════
# USER SYNC (Clerk → Neon)
# ══════════════════════════════════════════════════════════════

class UserSyncReq(BaseModel):
    clerk_user_id: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserSyncResp(BaseModel):
    id: str
    clerk_user_id: str
    workspace_id: str
    is_new: bool


@router.post("/sync", response_model=UserSyncResp)
async def sync_user(
    req: UserSyncReq,
    db: AsyncSession = Depends(get_db),
):
    """
    Called after Clerk login. Ensures user + default workspace exist in Neon.
    Idempotent: safe to call on every login.
    """
    stmt = select(User).where(User.clerk_user_id == req.clerk_user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    is_new = False

    if not user:
        user = User(
            clerk_user_id=req.clerk_user_id,
            primary_email=req.email,
            display_name=req.display_name or "Utilisateur Ñkyel",
            avatar_url=req.avatar_url,
            status="ACTIVE",
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        is_new = True

    else:
        # Update fields that may have changed in Clerk
        if req.email and req.email != user.primary_email:
            user.primary_email = req.email
        if req.display_name and req.display_name != user.display_name:
            user.display_name = req.display_name
        if req.avatar_url and req.avatar_url != user.avatar_url:
            user.avatar_url = req.avatar_url
        from datetime import datetime, timezone
        user.last_seen_at = datetime.now(timezone.utc)
        await db.flush()

    # Ensure default workspace exists
    stmt = select(Workspace).where(Workspace.owner_user_id == user.id)
    result = await db.execute(stmt)
    workspace = result.scalars().first()

    if not workspace:
        workspace = Workspace(
            name=f"Espace de {user.display_name or 'travail'}",
            workspace_type="PERSONAL",
            owner_user_id=user.id,
            status="ACTIVE",
        )
        db.add(workspace)
        await db.flush()
        await db.refresh(workspace)

        # Add user as workspace member
        member = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=user.id,
            role="OWNER",
            status="ACTIVE",
        )
        db.add(member)
        await db.flush()

    return UserSyncResp(
        id=str(user.id),
        clerk_user_id=user.clerk_user_id,
        workspace_id=str(workspace.id),
        is_new=is_new,
    )
