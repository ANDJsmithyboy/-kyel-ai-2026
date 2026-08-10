# FILE: gaboma-api/tests/test_gateway_contract.py
import pytest
from httpx import ASGITransport, AsyncClient

from main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_root_healthcheck(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert "GabomaGPT" in body["service"]


@pytest.mark.asyncio
async def test_api_healthcheck(client: AsyncClient):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"


@pytest.mark.asyncio
async def test_tiers_branding_no_third_party(client: AsyncClient):
    """Vérifie qu'aucun nom de fournisseur IA tiers n'apparaît dans les tiers.
    'gpt' est accepté car il fait partie du nom de marque 'GabomaGPT'.
    On vérifie les noms de fournisseurs complets, pas les sous-chaînes.
    """
    resp = await client.get("/api/tiers")
    assert resp.status_code == 200
    tiers = resp.json()
    import re
    forbidden_patterns = [
        r"\bopenai\b", r"\bchatgpt\b", r"\bclaude\b", r"\banthropic\b",
        r"\bllama\b", r"\bgroq\b", r"\bmistral\b", r"\bgemini\b",
    ]
    for tier in tiers:
        name = tier["display_name"].lower()
        for pattern in forbidden_patterns:
            assert not re.search(pattern, name), (
                f"Tier '{tier['display_name']}' contient un nom tiers via le pattern {pattern}"
            )


@pytest.mark.asyncio
async def test_chat_response_branding(client: AsyncClient):
    resp = await client.post(
        "/api/chat",
        json={
            "message": "Bonjour",
            "model": "flash",
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "GabomaGPT" in body["display_name"]
    assert body["model"] == "flash"


@pytest.mark.asyncio
async def test_payment_phone_format(client: AsyncClient):
    resp = await client.post(
        "/api/payments/initiate",
        json={
            "phone": "0612345678",
            "operator": "airtel",
            "target_tier": "pro",
            "amount_xaf": 2500,
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "pending"
    assert body["amount_xaf"] == 2500


@pytest.mark.asyncio
async def test_payment_phone_invalid(client: AsyncClient):
    resp = await client.post(
        "/api/payments/initiate",
        json={
            "phone": "1234",
            "operator": "airtel",
            "target_tier": "pro",
            "amount_xaf": 2500,
        },
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_auth_login_contract(client: AsyncClient):
    resp = await client.post(
        "/api/auth/login",
        json={
            "phone": "0612345678",
            "password": "SecurePass123",
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["access_token"].startswith("dev-token-")
    assert body["token_type"] == "bearer"
    assert body["user_id"]
    assert body["full_name"]


@pytest.mark.asyncio
async def test_auth_register_contract(client: AsyncClient):
    resp = await client.post(
        "/api/auth/register",
        json={
            "full_name": "Daniel ANDJ",
            "phone": "0712345678",
            "password": "SecurePass123",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["access_token"].startswith("dev-token-")
    assert body["token_type"] == "bearer"
    assert body["user_id"]
    assert body["full_name"] == "Daniel ANDJ"


@pytest.mark.asyncio
async def test_chat_stream_sse_contract(client: AsyncClient):
    """Vérifie que le stream SSE renvoie les événements attendus."""
    resp = await client.get("/api/chat/stream?message=Mbolo&model=flash")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/event-stream")
    raw = resp.text
    assert "event: session" in raw
    assert "event: model" in raw
    assert "event: token" in raw
    assert "event: done" in raw
    assert "GabomaGPT" in raw
