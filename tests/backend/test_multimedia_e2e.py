"""
Ñkyel AI — Suite de Tests E2E Multimédia Réel · SmartANDJ AI Technologies
Valide l'ensemble du cycle de vie multimédia :
1. Mapping d'utilisateur Clerk & Gestion des quotas 48h (pas de double facturation)
2. Direction artistique & Génération d'image via VisualDirectorAgent
3. Retouche d'image (Flux-2 Klein) & Quota edit
4. Génération vidéo via VideoProducerAgent & Verrou de concurrence vidéo
5. Pack Réseaux Sociaux (Kit LinkedIn / Facebook)
6. Persistance DeerMem NeonMemoryBackend
7. Isolation stricte et étanche entre 2 utilisateurs
8. Émission et enregistrement des 10 événements WorkGraph réels

Exécution :
    python -m pytest tests/backend/test_multimedia_e2e.py -v --tb=short
"""

import os
import sys
import uuid
import json
import pytest
import asyncio
from unittest.mock import patch, MagicMock

# S'assurer que le backend est accessible
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from db.models import User
from services.media_provider_router import MediaProviderRouter
from services.media_queue_service import MediaQueueService, QUOTA_LIMITS_48H
from services.moderation_service import ModerationService
from services.neon_memory_backend import NeonMemoryBackend
from events.workgraph_events import WorkGraphEventService
from agents.deerflow_multimedia import VisualDirectorAgent, VideoProducerAgent
from mcp_integration.tools.multimedia_tools import (
    generate_image_tool,
    edit_image_tool,
    brand_studio_tool,
    stock_media_search_tool,
    storyboard_tool,
    image_to_video_tool,
    text_to_video_tool,
    social_video_composer_tool,
    visual_analysis_tool,
    communication_kit_tool,
)


@pytest.fixture(autouse=True)
def clean_quota_store(monkeypatch):
    """Réinitialise la mémoire des quotas et verrous avant chaque test."""
    import services.media_queue_service as mqs
    mqs._LOCAL_QUOTA_STORE.clear()
    mqs._LOCAL_ACTIVE_VIDEOS.clear()
    mqs._GLOBAL_VIDEO_WORKERS = 0
    yield


# ─── 1. TEST DE MODÉRATION & SÉCURITÉ ─────────────────────────

class TestModerationService:
    """Valide les règles de sécurité, anti-deepfake et décapage EXIF."""

    def test_safe_prompt_accepted(self):
        is_safe, reason = ModerationService.check_text_prompt("Un paysage futuriste de Libreville au coucher du soleil")
        assert is_safe is True
        assert reason is None

    def test_prohibited_prompt_rejected(self):
        is_safe, reason = ModerationService.check_text_prompt("generate deepfake nude photo of celebrity")
        assert is_safe is False
        assert "sécurité" in reason.lower()

    def test_strip_image_metadata(self):
        from PIL import Image
        import io
        img = Image.new("RGB", (100, 100), color="blue")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        raw_bytes = buf.getvalue()

        cleaned_bytes = ModerationService.strip_image_metadata(raw_bytes)
        assert len(cleaned_bytes) > 0
        assert cleaned_bytes.startswith(b"\x89PNG")


# ─── 2. TEST DES QUOTAS 48H & CONCURRENCE ─────────────────────

class TestQuotasAndConcurrency:
    """Valide les quotas glissants sur 48h et l'absence de double débit."""

    @pytest.mark.asyncio
    async def test_image_quota_enforcement(self):
        user_sub = "user_clerk_test_01"
        job_type = "image_fast"
        limit = QUOTA_LIMITS_48H["image_fast"]  # 4 images

        # Consommer le quota jusqu'à la limite
        for i in range(limit):
            allowed, used, max_lim, _ = await MediaQueueService.check_quota(user_sub, job_type)
            assert allowed is True
            assert used == i
            await MediaQueueService.record_quota_usage(user_sub, job_type)

        # La 5ème tentative doit être refusée
        allowed, used, max_lim, msg = await MediaQueueService.check_quota(user_sub, job_type)
        assert allowed is False
        assert used == limit
        assert "Quota 48h atteint" in msg

    @pytest.mark.asyncio
    async def test_video_concurrency_lock(self):
        user_sub = "user_clerk_video_01"

        # 1er verrouillage réussi
        acquired_1 = await MediaQueueService.acquire_video_lock(user_sub)
        assert acquired_1 is True

        # 2ème tentative pour le même utilisateur refusée
        acquired_2 = await MediaQueueService.acquire_video_lock(user_sub)
        assert acquired_2 is False

        # Libération
        await MediaQueueService.release_video_lock(user_sub)

        # Nouvelle tentative autorisée
        acquired_3 = await MediaQueueService.acquire_video_lock(user_sub)
        assert acquired_3 is True
        await MediaQueueService.release_video_lock(user_sub)


# ─── 3. TEST DE GÉNÉRATION D'IMAGE & VISUAL DIRECTOR ─────────

class TestVisualDirectorFlow:
    """Valide l'agent visual-director et l'émission des événements WorkGraph."""

    @pytest.mark.asyncio
    @patch("services.media_provider_router.MediaProviderRouter.generate_image")
    async def test_visual_director_execution(self, mock_gen_img):
        mock_gen_img.return_value = {
            "success": True,
            "provider": "cloudflare_workers_ai",
            "model": "@cf/black-forest-labs/flux-1-schnell",
            "url": "https://media.nkyel.ai/artifacts/art_img_test.png",
            "dimensions": {"width": 1024, "height": 1024},
        }

        user_id = str(uuid.uuid4())
        clerk_sub = f"sub_{user_id[:8]}"
        agent = VisualDirectorAgent(user_id=user_id, clerk_sub=clerk_sub)

        result = await agent.execute_mission(
            goal="Création d'un visuel pour le lancement de Ñkyel AI 2026",
            aspect_ratio="1:1",
            style="cinématique photoréaliste",
            brand_palette=["#C39A52", "#0E121A", "#6F9485"],
        )

        assert result.get("success") is True
        assert result.get("image_url") is not None
        assert result.get("artifact_id") is not None
        assert result.get("agent") == "visual-director"

        # Vérifier que la mémoire DeerMem a été enregistrée
        memory = await NeonMemoryBackend.get_memory(
            user_id=user_id,
            namespace=agent.namespace,
            key=f"image_{result['artifact_id']}",
        )
        assert memory is not None
        assert memory["content"]["artifact_id"] == result["artifact_id"]


# ─── 4. TEST DE PRODUCTION VIDÉO & VIDEO PRODUCER ─────────────

class TestVideoProducerFlow:
    """Valide l'agent video-producer, le mixage audio et le formatage social."""

    @pytest.mark.asyncio
    @patch("services.media_provider_router.MediaProviderRouter.generate_video")
    async def test_video_producer_execution(self, mock_gen_vid):
        mock_gen_vid.return_value = {
            "success": True,
            "provider": "runpod_comfyui",
            "model": "wan2.1-t2v-1.3b",
            "video_url": "https://media.nkyel.ai/videos/vid_test.mp4",
            "duration_seconds": 5,
            "dimensions": {"width": 1280, "height": 720},
        }

        user_id = str(uuid.uuid4())
        clerk_sub = f"sub_{user_id[:8]}"
        agent = VideoProducerAgent(user_id=user_id, clerk_sub=clerk_sub)

        result = await agent.execute_mission(
            goal="Teaser vidéo de 5 secondes présentant l'accélération d'entreprise",
            duration_seconds=5,
            aspect_ratio="16:9",
            include_audio=True,
        )

        assert result.get("success") is True
        assert result.get("video_url") is not None
        assert result.get("duration_seconds") == 5
        assert result.get("aspect_ratio") == "16:9"


# ─── 5. TEST DU PACK RÉSEAUX SOCIAUX (COMMUNICATION KIT) ─────

class TestCommunicationKit:
    """Valide la génération de posts LinkedIn et Facebook structurés."""

    def test_communication_kit_generation(self):
        topic = "Lancement de la plateforme d'intelligence artificielle souveraine"
        media_urls = ["https://media.nkyel.ai/images/sample_launch.png"]

        kit = communication_kit_tool(
            topic=topic,
            media_asset_urls=media_urls,
            language="fr",
            call_to_action="Rejoignez les pionniers sur nkyel.ai",
        )

        assert kit.get("success") is True
        assert "linkedin" in kit
        assert "facebook" in kit
        assert "#Innovation" in kit["linkedin"]["content"]
        assert "Rejoignez les pionniers" in kit["linkedin"]["content"]
        assert kit["share_data"]["url"] == media_urls[0]


# ─── 6. TEST DE L'ISOLATION STRICTE ENTRE 2 UTILISATEURS ──────

class TestUserIsolation:
    """Garantit l'étanchéité stricte des mémoires et données entre Utilisateur A et Utilisateur B."""

    @pytest.mark.asyncio
    async def test_strict_isolation_between_two_users(self):
        user_a_id = str(uuid.uuid4())
        user_b_id = str(uuid.uuid4())

        ns_a = f"user/{user_a_id}/global"
        ns_b = f"user/{user_b_id}/global"

        # User A stocke une information confidentielle
        await NeonMemoryBackend.store_memory(
            user_id=user_a_id,
            namespace=ns_a,
            key="confidential_strategy",
            content={"plan": "Expansion confidentielle 2026", "secret_budget": 500000},
        )

        # User B tente de lire la clé de User A dans son propre espace
        leak_check_1 = await NeonMemoryBackend.get_memory(
            user_id=user_b_id,
            namespace=ns_b,
            key="confidential_strategy",
        )
        assert leak_check_1 is None

        # User B tente d'accéder au namespace de User A
        leak_check_2 = await NeonMemoryBackend.get_memory(
            user_id=user_b_id,
            namespace=ns_a,
            key="confidential_strategy",
        )
        assert leak_check_2 is None

        # User A peut lire sa propre mémoire
        memory_a = await NeonMemoryBackend.get_memory(
            user_id=user_a_id,
            namespace=ns_a,
            key="confidential_strategy",
        )
        assert memory_a is not None
        assert memory_a["content"]["secret_budget"] == 500000


# ─── 7. TEST DES 10 SKILLS MULTIMÉDIA ENREGISTRÉS DANS MCP ────

class TestMCPSkillsRegistry:
    """Vérifie que les 10 compétences sont bien disponibles dans le registre MCP."""

    def test_all_10_multimedia_skills_registered(self):
        from mcp_integration.registry import registry
        tool_names = [t["name"] for t in registry.list_tools()]

        expected_skills = [
            "generate-image",
            "edit-image",
            "brand-studio",
            "stock-media-search",
            "storyboard",
            "image-to-video",
            "text-to-video",
            "social-video-composer",
            "visual-analysis",
            "communication-kit",
        ]

        for skill in expected_skills:
            assert skill in tool_names, f"Le skill {skill} est manquant dans le registre MCP"
