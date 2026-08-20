"""
Ñkyel AI · Outil DeerFlow : nkyel_vision
Permet aux agents NKYEL / BLACK PANTHER d'analyser des images/vidéos.
"""

from typing import List, Any, Optional

from app.services.nkyelseer_client import nkyelseer


class NkyelVisionTool:
    """Outil DeerFlow pour la vision par ordinateur via NkyelSeer."""

    name = "nkyel_vision"
    description = (
        "Analyse des images ou des frames vidéo pour en extraire une description textuelle. "
        "Utilise NkyelSeer pour comprendre le contenu visuel."
    )

    async def run(self, image_b64: Optional[str] = None, prompt: str = "Décris ce que tu vois.") -> str:
        """Exécute l'analyse visuelle."""
        if not image_b64:
            return "Aucune image fournie à analyser."

        result = await nkyelseer.analyze_image_b64(image_b64, prompt)
        return f"[Vision NkyelSeer] {result}"


nkyel_vision_tool = NkyelVisionTool()
