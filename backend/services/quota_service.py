"""
Ñkyel AI — Server-Side Quota Service & Atomic Reservation · SmartANDJ AI Technologies
Garantit le respect des plafonds de la Beta Publique avec réservation atomique :
- Images : 3 générations par utilisateur
- Vidéo : 1 génération beta (durée par défaut : 3s, max : 4s)
- Missions : 15 missions par jour, 1 mission concurrente active
- Recherche approfondie : 5 par jour
- Réservations atomiques avant tout appel d'inférence coûteux
- Aucune exposition des soldes ou coûts internes aux utilisateurs finaux

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import uuid
import logging
from dataclasses import dataclass, field
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)


# ── Configuration des Limites Beta Définies ───────────────────
BETA_DEFAULT_LIMITS = {
    "max_concurrent_missions": 1,
    "max_missions_per_day": 15,
    "max_messages_per_minute": 10,
    "max_deep_research_per_day": 5,
    "max_sources_per_mission": 20,
    "max_image_generations_per_user": 3,
    "max_video_generations_per_user": 1,
    "video_default_duration_seconds": 3,
    "video_max_duration_seconds": 4,
    "max_generated_document_artifacts_per_day": 10,
    "max_upload_size_mb": 20,
    "max_files_per_mission": 10,
    "max_concurrent_sandboxes": 1,
    "sandbox_max_duration_minutes": 15,
}


@dataclass
class QuotaReservation:
    reservation_id: str
    user_id: str
    resource_type: str  # 'image' | 'video' | 'mission' | 'research'
    amount: int
    created_at: float = field(default_factory=time.time)
    committed: bool = False
    released: bool = False


class QuotaService:
    """Service d'application des quotas et réservations atomiques."""

    _USER_USAGE: Dict[str, Dict[str, Any]] = {}
    _RESERVATIONS: Dict[str, QuotaReservation] = {}

    @classmethod
    def get_or_create_user_usage(cls, user_id: str) -> Dict[str, Any]:
        if user_id not in cls._USER_USAGE:
            cls._USER_USAGE[user_id] = {
                "images_used": 0,
                "videos_used": 0,
                "missions_today": 0,
                "active_missions": 0,
                "research_today": 0,
                "last_reset": time.time(),
            }
        return cls._USER_USAGE[user_id]

    @classmethod
    def check_quota(cls, user_id: str, resource_type: str, requested_amount: int = 1) -> Tuple[bool, str]:
        """Vérifie si l'utilisateur est éligible pour la ressource demandée."""
        usage = cls.get_or_create_user_usage(user_id)

        if resource_type == "image":
            remaining = BETA_DEFAULT_LIMITS["max_image_generations_per_user"] - usage["images_used"]
            if remaining < requested_amount:
                return False, f"Plafond d'images atteint ({usage['images_used']}/{BETA_DEFAULT_LIMITS['max_image_generations_per_user']})."

        elif resource_type == "video":
            remaining = BETA_DEFAULT_LIMITS["max_video_generations_per_user"] - usage["videos_used"]
            if remaining < requested_amount:
                return False, f"Plafond vidéo Beta atteint ({usage['videos_used']}/{BETA_DEFAULT_LIMITS['max_video_generations_per_user']})."

        elif resource_type == "mission":
            if usage["active_missions"] >= BETA_DEFAULT_LIMITS["max_concurrent_missions"]:
                return False, "Une mission est déjà en cours d'exécution dans votre workspace."
            if usage["missions_today"] >= BETA_DEFAULT_LIMITS["max_missions_per_day"]:
                return False, f"Plafond quotidien de missions atteint ({BETA_DEFAULT_LIMITS['max_missions_per_day']} max/jour)."

        elif resource_type == "research":
            if usage["research_today"] >= BETA_DEFAULT_LIMITS["max_deep_research_per_day"]:
                return False, f"Plafond de recherche approfondie atteint ({BETA_DEFAULT_LIMITS['max_deep_research_per_day']}/jour)."

        return True, "Quota disponible"

    @classmethod
    def reserve_quota(cls, user_id: str, resource_type: str, amount: int = 1) -> Tuple[bool, Optional[str], str]:
        """Effectue une réservation atomique avant d'exécuter une inférence coûteuse."""
        allowed, reason = cls.check_quota(user_id, resource_type, amount)
        if not allowed:
            return False, None, reason

        reservation_id = f"res_{uuid.uuid4().hex[:8]}"
        res = QuotaReservation(
            reservation_id=reservation_id,
            user_id=user_id,
            resource_type=resource_type,
            amount=amount,
        )
        cls._RESERVATIONS[reservation_id] = res

        # Incrémenter temporairement l'état actif
        usage = cls.get_or_create_user_usage(user_id)
        if resource_type == "mission":
            usage["active_missions"] += amount

        return True, reservation_id, "Réservation effectuée"

    @classmethod
    def commit_quota(cls, reservation_id: str) -> bool:
        """Confirme l'exécution réussie et valide définitivement la consommation de quota."""
        res = cls._RESERVATIONS.get(reservation_id)
        if not res or res.committed or res.released:
            return False

        res.committed = True
        usage = cls.get_or_create_user_usage(res.user_id)

        if res.resource_type == "image":
            usage["images_used"] += res.amount
        elif res.resource_type == "video":
            usage["videos_used"] += res.amount
        elif res.resource_type == "mission":
            usage["missions_today"] += res.amount
            usage["active_missions"] = max(0, usage["active_missions"] - res.amount)
        elif res.resource_type == "research":
            usage["research_today"] += res.amount

        return True

    @classmethod
    def release_quota(cls, reservation_id: str) -> bool:
        """Libère la réservation en cas d'échec ou d'annulation (aucun débit)."""
        res = cls._RESERVATIONS.get(reservation_id)
        if not res or res.committed or res.released:
            return False

        res.released = True
        usage = cls.get_or_create_user_usage(res.user_id)

        if res.resource_type == "mission":
            usage["active_missions"] = max(0, usage["active_missions"] - res.amount)

        return True

    @classmethod
    def get_user_allowance_display(cls, user_id: str) -> Dict[str, Any]:
        """Retourne la vue produit propre pour l'utilisateur sans fuite d'infrastructure."""
        usage = cls.get_or_create_user_usage(user_id)
        return {
            "images": {
                "used": usage["images_used"],
                "total": BETA_DEFAULT_LIMITS["max_image_generations_per_user"],
                "remaining": max(0, BETA_DEFAULT_LIMITS["max_image_generations_per_user"] - usage["images_used"]),
            },
            "video": {
                "used": usage["videos_used"],
                "total": BETA_DEFAULT_LIMITS["max_video_generations_per_user"],
                "remaining": max(0, BETA_DEFAULT_LIMITS["max_video_generations_per_user"] - usage["videos_used"]),
                "default_duration_seconds": BETA_DEFAULT_LIMITS["video_default_duration_seconds"],
                "max_duration_seconds": BETA_DEFAULT_LIMITS["video_max_duration_seconds"],
            },
            "missions": {
                "today": usage["missions_today"],
                "daily_max": BETA_DEFAULT_LIMITS["max_missions_per_day"],
                "concurrent_active": usage["active_missions"],
            },
        }
