import pytest
from httpx import AsyncClient, ASGITransport
import main


@pytest.mark.asyncio
async def test_capabilities_routes():
    transport = ASGITransport(app=main.app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Skills catalog
        res_skills = await ac.get("/api/v1/skills")
        assert res_skills.status_code == 200
        data_skills = res_skills.json()
        assert data_skills["success"] is True
        assert len(data_skills["skills"]) > 0

        # 2. MCP servers
        res_mcp = await ac.get("/api/v1/mcp/servers")
        assert res_mcp.status_code == 200
        data_mcp = res_mcp.json()
        assert data_mcp["success"] is True
        assert len(data_mcp["servers"]) >= 5

        # 3. Connectors
        res_conn = await ac.get("/api/v1/connectors")
        assert res_conn.status_code == 200
        data_conn = res_conn.json()
        assert data_conn["success"] is True
        assert len(data_conn["connectors"]) >= 6

        # 4. Programs
        res_prog = await ac.get("/api/v1/programs")
        assert res_prog.status_code == 200
        data_prog = res_prog.json()
        assert data_prog["success"] is True
        assert len(data_prog["programs"]) >= 3
