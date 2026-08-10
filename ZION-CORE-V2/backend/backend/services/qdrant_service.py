"""
GabomaAI — Service Qdrant (LOXO) · SmartANDJ AI Technologies
Recherche vectorielle via Qdrant pour le Radar LOXO.
Fondateur : Daniel Jonathan ANDJ
"""

from typing import Optional
import httpx

from core.config import settings


async def query_qdrant(
    query: str,
    top_k: int = 5,
    collection: Optional[str] = None,
) -> list[dict]:
    """
    Recherche dans Qdrant et retourne les chunks pertinents.
    Retourne une liste de {content, source, url, score}.
    """
    coll = collection or settings.qdrant_collection

    # Si pas de clé Qdrant configurée, retourner vide
    if not settings.qdrant_api_key or settings.qdrant_api_key == "paste_here_when_northflank_deployed":
        return []

    headers = {
        "Content-Type": "application/json",
        "api-key": settings.qdrant_api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Phase 1 : Obtenir le vecteur du query via un modèle d'embedding
            # Pour l'instant, on utilise la recherche par texte de Qdrant (si activée)
            response = await client.post(
                f"{settings.qdrant_url}/collections/{coll}/points/query",
                headers=headers,
                json={
                    "query": query,
                    "limit": top_k,
                    "with_payload": True,
                },
            )

            if response.status_code == 404:
                # Collection n'existe pas encore
                return []

            response.raise_for_status()
            data = response.json()

            chunks = []
            for point in data.get("result", {}).get("points", []):
                payload = point.get("payload", {})
                chunks.append({
                    "id": str(point.get("id", "")),
                    "content": payload.get("content", payload.get("text", "")),
                    "source": payload.get("source", "unknown"),
                    "url": payload.get("url", ""),
                    "score": point.get("score", 0.0),
                })

            return chunks

    except (httpx.ConnectError, httpx.HTTPStatusError):
        # Qdrant non disponible — ne pas bloquer le flow
        return []


def format_loxo_context(chunks: list[dict]) -> str:
    """Formate les chunks LOXO en contexte textuel pour le system prompt."""
    if not chunks:
        return ""

    lines = []
    for i, chunk in enumerate(chunks, 1):
        source = chunk.get("source", "unknown")
        url = chunk.get("url", "")
        content = chunk.get("content", "")
        lines.append(f"[Source {i}: {source}] {url}\n{content}")

    return "\n\n".join(lines)
