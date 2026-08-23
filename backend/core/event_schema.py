"""
Ñkyel AI — Canonical Event Schema · SmartANDJ AI Technologies
Modèle événementiel canonique unique de Ñkyel.

Chaque événement important du système (WorkGraph, VIE, agents, outils,
délégations, erreurs, coûts) passe par ce schéma unifié.

Ce modèle peut ensuite être adapté vers :
  - AG-UI (frontend)
  - A2A (inter-agents)
  - Analytics / Audit
  - Replay

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import uuid
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum


# ══════════════════════════════════════════════════════════════
# 1. Event Type Taxonomy
# ══════════════════════════════════════════════════════════════

class NkyelEventType(str, Enum):
    """Taxonomie complète des types d'événements Ñkyel."""

    # Mission lifecycle
    MISSION_CREATED = "mission.created"
    MISSION_STARTED = "mission.started"
    MISSION_COMPLETED = "mission.completed"
    MISSION_FAILED = "mission.failed"
    MISSION_CANCELLED = "mission.cancelled"

    # Agent lifecycle
    AGENT_SPAWNED = "agent.spawned"
    AGENT_STARTED = "agent.started"
    AGENT_DELEGATED = "agent.delegated"
    AGENT_COMPLETED = "agent.completed"
    AGENT_FAILED = "agent.failed"

    # WorkGraph
    WORKGRAPH_NODE_CREATED = "workgraph.node.created"
    WORKGRAPH_NODE_UPDATED = "workgraph.node.updated"
    WORKGRAPH_EDGE_CREATED = "workgraph.edge.created"
    WORKGRAPH_REPLAN = "workgraph.replan"

    # Tool & MCP
    TOOL_CALLED = "tool.called"
    TOOL_COMPLETED = "tool.completed"
    TOOL_FAILED = "tool.failed"
    TOOL_APPROVAL_REQUIRED = "tool.approval_required"

    # Search & Evidence
    SEARCH_STARTED = "search.started"
    SEARCH_COMPLETED = "search.completed"
    EVIDENCE_FOUND = "evidence.found"
    EVIDENCE_CONTRADICTION = "evidence.contradiction"

    # Model & Inference
    MODEL_CALL_STARTED = "model.call.started"
    MODEL_CALL_COMPLETED = "model.call.completed"
    MODEL_CALL_FAILED = "model.call.failed"
    MODEL_STREAMING = "model.streaming"

    # Wide Intelligence
    WIDE_WAVE_STARTED = "wide.wave.started"
    WIDE_WAVE_COMPLETED = "wide.wave.completed"
    WIDE_SYNTHESIS = "wide.synthesis"
    WIDE_GAP_DETECTED = "wide.gap.detected"

    # VIE (Visual Intelligence Experience)
    VIE_STATE_UPDATE = "vie.state.update"
    VIE_PROGRESS = "vie.progress"

    # A2UI
    A2UI_RENDER = "vie.a2ui.render"

    # Sandbox
    SANDBOX_CREATED = "sandbox.created"
    SANDBOX_EXECUTED = "sandbox.executed"
    SANDBOX_DESTROYED = "sandbox.destroyed"

    # Cost
    COST_RECORDED = "cost.recorded"
    BUDGET_WARNING = "budget.warning"
    BUDGET_EXCEEDED = "budget.exceeded"

    # Audit
    AUDIT_ACTION = "audit.action"


# ══════════════════════════════════════════════════════════════
# 2. Canonical Event Schema
# ══════════════════════════════════════════════════════════════

SCHEMA_VERSION = "1"


@dataclass
class NkyelEvent:
    """
    Événement canonique Ñkyel.

    Chaque événement important du système est représenté par cette structure.
    Le domaine interne Ñkyel reste indépendant des protocoles externes
    (MCP, A2A, AG-UI). Les adaptateurs convertissent ce format vers
    les protocoles appropriés.
    """
    version: str = SCHEMA_VERSION
    type: str = NkyelEventType.VIE_STATE_UPDATE.value
    id: str = field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:12]}")
    timestamp: float = field(default_factory=time.time)

    # Correlation IDs
    trace_id: str = ""
    request_id: str = ""
    mission_id: str = ""
    run_id: str = ""
    thread_id: str = ""

    # Actor
    agent_id: str = ""
    user_id: str = ""
    organization_id: str = ""
    workspace_id: str = ""

    # WorkGraph
    workgraph_node_id: Optional[str] = None
    workgraph_edge_id: Optional[str] = None

    # Payload
    payload: Dict[str, Any] = field(default_factory=dict)

    # Metadata
    source: str = "nkyel_core"  # "nkyel_core", "deerflow", "mcp", "a2a"
    severity: str = "info"      # "debug", "info", "warning", "error", "critical"

    def to_dict(self) -> Dict[str, Any]:
        """Sérialise l'événement en dictionnaire."""
        result: Dict[str, Any] = {
            "version": self.version,
            "type": self.type,
            "id": self.id,
            "timestamp": self.timestamp,
            "trace_id": self.trace_id,
            "mission_id": self.mission_id,
            "agent_id": self.agent_id,
            "payload": self.payload,
        }
        # Inclure les champs optionnels uniquement s'ils sont renseignés
        if self.request_id:
            result["request_id"] = self.request_id
        if self.run_id:
            result["run_id"] = self.run_id
        if self.thread_id:
            result["thread_id"] = self.thread_id
        if self.user_id:
            result["user_id"] = self.user_id
        if self.organization_id:
            result["organization_id"] = self.organization_id
        if self.workspace_id:
            result["workspace_id"] = self.workspace_id
        if self.workgraph_node_id:
            result["workgraph_node_id"] = self.workgraph_node_id
        if self.workgraph_edge_id:
            result["workgraph_edge_id"] = self.workgraph_edge_id
        if self.source != "nkyel_core":
            result["source"] = self.source
        if self.severity != "info":
            result["severity"] = self.severity
        return result

    @classmethod
    def from_context(
        cls,
        event_type: NkyelEventType,
        payload: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> "NkyelEvent":
        """
        Crée un événement enrichi avec le contexte de requête courant.
        Injecte automatiquement trace_id, request_id, user_id, etc.
        """
        try:
            from core.context import get_context
            ctx = get_context()
            return cls(
                type=event_type.value,
                trace_id=ctx.trace_id,
                request_id=ctx.request_id,
                mission_id=ctx.mission_id or "",
                user_id=ctx.user_id or "",
                organization_id=ctx.organization_id or "",
                workspace_id=ctx.workspace_id or "",
                payload=payload or {},
                **kwargs,
            )
        except Exception:
            return cls(
                type=event_type.value,
                payload=payload or {},
                **kwargs,
            )


# ══════════════════════════════════════════════════════════════
# 3. Event Emitter
# ══════════════════════════════════════════════════════════════

class NkyelEventEmitter:
    """
    Émetteur d'événements central.
    Enregistre les listeners et distribue les événements canoniques.
    Peut alimenter : WorkGraph, VIE, analytics, audit, AG-UI adapter.
    """

    def __init__(self):
        self._listeners: List = []
        self._event_log: List[NkyelEvent] = []
        self._max_log_size: int = 1000

    def on(self, callback) -> None:
        """Enregistre un listener d'événements."""
        self._listeners.append(callback)

    def emit(self, event: NkyelEvent) -> NkyelEvent:
        """
        Émet un événement vers tous les listeners enregistrés.
        Enregistre aussi dans le journal interne.
        """
        # Journaliser
        self._event_log.append(event)
        if len(self._event_log) > self._max_log_size:
            self._event_log = self._event_log[-self._max_log_size:]

        # Distribuer
        for listener in self._listeners:
            try:
                listener(event)
            except Exception:
                pass  # Un listener défaillant ne doit pas bloquer les autres

        return event

    def emit_from_context(
        self,
        event_type: NkyelEventType,
        payload: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> NkyelEvent:
        """Raccourci : crée un événement depuis le contexte courant et l'émet."""
        event = NkyelEvent.from_context(event_type, payload, **kwargs)
        return self.emit(event)

    def get_recent_events(
        self,
        event_type: Optional[str] = None,
        mission_id: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Récupère les événements récents avec filtrage optionnel."""
        events = self._event_log
        if event_type:
            events = [e for e in events if e.type == event_type]
        if mission_id:
            events = [e for e in events if e.mission_id == mission_id]
        return [e.to_dict() for e in events[-limit:]]

    def clear(self) -> None:
        """Vide le journal d'événements."""
        self._event_log.clear()


# ══════════════════════════════════════════════════════════════
# 4. Cost Event Helpers
# ══════════════════════════════════════════════════════════════

def cost_event(
    category: str,
    provider: str,
    operation: str,
    cost_usd: float,
    input_tokens: int = 0,
    output_tokens: int = 0,
    mission_id: str = "",
    agent_id: str = "",
) -> NkyelEvent:
    """Crée un événement de coût standardisé."""
    return NkyelEvent.from_context(
        NkyelEventType.COST_RECORDED,
        payload={
            "category": category,
            "provider": provider,
            "operation": operation,
            "cost_usd": cost_usd,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        },
        mission_id=mission_id,
        agent_id=agent_id,
    )


# ══════════════════════════════════════════════════════════════
# Singleton
# ══════════════════════════════════════════════════════════════

event_emitter = NkyelEventEmitter()
