"""
Ñkyel AI — MCP Tools Package · SmartANDJ AI Technologies
Auto-registers all MCP tools when imported.

Fondateur : Daniel Jonathan ANDJ
"""

# Import tool modules to trigger @registry.tool() registration
from mcp_integration.tools.tavily_tool import tavily_search  # noqa: F401

__all__ = ["tavily_search"]
