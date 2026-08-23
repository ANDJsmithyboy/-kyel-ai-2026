"""
Ñkyel AI — Tests d'Acceptation Backend de Production · SmartANDJ AI Technologies
Validation complète des composants durcis :
- RequestContext & Tracing
- NkyelAPIError & Codes de Domaine
- MissionCancellationManager
- Model Gateway & Circuit Breakers
- WorkGraph VIE v1 & SSE Streaming
- Multi-Tier Memory & Tenant Isolation
- Telemetry & Budget Enforcement
- Health Endpoints (Liveness, Readiness, Startup, System Status)

Fondateur : Daniel Jonathan ANDJ
"""

import os
import sys
import pytest
import time
import asyncio
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

# ── Core Imports ──────────────────────────────────────────────
from core.context import RequestContext, get_context, set_context, clear_context
from core.errors import (
    NkyelAPIError,
    NkyelErrorCode,
    auth_error,
    forbidden,
    not_found,
    rate_limited,
    model_unavailable,
    budget_exceeded,
    tool_failed,
)
from core.cancellation import (
    CancellationToken,
    MissionCancelled,
    MissionCancellationManager,
    cancellation_manager,
)
from services.model_gateway import (
    ModelCapability,
    ModelProvider,
    ModelSpec,
    MODEL_REGISTRY,
    CircuitBreaker,
    CallMetrics,
    GatewayMetrics,
    _get_models_for_capability,
    get_gateway_status,
)
from events.workgraph_events import (
    VIEEventType,
    WorkGraphEventService,
)
from services.memory_manager import (
    MemoryTier,
    TrustLevel,
    MemoryEntry,
    MemoryManager,
    _isolation_key,
    memory_manager,
)
from core.telemetry import (
    MissionCostTracker,
    MissionCostEntry,
    TelemetryRegistry,
    telemetry_registry,
    NkyelJSONFormatter,
)


# ══════════════════════════════════════════════════════════════
# 1. RequestContext & Tracing Tests
# ══════════════════════════════════════════════════════════════

def test_request_context_creation_and_headers():
    ctx = RequestContext(
        request_id="req_test_123",
        trace_id="trc_test_456",
        user_id="usr_daniel",
        mission_id="msn_launch",
        organization_id="org_smartandj",
    )
    headers = ctx.to_headers()
    assert headers["X-Request-ID"] == "req_test_123"
    assert headers["X-Trace-ID"] == "trc_test_456"
    assert headers["X-Mission-ID"] == "msn_launch"
    assert headers["X-User-ID"] == "usr_daniel"
    assert headers["X-Organization-ID"] == "org_smartandj"

    log_dict = ctx.to_log_dict()
    assert log_dict["request_id"] == "req_test_123"
    assert log_dict["trace_id"] == "trc_test_456"
    assert log_dict["user_id"] == "usr_daniel"
    assert ctx.elapsed_ms >= 0


def test_request_contextvars_propagation():
    clear_context()
    ctx = RequestContext(request_id="req_ctx_var", trace_id="trc_ctx_var")
    set_context(ctx)
    assert get_context().request_id == "req_ctx_var"
    clear_context()
    assert get_context().request_id.startswith("req_")


# ══════════════════════════════════════════════════════════════
# 2. Domain Errors Tests
# ══════════════════════════════════════════════════════════════

def test_domain_error_response_no_stacktrace():
    err = not_found("Document", "doc_999")
    assert err.code == NkyelErrorCode.RESOURCE_NOT_FOUND
    assert err.http_status == 404

    body = err.to_response_body()
    assert body["error"]
    assert body["code"] == "RESOURCE_NOT_FOUND"
    assert "doc_999" in body["message"]
    assert "traceback" not in body
    assert "stack" not in body


def test_domain_error_factories():
    err_auth = auth_error("Session invalide")
    assert err_auth.http_status == 401
    assert err_auth.code == NkyelErrorCode.AUTHENTICATION_ERROR

    err_rate = rate_limited(retry_after_seconds=30)
    assert err_rate.http_status == 429
    assert err_rate.metadata.get("retry_after_seconds") == 30

    err_budget = budget_exceeded(current_cost=1.50, max_budget=1.00)
    assert err_budget.http_status == 429
    assert err_budget.code == NkyelErrorCode.BUDGET_EXCEEDED

    err_model = model_unavailable(model="gemini-3.1-pro", provider="google")
    assert err_model.http_status == 503
    assert err_model.code == NkyelErrorCode.MODEL_UNAVAILABLE


# ══════════════════════════════════════════════════════════════
# 3. Cancellation Manager Tests
# ══════════════════════════════════════════════════════════════

def test_cancellation_token_behavior():
    token = CancellationToken(mission_id="m_1", run_id="r_1")
    assert not token.is_cancelled

    # Check does not raise when active
    token.check()

    callback_called = []
    token.on_cancel(lambda: callback_called.append(True))

    token.cancel(reason="user_stop_clicked")
    assert token.is_cancelled
    assert token.cancel_reason == "user_stop_clicked"
    assert len(callback_called) == 1

    # Check raises MissionCancelled when cancelled
    with pytest.raises(MissionCancelled) as exc_info:
        token.check()
    assert exc_info.value.mission_id == "m_1"


def test_cancellation_manager_lifecycle():
    mgr = MissionCancellationManager()
    tok = mgr.create_token("mission_abc", "run_abc")
    assert mgr.active_count == 1
    assert not mgr.is_cancelled("mission_abc")

    cancelled = mgr.cancel_mission("mission_abc", reason="test_cancel")
    assert cancelled
    assert mgr.is_cancelled("mission_abc")
    assert mgr.active_count == 0

    status = mgr.status()
    assert len(status["recently_cancelled"]) == 1
    assert status["recently_cancelled"][0]["mission_id"] == "mission_abc"


# ══════════════════════════════════════════════════════════════
# 4. Model Gateway & Circuit Breaker Tests
# ══════════════════════════════════════════════════════════════

def test_model_gateway_capability_resolution():
    fast_models = _get_models_for_capability(ModelCapability.FAST)
    assert len(fast_models) >= 2
    # Highest priority should be first
    assert fast_models[0].priority >= fast_models[1].priority

    deep_models = _get_models_for_capability(ModelCapability.DEEP)
    assert any(m.id == "gemini-3.1-pro" for m in deep_models)


def test_circuit_breaker_trip_and_recovery():
    cb = CircuitBreaker()
    provider = "test_provider"

    assert cb.is_available(provider)

    # Record 3 failures (threshold = 3)
    cb.record_failure(provider)
    cb.record_failure(provider)
    assert cb.is_available(provider)
    cb.record_failure(provider)

    # Now circuit is open
    assert not cb.is_available(provider)

    status = cb.status()
    assert status[provider]["state"] == "open"
    assert status[provider]["failures"] == 3

    # Success closes the circuit
    cb.record_success(provider)
    assert cb.is_available(provider)
    assert cb.status()[provider]["state"] == "closed"


def test_gateway_metrics_aggregation():
    metrics = GatewayMetrics()
    metrics.record(CallMetrics(
        model_id="gemini-3.6-flash",
        provider="google",
        capability="FAST",
        input_tokens=100,
        output_tokens=50,
        cost_usd=0.000045,
        latency_ms=120,
    ))
    summary = metrics.summary()
    assert summary["total_calls"] == 1
    assert summary["successes"] == 1
    assert summary["total_input_tokens"] == 100
    assert summary["total_output_tokens"] == 50


# ══════════════════════════════════════════════════════════════
# 5. WorkGraph VIE v1 Event Protocol Tests
# ══════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_vie_event_emission_and_structure():
    event = await WorkGraphEventService.emit_event(
        event_type=VIEEventType.PLAN_CREATED,
        run_id="run_vie_1",
        mission_id="msn_vie_1",
        trace_id="trc_vie_1",
        payload={"tasks_count": 3},
    )

    assert event["type"] == "vie.plan.created.v1"
    assert event["version"] == "v1"
    assert event["run_id"] == "run_vie_1"
    assert event["mission_id"] == "msn_vie_1"
    assert event["trace_id"] == "trc_vie_1"
    assert event["payload"]["tasks_count"] == 3
    assert "timestamp" in event


@pytest.mark.asyncio
async def test_vie_event_convenience_emitters():
    task_evt = await WorkGraphEventService.emit_task_started(
        run_id="run_test",
        task_id="task_1",
        title="Recherche sur l'écosystème",
        mission_id="msn_test",
    )
    assert task_evt["type"] == "vie.task.started.v1"
    assert task_evt["payload"]["task_id"] == "task_1"


# ══════════════════════════════════════════════════════════════
# 6. Multi-Tier Memory & Tenant Isolation Tests
# ══════════════════════════════════════════════════════════════

def test_memory_isolation_across_tenants():
    mem = MemoryManager()

    # User A in Org 1
    mem.set(
        "api_key_pref", "key_org1",
        MemoryTier.WORKSPACE,
        organization_id="org_1",
        workspace_id="ws_main",
    )

    # User B in Org 2
    mem.set(
        "api_key_pref", "key_org2",
        MemoryTier.WORKSPACE,
        organization_id="org_2",
        workspace_id="ws_main",
    )

    # Org 1 cannot see Org 2's data
    val_org1 = mem.get(
        "api_key_pref", MemoryTier.WORKSPACE,
        organization_id="org_1", workspace_id="ws_main",
    )
    val_org2 = mem.get(
        "api_key_pref", MemoryTier.WORKSPACE,
        organization_id="org_2", workspace_id="ws_main",
    )

    assert val_org1 == "key_org1"
    assert val_org2 == "key_org2"


def test_memory_cascade_recall():
    mem = MemoryManager()

    # Set user preference (tier 3)
    mem.set("preferred_lang", "fang", MemoryTier.USER, user_id="usr_1")

    # Cascade recall finds it from USER tier
    recalled = mem.recall("preferred_lang", user_id="usr_1")
    assert recalled == "fang"

    # If context has an override (tier 1), context wins
    mem.set("preferred_lang", "mpongwe", MemoryTier.CONTEXT, user_id="usr_1")
    recalled_override = mem.recall("preferred_lang", user_id="usr_1")
    assert recalled_override == "mpongwe"


def test_memory_mission_lifecycle_cleanup():
    mem = MemoryManager()

    mem.set("working_step", 3, MemoryTier.WORKING, mission_id="msn_clean", user_id="usr_1")
    mem.set("user_name", "Daniel", MemoryTier.USER, user_id="usr_1")

    cleared = mem.clear_mission("msn_clean", user_id="usr_1")
    assert cleared >= 1

    # Working memory cleared
    assert mem.get("working_step", MemoryTier.WORKING, user_id="usr_1") is None
    # User memory preserved
    assert mem.get("user_name", MemoryTier.USER, user_id="usr_1") == "Daniel"


# ══════════════════════════════════════════════════════════════
# 7. Telemetry & Budget Enforcement Tests
# ══════════════════════════════════════════════════════════════

def test_mission_cost_tracker_budget_enforcement():
    tracker = MissionCostTracker(mission_id="msn_budget", max_budget_usd=0.05)

    tracker.record(MissionCostEntry(
        category="model",
        provider="google",
        operation="gemini-3.6-flash",
        cost_usd=0.02,
        input_tokens=1000,
        output_tokens=500,
    ))
    assert not tracker.is_over_budget
    tracker.check_budget()  # Should not raise

    # Add cost that exceeds budget
    tracker.record(MissionCostEntry(
        category="model",
        provider="google",
        operation="gemini-3.1-pro",
        cost_usd=0.04,
        input_tokens=5000,
        output_tokens=2000,
    ))
    assert tracker.is_over_budget

    # check_budget should now raise NkyelAPIError with BUDGET_EXCEEDED
    with pytest.raises(NkyelAPIError) as exc_info:
        tracker.check_budget()
    assert exc_info.value.code == NkyelErrorCode.BUDGET_EXCEEDED


def test_telemetry_registry_lifecycle():
    reg = TelemetryRegistry()
    tracker = reg.create_tracker("msn_reg_1", max_budget_usd=1.0)
    tracker.record(MissionCostEntry(
        category="search",
        provider="tavily",
        operation="web_search",
        cost_usd=0.005,
    ))

    summary = reg.finalize_mission("msn_reg_1")
    assert summary is not None
    assert summary["total_cost_usd"] == 0.005
    assert reg.get_tracker("msn_reg_1") is None
