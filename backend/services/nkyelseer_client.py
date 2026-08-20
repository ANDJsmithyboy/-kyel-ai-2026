import os
import httpx
from typing import List, Optional, Dict, Any
from fastapi import UploadFile

class NkyelVisionClient:
    """
    Client pour communiquer avec ÑkyelVision (Oryx-1.5-32B) hébergé sur RunPod.
    """
    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        # On utilise la variable d'environnement ou l'URL fournie
        self.base_url = base_url or os.getenv("NKYELVISION_URL", "http://localhost:8080")
        self.api_key = api_key or os.getenv("NKYELVISION_API_KEY", "")
        
    async def analyze_media(self, files: List[UploadFile], prompt: str) -> str:
        """
        Envoie des fichiers (images/vidéos frames) et un prompt à l'instance Oryx.
        """
        # Construction de l'en-tête (auth si nécessaire sur RunPod)
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Préparation du payload multipart form-data
                multipart_data = []
                for file in files:
                    file.file.seek(0)
                    content = file.file.read()
                    multipart_data.append(("files", (file.filename, content, file.content_type)))
                
                # Ajout du prompt aux données
                data = {"prompt": prompt}
                
                endpoint = f"{self.base_url}/analyze"
                
                # Appel au serveur RunPod / ÑkyelVision
                response = await client.post(
                    endpoint, 
                    data=data, 
                    files=multipart_data, 
                    headers=headers
                )
                
                response.raise_for_status()
                result = response.json()
                
                # On s'attend à un JSON { "text": "description..." }
                return result.get("text", "")
                
        except httpx.RequestError as exc:
            # En cas d'erreur de connexion, fallback local / mock pour continuer de tester
            print(f"Erreur de connexion à ÑkyelVision ({exc}). Utilisation du mock.")
            return f"[NKYELVISION MOCK] Je vois les médias que tu m'as envoyés, mais je ne suis pas connecté au RunPod. Prompt reçu: '{prompt}'."
        except Exception as e:
            return f"Erreur lors de l'analyse ÑkyelVision: {str(e)}"

# Instance singleton par défaut
nkyelvision_client = NkyelVisionClient()
# Alias pour compatibilité arrière
nkyelseer_client = nkyelvision_client
GabomaSeerClient = NkyelVisionClient
