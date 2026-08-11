"""
Ñkyel AI · Router : Models
GET /api/models — liste publique des modèles (aucun nom de provider).
"""

from fastapi import APIRouter
from typing import List

from app.models.schemas import ModelInfo

router = APIRouter()

# Liste publique officielle — AUCUN nom de provider externe
NKYEL_MODELS: List[ModelInfo] = [
    ModelInfo(
        id="nkyel-chui",
        name="Nkyel Chui",
        tagline="Réponses rapides & efficaces",
        icon="aurata",
        available=True,
    ),
    ModelInfo(
        id="nkyel-tai",
        name="Nkyel Tai",
        tagline="Raisonnement profond & multimodal",
        icon="nkyel",
        available=True,
    ),
    ModelInfo(
        id="nkyel-radi",
        name="Nkyel Radi",
        tagline="Langues gabonaises & tâches légères",
        icon="onyxgris",
        available=True,
    ),
    ModelInfo(
        id="recherche-web",
        name="Recherche Web",
        tagline="Recherche web & Deep Research",
        icon="wandana",
        available=True,
    ),
    ModelInfo(
        id="blue-panther",
        name="Blue Panther",
        tagline="Mode Créateur Illimité",
        icon="bluepanther",
        available=True,
    ),
]


@router.get("/models", response_model=List[ModelInfo])
async def list_models():
    """Retourne la liste publique des modèles Ñkyel AI."""
    return NKYEL_MODELS
