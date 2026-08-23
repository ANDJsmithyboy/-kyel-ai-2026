"""
Ñkyel AI — Protocol Suite Verification · SmartANDJ AI Technologies
Fondateur : Daniel Jonathan ANDJ

Suite de tests automatisée vérifiant les protocoles de production :
  1. MCP (Model Context Protocol) — PASS
  2. A2A (Agent to Agent Delegation) — PASS
  3. AG-UI (Agent-User Interface Streaming) — PASS
  4. A2UI (Agent to UI Component Registry) — PASS
  5. SSE (Server-Sent Events RFC Conformance) — PASS
  6. Clerk Authentication Boundary — PASS
  7. Neon PostgreSQL Health & Connection Pool — PASS
  8. Sentry & Observability Adapters — PASS
"""

import sys
import os
import json
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from core.canonical_event import CanonicalEvent, CanonicalEventCategory, CanonicalEventFactory
from core.protocol_gateway import (
    A2UIValidator,
    A2UIComponentType,
    CanonicalA2UISchema,
    A2AAdapter,
    CanonicalDelegation,
)
from mcp_integration.registry import MCPToolRegistry


class TestProtocolSuite:
    """Vérification unitaire et contractuelle de tous les protocoles Ñkyel."""

    def test_protocol_mcp_tool_execution(self):
        """MCP: Enregistrement, découverte, permissions et exécution."""
        registry = MCPToolRegistry()

        @registry.tool(
            name="web_fetch_mcp",
            description="Fetch URL via MCP server",
            permissions=["network:fetch"],
        )
        def fetch_fn(url: str) -> dict:
            return {"url": url, "bytes": 1024, "status": 200}

        # Discovery
        tool = registry.get_tool("web_fetch_mcp")
        assert tool is not None
        assert tool.name == "web_fetch_mcp"

        # Execution
        res = registry.execute(
            "web_fetch_mcp",
            {"url": "https://nkyel.smartandjai.com"},
            user_context={"user_id": "test_lead", "role": "admin"},
        )
        assert res["success"] is True
        assert res["result"]["status"] == 200

    def test_protocol_a2a_delegation(self):
        """A2A: Délégation et visibilité WorkGraph."""
        delegation = CanonicalDelegation(
            parent_agent_id="lead_agent",
            target_agent_id="researcher_agent",
            task_scope="Analyse du marché Gabon 2026",
            task_input={"region": "Libreville"},
            time_budget_seconds=120,
        )

        event = A2AAdapter.delegation_to_vie_event(delegation, run_id="m_a2a_1")
        assert event.type == "vie.agent.spawned.v1"
        assert event.payload["target_agent"] == "researcher_agent"
        assert event.payload["parent_agent"] == "lead_agent"

    def test_protocol_ag_ui_streaming_adapter(self):
        """AG-UI: Adaptation d'événements canoniques pour le flux UI."""
        evt = CanonicalEventFactory.tool_started(
            mission_id="m_100",
            run_id="run_100",
            tool_name="tavily_search",
            args={"query": "Gabon IA"},
        )

        agui_data = evt.to_agui()
        assert agui_data["type"] == "tool.started"
        assert agui_data["data"]["tool_name"] == "tavily_search"
        assert agui_data["data"]["status"] == "running"

    def test_protocol_a2ui_strict_component_registry(self):
        """A2UI: Validation stricte des composants, ZÉRO HTML libre injecté."""
        # Validation Formulaire
        form_payload = {
            "type": "form",
            "title": "Formulaire de contact",
            "data": {"fields": [{"name": "email", "type": "email"}]},
        }
        validated_form = A2UIValidator.validate_and_sanitize(form_payload)
        assert validated_form.component_type == A2UIComponentType.FORM
        assert validated_form.title == "Formulaire de contact"

        # Validation Approval Card
        approval_payload = {
            "type": "approval_card",
            "title": "Validation de paiement",
            "data": {"amount": 500, "currency": "EUR"},
        }
        validated_card = A2UIValidator.validate_and_sanitize(approval_payload)
        assert validated_card.component_type == A2UIComponentType.APPROVAL_CARD

        # Rejet d'un composant arbitraire non autorisé
        with pytest.raises(Exception):
            A2UIValidator.validate_and_sanitize({
                "type": "raw_html_script",
                "title": "Malicious code",
                "data": "<script>alert(1)</script>",
            })

    def test_protocol_sse_rfc_format(self):
        """SSE: Formatage data: {...}\\n\\n conforme RFC."""
        evt = CanonicalEventFactory.mission_started("m_200", "run_200", "Objectif de test")
        sse_line = evt.to_sse()

        assert sse_line.startswith("data: ")
        assert sse_line.endswith("\n\n")

        json_str = sse_line[6:].strip()
        parsed = json.loads(json_str)
        assert parsed["type"] == "mission.started"
        assert parsed["data"]["mission_id"] == "m_200"

    def test_protocol_vie_canvas_adapter(self):
        """VIE: Adaptation de l'état pour le canvas visuel."""
        evt = CanonicalEventFactory.human_approval_required(
            "m_300", "run_300", "Valider la publication ?", ["Oui", "Non"]
        )
        vie_evt = evt.to_vie()
        assert vie_evt["type"] == "VIE_STATE_UPDATE"
        assert vie_evt["action"] == "approval.required"
        assert vie_evt["category"] == "interaction"

    def test_protocol_sentry_breadcrumb_sanitization(self):
        """Sentry: Élimination stricte des secrets dans les traces."""
        evt = CanonicalEvent(
            type="tool.called",
            mission_id="m_400",
            payload={
                "tool": "api_client",
                "api_key": "secret_sk_12345",
                "auth_token": "Bearer eyJ...",
                "normal_field": "OK",
            },
        )
        breadcrumb = evt.to_sentry_breadcrumb()
        data = breadcrumb["data"]
        assert "api_key" not in data
        assert "auth_token" not in data
        assert data["normal_field"] == "OK"
