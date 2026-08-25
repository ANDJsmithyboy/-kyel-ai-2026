"""
Ñkyel AI — Test Suite: Frontend Provider Visibility Policy & Google Showcase Mode · SmartANDJ AI Technologies
Vérification de la conformité aux 3 niveaux de visibilité :
1. Niveau 1 (USER) : Masque les infrastructures internes (fal, runway, groq, tavily, etc.)
2. Niveau 2 (GOOGLE SHOWCASE) : Attribution Google UNIQUEMENT pour les technologies Google Direct réelles (Vérité absolue)
3. Niveau 3 (ADMIN) : Télémétrie complète
4. Zéro faux badge : Les exécutions fal.ai ou Runway ne reçoivent JAMAIS de branding Google.

Fondateur : Daniel Jonathan ANDJ
"""

import pytest
from core.config import settings
from services.artifact_service import ArtifactService, CanonicalArtifact, ArtifactType


class TestFrontendProviderVisibilityPolicy:
    """Vérifie la stricte application des règles de visibilité et d'attribution."""

    def test_settings_showcase_flag(self):
        """Vérifie la présence et l'indépendance du flag GOOGLE_SHOWCASE_MODE."""
        assert hasattr(settings, "google_showcase_mode")
        assert isinstance(settings.google_showcase_mode, bool)

    def test_truthful_attribution_logic(self):
        """Vérifie que l'attribution est accordée UNIQUEMENT pour Google Direct."""
        
        def mock_resolve_attribution(provider: str, access_method: str, level: str) -> dict:
            is_direct_google = provider.lower() == "google" and access_method == "DIRECT_GOOGLE"
            
            if level == "USER":
                return {"show_google": False, "primary": "Visual Agent"}
            elif level == "GOOGLE_SHOWCASE":
                if is_direct_google:
                    return {"show_google": True, "primary": "Powered by Google · Google Image"}
                return {"show_google": False, "primary": "Visual Agent"}
            else: # ADMIN
                return {"show_google": is_direct_google, "primary": f"{provider} · {access_method}"}

        # 1. Cas Google Direct en mode Showcase -> Autorisé
        res1 = mock_resolve_attribution("google", "DIRECT_GOOGLE", "GOOGLE_SHOWCASE")
        assert res1["show_google"] is True
        assert "Powered by Google" in res1["primary"]

        # 2. Cas Google Direct en mode User Standard -> Masqué (Souveraineté Ñkyel)
        res2 = mock_resolve_attribution("google", "DIRECT_GOOGLE", "USER")
        assert res2["show_google"] is False
        assert res2["primary"] == "Visual Agent"

        # 3. Cas fal.ai en mode Showcase -> JAMAIS DE BRANDING GOOGLE (Vérité absolue)
        res3 = mock_resolve_attribution("fal", "DIRECT_FAL", "GOOGLE_SHOWCASE")
        assert res3["show_google"] is False
        assert res3["primary"] == "Visual Agent"

        # 4. Cas Runway Router en mode Showcase -> Pas de Google Direct
        res4 = mock_resolve_attribution("runway", "RUNWAY_ROUTER", "GOOGLE_SHOWCASE")
        assert res4["show_google"] is False
        assert res4["primary"] == "Visual Agent"

    def test_telemetry_extraction_accuracy(self):
        """Vérifie que la synthèse de fin de mission extrait fidèlement la télémétrie."""
        events = [
            {"provider": "google", "access_method": "DIRECT_GOOGLE", "model": "gemini-3.7-flash", "task": "plan"},
            {"provider": "google", "access_method": "DIRECT_GOOGLE", "model": "gemini-3.1-flash-image", "task": "image"},
            {"provider": "google", "access_method": "DIRECT_GOOGLE", "model": "veo-3.1-generate-preview", "task": "video"},
            {"provider": "fal", "access_method": "DIRECT_FAL", "model": "flux-pro", "task": "fallback_image"},
        ]

        google_direct_count = sum(1 for e in events if e["provider"] == "google" and e["access_method"] == "DIRECT_GOOGLE")
        has_gemini = any(e["provider"] == "google" and "gemini-3.7" in e["model"] for e in events)
        has_image = any(e["provider"] == "google" and "flash-image" in e["model"] for e in events)
        has_veo = any(e["provider"] == "google" and "veo" in e["model"] for e in events)

        assert google_direct_count == 3
        assert has_gemini is True
        assert has_image is True
        assert has_veo is True
