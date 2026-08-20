import pytest
import asyncio
from mcp_integration.clients.fetch_client import fetch_url_via_mcp

@pytest.mark.asyncio
async def test_fetch_url_allowed():
    # modelcontextprotocol.io is on the allowlist
    content = await fetch_url_via_mcp("https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro")
    assert content is not None
    assert "Error" not in content

@pytest.mark.asyncio
async def test_fetch_url_blocked_domain():
    content = await fetch_url_via_mcp("https://example.com")
    assert "Error:" in content
    assert "not on the MCP network allowlist" in content

@pytest.mark.asyncio
async def test_fetch_url_blocked_localhost():
    content = await fetch_url_via_mcp("http://localhost:8000")
    assert "Error:" in content
    assert "Only HTTPS is allowed" in content
    
@pytest.mark.asyncio
async def test_fetch_url_blocked_localhost_https():
    content = await fetch_url_via_mcp("https://localhost:8000")
    assert "Error:" in content
    assert "Localhost is not allowed" in content
