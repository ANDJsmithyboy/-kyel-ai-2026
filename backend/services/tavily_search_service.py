"""
Ñkyel AI — Tavily Search Service · SmartANDJ AI Technologies
Web search tool for the Ñkyel agent, wrapped as an MCP-compatible tool.

Fondateur : Daniel Jonathan ANDJ
"""

import os
import httpx
from typing import Optional


TAVILY_API_URL = "https://api.tavily.com/search"


def tavily_search(
    query: str,
    max_results: int = 5,
    search_depth: str = "basic",
    include_answer: bool = True,
) -> list[dict]:
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

    try:
        client = httpx.Client(timeout=30.0)
        response = client.post(
            TAVILY_API_URL,
            json={
                "api_key": api_key,
                "query": query,
                "max_results": max_results,
                "search_depth": search_depth,
                "include_answer": include_answer,
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

        return results

    except Exception as e:
        return [{
            "title": "Search Error",
            "url": "",
            "content": f"Web search failed: {str(e)}",
            "score": 0.0,
        }]
