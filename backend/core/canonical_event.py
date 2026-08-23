"""
Ñkyel AI — Canonical Event Model & Adapters · SmartANDJ AI Technologies
Schéma unique canonique pour tous les événements de l'écosystème Ñkyel.

Garantit la stricte cohérence entre :
  Canonical Event
  ├── AG-UI Adapter   (Streaming & Frontend standardisé)
  ├── SSE Adapter     (Flux HTTP Server-Sent Events)
  ├── VIE Adapter     (Visual Intelligence Engine Canvas)
  ├── WorkGraph       (Graphe d'exécution temps-réel)
  ├── Sentry Adapter  (Breadcrumbs & Tags d'observabilité)
  └── Analytics       (Métriques & télémétrie)

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import json
import uuid
from typing import Optional, Dict, Any, List
from enum import Enum
from dataclasses import dataclass, field


# ══════════════════════════════════════════════════════════════
# 1. Canonical Event Categories & Types
# ══════════════════════════════════════════════════════════════

class CanonicalEventCategory(str, Enum):
    """Catégories fondamentales d'événements."""
    LIFECYCLE = "lifecycle"       # Cycle de vie de mission/agent
    COGNITION = "cognition"       # Raisonnement, compréhension, plan
    ACTION = "action"             # Outils, requêtes, exécution
    EVIDENCE = "evidence"         # Sources, faits, preuves
    INTERACTION = "interaction"   # Arbitrage humain, inputs
    OUTPUT = "output"             # Tokens de texte, artefacts, rendus
    ERROR = "error"               # Erreurs et alertes


# ══════════════════════════════════════════════════════════════
# 2. Canonical Event Structure
# ══════════════════════════════════════════════════════════════

@dataclass
class CanonicalEvent:
    """Structure canonique universelle d'un événement Ñkyel."""
    id: str = field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:10]}")
    version: str = "v1"
    type: str = "agent.step"
    category: CanonicalEventCategory = CanonicalEventCategory.COGNITION
    mission_id: str = ""
    run_id: str = ""
    agent_id: str = "lead_agent"
    agent_name: str = "Kora"
    timestamp: float = field(default_factory=time.time)
    payload: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Sérialisation canonique complète."""
        return {
            "id": self.id,
            "version": self.version,
            "type": self.type,
            "category": self.category.value,
            "mission_id": self.mission_id,
            "run_id": self.run_id,
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "timestamp": self.timestamp,
            "payload": self.payload,
            "metadata": self.metadata,
        }

    # ── Adapters ─────────────────────────────────────────────

    def to_sse(self) -> str:
        """Adapte l'événement en ligne SSE conforme RFC standard."""
        body = json.dumps({
            "type": self.type,
            "data": {
                "event_id": self.id,
                "mission_id": self.mission_id,
                "run_id": self.run_id,
                "agent_id": self.agent_id,
                "agent_name": self.agent_name,
                "timestamp": self.timestamp,
                **self.payload,
            },
        }, ensure_ascii=False)
        return f"data: {body}\n\n"

    def to_agui(self) -> Dict[str, Any]:
        """Adapte l'événement au format AG-UI pour le frontend."""
        return {
            "type": self.type,
            "id": self.id,
            "data": {
                "run_id": self.run_id,
                "agent_id": self.agent_id,
                **self.payload,
            },
            "timestamp": self.timestamp,
        }

    def to_vie(self) -> Dict[str, Any]:
        """Adapte l'événement pour le Visual Intelligence Engine (Canvas)."""
        return {
            "type": "VIE_STATE_UPDATE",
            "event_id": self.id,
            "action": self.type,
            "category": self.category.value,
            "state_delta": self.payload,
            "timestamp": self.timestamp,
        }

    def to_sentry_breadcrumb(self) -> Dict[str, Any]:
        """Adapte l'événement en breadcrumb Sentry sécurisé sans PII."""
        # Sanitize payload to prevent secret leakage
        safe_data = {
            k: v for k, v in self.payload.items()
            if not any(s in k.lower() for s in ("token", "key", "secret", "password", "auth"))
        }
        return {
            "category": self.category.value,
            "message": f"[{self.agent_name}] {self.type}",
            "data": {
                "mission_id": self.mission_id,
                "run_id": self.run_id,
                "agent_id": self.agent_id,
                **safe_data,
            },
            "timestamp": self.timestamp,
        }


# ══════════════════════════════════════════════════════════════
# 3. Canonical Event Factory
# ══════════════════════════════════════════════════════════════

class CanonicalEventFactory:
    """Fabrique standardisée pour les événements clés."""

    @staticmethod
    def mission_started(mission_id: str, run_id: str, goal: str) -> CanonicalEvent:
        return CanonicalEvent(
            type="mission.started",
            category=CanonicalEventCategory.LIFECYCLE,
            mission_id=mission_id,
            run_id=run_id,
            payload={"status": "started", "goal": goal},
        )

    @staticmethod
    def mission_completed(mission_id: str, run_id: str, steps: int = 0) -> CanonicalEvent:
        return CanonicalEvent(
            type="mission.completed",
            category=CanonicalEventCategory.LIFECYCLE,
            mission_id=mission_id,
            run_id=run_id,
            payload={"status": "completed", "steps_count": steps},
        )

    @staticmethod
    def tool_started(mission_id: str, run_id: str, tool_name: str, args: Dict[str, Any]) -> CanonicalEvent:
        return CanonicalEvent(
            type="tool.started",
            category=CanonicalEventCategory.ACTION,
            mission_id=mission_id,
            run_id=run_id,
            payload={"tool_name": tool_name, "args": args, "status": "running"},
        )

    @staticmethod
    def tool_completed(mission_id: str, run_id: str, tool_name: str, duration_ms: int) -> CanonicalEvent:
        return CanonicalEvent(
            type="tool.completed",
            category=CanonicalEventCategory.ACTION,
            mission_id=mission_id,
            run_id=run_id,
            payload={"tool_name": tool_name, "status": "completed", "duration_ms": duration_ms},
        )

    @staticmethod
    def human_approval_required(mission_id: str, run_id: str, question: str, options: List[str]) -> CanonicalEvent:
        return CanonicalEvent(
            type="approval.required",
            category=CanonicalEventCategory.INTERACTION,
            mission_id=mission_id,
            run_id=run_id,
            payload={"question": question, "options": options, "status": "pending_human"},
        )
