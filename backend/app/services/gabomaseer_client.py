"""
GabomaAI · GabomaSeer Client
Wrapper pour HF Inference API (Oryx-1.5-32B) ou instance self-hosted.
Sous-système vision de l'écosystème GabomaAI.
"""

import base64
import httpx
import json
from typing import Optional, List

from app.config import settings


HF_INFERENCE_URL = "https://api-inference.huggingface.co/models/THUdyh/Oryx-1.5-32B"


class GabomaSeerClient:
    """Client vision GabomaSeer — appelle HF Inference API ou self-hosted."""

    def __init__(self):
        self.mode = settings.gabomaseer_mode
        self.hf_key = settings.hf_api_key
        self.self_hosted_url = settings.gabomaseer_url

    def _get_url(self) -> str:
        if self.mode == "self_hosted" and self.self_hosted_url:
            return self.self_hosted_url.rstrip("/") + "/analyze"
        return HF_INFERENCE_URL

    def _get_headers(self) -> dict:
        headers = {"Content-Type": "application/json"}
        if self.mode == "hf_api" and self.hf_key:
            headers["Authorization"] = f"Bearer {self.hf_key}"
        return headers

    async def analyze_image_bytes(self, image_bytes: bytes, prompt: str = "Décris ce que tu vois.") -> str:
        """Analyse une image à partir de bytes bruts."""
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        return await self.analyze_image_b64(b64, prompt)

    async def analyze_image_b64(self, image_b64: str, prompt: str = "Décris ce que tu vois.") -> str:
        """Analyse une image encodée en base64."""
        if not self.hf_key and self.mode == "hf_api":
            return self._mock_response(prompt)

        url = self._get_url()
        headers = self._get_headers()

        if self.mode == "hf_api":
            return await self._call_hf_api(url, headers, image_b64, prompt)
        else:
            return await self._call_self_hosted(url, headers, image_b64, prompt)

    async def analyze_files(self, files: list, prompt: str = "Décris ce que tu vois.") -> str:
        """Analyse des fichiers uploadés (UploadFile FastAPI)."""
        if not files:
            return "Aucun fichier fourni à analyser."

        results = []
        for f in files:
            content = await f.read()
            await f.seek(0)
            result = await self.analyze_image_bytes(content, prompt)
            results.append(result)

        return "\n\n".join(results)

    async def _call_hf_api(self, url: str, headers: dict, image_b64: str, prompt: str) -> str:
        """Appel HuggingFace Inference API."""
        payload = {
            "inputs": {
                "image": image_b64,
                "text": prompt,
            },
            "parameters": {
                "max_new_tokens": 512,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload, headers=headers)

                # HF renvoie 503 si le modèle est en cours de chargement
                if response.status_code == 503:
                    data = response.json()
                    wait_time = data.get("estimated_time", 30)
                    return (
                        f"GabomaSeer est en cours de chargement sur le serveur. "
                        f"Temps estimé : {wait_time:.0f}s. Réessayez dans un instant."
                    )

                if response.status_code == 429:
                    return "GabomaSeer : limite de requêtes atteinte. Réessayez dans quelques secondes."

                response.raise_for_status()
                data = response.json()

                # HF Inference renvoie soit une liste, soit un dict
                if isinstance(data, list) and len(data) > 0:
                    return data[0].get("generated_text", str(data))
                elif isinstance(data, dict):
                    return data.get("generated_text", data.get("text", str(data)))
                return str(data)

        except httpx.TimeoutException:
            return "GabomaSeer : délai d'attente dépassé. Le modèle est peut-être en cours de chargement."
        except httpx.HTTPStatusError as e:
            return f"GabomaSeer : erreur HTTP {e.response.status_code}."
        except Exception as e:
            return f"GabomaSeer : erreur inattendue — {str(e)}"

    async def _call_self_hosted(self, url: str, headers: dict, image_b64: str, prompt: str) -> str:
        """Appel vers une instance self-hosted (RunPod GPU ou VPS)."""
        payload = {
            "image_b64": image_b64,
            "prompt": prompt,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                return data.get("text", str(data))
        except Exception as e:
            return f"GabomaSeer (self-hosted) : erreur — {str(e)}"

    def _mock_response(self, prompt: str) -> str:
        return (
            f"[GabomaSeer · Mode développement]\n"
            f"HF_API_KEY non configurée. Réponse simulée.\n"
            f"Prompt reçu : \"{prompt}\"\n"
            f"Je vois une image contenant des éléments visuels intéressants. "
            f"Dans un environnement de production, GabomaSeer (Oryx-1.5-32B) "
            f"fournirait ici une description détaillée de l'image."
        )


# Singleton
gabomaseer = GabomaSeerClient()
