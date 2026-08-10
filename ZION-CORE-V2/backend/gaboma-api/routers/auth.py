# FILE: gaboma-api/routers/auth.py
from uuid import uuid4

from fastapi import APIRouter, status

from models.user import AuthResponse, LoginRequest, RegisterRequest, UserTier

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un compte GabomaGPT",
    description="Crée un compte utilisateur. La vraie persistance sera branchée sur la couche auth sécurisée au prochain slice.",
)
async def register(payload: RegisterRequest) -> AuthResponse:
    """Inscription temporaire pour valider le contrat Android ↔ FastAPI."""
    return AuthResponse(
        access_token=f"dev-token-{uuid4()}",
        user_id=str(uuid4()),
        full_name=payload.full_name,
        phone=payload.phone,
        tier=UserTier.flash,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Connecter un utilisateur GabomaGPT",
    description="Authentifie un utilisateur. Le JWT réel sera signé côté middleware auth dans le prochain slice.",
)
async def login(payload: LoginRequest) -> AuthResponse:
    """Connexion temporaire pour valider le contrat Android ↔ FastAPI."""
    return AuthResponse(
        access_token=f"dev-token-{uuid4()}",
        user_id=str(uuid4()),
        full_name="Utilisateur GabomaGPT",
        phone=payload.phone,
        tier=UserTier.flash,
    )
