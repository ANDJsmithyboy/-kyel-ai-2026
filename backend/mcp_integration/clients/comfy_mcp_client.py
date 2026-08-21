"""
Ñkyel AI — Client Comfy MCP Officiel · SmartANDJ AI Technologies
Fournit une connexion native MCP vers les serveurs ComfyUI (Local et RunPod).

Fonctionnalités :
- File d'attente de workflows ComfyUI (queue prompt)
- Suivi de progression et exécution de nœuds (node execution status)
- Récupération des images et vidéos générées
- Statistiques système et santé VRAM

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
import httpx

from core.config import settings

logger = logging.getLogger(__name__)


class ComfyMCPClient:
    """Client MCP officiel pour l'exécution et l'orchestration de workflows ComfyUI."""

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        self.base_url = (base_url or settings.comfyui_url).rstrip("/")
        self.api_key = api_key or settings.comfyui_api_key

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def check_health(self) -> Dict[str, Any]:
        """Vérifie la disponibilité et l'état du serveur ComfyUI."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/system_stats", headers=self._headers())
                if resp.status_code == 200:
                    return {"connected": True, "stats": resp.json()}
                return {"connected": False, "status_code": resp.status_code}
        except Exception as e:
            return {"connected": False, "error": str(e)}

    async def queue_prompt(self, workflow_prompt: Dict[str, Any], client_id: str = "nkyel_agent") -> Dict[str, Any]:
        """Envoie un workflow structuré dans la file d'attente ComfyUI."""
        payload = {
            "prompt": workflow_prompt,
            "client_id": client_id,
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(f"{self.base_url}/prompt", headers=self._headers(), json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return {"success": True, "prompt_id": data.get("prompt_id"), "number": data.get("number")}
                return {"success": False, "error": f"ComfyUI HTTP {resp.status_code}: {resp.text}"}
        except Exception as e:
            logger.warning(f"ComfyMCPClient queue error: {e}")
            return {"success": False, "error": str(e)}

    async def get_history(self, prompt_id: str) -> Optional[Dict[str, Any]]:
        """Récupère l'historique et les outputs d'un prompt exécuté."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/history/{prompt_id}", headers=self._headers())
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get(prompt_id)
                return None
        except Exception as e:
            logger.warning(f"ComfyMCPClient history error: {e}")
            return None

    async def wait_for_execution(self, prompt_id: str, max_wait_seconds: int = 120, poll_interval: float = 2.0) -> Dict[str, Any]:
        """Attend la complétion d'un prompt et extrait les URLs des images/vidéos générées."""
        waited = 0.0
        while waited < max_wait_seconds:
            history = await self.get_history(prompt_id)
            if history and "outputs" in history:
                outputs = history["outputs"]
                media_files = []
                for node_id, node_out in outputs.items():
                    # Images outputs
                    if "images" in node_out:
                        for img in node_out["images"]:
                            filename = img.get("filename")
                            subfolder = img.get("subfolder", "")
                            img_type = img.get("type", "output")
                            view_url = f"{self.base_url}/view?filename={filename}&subfolder={subfolder}&type={img_type}"
                            media_files.append({"type": "image", "url": view_url, "filename": filename})
                    # Videos outputs (Wan2.1 / VHS_VideoCombine)
                    if "gifs" in node_out or "videos" in node_out:
                        vids = node_out.get("videos") or node_out.get("gifs") or []
                        for vid in vids:
                            filename = vid.get("filename")
                            view_url = f"{self.base_url}/view?filename={filename}&type=output"
                            media_files.append({"type": "video", "url": view_url, "filename": filename})

                return {"success": True, "prompt_id": prompt_id, "media": media_files, "duration_seconds": waited}

            await asyncio.sleep(poll_interval)
            waited += poll_interval

        return {"success": False, "error": f"Timeout après {max_wait_seconds}s d'exécution ComfyUI"}
