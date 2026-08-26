"""
Ñkyel AI — Agent Pipeline Tests (Lot 4.3)
Comprehensive tests for the Ñkyel agent graph nodes and flow.

Covers:
- Individual node functions (receive_goal, plan, research, analyze, synthesize, deliver)
- State transitions and data flow
- Replanification loop
- Error handling and edge cases
- Cost tracking integration
"""

import os
import sys
import json
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
import mcp_integration.tools


# ─── Fixtures ───────────────────────────────────────────

MOCK_PLAN = [
    {"id": "task_1", "title": "Research topic A", "description": "Search for A", "type": "research"},
    {"id": "task_2", "title": "Analyze findings", "description": "Compare findings", "type": "analysis"},
]

MOCK_ANALYSIS = {
    "claims": [{"title": "Claim X", "summary": "X is true", "source_url": "https://x.com"}],
    "evidence": [{"title": "Evidence Y", "summary": "Y supports X", "supports_claim": "Claim X", "source_url": "https://y.com"}],
    "hypotheses": [{"title": "Hyp Z", "summary": "Z might be true", "type": "alternative"}],
}


@pytest.fixture(autouse=True)
def temp_event_db(tmp_path, monkeypatch):
    db_path = str(tmp_path / "test_pipeline.sqlite3")
    monkeypatch.setenv("NKYEL_EVENT_STORE_DB", db_path)
    import importlib
    import events.persistent_store as store_mod
    monkeypatch.setattr(store_mod, "DB_PATH", db_path)
    store_mod.init_db()
    yield db_path


def _mock_gemini(prompt, **kwargs):
    p = prompt.lower()
    if "decompose" in p or "planning" in p:
        return {"text": json.dumps(MOCK_PLAN), "model": "mock", "provider": "google", "latency_ms": 10, "input_tokens": 50, "output_tokens": 100, "cost_usd": 0.0}
    elif "analysis" in p or "extract" in p:
        return {"text": json.dumps(MOCK_ANALYSIS), "model": "mock", "provider": "google", "latency_ms": 10, "input_tokens": 50, "output_tokens": 100, "cost_usd": 0.0}
    else:
        return {"text": "# Mock Synthesis\nThis is a test.", "model": "mock", "provider": "google", "latency_ms": 10, "input_tokens": 50, "output_tokens": 50, "cost_usd": 0.0}


def _mock_tavily(**kwargs):
    return [{"title": "Result 1", "url": "https://example.com", "content": "Test content", "score": 0.9}]


# ─── Test Individual Nodes ──────────────────────────────

class TestReceiveGoal:
    def test_creates_goal_node(self):
        from agents.nkyel_graph import receive_goal
        state = {"user_message": "Test goal", "events": []}
        result = receive_goal(state)
        assert result["goal_title"] == "Test goal"
        assert result["run_id"].startswith("run_")
        assert len(result["nodes"]) == 1
        assert result["nodes"][0]["type"] == "goal"

    def test_uses_existing_run_id(self):
        from agents.nkyel_graph import receive_goal
        state = {"user_message": "Test", "run_id": "run_existing", "events": []}
        result = receive_goal(state)
        assert result["run_id"] == "run_existing"

    def test_emits_goal_received_event(self):
        from agents.nkyel_graph import receive_goal
        state = {"user_message": "Goal", "events": []}
        result = receive_goal(state)
        event_types = [e["type"] for e in result["events"]]
        assert "goal.received" in event_types


class TestPlanNode:
    @patch("services.gemini_service._call_gemini", side_effect=_mock_gemini)
    def test_creates_plan(self, mock):
        from agents.nkyel_graph import plan
        state = {"goal_title": "Test", "plan_version": 0, "nodes": [], "edges": [], "events": [], "steps_taken": [], "total_latency_ms": 0}
        result = plan(state)
        assert len(result["plan"]) >= 1
        assert result["plan_version"] == 1
        assert "plan" in result["steps_taken"]

    @patch("services.gemini_service._call_gemini", side_effect=_mock_gemini)
    def test_increments_version_on_replan(self, mock):
        from agents.nkyel_graph import plan
        state = {
            "goal_title": "Test", "plan_version": 2, "plan": [],
            "replan_reason": "Need more detail",
            "nodes": [], "edges": [], "events": [], "steps_taken": [], "total_latency_ms": 0,
        }
        result = plan(state)
        assert result["plan_version"] == 3

    @patch("services.gemini_service._call_gemini", side_effect=Exception("API Error"))
    def test_fallback_plan_on_error(self, mock):
        from agents.nkyel_graph import plan
        state = {"goal_title": "Fallback Test", "plan_version": 0, "nodes": [], "edges": [], "events": [], "steps_taken": [], "total_latency_ms": 0}
        result = plan(state)
        # Should still produce a fallback plan
        assert len(result["plan"]) == 3
        assert result["plan"][0]["type"] == "research"


class TestResearchNode:
    @patch("services.gemini_service._call_gemini", side_effect=_mock_gemini)
    def test_adds_sources(self, mock):
        from agents.nkyel_graph import research
        from mcp_integration.registry import registry
        tool = registry.get_tool("tavily_search")
        original = tool.handler
        tool.handler = _mock_tavily
        try:
            state = {
                "plan": [{"id": "t1", "title": "Search", "description": "Search test", "type": "research"}],
                "goal_title": "Test",
                "search_results": [], "sources": [], "nodes": [], "edges": [], "events": [],
                "mcp_audit_log": [], "steps_taken": [], "user_id": "test", "run_id": "run_test",
            }
            result = research(state)
            assert len(result["sources"]) >= 1
            assert result["sources"][0]["url"] == "https://example.com"
            assert "research" in result["steps_taken"]
        finally:
            tool.handler = original


class TestAnalyzeNode:
    @patch("services.gemini_service._call_gemini", side_effect=_mock_gemini)
    def test_extracts_claims(self, mock):
        from agents.nkyel_graph import analyze
        state = {
            "sources": [{"title": "Src", "url": "https://x.com", "content": "Info"}],
            "goal_title": "Test",
            "nodes": [], "edges": [], "events": [], "steps_taken": [], "total_latency_ms": 0, "run_id": "run_a",
        }
        result = analyze(state)
        assert len(result["claims"]) >= 1
        assert len(result["evidence"]) >= 1
        assert "analyze" in result["steps_taken"]


class TestSynthesizeNode:
    @patch("services.gemini_service._call_gemini", side_effect=_mock_gemini)
    def test_produces_response(self, mock):
        from agents.nkyel_graph import synthesize
        state = {
            "goal_title": "Test", "claims": [], "evidence": [], "hypotheses": [], "sources": [],
            "nodes": [], "events": [], "steps_taken": [], "total_latency_ms": 0, "run_id": "run_s",
        }
        result = synthesize(state)
        assert result["final_response"] is not None
        assert len(result["final_response"]) > 0
        assert "synthesize" in result["steps_taken"]


class TestDeliverNode:
    def test_creates_checkpoint(self):
        from agents.nkyel_graph import deliver
        state = {"nodes": [], "events": [], "steps_taken": [], "run_id": "run_d"}
        result = deliver(state)
        assert "deliver" in result["steps_taken"]
        checkpoint_nodes = [n for n in result["nodes"] if n["type"] == "checkpoint"]
        assert len(checkpoint_nodes) == 1

    def test_persists_snapshot(self):
        from agents.nkyel_graph import deliver
        from events.persistent_store import get_snapshot
        state = {"nodes": [], "events": [], "steps_taken": [], "run_id": "run_snap_test", "goal_title": "Snap Goal"}
        deliver(state)
        snap = get_snapshot("run_snap_test")
        assert snap is not None


class TestCheckReplan:
    def test_returns_deliver_by_default(self):
        from agents.nkyel_graph import check_replan
        assert check_replan({"replan_requested": False}) == "do_deliver"

    def test_returns_plan_when_requested(self):
        from agents.nkyel_graph import check_replan
        assert check_replan({"replan_requested": True}) == "do_plan"


# ─── Test Full Pipeline Variations ──────────────────────

class TestPipelineVariations:
    @patch("services.gemini_service._call_gemini", side_effect=_mock_gemini)
    def test_short_goal(self, mock):
        from agents.nkyel_graph import build_nkyel_graph
        from mcp_integration.registry import registry
        tool = registry.get_tool("tavily_search")
        original = tool.handler
        tool.handler = _mock_tavily
        try:
            graph = build_nkyel_graph()
            result = graph.invoke({"user_message": "IA", "user_id": "u"})
            assert result.get("final_response") is not None
        finally:
            tool.handler = original

    @patch("services.gemini_service._call_gemini", side_effect=_mock_gemini)
    def test_long_goal(self, mock):
        from agents.nkyel_graph import build_nkyel_graph
        from mcp_integration.registry import registry
        tool = registry.get_tool("tavily_search")
        original = tool.handler
        tool.handler = _mock_tavily
        try:
            long_goal = "Analyse complète et détaillée de l'impact socio-économique, technologique et culturel de l'intelligence artificielle souveraine " * 5
            graph = build_nkyel_graph()
            result = graph.invoke({"user_message": long_goal, "user_id": "u"})
            assert result.get("final_response") is not None
        finally:
            tool.handler = original

    @patch("services.gemini_service._call_gemini", side_effect=_mock_gemini)
    def test_english_goal(self, mock):
        from agents.nkyel_graph import build_nkyel_graph
        from mcp_integration.registry import registry
        tool = registry.get_tool("tavily_search")
        original = tool.handler
        tool.handler = _mock_tavily
        try:
            graph = build_nkyel_graph()
            result = graph.invoke({"user_message": "Analyze the state of AI in West Africa", "user_id": "u", "language": "en"})
            assert result.get("final_response") is not None
        finally:
            tool.handler = original


# ─── Test Cost Tracker ──────────────────────────────────

class TestCostTracker:
    def test_records_usage(self):
        from services.gemini_service import GeminiCostTracker
        tracker = GeminiCostTracker()
        tracker.record("gemini-2.5-flash", 1000, 500, 200)
        s = tracker.summary()
        assert s["total_calls"] == 1
        assert s["total_input_tokens"] == 1000
        assert s["total_output_tokens"] == 500
        assert s["total_cost_usd"] > 0

    def test_cumulative_tracking(self):
        from services.gemini_service import GeminiCostTracker
        tracker = GeminiCostTracker()
        tracker.record("gemini-2.5-flash", 100, 100, 50)
        tracker.record("gemini-2.5-flash", 200, 200, 80)
        s = tracker.summary()
        assert s["total_calls"] == 2
        assert s["total_input_tokens"] == 300
        assert s["avg_latency_ms"] == 65
