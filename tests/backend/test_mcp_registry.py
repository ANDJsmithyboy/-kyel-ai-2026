"""
Ñkyel AI — MCP Registry & Security Tests
Tests for backend/mcp/registry.py and backend/mcp/security.py

Vérifie :
- Enregistrement d'outil via @registry.tool()
- Exécution avec contrôle de permissions
- Rate limiting
- Validation d'input JSON schema
- Network allowlist
- Audit logging
"""

import os
import sys
import time
import pytest

# Ensure backend is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))


# ─── Security Tests ─────────────────────────────────────

class TestMCPPermissionGate:
    def test_admin_has_wildcard(self):
        from mcp.security import MCPPermissionGate
        
        perms = MCPPermissionGate.get_permissions_for_role("admin")
        assert "*" in perms

    def test_user_has_search_web(self):
        from mcp.security import MCPPermissionGate
        
        perms = MCPPermissionGate.get_permissions_for_role("user")
        assert "search:web" in perms

    def test_unknown_role_gets_anonymous(self):
        from mcp.security import MCPPermissionGate
        
        perms = MCPPermissionGate.get_permissions_for_role("hacker")
        anonymous_perms = MCPPermissionGate.get_permissions_for_role("anonymous")
        assert perms == anonymous_perms

    def test_wildcard_grants_all(self):
        from mcp.security import MCPPermissionGate
        
        assert MCPPermissionGate.check_permission(["search:web", "file:write"], ["*"]) is True

    def test_missing_permission_denied(self):
        from mcp.security import MCPPermissionGate
        
        assert MCPPermissionGate.check_permission(["file:write"], ["search:web"]) is False

    def test_empty_required_always_passes(self):
        from mcp.security import MCPPermissionGate
        
        assert MCPPermissionGate.check_permission([], []) is True


class TestMCPNetworkAllowlist:
    def test_tavily_is_allowed(self):
        from mcp.security import MCPNetworkAllowlist
        
        assert MCPNetworkAllowlist.is_allowed("api.tavily.com") is True

    def test_random_host_blocked(self):
        from mcp.security import MCPNetworkAllowlist
        
        assert MCPNetworkAllowlist.is_allowed("evil-server.xyz") is False

    def test_add_and_remove_host(self):
        from mcp.security import MCPNetworkAllowlist
        
        MCPNetworkAllowlist.add_host("custom.api.test")
        assert MCPNetworkAllowlist.is_allowed("custom.api.test") is True
        
        MCPNetworkAllowlist.remove_host("custom.api.test")
        assert MCPNetworkAllowlist.is_allowed("custom.api.test") is False

    def test_case_insensitive(self):
        from mcp.security import MCPNetworkAllowlist
        
        assert MCPNetworkAllowlist.is_allowed("API.TAVILY.COM") is True


class TestMCPRateLimiter:
    def test_allows_under_limit(self):
        from mcp.security import MCPRateLimiter
        
        limiter = MCPRateLimiter(max_calls=5, window_seconds=60)
        for _ in range(5):
            assert limiter.is_allowed("user1", "test_tool") is True

    def test_blocks_over_limit(self):
        from mcp.security import MCPRateLimiter
        
        limiter = MCPRateLimiter(max_calls=3, window_seconds=60)
        for _ in range(3):
            limiter.is_allowed("user2", "test_tool")
        
        assert limiter.is_allowed("user2", "test_tool") is False

    def test_remaining_count(self):
        from mcp.security import MCPRateLimiter
        
        limiter = MCPRateLimiter(max_calls=5, window_seconds=60)
        assert limiter.remaining("user3", "test_tool") == 5
        
        limiter.is_allowed("user3", "test_tool")
        assert limiter.remaining("user3", "test_tool") == 4

    def test_different_users_isolated(self):
        from mcp.security import MCPRateLimiter
        
        limiter = MCPRateLimiter(max_calls=2, window_seconds=60)
        limiter.is_allowed("alice", "tool")
        limiter.is_allowed("alice", "tool")
        
        # Alice is at limit
        assert limiter.is_allowed("alice", "tool") is False
        # Bob is fresh
        assert limiter.is_allowed("bob", "tool") is True


class TestMCPInputValidator:
    def test_valid_input(self):
        from mcp.security import MCPInputValidator
        
        schema = {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "max_results": {"type": "integer"},
            },
            "required": ["query"],
        }
        result = MCPInputValidator.validate({"query": "test", "max_results": 5}, schema)
        assert result is None

    def test_missing_required_field(self):
        from mcp.security import MCPInputValidator
        
        schema = {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        }
        result = MCPInputValidator.validate({}, schema)
        assert result is not None
        assert "query" in result

    def test_wrong_type(self):
        from mcp.security import MCPInputValidator
        
        schema = {
            "type": "object",
            "properties": {"max_results": {"type": "integer"}},
            "required": [],
        }
        result = MCPInputValidator.validate({"max_results": "not_a_number"}, schema)
        assert result is not None
        assert "integer" in result

    def test_enum_validation(self):
        from mcp.security import MCPInputValidator
        
        schema = {
            "type": "object",
            "properties": {
                "depth": {"type": "string", "enum": ["basic", "advanced"]},
            },
        }
        assert MCPInputValidator.validate({"depth": "basic"}, schema) is None
        assert MCPInputValidator.validate({"depth": "invalid"}, schema) is not None


# ─── Registry Tests ──────────────────────────────────────

class TestMCPRegistry:
    def test_register_and_list(self):
        from mcp.registry import MCPToolRegistry
        
        reg = MCPToolRegistry()
        
        @reg.tool(name="echo", description="Echoes input", permissions=[])
        def echo(text: str) -> str:
            return text
        
        tools = reg.list_tools()
        assert len(tools) == 1
        assert tools[0]["name"] == "echo"

    def test_execute_success(self):
        from mcp.registry import MCPToolRegistry
        
        reg = MCPToolRegistry()
        
        @reg.tool(name="add", description="Add two numbers", permissions=[])
        def add(a: int, b: int) -> int:
            return a + b
        
        result = reg.execute("add", {"a": 3, "b": 4}, user_context={"user_id": "test", "role": "admin"})
        assert result["success"] is True
        assert result["result"] == 7

    def test_execute_tool_not_found(self):
        from mcp.registry import MCPToolRegistry
        
        reg = MCPToolRegistry()
        result = reg.execute("nonexistent", {})
        assert result["success"] is False
        assert "not found" in result["error"]

    def test_execute_permission_denied(self):
        from mcp.registry import MCPToolRegistry
        
        reg = MCPToolRegistry()
        
        @reg.tool(name="admin_tool", description="Admin only", permissions=["admin:secret"])
        def admin_tool() -> str:
            return "secret"
        
        result = reg.execute("admin_tool", {}, user_context={"user_id": "user", "role": "demo"})
        assert result["success"] is False
        assert "Permission denied" in result["error"]

    def test_execute_with_input_validation(self):
        from mcp.registry import MCPToolRegistry
        
        reg = MCPToolRegistry()
        
        @reg.tool(
            name="validated",
            description="Validated tool",
            permissions=[],
            input_schema={
                "type": "object",
                "properties": {"name": {"type": "string"}},
                "required": ["name"],
            },
        )
        def validated(name: str) -> str:
            return f"Hello {name}"
        
        # Missing required field
        result = reg.execute("validated", {}, user_context={"user_id": "test", "role": "admin"})
        assert result["success"] is False
        assert "validation" in result["error"].lower()
        
        # Valid input
        result = reg.execute("validated", {"name": "Ñkyel"}, user_context={"user_id": "test", "role": "admin"})
        assert result["success"] is True
        assert result["result"] == "Hello Ñkyel"

    def test_audit_log_recorded(self):
        from mcp.registry import MCPToolRegistry
        
        reg = MCPToolRegistry()
        
        @reg.tool(name="logged", description="Logged tool", permissions=[])
        def logged() -> str:
            return "ok"
        
        reg.execute("logged", {}, user_context={"user_id": "auditor", "role": "admin"})
        
        logs = reg.get_audit_log()
        assert len(logs) >= 1
        assert logs[-1]["user_id"] == "auditor"
        assert logs[-1]["success"] is True
