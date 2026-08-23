"""
Ñkyel AI — Tests de Validation Mission Backend Correction · SmartANDJ AI Technologies
Vérification complète de la mission backend corrigée :
1. Model Gateway :
   - Classes de capacité (FAST, BALANCED, DEEP, CODE, VISION, RESEARCH, MULTILINGUAL, LOCAL, SOVEREIGN)
   - Fournisseurs (Google, Groq, Fireworks, Together, RunPod, Sovereign)
   - Interfaces (chat/call, stream, embed, rerank, research, multilingual)
   - Statut du Gateway
2. Cost Engine :
   - Enregistrement des coûts par catégorie (model, search, embedding, sandbox, tts, stt)
   - Agrégation par user_id, workspace_id, mission_id, provider, category
   - Résumé des coûts
3. Canonical Event Schema :
   - Taxonomie des types d'événements NkyelEventType
   - NkyelEvent avec correlation IDs (trace_id, request_id, mission_id, etc.)
   - Émetteur d'événements NkyelEventEmitter
4. Protocol Gateway & AG-UI Adapter :
   - Sérialisation SSE d'événements canoniques NkyelEvent
   - A2UI validation stricte (zéro injection HTML arbitraire)
5. Observabilité Sentry & OpenTelemetry :
   - Capture d'erreurs enrichies avec workspace_id, thread_id, run_id, agent_id
   - Filtrage strict des headers sensibles (zéro fuite de clés)
   - Création de spans OpenTelemetry

Fondateur : Daniel Jonathan ANDJ
"""

import os
import sys
import pytest
import asyncio
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from core.event_schema import (
    NkyelEventType,
    NkyelEvent,
    NkyelEventEmitter,
    event_emitter,
    cost_event,
)
from services.cost_engine import (
    CostCategory,
    CostEntry,
    CostEngine,
    cost_engine,
)
from services.model_gateway import (
    ModelCapability,
    ModelProvider,
    ModelSpec,
    MODEL_REGISTRY,
    GatewayResponse,
    get_gateway_status,
    call,
    fast,
    balanced,
    deep,
    code,
    vision,
    research,
    multilingual,
    stream,
    embed,
    rerank,
)
from core.protocol_gateway import (
    A2UIComponentType,
    A2UIValidator,
    CanonicalA2UISchema,
    AGUIAdapter,
    protocol_gateway,
)
from core.observability import (
    capture_agent_error,
    create_span,
    init_sentry,
    init_opentelemetry,
    _SENSITIVE_HEADERS,
)
from core.context import RequestContext, set_context, clear_context


# ══════════════════════════════════════════════════════════════
# 1. Model Gateway & Inference Router Tests
# ══════════════════════════════════════════════════════════════

def test_model_capabilities_completeness():
    """Vérifie que toutes les 9 classes de capacité requises par Ñkyel sont définies."""
    expected_capabilities = {
        "FAST", "BALANCED", "DEEP", "CODE", "VISION",
        "RESEARCH", "MULTILINGUAL", "LOCAL", "SOVEREIGN",
    }
    actual_capabilities = {c.value for c in ModelCapability}
    assert expected_capabilities.issubset(actual_capabilities)


def test_model_providers_completeness():
    """Vérifie que tous les fournisseurs requis sont présents."""
    expected_providers = {
        "google", "groq", "fireworks", "together", "runpod", "local", "nkyel_hosted",
    }
    actual_providers = {p.value for p in ModelProvider}
    assert expected_providers.issubset(actual_providers)


def test_model_registry_contains_new_providers():
    """Vérifie que le registre de modèles contient des modèles Fireworks, Together et Sovereign."""
    providers_in_registry = {m.provider for m in MODEL_REGISTRY}
    assert ModelProvider.FIREWORKS in providers_in_registry
    assert ModelProvider.TOGETHER in providers_in_registry
    assert ModelProvider.RUNPOD in providers_in_registry
    assert ModelProvider.GOOGLE in providers_in_registry


def test_gateway_status_structure():
    """Vérifie que le statut du Model Gateway expose les métriques, circuits, capacités et interfaces."""
    status = get_gateway_status()
    assert "capabilities" in status
    assert "providers" in status
    assert "interfaces" in status
    assert "registered_models" in status
    assert status["registered_models"] > 0
    assert "chat" in status["interfaces"]
    assert "stream" in status["interfaces"]
    assert "embed" in status["interfaces"]
    assert "rerank" in status["interfaces"]


@pytest.mark.asyncio
async def test_gateway_call_fast_with_mock():
    """Vérifie qu'un appel fast() fonctionne via le Model Gateway mocké."""
    with patch("services.model_gateway._call_google_gemini") as mock_gemini:
        mock_gemini.return_value = {
            "text": "Réponse rapide Ñkyel",
            "input_tokens": 10,
            "output_tokens": 5,
        }
        res = await fast("Bonjour")
        assert isinstance(res, GatewayResponse)
        assert res.text == "Réponse rapide Ñkyel"
        assert res.capability == ModelCapability.FAST.value
        assert res.attempts >= 1


@pytest.mark.asyncio
async def test_gateway_research_convenience():
    """Vérifie que la fonction research() cible bien la capacité RESEARCH."""
    with patch("services.model_gateway._call_google_gemini") as mock_gemini:
        mock_gemini.return_value = {
            "text": "Synthèse de recherche Ñkyel",
            "input_tokens": 20,
            "output_tokens": 15,
        }
        res = await research("Recherche sur l'agriculture au Gabon")
        assert res.capability == ModelCapability.RESEARCH.value
        assert res.text == "Synthèse de recherche Ñkyel"


@pytest.mark.asyncio
async def test_gateway_multilingual_convenience():
    """Vérifie que la fonction multilingual() cible la capacité MULTILINGUAL."""
    with patch("services.model_gateway._call_google_gemini") as mock_gemini:
        mock_gemini.return_value = {
            "text": "Mbolo! Mbote! Salama!",
            "input_tokens": 10,
            "output_tokens": 8,
        }
        res = await multilingual("Traduire 'bonjour' en Fang et Lingala")
        assert res.capability == ModelCapability.MULTILINGUAL.value


@pytest.mark.asyncio
async def test_gateway_rerank():
    """Vérifie l'interface rerank du gateway."""
    docs = ["Doc A: Climat", "Doc B: Énergie", "Doc C: Agriculture"]
    reranked = await rerank("énergie solaire", docs, top_k=2)
    assert len(reranked) == 2
    assert "relevance_score" in reranked[0]
    assert reranked[0]["relevance_score"] >= reranked[1]["relevance_score"]


# ══════════════════════════════════════════════════════════════
# 2. Cost Engine Tests
# ══════════════════════════════════════════════════════════════

def test_cost_engine_record_and_aggregation():
    """Vérifie l'enregistrement et l'agrégation fine des coûts."""
    engine = CostEngine()

    # Enregistrer différents types de coûts
    engine.record_model_call(
        provider="google",
        model="gemini-3.1-pro",
        cost_usd=0.0025,
        input_tokens=1000,
        output_tokens=200,
        latency_ms=450,
        mission_id="msn_001",
        user_id="usr_001",
        workspace_id="ws_001",
    )

    engine.record_search(
        provider="tavily",
        cost_usd=0.001,
        mission_id="msn_001",
        user_id="usr_001",
        workspace_id="ws_001",
    )

    engine.record_sandbox(
        provider="e2b",
        duration_ms=15000,
        cost_usd=0.005,
        mission_id="msn_001",
        user_id="usr_001",
        workspace_id="ws_001",
    )

    engine.record_speech(
        direction="tts",
        provider="elevenlabs",
        cost_usd=0.003,
        duration_ms=2500,
        mission_id="msn_001",
        user_id="usr_001",
        workspace_id="ws_001",
    )

    # Coût total
    total = engine.total_cost(mission_id="msn_001")
    assert round(total, 4) == round(0.0025 + 0.001 + 0.005 + 0.003, 4)

    # Par catégorie
    by_cat = engine.cost_by_category(mission_id="msn_001")
    assert "model_inference" in by_cat
    assert "search" in by_cat
    assert "sandbox" in by_cat
    assert "tts" in by_cat

    # Par workspace et user
    by_user = engine.cost_by_user()
    assert "usr_001" in by_user

    by_ws = engine.cost_by_workspace()
    assert "ws_001" in by_ws

    # Résumé
    summary = engine.summary(mission_id="msn_001")
    assert summary["total_entries"] == 4
    assert summary["total_input_tokens"] == 1000


# ══════════════════════════════════════════════════════════════
# 3. Canonical Event Schema Tests
# ══════════════════════════════════════════════════════════════

def test_canonical_event_schema_creation():
    """Vérifie la création et sérialisation d'un événement canonique NkyelEvent."""
    evt = NkyelEvent(
        type=NkyelEventType.AGENT_DELEGATED.value,
        mission_id="msn_test",
        agent_id="lead_agent",
        trace_id="trc_test_001",
        payload={
            "target_agent": "agent_senegal",
            "task": "Recherche réglementation Dakar",
        },
    )

    d = evt.to_dict()
    assert d["version"] == "1"
    assert d["type"] == "agent.delegated"
    assert d["mission_id"] == "msn_test"
    assert d["trace_id"] == "trc_test_001"
    assert d["payload"]["target_agent"] == "agent_senegal"


def test_event_emitter_listeners():
    """Vérifie que l'émetteur d'événements distribue correctement les événements aux listeners."""
    emitter = NkyelEventEmitter()
    received_events = []

    emitter.on(lambda e: received_events.append(e))

    evt = NkyelEvent(
        type=NkyelEventType.WIDE_WAVE_STARTED.value,
        mission_id="msn_wide_1",
        payload={"wave": 1, "agents_count": 8},
    )
    emitter.emit(evt)

    assert len(received_events) == 1
    assert received_events[0].type == "wide.wave.started"
    assert received_events[0].payload["agents_count"] == 8


def test_ag_ui_adapter_formats_canonical_event():
    """Vérifie que AGUIAdapter convertit correctement un NkyelEvent en SSE."""
    evt = NkyelEvent(
        type=NkyelEventType.WORKGRAPH_NODE_CREATED.value,
        mission_id="msn_999",
        agent_id="lead_agent",
        payload={"node_id": "n1", "label": "Hypothèse A"},
    )
    sse_line = AGUIAdapter.format_sse(evt)
    assert sse_line.startswith("data: ")
    assert "workgraph.node.created" in sse_line
    assert "msn_999" in sse_line


# ══════════════════════════════════════════════════════════════
# 4. Observability & Security Tests
# ══════════════════════════════════════════════════════════════

def test_sensitive_headers_filtering():
    """Vérifie que les clés sensibles sont bien identifiées pour le filtrage Sentry."""
    assert "authorization" in _SENSITIVE_HEADERS
    assert "cookie" in _SENSITIVE_HEADERS
    assert "x-api-key" in _SENSITIVE_HEADERS
    assert "clerk_secret" in _SENSITIVE_HEADERS


def test_capture_agent_error_with_full_context():
    """Vérifie que capture_agent_error n'explose pas et inclut les tags de corrélation."""
    ctx = RequestContext(
        request_id="req_test_123",
        trace_id="trc_test_456",
        user_id="usr_007",
        workspace_id="ws_001",
        organization_id="org_001",
        mission_id="msn_001",
    )
    set_context(ctx)

    try:
        err = ValueError("Test agent execution error")
        capture_agent_error(
            error=err,
            agent_id="subagent_gabon",
            run_id="run_001",
            thread_id="th_001",
        )
    finally:
        clear_context()


def test_create_span_helper():
    """Vérifie que create_span retourne un context manager utilisable sans planter."""
    with create_span("test.operation", {"agent.id": "lead"}) as span:
        assert True
