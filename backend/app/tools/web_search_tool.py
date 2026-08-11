"""
Ñkyel AI · Outil DeerFlow : wandana_search
Permet aux agents d'effectuer des recherches web via WANDANA.
"""

from app.services.wandana_service import wandana_search


class WebSearchTool:
    """Outil DeerFlow pour la recherche web via WANDANA (Tavily)."""

    name = "wandana_search"
    description = (
        "Effectue une recherche web approfondie pour trouver des informations récentes. "
        "Retourne les résultats avec sources et URLs."
    )

    async def run(self, query: str, max_results: int = 5) -> str:
        """Exécute la recherche web."""
        if not query.strip():
            return "Aucune requête de recherche fournie."

        data = await wandana_search(query, max_results=max_results, search_depth="advanced")

        output_parts = []
        answer = data.get("answer", "")
        if answer:
            output_parts.append(f"Synthèse : {answer}")

        for i, r in enumerate(data.get("results", []), 1):
            output_parts.append(f"\n[{i}] {r['title']}\n    URL: {r['url']}\n    {r['content'][:300]}")

        return "\n".join(output_parts) if output_parts else "Aucun résultat trouvé."


web_search_tool = WebSearchTool()
