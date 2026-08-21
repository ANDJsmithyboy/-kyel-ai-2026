"""
Ñkyel AI — MCP Security · SmartANDJ AI Technologies
Allowlist, Permission Gate, Rate Limiter, and Network Controls for MCP tools.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import time
import logging
from typing import List, Dict, Any, Optional
from collections import defaultdict

logger = logging.getLogger(__name__)


# ─── Role-Based Permission Gate ────────────────────────────

class MCPPermissionGate:
    """Validates user permissions against tool requirements."""

    # Role → list of granted permission strings
    ROLE_PERMISSIONS: Dict[str, List[str]] = {
        "admin": ["*"],
        "user": [
            "search:web",
            "file:read",
            "events:read",
            "media:generate",
            "media:edit",
            "media:brand",
            "media:stock",
            "media:video",
            "media:analysis",
            "media:content",
        ],
        "demo": [
            "search:web",
            "media:generate",
            "media:edit",
            "media:brand",
            "media:stock",
            "media:video",
            "media:analysis",
            "media:content",
        ],
        "anonymous": [
            "search:web",
            "media:generate",
            "media:edit",
            "media:brand",
            "media:stock",
            "media:video",
            "media:analysis",
            "media:content",
        ],
    }

    @classmethod
    def get_permissions_for_role(cls, role: str) -> List[str]:
        return cls.ROLE_PERMISSIONS.get(role, cls.ROLE_PERMISSIONS["anonymous"])

    @classmethod
    def check_permission(cls, required_permissions: List[str], user_permissions: List[str]) -> bool:
        """Return True if user_permissions satisfy all required_permissions."""
        if not required_permissions:
            return True
        if "*" in user_permissions:
            return True
        for req_perm in required_permissions:
            if req_perm not in user_permissions:
                return False
        return True


# ─── Network Allowlist ─────────────────────────────────────

class MCPNetworkAllowlist:
    """
    Controls which external hosts MCP tools are allowed to contact.
    Any tool making outbound HTTP calls MUST have its target host listed here.
    """

    ALLOWED_HOSTS: List[str] = [
        "api.tavily.com",
        "generativelanguage.googleapis.com",
        "api.groq.com",
        "api.clerk.com",
        "api.sentry.io",
        "api.cloudflare.com",
        "gen.pollinations.ai",
        "api.pexels.com",
        "pixabay.com",
        "modelcontextprotocol.io",
        "a2a-protocol.org",
        "docs.ag-ui.com",
    ]


    @classmethod
    def is_allowed(cls, host: str) -> bool:
        """Check if a host is on the allowlist."""
        host_clean = host.lower().strip()
        return host_clean in cls.ALLOWED_HOSTS

    @classmethod
    def add_host(cls, host: str) -> None:
        """Add a host to the allowlist at runtime (admin only)."""
        host_clean = host.lower().strip()
        if host_clean not in cls.ALLOWED_HOSTS:
            cls.ALLOWED_HOSTS.append(host_clean)
            logger.info(f"MCP Allowlist: added {host_clean}")

    @classmethod
    def remove_host(cls, host: str) -> None:
        """Remove a host from the allowlist."""
        host_clean = host.lower().strip()
        if host_clean in cls.ALLOWED_HOSTS:
            cls.ALLOWED_HOSTS.remove(host_clean)
            logger.info(f"MCP Allowlist: removed {host_clean}")

    @classmethod
    def list_hosts(cls) -> List[str]:
        return list(cls.ALLOWED_HOSTS)


# ─── Rate Limiter ──────────────────────────────────────────

class MCPRateLimiter:
    """
    Simple sliding-window rate limiter per user per tool.
    Prevents abuse of expensive external API calls.
    """

    def __init__(self, max_calls: int = 30, window_seconds: int = 60):
        self.max_calls = max_calls
        self.window_seconds = window_seconds
        # key: (user_id, tool_name) → list of timestamps
        self._call_log: Dict[tuple, List[float]] = defaultdict(list)

    def is_allowed(self, user_id: str, tool_name: str) -> bool:
        """Check if the user is within the rate limit for this tool."""
        key = (user_id, tool_name)
        now = time.time()
        cutoff = now - self.window_seconds

        # Prune old entries
        self._call_log[key] = [t for t in self._call_log[key] if t > cutoff]

        if len(self._call_log[key]) >= self.max_calls:
            logger.warning(f"MCP RateLimit: {user_id} exceeded {self.max_calls} calls/{self.window_seconds}s on {tool_name}")
            return False

        self._call_log[key].append(now)
        return True

    def remaining(self, user_id: str, tool_name: str) -> int:
        """How many calls remain in the current window."""
        key = (user_id, tool_name)
        now = time.time()
        cutoff = now - self.window_seconds
        recent = [t for t in self._call_log.get(key, []) if t > cutoff]
        return max(0, self.max_calls - len(recent))


# Singleton rate limiter (30 calls / 60 sec per user per tool)
rate_limiter = MCPRateLimiter(max_calls=30, window_seconds=60)


# ─── Input Validator ───────────────────────────────────────

class MCPInputValidator:
    """
    Basic JSON-schema-like input validator for tool parameters.
    Checks required fields and types.
    """

    @staticmethod
    def validate(params: Dict[str, Any], schema: Dict[str, Any]) -> Optional[str]:
        """
        Validate params against schema.
        Returns None if valid, or a string error message.
        """
        if not schema:
            return None

        properties = schema.get("properties", {})
        required = schema.get("required", [])

        # Check required fields
        for field in required:
            if field not in params:
                return f"Missing required field: '{field}'"

        # Type checking
        type_map = {
            "string": str,
            "integer": int,
            "number": (int, float),
            "boolean": bool,
            "array": list,
            "object": dict,
        }

        for field_name, field_schema in properties.items():
            if field_name not in params:
                continue
            expected_type_str = field_schema.get("type")
            if expected_type_str and expected_type_str in type_map:
                expected_type = type_map[expected_type_str]
                if not isinstance(params[field_name], expected_type):
                    return f"Field '{field_name}' must be of type {expected_type_str}, got {type(params[field_name]).__name__}"

            # Enum validation
            enum_values = field_schema.get("enum")
            if enum_values and params[field_name] not in enum_values:
                return f"Field '{field_name}' must be one of {enum_values}, got '{params[field_name]}'"

        return None


# ─── Audit Logger ──────────────────────────────────────────

def create_audit_log(tool_name: str, user_id: str, success: bool, error: str = None) -> Dict[str, Any]:
    """Generate an audit log entry for tool execution."""
    log: Dict[str, Any] = {
        "timestamp": time.time(),
        "tool": tool_name,
        "user_id": user_id,
        "success": success,
    }
    if error:
        log["error"] = error
    return log
