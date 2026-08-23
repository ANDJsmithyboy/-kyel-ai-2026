"""
Ñkyel AI — Mission Cancellation Manager · SmartANDJ AI Technologies
Gestionnaire de jetons d'annulation pour interruption immédiate de missions.
Connecte le bouton STOP du frontend au runtime LangGraph et aux tool calls.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import asyncio
import logging
import time
import threading
from typing import Optional, Callable, Awaitable
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


# ── Cancellation Token ───────────────────────────────────────

class CancellationToken:
    """
    Jeton d'annulation thread-safe et asyncio-safe.
    Peut être vérifié depuis les nodes LangGraph synchrones
    et les tool calls asynchrones.
    """

    def __init__(self, mission_id: str, run_id: str):
        self.mission_id = mission_id
        self.run_id = run_id
        self._cancelled = threading.Event()
        self._cancel_reason: Optional[str] = None
        self._cancelled_at: Optional[float] = None
        self._callbacks: list[Callable[[], None]] = []

    @property
    def is_cancelled(self) -> bool:
        """Vérifie si l'annulation a été demandée (thread-safe)."""
        return self._cancelled.is_set()

    @property
    def cancel_reason(self) -> Optional[str]:
        return self._cancel_reason

    @property
    def cancelled_at(self) -> Optional[float]:
        return self._cancelled_at

    def cancel(self, reason: str = "user_requested") -> None:
        """
        Déclenche l'annulation. Appelé depuis le handler HTTP /stop.
        Thread-safe : peut être appelé depuis n'importe quel thread.
        """
        if self._cancelled.is_set():
            return  # Déjà annulé, idempotent

        self._cancel_reason = reason
        self._cancelled_at = time.time()
        self._cancelled.set()

        logger.info(
            f"🛑 Mission annulée: mission={self.mission_id} "
            f"run={self.run_id} reason={reason}"
        )

        # Exécuter les callbacks de nettoyage
        for cb in self._callbacks:
            try:
                cb()
            except Exception as e:
                logger.warning(f"Cancellation callback error: {e}")

    def check(self) -> None:
        """
        Vérifie l'état et lève MissionCancelled si annulé.
        À appeler dans chaque node LangGraph et chaque tool call.
        """
        if self._cancelled.is_set():
            raise MissionCancelled(
                mission_id=self.mission_id,
                run_id=self.run_id,
                reason=self._cancel_reason or "cancelled",
            )

    def on_cancel(self, callback: Callable[[], None]) -> None:
        """Enregistre un callback à exécuter lors de l'annulation."""
        self._callbacks.append(callback)
        # Si déjà annulé, exécuter immédiatement
        if self._cancelled.is_set():
            try:
                callback()
            except Exception:
                pass

    async def wait_for_cancel(self, timeout: Optional[float] = None) -> bool:
        """
        Attend l'annulation de manière asynchrone.
        Retourne True si annulé, False si timeout.
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self._cancelled.wait, timeout
        )


# ── Exception d'annulation ──────────────────────────────────

@dataclass
class MissionCancelled(Exception):
    """Exception levée quand une mission est annulée."""
    mission_id: str
    run_id: str
    reason: str = "user_requested"

    def __str__(self) -> str:
        return (
            f"Mission {self.mission_id} annulée "
            f"(run={self.run_id}, reason={self.reason})"
        )


# ── Cancellation Manager (Singleton) ─────────────────────────

class MissionCancellationManager:
    """
    Registre central des jetons d'annulation actifs.
    Un seul jeton par mission_id à tout moment.
    Thread-safe.
    """

    def __init__(self):
        self._tokens: dict[str, CancellationToken] = {}
        self._lock = threading.Lock()

    def create_token(self, mission_id: str, run_id: str) -> CancellationToken:
        """Crée un nouveau jeton d'annulation pour une mission."""
        with self._lock:
            # Annuler tout jeton existant pour cette mission
            existing = self._tokens.get(mission_id)
            if existing and not existing.is_cancelled:
                existing.cancel(reason="superseded_by_new_run")

            token = CancellationToken(mission_id=mission_id, run_id=run_id)
            self._tokens[mission_id] = token

            logger.debug(
                f"CancellationToken créé: mission={mission_id} run={run_id}"
            )
            return token

    def cancel_mission(
        self, mission_id: str, reason: str = "user_requested"
    ) -> bool:
        """
        Annule une mission en cours. Appelé par l'endpoint /stop.
        Retourne True si un jeton actif a été trouvé et annulé.
        """
        with self._lock:
            token = self._tokens.get(mission_id)
            if token and not token.is_cancelled:
                token.cancel(reason=reason)
                return True
            return False

    def get_token(self, mission_id: str) -> Optional[CancellationToken]:
        """Récupère le jeton d'annulation d'une mission."""
        with self._lock:
            return self._tokens.get(mission_id)

    def is_cancelled(self, mission_id: str) -> bool:
        """Vérifie si une mission est annulée."""
        with self._lock:
            token = self._tokens.get(mission_id)
            return token.is_cancelled if token else False

    def cleanup_completed(self, max_age_seconds: float = 3600) -> int:
        """
        Nettoie les jetons annulés ou anciens.
        Retourne le nombre de jetons supprimés.
        """
        now = time.time()
        to_remove = []
        with self._lock:
            for mid, token in self._tokens.items():
                if token.is_cancelled and token.cancelled_at:
                    if now - token.cancelled_at > max_age_seconds:
                        to_remove.append(mid)
            for mid in to_remove:
                del self._tokens[mid]
        return len(to_remove)

    @property
    def active_count(self) -> int:
        """Nombre de missions actives (non annulées)."""
        with self._lock:
            return sum(
                1 for t in self._tokens.values() if not t.is_cancelled
            )

    def status(self) -> dict:
        """Statut du gestionnaire d'annulation."""
        with self._lock:
            active = [
                {"mission_id": t.mission_id, "run_id": t.run_id}
                for t in self._tokens.values()
                if not t.is_cancelled
            ]
            cancelled = [
                {
                    "mission_id": t.mission_id,
                    "run_id": t.run_id,
                    "reason": t.cancel_reason,
                }
                for t in self._tokens.values()
                if t.is_cancelled
            ]
        return {
            "active_missions": active,
            "recently_cancelled": cancelled,
            "total_tracked": len(active) + len(cancelled),
        }


# ── Singleton ────────────────────────────────────────────────

cancellation_manager = MissionCancellationManager()
