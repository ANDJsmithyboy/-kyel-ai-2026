"""
Ñkyel AI — Agent Pulse · SmartANDJ AI Technologies
Micro-expression et présence dynamique de l'agent.

États de pulsation :
  IDLE        — En veille
  READY       — Prêt à agir
  THINKING    — Réflexion / Planification explicable
  SEARCHING   — Recherche de sources / navigation
  ACTING      — Exécution d'outils / génération d'artefacts
  WAITING     — En attente de ressource / réseau
  NEEDS_YOU   — En attente d'une décision humaine (HumanNode)
  DONE        — Mission achevée

Gère la présence, le rythme, les transitions d'état et la causalité visuelle.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum

from core.event_schema import NkyelEvent, event_emitter

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Pulse State Enum
# ══════════════════════════════════════════════════════════════

class PulseState(str, Enum):
    """Les 8 états de présence de l'agent."""
    IDLE = "idle"
    READY = "ready"
    THINKING = "thinking"
    SEARCHING = "searching"
    ACTING = "acting"
    WAITING = "waiting"
    NEEDS_YOU = "needs_you"
    DONE = "done"


# ══════════════════════════════════════════════════════════════
# 2. Agent Pulse Model
# ══════════════════════════════════════════════════════════════

@dataclass
class AgentPulseSnapshot:
    """Instantané de l'état de pulsation d'un agent."""
    agent_id: str
    agent_name: str = "Kora"
    mission_id: str = ""
    state: PulseState = PulseState.IDLE
    message: str = "En veille"
    activity_description: str = ""
    current_tool: Optional[str] = None
    progress: float = 0.0  # 0.0 → 1.0
    rhythm_hz: float = 0.5  # Fréquence d'animation visuelle en Hz
    intensity: float = 0.2  # 0.0 (calme) → 1.0 (intense)
    last_transition_at: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "mission_id": self.mission_id,
            "state": self.state.value,
            "message": self.message,
            "activity_description": self.activity_description,
            "current_tool": self.current_tool,
            "progress": self.progress,
            "rhythm_hz": self.rhythm_hz,
            "intensity": self.intensity,
            "last_transition_at": self.last_transition_at,
            "metadata": self.metadata,
        }


# ══════════════════════════════════════════════════════════════
# 3. Agent Pulse Controller
# ══════════════════════════════════════════════════════════════

# Paramètres par défaut pour chaque état
_STATE_CONFIGS: Dict[PulseState, Dict[str, Any]] = {
    PulseState.IDLE: {
        "message": "En veille",
        "rhythm_hz": 0.2,
        "intensity": 0.1,
    },
    PulseState.READY: {
        "message": "Prêt pour votre vision",
        "rhythm_hz": 0.5,
        "intensity": 0.3,
    },
    PulseState.THINKING: {
        "message": "Structure votre demande…",
        "rhythm_hz": 1.2,
        "intensity": 0.6,
    },
    PulseState.SEARCHING: {
        "message": "Recherche de sources & preuves…",
        "rhythm_hz": 1.5,
        "intensity": 0.7,
    },
    PulseState.ACTING: {
        "message": "Construction en cours…",
        "rhythm_hz": 1.8,
        "intensity": 0.9,
    },
    PulseState.WAITING: {
        "message": "Synchronisation en cours…",
        "rhythm_hz": 0.8,
        "intensity": 0.4,
    },
    PulseState.NEEDS_YOU: {
        "message": "Une décision nécessite votre arbitrage",
        "rhythm_hz": 2.0,
        "intensity": 1.0,
    },
    PulseState.DONE: {
        "message": "Mission accomplie",
        "rhythm_hz": 0.3,
        "intensity": 0.2,
    },
}


class AgentPulseController:
    """
    Gère la pulsation de l'agent pour créer une présence continue et vivante.
    """

    def __init__(self):
        self._pulses: Dict[str, AgentPulseSnapshot] = {}

    def get_or_create(
        self,
        agent_id: str,
        agent_name: str = "Kora",
        mission_id: str = "",
    ) -> AgentPulseSnapshot:
        """Récupère ou crée la pulsation d'un agent."""
        if agent_id not in self._pulses:
            self._pulses[agent_id] = AgentPulseSnapshot(
                agent_id=agent_id,
                agent_name=agent_name,
                mission_id=mission_id,
            )
        return self._pulses[agent_id]

    def transition(
        self,
        agent_id: str,
        new_state: PulseState,
        message: Optional[str] = None,
        activity_description: str = "",
        current_tool: Optional[str] = None,
        progress: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AgentPulseSnapshot:
        """Effectue une transition d'état de pulsation et émet un événement."""
        pulse = self.get_or_create(agent_id)
        config = _STATE_CONFIGS.get(new_state, {})

        pulse.state = new_state
        pulse.message = message or config.get("message", "Activité en cours")
        pulse.activity_description = activity_description
        pulse.current_tool = current_tool
        pulse.rhythm_hz = config.get("rhythm_hz", 1.0)
        pulse.intensity = config.get("intensity", 0.5)
        pulse.last_transition_at = time.time()

        if progress is not None:
            pulse.progress = max(0.0, min(1.0, progress))
        if metadata:
            pulse.metadata.update(metadata)

        # Émettre l'événement de mise à jour du pulse
        event_emitter.emit(NkyelEvent(
            type="vie.agent.pulse",
            agent_id=agent_id,
            mission_id=pulse.mission_id,
            payload=pulse.to_dict(),
        ))

        logger.debug(
            f"💓 Pulse [{agent_id}]: {new_state.value} — {pulse.message}"
        )

        return pulse

    def get_pulse(self, agent_id: str) -> Optional[AgentPulseSnapshot]:
        return self._pulses.get(agent_id)

    def list_pulses(self, mission_id: Optional[str] = None) -> List[Dict[str, Any]]:
        results = []
        for p in self._pulses.values():
            if mission_id and p.mission_id != mission_id:
                continue
            results.append(p.to_dict())
        return results

    def clear(self) -> None:
        self._pulses.clear()


# ══════════════════════════════════════════════════════════════
# Singleton
# ══════════════════════════════════════════════════════════════

agent_pulse = AgentPulseController()
