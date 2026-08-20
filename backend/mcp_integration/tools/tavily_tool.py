"""
Ñkyel AI — MCP Tavily Search Tool · SmartANDJ AI Technologies
Web search wrapped as an MCP-compatible tool with audit, permissions, and network allowlist.

Fondateur : Daniel Jonathan ANDJ
"""

import os
import logging
import httpx
from typing import List, Dict, Any
from urllib.parse import urlparse

from mcp_integration.registry import registry
from mcp_integration.security import MCPNetworkAllowlist

logger = logging.getLogger(__name__)

TAVILY_API_URL = "https://api.tavily.com/search"


@registry.tool(
    name="tavily_search",
    description="Search the web using Tavily API. Returns titles, URLs, snippets, and relevance scores.",
    permissions=["search:web"],
    input_schema={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Search query"},
            "max_results": {"type": "integer", "default": 5, "description": "Maximum results to return (1-10)"},
            "search_depth": {"type": "string", "default": "basic", "enum": ["basic", "advanced"]},
        },
        "required": ["query"],
    },
    timeout_seconds=30,
)
def tavily_search(
    query: str,
    max_results: int = 5,
    search_depth: str = "basic",
) -> List[Dict[str, Any]]:
    """
    Search the web using Tavily API.

    Returns a list of results, each containing:
    - title: str
    - url: str
    - content: str (snippet)
    - score: float
    """
    api_key = os.getenv("TAVILY_API_KEY", "")
    if not api_key:
        return [{
            "title": "Tavily API key not configured",
            "url": "",
            "content": "Set TAVILY_API_KEY in .env to enable web search.",
            "score": 0.0,
        }]

    # Network allowlist check
    target_host = urlparse(TAVILY_API_URL).hostname
    if not MCPNetworkAllowlist.is_allowed(target_host):
        logger.error(f"MCP Allowlist blocked outbound call to {target_host}")
        return [{
            "title": "Network blocked",
            "url": "",
            "content": f"Host '{target_host}' is not on the MCP network allowlist.",
            "score": 0.0,
        }]

    # Clamp max_results to sane bounds
    max_results = max(1, min(max_results, 10))

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                TAVILY_API_URL,
                json={
                    "api_key": api_key,
                    "query": query,
                    "max_results": max_results,
                    "search_depth": search_depth,
                    "include_answer": True,
                },
            )
            response.raise_for_status()
            data = response.json()

        results = []
        for r in data.get("results", []):
            results.append({
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "content": r.get("content", ""),
                "score": r.get("score", 0.0),
            })

        logger.info(f"Tavily search '{query[:50]}' returned {len(results)} results")
        return results

    except httpx.TimeoutException:
        logger.error(f"Tavily search timed out for query: {query[:80]}")
        return [{
            "title": "Search Timeout",
            "url": "",
            "content": "Web search timed out after 30 seconds. Please try again.",
            "score": 0.0,
        }]
    except Exception as e:
        logger.error(f"Tavily search error: {e}")
        return [{
            "title": "Search Error",
            "url": "",
            "content": f"Web search failed: {str(e)}",
            "score": 0.0,
        }]
