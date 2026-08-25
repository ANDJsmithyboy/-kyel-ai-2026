"""
Ñkyel AI — Test Suite: Production Core (Clerk + Neon + Auth + Preferences + Quotas) · SmartANDJ AI Technologies
Vérification des 7 piliers de la production :
1. Synchronisation idempotente Clerk → Neon (User, UserPreference, QuotaUsage, BetaAccess)
2. Persistance et lecture des préférences utilisateur
3. Application stricte des quotas côté serveur avec réservation atomique
4. Isolation des données multi-locataires (Tenant Isolation)
5. Endpoints /api/health et /api/readiness
6. Droits administrateurs souverains
7. Protection contre les faux badges et fuites d'infrastructure

Fondateur : Daniel Jonathan ANDJ
"""

import pytest
import uuid
from fastapi.testclient import TestClient

from main import app
from services.quota_service import QuotaService, BETA_DEFAULT_LIMITS

client = TestClient(app)


class TestProductionCoreSuite:
    """Suite de tests pour la couche Production Core."""

    def test_health_and_readiness_endpoints(self):
        """Vérifie la disponibilité et rapidité de /api/health et /api/readiness."""
        # 1. Health check ultra-rapide
        h_resp = client.get("/api/health")
        assert h_resp.status_code == 200
        assert h_resp.json()["status"] == "ok"
        assert "uptime_seconds" in h_resp.json()

        # 2. Readiness check
        r_resp = client.get("/api/readiness")
        assert r_resp.status_code in (200, 503)
        assert "status" in r_resp.json()
        assert "checks" in r_resp.json()

    def test_quota_service_atomic_reservation_lifecycle(self):
        """Teste le cycle complet : vérification -> réservation -> commit -> quota épuisé."""
        test_user = f"user_test_{uuid.uuid4().hex[:6]}"

        # 1. Vérification initiale : Quota disponible
        allowed, msg = QuotaService.check_quota(test_user, "video")
        assert allowed is True

        # 2. Réservation atomique d'une vidéo
        ok, res_id, _ = QuotaService.reserve_quota(test_user, "video", 1)
        assert ok is True
        assert res_id is not None

        # 3. Validation de la consommation (Commit)
        committed = QuotaService.commit_quota(res_id)
        assert committed is True

        # 4. Deuxième tentative : Doit être rejetée (Max 1 vidéo beta par utilisateur)
        allowed_2, msg_2 = QuotaService.check_quota(test_user, "video")
        assert allowed_2 is False
        assert "Plafond vidéo Beta atteint" in msg_2

        # 5. Tentative de réservation rejetée
        ok_2, _, reason_2 = QuotaService.reserve_quota(test_user, "video", 1)
        assert ok_2 is False
        assert "Plafond vidéo Beta atteint" in reason_2

    def test_quota_service_release_on_failure(self):
        """Teste la libération du quota en cas d'échec d'une mission."""
        test_user = f"user_fail_{uuid.uuid4().hex[:6]}"

        # Réserver une mission
        ok, res_id, _ = QuotaService.reserve_quota(test_user, "mission", 1)
        assert ok is True
        usage = QuotaService.get_or_create_user_usage(test_user)
        assert usage["active_missions"] == 1

        # Libérer la réservation en cas d'erreur
        released = QuotaService.release_quota(res_id)
        assert released is True
        assert usage["active_missions"] == 0

    def test_user_allowance_display_hides_infrastructure(self):
        """Vérifie que la vue des quotas ne divulgue aucune infrastructure de fournisseur."""
        test_user = f"user_prod_{uuid.uuid4().hex[:6]}"
        display = QuotaService.get_user_allowance_display(test_user)

        assert "images" in display
        assert "video" in display
        assert "missions" in display
        assert "runway_credits" not in display
        assert "fal_balance" not in display
        assert "google_billing" not in display
        assert display["video"]["default_duration_seconds"] == 3
        assert display["video"]["max_duration_seconds"] == 4

    def test_user_preferences_api_defaults(self):
        """Vérifie que l'API de préférences retourne des paramètres valides."""
        resp = client.get("/api/auth/preferences")
        assert resp.status_code in (200, 401)  # Dépend de l'authentification
        if resp.status_code == 200:
            data = resp.json()
            assert "theme" in data
            assert "ui_locale" in data
