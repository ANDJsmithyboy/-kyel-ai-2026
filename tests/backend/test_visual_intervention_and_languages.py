"""
Ñkyel AI — Test Suite Intervention Visuelle & Souveraineté Linguistique
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Vérifie :
1. L'intervention humaine sémantique sur le WorkGraph (Section 27)
2. Les événements durables human.* et plan.recalculated
3. Le registre linguistique dynamique et la priorité aux langues africaines (Section 28)
4. La génération de requêtes pivots multilingues pour Wide Research

Exécution :
    python -m pytest tests/backend/test_visual_intervention_and_languages.py -v --tb=short
"""

import os
import sys
import uuid
import pytest
import asyncio

# S'assurer que le backend est accessible
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from api.v1.workgraph_intervention import (
    execute_human_intervention,
    HumanInterventionRequest,
    get_workgraph_interventions,
)
from services.language_registry_service import language_service, GLOBAL_LANGUAGE_REGISTRY


class TestVisualInterventionAndLanguages:
    """Valide l'intervention visuelle directe et les capacités multilingues."""

    @pytest.mark.asyncio
    async def test_human_visual_intervention_lifecycle(self):
        run_id = f"test_run_{uuid.uuid4().hex[:8]}"
        thread_id = f"thread_{uuid.uuid4().hex[:8]}"
        node_id = "task_analyse_gabon"

        # 1. Intervention : modification de contrainte
        req_constraint = HumanInterventionRequest(
            run_id=run_id,
            thread_id=thread_id,
            user_id="user_admin_gabon",
            intervention_type="constraint_updated",
            node_id=node_id,
            new_value={"constraint": "Exiger au minimum 3 sources primaires avec dates 2026"},
            reason="Précision temporelle stricte requise",
        )

        res_constraint = await execute_human_intervention(req_constraint, db=None)
        assert res_constraint.success is True
        assert res_constraint.event_type == "human.constraint_updated"
        assert res_constraint.replan_status == "completed"
        assert res_constraint.checkpoint_id is not None

        # 2. Intervention : rejet d'hypothèse & replanification alternative
        req_hypothesis = HumanInterventionRequest(
            run_id=run_id,
            thread_id=thread_id,
            user_id="user_admin_gabon",
            intervention_type="hypothesis_rejected",
            node_id="hypo_cout_serveurs",
            reason="Hypothèse de coût obsolète après accords Cloudflare R2",
        )

        res_hypothesis = await execute_human_intervention(req_hypothesis, db=None)
        assert res_hypothesis.success is True
        assert res_hypothesis.event_type == "human.hypothesis_rejected"
        assert res_hypothesis.recalculated_tasks_count >= 2

        # 3. Récupération de l'historique d'interventions
        history = await get_workgraph_interventions(run_id=run_id)
        assert history["run_id"] == run_id
        assert history["interventions_count"] >= 2

    def test_african_language_registry_capabilities(self):
        # Vérifier la présence des langues gabonaises et africaines fondamentales
        required_african_tags = ["fan", "puu", "mye", "nzb", "toli", "sw", "lin", "wol", "hau", "yor", "amh"]
        for tag in required_african_tags:
            assert tag in GLOBAL_LANGUAGE_REGISTRY, f"Langue {tag} manquante dans le registre"
            cap = language_service.get_capability(tag)
            assert cap.is_african_priority is True
            assert cap.name != ""
            assert cap.native_name != ""

        # Vérifier le Fang en détail
        fang = language_service.get_capability("fan")
        assert fang.tag == "fan"
        assert fang.native_name == "Faŋ"
        assert "Gabon" in fang.region

    def test_multilingual_language_detection(self):
        # Test de détection pour le Fang
        assert language_service.detect_language("Mbolo, bia fe ne ?") == "fan"
        # Test de détection pour le Lingala
        assert language_service.detect_language("Mbote ndeko, sango nini ?") == "lin"
        # Test de détection pour le Swahili
        assert language_service.detect_language("Jambo rafiki, habari gani ?") == "sw"
        # Test de détection pour l'anglais
        assert language_service.detect_language("What is the official research agent plan?") == "en"

    def test_multilingual_search_query_generation(self):
        topic = "Souveraineté numérique et IA"
        queries_fang = language_service.generate_multilingual_search_queries(topic, source_lang="fan")
        assert "fan" in queries_fang
        assert "fr" in queries_fang  # Langue pivot français
        assert "en" in queries_fang  # Langue pivot anglais
        assert len(queries_fang["fan"]) >= 1
        assert len(queries_fang["fr"]) >= 1
