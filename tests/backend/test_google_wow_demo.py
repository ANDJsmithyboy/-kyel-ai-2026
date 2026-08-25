"""
Ñkyel AI — Test Suite: P0 WOW Demo Mission & LangGraph Google Orchestration · SmartANDJ AI Technologies
Vérification de la mission phare "Gabon Ecotourism 2026 International Launch" :
- Spécification de la mission (/api/v1/google-demo/wow-mission-spec)
- Exécution de la mission complète (/api/v1/google-demo/run-wow-mission)
- Chaîne de provenance et traçabilité des modèles (Gemini, Imagen 3, Veo 2, Google Maps)
- Télémétrie vérifiée sans chiffres inventés (/api/v1/google-demo/telemetry/{id})
- Exécution directe via LangGraph StateGraph (nkyel_graph)

Fondateur : Daniel Jonathan ANDJ
"""

import pytest
import warnings
import langchain
if not hasattr(langchain, "debug"):
    langchain.debug = False

from fastapi.testclient import TestClient
from main import app
from core.config import settings
from agents.nkyel_graph import build_nkyel_graph
from core.telemetry import telemetry_registry


client = TestClient(app)


class TestGoogleWowDemoApi:
    """Test des endpoints de l'instance de démonstration Google."""

    def test_wow_mission_spec(self):
        resp = client.get("/api/v1/google-demo/wow-mission-spec")
        assert resp.status_code == 200
        data = resp.json()
        assert "Gabon Ecotourism" in data["mission_title"]
        assert "gemini.plan" in data["capabilities_used"]
        assert "google.image.generate" in data["capabilities_used"]
        assert "google.video.generate" in data["capabilities_used"]
        assert len(data["deliverables"]) >= 5

    def test_reviewer_auth_and_session(self):
        # 1. Auth avec le token reviewer de référence
        auth_resp = client.post(
            "/api/v1/google-demo/auth",
            json={"token": "nkyel-google-reviewer-2026"}
        )
        assert auth_resp.status_code == 200
        data = auth_resp.json()
        assert data["success"] is True
        assert data["mode"] == "google_candidate_demo"

    def test_run_wow_mission_e2e(self):
        # Exécution de la mission de démonstration phare
        resp = client.post(
            "/api/v1/google-demo/run-wow-mission",
            json={"preferred_media_provider": "DIRECT_GOOGLE", "dry_run_first": False}
        )
        assert resp.status_code == 200
        result = resp.json()

        assert result["success"] is True
        assert result["status"] == "COMPLETED"
        mission_id = result["mission_id"]

        # Vérification des livrables
        deliverables = result["deliverables"]
        assert deliverables["synthesis"] is not None
        assert deliverables["campaign_visual_url"] is not None
        assert deliverables["promotional_video_url"] is not None
        assert len(deliverables["strategic_locations"]) >= 3
        assert deliverables["budget_artifact_id"] is not None

        # Vérification de la télémétrie défendable
        telemetry = result["google_technology_telemetry"]
        assert telemetry["google_ai_executions"] >= 2  # plan + synthesize
        assert telemetry["google_image_generations"] == 1
        assert telemetry["google_video_generations"] == 1
        assert telemetry["google_tools_used"] >= 2
        assert telemetry["google_artifacts_generated"] >= 3

        # Vérification de la chaîne de provenance
        provenance = result["provenance_chain"]
        assert len(provenance) == 7
        assert any(p["model"] == settings.google_image_fast_model for p in provenance)
        assert any(p["model"] == settings.google_video_model for p in provenance)

        # Vérification de l'endpoint télémétrie dédié
        tel_resp = client.get(f"/api/v1/google-demo/telemetry/{mission_id}")
        assert tel_resp.status_code == 200
        tel_data = tel_resp.json()
        assert tel_data["mission_id"] == mission_id
        assert len(tel_data["executions_log"]) >= 5


class TestLangGraphExecutionWithGoogle:
    """Test de l'orchestration via LangGraph StateGraph."""

    def test_langgraph_full_cycle(self):
        graph = build_nkyel_graph()
        initial_state = {
            "user_message": "Créer une stratégie de lancement touristique au Gabon avec visuel de campagne et vidéo",
            "run_id": "test_graph_gabon_001",
            "nodes": [],
            "edges": [],
            "events": [],
            "sources": [],
            "claims": [],
            "evidence": [],
            "hypotheses": [],
            "plan": [],
            "plan_version": 0,
            "steps_taken": [],
            "search_results": [],
            "mcp_audit_log": [],
            "total_latency_ms": 0,
            "replan_requested": False,
            "replan_reason": None,
        }

        final_state = graph.invoke(initial_state)

        assert "deliver" in final_state["steps_taken"]
        assert final_state["final_response"] is not None
        assert len(final_state["nodes"]) >= 5

        # Vérifier la présence de nœuds typés WorkGraph
        node_types = {n["type"] for n in final_state["nodes"]}
        assert "goal" in node_types
        assert "plan" in node_types
        assert "task" in node_types
        assert "artifact" in node_types
        assert "checkpoint" in node_types
