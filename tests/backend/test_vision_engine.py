"""
Ñkyel AI — Test Suite The Vision Engine · SmartANDJ AI Technologies
Fondateur : Daniel Jonathan ANDJ

Tests complets validant :
  1. Interpretation Layer (Privacy preservation, No CoT leak, Cognitive translation, Latency metrics)
  2. Vision Engine (VisionMap 6 pillars, VisionParser, Make-It-Real WorkGraph compiler)
  3. Simulation Engine (What-if scenarios, Epistemic status, Temporal horizons, Impact severity)
  4. Human Node (Human in the graph, Decision types, Resolution, Wait time, Timeouts)
  5. Agent Pulse (8 presence states, Rhythm Hz, Intensity, Transitions)
"""

import sys
import os
import time
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))


# ══════════════════════════════════════════════════════════════
# 1. Tests Interpretation Layer & Privacy Preservation
# ══════════════════════════════════════════════════════════════

class TestInterpretationLayer:
    """Valide l'absence totale de fuite de raisonnement privé et la traduction cognitive."""

    def test_sanitize_private_thinking_tags(self):
        from core.interpretation_layer import sanitize_content

        raw = "<think>I should check the database first to find credentials.</think>Voici la réponse publique."
        clean = sanitize_content(raw)
        assert "<think>" not in clean
        assert "I should check the database" not in clean
        assert "Voici la réponse publique." in clean

    def test_sanitize_scratchpad_and_internal(self):
        from core.interpretation_layer import sanitize_content

        raw = "<scratchpad>Secret thoughts</scratchpad><internal>Hidden</internal>Résultat clair."
        clean = sanitize_content(raw)
        assert "Secret thoughts" not in clean
        assert "Hidden" not in clean
        assert "Résultat clair." in clean

    def test_sanitize_secrets_and_api_keys(self):
        from core.interpretation_layer import sanitize_content

        raw = "Using key api_key=sk-1234567890abcdef123456 to connect."
        clean = sanitize_content(raw)
        assert "sk-1234567890abcdef" not in clean
        assert "[REDACTED]" in clean

    def test_contains_private_content_detection(self):
        from core.interpretation_layer import contains_private_content

        assert contains_private_content("<thought>Hidden</thought>") is True
        assert contains_private_content("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc") is True
        assert contains_private_content("system_prompt: You are an assistant") is True
        assert contains_private_content("Bonjour, comment puis-je vous aider ?") is False

    def test_translate_runtime_event(self):
        from core.interpretation_layer import translate_runtime_event

        res = translate_runtime_event("tool.called", {"tool_name": "web_search"})
        assert res is not None
        assert "Recherche d'informations" in res["description"]

        res_agent = translate_runtime_event("agent.spawned", {"agent_type": "researcher"})
        assert res_agent is not None
        assert "spécialiste de recherche" in res_agent["description"]

    def test_cognitive_latency_tracker(self):
        from core.interpretation_layer import CognitiveLatencyMetrics

        tracker = CognitiveLatencyMetrics()
        tracker.start("mission_lat_1")
        time.sleep(0.01)
        tracker.mark_objective()
        tracker.mark_plan()
        tracker.mark_action()
        tracker.mark_evidence()
        tracker.mark_control()

        data = tracker.to_dict()
        assert data["mission_id"] == "mission_lat_1"
        assert data["time_to_understanding_s"] is not None
        assert data["time_to_first_action_s"] is not None
        assert data["time_to_control_s"] is not None

    def test_interpretation_layer_pipeline(self):
        from core.interpretation_layer import InterpretationLayer
        from core.event_schema import NkyelEvent

        layer = InterpretationLayer()
        layer.start_mission("m_test_1")

        raw_event = NkyelEvent(
            type="tool.called",
            mission_id="m_test_1",
            payload={"tool_name": "web_search", "query": "IA Gabon 2026"},
        )
        cognitive_event = layer.interpret(raw_event)
        assert cognitive_event is not None
        assert "Recherche d'informations" in cognitive_event.payload["description"]

        log = layer.get_cognitive_log(mission_id="m_test_1")
        assert len(log) == 1
        assert "Recherche" in log[0]["cognitive_description"]


# ══════════════════════════════════════════════════════════════
# 2. Tests Vision Engine & Make It Real
# ══════════════════════════════════════════════════════════════

class TestVisionEngine:
    """Valide le parsing de VisionMap en 6 piliers et la compilation Make-It-Real."""

    def setup_method(self):
        from core.vision_engine import VisionEngine
        self.engine = VisionEngine()

    def test_parse_vision_pillars(self):
        raw = (
            "Lancement de la plateforme Ñkyel au Gabon.\n"
            "Objectif : démocratiser l'IA souveraine pour les entreprises et les citoyens.\n"
            "Public : les PME, les ministères et les développeurs.\n"
            "Contrainte : budget limité à 50 000 USD et conformité RGPD locale.\n"
            "Ressources : modèles open-source hébergés localement et API Cloudflare.\n"
            "Succès : atteindre 1 000 utilisateurs actifs le premier mois."
        )
        vision = self.engine.parse_vision(raw, owner_id="user_andj")

        assert vision.title is not None
        assert len(vision.why.items) > 0
        assert len(vision.who.items) > 0
        assert len(vision.constraints.items) > 0
        assert len(vision.resources.items) > 0
        assert len(vision.success.items) > 0
        assert vision.completeness >= 0.8
        assert vision.status.value in ("structured", "validated")

    def test_update_and_validate_pillar(self):
        vision = self.engine.parse_vision("Projet Alpha pour tester la vision.")
        updated = self.engine.update_pillar(vision.id, "why", ["Raison stratégique majeure."])
        assert updated is not None
        assert "Raison stratégique majeure." in updated.why.items

        validated = self.engine.validate_pillar(vision.id, "why")
        assert validated is not None
        assert validated.why.user_validated is True
        assert validated.why.confidence == 1.0

    def test_make_it_real_compilation(self):
        raw = (
            "Créer un système d'analyse financière.\n"
            "Pour aider les startups à auditer leurs coûts.\n"
            "Contrainte : délai de 2 semaines.\n"
            "Succès : rapport PDF généré avec score de risque."
        )
        vision = self.engine.parse_vision(raw, owner_id="user_andj")
        workgraph = self.engine.make_it_real(vision.id)

        assert workgraph is not None
        assert workgraph.vision_id == vision.id
        assert workgraph.task_count > 0
        # Vérifier qu'il y a un HumanNode de validation
        human_tasks = [t for t in workgraph.tasks if t.is_human_node]
        assert len(human_tasks) >= 1
        assert human_tasks[0].agent_type == "human"

    def test_list_visions(self):
        self.engine.parse_vision("Vision 1", owner_id="u1")
        self.engine.parse_vision("Vision 2", owner_id="u1")
        self.engine.parse_vision("Vision 3", owner_id="u2")

        visions_u1 = self.engine.list_visions(owner_id="u1")
        assert len(visions_u1) == 2


# ══════════════════════════════════════════════════════════════
# 3. Tests Simulation Engine & Temporal Model
# ══════════════════════════════════════════════════════════════

class TestSimulationEngine:
    """Valide les simulations What-If, les calculs d'impact et les statuts épistémiques."""

    def setup_method(self):
        from core.simulation_engine import SimulationEngine
        self.sim = SimulationEngine()

    def test_create_and_run_whatif_simulation(self):
        from core.simulation_engine import EpistemicStatus

        scenario = self.sim.create_scenario(
            title="Augmentation du prix d'abonnement",
            description="Tester l'impact d'une hausse de 30%",
            mission_id="m_sim_1",
            variables=[
                {
                    "name": "Prix Abonnement",
                    "current_value": 100,
                    "simulated_value": 130,
                    "unit": "USD",
                    "epistemic_status": "assumption",
                }
            ],
        )

        completed = self.sim.run_simulation(scenario.id)
        assert completed is not None
        assert completed.status.value == "completed"
        assert len(completed.impacts) == 1
        assert completed.impacts[0].severity == "high"
        assert completed.impacts[0].epistemic_status == EpistemicStatus.SIMULATION
        assert completed.overall_risk in ("high", "critical", "medium")

    def test_accept_and_reject_scenario(self):
        scenario = self.sim.create_scenario(title="Choix Cloudflare R2 vs AWS S3", description="")
        self.sim.run_simulation(scenario.id)

        accepted = self.sim.accept_scenario(scenario.id)
        assert accepted is not None
        assert accepted.status.value == "accepted"

        scenario2 = self.sim.create_scenario(title="Option rejetée", description="")
        rejected = self.sim.reject_scenario(scenario2.id)
        assert rejected is not None
        assert rejected.status.value == "rejected"

    def test_temporal_facts_management(self):
        from core.simulation_engine import TemporalFact, TemporalHorizon, EpistemicStatus

        f_past = TemporalFact(
            statement="Le CA 2025 était de 1M$",
            horizon=TemporalHorizon.PAST,
            epistemic_status=EpistemicStatus.FACT,
            confidence=1.0,
        )
        f_future = TemporalFact(
            statement="Croissance prévue de 40% en 2027",
            horizon=TemporalHorizon.FUTURE,
            epistemic_status=EpistemicStatus.PREDICTION,
            confidence=0.65,
            uncertainty_range=[0.25, 0.55],
        )

        self.sim.add_temporal_fact(f_past)
        self.sim.add_temporal_fact(f_future)

        past_facts = self.sim.get_temporal_facts(horizon=TemporalHorizon.PAST)
        assert len(past_facts) == 1
        assert past_facts[0].confidence == 1.0

        future_facts = self.sim.get_temporal_facts(horizon=TemporalHorizon.FUTURE)
        assert len(future_facts) == 1
        assert future_facts[0].uncertainty_range == [0.25, 0.55]


# ══════════════════════════════════════════════════════════════
# 4. Tests Human Node (Human in the Graph)
# ══════════════════════════════════════════════════════════════

class TestHumanNode:
    """Valide les nœuds humains, la prise de décision et le suivi des durées d'attente."""

    def setup_method(self):
        from core.human_node import HumanNodeManager
        self.mgr = HumanNodeManager()

    def test_create_and_present_human_node(self):
        from core.human_node import HumanDecisionType, HumanNodeUrgency, HumanNodeStatus

        node = self.mgr.create_node(
            question="Validez-vous le lancement de l'agent de paiement ?",
            decision_type=HumanDecisionType.APPROVAL,
            mission_id="m_hn_1",
            urgency=HumanNodeUrgency.HIGH,
            timeout_seconds=300,
        )
        assert node.status == HumanNodeStatus.PENDING
        assert node.is_resolved is False

        presented = self.mgr.present(node.id)
        assert presented is not None
        assert presented.status == HumanNodeStatus.WAITING
        assert presented.presented_at is not None

    def test_submit_decision(self):
        from core.human_node import HumanDecisionType, HumanNodeStatus

        node = self.mgr.create_node(
            question="Choisissez le marché prioritaire :",
            decision_type=HumanDecisionType.CHOICE,
            options=["Gabon", "Ghana", "Sénégal"],
            mission_id="m_hn_2",
        )
        self.mgr.present(node.id)
        time.sleep(0.01)

        decided = self.mgr.submit_decision(
            node_id=node.id,
            decision="Gabon",
            decided_by="user_andj",
        )
        assert decided is not None
        assert decided.status == HumanNodeStatus.DECIDED
        assert decided.decision == "Gabon"
        assert decided.is_resolved is True
        assert decided.wait_duration is not None
        assert decided.wait_duration >= 0

    def test_timeout_resolution(self):
        from core.human_node import HumanDecisionType, HumanNodeStatus

        node = self.mgr.create_node(
            question="Continuer en mode rapide ?",
            decision_type=HumanDecisionType.APPROVAL,
            default_option="Oui",
            timeout_seconds=0.01,  # 10ms
        )
        self.mgr.present(node.id)
        time.sleep(0.02)  # Attendre l'expiration

        timed_out = self.mgr.check_timeouts()
        assert len(timed_out) == 1
        assert timed_out[0].status == HumanNodeStatus.TIMED_OUT
        assert timed_out[0].decision == "Oui"


# ══════════════════════════════════════════════════════════════
# 5. Tests Agent Pulse
# ══════════════════════════════════════════════════════════════

class TestAgentPulse:
    """Valide les 8 états de présence de l'agent et les transitions dynamiques."""

    def setup_method(self):
        from core.agent_pulse import AgentPulseController
        self.pulse_ctrl = AgentPulseController()

    def test_initial_state(self):
        from core.agent_pulse import PulseState

        snapshot = self.pulse_ctrl.get_or_create("agent_kora", agent_name="Kora")
        assert snapshot.state == PulseState.IDLE
        assert snapshot.agent_name == "Kora"

    def test_pulse_state_transitions(self):
        from core.agent_pulse import PulseState

        # Transition vers THINKING
        p1 = self.pulse_ctrl.transition(
            agent_id="agent_kora",
            new_state=PulseState.THINKING,
            message="Analyse de la vision utilisateur…",
        )
        assert p1.state == PulseState.THINKING
        assert p1.rhythm_hz == 1.2
        assert p1.intensity == 0.6

        # Transition vers SEARCHING
        p2 = self.pulse_ctrl.transition(
            agent_id="agent_kora",
            new_state=PulseState.SEARCHING,
            current_tool="web_search",
            progress=0.35,
        )
        assert p2.state == PulseState.SEARCHING
        assert p2.current_tool == "web_search"
        assert p2.progress == 0.35
        assert p2.rhythm_hz == 1.5

        # Transition vers NEEDS_YOU
        p3 = self.pulse_ctrl.transition(
            agent_id="agent_kora",
            new_state=PulseState.NEEDS_YOU,
        )
        assert p3.state == PulseState.NEEDS_YOU
        assert p3.intensity == 1.0

        # Transition vers DONE
        p4 = self.pulse_ctrl.transition(
            agent_id="agent_kora",
            new_state=PulseState.DONE,
            progress=1.0,
        )
        assert p4.state == PulseState.DONE
        assert p4.progress == 1.0
