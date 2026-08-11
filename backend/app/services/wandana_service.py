"""
Ñkyel AI · WANDANA Service
Recherche web via Tavily API + Google Scraper (Perplexity-style) + Qdrant Cloud pour le mode WANDANA (Deep Research).
"""

import httpx
import asyncio
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
from goose3 import Goose
from qdrant_client import QdrantClient

from app.config import settings

TAVILY_API_URL = "https://api.tavily.com/search"

async def wandana_search(
    query: str,
    max_results: int = 5,
    search_depth: str = "advanced",
    include_answer: bool = True,
) -> Dict:
    """Recherche web via Tavily."""
    if not settings.tavily_api_key:
        return {"answer": "", "results": []}

    payload = {
        "api_key": settings.tavily_api_key,
        "query": query,
        "max_results": max_results,
        "search_depth": search_depth,
        "include_answer": include_answer,
        "include_raw_content": False,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(TAVILY_API_URL, json=payload)
            response.raise_for_status()
            data = response.json()
            results = [
                {
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "content": r.get("content", ""),
                    "score": r.get("score", 0),
                } for r in data.get("results", [])
            ]
            return {"answer": data.get("answer", ""), "results": results}
        except Exception as e:
            print(f"Tavily Error: {e}")
            return {"answer": "", "results": []}

async def google_scrape_search(query: str, max_results: int = 3) -> List[Dict]:
    """Scrape Google Search + Goose3 extraction (Perplexity mechanism)."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    async with httpx.AsyncClient(timeout=15.0, headers=headers) as client:
        try:
            res = await client.get(f"https://www.google.com/search?q={query}&hl=en")
            res.raise_for_status()
            soup = BeautifulSoup(res.text, "html.parser")
            
            links = []
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if href.startswith("/url?q="):
                    url = href.replace("/url?q=", "").split("&")[0]
                    if url.startswith("http") and not any(ext in url for ext in ["google", "facebook", "twitter", "youtube", "tiktok"]):
                        if url not in links:
                            links.append(url)
            
            unique_links = links[:max_results]
            results = []
            g = Goose()
            
            for url in unique_links:
                try:
                    # Run Goose extraction in a thread pool since it's blocking
                    article = await asyncio.to_thread(g.extract, url=url)
                    text = article.cleaned_text
                    if text and len(text) > 100:
                        results.append({
                            "title": article.title or "Article web",
                            "url": url,
                            "content": text[:1500]
                        })
                except Exception as e:
                    print(f"Goose3 Error on {url}: {e}")
            return results
        except Exception as e:
            print(f"Google Scraper Error: {e}")
            return []

async def qdrant_search(query: str) -> List[Dict]:
    """Recherche contextuelle sur Qdrant Cloud (Local RAG)."""
    if not settings.qdrant_url or not settings.qdrant_api_key:
        return []
    try:
        # Note: Dans une implémentation complète, il faut générer l'embedding de `query`
        # et appeler client.search(collection_name="...", query_vector=...)
        client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
        # Placeholder pour l'instant
        return []
    except Exception as e:
        print(f"Qdrant Error: {e}")
        return []

async def wandana_search_and_summarize(
    query: str,
    messages_context: List[Dict[str, str]],
) -> str:
    """
    RAG Hybride : Exécute Tavily, le Scraper Google, et Qdrant en parallèle.
    """
    # Exécution parallèle des 3 moteurs de recherche
    tavily_task = asyncio.create_task(wandana_search(query))
    scrape_task = asyncio.create_task(google_scrape_search(query))
    qdrant_task = asyncio.create_task(qdrant_search(query))

    tavily_data, scrape_results, qdrant_results = await asyncio.gather(tavily_task, scrape_task, qdrant_task)

    sources_text = ""
    source_idx = 1
    
    # 1. Sources Qdrant
    if qdrant_results:
        sources_text += "\n[CONTEXTE INTERNE QDRANT]\n"
        for r in qdrant_results:
            sources_text += f"\n[Source {source_idx}] {r.get('title', 'Document interne')}\nURL: {r.get('url', 'Interne')}\n{r.get('content', '')[:500]}\n"
            source_idx += 1

    # 2. Sources Tavily
    if tavily_data.get("results"):
        sources_text += "\n[RECHERCHE TAVILY]\n"
        for r in tavily_data["results"]:
            sources_text += f"\n[Source {source_idx}] {r['title']}\nURL: {r['url']}\n{r['content'][:500]}\n"
            source_idx += 1

    # 3. Sources Scraping Pur (Perplexity mechanism)
    if scrape_results:
        sources_text += "\n[SCRAPING WEB DIRECT]\n"
        for r in scrape_results:
            sources_text += f"\n[Source {source_idx}] {r['title']}\nURL: {r['url']}\n{r['content'][:1500]}\n"
            source_idx += 1

    augmented_prompt = (
        f"L'utilisateur demande : {query}\n\n"
        f"Voici les résultats fusionnés du RAG WANDANA (Qdrant + Tavily + Scraping Google) :\n"
        f"{sources_text}\n\n"
        f"Synthèse Tavily : {tavily_data.get('answer', 'N/A')}\n\n"
        f"En te basant sur ces sources, fournis une réponse complète, sourcée et structurée. "
        f"Cite systématiquement les sources pertinentes avec leurs URLs sous forme de [1], [2], etc."
    )

    return augmented_prompt
