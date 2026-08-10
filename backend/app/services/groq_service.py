"""
GabomaAI · Groq Service
Appels LLM via Groq API pour AURATA, NKYEL, ONYXGRIS.
Les noms de providers ne sont jamais exposés côté UI.
"""

import httpx
from typing import AsyncGenerator, List, Dict

from app.config import settings
from app.models.schemas import ModelId


# Mapping interne : nom public → modèle Groq réel
_MODEL_MAP: Dict[str, str] = {
    ModelId.AURATA: "llama-3.1-8b-instant",
    ModelId.NKYEL: "llama-3.3-70b-versatile",
    ModelId.ONYXGRIS: "llama-3.1-70b-versatile",
    ModelId.WANDANA: "llama-3.3-70b-versatile",
    ModelId.BLACK_PANTHER: "llama-3.3-70b-versatile",
}

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def _get_groq_model(model_id: str) -> str:
    """Résout le modèle Groq interne depuis l'ID public."""
    return _MODEL_MAP.get(model_id, _MODEL_MAP[ModelId.AURATA])


async def groq_chat(
    model_id: str,
    messages: List[Dict[str, str]],
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> str:
    """Appel Groq synchrone (non-streaming). Retourne le contenu complet."""
    if not settings.groq_api_key:
        return "[Mode développement] Groq API non configurée. Réponse simulée pour le modèle demandé."

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": _get_groq_model(model_id),
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(GROQ_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def groq_chat_stream(
    model_id: str,
    messages: List[Dict[str, str]],
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> AsyncGenerator[str, None]:
    """Appel Groq en streaming SSE. Yield chaque chunk de texte."""
    if not settings.groq_api_key:
        # Mock streaming pour le développement
        mock_response = (
            "Bonjour ! Je suis GabomaAI en mode développement. "
            "L'API Groq n'est pas encore configurée, mais l'interface fonctionne parfaitement. "
            "Configurez votre GROQ_API_KEY dans le fichier .env pour activer les réponses réelles."
        )
        for word in mock_response.split(" "):
            yield word + " "
        return

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": _get_groq_model(model_id),
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", GROQ_API_URL, json=payload, headers=headers) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue
                data_str = line[6:]
                if data_str.strip() == "[DONE]":
                    break
                try:
                    import json
                    chunk = json.loads(data_str)
                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        yield content
                except (json.JSONDecodeError, IndexError, KeyError):
                    continue
