"""
Ñkyel AI — Test Suite: Google Capability Registry & Telemetry (Unit/Contract Tests) · SmartANDJ AI Technologies
Vérification des contrats d'interface, politiques de sécurité et calculs de coûts :
- Résolution des capacités (gemini.reason, gemini.plan, google.image.generate, google.video.generate, google.maps.ground)
- Politique de sécurité (AUTO / ASK / DENY) et pré-vérification budgétaire (dryRun)
- Fournisseur Direct Google (Gemini 3.1 Flash Image, Veo 3.1, Gemini 3.7) et Runway Model Router
- Télémétrie défendable vérifiée (GoogleTechnologyTelemetry)

Fondateur : Daniel Jonathan ANDJ
"""

import pytest
import asyncio
from services.google_capability_registry import GoogleCapabilityRegistry, ActionPolicy, GoogleCapability
from services.providers.google_direct_provider import GoogleDirectProvider
from services.providers.runway_media_provider import RunwayMediaProvider
from core.config import settings
from core.telemetry import telemetry_registry, record_google_telemetry


class TestGooglePolicies:
    """Vérification des politiques de sécurité et garde-fous budgétaires."""

    def test_policy_resolutions(self):
        assert GoogleCapabilityRegistry.get_policy("gemini.plan") == ActionPolicy.AUTO
        assert GoogleCapabilityRegistry.get_policy("gemini.search") == ActionPolicy.AUTO
        assert GoogleCapabilityRegistry.get_policy("google.maps.ground") == ActionPolicy.AUTO
        assert GoogleCapabilityRegistry.get_policy("google.image.generate") == ActionPolicy.AUTO
        assert GoogleCapabilityRegistry.get_policy("google.video.generate") == ActionPolicy.ASK
        assert GoogleCapabilityRegistry.get_policy("google.gmail.send") == ActionPolicy.ASK

    def test_runway_dry_run(self):
        dry_img = RunwayMediaProvider.dry_run(media_type="image")
        assert dry_img["dry_run"] is True
        assert dry_img["estimated_cost_usd"] > 0
        assert dry_img["estimated_credits"] > 0
        assert dry_img["access_method"] == "RUNWAY_ROUTER"

        dry_vid = RunwayMediaProvider.dry_run(media_type="video", duration_seconds=5)
        assert dry_vid["estimated_cost_usd"] >= 0.20


class TestGoogleDirectProviderUnit:
    """Test unitaire du fournisseur direct Google."""

    @pytest.mark.asyncio
    async def test_generate_image_contract(self):
        mission_id = "test_img_contract_001"
        res = await GoogleDirectProvider.generate_image(
            prompt="Gabon lush equatorial forest",
            aspect_ratio="1:1",
            model=settings.google_image_fast_model,
            mission_id=mission_id,
        )
        assert res["success"] is True
        assert res["provider"] == "google"
        assert res["model"] == settings.google_image_fast_model
        assert res["access_method"] == "DIRECT_GOOGLE"
        assert res["calculated_cost_usd"] > 0
        assert "url" in res
        assert len(res["sha256"]) == 64

        # Vérifier la télémétrie enregistrée
        gt = telemetry_registry.get_google_telemetry(mission_id)
        summary = gt.summary()
        assert summary["google_image_generations"] == 1
        assert summary["google_artifacts_generated"] >= 1

    @pytest.mark.asyncio
    async def test_generate_video_contract(self):
        mission_id = "test_vid_contract_001"
        res = await GoogleDirectProvider.generate_video(
            prompt="Gabon coastal surf slow motion",
            duration_seconds=5,
            aspect_ratio="16:9",
            model=settings.google_video_model,
            mission_id=mission_id,
        )
        assert res["success"] is True
        assert res["provider"] == "google"
        assert res["model"] == settings.google_video_model
        assert res["access_method"] == "DIRECT_GOOGLE"
        assert "video_url" in res

        gt = telemetry_registry.get_google_telemetry(mission_id)
        summary = gt.summary()
        assert summary["google_video_generations"] == 1


class TestRunwayMediaProviderUnit:
    """Test unitaire du fournisseur Runway Model Router."""

    @pytest.mark.asyncio
    async def test_runway_image_routing_contract(self):
        mission_id = "test_runway_img_contract"
        res = await RunwayMediaProvider.generate_image(
            prompt="Gabon modern ecotourism lodge",
            aspect_ratio="16:9",
            model="gen3a_turbo",
            mission_id=mission_id,
        )
        assert res["success"] is True
        assert res["access_method"] == "RUNWAY_ROUTER"
        assert res["router"] == "runway_model_router"
        assert res["calculated_cost_usd"] > 0
        assert len(res["sha256"]) == 64


class TestCapabilityRegistryExecution:
    """Test des requêtes via la passerelle GoogleCapabilityRegistry."""

    @pytest.mark.asyncio
    async def test_request_gemini_plan(self):
        mission_id = "test_cap_plan_001"
        res = await GoogleCapabilityRegistry.request_capability(
            capability="gemini.plan",
            mission_id=mission_id,
            run_id=mission_id,
            params={"prompt": "Plan 3 tasks for launching a sustainable tourism brand"},
        )
        assert res["success"] is True
        assert res["provider"] == "google"
        assert res["input_tokens"] >= 0

    @pytest.mark.asyncio
    async def test_request_maps_grounding(self):
        mission_id = "test_cap_maps_001"
        res = await GoogleCapabilityRegistry.request_capability(
            capability="google.maps.ground",
            mission_id=mission_id,
            run_id=mission_id,
            params={"query": "Gabon national parks"},
        )
        assert res["success"] is True
        assert len(res["locations"]) >= 3
        assert res["locations"][0]["name"] == "Parc National de Loango"

    @pytest.mark.asyncio
    async def test_request_workspace_sheets(self):
        mission_id = "test_cap_sheets_001"
        res = await GoogleCapabilityRegistry.request_capability(
            capability="google.sheets.create",
            mission_id=mission_id,
            run_id=mission_id,
            params={"title": "Test Budget 2026", "data": [{"cat": "Marketing", "amount": 50000}]},
        )
        assert res["success"] is True
        assert "artifact_id" in res


class TestTelemetrySummary:
    """Test du bilan technique défendable de l'usage Google."""

    def test_telemetry_accuracy(self):
        mission_id = "test_telemetry_audit"
        record_google_telemetry(
            mission_id=mission_id,
            capability="gemini.plan",
            model="gemini-3.7-flash",
            latency_ms=350,
            cost_usd=0.0004,
        )
        record_google_telemetry(
            mission_id=mission_id,
            capability="google.search",
            model="google-search-grounding",
            latency_ms=210,
            cost_usd=0.001,
        )
        record_google_telemetry(
            mission_id=mission_id,
            capability="google.image.generate",
            model="gemini-3.1-flash-image",
            latency_ms=2500,
            cost_usd=0.030,
        )

        gt = telemetry_registry.get_google_telemetry(mission_id)
        summary = gt.summary()

        assert summary["google_ai_executions"] == 1
        assert summary["google_search_executions"] == 1
        assert summary["google_image_generations"] == 1
        assert summary["google_tools_used"] == 1
        assert summary["operations_count"] == 3
        assert summary["total_cost_usd"] == 0.0314
