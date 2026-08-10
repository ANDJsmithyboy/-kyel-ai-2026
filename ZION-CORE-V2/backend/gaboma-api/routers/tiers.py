# FILE: gaboma-api/routers/tiers.py
from fastapi import APIRouter

from models.user import CurrentTierResponse, UserTier

router = APIRouter(tags=["Tiers"])


@router.get(
    "/tiers",
    summary="Lister les offres GabomaGPT",
    description="Retourne les tiers visibles par l'application Android sans exposer aucun fournisseur IA tiers.",
)
async def list_tiers() -> list[dict[str, object]]:
    """Catalogue initial des offres GabomaGPT."""
    return [
        {
            "id": UserTier.flash,
            "display_name": "GabomaGPT Flash",
            "description": "Rapide, réponses instantanées.",
            "price_xaf": 0,
            "daily_limit": 30,
            "features": [
                "Chat rapide",
                "Historique local",
                "Optimisé 3G/4G",
            ],
        },
        {
            "id": UserTier.pro,
            "display_name": "GabomaGPT Pro",
            "description": "Raisonnement avancé pour études, travail et recherche.",
            "price_xaf": 2500,
            "daily_limit": 300,
            "features": [
                "Réponses longues",
                "Raisonnement avancé",
                "Priorité de traitement",
            ],
        },
        {
            "id": UserTier.black_panther,
            "display_name": "GabomaGPT Black Panther",
            "description": "Agent autonome premium pour missions complexes.",
            "price_xaf": 10000,
            "daily_limit": 1000,
            "features": [
                "Mode agent autonome",
                "Missions longues",
                "Artifacts premium",
            ],
        },
    ]


@router.get(
    "/user/tier",
    response_model=CurrentTierResponse,
    summary="Lire le tier courant de l'utilisateur",
    description="Retourne le quota courant. Le middleware JWT sera activé dans le slice Auth.",
)
async def get_current_user_tier() -> CurrentTierResponse:
    """Réponse temporaire pour valider l'intégration Android."""
    return CurrentTierResponse(
        user_id="dev-user",
        tier=UserTier.flash,
        daily_tokens_remaining=30,
        monthly_tokens_remaining=None,
    )
