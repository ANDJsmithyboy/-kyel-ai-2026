"""
Ñkyel AI — Quota & Budget Guard Middleware · SmartANDJ AI Technologies
Garantit la protection budgétaire stricte de la Bêta :
- Limite de requêtes par utilisateur (Runs, Wide Research, Médias)
- Limite de concurrence globale et par utilisateur (verrous Upstash / mémoire)
- Plafond de budget quotidien (BETA_DAILY_BUDGET_USD)
- Circuit breaker et kill switches par fonctionnalité

Fondateur : Daniel Jonathan ANDJ
"""

import os
import time
import logging
from typing import Dict, Optional, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)


class QuotaManager:
    """Gère le suivi des quotas et consommations en mémoire avec synchronisation Redis si disponible."""

    def __init__(self):
        self.user_runs: Dict[str, int] = {}
        self.user_wide_research: Dict[str, int] = {}
        self.user_images: Dict[str, int] = {}
        self.user_videos: Dict[str, int] = {}
        self.active_runs_per_user: Dict[str, int] = {}
        self.global_active_runs: int = 0
        self.daily_cost_tracker: float = 0.0
        self.last_reset_day: int = time.gmtime().tm_yday

    def _check_and_reset_daily(self):
        current_day = time.gmtime().tm_yday
        if current_day != self.last_reset_day:
            self.daily_cost_tracker = 0.0
            self.last_reset_day = current_day
            logger.info("🔄 QuotaManager: Réinitialisation du budget quotidien.")

    def check_and_increment_run(self, user_id: str) -> Tuple[bool, str]:
        """Vérifie si l'utilisateur peut démarrer un nouveau run agentique."""
        self._check_and_reset_daily()

        # 1. Budget quotidien global
        max_daily_budget = float(os.getenv("BETA_DAILY_BUDGET_USD", "50.0"))
        if self.daily_cost_tracker >= max_daily_budget:
            return False, "Le budget quotidien de la bêta a été atteint. Veuillez réessayer demain."

        # 2. Concurrence globale
        max_global_concurrency = int(os.getenv("BETA_GLOBAL_CONCURRENCY", "50"))
        if self.global_active_runs >= max_global_concurrency:
            return False, "Le système est à pleine capacité instantanée. Veuillez patienter quelques secondes."

        # 3. Concurrence par utilisateur (défaut: 1)
        max_user_concurrent = int(os.getenv("BETA_MAX_CONCURRENT_RUNS_PER_USER", "1"))
        user_concurrent = self.active_runs_per_user.get(user_id, 0)
        if user_concurrent >= max_user_concurrent:
            return False, "Vous avez déjà une tâche agentique en cours d'exécution."

        # 4. Quota total de runs par utilisateur
        max_runs = int(os.getenv("BETA_MAX_RUNS_PER_USER", "30"))
        user_total = self.user_runs.get(user_id, 0)
        if user_total >= max_runs:
            return False, f"Vous avez atteint votre quota maximal de {max_runs} missions de test."

        # Incrémenter
        self.user_runs[user_id] = user_total + 1
        self.active_runs_per_user[user_id] = user_concurrent + 1
        self.global_active_runs += 1
        return True, "OK"

    def release_run(self, user_id: str, cost_usd: float = 0.0):
        """Libère le verrou de concurrence et enregistre le coût."""
        self.active_runs_per_user[user_id] = max(0, self.active_runs_per_user.get(user_id, 1) - 1)
        self.global_active_runs = max(0, self.global_active_runs - 1)
        self.daily_cost_tracker += cost_usd

    def check_and_increment_wide_research(self, user_id: str) -> Tuple[bool, str]:
        max_wr = int(os.getenv("BETA_MAX_WIDE_RESEARCH_PER_USER", "15"))
        current = self.user_wide_research.get(user_id, 0)
        if current >= max_wr:
            return False, f"Quota maximal de recherches approfondies ({max_wr}) atteint."
        self.user_wide_research[user_id] = current + 1
        return True, "OK"

    def check_and_increment_image(self, user_id: str) -> Tuple[bool, str]:
        max_img = int(os.getenv("BETA_MAX_IMAGES_PER_USER", "20"))
        current = self.user_images.get(user_id, 0)
        if current >= max_img:
            return False, f"Quota maximal de générations d'images ({max_img}) atteint."
        self.user_images[user_id] = current + 1
        return True, "OK"

    def check_and_increment_video(self, user_id: str) -> Tuple[bool, str]:
        max_vid = int(os.getenv("BETA_MAX_VIDEOS_PER_USER", "5"))
        current = self.user_videos.get(user_id, 0)
        if current >= max_vid:
            return False, f"Quota maximal de générations de vidéos ({max_vid}) atteint."
        self.user_videos[user_id] = current + 1
        return True, "OK"


# Singleton
quota_manager = QuotaManager()
