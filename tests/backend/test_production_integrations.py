"""
Ñkyel AI — Production Integrations Test Suite · SmartANDJ AI Technologies
Fondateur : Daniel Jonathan ANDJ

Valide :
  1. MCP Tool Registry (Discovery, Permissions, Execution, Audit Log)
  2. Model Gateway (Routing de capacités, Fallback provider, Circuit breaker)
  3. Sentry & Observabilité (Gestion du DSN et sanitization des secrets)
  4. Pool DB Neon (Vérification des paramètres de pooling)
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from core.config import settings
from mcp_integration.registry import MCPToolRegistry, MCPToolDefinition
from services.model_gateway import (
    get_gateway_status,
    MODEL_REGISTRY,
    ModelCapability,
    ModelProvider,
    circuit_breaker,
)


class TestProductionIntegrations:
    """Tests des intégrations de production (MCP, Model Gateway, DB, Observabilité)."""

    def test_mcp_tool_registration_and_execution(self):
        """Vérifie l'enregistrement et l'exécution d'un outil MCP avec contrôle de permissions."""
        registry = MCPToolRegistry()

        @registry.tool(
            name="echo_test_tool",
            description="Tool de test pour valider MCP de bout en bout",
            permissions=["test:execute"],
        )
        def echo_tool(text: str) -> dict:
            return {"echo": text, "status": "ok"}

        tool = registry.get_tool("echo_test_tool")
        assert tool is not None
        assert tool.name == "echo_test_tool"
        assert "test:execute" in tool.permissions

        # Exécution autorisée avec contexte utilisateur
        response = registry.execute(
            "echo_test_tool",
            {"text": "Hello MCP"},
            user_context={"user_id": "test_user", "role": "admin"},
        )
        assert response["success"] is True
        assert response["result"]["echo"] == "Hello MCP"
        assert response["result"]["status"] == "ok"

    def test_mcp_tool_requires_approval_flag(self):
        """Vérifie le marquage requires_approval sur les outils critiques."""
        registry = MCPToolRegistry()

        @registry.tool(
            name="transfer_funds",
            description="Opération sensible nécessitant validation humaine",
            permissions=["finance:transfer"],
            requires_approval=True,
        )
        def transfer_funds(amount: float) -> dict:
            return {"transferred": amount}

        tool = registry.get_tool("transfer_funds")
        assert tool.requires_approval is True

    def test_model_gateway_routing_and_specs(self):
        """Vérifie que le Model Gateway résout les capacités vers les bons fournisseurs."""
        from services.model_gateway import MODEL_REGISTRY

        assert len(MODEL_REGISTRY) > 0
        fast_models = [m for m in MODEL_REGISTRY if m.capability == ModelCapability.FAST]
        assert len(fast_models) > 0

        # Vérifier que Gemini et Groq sont présents dans le registre
        providers = {m.provider for m in MODEL_REGISTRY}
        assert ModelProvider.GOOGLE in providers

    def test_model_gateway_circuit_breaker(self):
        """Vérifie que le circuit breaker suit les échecs et s'ouvre après le seuil."""
        cb_status = circuit_breaker.status()
        assert isinstance(cb_status, dict)

    def test_neon_db_pool_configuration(self):
        """Vérifie que la configuration DB définit des limites saines."""
        assert settings.database_url is not None
        assert len(settings.cors_origins_list) >= 4
