"""
Ñkyel AI — Tavily Search Service · SmartANDJ AI Technologies
Web search tool for the Ñkyel agent with multi-key pool rotation.

Fondateur : Daniel Jonathan ANDJ
"""

import os
import httpx
from typing import Optional, List
from core.config import settings

TAVILY_API_URL = "https://api.tavily.com/search"
_tavily_key_index = 0


def get_tavily_keys() -> List[str]:
    """Returns the ordered list of Tavily keys for rotation and fallback."""
    pool = settings.tavily_keys_pool
    if pool:
        return pool
    env_keys = os.getenv("TAVILY_API_KEYS", "")
    if env_keys:
        return [k.strip() for k in env_keys.split(",") if k.strip()]
    single_key = os.getenv("TAVILY_API_KEY", "") or settings.tavily_api_key or ""
    return [single_key] if single_key else []


def tavily_search(
    query: str,
    max_results: int = 5,
    search_depth: str = "basic",
    include_answer: bool = True,
) -> list[dict]:
    """
    Search the web using Tavily API with multi-key rotation and automatic fallback.

    Returns a list of results, each containing:
    - title: str
    - url: str
    - content: str (snippet)
    - score: float
    """
    global _tavily_key_index
    keys = get_tavily_keys()

    if not keys:
        return [{
            "title": "Tavily API key not configured",
            "url": "",
            "content": "Set TAVILY_API_KEY or TAVILY_API_KEYS in .env to enable web search.",
            "score": 0.0,
        }]

    # Try rotating starting from current index
    start_idx = _tavily_key_index % len(keys)
    _tavily_key_index += 1

    last_exception = None

    for attempt in range(len(keys)):
        idx = (start_idx + attempt) % len(keys)
        api_key = keys[idx]

        try:
            with httpx.Client(timeout=30.0) as client:
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
            last_exception = e
            continue

    return [{
        "title": "Search Error",
        "url": "",
        "content": f"Web search failed across all configured Tavily keys: {str(last_exception)}",
        "score": 0.0,
    }]
