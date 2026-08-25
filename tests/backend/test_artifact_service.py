"""
Ñkyel AI — Test Suite: Canonical Artifact Service & Multi-Format Exporter · SmartANDJ AI Technologies
Vérification des exports binaires authentiques et du cycle de vie des artefacts :
- Création d'artefacts canoniques avec calcul de hash SHA-256
- Génération PDF réelle avec entête binaire %PDF (ReportLab)
- Génération DOCX réelle avec conteneur PK OpenXML (python-docx)
- Génération PPTX réelle avec conteneur PK OpenXML (python-pptx)
- Génération XLSX réelle avec conteneur PK OpenXML (openpyxl)
- Génération CSV et archive ZIP de projet
- Versioning et restauration de versions
- Système de partage tokenisé sécurisé

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
    ShareVisibility,
    SharePermission,
    CanonicalArtifact,
)

client = TestClient(app)


class TestCanonicalArtifactService:
    """Tests unitaires du service central d'artefacts."""

    @pytest.mark.asyncio
    async def test_create_canonical_artifact(self):
        mission_id = "mission_art_001"
        art = await ArtifactService.create_artifact(
            title="Dossier Stratégique Gabon 2026",
            content="# Stratégie Gabon 2026\n\nPositionnement écotouristique mondial.",
            type=ArtifactType.REPORT,
            mission_id=mission_id,
            run_id=mission_id,
            description="Étude de marché et opportunités.",
        )

        assert art.id.startswith("art_")
        assert art.title == "Dossier Stratégique Gabon 2026"
        assert len(art.sha256) == 64
        assert art.version == 1
        assert len(art.export_formats) >= 3
        assert Path(art.file_path).exists()

    @pytest.mark.asyncio
    async def test_export_pdf_valid_binary(self):
        """Vérifie que l'export PDF produit de vrais octets binaires (%PDF)."""
        mission_id = "mission_pdf_test"
        art = await ArtifactService.create_artifact(
            title="Executive Summary Loango",
            content="# Loango National Park\n\n- Rainforest safari\n- Atlantic beaches\n- Elephant surf",
            type=ArtifactType.REPORT,
            mission_id=mission_id,
            run_id=mission_id,
        )

        raw_bytes, mime, filename = await ArtifactService.export_artifact(art.id, "pdf")
        assert mime == "application/pdf"
        assert filename.endswith(".pdf")
        assert raw_bytes.startswith(b"%PDF")
        assert len(raw_bytes) > 500

    @pytest.mark.asyncio
    async def test_export_docx_valid_binary(self):
        """Vérifie que l'export DOCX produit un conteneur OpenXML valide."""
        mission_id = "mission_docx_test"
        art = await ArtifactService.create_artifact(
            title="Investor Report Gabon",
            content="# Investor Brief\n\nFinancial plan for tourism launch 2026.",
            type=ArtifactType.REPORT,
            mission_id=mission_id,
            run_id=mission_id,
        )

        raw_bytes, mime, filename = await ArtifactService.export_artifact(art.id, "docx")
        assert "officedocument.wordprocessingml" in mime
        assert filename.endswith(".docx")
        # Un fichier .docx est un conteneur ZIP avec word/document.xml
        zf = zipfile.ZipFile(io.BytesIO(raw_bytes))
        assert "word/document.xml" in zf.namelist()

    @pytest.mark.asyncio
    async def test_export_pptx_valid_binary(self):
        """Vérifie que l'export PPTX produit une présentation PowerPoint valide."""
        mission_id = "mission_pptx_test"
        art = await ArtifactService.create_artifact(
            title="Pitch Deck Gabon 2026",
            content="# Slide 1\n- Intro to Gabon\n# Slide 2\n- Market Opportunity",
            type=ArtifactType.SLIDES,
            mission_id=mission_id,
            run_id=mission_id,
        )

        raw_bytes, mime, filename = await ArtifactService.export_artifact(art.id, "pptx")
        assert "officedocument.presentationml" in mime
        assert filename.endswith(".pptx")
        zf = zipfile.ZipFile(io.BytesIO(raw_bytes))
        assert "ppt/presentation.xml" in zf.namelist()

    @pytest.mark.asyncio
    async def test_export_xlsx_valid_binary(self):
        """Vérifie que l'export XLSX produit une feuille Excel OpenXML valide."""
        mission_id = "mission_xlsx_test"
        art = await ArtifactService.create_artifact(
            title="Financial Model 2026",
            content="[Spreadsheet Data]",
            type=ArtifactType.SPREADSHEET,
            mission_id=mission_id,
            run_id=mission_id,
            metadata={"data": [{"Activité": "Marketing", "Budget": 120000}]},
        )

        raw_bytes, mime, filename = await ArtifactService.export_artifact(art.id, "xlsx")
        assert "officedocument.spreadsheetml" in mime
        assert filename.endswith(".xlsx")
        zf = zipfile.ZipFile(io.BytesIO(raw_bytes))
        assert "xl/workbook.xml" in zf.namelist()

    @pytest.mark.asyncio
    async def test_export_zip_bundle(self):
        """Vérifie que l'export ZIP regroupe les fichiers d'un site web."""
        mission_id = "mission_zip_test"
        art = await ArtifactService.create_artifact(
            title="Landing Page Site",
            content="<h1>Welcome to Gabon Tourism</h1>",
            type=ArtifactType.WEBSITE,
            mission_id=mission_id,
            run_id=mission_id,
        )

        raw_bytes, mime, filename = await ArtifactService.export_artifact(art.id, "zip")
        assert mime == "application/zip"
        assert filename.endswith(".zip")
        zf = zipfile.ZipFile(io.BytesIO(raw_bytes))
        assert "index.html" in zf.namelist()
        assert "manifest.json" in zf.namelist()

    @pytest.mark.asyncio
    async def test_versioning_and_rollback(self):
        """Teste l'ajout de version (v1 -> v2) et la restauration."""
        mission_id = "mission_ver_test"
        art = await ArtifactService.create_artifact(
            title="Living Document",
            content="Version 1 content",
            type=ArtifactType.MARKDOWN,
            mission_id=mission_id,
            run_id=mission_id,
        )
        assert art.version == 1

        # Ajout de version 2
        updated_art = ArtifactService.save_new_version(
            artifact_id=art.id,
            new_content="Version 2 content edited",
            author_agent="human_user",
            change_summary="Added financial details",
        )
        assert updated_art.version == 2
        assert len(updated_art.versions) == 2

        # Restauration de version 1
        restored = ArtifactService.restore_version(art.id, target_version=1)
        assert restored.version == 3
        assert len(restored.versions) == 3

    @pytest.mark.asyncio
    async def test_secure_tokenized_sharing(self):
        """Teste la création et la résolution de liens de partage tokenisés."""
        mission_id = "mission_share_test"
        art = await ArtifactService.create_artifact(
            title="Confidential Report",
            content="Restricted strategic notes.",
            type=ArtifactType.REPORT,
            mission_id=mission_id,
            run_id=mission_id,
        )

        st = ArtifactService.create_share_link(
            artifact_id=art.id,
            visibility=ShareVisibility.LINK_ONLY,
            permission=SharePermission.DOWNLOAD_ALLOWED,
            expires_in_hours=24,
        )
        assert st.token.startswith("sh_")
        assert st.expires_at is not None

        # Résolution du token
        resolved = ArtifactService.resolve_share_link(st.token)
        assert resolved is not None
        assert resolved["artifact"]["id"] == art.id
        assert resolved["permission"] == "download_allowed"


class TestArtifactApiEndpoints:
    """Tests des endpoints REST FastAPI des artefacts."""

    def test_artifact_crud_and_export_api(self):
        # 1. Création via API
        resp = client.post(
            "/api/v1/artifacts",
            json={
                "title": "API Test Report",
                "content": "# API Generated Report\n\nVerified deliverable.",
                "type": "report",
                "mission_id": "api_test_mission",
                "run_id": "api_test_mission",
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        art_id = data["id"]

        # 2. Récupération
        get_resp = client.get(f"/api/v1/artifacts/{art_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["title"] == "API Test Report"

        # 3. Export PDF
        pdf_resp = client.get(f"/api/v1/artifacts/{art_id}/export?format=pdf")
        assert pdf_resp.status_code == 200
        assert pdf_resp.headers["content-type"] == "application/pdf"
        assert pdf_resp.content.startswith(b"%PDF")

        # 4. Partage
        share_resp = client.post(
            f"/api/v1/artifacts/{art_id}/share",
            json={"visibility": "link_only", "permission": "download_allowed", "expires_in_hours": 48},
        )
        assert share_resp.status_code == 200
        token = share_resp.json()["token"]

        # 5. Résolution du lien partagé
        resolve_resp = client.get(f"/api/v1/artifacts/share/{token}")
        assert resolve_resp.status_code == 200
        assert resolve_resp.json()["artifact"]["id"] == art_id
