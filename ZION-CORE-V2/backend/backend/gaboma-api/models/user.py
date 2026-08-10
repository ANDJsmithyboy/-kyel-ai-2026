# FILE: gaboma-api/models/user.py
from enum import StrEnum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class UserTier(StrEnum):
    """Tiers visibles dans l'application GabomaGPT."""

    flash = "flash"
    pro = "pro"
    black_panther = "black_panther"


class RegisterRequest(BaseModel):
    """Payload d'inscription."""

    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(
        pattern=r"^(06|07)\d{8}$",
        description="Numéro gabonais Airtel ou Moov au format 06XXXXXXXX ou 07XXXXXXXX.",
    )
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    """Payload de connexion."""

    model_config = ConfigDict(str_strip_whitespace=True)

    phone: str = Field(pattern=r"^(06|07)\d{8}$")
    password: str = Field(min_length=8, max_length=128)


class AuthResponse(BaseModel):
    """Réponse auth sans fuite de secret."""

    access_token: str
    token_type: str = "bearer"
    user_id: str
    full_name: str
    phone: str
    tier: UserTier


class CurrentTierResponse(BaseModel):
    """Tier courant de l'utilisateur."""

    user_id: str
    tier: UserTier
    daily_tokens_remaining: int
    monthly_tokens_remaining: Optional[int] = None
