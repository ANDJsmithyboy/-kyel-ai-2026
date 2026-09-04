"""
Ñkyel AI — Canonical Sovereign Inference Router · SmartANDJ AI Technologies
Fondateur : Daniel Jonathan ANDJ

Architecture de Routage P0 — Décision du Fondateur :
1. RunPod Public Endpoint GPT-OSS 120B (PRIMARY)
2. RunPod Public Endpoint Qwen3 32B AWQ (SECONDARY ACTIVE)
3. Groq Model A (AURATA / llama-3.3-70b-versatile) — FALLBACK 1
4. Groq Model B (SONAR / llama-3.1-8b-instant) — FALLBACK 2
5. Google Gemini (gemini-3.5-flash-lite / gemini-2.0-flash) — LAST RESORT

Règles de Protection du Crédit RunPod :
- Pas d'appels payants en parallèle pour les requêtes utilisateurs
- Exécution séquentielle stricte avec basculement gracieux (Fallback)
- Traçabilité complète des tokens, latence, coûts et raisons de fallback
- Arrêt contrôlé sans hallucination si tous les fournisseurs échouent
"""

import os
import time
import json
import logging
from typing import AsyncGenerator, Optional, List, Dict, Any

import httpx

from core.config import settings

logger = logging.getLogger("nkyel.inference_router")

# Clé de rotation Groq
_groq_key_index = 0

def _get_next_groq_key() -> str:
    global _groq_key_index
    pool = settings.groq_keys_pool
    if not pool:
        return settings.groq_api_key or os.getenv("GROQ_API_KEY", "")
    key = pool[_groq_key_index % len(pool)]
    _groq_key_index += 1
    return key


class InferenceRouter:
    """
    Routeur d'inférence canonique et souverain de Ñkyel AI.
    Gère la chaîne de priorité et de fallback officielle.
    """

    def __init__(self):
        self._runpod_api_key = settings.runpod_api_key or os.getenv("RUNPOD_API_KEY", "")
        self._gpt_oss_base_url = settings.runpod_gpt_oss_base_url or "https://api.runpod.ai/v2/gpt-oss-120b/openai/v1"
        self._gpt_oss_model = settings.runpod_gpt_oss_model or "openai/gpt-oss-120b"
        self._qwen_base_url = settings.runpod_qwen_base_url or "https://api.runpod.ai/v2/qwen3-32b-awq/openai/v1"
        self._qwen_model = settings.runpod_qwen_model or "Qwen/Qwen3-32B-AWQ"

    def _get_provider_chain(self, requested_provider: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Définit l'ordre séquentiel des fournisseurs d'inférence.
        """
        chain = [
            {
                "name": "runpod_gpt_oss",
                "tier": "PRIMARY",
                "base_url": self._gpt_oss_base_url,
                "model": self._gpt_oss_model,
                "api_key": self._runpod_api_key,
                "type": "openai_compatible",
                "timeout": 60.0,
            },
            {
                "name": "runpod_qwen",
                "tier": "SECONDARY_ACTIVE",
                "base_url": self._qwen_base_url,
                "model": self._qwen_model,
                "api_key": self._runpod_api_key,
                "type": "openai_compatible",
                "timeout": 45.0,
            },
            {
                "name": "groq_model_a",
                "tier": "FALLBACK_1",
                "base_url": "https://api.groq.com/openai/v1",
                "model": settings.aurata_model or "llama-3.3-70b-versatile",
                "api_key": _get_next_groq_key(),
                "type": "groq",
                "timeout": 45.0,
            },
            {
                "name": "groq_model_b",
                "tier": "FALLBACK_2",
                "base_url": "https://api.groq.com/openai/v1",
                "model": settings.sonar_model or "llama-3.1-8b-instant",
                "api_key": _get_next_groq_key(),
                "type": "groq",
                "timeout": 30.0,
            },
            {
                "name": "gemini_last_resort",
                "tier": "LAST_RESORT",
                "base_url": "https://generativelanguage.googleapis.com",
                "model": settings.nkyel_primary_model or "gemini-2.0-flash",
                "api_key": settings.google_api_key or os.getenv("GOOGLE_API_KEY", ""),
                "type": "gemini",
                "timeout": 60.0,
            },
        ]

        if requested_provider == "runpod_qwen":
            # Si explicitement routé vers Qwen (ex: benchmarking ou tâche multilingue ciblée)
            qwen_prov = chain.pop(1)
            chain.insert(0, qwen_prov)

        return chain

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        system_content: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        mission_id: Optional[str] = None,
        run_id: Optional[str] = None,
        requested_provider: Optional[str] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Exécute la complétion en streaming avec basculement séquentiel strict.
        """
        # Formater les messages avec le prompt système
        final_messages: List[Dict[str, str]] = []
        if system_content:
            final_messages.append({"role": "system", "content": system_content})
        for m in messages:
            if m.get("role") != "system":
                final_messages.append(m)

        chain = self._get_provider_chain(requested_provider)
        fallback_history: List[Dict[str, Any]] = []

        for idx, prov in enumerate(chain):
            prov_name = prov["name"]
            model_name = prov["model"]
            start_time = time.time()
            tokens_in = 0
            tokens_out = 0
            full_content = ""
            full_reasoning = ""
            received_tokens = False

            if not prov["api_key"] and prov["type"] != "gemini":
                reason = f"Clé API non configurée pour {prov_name}"
                logger.info(f"[InferenceRouter] {reason} — basculement")
                fallback_history.append({"provider": prov_name, "reason": reason})
                continue

            logger.info(f"[InferenceRouter] Tentative {prov['tier']} via {prov_name} (modèle={model_name})")

            try:
                if prov["type"] in ("openai_compatible", "groq"):
                    # Endpoint OpenAI compatible
                    url = f"{prov['base_url'].rstrip('/')}/chat/completions"
                    headers = {
                        "Authorization": f"Bearer {prov['api_key']}",
                        "Content-Type": "application/json",
                    }
                    payload = {
                        "model": model_name,
                        "messages": final_messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                        "stream": True,
                    }

                    async with httpx.AsyncClient(timeout=prov["timeout"]) as client:
                        async with client.stream("POST", url, headers=headers, json=payload) as response:
                            if response.status_code >= 400:
                                err_text = (await response.aread()).decode("utf-8", errors="ignore")
                                raise httpx.HTTPStatusError(
                                    f"Status {response.status_code}: {err_text[:200]}",
                                    request=response.request,
                                    response=response,
                                )

                            async for line in response.aiter_lines():
                                line = line.strip()
                                if not line or not line.startswith("data: "):
                                    continue
                                data_str = line[6:].strip()
                                if data_str == "[DONE]":
                                    break

                                try:
                                    chunk = json.loads(data_str)
                                    choices = chunk.get("choices") or []
                                    if not choices:
                                        usage = chunk.get("usage")
                                        if usage:
                                            tokens_in = usage.get("prompt_tokens", tokens_in)
                                            tokens_out = usage.get("completion_tokens", tokens_out)
                                        continue

                                    choice = choices[0]
                                    delta = choice.get("delta") or {}

                                    # Texte normal
                                    content_chunk = delta.get("content", "") or ""
                                    if content_chunk:
                                        full_content += content_chunk
                                        tokens_out += 1
                                        received_tokens = True
                                        yield {"type": "token", "text": content_chunk, "provider": prov_name}

                                    # Reasoning / Chain of Thought pour modèles comme GPT-OSS / DeepSeek / Qwen / Groq
                                    reasoning_chunk = (
                                        delta.get("reasoning_content", "")
                                        or delta.get("thinking", "")
                                        or delta.get("reasoning", "")
                                        or ""
                                    )
                                    if reasoning_chunk:
                                        full_reasoning += reasoning_chunk
                                        tokens_out += 1
                                        received_tokens = True
                                        # Notifier le canal de raisonnement
                                        yield {"type": "reasoning_token", "text": reasoning_chunk, "provider": prov_name}

                                    # Usage s'il est transmis dans le flux
                                    usage = chunk.get("usage")
                                    if usage:
                                        tokens_in = usage.get("prompt_tokens", tokens_in)
                                        tokens_out = usage.get("completion_tokens", tokens_out)
                                except json.JSONDecodeError:
                                    continue

                            latency_ms = int((time.time() - start_time) * 1000)

                            # Si le modèle a produit du contenu ou du raisonnement, c'est un succès
                            if not full_content and full_reasoning:
                                full_content = full_reasoning

                            if received_tokens or full_content:
                                yield {
                                    "type": "usage",
                                    "provider": prov_name,
                                    "model": model_name,
                                    "tokens_in": tokens_in,
                                    "tokens_out": tokens_out,
                                    "latency_ms": latency_ms,
                                    "mission_id": mission_id,
                                    "run_id": run_id,
                                }
                                yield {
                                    "type": "done",
                                    "content": full_content,
                                    "reasoning": full_reasoning if full_reasoning else None,
                                    "provider": prov_name,
                                    "model": model_name,
                                    "latency_ms": latency_ms,
                                    "fallbacks": fallback_history,
                                }
                                return  # Succès complet, ne pas appeler les suivants

                            else:
                                raise ValueError("Flux complété sans tokens générés.")

                elif prov["type"] == "gemini":
                    # Fallback ultime Gemini REST SSE
                    gemini_key = prov["api_key"]
                    if not gemini_key:
                        raise ValueError("Aucune clé Gemini disponible pour le fallback ultime.")

                    gemini_contents = []
                    for m in final_messages:
                        if m.get("role") == "system":
                            continue
                        gemini_contents.append({
                            "role": "model" if m.get("role") == "assistant" else "user",
                            "parts": [{"text": m.get("content", "")}],
                        })

                    model_clean = model_name.replace("models/", "")
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_clean}:streamGenerateContent?alt=sse&key={gemini_key}"
                    payload = {
                        "contents": gemini_contents,
                        "systemInstruction": {"parts": [{"text": system_content or ""}]},
                        "generationConfig": {
                            "temperature": temperature,
                            "maxOutputTokens": max_tokens,
                        },
                    }

                    async with httpx.AsyncClient(timeout=prov["timeout"]) as client:
                        response = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                        response.raise_for_status()

                        async for line in response.aiter_lines():
                            line = line.strip()
                            if not line or not line.startswith("data: "):
                                continue
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break

                            try:
                                chunk = json.loads(data_str)
                                parts = chunk.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                                if parts:
                                    text_chunk = parts[0].get("text", "")
                                    if text_chunk:
                                        full_content += text_chunk
                                        tokens_out += 1
                                        received_tokens = True
                                        yield {"type": "token", "text": text_chunk, "provider": prov_name}
                            except json.JSONDecodeError:
                                continue

                        latency_ms = int((time.time() - start_time) * 1000)
                        if received_tokens or full_content:
                            yield {
                                "type": "usage",
                                "provider": prov_name,
                                "model": model_name,
                                "tokens_in": tokens_in,
                                "tokens_out": tokens_out,
                                "latency_ms": latency_ms,
                            }
                            yield {
                                "type": "done",
                                "content": full_content,
                                "provider": prov_name,
                                "model": model_name,
                                "latency_ms": latency_ms,
                                "fallbacks": fallback_history,
                            }
                            return

            except Exception as e:
                latency_ms = int((time.time() - start_time) * 1000)
                reason = f"{type(e).__name__}: {str(e)}"
                logger.warning(f"[InferenceRouter] Échec de {prov_name} ({latency_ms}ms) : {reason}")
                fallback_history.append({
                    "provider": prov_name,
                    "model": model_name,
                    "reason": reason,
                    "latency_ms": latency_ms,
                })

                # Notifier l'observabilité du basculement
                if idx < len(chain) - 1:
                    next_prov = chain[idx + 1]["name"]
                    yield {
                        "type": "provider_fallback",
                        "failed_provider": prov_name,
                        "next_provider": next_prov,
                        "reason": reason,
                    }

        # Tous les fournisseurs ont échoué
        err_msg = f"Échec de tous les fournisseurs d'inférence ({len(fallback_history)} tentatives). Arrêt contrôlé."
        logger.error(f"[InferenceRouter] {err_msg}")
        yield {
            "type": "error",
            "message": err_msg,
            "fallbacks": fallback_history,
        }

    async def complete_chat(
        self,
        messages: List[Dict[str, str]],
        system_content: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        mission_id: Optional[str] = None,
        run_id: Optional[str] = None,
        requested_provider: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Exécution non-streaming retournant la réponse complète et les métadonnées.
        """
        full_content = ""
        full_reasoning = ""
        selected_provider = "unknown"
        selected_model = "unknown"
        latency_ms = 0
        fallbacks: List[Dict[str, Any]] = []

        async for evt in self.stream_chat(
            messages=messages,
            system_content=system_content,
            temperature=temperature,
            max_tokens=max_tokens,
            mission_id=mission_id,
            run_id=run_id,
            requested_provider=requested_provider,
        ):
            evt_type = evt.get("type")
            if evt_type == "token":
                full_content += evt.get("text", "")
            elif evt_type == "reasoning_token":
                full_reasoning += evt.get("text", "")
            elif evt_type == "done":
                selected_provider = evt.get("provider", selected_provider)
                selected_model = evt.get("model", selected_model)
                latency_ms = evt.get("latency_ms", latency_ms)
                fallbacks = evt.get("fallbacks", fallbacks)
            elif evt_type == "error":
                raise RuntimeError(evt.get("message", "Échec d'inférence"))

        return {
            "content": full_content,
            "reasoning": full_reasoning or None,
            "provider": selected_provider,
            "model": selected_model,
            "latency_ms": latency_ms,
            "fallbacks": fallbacks,
        }


# Singleton canonique
inference_router = InferenceRouter()
