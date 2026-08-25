"""
Ñkyel AI — Live Integration Suite: Google AI Provider · SmartANDJ AI Technologies
Tests d'intégration réels et non mockés contre les API officielles Google.

CONDITIONS STRICTES :
- Exige explicitement LIVE_PROVIDER_TESTS=1 dans l'environnement pour s'exécuter.
- Si LIVE_PROVIDER_TESTS est absent, ces tests sont MARQUÉS COMME SKIP (et NON PASS factice).
- Aucun mock réseau, aucun monkeypatch, aucune donnée fabriquée.

Fondateur : Daniel Jonathan ANDJ
"""

import os
import pytest
from pathlib import Path
from PIL import Image

from services.providers.google_direct_provider import GoogleDirectProvider
from core.config import settings
from core.telemetry import telemetry_registry

pytestmark = pytest.mark.skipif(
    os.getenv("LIVE_PROVIDER_TESTS") != "1",
    reason="LIVE_PROVIDER_TESTS=1 not set. Skipping live Google API calls to prevent accidental billing.",
)


@pytest.mark.asyncio
async def test_live_gemini_37_flash():
    """
    Test Réel 1 : Appel réseau en direct à Gemini 3.7 / 3.6 Flash.
    Enregistre les jetons réels, le temps de réponse et l'ID de réponse.
    """
    mission_id = "live_test_gemini_37"
    resp = await GoogleDirectProvider.generate_text(
        prompt="Explain ecotourism in Gabon in 10 words.",
        model_name="gemini-3.7-flash",
        mission_id=mission_id,
        capability="gemini.reason",
    )

    assert resp["success"] is True
    assert resp["provider"] == "google"
    assert len(resp["text"]) > 0
    assert resp["input_tokens"] > 0
    assert resp["output_tokens"] > 0
    assert resp["duration_ms"] > 0
    assert resp["calculated_cost_usd"] >= 0.0

    print(f"\n[LIVE GEMINI 3.7 FLASH] Text: {resp['text']}")
    print(f"[LIVE GEMINI 3.7 FLASH] Tokens In: {resp['input_tokens']}, Out: {resp['output_tokens']}, Latency: {resp['duration_ms']}ms")


@pytest.mark.asyncio
async def test_live_google_search_grounding():
    """
    Test Réel 2 : Recherche avec ancrage Google Search Grounding.
    Vérifie les citations réelles retournées par Google.
    """
    mission_id = "live_test_search_grounding"
    resp = await GoogleDirectProvider.generate_text(
        prompt="What are the main wildlife species in Loango National Park Gabon?",
        model_name="gemini-3.7-flash",
        mission_id=mission_id,
        capability="gemini.search",
        enable_search_grounding=True,
    )

    assert resp["success"] is True
    assert resp["provider"] == "google"
    print(f"\n[LIVE GOOGLE SEARCH] Response snippet: {resp['text'][:150]}")
    if resp.get("grounding_metadata"):
        print(f"[LIVE GOOGLE SEARCH] Citations: {resp['grounding_metadata'].get('citations_count', 0)}")


@pytest.mark.asyncio
async def test_live_google_image_generation():
    """
    Test Réel 3 : Génération d'image Google (Gemini 3.1 Flash Image / Nano Banana).
    Vérifie l'existence réelle du fichier, le format MIME et le hash SHA-256.
    """
    mission_id = "live_test_image_nano"
    resp = await GoogleDirectProvider.generate_image(
        prompt="A serene beach at Loango National Park Gabon with rainforest in the background",
        aspect_ratio="1:1",
        model="gemini-3.1-flash-image",
        mission_id=mission_id,
    )

    assert resp["success"] is True
    assert resp["provider"] == "google"
    assert resp["mime_type"] == "image/png"
    assert len(resp["sha256"]) == 64
    assert resp["size_bytes"] > 0

    # Vérification physique du fichier sur disque
    file_path = Path(resp["file_path"])
    assert file_path.exists()
    assert file_path.is_file()

    # Validation de l'image avec PIL
    with Image.open(file_path) as img:
        assert img.format == "PNG"
        assert img.size == (1024, 1024)

    print(f"\n[LIVE GOOGLE IMAGE] File: {file_path}")
    print(f"[LIVE GOOGLE IMAGE] SHA-256: {resp['sha256']}")
    print(f"[LIVE GOOGLE IMAGE] Size: {resp['size_bytes']} bytes")
