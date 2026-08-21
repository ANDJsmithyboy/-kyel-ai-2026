import pytest
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
from mcp_integration.clients.fetch_client import fetch_url_via_mcp

@pytest.mark.asyncio
async def test_fetch_url_allowed():
    # modelcontextprotocol.io is on the allowlist
    mock_result = MagicMock()
    mock_result.isError = False
    mock_item = MagicMock()
    mock_item.text = "# Model Context Protocol Intro\nDocumentation content"
    mock_result.content = [mock_item]

    mock_session = AsyncMock()
    mock_session.initialize.return_value = None
    mock_session.call_tool.return_value = mock_result

    with patch("mcp_integration.clients.fetch_client.stdio_client") as mock_stdio:
        mock_ctx = AsyncMock()
        mock_ctx.__aenter__.return_value = (MagicMock(), MagicMock())
        mock_stdio.return_value = mock_ctx

        with patch("mcp_integration.clients.fetch_client.ClientSession") as mock_cs:
            mock_sess_ctx = AsyncMock()
            mock_sess_ctx.__aenter__.return_value = mock_session
            mock_cs.return_value = mock_sess_ctx

            content = await fetch_url_via_mcp("https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro")
            assert content is not None
            assert "Error" not in content
            assert "Model Context Protocol" in content

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
