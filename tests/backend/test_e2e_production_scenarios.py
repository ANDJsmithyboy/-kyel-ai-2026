"""
Ñkyel AI — E2E Production Scenarios Test Suite · SmartANDJ AI Technologies
Fondateur : Daniel Jonathan ANDJ

Valide les 5 scénarios clés de production :
  1. Scénario 1 : Cycle complet Mission, WorkGraph et streaming SSE
  2. Scénario 2 : Modification Visual Agent → Versioning AgentSpec (vN+1) → Compilation
  3. Scénario 3 : Human-in-the-loop (demande d'approbation, refus/acceptation, adaptation)
  4. Scénario 4 : Multi-Agent (Lead Agent délègue à Researcher/Coder via A2A)
  5. Scénario 5 : Résumé contractuel des Protocoles
"""

import sys
import os
import time
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from core.canonical_event import CanonicalEventFactory
from core.agent_spec import (
    AgentSpec,
    AgentIdentity,
    AgentCognition,
    AgentTools,
    CognitionMode,
    AgentSpecHistory,
)
from core.agent_compiler import AgentCompiler
from core.human_node import human_node_manager, HumanDecisionType, HumanNodeUrgency
from core.protocol_gateway import A2AAdapter, CanonicalDelegation
from core.vision_engine import vision_engine


class TestE2EProductionScenarios:
    """Scénarios de validation bout-en-bout de la production Ñkyel AI."""

    def test_scenario_1_mission_and_workgraph_lifecycle(self):
        """Scénario 1 : Mission parsing → Make-It-Real → WorkGraph nodes."""
        raw_vision = (
            "Développer un dashboard financier pour PME.\n"
            "Pour visualiser les flux de trésorerie en temps réel.\n"
            "Contrainte : budget 20 000 USD.\n"
            "Succès : alertes automatiques d'anomalies."
        )
        vision = vision_engine.parse_vision(raw_vision, owner_id="user_andj_1")
        assert vision is not None
        assert vision.completeness >= 0.5

        workgraph = vision_engine.make_it_real(vision.id)
        assert workgraph is not None
        assert workgraph.task_count >= 3

        # Vérifier que les événements canoniques de cycle de vie sont valides
        evt_start = CanonicalEventFactory.mission_started(workgraph.mission_id, "run_sc1", "Dashboard financier")
        assert evt_start.type == "mission.started"
        assert evt_start.to_sse().startswith("data: ")

    def test_scenario_2_visual_agent_spec_versioning_and_compilation(self):
        """Scénario 2 : Modification d'une capacité agent → v(N+1) → Recompilation."""
        # 1. Création de l'agent initial v1
        spec_v1 = AgentSpec(
            identity=AgentIdentity(name="Kora Custom Researcher", role="Researcher"),
            cognition=AgentCognition(mode=CognitionMode.RESEARCH),
            tools=AgentTools(search=True, code=False),
        )
        history = AgentSpecHistory(spec_v1)
        assert history.current_version == 1

        compiled_v1 = AgentCompiler.compile(spec_v1)
        assert "web_search" in compiled_v1.enabled_tools

        # 2. Utilisateur désactive le Web Search dans le Visual Agent Studio
        spec_v2 = spec_v1.clone()
        spec_v2.tools.search = False
        new_version = history.commit(spec_v2, ["tools.search"], "Disable web search for offline security")
        assert new_version == 2

        # 3. Compilation et vérification que web_search est exclu
        compiled_v2 = AgentCompiler.compile(spec_v2)
        assert compiled_v2.spec_version == 2
        assert "web_search" not in compiled_v2.enabled_tools

    def test_scenario_3_human_in_the_loop_arbitration(self):
        """Scénario 3 : Action sensible → approval.required → Décision utilisateur → Reprise."""
        # 1. L'agent atteint un point nécessitant validation humaine
        node = human_node_manager.create_node(
            question="Validez-vous le déploiement en production ?",
            decision_type=HumanDecisionType.APPROVAL,
            mission_id="m_sc3_1",
            urgency=HumanNodeUrgency.BLOCKING,
        )
        assert node.is_resolved is False

        # 2. Présentation à l'utilisateur
        presented = human_node_manager.present(node.id)
        assert presented is not None
        assert presented.status.value == "waiting"

        # 3. L'utilisateur prend la décision
        resolved = human_node_manager.submit_decision(
            node_id=node.id,
            decision="Approuvé",
            decided_by="user_andj_1",
            decision_data={"authorized_at": time.time()},
        )
        assert resolved is not None
        assert resolved.is_resolved is True
        assert resolved.decision == "Approuvé"

    def test_scenario_4_multi_agent_delegation(self):
        """Scénario 4 : Lead Agent délègue à un sous-agent via A2A."""
        delegation = CanonicalDelegation(
            parent_agent_id="lead_orchestrator",
            target_agent_id="code_specialist",
            task_scope="Génération du composant React Graph",
            task_input={"framework": "nextjs", "props": ["nodes", "edges"]},
            time_budget_seconds=60,
        )
        vie_event = A2AAdapter.delegation_to_vie_event(delegation, run_id="run_sc4")
        assert vie_event.agent_id == "code_specialist"
        assert vie_event.payload["parent_agent"] == "lead_orchestrator"
        assert vie_event.payload["task_scope"] == "Génération du composant React Graph"

    def test_scenario_5_production_readiness_checklist(self):
        """Scénario 5 : Vérification contractuelle des indicateurs de production."""
        from core.config import settings

        assert settings.app_name == "Ñkyel AI"
        assert settings.founder is not None
        assert len(settings.cors_origins_list) > 0
