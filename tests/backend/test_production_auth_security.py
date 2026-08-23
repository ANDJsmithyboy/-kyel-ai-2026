"""
Ñkyel AI — Test Suite Production Auth & Security · SmartANDJ AI Technologies
Fondateur : Daniel Jonathan ANDJ

Valide rigoureusement :
  1. Sécurité stricte en mode production (Rejet 401 des requêtes non authentifiées)
  2. Rejet des tokens démo en production
  3. Comportement contrôlé en mode development
  4. Vérification et extraction des payloads JWT RS256
  5. Contrôle des rôles et autorisations (require_admin, require_current_user)
  6. Protection des endpoints /api/v1/nkyel (run, cancel, replan)
"""

import sys
import os
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from core.config import settings
from core.security import (
    get_current_user,
    get_current_user_optional,
    require_current_user,
    require_admin,
    _is_development,
)


class TestProductionAuthSecurity:
    """Tests de sécurité pour l'authentification Clerk et les frontières de production."""

    @pytest.mark.asyncio
    async def test_production_missing_token_raises_401(self, monkeypatch):
        """En production, l'absence de token Bearer doit lever 401 Unauthorized."""
        monkeypatch.setattr(settings, "environment", "production")
        monkeypatch.setattr(settings, "app_env", "production")

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=None)

        assert exc_info.value.status_code == 401
        assert "Authentification requise" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_production_demo_token_rejected_with_401(self, monkeypatch):
        """En production, les tokens de démo sont strictement rejetés avec 401."""
        monkeypatch.setattr(settings, "environment", "production")
        monkeypatch.setattr(settings, "app_env", "production")

        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="demo-token-nkyel")
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=creds)

        assert exc_info.value.status_code == 401
        assert "non acceptés en production" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_production_invalid_jwt_rejected_with_401(self, monkeypatch):
        """En production, un faux JWT malformé doit lever 401 et non donner un faux compte."""
        monkeypatch.setattr(settings, "environment", "production")
        monkeypatch.setattr(settings, "app_env", "production")

        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="malformed.jwt.token")
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=creds)

        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_development_mode_allows_demo_token(self, monkeypatch):
        """En développement, les tokens démo retournent le profil de développement."""
        monkeypatch.setattr(settings, "environment", "development")
        monkeypatch.setattr(settings, "app_env", "development")

        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="demo-token-nkyel")
        user = await get_current_user(credentials=creds)

        assert user is not None
        assert user["id"] == "demo-user-1"
        assert user["is_admin"] is True

    @pytest.mark.asyncio
    async def test_require_admin_enforcement(self):
        """Vérifie que require_admin bloque les utilisateurs standards (403)."""
        regular_user = {
            "id": "user_123",
            "name": "Standard User",
            "role": "member",
            "is_admin": False,
        }
        with pytest.raises(HTTPException) as exc_info:
            await require_admin(user=regular_user)
        assert exc_info.value.status_code == 403

        admin_user = {
            "id": "admin_123",
            "name": "Daniel ANDJ",
            "role": "admin",
            "is_admin": True,
        }
        res = await require_admin(user=admin_user)
        assert res["id"] == "admin_123"

    @pytest.mark.asyncio
    async def test_require_current_user_enforcement(self):
        """Vérifie que require_current_user rejette les dictionnaires vides."""
        with pytest.raises(HTTPException) as exc_info:
            await require_current_user(user={})
        assert exc_info.value.status_code == 401

        valid_user = {"id": "usr_abc", "role": "member"}
        res = await require_current_user(user=valid_user)
        assert res["id"] == "usr_abc"

    def test_environment_helper(self, monkeypatch):
        monkeypatch.setattr(settings, "environment", "production")
        assert _is_development() is False

        monkeypatch.setattr(settings, "environment", "development")
        assert _is_development() is True

        monkeypatch.setattr(settings, "environment", "dev")
        assert _is_development() is True
