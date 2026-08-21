"""
Ñkyel AI — Outil de Vision Spatiale Multimodale (NkyelVision)
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
"""

from typing import Any, List
from services.nkyelvision_client import nkyelvision_client

class NkyelVisionTool:
    """
    Outil DeerFlow pour la vision par ordinateur avec NkyelVision.
    Permet à Ñkyel d'analyser des images, des graphiques et des vidéos spatiales.
    """
    
    name = "nkyel_vision"
    description = (
        "Utilise NkyelVision pour voir, comprendre et analyser des images ou des flux vidéo. "
        "Appelle cet outil lorsque l'utilisateur fournit un média ou que la mission implique l'analyse visuelle."
    )
    
    async def run(self, files: List[Any], prompt: str) -> str:
        """
        Exécute l'analyse visuelle via le client HTTP NkyelVision.
        """
        if not files:
            return "Aucun fichier fourni à analyser."
            
        result = await nkyelvision_client.analyze_media(files=files, prompt=prompt)
        return f"Analyse Visuelle (NkyelVision): {result}"

# Alias de rétro-compatibilité
GabomaVisionTool = NkyelVisionTool
