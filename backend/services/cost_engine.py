"""
Ñkyel AI — Cost Engine · SmartANDJ AI Technologies
Moteur de collecte et suivi des coûts à granularité fine.

Collecte :
  - model tokens & dollars
  - search calls
  - sandbox runtime
  - GPU runtime
  - storage
  - embedding calls
  - reranking
  - TTS / STT

Par :
  - user
  - workspace
  - mission
  - agent
  - provider

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import threading
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum

from core.event_schema import NkyelEventType, event_emitter, NkyelEvent

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Cost Categories
# ══════════════════════════════════════════════════════════════

class CostCategory(str, Enum):
    """Catégories de coûts trackées."""
    MODEL_INFERENCE = "model_inference"
    SEARCH = "search"
    EMBEDDING = "embedding"
    RERANKING = "reranking"
    SANDBOX = "sandbox"
    GPU_COMPUTE = "gpu_compute"
    STORAGE = "storage"
    TTS = "tts"
    STT = "stt"


# ══════════════════════════════════════════════════════════════
# 2. Cost Entry
# ══════════════════════════════════════════════════════════════

@dataclass
class CostEntry:
    """Entrée de coût individuelle."""
    category: CostCategory
    provider: str
    operation: str
    cost_usd: float
    input_tokens: int = 0
    output_tokens: int = 0
    duration_ms: int = 0
    timestamp: float = field(default_factory=time.time)

    # Attributions
    user_id: str = ""
    workspace_id: str = ""
    mission_id: str = ""
    agent_id: str = ""


# ══════════════════════════════════════════════════════════════
# 3. Cost Engine
# ══════════════════════════════════════════════════════════════

class CostEngine:
    """
    Moteur de suivi des coûts Ñkyel.
    Aggrège les coûts par user, workspace, mission, agent et provider.
    Émet des événements canoniques pour l'observabilité.
    """

    def __init__(self):
        self._entries: List[CostEntry] = []
        self._lock = threading.RLock()

    def record(self, entry: CostEntry) -> None:
        """Enregistre une entrée de coût."""
        with self._lock:
            self._entries.append(entry)

        # Émettre un événement canonique
        event_emitter.emit(NkyelEvent(
            type=NkyelEventType.COST_RECORDED.value,
            mission_id=entry.mission_id,
            agent_id=entry.agent_id,
            payload={
                "category": entry.category.value,
                "provider": entry.provider,
                "operation": entry.operation,
                "cost_usd": entry.cost_usd,
                "input_tokens": entry.input_tokens,
                "output_tokens": entry.output_tokens,
                "duration_ms": entry.duration_ms,
                "user_id": entry.user_id,
                "workspace_id": entry.workspace_id,
            },
        ))

        logger.debug(
            f"💰 Cost [{entry.category.value}] {entry.provider}/{entry.operation}: "
            f"${entry.cost_usd:.6f} | mission={entry.mission_id}"
        )

    # ── Convenience Recorders ────────────────────────────────

    def record_model_call(
        self,
        provider: str,
        model: str,
        cost_usd: float,
        input_tokens: int = 0,
        output_tokens: int = 0,
        latency_ms: int = 0,
        mission_id: str = "",
        agent_id: str = "",
        user_id: str = "",
        workspace_id: str = "",
    ) -> None:
        """Enregistre un appel de modèle."""
        self.record(CostEntry(
            category=CostCategory.MODEL_INFERENCE,
            provider=provider,
            operation=model,
            cost_usd=cost_usd,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            duration_ms=latency_ms,
            mission_id=mission_id,
            agent_id=agent_id,
            user_id=user_id,
            workspace_id=workspace_id,
        ))

    def record_search(
        self,
        provider: str = "tavily",
        cost_usd: float = 0.001,
        latency_ms: int = 0,
        mission_id: str = "",
        user_id: str = "",
        workspace_id: str = "",
    ) -> None:
        """Enregistre un appel de recherche."""
        self.record(CostEntry(
            category=CostCategory.SEARCH,
            provider=provider,
            operation="web_search",
            cost_usd=cost_usd,
            duration_ms=latency_ms,
            mission_id=mission_id,
            user_id=user_id,
            workspace_id=workspace_id,
        ))

    def record_embedding(
        self,
        provider: str = "google",
        model: str = "text-embedding-004",
        cost_usd: float = 0.0001,
        input_tokens: int = 0,
        mission_id: str = "",
        user_id: str = "",
        workspace_id: str = "",
    ) -> None:
        """Enregistre un appel d'embedding."""
        self.record(CostEntry(
            category=CostCategory.EMBEDDING,
            provider=provider,
            operation=model,
            cost_usd=cost_usd,
            input_tokens=input_tokens,
            mission_id=mission_id,
            user_id=user_id,
            workspace_id=workspace_id,
        ))

    def record_sandbox(
        self,
        provider: str = "e2b",
        duration_ms: int = 0,
        cost_usd: float = 0.0,
        mission_id: str = "",
        user_id: str = "",
        workspace_id: str = "",
    ) -> None:
        """Enregistre une exécution sandbox."""
        self.record(CostEntry(
            category=CostCategory.SANDBOX,
            provider=provider,
            operation="sandbox_execution",
            cost_usd=cost_usd,
            duration_ms=duration_ms,
            mission_id=mission_id,
            user_id=user_id,
            workspace_id=workspace_id,
        ))

    def record_speech(
        self,
        direction: str = "tts",
        provider: str = "elevenlabs",
        cost_usd: float = 0.0,
        duration_ms: int = 0,
        mission_id: str = "",
        user_id: str = "",
        workspace_id: str = "",
    ) -> None:
        """Enregistre un appel TTS ou STT."""
        category = CostCategory.TTS if direction == "tts" else CostCategory.STT
        self.record(CostEntry(
            category=category,
            provider=provider,
            operation=direction,
            cost_usd=cost_usd,
            duration_ms=duration_ms,
            mission_id=mission_id,
            user_id=user_id,
            workspace_id=workspace_id,
        ))

    # ── Aggregation ──────────────────────────────────────────

    def total_cost(self, **filters) -> float:
        """Coût total avec filtres optionnels (user_id, workspace_id, mission_id, etc.)."""
        with self._lock:
            entries = self._filter_entries(**filters)
            return sum(e.cost_usd for e in entries)

    def cost_by_category(self, **filters) -> Dict[str, float]:
        """Coûts agrégés par catégorie."""
        with self._lock:
            entries = self._filter_entries(**filters)
            result: Dict[str, float] = {}
            for e in entries:
                key = e.category.value
                result[key] = result.get(key, 0.0) + e.cost_usd
            return {k: round(v, 6) for k, v in result.items()}

    def cost_by_provider(self, **filters) -> Dict[str, float]:
        """Coûts agrégés par provider."""
        with self._lock:
            entries = self._filter_entries(**filters)
            result: Dict[str, float] = {}
            for e in entries:
                result[e.provider] = result.get(e.provider, 0.0) + e.cost_usd
            return {k: round(v, 6) for k, v in result.items()}

    def cost_by_user(self) -> Dict[str, float]:
        """Coûts agrégés par utilisateur."""
        with self._lock:
            result: Dict[str, float] = {}
            for e in self._entries:
                if e.user_id:
                    result[e.user_id] = result.get(e.user_id, 0.0) + e.cost_usd
            return {k: round(v, 6) for k, v in result.items()}

    def cost_by_workspace(self) -> Dict[str, float]:
        """Coûts agrégés par workspace."""
        with self._lock:
            result: Dict[str, float] = {}
            for e in self._entries:
                if e.workspace_id:
                    result[e.workspace_id] = result.get(e.workspace_id, 0.0) + e.cost_usd
            return {k: round(v, 6) for k, v in result.items()}

    def summary(self, **filters) -> Dict[str, Any]:
        """Résumé complet des coûts."""
        with self._lock:
            entries = self._filter_entries(**filters)
            total_input = sum(e.input_tokens for e in entries)
            total_output = sum(e.output_tokens for e in entries)
            return {
                "total_cost_usd": round(sum(e.cost_usd for e in entries), 6),
                "total_entries": len(entries),
                "total_input_tokens": total_input,
                "total_output_tokens": total_output,
                "cost_by_category": self.cost_by_category(**filters),
                "cost_by_provider": self.cost_by_provider(**filters),
            }

    def _filter_entries(self, **filters) -> List[CostEntry]:
        """Filtre les entrées selon les critères donnés."""
        entries = list(self._entries)
        for key, value in filters.items():
            if value:
                entries = [e for e in entries if getattr(e, key, None) == value]
        return entries

    def clear(self) -> None:
        """Réinitialise le moteur de coûts."""
        with self._lock:
            self._entries.clear()


# ══════════════════════════════════════════════════════════════
# Singleton
# ══════════════════════════════════════════════════════════════

cost_engine = CostEngine()
