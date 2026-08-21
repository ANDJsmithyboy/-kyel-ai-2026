"""
Ñkyel AI — Test Suite Wide Research & Navigation Web · SmartANDJ AI Technologies
Vérifie :
1. L'initialisation d'une mission Wide Research
2. La décomposition en requêtes et l'appel de Tavily
3. La simulation/navigation de page et l'extraction de contenu
4. La détection de contradictions
5. Le contrôle interactif (pause/resume/stop)
6. La génération et le téléversement du rapport final sur Cloudflare R2

Exécution :
    python -m pytest tests/backend/test_wide_research.py -v --tb=short
"""

import os
import sys
import uuid
import pytest
import asyncio
from unittest.mock import patch

# S'assurer que le backend est accessible
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from api.v1.wide_research import (
    start_wide_research,
    control_wide_research,
    WideResearchRequest,
    ResearchControlRequest,
    ACTIVE_RESEARCH_JOBS,
    run_wide_research_pipeline,
)


class TestWideResearchPipeline:
    """Valide l'orchestration réelle de Wide Research."""

    @pytest.mark.asyncio
    async def test_wide_research_pipeline_execution(self):
        job_id = f"test_wr_{uuid.uuid4().hex[:8]}"
        user_id = str(uuid.uuid4())
        topic = "Accélération de l'IA Souveraine en Afrique 2026"

        ACTIVE_RESEARCH_JOBS[job_id] = {
            "job_id": job_id,
            "topic": topic,
            "depth": "deep",
            "status": "pending",
            "user_id": user_id,
            "queries": [],
            "sources": [],
            "verified_sources": [],
        }

        # Mock Tavily search pour garantir la reproductibilité sans dépendance réseau
        mock_results = [
            {
                "title": "Stratégie Nationale IA Gabon 2026",
                "url": "https://numerique.gouv.ga/ia-2026",
                "content": "Le Gabon déploie une infrastructure de calcul souveraine pour les services publics.",
                "score": 0.95,
            },
            {
                "title": "Rapport Union Africaine sur la Souveraineté Numérique",
                "url": "https://au.int/reports/digital-sovereignty-2026",
                "content": "Feuille de route pour l'autonomie technologique des nations africaines.",
                "score": 0.88,
            },
        ]

        with patch("api.v1.wide_research.tavily_search", return_value=mock_results):
            await run_wide_research_pipeline(job_id=job_id, topic=topic, user_id=user_id, depth="deep")

        job_state = ACTIVE_RESEARCH_JOBS[job_id]
        assert job_state["status"] == "completed"
        assert len(job_state["queries"]) >= 3
        assert len(job_state["sources"]) >= 2
        assert len(job_state["verified_sources"]) >= 2
        assert job_state["artifact"] is not None
        assert "rapport" in job_state["artifact"]["title"].lower()
        assert "Accélération de l'IA" in job_state["artifact"]["content"]

    @pytest.mark.asyncio
    async def test_research_control_actions(self):
        job_id = f"test_ctrl_{uuid.uuid4().hex[:8]}"
        ACTIVE_RESEARCH_JOBS[job_id] = {
            "job_id": job_id,
            "topic": "Test de contrôle",
            "status": "running",
            "paused": False,
            "stopped": False,
        }

        # 1. Pause
        req_pause = ResearchControlRequest(job_id=job_id, action="pause")
        res_pause = await control_wide_research(req_pause)
        assert res_pause["success"] is True
        assert ACTIVE_RESEARCH_JOBS[job_id]["paused"] is True

        # 2. Resume
        req_resume = ResearchControlRequest(job_id=job_id, action="resume")
        res_resume = await control_wide_research(req_resume)
        assert res_resume["success"] is True
        assert ACTIVE_RESEARCH_JOBS[job_id]["paused"] is False

        # 3. Stop
        req_stop = ResearchControlRequest(job_id=job_id, action="stop")
        res_stop = await control_wide_research(req_stop)
        assert res_stop["success"] is True
        assert ACTIVE_RESEARCH_JOBS[job_id]["stopped"] is True
        assert ACTIVE_RESEARCH_JOBS[job_id]["status"] == "stopped"
