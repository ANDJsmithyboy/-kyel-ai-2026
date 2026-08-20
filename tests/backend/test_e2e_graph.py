"""
Ñkyel AI — End-to-End Smoke Test
Validates the full agent pipeline offline (mocked Gemini + mocked Tavily).

Run with:
    python -m pytest tests/backend/test_e2e_graph.py -v --tb=short
"""

import os
import sys
import json
import pytest
from unittest.mock import patch, MagicMock

# Ensure backend is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))


# ─── Fixtures ───────────────────────────────────────────

MOCK_PLAN_JSON = json.dumps([
    {"id": "task_1", "title": "Research AI trends", "description": "Search for latest AI developments in Africa", "type": "research"},
    {"id": "task_2", "title": "Analyze findings", "description": "Compare key claims from sources", "type": "analysis"},
    {"id": "task_3", "title": "Synthesize report", "description": "Create comprehensive summary", "type": "synthesis"},
])

MOCK_ANALYSIS_JSON = json.dumps({
    "claims": [
        {"title": "AI Growth in Africa", "summary": "The African AI ecosystem is growing rapidly", "source_url": "https://example.com/ai-africa"}
    ],
    "evidence": [
        {"title": "Funding increase", "summary": "VC funding for African AI startups doubled in 2025", "supports_claim": "AI Growth in Africa", "source_url": "https://example.com/funding"}
    ],
    "hypotheses": [
        {"title": "Sovereign AI models", "summary": "African nations may develop sovereign AI models", "type": "alternative"}
    ],
})

MOCK_SYNTHESIS_TEXT = """# L'IA Souveraine en Afrique

## Points Clés
- L'écosystème IA africain connaît une croissance rapide
- Le financement VC a doublé en 2025
- Les modèles d'IA souverains deviennent un sujet majeur

## Sources
- [AI Africa Report](https://example.com/ai-africa)
"""

MOCK_SEARCH_RESULTS = [
    {"title": "AI in Africa 2025", "url": "https://example.com/ai-africa", "content": "Africa's AI ecosystem is growing rapidly...", "score": 0.95},
    {"title": "Sovereign AI Models", "url": "https://example.com/sovereign", "content": "Nations are developing their own AI...", "score": 0.87},
]


@pytest.fixture(autouse=True)
def temp_event_db(tmp_path, monkeypatch):
    """Use a temp SQLite DB for events."""
    db_path = str(tmp_path / "test_e2e_events.sqlite3")
    monkeypatch.setenv("NKYEL_EVENT_STORE_DB", db_path)
    
    import importlib
    import events.persistent_store as store_mod
    monkeypatch.setattr(store_mod, "DB_PATH", db_path)
    store_mod.init_db()
    yield db_path


def _mock_gemini_call(prompt: str, model_name=None) -> dict:
    """Route mocked Gemini calls to the appropriate fixture based on prompt content."""
    prompt_lower = prompt.lower()
    if "decompose" in prompt_lower or "planning" in prompt_lower:
        return {"text": MOCK_PLAN_JSON, "model": "gemini-2.5-flash-mock", "provider": "google", "latency_ms": 50}
    elif "analysis" in prompt_lower or "extract" in prompt_lower:
        return {"text": MOCK_ANALYSIS_JSON, "model": "gemini-2.5-flash-mock", "provider": "google", "latency_ms": 40}
    elif "synthesis" in prompt_lower or "comprehensive" in prompt_lower:
        return {"text": MOCK_SYNTHESIS_TEXT, "model": "gemini-2.5-flash-mock", "provider": "google", "latency_ms": 60}
    else:
        return {"text": MOCK_PLAN_JSON, "model": "gemini-2.5-flash-mock", "provider": "google", "latency_ms": 30}


def _mock_tavily_search(query: str, max_results: int = 5, search_depth: str = "basic"):
    """Mocked Tavily search returning fixture data."""
    return MOCK_SEARCH_RESULTS[:max_results]


# ─── Tests ──────────────────────────────────────────────

class TestEndToEndGraph:
    """Full pipeline: receive_goal → plan → research → analyze → synthesize → deliver."""

    @patch("services.gemini_service._call_gemini", side_effect=_mock_gemini_call)
    @patch("mcp.tools.tavily_tool.tavily_search", side_effect=_mock_tavily_search)
    def test_full_pipeline_completes(self, mock_tavily, mock_gemini):
        """The graph should run to completion and produce a final response."""
        # Patch the registry's tool handler for tavily_search
        from mcp.registry import registry
        tavily_tool = registry.get_tool("tavily_search")
        original_handler = tavily_tool.handler
        tavily_tool.handler = _mock_tavily_search

        try:
            from agents.nkyel_graph import build_nkyel_graph

            graph = build_nkyel_graph()
            initial_state = {
                "user_message": "Analyse l'état de l'IA souveraine en Afrique en 2025",
                "user_id": "test_user",
                "language": "fr",
            }

            result = graph.invoke(initial_state)

            # Verify the pipeline completed all steps
            steps = result.get("steps_taken", [])
            assert "receive_goal" in steps, f"Missing receive_goal, got: {steps}"
            assert "plan" in steps, f"Missing plan, got: {steps}"
            assert "research" in steps, f"Missing research, got: {steps}"
            assert "analyze" in steps, f"Missing analyze, got: {steps}"
            assert "synthesize" in steps, f"Missing synthesize, got: {steps}"
            assert "deliver" in steps, f"Missing deliver, got: {steps}"

            # Verify final output
            assert result.get("final_response") is not None
            assert len(result["final_response"]) > 0

            # Verify work graph was populated
            assert len(result.get("nodes", [])) >= 3  # goal + plan + at least one task
            assert len(result.get("events", [])) >= 4  # goal + plan + research events + checkpoint + final

            # Verify run_id was generated
            assert result.get("run_id", "").startswith("run_")

        finally:
            tavily_tool.handler = original_handler

    @patch("services.gemini_service._call_gemini", side_effect=_mock_gemini_call)
    @patch("mcp.tools.tavily_tool.tavily_search", side_effect=_mock_tavily_search)
    def test_events_persisted_to_sqlite(self, mock_tavily, mock_gemini):
        """Events from a full run should be persisted to SQLite."""
        from mcp.registry import registry
        tavily_tool = registry.get_tool("tavily_search")
        original_handler = tavily_tool.handler
        tavily_tool.handler = _mock_tavily_search

        try:
            from agents.nkyel_graph import build_nkyel_graph
            from events.persistent_store import get_events, get_snapshot

            graph = build_nkyel_graph()
            result = graph.invoke({
                "user_message": "Qu'est-ce que le MCP en IA ?",
                "user_id": "persistence_test",
            })

            run_id = result.get("run_id")
            assert run_id is not None

            # Check persisted events
            persisted = get_events(run_id)
            assert len(persisted) >= 1, f"Expected persisted events, got {len(persisted)}"

            # Check snapshot was created by deliver()
            snapshot = get_snapshot(run_id)
            assert snapshot is not None, "Expected snapshot to be created by deliver()"
            assert snapshot.get("goal_title") is not None

        finally:
            tavily_tool.handler = original_handler

    @patch("services.gemini_service._call_gemini", side_effect=_mock_gemini_call)
    @patch("mcp.tools.tavily_tool.tavily_search", side_effect=_mock_tavily_search)
    def test_plan_structure(self, mock_tavily, mock_gemini):
        """The plan should contain structured tasks."""
        from mcp.registry import registry
        tavily_tool = registry.get_tool("tavily_search")
        original_handler = tavily_tool.handler
        tavily_tool.handler = _mock_tavily_search

        try:
            from agents.nkyel_graph import build_nkyel_graph

            graph = build_nkyel_graph()
            result = graph.invoke({
                "user_message": "Explique LangGraph",
                "user_id": "plan_test",
            })

            plan = result.get("plan", [])
            assert len(plan) >= 2, f"Expected at least 2 tasks in plan, got {len(plan)}"
            assert all("title" in t for t in plan), "All tasks should have a title"

        finally:
            tavily_tool.handler = original_handler
