"""
Ñkyel AI — Search Gateway · SmartANDJ AI Technologies
Passerelle unifiée de recherche et de navigation Web.

Sépare formellement :
1. search()   — Recherche d'index (Tavily, Brave Search)
2. fetch()    — Téléchargement direct d'URL via HTTP/MCP
3. extract()  — Extraction de contenu propre (Markdown épuré)
4. crawl()    — Exploration récursive de domaines
5. research() — Recherche multi-sources avec déduplication

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import os
import re
import time
import logging
import urllib.parse
from typing import Optional, Dict, Any, List, Set
from dataclasses import dataclass, field

import httpx

from core.config import settings
from services.tavily_search_service import tavily_search

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Search Domain Models
# ══════════════════════════════════════════════════════════════

@dataclass
class SearchResultItem:
    """Résultat de recherche standardisé et nettoyé."""
    title: str
    url: str
    snippet: str
    domain: str = ""
    score: float = 1.0
    published_date: Optional[str] = None
    author: Optional[str] = None

    def __post_init__(self):
        if not self.domain and self.url:
            try:
                parsed = urllib.parse.urlparse(self.url)
                self.domain = parsed.netloc.lower().replace("www.", "")
            except Exception:
                self.domain = "web"


@dataclass
class ResearchReport:
    """Rapport de recherche consolidé."""
    topic: str
    sources_count: int
    findings: List[str]
    evidence_urls: List[str]
    duration_ms: int
    deduplicated_sources: List[SearchResultItem]


# ══════════════════════════════════════════════════════════════
# 2. Search Gateway Implementation
# ══════════════════════════════════════════════════════════════

class SearchGateway:
    """
    Passerelle unifiée de recherche et extraction Web Ñkyel.
    Gère la déduplication de domaines et d'URLs pour éviter
    le gaspillage de requêtes et de tokens.
    """

    def __init__(self):
        self._seen_urls: Set[str] = set()

    # ── 1. Search Index ───────────────────────────────────────

    async def search(
        self,
        query: str,
        depth: str = "basic",
        max_results: int = 5,
        exclude_domains: Optional[List[str]] = None,
    ) -> List[SearchResultItem]:
        """
        Effectue une recherche indexée (Tavily / Brave).
        Déduplique automatiquement les URLs déjà vues dans la session.
        """
        raw_results = tavily_search(
            query=query,
            max_results=max_results + 3,  # Marge pour déduplication
            search_depth=depth,
        )

        items: List[SearchResultItem] = []
        excluded = set(d.lower() for d in (exclude_domains or []))

        for r in raw_results:
            url = r.get("url", "").strip()
            if not url or url.startswith("http://localhost"):
                continue

            # Normalisation d'URL
            clean_url = url.split("#")[0].rstrip("/")

            item = SearchResultItem(
                title=r.get("title", "Sans titre"),
                url=clean_url,
                snippet=r.get("content", ""),
                score=float(r.get("score", 1.0)),
            )

            if item.domain in excluded:
                continue

            if clean_url not in self._seen_urls:
                self._seen_urls.add(clean_url)
                items.append(item)

            if len(items) >= max_results:
                break

        return items

    # ── 2. Fetch Direct URL ───────────────────────────────────

    async def fetch(self, url: str, timeout: float = 15.0) -> Dict[str, Any]:
        """
        Télécharge le contenu brut d'une page Web via HTTP client asynchrone.
        """
        headers = {
            "User-Agent": "ÑkyelAI-Agent/2.0 (+https://nkyel.ai/bot)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
        start = time.time()
        try:
            async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
                resp = await client.get(url, headers=headers)
                resp.raise_for_status()
                html = resp.text
                duration = int((time.time() - start) * 1000)
                return {
                    "url": url,
                    "status_code": resp.status_code,
                    "html": html,
                    "duration_ms": duration,
                    "success": True,
                }
        except Exception as e:
            return {
                "url": url,
                "status_code": 0,
                "html": "",
                "duration_ms": int((time.time() - start) * 1000),
                "success": False,
                "error": str(e),
            }

    # ── 3. Extract Clean Markdown ─────────────────────────────

    def extract(self, html: str) -> str:
        """
        Extrait le texte lisible et convertit les éléments essentiels en Markdown.
        Supprime les scripts, styles, balises d'en-tête et publicités.
        """
        if not html:
            return ""

        # Nettoyage des balises de scripts et styles
        clean = re.sub(r'<script.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
        clean = re.sub(r'<style.*?</style>', '', clean, flags=re.DOTALL | re.IGNORECASE)
        clean = re.sub(r'<nav.*?</nav>', '', clean, flags=re.DOTALL | re.IGNORECASE)
        clean = re.sub(r'<footer.*?</footer>', '', clean, flags=re.DOTALL | re.IGNORECASE)

        # Conversion simplifiée des titres et paragraphes
        clean = re.sub(r'<h[1-3][^>]*>(.*?)</h[1-3]>', r'\n\n### \1\n', clean, flags=re.IGNORECASE)
        clean = re.sub(r'<p[^>]*>(.*?)</p>', r'\n\1\n', clean, flags=re.IGNORECASE)
        clean = re.sub(r'<li[^>]*>(.*?)</li>', r'\n- \1', clean, flags=re.IGNORECASE)

        # Suppression des balises HTML restantes
        clean = re.sub(r'<[^>]+>', ' ', clean)
        # Normalisation des espaces
        clean = re.sub(r'[ \t]+', ' ', clean)
        clean = re.sub(r'\n{3,}', '\n\n', clean)

        return clean.strip()

    # ── 4. Crawl Domain ───────────────────────────────────────

    async def crawl(
        self,
        base_url: str,
        max_pages: int = 3,
        timeout: float = 20.0,
    ) -> List[Dict[str, Any]]:
        """
        Exploration de surface d'un site Web (pages internes liées).
        """
        results = []
        root_data = await self.fetch(base_url, timeout=timeout)
        if not root_data["success"]:
            return results

        root_markdown = self.extract(root_data["html"])
        results.append({
            "url": base_url,
            "content": root_markdown[:4000],
            "title": "Page d'accueil / Racine",
        })

        # Découverte de liens internes
        domain = urllib.parse.urlparse(base_url).netloc
        links = re.findall(r'href=["\'](https?://' + re.escape(domain) + r'/[^"\']*)["\']', root_data["html"])
        unique_links = list(set(links))[:max_pages - 1]

        for link in unique_links:
            page_data = await self.fetch(link, timeout=10.0)
            if page_data["success"]:
                results.append({
                    "url": link,
                    "content": self.extract(page_data["html"])[:3000],
                    "title": link,
                })

        return results

    # ── 5. Consolidated Multi-Source Research ─────────────────

    async def research(
        self,
        topic: str,
        queries: Optional[List[str]] = None,
        max_sources_per_query: int = 3,
    ) -> ResearchReport:
        """
        Exécute une recherche multi-requêtes consolidée avec déduplication.
        """
        start = time.time()
        search_queries = queries or [
            f"{topic} synthèse et faits vérifiés 2026",
            f"{topic} acteurs clés et chiffres",
        ]

        all_items: List[SearchResultItem] = []
        for q in search_queries:
            items = await self.search(q, max_results=max_sources_per_query)
            all_items.extend(items)

        # Déduplication finale par URL
        unique_items: Dict[str, SearchResultItem] = {}
        for item in all_items:
            if item.url not in unique_items:
                unique_items[item.url] = item

        sources = list(unique_items.values())
        findings = [f"[{s.title}] ({s.domain}): {s.snippet[:200]}" for s in sources]
        evidence_urls = [s.url for s in sources]

        return ResearchReport(
            topic=topic,
            sources_count=len(sources),
            findings=findings,
            evidence_urls=evidence_urls,
            duration_ms=int((time.time() - start) * 1000),
            deduplicated_sources=sources,
        )


# Singleton
search_gateway = SearchGateway()
