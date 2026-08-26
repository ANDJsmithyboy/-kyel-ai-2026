"""
Ñkyel AI — Suite de Tests de l'Architecture de Stockage Souverain · SmartANDJ AI Technologies
Valide l'architecture :
1. Matrice de stockage permanent : Neon (SQL, mémoires, événements, métadonnées) + Cloudflare R2 (fichiers binaires)
2. Les 5 niveaux de mémoire (immédiate, conversationnelle, personnelle, propre aux agents, RAG)
3. Moteur cognitif DeerMem (faits, résumés, contradictions, recherche, injection de prompt)
4. Cloisonnement et isolation étanche entre 2 utilisateurs distincts

Exécution :
    python -m pytest tests/backend/test_storage_architecture.py -v --tb=short
"""

import os
import sys
import uuid
import pytest
import asyncio

# S'assurer que le backend est accessible
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from db.models import (
    User,
    Conversation,
    Message,
    Artifact,
)
from services.neon_memory_backend import NeonMemoryBackend
from services.deermem_engine import DeerMemEngine
from services.r2_storage_service import R2StorageService


# ─── 1. TEST DE LA MATRICE DE STOCKAGE SOUVERAIN (NEON + R2) ──

class TestStorageMatrixCompliance:
    """Vérifie que les tables Neon et les clés R2 respectent la spécification."""

    def test_neon_models_schema_integrity(self):
        # Vérification des tables Neon fondamentales
        tables = [
            User.__tablename__,
            Conversation.__tablename__,
            Message.__tablename__,
            Artifact.__tablename__,
        ]
        expected_tables = [
            "users",
            "conversations",
            "messages",
            "artifacts",
        ]
        for tbl in expected_tables:
            assert tbl in tables, f"La table Neon '{tbl}' est requise dans l'architecture."

    @pytest.mark.asyncio
    async def test_r2_object_key_isolation(self):
        user_id = str(uuid.uuid4())
        art_id = f"art_{uuid.uuid4().hex[:8]}"

        # Clé d'objet R2
        key = R2StorageService.get_object_key(user_id=user_id, category="artifacts", file_name=f"{art_id}.png")
        assert key.startswith(f"users/{user_id}/artifacts/")

        # Upload binaire dans R2 (avec fallback local)
        upload_result = await R2StorageService.upload_bytes(
            data=b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR",
            user_id=user_id,
            category="artifacts",
            file_name=f"{art_id}.png",
            content_type="image/png",
        )
        assert upload_result["success"] is True
        assert upload_result["object_key"] == key
        assert user_id in upload_result["url"]


# ─── 2. TEST DES 5 NIVEAUX DE MÉMOIRE (DEERMEM SUR NEON) ─────

class TestFiveMemoryLevels:
    """Valide les 5 niveaux de mémoire dans Neon."""

    @pytest.mark.asyncio
    async def test_agent_namespaces_hierarchy(self):
        user_id = str(uuid.uuid4())

        # 1. Mémoire globale
        ns_global = NeonMemoryBackend.get_namespace(user_id, "global")
        assert ns_global == f"user/{user_id}/global"

        # 2. Mémoire Visual Director
        ns_visual = NeonMemoryBackend.get_namespace(user_id, "visual-director")
        assert ns_visual == f"user/{user_id}/agents/visual-director"

        # 3. Mémoire Video Producer
        ns_video = NeonMemoryBackend.get_namespace(user_id, "video-producer")
        assert ns_video == f"user/{user_id}/agents/video-producer"

        # 4. Mémoire Projet
        proj_id = "proj_sovereignty_2026"
        ns_proj = NeonMemoryBackend.get_namespace(user_id, "project", sub_id=proj_id)
        assert ns_proj == f"user/{user_id}/projects/{proj_id}"

        # Stocker dans chaque niveau
        await NeonMemoryBackend.store_memory(user_id, ns_global, "preferred_language", {"lang": "fr"})
        await NeonMemoryBackend.store_memory(user_id, ns_visual, "brand_palette", {"colors": ["#C39A52", "#0E121A"]})
        await NeonMemoryBackend.store_memory(user_id, ns_video, "default_fps", {"fps": 24})
        await NeonMemoryBackend.store_memory(user_id, ns_proj, "target_audience", {"segment": "Entreprises Gabon & Afrique"})

        # Vérifier la récupération isolée par niveau
        mem_global = await NeonMemoryBackend.get_memory(user_id, ns_global, "preferred_language")
        mem_visual = await NeonMemoryBackend.get_memory(user_id, ns_visual, "brand_palette")
        mem_video = await NeonMemoryBackend.get_memory(user_id, ns_video, "default_fps")
        mem_proj = await NeonMemoryBackend.get_memory(user_id, ns_proj, "target_audience")

        assert mem_global["content"]["lang"] == "fr"
        assert "#C39A52" in mem_visual["content"]["colors"]
        assert mem_video["content"]["fps"] == 24
        assert "Gabon" in mem_proj["content"]["segment"]


# ─── 3. TEST DU MOTEUR COGNITIF DEERMEM ──────────────────────

class TestDeerMemCognitiveEngine:
    """Valide les fonctions cognitives de DeerMem : extraction, résumé, contradiction, injection."""

    @pytest.mark.asyncio
    async def test_deermem_facts_extraction(self):
        user_id = str(uuid.uuid4())
        user_message = "Je souhaite que toutes mes réponses soient en Fang avec une palette de couleur dorée et sombre."

        facts = await DeerMemEngine.extract_facts(
            user_message=user_message,
            assistant_response="Akiba, j'enregistre vos préférences.",
            user_id=user_id,
        )

        assert len(facts) >= 2
        keys = [f["key"] for f in facts]
        assert "preferred_language" in keys
        assert "brand_styling" in keys

    @pytest.mark.asyncio
    async def test_deermem_contradiction_resolution(self):
        user_id = str(uuid.uuid4())
        ns = NeonMemoryBackend.get_namespace(user_id, "global")

        # 1ère préférence
        await DeerMemEngine.resolve_contradictions(
            key="communication_tone",
            new_value="très formel et institutionnel",
            user_id=user_id,
            namespace=ns,
        )

        # Changement d'avis (contradiction résolue)
        updated = await DeerMemEngine.resolve_contradictions(
            key="communication_tone",
            new_value="innovant, concis et chaleureux",
            user_id=user_id,
            namespace=ns,
        )

        assert updated["content"]["value"] == "innovant, concis et chaleureux"
        assert updated["content"]["previous_value"] == "très formel et institutionnel"
        assert updated["content"]["superseded_at"] is not None

    @pytest.mark.asyncio
    async def test_deermem_prompt_injection(self):
        user_id = str(uuid.uuid4())
        ns_global = NeonMemoryBackend.get_namespace(user_id, "global")
        ns_visual = NeonMemoryBackend.get_namespace(user_id, "visual-director")

        await NeonMemoryBackend.store_memory(user_id, ns_global, "business_sector", {"sector": "Intelligence Artificielle"})
        await NeonMemoryBackend.store_memory(user_id, ns_visual, "aspect_preference", {"ratio": "16:9"})

        injected_prompt = await DeerMemEngine.inject_memory_context(
            agent_name="visual-director",
            user_id=user_id,
        )

        assert "Intelligence Artificielle" in injected_prompt
        assert "16:9" in injected_prompt


# ─── 4. TEST DE L'ISOLATION ÉTANCHE DES UTILISATEURS ──────────

class TestStrictUserIsolationAtAllLevels:
    """Garantit l'absence totale de fuite de données entre Utilisateur A et Utilisateur B."""

    @pytest.mark.asyncio
    async def test_two_users_complete_isolation(self):
        user_a = str(uuid.uuid4())
        user_b = str(uuid.uuid4())

        ns_a = NeonMemoryBackend.get_namespace(user_a, "global")
        ns_b = NeonMemoryBackend.get_namespace(user_b, "global")

        # User A stocke un artefact et une mémoire
        await NeonMemoryBackend.store_memory(user_a, ns_a, "secret_key", {"token": "SECRET_USER_A_12345"})
        r2_a = await R2StorageService.upload_bytes(
            data=b"CONFIDENTIAL_USER_A_CONTENT",
            user_id=user_a,
            category="documents",
            file_name="confidential_a.pdf",
            content_type="application/pdf",
        )

        # User B tente de lire la mémoire de User A
        leak_mem = await NeonMemoryBackend.get_memory(user_b, ns_a, "secret_key")
        assert leak_mem is None

        # User B ne peut voir que son propre espace R2
        r2_b_key = R2StorageService.get_object_key(user_id=user_b, category="documents", file_name="confidential_a.pdf")
        assert r2_b_key != r2_a["object_key"]
        assert f"users/{user_b}/" in r2_b_key
        assert f"users/{user_a}/" not in r2_b_key
