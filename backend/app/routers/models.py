"""
GabomaAI · Router : Models
GET /api/models — liste publique des modèles (aucun nom de provider).
"""

from fastapi import APIRouter
from typing import List

from app.models.schemas import ModelInfo

router = APIRouter()

# Liste publique officielle — AUCUN nom de provider externe
GABOMA_MODELS: List[ModelInfo] = [
    ModelInfo(
        id="aurata",
        name="AURATA",
        tagline="Réponses rapides",
        icon="aurata",
        available=True,
    ),
    ModelInfo(
        id="nkyel",
        name="NKYEL",
        tagline="Raisonnement profond",
        icon="nkyel",
        available=True,
    ),
    ModelInfo(
        id="onyxgris",
        name="ONYXGRIS",
        tagline="Langues gabonaises & agent",
        icon="onyxgris",
        available=True,
    ),
    ModelInfo(
        id="wandana",
        name="WANDANA",
        tagline="Recherche web & Deep Research",
        icon="wandana",
        available=True,
    ),
    ModelInfo(
        id="black-panther",
        name="BLACK PANTHER",
        tagline="Orchestrateur multi-agents",
        icon="blackpanther",
        available=False,
        badge="Bientôt",
    ),
]


@router.get("/models", response_model=List[ModelInfo])
async def list_models():
    """Retourne la liste publique des modèles GabomaAI."""
    return GABOMA_MODELS
