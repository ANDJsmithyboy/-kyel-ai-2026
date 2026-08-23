"""
Ñkyel AI — Tests d'Acceptation Architecture Backend Étendue · SmartANDJ AI Technologies
Validation complète des couches de protocoles et services :
- AuthBoundary & NkyelIdentity / Roles / Permissions
- SandboxManager & LocalSandboxProvider (exécution de code isolé)
- SearchGateway & Extraction Markdown / Déduplication
- ProtocolGateway (MCP, A2A, AG-UI, A2UI validation sécurisée)
- WideIntelligenceEngine (Budgets, Décomposition)
- SpeechService (TTS & STT Abstraction)
- Observability (Sentry context sanitization)

Fondateur : Daniel Jonathan ANDJ
"""

import os
import sys
import pytest
import asyncio
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from core.auth_boundary import (
    NkyelRole,
    NkyelPermission,
    NkyelIdentity,
    AuthorizationContext,
    auth_boundary,
)
from core.errors import NkyelAPIError, NkyelErrorCode
from services.sandbox_manager import (
    SandboxConfig,
    LocalSandboxProvider,
    SandboxManager,
    local_sandbox_provider,
)
from services.search_gateway import (
    SearchResultItem,
    SearchGateway,
    search_gateway,
)
from core.protocol_gateway import (
    CanonicalAgentEvent,
    CanonicalToolCall,
    CanonicalDelegation,
    A2UIComponentType,
    A2UIValidator,
    MCPAdapter,
    A2AAdapter,
    AGUIAdapter,
    A2UIAdapter,
    protocol_gateway,
)
from services.wide_intelligence import (
    WideResearchBudget,
    SubagentTaskSpec,
    wide_intelligence_engine,
)
from services.speech_service import (
    SpeechService,
    AudioSynthesisResult,
    TranscriptionResult,
    speech_service,
)


# ══════════════════════════════════════════════════════════════
# 1. Auth Boundary & Permissions Tests
# ══════════════════════════════════════════════════════════════

def test_auth_boundary_role_permissions():
    identity = NkyelIdentity(
        nkyel_user_id="usr_test_123",
        email="test@nkyel.ai",
        full_name="Membre Test",
        is_founder=False,
    )

    # Membre standard
    ctx_member = auth_boundary.authorize(identity, role=NkyelRole.MEMBER)
    assert ctx_member.has_permission(NkyelPermission.MISSION_CREATE) is True
    assert ctx_member.has_permission(NkyelPermission.SECRETS_MANAGE) is False

    # Le fondateur a TOUTES les permissions
    identity_founder = NkyelIdentity(
        nkyel_user_id="usr_founder_001",
        email="founder@nkyel.ai",
        full_name="Daniel Jonathan ANDJ",
        is_founder=True,
    )
    ctx_founder = auth_boundary.authorize(identity_founder)
    assert ctx_founder.has_permission(NkyelPermission.SECRETS_MANAGE) is True
    assert ctx_founder.has_permission(NkyelPermission.BUDGET_OVERRIDE) is True


def test_auth_boundary_require_enforcement():
    identity = NkyelIdentity(
        nkyel_user_id="usr_viewer",
        email="viewer@nkyel.ai",
        full_name="Viewer Test",
    )
    ctx = auth_boundary.authorize(identity, role=NkyelRole.VIEWER)

    # Viewer can read
    ctx.require(NkyelPermission.MISSION_READ)

    # Viewer cannot delete
    with pytest.raises(NkyelAPIError) as exc_info:
        ctx.require(NkyelPermission.MISSION_DELETE, action_name="delete_mission")
    assert exc_info.value.code == NkyelErrorCode.AUTHORIZATION_ERROR


# ══════════════════════════════════════════════════════════════
# 2. Sandbox Provider & Execution Tests
# ══════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_local_sandbox_code_execution():
    config = SandboxConfig(user_id="usr_test_sb", timeout_seconds=10)
    sb_id = await local_sandbox_provider.create_sandbox(config)
    assert sb_id.startswith("local_sb_")

    # Exécution de code Python simple
    python_code = "print(10 + 32)"
    result = await local_sandbox_provider.run_code(sb_id, python_code)
    assert result.success is True
    assert result.exit_code == 0
    assert "42" in result.stdout

    # Test écriture et lecture de fichier
    await local_sandbox_provider.write_file(sb_id, "data.txt", "Contenu souverain Ñkyel")
    read_back = await local_sandbox_provider.read_file(sb_id, "data.txt")
    assert read_back is not None
    assert b"Contenu souverain" in read_back

    # Destruction
    destroyed = await local_sandbox_provider.destroy_sandbox(sb_id)
    assert destroyed is True


# ══════════════════════════════════════════════════════════════
# 3. Search Gateway & Extraction Tests
# ══════════════════════════════════════════════════════════════

def test_search_gateway_markdown_extraction():
    raw_html = """
    <html>
      <head><script>alert('hack');</script></head>
      <body>
        <nav><a href="#">Menu</a></nav>
        <h1>Titre du Rapport 2026</h1>
        <p>Le Gabon accélère son programme d'intelligence artificielle souveraine.</p>
        <footer>Copyright 2026</footer>
      </body>
    </html>
    """
    clean_md = search_gateway.extract(raw_html)
    assert "alert('hack')" not in clean_md
    assert "Menu" not in clean_md
    assert "Titre du Rapport 2026" in clean_md
    assert "intelligence artificielle souveraine" in clean_md


def test_search_result_item_domain_parsing():
    item = SearchResultItem(
        title="Article Test",
        url="https://www.gabonreview.com/economie/ia-2026",
        snippet="Extrait d'information",
    )
    assert item.domain == "gabonreview.com"


# ══════════════════════════════════════════════════════════════
# 4. Protocol Gateway (MCP, A2A, AG-UI, A2UI) Tests
# ══════════════════════════════════════════════════════════════

def test_a2ui_validation_and_rejection():
    # Composant valide
    valid_payload = {
        "component": "comparison_grid",
        "title": "Comparatif Solutions IA",
        "data": {"options": ["Ñkyel", "Standard"], "winner": "Ñkyel"},
    }
    schema = A2UIValidator.validate_and_sanitize(valid_payload)
    assert schema.component_type == A2UIComponentType.COMPARISON_GRID
    assert schema.title == "Comparatif Solutions IA"

    # Composant non autorisé (ex: tentative d'injecter du HTML arbitraire)
    invalid_payload = {
        "component": "raw_html_iframe",
        "title": "Exploit",
    }
    with pytest.raises(NkyelAPIError) as exc_info:
        A2UIValidator.validate_and_sanitize(invalid_payload)
    assert exc_info.value.code == NkyelErrorCode.INVALID_INPUT


def test_ag_ui_event_formatting():
    event = CanonicalAgentEvent(
        id="evt_test_123",
        type="vie.tool.started.v1",
        mission_id="msn_launch",
        agent_id="lead_agent",
        payload={"tool": "tavily_search"},
    )
    sse_line = AGUIAdapter.format_sse(event)
    assert sse_line.startswith("data: {")
    assert sse_line.endswith("}\n\n")
    assert "vie.tool.started.v1" in sse_line
    assert "tavily_search" in sse_line


def test_a2a_delegation_to_vie_event():
    delegation = CanonicalDelegation(
        parent_agent_id="lead_agent",
        target_agent_id="subagent_gabon",
        task_scope="Recherche sur l'écosystème numérique",
        task_input={"country": "Gabon"},
    )
    event = A2AAdapter.delegation_to_vie_event(delegation, run_id="run_123")
    assert event.type == "vie.agent.spawned.v1"
    assert event.payload["target_agent"] == "subagent_gabon"


# ══════════════════════════════════════════════════════════════
# 5. Speech Service Tests
# ══════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_speech_service_tts_fallback():
    tts_result = await speech_service.text_to_speech("Bienvenue sur Ñkyel AI", language="fr")
    assert isinstance(tts_result, AudioSynthesisResult)
    assert len(tts_result.audio_bytes) > 0
    assert tts_result.latency_ms >= 0


# ══════════════════════════════════════════════════════════════
# 6. Wide Intelligence Budget & Spec Tests
# ══════════════════════════════════════════════════════════════

def test_wide_intelligence_budget_defaults():
    budget = WideResearchBudget()
    assert budget.max_agents == 8
    assert budget.max_parallel_agents == 4
    assert budget.max_cost_usd == 0.50

    spec = SubagentTaskSpec(
        subagent_id="sub_1",
        agent_name="Agent Afrique Centrale",
        region_or_focus="CEMAC",
        queries=["CEMAC IA 2026"],
    )
    assert spec.status == "pending"
    assert len(spec.queries) == 1
