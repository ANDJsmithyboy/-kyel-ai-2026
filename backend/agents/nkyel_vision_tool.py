from typing import Any, List
from services.nkyelvision_client import nkyelvision_client

class GabomaVisionTool:
    """
    Outil DeerFlow pour la vision par ordinateur avec GabomaSeer (Oryx).
    Permet à NKYEL et BLACK PANTHER d'analyser des images et des vidéos.
    """
    
    name = "gaboma_vision"
    description = (
        "Utilise GabomaSeer (basé sur Oryx-1.5-32B) pour voir et comprendre des images ou des vidéos. "
        "Appelle cet outil lorsque l'utilisateur fournit un média ou que la mission implique l'analyse visuelle."
    )
    
    async def run(self, files: List[Any], prompt: str) -> str:
        """
        Exécute l'analyse via le client HTTP.
        (Note: 'files' doit être adapté selon la structure interne de l'agent)
        """
        if not files:
            return "Aucun fichier fourni à analyser."
            
        # Appel du client
        result = await nkyelvision_client.analyze_media(files=files, prompt=prompt)
        
        return f"Analyse Visuelle (GabomaSeer): {result}"
