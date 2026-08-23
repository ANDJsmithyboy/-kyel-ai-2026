"""
Ñkyel AI — Authentification API · SmartANDJ AI Technologies
Register, Login, Me — JWT Bearer tokens.
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_id,
)
from db.models import User, UserRole, Language
from db.session import get_db

router = APIRouter(prefix="/api/auth", tags=["Authentification"])


# ── Schémas Pydantic ─────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str
    preferred_language: Language = Language.fr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    preferred_language: str
    created_at: str


# ── Routes ───────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    """Inscription d'un nouvel utilisateur avec détection superadmin."""
    from core.security import SUPERADMIN_EMAILS
    email_lower = body.email.lower()
    is_super = email_lower in SUPERADMIN_EMAILS

    # Vérifier si l'email existe déjà
    existing = await db.execute(
        select(User).where(User.email == body.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cet email est déjà utilisé",
        )

    # Créer l'utilisateur
    user = User(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
        role=UserRole.admin if is_super else UserRole.free,
        preferred_language=body.preferred_language,
    )
    db.add(user)
    await db.flush()

    # Générer le token
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role.value})

    return AuthResponse(
        access_token=token,
        user={
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role.value,
            "preferred_language": user.preferred_language.value,
            "credits": 999999999 if is_super else 100,
            "is_admin": is_super,
        },
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    """Connexion d'un utilisateur existant ou provisionnement superadmin direct."""
    from core.security import SUPERADMIN_EMAILS, SUPERADMIN_MASTER_PASSWORD
    email_lower = body.email.lower()
    is_super = email_lower in SUPERADMIN_EMAILS

    result = await db.execute(
        select(User).where(User.email == body.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        if is_super and verify_password(body.password, ""):
            # Créer automatiquement le compte superadmin s'il n'existe pas encore en base
            user = User(
                email=body.email,
                name="Daniel Jonathan ANDJ" if "jonathan" in email_lower else "SmartANDJ Technologies Admin",
                hashed_password=hash_password(body.password),
                role=UserRole.admin,
                preferred_language=Language.fr,
            )
            db.add(user)
            await db.flush()
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect",
            )
    else:
        if not verify_password(body.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect",
            )

    if is_super and user.role != UserRole.admin:
        user.role = UserRole.admin
        await db.flush()

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé. Contactez l'administrateur.",
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role.value})

    return AuthResponse(
        access_token=token,
        user={
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role.value,
            "preferred_language": user.preferred_language.value,
            "credits": 999999999 if is_super else 100,
            "is_admin": is_super,
        },
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Récupère le profil de l'utilisateur connecté."""
    result = await db.execute(
        select(User).where(User.id == uuid.UUID(user_id))
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable",
        )

    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role.value,
        preferred_language=user.preferred_language.value,
        created_at=user.created_at.isoformat(),
    )
