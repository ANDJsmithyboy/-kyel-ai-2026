"""
Ñkyel AI — Protocol Gateway & Canonical Adapters · SmartANDJ AI Technologies
Passerelle protocolaire découplant le domaine interne Ñkyel des protocoles externes.

Fournit :
1. Modèle Canonique Interne Ñkyel (Canonical Domain Model)
2. MCPAdapter  — Traduction des outils et contextes MCP vers le modèle interne
3. A2AAdapter  — Agent2Agent (délégation, découverte, handoff, visibilité WorkGraph & VIE)
4. AGUIAdapter — Normalisation du streaming d'interaction Agent ↔ Utilisateur
5. A2UIAdapter — Agent → UI dynamique contrôlée (Formulaires, Tableaux, Cartes d'approbation)
                 Garantit : ZÉRO injection HTML/JS arbitraire.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import json
import uuid
import logging
from typing import Optional, Dict, Any, List, Set
from enum import Enum
from dataclasses import dataclass, field

from core.errors import NkyelAPIError, NkyelErrorCode

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Canonical Domain Model (Le Cœur Indépendant de Ñkyel)
# ══════════════════════════════════════════════════════════════

@dataclass
class CanonicalAgentEvent:
    """Événement d'agent canonique standardisé."""
    id: str = field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:10]}")
    version: str = "v1"
    type: str = "agent.step"
    trace_id: str = ""
    mission_id: str = ""
    agent_id: str = "lead_agent"
    workgraph_node_id: Optional[str] = None
    timestamp: float = field(default_factory=time.time)
    payload: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CanonicalToolCall:
    """Appel d'outil standardisé."""
    call_id: str
    tool_name: str
    arguments: Dict[str, Any]
    provider: str = "mcp"
    is_high_risk: bool = False
    requires_approval: bool = False


@dataclass
class CanonicalDelegation:
    """Délégation d'un agent vers un sous-agent (A2A)."""
    parent_agent_id: str
    target_agent_id: str
    task_scope: str
    task_input: Dict[str, Any]
    time_budget_seconds: int = 60
    max_tokens: int = 4000
    delegation_id: str = field(default_factory=lambda: f"del_{uuid.uuid4().hex[:8]}")


# ══════════════════════════════════════════════════════════════
# 2. A2UI: Trusted Component Schema Registry
# ══════════════════════════════════════════════════════════════

class A2UIComponentType(str, Enum):
    """Types de composants autorisés pour l'A2UI. Zéro HTML libre."""
    FORM = "form"                       # Formulaire interactif
    TABLE = "table"                     # Tableau comparatif / données
    APPROVAL_CARD = "approval_card"     # Carte de validation / décision humaine
    METRIC_CARD = "metric_card"         # Indicateur clé / KPI
    COMPARISON_GRID = "comparison_grid" # Grille de comparaison multicritères
    TIMELINE = "timeline"               # Frise chronologique d'étapes


@dataclass
class CanonicalA2UISchema:
    """Schéma d'UI dynamique généré par un agent."""
    component_type: A2UIComponentType
    title: str
    schema_payload: Dict[str, Any]
    version: str = "1.0"
    validation_status: str = "validated"


class A2UIValidator:
    """
    Validateur strict des structures UI générées par les agents.
    Empêche toute injection XSS ou HTML non autorisé.
    """

    ALLOWED_COMPONENTS: Set[str] = {c.value for c in A2UIComponentType}

    @classmethod
    def validate_and_sanitize(cls, raw_ui_payload: Dict[str, Any]) -> CanonicalA2UISchema:
        comp_type_str = raw_ui_payload.get("component", raw_ui_payload.get("type", "")).lower()
        if comp_type_str not in cls.ALLOWED_COMPONENTS:
            raise NkyelAPIError(
                code=NkyelErrorCode.INVALID_INPUT,
                message=f"Type de composant A2UI non autorisé : '{comp_type_str}'",
                metadata={"allowed": list(cls.ALLOWED_COMPONENTS)},
            )

        title = str(raw_ui_payload.get("title", "Interface")).strip()[:120]
        data = raw_ui_payload.get("data", raw_ui_payload.get("payload", {}))

        return CanonicalA2UISchema(
            component_type=A2UIComponentType(comp_type_str),
            title=title,
            schema_payload=data,
        )


# ══════════════════════════════════════════════════════════════
# 3. Protocol Adapters
# ══════════════════════════════════════════════════════════════

class MCPAdapter:
    """Adaptateur MCP (Model Context Protocol)."""

    @classmethod
    def tool_call_to_canonical(cls, mcp_call_dict: Dict[str, Any]) -> CanonicalToolCall:
        return CanonicalToolCall(
            call_id=mcp_call_dict.get("id", f"call_{uuid.uuid4().hex[:8]}"),
            tool_name=mcp_call_dict.get("name", "unknown_tool"),
            arguments=mcp_call_dict.get("arguments", {}),
            provider="mcp",
        )

    @classmethod
    def canonical_to_mcp_result(cls, canonical_result: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "content": [
                {"type": "text", "text": json.dumps(canonical_result, ensure_ascii=False)}
            ],
            "isError": False,
        }


class A2AAdapter:
    """
    Adaptateur Agent2Agent (A2A).
    Normalise la découverte de capacités et la délégation entre agents,
    et alimente automatiquement les événements WorkGraph et VIE.
    """

    @classmethod
    def to_canonical_delegation(
        cls,
        parent_agent: str,
        target_agent: str,
        task: str,
        context_data: Optional[Dict[str, Any]] = None,
    ) -> CanonicalDelegation:
        return CanonicalDelegation(
            parent_agent_id=parent_agent,
            target_agent_id=target_agent,
            task_scope=task,
            task_input=context_data or {},
        )

    @classmethod
    def delegation_to_vie_event(cls, delegation: CanonicalDelegation, run_id: str) -> CanonicalAgentEvent:
        """Génère l'événement VIE visualisable pour la délégation."""
        return CanonicalAgentEvent(
            type="vie.agent.spawned.v1",
            mission_id=run_id,
            agent_id=delegation.target_agent_id,
            payload={
                "delegation_id": delegation.delegation_id,
                "parent_agent": delegation.parent_agent_id,
                "target_agent": delegation.target_agent_id,
                "task_scope": delegation.task_scope,
            },
        )


class AGUIAdapter:
    """
    Adaptateur AG-UI (Agent ↔ User Interaction).
    Convertit les événements canoniques Ñkyel vers le format SSE compatible AG-UI :
      data: {"type": "...", "data": {...}}
    """

    @classmethod
    def format_sse(cls, event: Any) -> str:
        if hasattr(event, "to_dict"):
            evt_dict = event.to_dict()
            payload = {
                "type": evt_dict.get("type", "agent.step"),
                "data": evt_dict,
            }
        elif isinstance(event, dict):
            payload = {
                "type": event.get("type", "agent.step"),
                "data": event.get("data", event),
            }
        else:
            payload = {
                "type": getattr(event, "type", "agent.step"),
                "data": {
                    "id": getattr(event, "id", ""),
                    "version": getattr(event, "version", "v1"),
                    "trace_id": getattr(event, "trace_id", ""),
                    "mission_id": getattr(event, "mission_id", ""),
                    "agent_id": getattr(event, "agent_id", ""),
                    "workgraph_node_id": getattr(event, "workgraph_node_id", None),
                    "timestamp": getattr(event, "timestamp", time.time()),
                    **getattr(event, "payload", {}),
                },
            }
        return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


class A2UIAdapter:
    """
    Adaptateur A2UI (Agent → User Interface).
    Formate un composant validé pour le rendu côté frontend React / Shadcn.
    """

    @classmethod
    def render_event(cls, schema: CanonicalA2UISchema, run_id: str) -> CanonicalAgentEvent:
        return CanonicalAgentEvent(
            type="vie.a2ui.render.v1",
            mission_id=run_id,
            payload={
                "component": schema.component_type.value,
                "title": schema.title,
                "schema": schema.schema_payload,
                "version": schema.version,
            },
        )


# ══════════════════════════════════════════════════════════════
# 4. Protocol Gateway Orchestrator
# ══════════════════════════════════════════════════════════════

class ProtocolGateway:
    """
    Point de contact unique pour tous les protocoles ouverts.
    Garantit que le domaine Ñkyel reste indépendant et souverain.
    """

    def __init__(self):
        self.mcp = MCPAdapter()
        self.a2a = A2AAdapter()
        self.ag_ui = AGUIAdapter()
        self.a2ui = A2UIAdapter()
        self.a2ui_validator = A2UIValidator()

    def process_incoming_a2ui(self, raw_payload: Dict[str, Any], run_id: str) -> str:
        """Valide et transforme une demande d'UI d'agent en événement SSE AG-UI."""
        schema = self.a2ui_validator.validate_and_sanitize(raw_payload)
        event = self.a2ui.render_event(schema, run_id)
        return self.ag_ui.format_sse(event)


# Singleton
protocol_gateway = ProtocolGateway()
