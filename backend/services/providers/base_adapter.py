"""
Ñkyel AI — Base Provider Adapter & Universal OpenAI-Compatible Engine
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Architecture d'intégration agnostique de modèles d'IA :
- Interface abstraite unifiée pour tout fournisseur d'IA mondial
- Adaptateur universel pour protocoles OpenAI-compatibles (Mistral, Scaleway, DeepSeek, Qwen, vLLM, etc.)
- Normalisation des métriques (latence, TTFT, tokens réels, coût)
- Gestion des headers d'authentification et isolation sécurisée des clés
"""

from __future__ import annotations

import os
import time
import json
import logging
from abc import ABC, abstractmethod
from typing import Optional, Any, AsyncGenerator, Dict, List
from dataclasses import dataclass, field

import httpx

logger = logging.getLogger(__name__)


@dataclass
class AdapterResponse:
    """Réponse normalisée d'un fournisseur de modèle."""
    text: str
    input_tokens: int
    output_tokens: int
    raw_response: Optional[dict] = None
    finish_reason: Optional[str] = None
    latency_ms: int = 0
    ttft_ms: Optional[int] = None
    model_used: str = ""
    provider_id: str = ""


class BaseProviderAdapter(ABC):
    """Interface abstraite de premier rang pour tous les adaptateurs de fournisseurs."""

    def __init__(
        self,
        provider_id: str,
        base_url: str,
        api_key_env: str = "",
        default_headers: Optional[Dict[str, str]] = None,
        timeout_seconds: float = 60.0,
    ):
        self.provider_id = provider_id
        self.base_url = base_url.rstrip("/")
        self.api_key_env = api_key_env
        self.default_headers = default_headers or {}
        self.timeout_seconds = timeout_seconds

    def get_api_key(self) -> str:
        """Récupère la clé API depuis l'environnement ou retourne une chaîne vide."""
        if not self.api_key_env:
            return ""
        return os.getenv(self.api_key_env, "")

    @abstractmethod
    async def chat(
        self,
        model_id: str,
        messages: List[Dict[str, str]],
        *,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        json_mode: bool = False,
        tools: Optional[List[Dict[str, Any]]] = None,
        timeout: Optional[float] = None,
    ) -> AdapterResponse:
        """Génération de texte/chat non-streaming."""
        pass

    @abstractmethod
    async def stream(
        self,
        model_id: str,
        messages: List[Dict[str, str]],
        *,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        tools: Optional[List[Dict[str, Any]]] = None,
        timeout: Optional[float] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Génération de texte en streaming SSE."""
        if False:
            yield {}

    async def embed(
        self,
        model_id: str,
        texts: List[str],
        *,
        dimensions: Optional[int] = None,
    ) -> List[List[float]]:
        """Génération d'embeddings vectoriels (optionnel par adaptateur)."""
        raise NotImplementedError(f"Embedding non supporté par l'adapter {self.provider_id}")

    async def health_check(self) -> bool:
        """Vérification rapide de la disponibilité de l'endpoint."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/models", headers=self._build_headers())
                return resp.status_code in {200, 401, 403}  # Endpoint répond
        except Exception:
            return False

    def _build_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "NkyelAI-Gateway/2026.1 (SmartANDJ AI Technologies)",
        }
        api_key = self.get_api_key()
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        headers.update(self.default_headers)
        return headers


class OpenAICompatibleProviderAdapter(BaseProviderAdapter):
    """
    Adaptateur universel pour tous les fournisseurs exposant une API compatible OpenAI :
    - Mistral AI, Scaleway, OVHcloud, DeepSeek, Qwen / DashScope, Kimi, GLM
    - Together AI, Fireworks AI, Groq, OpenRouter, vLLM, TGI, SGLang, Ollama, RunPod
    """

    async def chat(
        self,
        model_id: str,
        messages: List[Dict[str, str]],
        *,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        json_mode: bool = False,
        tools: Optional[List[Dict[str, Any]]] = None,
        timeout: Optional[float] = None,
    ) -> AdapterResponse:
        start_time = time.time()
        effective_timeout = timeout or self.timeout_seconds
        headers = self._build_headers()

        payload: Dict[str, Any] = {
            "model": model_id,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        if tools:
            payload["tools"] = tools

        async with httpx.AsyncClient(timeout=effective_timeout) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

        latency_ms = int((time.time() - start_time) * 1000)
        choice = data.get("choices", [{}])[0]
        text = choice.get("message", {}).get("content", "") or ""
        finish_reason = choice.get("finish_reason", "stop")
        usage = data.get("usage", {})

        input_tokens = usage.get("prompt_tokens") or (sum(len(m.get("content", "")) for m in messages) // 4)
        output_tokens = usage.get("completion_tokens") or (len(text) // 4)

        return AdapterResponse(
            text=text,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            raw_response=data,
            finish_reason=finish_reason,
            latency_ms=latency_ms,
            model_used=model_id,
            provider_id=self.provider_id,
        )

    async def stream(
        self,
        model_id: str,
        messages: List[Dict[str, str]],
        *,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        tools: Optional[List[Dict[str, Any]]] = None,
        timeout: Optional[float] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        effective_timeout = timeout or self.timeout_seconds
        headers = self._build_headers()

        payload: Dict[str, Any] = {
            "model": model_id,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }
        if tools:
            payload["tools"] = tools

        start_time = time.time()
        first_token = True

        async with httpx.AsyncClient(timeout=effective_timeout) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    data_str = line[6:].strip()
                    if data_str == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data_str)
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            if first_token:
                                ttft_ms = int((time.time() - start_time) * 1000)
                                yield {"type": "ttft", "ttft_ms": ttft_ms}
                                first_token = False
                            yield {"type": "token", "text": content}
                    except json.JSONDecodeError:
                        continue

        yield {"type": "done"}

    async def embed(
        self,
        model_id: str,
        texts: List[str],
        *,
        dimensions: Optional[int] = None,
    ) -> List[List[float]]:
        headers = self._build_headers()
        payload: Dict[str, Any] = {
            "model": model_id,
            "input": texts,
        }
        if dimensions:
            payload["dimensions"] = dimensions

        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            resp = await client.post(
                f"{self.base_url}/embeddings",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            return [item.get("embedding", []) for item in data.get("data", [])]
