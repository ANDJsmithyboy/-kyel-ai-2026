"""
Ñkyel AI — Live Integration Suite: Runway Media Provider · SmartANDJ AI Technologies
Tests d'intégration réels et non mockés contre l'API Runway Model Router.

CONDITIONS STRICTES :
- Exige explicitement LIVE_PROVIDER_TESTS=1 dans l'environnement pour s'exécuter.
- Si LIVE_PROVIDER_TESTS est absent, ces tests sont MARQUÉS COMME SKIP.
- Aucun mock réseau, capture de la sélection réelle du routeur.

Fondateur : Daniel Jonathan ANDJ
"""

import os
import pytest
from pathlib import Path
from PIL import Image

from services.providers.runway_media_provider import RunwayMediaProvider
from core.config import settings

pytestmark = pytest.mark.skipif(
    os.getenv("LIVE_PROVIDER_TESTS") != "1",
    reason="LIVE_PROVIDER_TESTS=1 not set. Skipping live Runway API calls to prevent credit consumption.",
)


def test_live_runway_dry_run():
    """
    Test Réel 1 : dryRun d'estimation avant génération.
    """
    dry = RunwayMediaProvider.dry_run(media_type="image")
    assert dry["dry_run"] is True
    assert dry["estimated_cost_usd"] > 0
    assert dry["estimated_credits"] > 0
    assert dry["access_method"] == "RUNWAY_ROUTER"

    print(f"\n[RUNWAY DRY RUN] Estimated Credits: {dry['estimated_credits']}, Cost: ${dry['estimated_cost_usd']}")


@pytest.mark.asyncio
async def test_live_runway_image_generation():
    """
    Test Réel 2 : Génération d'image via Runway Router.
    Vérifie l'existence réelle du fichier généré et le calcul SHA-256.
    """
    mission_id = "live_test_runway_img"
    resp = await RunwayMediaProvider.generate_image(
        prompt="Modern eco-lodge in Gabon equatorial rainforest",
        aspect_ratio="1:1",
        model="gen3a_turbo",
        mission_id=mission_id,
    )

    assert resp["success"] is True
    assert resp["access_method"] == "RUNWAY_ROUTER"
    assert resp["router"] == "runway_model_router"
    assert len(resp["sha256"]) == 64

    file_path = Path(resp["file_path"])
    assert file_path.exists()

    with Image.open(file_path) as img:
        assert img.format == "PNG"

    print(f"\n[RUNWAY IMAGE] File: {file_path}")
    print(f"[RUNWAY IMAGE] SHA-256: {resp['sha256']}")
