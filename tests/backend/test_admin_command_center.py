"""
Ñkyel AI — Tests E2E de l'Admin Command Center (Section 40-104)
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from core.security import create_access_token


@pytest_asyncio.fixture
async def admin_client():
    token = create_access_token({
        "sub": "admin-1",
        "email": "jonathanakarentoutoume@gmail.com",
        "role": "admin"
    })
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        client.headers.update({"Authorization": f"Bearer {token}"})
        yield client


@pytest.mark.asyncio
async def test_admin_overview_endpoint(admin_client: AsyncClient):
    res = await admin_client.get("/v1/admin/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["system_status"] == "Healthy"
    assert "health_matrix" in data
    assert "google_gemini" in data["health_matrix"]


@pytest.mark.asyncio
async def test_admin_providers_and_secret_masking(admin_client: AsyncClient):
    # 1. Lister les fournisseurs
    res = await admin_client.get("/v1/admin/providers")
    assert res.status_code == 200
    providers = res.json()
    assert len(providers) >= 30
    
    # Vérifier que les clés en clair ne sont JAMAIS renvoyées
    for p in providers:
        if p["credential_masked"]:
            assert "sk-" not in p["credential_masked"] or "••••" in p["credential_masked"]

    # 2. Mettre à jour un fournisseur
    update_res = await admin_client.post(
        "/v1/admin/providers/openai",
        json={"is_enabled": True, "api_key": "sk-test-secret-key-1234567890"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["credential_masked"] == "sk-••••••••7890"


@pytest.mark.asyncio
async def test_admin_routing_matrix(admin_client: AsyncClient):
    res = await admin_client.get("/v1/admin/routing")
    assert res.status_code == 200
    matrix = res.json()
    assert "FAST" in matrix or "fast" in matrix
    assert "DEEP" in matrix or "deep" in matrix
    assert "CODE" in matrix or "code" in matrix


@pytest.mark.asyncio
async def test_admin_tools_and_skills(admin_client: AsyncClient):
    # 1. Tools
    res_tools = await admin_client.get("/v1/admin/tools")
    assert res_tools.status_code == 200
    assert len(res_tools.json()) >= 3

    # 2. Skills
    res_skills = await admin_client.get("/v1/admin/skills")
    assert res_skills.status_code == 200
    assert len(res_skills.json()) >= 2


@pytest.mark.asyncio
async def test_admin_feature_flags_and_maintenance_mode(admin_client: AsyncClient):
    # 1. Feature flag toggle
    res_flag = await admin_client.post(
        "/v1/admin/feature-flags/wide_intelligence",
        json={"enabled": True, "scope": "everyone", "rollout_pct": 100}
    )
    assert res_flag.status_code == 200

    # 2. Maintenance mode update
    res_settings = await admin_client.post(
        "/v1/admin/settings",
        json={"maintenance_mode": False}
    )
    assert res_settings.status_code == 200
    assert res_settings.json()["maintenance_mode"] is False


@pytest.mark.asyncio
async def test_admin_audit_logs(admin_client: AsyncClient):
    res = await admin_client.get("/v1/admin/audit-logs")
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) >= 1
    assert logs[0]["actor_email"] == "jonathanakarentoutoume@gmail.com"
