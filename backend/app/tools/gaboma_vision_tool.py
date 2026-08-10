"""
GabomaAI · Outil DeerFlow : gaboma_vision
Permet aux agents NKYEL / BLACK PANTHER d'analyser des images/vidéos.
"""

from typing import List, Any, Optional

from app.services.gabomaseer_client import gabomaseer


class GabomaVisionTool:
    """Outil DeerFlow pour la vision par ordinateur via GabomaSeer."""

    name = "gaboma_vision"
    description = (
        "Analyse des images ou des frames vidéo pour en extraire une description textuelle. "
        "Utilise GabomaSeer pour comprendre le contenu visuel."
    )

    async def run(self, image_b64: Optional[str] = None, prompt: str = "Décris ce que tu vois.") -> str:
        """Exécute l'analyse visuelle."""
        if not image_b64:
            return "Aucune image fournie à analyser."

        result = await gabomaseer.analyze_image_b64(image_b64, prompt)
        return f"[Vision GabomaSeer] {result}"


gaboma_vision_tool = GabomaVisionTool()
