"""
Ñkyel AI — Interpretation Layer · SmartANDJ AI Technologies
Couche de traduction cognitive entre le runtime interne et VIE.

RÈGLE ABSOLUE : Ñkyel n'est PAS un Chain-of-Thought viewer.
On n'expose JAMAIS :
  - pensées privées token par token
  - scratchpad du modèle
  - monologue interne / hidden reasoning
  - prompts système secrets
  - credentials / policies internes sensibles

On expose l'EXPLAINABLE STATE :
  Objective, Plan, Tasks, Agents, Tools, Sources, Evidence,
  Assumptions, Decisions, Confidence, Constraints, Progress,
  Artifacts, Failures, Checkpoints.

Pipeline :
  LLM / DeerFlow → Raw Runtime Events → Interpretation Layer →
  Canonical Cognitive Events → WorkGraph / World Model → VIE

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import re
import time
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum

from core.event_schema import NkyelEvent, NkyelEventType, event_emitter

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Privacy Filter — Contenus Interdits
# ══════════════════════════════════════════════════════════════

# Patterns de pensées privées à filtrer ABSOLUMENT
_PRIVATE_THOUGHT_PATTERNS = [
    re.compile(r"<think(?:ing)?>\s*.*?\s*</think(?:ing)?>", re.DOTALL | re.IGNORECASE),
    re.compile(r"<scratchpad>\s*.*?\s*</scratchpad>", re.DOTALL | re.IGNORECASE),
    re.compile(r"<internal>\s*.*?\s*</internal>", re.DOTALL | re.IGNORECASE),
    re.compile(r"<reasoning>\s*.*?\s*</reasoning>", re.DOTALL | re.IGNORECASE),
    re.compile(r"<thought>\s*.*?\s*</thought>", re.DOTALL | re.IGNORECASE),
    re.compile(r"<reflection>\s*.*?\s*</reflection>", re.DOTALL | re.IGNORECASE),
    re.compile(r"<cot>\s*.*?\s*</cot>", re.DOTALL | re.IGNORECASE),
    re.compile(r"<hidden>\s*.*?\s*</hidden>", re.DOTALL | re.IGNORECASE),
    re.compile(r"<private>\s*.*?\s*</private>", re.DOTALL | re.IGNORECASE),
    re.compile(r"<monologue>\s*.*?\s*</monologue>", re.DOTALL | re.IGNORECASE),
    re.compile(r"\[INTERNAL\].*?\[/INTERNAL\]", re.DOTALL | re.IGNORECASE),
    re.compile(r"Let me think step by step.*?(?=\n\n|\Z)", re.DOTALL | re.IGNORECASE),
]

# Secrets et credentials à masquer
_SECRET_PATTERNS = [
    re.compile(r"(?:sk-|pk_live_|sk_live_|ghp_|gho_|xox[bpas]-)\S{10,}", re.IGNORECASE),
    re.compile(r"(?:api[_-]?key|secret[_-]?key|token|password|auth)\s*[:=]\s*\S+", re.IGNORECASE),
    re.compile(r"Bearer\s+\S{10,}", re.IGNORECASE),
    re.compile(r"SYSTEM\s+PROMPT\s*:", re.IGNORECASE),
]

# Mots-clés de contenu système/prompt à ne jamais exposer
_SYSTEM_KEYWORDS = frozenset({
    "system_prompt", "system_message", "internal_policy",
    "hidden_instruction", "meta_prompt", "jailbreak",
    "prompt_injection", "ignore_previous",
})


def sanitize_content(content: str) -> str:
    """
    Filtre le contenu pour supprimer toute pensée privée,
    secret ou prompt système. RÈGLE DE SÉCURITÉ ABSOLUE.
    """
    if not content:
        return content

    sanitized = content

    # 1. Supprimer les blocs de pensée privée
    for pattern in _PRIVATE_THOUGHT_PATTERNS:
        sanitized = pattern.sub("", sanitized)

    # 2. Masquer les secrets
    for pattern in _SECRET_PATTERNS:
        sanitized = pattern.sub("[REDACTED]", sanitized)

    # 3. Nettoyer les espaces multiples résultants
    sanitized = re.sub(r"\n{3,}", "\n\n", sanitized).strip()

    return sanitized


def contains_private_content(content: str) -> bool:
    """Détecte si un contenu contient des pensées privées ou secrets."""
    if not content:
        return False

    for pattern in _PRIVATE_THOUGHT_PATTERNS:
        if pattern.search(content):
            return True

    for pattern in _SECRET_PATTERNS:
        if pattern.search(content):
            return True

    lower = content.lower()
    for keyword in _SYSTEM_KEYWORDS:
        if keyword in lower:
            return True

    return False


def is_safe_for_vie(event: Dict[str, Any]) -> bool:
    """Vérifie qu'un événement est sûr pour exposition dans VIE."""
    payload = event.get("payload", {})
    for value in payload.values():
        if isinstance(value, str) and contains_private_content(value):
            return False
    return True


# ══════════════════════════════════════════════════════════════
# 2. Cognitive Event Types (Explicable)
# ══════════════════════════════════════════════════════════════

class CognitiveEventType(str, Enum):
    """
    Événements cognitifs explicables — ce que VIE peut montrer.
    Jamais de CoT brut. Toujours lisible par un humain.
    """
    # Vision & Mission
    VISION_RECEIVED = "cognitive.vision.received"
    VISION_PARSED = "cognitive.vision.parsed"
    OBJECTIVE_IDENTIFIED = "cognitive.objective.identified"
    MISSION_STRUCTURED = "cognitive.mission.structured"

    # World Model
    SITUATION_MODELED = "cognitive.situation.modeled"
    ENTITY_DISCOVERED = "cognitive.entity.discovered"
    RELATIONSHIP_FOUND = "cognitive.relationship.found"
    HYPOTHESIS_FORMED = "cognitive.hypothesis.formed"
    HYPOTHESIS_VALIDATED = "cognitive.hypothesis.validated"
    HYPOTHESIS_INVALIDATED = "cognitive.hypothesis.invalidated"

    # Planning & Execution
    PLAN_CREATED = "cognitive.plan.created"
    TASK_ASSIGNED = "cognitive.task.assigned"
    SPECIALIST_MOBILIZED = "cognitive.specialist.mobilized"
    TOOL_USED = "cognitive.tool.used"

    # Evidence & Sources
    SOURCES_DISCOVERED = "cognitive.sources.discovered"
    EVIDENCE_STRENGTHENED = "cognitive.evidence.strengthened"
    CONTRADICTION_DETECTED = "cognitive.contradiction.detected"

    # Decisions
    DECISION_MADE = "cognitive.decision.made"
    DECISION_NEEDS_HUMAN = "cognitive.decision.needs_human"
    CONFIDENCE_UPDATED = "cognitive.confidence.updated"

    # Artifacts
    ARTIFACT_CREATED = "cognitive.artifact.created"
    ARTIFACT_UPDATED = "cognitive.artifact.updated"

    # Progress
    CHECKPOINT_REACHED = "cognitive.checkpoint.reached"
    PROGRESS_UPDATE = "cognitive.progress.update"


# ══════════════════════════════════════════════════════════════
# 3. Runtime Event Translator
# ══════════════════════════════════════════════════════════════

# Mapping: raw runtime event → human-readable cognitive description
_TRANSLATION_MAP: Dict[str, Dict[str, str]] = {
    "tool.called": {
        "web_search": "Recherche d'informations en cours",
        "browser": "Navigation web en cours",
        "code_execution": "Exécution de code en cours",
        "file_system": "Opération sur les fichiers",
        "default": "Utilisation d'un outil",
    },
    "agent.spawned": {
        "researcher": "Un spécialiste de recherche a été mobilisé",
        "coder": "Un spécialiste du code a été mobilisé",
        "analyst": "Un analyste a été mobilisé",
        "default": "Un agent spécialisé analyse maintenant la situation",
    },
    "search.completed": {
        "default": "De nouvelles sources ont été découvertes",
    },
    "evidence.found": {
        "default": "De nouvelles preuves renforcent cette hypothèse",
    },
    "evidence.contradiction": {
        "default": "Une contradiction a été détectée entre les sources",
    },
    "model.call.started": {
        "default": "Analyse en cours",
    },
    "model.call.completed": {
        "default": "Analyse terminée",
    },
}


def translate_runtime_event(
    event_type: str,
    payload: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """
    Traduit un événement brut du runtime en événement cognitif explicable.
    Retourne None si l'événement ne doit pas être exposé.
    """
    translations = _TRANSLATION_MAP.get(event_type)
    if not translations:
        return None

    # Déterminer le sous-type
    tool_name = payload.get("tool_name", "")
    agent_type = payload.get("agent_type", "")
    subtype = tool_name or agent_type

    description = translations.get(subtype, translations.get("default", ""))
    if not description:
        return None

    # Sanitize le payload
    safe_payload: Dict[str, Any] = {}
    for key, value in payload.items():
        if isinstance(value, str):
            sanitized = sanitize_content(value)
            if sanitized:
                safe_payload[key] = sanitized
        elif key not in ("system_prompt", "internal_state", "raw_output"):
            safe_payload[key] = value

    return {
        "description": description,
        "safe_payload": safe_payload,
    }


# ══════════════════════════════════════════════════════════════
# 4. Cognitive Latency Tracker
# ══════════════════════════════════════════════════════════════

@dataclass
class CognitiveLatencyMetrics:
    """
    Mesure les latences cognitives — pas seulement l'API latency.
    Ce que le USER ressent réellement.
    """
    mission_id: str = ""
    mission_start: float = 0.0

    # Timestamps des jalons
    _vision_received_at: float = 0.0
    _first_objective_at: float = 0.0
    _first_plan_at: float = 0.0
    _first_action_at: float = 0.0
    _first_evidence_at: float = 0.0
    _first_control_at: float = 0.0
    _first_artifact_at: float = 0.0

    def start(self, mission_id: str) -> None:
        """Démarre le tracking d'une mission."""
        self.mission_id = mission_id
        self.mission_start = time.time()
        self._vision_received_at = self.mission_start

    def mark_objective(self) -> None:
        if self._first_objective_at == 0:
            self._first_objective_at = time.time()

    def mark_plan(self) -> None:
        if self._first_plan_at == 0:
            self._first_plan_at = time.time()

    def mark_action(self) -> None:
        if self._first_action_at == 0:
            self._first_action_at = time.time()

    def mark_evidence(self) -> None:
        if self._first_evidence_at == 0:
            self._first_evidence_at = time.time()

    def mark_control(self) -> None:
        if self._first_control_at == 0:
            self._first_control_at = time.time()

    def mark_artifact(self) -> None:
        if self._first_artifact_at == 0:
            self._first_artifact_at = time.time()

    def _delta(self, ts: float) -> Optional[float]:
        if ts == 0 or self.mission_start == 0:
            return None
        return round(ts - self.mission_start, 3)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mission_id": self.mission_id,
            "time_to_understanding_s": self._delta(self._first_objective_at),
            "time_to_plan_s": self._delta(self._first_plan_at),
            "time_to_first_action_s": self._delta(self._first_action_at),
            "time_to_first_evidence_s": self._delta(self._first_evidence_at),
            "time_to_control_s": self._delta(self._first_control_at),
            "time_to_first_artifact_s": self._delta(self._first_artifact_at),
        }


# ══════════════════════════════════════════════════════════════
# 5. Interpretation Layer (Main Class)
# ══════════════════════════════════════════════════════════════

class InterpretationLayer:
    """
    Couche d'interprétation Ñkyel.
    Traduit les événements runtime bruts en événements cognitifs
    explicables et sûrs pour VIE.

    PRIVATE REASONING ≠ EXPLAINABLE STATE.
    Ñkyel expose uniquement l'EXPLAINABLE STATE.
    """

    def __init__(self):
        self._latency_trackers: Dict[str, CognitiveLatencyMetrics] = {}
        self._cognitive_log: List[Dict[str, Any]] = []
        self._max_log = 500

    def start_mission(self, mission_id: str) -> None:
        """Initialise le tracking pour une nouvelle mission."""
        tracker = CognitiveLatencyMetrics()
        tracker.start(mission_id)
        self._latency_trackers[mission_id] = tracker

    def interpret(self, event: NkyelEvent) -> Optional[NkyelEvent]:
        """
        Interprète un événement brut du runtime.
        Retourne un événement cognitif explicable, ou None si filtré.
        """
        # 1. Vérifier la sécurité du contenu
        event_dict = event.to_dict()
        if not is_safe_for_vie(event_dict):
            logger.warning(
                f"🛡️ Événement filtré (contenu privé détecté): {event.type}"
            )
            # Sanitize et réessayer
            for key, value in event.payload.items():
                if isinstance(value, str):
                    event.payload[key] = sanitize_content(value)

        # 2. Traduire en événement cognitif
        translation = translate_runtime_event(event.type, event.payload)
        if translation is None:
            return None

        # 3. Mettre à jour les métriques de latence
        self._update_latency(event)

        # 4. Créer l'événement cognitif
        cognitive_event = NkyelEvent(
            type=CognitiveEventType.PROGRESS_UPDATE.value,
            mission_id=event.mission_id,
            agent_id=event.agent_id,
            payload={
                "description": translation["description"],
                "source_event_type": event.type,
                **translation["safe_payload"],
            },
        )

        # 5. Logger
        entry = {
            "timestamp": time.time(),
            "mission_id": event.mission_id,
            "source_type": event.type,
            "cognitive_description": translation["description"],
        }
        self._cognitive_log.append(entry)
        if len(self._cognitive_log) > self._max_log:
            self._cognitive_log = self._cognitive_log[-self._max_log:]

        return cognitive_event

    def _update_latency(self, event: NkyelEvent) -> None:
        """Met à jour les métriques de latence cognitive."""
        tracker = self._latency_trackers.get(event.mission_id)
        if not tracker:
            return

        event_type = event.type
        if event_type in ("mission.started",):
            tracker.mark_objective()
        elif event_type in ("workgraph.node.created", "workgraph.replan"):
            tracker.mark_plan()
        elif event_type in ("tool.called", "agent.spawned"):
            tracker.mark_action()
        elif event_type in ("evidence.found", "search.completed"):
            tracker.mark_evidence()
        elif event_type in ("tool.approval_required",):
            tracker.mark_control()

    def get_latency(self, mission_id: str) -> Optional[Dict[str, Any]]:
        """Récupère les métriques de latence d'une mission."""
        tracker = self._latency_trackers.get(mission_id)
        if tracker:
            return tracker.to_dict()
        return None

    def get_cognitive_log(
        self,
        mission_id: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Récupère le journal cognitif explicable."""
        log = self._cognitive_log
        if mission_id:
            log = [e for e in log if e.get("mission_id") == mission_id]
        return log[-limit:]

    def clear(self) -> None:
        self._latency_trackers.clear()
        self._cognitive_log.clear()


# ══════════════════════════════════════════════════════════════
# Singleton
# ══════════════════════════════════════════════════════════════

interpretation_layer = InterpretationLayer()
