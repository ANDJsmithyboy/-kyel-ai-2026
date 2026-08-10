# GabomaGPT · search.py · SmartANDJ AI Technologies
# Tavily Search + Semantic Redis Cache
# Fondateur: Daniel Jonathan ANDJ

import os
import json
import hashlib
import logging
import time
from typing import Optional, List, Dict, Any

import httpx
import redis.asyncio as redis

log = logging.getLogger(__name__)

# ============================================================
# Configuration
# ============================================================

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
TAVILY_BASE_URL = "https://api.tavily.com"
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CACHE_TTL = int(os.getenv("SEARCH_CACHE_TTL", "3600"))  # 1 heure par défaut
CACHE_PREFIX = "gabomagpt:search:"

# ============================================================
# Redis Semantic Cache
# ============================================================

_redis_pool: Optional[redis.Redis] = None


async def get_redis() -> Optional[redis.Redis]:
    """Connexion Redis lazy avec pool de connexions."""
    global _redis_pool
    if _redis_pool is None:
        try:
            _redis_pool = redis.from_url(
                REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                retry_on_timeout=True,
            )
            await _redis_pool.ping()
            log.info("GabomaGPT Search: Redis connecté")
        except Exception as e:
            log.warning(f"GabomaGPT Search: Redis indisponible — {e}")
            _redis_pool = None
    return _redis_pool


def _cache_key(query: str) -> str:
    """Génère une clé de cache déterministe pour une requête."""
    normalized = query.strip().lower()
    h = hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:16]
    return f"{CACHE_PREFIX}{h}"


async def get_cached_results(query: str) -> Optional[List[Dict[str, Any]]]:
    """Récupère les résultats depuis le cache Redis."""
    r = await get_redis()
    if r is None:
        return None
    try:
        key = _cache_key(query)
        cached = await r.get(key)
        if cached:
            log.info(f"GabomaGPT Search: Cache HIT pour '{query[:50]}...'")
            return json.loads(cached)
    except Exception as e:
        log.warning(f"GabomaGPT Search: Erreur cache GET — {e}")
    return None


async def set_cached_results(query: str, results: List[Dict[str, Any]]) -> None:
    """Stocke les résultats dans le cache Redis avec TTL."""
    r = await get_redis()
    if r is None:
        return
    try:
        key = _cache_key(query)
        await r.setex(key, CACHE_TTL, json.dumps(results, ensure_ascii=False))
        log.info(f"GabomaGPT Search: Cache SET pour '{query[:50]}...' (TTL={CACHE_TTL}s)")
    except Exception as e:
        log.warning(f"GabomaGPT Search: Erreur cache SET — {e}")


# ============================================================
# Tavily Search API
# ============================================================

async def tavily_search(
    query: str,
    max_results: int = 5,
    search_depth: str = "basic",
    include_domains: Optional[List[str]] = None,
    exclude_domains: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Recherche Tavily avec cache Redis sémantique.

    Args:
        query: Requête de recherche
        max_results: Nombre max de résultats (1-10)
        search_depth: 'basic' ou 'advanced'
        include_domains: Domaines à privilégier
        exclude_domains: Domaines à exclure

    Returns:
        Liste de résultats [{title, url, content, score}]
    """
    if not TAVILY_API_KEY:
        log.warning("GabomaGPT Search: TAVILY_API_KEY non configurée")
        return []

    # Vérifie le cache d'abord
    cached = await get_cached_results(query)
    if cached is not None:
        return cached

    # Appel API Tavily
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "max_results": min(max_results, 10),
        "search_depth": search_depth,
        "include_answer": True,
    }

    if include_domains:
        payload["include_domains"] = include_domains
    if exclude_domains:
        payload["exclude_domains"] = exclude_domains

    start = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{TAVILY_BASE_URL}/search", json=payload)
            resp.raise_for_status()
            data = resp.json()
    except httpx.TimeoutException:
        log.error("GabomaGPT Search: Tavily timeout (15s)")
        return []
    except httpx.HTTPStatusError as e:
        log.error(f"GabomaGPT Search: Tavily HTTP {e.response.status_code}")
        return []
    except Exception as e:
        log.error(f"GabomaGPT Search: Tavily erreur — {e}")
        return []

    elapsed = time.monotonic() - start
    log.info(f"GabomaGPT Search: Tavily répondu en {elapsed:.2f}s")

    results = []
    for item in data.get("results", []):
        results.append({
            "title": item.get("title", ""),
            "url": item.get("url", ""),
            "content": item.get("content", ""),
            "score": item.get("score", 0.0),
        })

    # Ajoute la réponse synthétisée si disponible
    answer = data.get("answer")
    if answer:
        results.insert(0, {
            "title": "Synthèse Tavily",
            "url": "",
            "content": answer,
            "score": 1.0,
        })

    # Met en cache
    await set_cached_results(query, results)

    return results


# ============================================================
# Recherche contextuelle gabonaise
# ============================================================

GABON_DOMAINS = [
    "legabon.net",
    "gabonreview.com",
    "infosplusgabon.com",
    "anpi-gabon.com",
    "journal-officiel.ga",
    "dgbfip.ga",
]


async def search_gabon(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Recherche priorisée sur les sources gabonaises."""
    return await tavily_search(
        query=query,
        max_results=max_results,
        search_depth="advanced",
        include_domains=GABON_DOMAINS,
    )


async def search_general(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Recherche générale mondiale."""
    return await tavily_search(
        query=query,
        max_results=max_results,
        search_depth="basic",
    )


def format_search_context(results: List[Dict[str, Any]]) -> str:
    """Formate les résultats de recherche pour injection dans le prompt RAG."""
    if not results:
        return ""

    parts = []
    for i, r in enumerate(results[:5], 1):
        title = r.get("title", "Sans titre")
        content = r.get("content", "")[:500]
        url = r.get("url", "")
        parts.append(f"[{i}] {title}\n{content}\nSource: {url}")

    return "\n\n".join(parts)
