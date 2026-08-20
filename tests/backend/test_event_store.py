"""
Ñkyel AI — Event Store Tests
Tests for backend/events/persistent_store.py

Vérifie :
- append_event() écrit dans SQLite
- get_events() retourne les events ordonnés
- create_snapshot() / get_snapshot() persistence
- Isolation entre run_ids
"""

import os
import sys
import json
import tempfile
import pytest

# Ensure backend is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))


@pytest.fixture(autouse=True)
def temp_db(tmp_path, monkeypatch):
    """Use a temporary SQLite database for each test."""
    db_path = str(tmp_path / "test_events.sqlite3")
    monkeypatch.setenv("NKYEL_EVENT_STORE_DB", db_path)
    
    # Re-import to pick up the new DB_PATH
    import importlib
    import events.persistent_store as store_mod
    monkeypatch.setattr(store_mod, "DB_PATH", db_path)
    store_mod.init_db()
    
    yield db_path


class TestAppendEvent:
    def test_basic_append(self):
        from events.persistent_store import append_event, get_events
        
        result = append_event("run_001", "evt_001", "goal.received", {"goal": "Test"})
        assert result is True
        
        events = get_events("run_001")
        assert len(events) == 1
        assert events[0]["id"] == "evt_001"
        assert events[0]["type"] == "goal.received"
        assert events[0]["payload"]["goal"] == "Test"

    def test_multiple_events_ordered(self):
        from events.persistent_store import append_event, get_events
        
        append_event("run_002", "evt_a", "goal.received", {"step": 1})
        append_event("run_002", "evt_b", "plan.created", {"step": 2})
        append_event("run_002", "evt_c", "research.started", {"step": 3})
        
        events = get_events("run_002")
        assert len(events) == 3
        assert [e["type"] for e in events] == ["goal.received", "plan.created", "research.started"]

    def test_run_isolation(self):
        from events.persistent_store import append_event, get_events
        
        append_event("run_A", "evt_1", "goal.received", {"run": "A"})
        append_event("run_B", "evt_2", "goal.received", {"run": "B"})
        
        events_a = get_events("run_A")
        events_b = get_events("run_B")
        
        assert len(events_a) == 1
        assert len(events_b) == 1
        assert events_a[0]["payload"]["run"] == "A"
        assert events_b[0]["payload"]["run"] == "B"

    def test_empty_run_returns_empty(self):
        from events.persistent_store import get_events
        
        events = get_events("nonexistent_run")
        assert events == []


class TestSnapshots:
    def test_create_and_get_snapshot(self):
        from events.persistent_store import create_snapshot, get_snapshot
        
        state = {"goal_title": "Test Goal", "plan": [{"id": "t1"}], "nodes": []}
        result = create_snapshot("run_snap_1", state)
        assert result is True
        
        retrieved = get_snapshot("run_snap_1")
        assert retrieved is not None
        assert retrieved["goal_title"] == "Test Goal"
        assert len(retrieved["plan"]) == 1

    def test_snapshot_upsert(self):
        from events.persistent_store import create_snapshot, get_snapshot
        
        create_snapshot("run_snap_2", {"version": 1})
        create_snapshot("run_snap_2", {"version": 2})
        
        retrieved = get_snapshot("run_snap_2")
        assert retrieved["version"] == 2

    def test_get_nonexistent_snapshot(self):
        from events.persistent_store import get_snapshot
        
        result = get_snapshot("nonexistent_snap")
        assert result is None

    def test_snapshot_with_complex_state(self):
        from events.persistent_store import create_snapshot, get_snapshot
        
        complex_state = {
            "run_id": "run_complex",
            "goal_title": "Analyser l'IA souveraine en Afrique",
            "plan": [
                {"id": "t1", "title": "Recherche web", "type": "research"},
                {"id": "t2", "title": "Analyse", "type": "analysis"},
            ],
            "nodes": [
                {"id": "n1", "type": "goal", "title": "Goal Node"},
                {"id": "n2", "type": "plan", "title": "Plan v1"},
            ],
            "events": [
                {"id": "e1", "type": "goal.received"},
                {"id": "e2", "type": "plan.created"},
            ],
            "claims": [{"title": "Claim 1"}],
            "sources": [{"url": "https://example.com"}],
        }
        
        create_snapshot("run_complex", complex_state)
        retrieved = get_snapshot("run_complex")
        
        assert retrieved["goal_title"] == "Analyser l'IA souveraine en Afrique"
        assert len(retrieved["plan"]) == 2
        assert len(retrieved["nodes"]) == 2
        assert len(retrieved["events"]) == 2
