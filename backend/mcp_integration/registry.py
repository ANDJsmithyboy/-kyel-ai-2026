"""
Ñkyel AI — MCP Tool Registry · SmartANDJ AI Technologies
Central registry for all MCP-compatible tools.

Implements:
- Tool registration via decorator
- Permission-gated execution
- Input validation via JSON schema
- Audit logging for every call

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import time
import uuid
import json
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass, field

from mcp_integration.security import MCPPermissionGate, MCPInputValidator, MCPNetworkAllowlist, rate_limiter, create_audit_log


# ─── Tool Definition ────────────────────────────────────

@dataclass
class MCPToolDefinition:
    """Describes an MCP-compatible tool."""
    name: str
    description: str
    permissions: List[str] = field(default_factory=list)
    input_schema: Dict[str, Any] = field(default_factory=dict)
    handler: Optional[Callable] = None
    version: str = "1.0.0"
    timeout_seconds: int = 30
    requires_approval: bool = False


# ─── Tool Registry ──────────────────────────────────────

class MCPToolRegistry:
    """
    Central registry for MCP tools.
    
    Usage:
        registry = MCPToolRegistry()
        
        @registry.tool(
            name="tavily_search",
            description="Search the web via Tavily API",
            permissions=["search:web"],
        )
        def tavily_search(query: str, max_results: int = 5) -> list:
            ...
        
        result = registry.execute(
            "tavily_search",
            {"query": "Ñkyel AI", "max_results": 3},
            user_context={"user_id": "demo", "role": "user"},
        )
    """

    def __init__(self):
        self._tools: Dict[str, MCPToolDefinition] = {}
        self._audit_log: List[Dict[str, Any]] = []

    def tool(
        self,
        name: str,
        description: str,
        permissions: Optional[List[str]] = None,
        input_schema: Optional[Dict[str, Any]] = None,
        timeout_seconds: int = 30,
        requires_approval: bool = False,
    ) -> Callable:
        """Decorator to register a tool."""
        def decorator(fn: Callable) -> Callable:
            tool_def = MCPToolDefinition(
                name=name,
                description=description,
                permissions=permissions or [],
                input_schema=input_schema or {},
                handler=fn,
                timeout_seconds=timeout_seconds,
                requires_approval=requires_approval,
            )
            self._tools[name] = tool_def
            return fn
        return decorator

    def register(self, tool_def: MCPToolDefinition) -> None:
        """Register a tool definition directly."""
        self._tools[tool_def.name] = tool_def

    def get_tool(self, name: str) -> Optional[MCPToolDefinition]:
        """Get a tool definition by name."""
        return self._tools.get(name)

    def list_tools(self) -> List[Dict[str, Any]]:
        """List all registered tools with their metadata."""
        return [
            {
                "name": t.name,
                "description": t.description,
                "permissions": t.permissions,
                "input_schema": t.input_schema,
                "version": t.version,
                "requires_approval": t.requires_approval,
            }
            for t in self._tools.values()
        ]

    def execute(
        self,
        tool_name: str,
        params: Dict[str, Any],
        user_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Execute a tool with permission checks and audit logging.
        
        Returns:
            {
                "success": bool,
                "result": Any,
                "tool": str,
                "duration_ms": int,
                "audit_id": str,
                "error": Optional[str],
            }
        """
        audit_id = f"audit_{uuid.uuid4().hex[:8]}"
        start = time.time()
        user_id = (user_context or {}).get("user_id", "anonymous")
        user_role = (user_context or {}).get("role", "anonymous")

        def _fail(error: str) -> Dict[str, Any]:
            duration_ms = int((time.time() - start) * 1000)
            self._log_audit(audit_id, tool_name, user_id, False, error)
            return {"success": False, "result": None, "tool": tool_name, "duration_ms": duration_ms, "audit_id": audit_id, "error": error}

        # 1. Check tool exists
        tool_def = self._tools.get(tool_name)
        if not tool_def:
            return _fail(f"Tool '{tool_name}' not found in registry")

        # 2. Check permissions
        user_permissions = MCPPermissionGate.get_permissions_for_role(user_role)
        if not MCPPermissionGate.check_permission(tool_def.permissions, user_permissions):
            return _fail(f"Permission denied: {tool_def.permissions} required, user has {user_permissions}")

        # 3. Rate limit check
        if not rate_limiter.is_allowed(user_id, tool_name):
            return _fail(f"Rate limit exceeded for tool '{tool_name}'")

        # 4. Input validation
        if tool_def.input_schema:
            validation_error = MCPInputValidator.validate(params, tool_def.input_schema)
            if validation_error:
                return _fail(f"Input validation failed: {validation_error}")

        # 5. Check approval required
        if tool_def.requires_approval:
            # In P0, just log it. In P1, this would emit an approval.requested event.
            pass

        # 6. Execute
        try:
            if tool_def.handler is None:
                raise ValueError(f"Tool '{tool_name}' has no handler")
            result = tool_def.handler(**params)
            duration_ms = int((time.time() - start) * 1000)
            self._log_audit(audit_id, tool_name, user_id, True)
            return {
                "success": True,
                "result": result,
                "tool": tool_name,
                "duration_ms": duration_ms,
                "audit_id": audit_id,
                "error": None,
            }
        except Exception as e:
            duration_ms = int((time.time() - start) * 1000)
            error = str(e)
            self._log_audit(audit_id, tool_name, user_id, False, error)
            return {
                "success": False,
                "result": None,
                "tool": tool_name,
                "duration_ms": duration_ms,
                "audit_id": audit_id,
                "error": error,
            }

    def get_audit_log(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent audit log entries."""
        return self._audit_log[-limit:]

    def _log_audit(self, audit_id: str, tool_name: str, user_id: str, success: bool, error: str = None) -> None:
        """Record an audit entry."""
        entry = create_audit_log(tool_name, user_id, success, error)
        entry["audit_id"] = audit_id
        self._audit_log.append(entry)


# ─── Singleton instance ─────────────────────────────────
registry = MCPToolRegistry()
