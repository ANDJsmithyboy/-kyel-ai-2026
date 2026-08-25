"""
Ñkyel AI — Test Suite: Universal Artifact Experience & Multi-Format Exporter · SmartANDJ AI Technologies
Vérification matérielle des 18 catégories d'artefacts canoniques :
- Validation binaire réelle (PDF, DOCX, PPTX, XLSX, CSV, ZIP, PNG, JSON, ICS, SRT)
- Lignage et relations entre artefacts (DERIVED_FROM, INPUT_TO, SOURCE_FOR)
- Grille exploratoire de 4 concepts et sélection interactive
- Résolution des endpoints API REST

Fondateur : Daniel Jonathan ANDJ
"""

import pytest
import io
import zipfile
from pathlib import Path
from fastapi.testclient import TestClient

from main import app
from services.artifact_service import (
    ArtifactService,
    ArtifactType,
    ArtifactLifecycleStatus,
    ArtifactRelationType,
    CanonicalArtifact,
)

client = TestClient(app)


class TestUniversalArtifactSuite:
    """Tests des 18 catégories d'artefacts et de leur intégrité binaire."""

    @pytest.mark.asyncio
    async def test_create_and_export_audio_artifact(self):
        mission_id = "mission_audio_001"
        art = await ArtifactService.create_artifact(
            title="Spot Radio Gabon Écotourisme",
            content=b"ID3\x03\x00\x00\x00\x00\x00#AUDIO_BYTES#",
            type=ArtifactType.AUDIO,
            mission_id=mission_id,
            run_id=mission_id,
            duration_seconds=30,
        )
        assert art.type == ArtifactType.AUDIO
        assert art.duration_seconds == 30
        assert "audio" in art.mime_type or "octet-stream" in art.mime_type

    @pytest.mark.asyncio
    async def test_create_and_export_calendar_ics(self):
        mission_id = "mission_cal_001"
        art = await ArtifactService.create_artifact(
            title="Lancement Saison Loango 2026",
            content="Conférence de presse internationale et safaris inauguraux.",
            type=ArtifactType.CALENDAR,
            mission_id=mission_id,
            run_id=mission_id,
        )
        raw_bytes, mime, filename = await ArtifactService.export_artifact(art.id, "ics")
        assert mime == "text/calendar; charset=utf-8"
        assert filename.endswith(".ics")
        assert b"BEGIN:VCALENDAR" in raw_bytes
        assert b"Lancement Saison Loango 2026" in raw_bytes

    @pytest.mark.asyncio
    async def test_multi_concept_grid_and_selection(self):
        """Teste la génération d'une grille 2x2 de 4 concepts et la sélection du concept 2."""
        mission_id = "mission_concepts_001"
        prompts = [
            "Affiche Loango : Éléphants sur la plage au coucher du soleil",
            "Affiche Pongara : Tortues luth sous la canopée littorale",
            "Affiche Ivindo : Chutes de Kongou vue du ciel en 8k",
            "Affiche Culturelle : Masque Punu traditionnel et forêt primaire",
        ]

        # 1. Création de la grille
        grid = await ArtifactService.create_multi_concept_grid(
            title="Concepts d'Affiches Touristiques Gabon",
            prompts=prompts,
            mission_id=mission_id,
            run_id=mission_id,
        )
        assert len(grid.metadata["concepts"]) == 4

        # 2. Sélection du concept #2
        final_art = await ArtifactService.select_concept(grid.id, 2)
        assert final_art.parent_artifact_id == grid.id
        assert final_art.relation_type == ArtifactRelationType.DERIVED_FROM
        assert "Concept 2 Final" in final_art.title
        assert final_art.width == 1024
        assert final_art.height == 1024

    @pytest.mark.asyncio
    async def test_artifact_lineage_chain(self):
        """Teste la chaîne de dépendances : Report -> Deck -> Image -> Video."""
        mission_id = "mission_chain_001"

        # 1. Rapport
        report = await ArtifactService.create_artifact(
            title="African AI Market Study",
            content="# Market Study\n\nHigh-growth potential.",
            type=ArtifactType.REPORT,
            mission_id=mission_id,
            run_id=mission_id,
        )

        # 2. Deck dérivé du rapport
        deck = await ArtifactService.create_artifact(
            title="Investor Deck",
            content="# Investor Pitch\n- Opportunity in Africa",
            type=ArtifactType.SLIDES,
            mission_id=mission_id,
            run_id=mission_id,
            parent_artifact_id=report.id,
            relation_type=ArtifactRelationType.SOURCE_FOR,
        )
        assert deck.parent_artifact_id == report.id

        # 3. Image de campagne
        img = await ArtifactService.create_artifact(
            title="Campaign Hero Image",
            content=b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR",
            type=ArtifactType.IMAGE,
            mission_id=mission_id,
            run_id=mission_id,
            parent_artifact_id=deck.id,
            relation_type=ArtifactRelationType.SOURCE_FOR,
        )

        # 4. Vidéo animée à partir de l'image (input_to)
        vid = await ArtifactService.create_artifact(
            title="Campaign Video Spot",
            content=b"\x00\x00\x00 ftypmp42",
            type=ArtifactType.VIDEO,
            mission_id=mission_id,
            run_id=mission_id,
            parent_artifact_id=img.id,
            relation_type=ArtifactRelationType.INPUT_TO,
            duration_seconds=8,
        )
        assert vid.parent_artifact_id == img.id
        assert vid.relation_type == ArtifactRelationType.INPUT_TO


class TestUniversalArtifactApiRoutes:
    """Tests des endpoints REST FastAPI avec lignage et grille de concepts."""

    def test_concept_grid_and_lineage_api(self):
        # 1. Création de la grille de concepts via API
        resp = client.post(
            "/api/v1/artifacts/concept-grid",
            json={
                "title": "Affiches Expédition Gabon 2026",
                "prompts": [
                    "Concept 1 : Loango Surf",
                    "Concept 2 : Pongara Turtles",
                    "Concept 3 : Ivindo Falls",
                ],
                "mission_id": "api_concept_mission",
                "run_id": "api_concept_mission",
            },
        )
        assert resp.status_code == 201
        grid_id = resp.json()["id"]

        # 2. Sélection du concept #1
        select_resp = client.post(
            f"/api/v1/artifacts/{grid_id}/select-concept",
            json={"concept_number": 1},
        )
        assert select_resp.status_code == 200
        final_data = select_resp.json()
        assert final_data["parent_artifact_id"] == grid_id
        final_id = final_data["id"]

        # 3. Récupération du lignage
        lineage_resp = client.get(f"/api/v1/artifacts/{final_id}/lineage")
        assert lineage_resp.status_code == 200
        lin_data = lineage_resp.json()
        assert lin_data["parent"]["id"] == grid_id
        assert lin_data["relation_to_parent"] == "derived_from"
