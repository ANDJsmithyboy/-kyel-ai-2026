"""
GabomaAI — Service Groq · SmartANDJ AI Technologies
Streaming SSE vers Groq (AURATA / SONAR).
Fondateur : Daniel Jonathan ANDJ
"""

import json
import time
import uuid
from typing import AsyncGenerator, Optional

import httpx

from core.config import settings

# ── Mapping modèles publics → modèles réels (JAMAIS exposé côté client) ──
_MODEL_MAP = {
    "AURATA": settings.aurata_model,
    "SONAR": settings.sonar_model,
}

# ── System prompt national ───────────────────────────────────
GABOMA_SYSTEM_PROMPT = (
    "Tu es GabomaGPT, l'intelligence artificielle souveraine du Gabon, "
    "développée par SmartANDJ AI Technologies sous la direction de Daniel Jonathan ANDJ, CEO. "
    "Tu réponds en français par défaut, et tu maîtrises le fang, le mpongwé et le punu. "
    "Tu es expert sur le Gabon : culture, histoire, économie, droit, géographie, santé, éducation. "
    "Tu es précis, clair, respectueux, et utile. "
    "Tu ne mentionnes JAMAIS le nom de ton modèle réel (LLaMA, Groq, etc.). "
    "Tu es GabomaGPT, point final."
)


async def stream_groq(
    messages: list[dict],
    model: str = "AURATA",
    temperature: float = 0.7,
    max_tokens: int = 4096,
    loxo_context: Optional[str] = None,
) -> AsyncGenerator[dict, None]:
    """
    Appelle Groq en streaming et yield des events structurés :
      {type: "token", text: "..."}
      {type: "usage", tokens_in: N, tokens_out: N}
      {type: "done"}
    """
    groq_model = _MODEL_MAP.get(model, settings.aurata_model)
    completion_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"

    # Construire le prompt système
    system_content = GABOMA_SYSTEM_PROMPT
    if loxo_context:
        system_content += f"\n\n--- CONTEXTE LOXO (sources web) ---\n{loxo_context}\n--- FIN CONTEXTE ---"

    # S'assurer qu'il y a un system prompt
    final_messages = [{"role": "system", "content": system_content}]
    for m in messages:
        if m["role"] != "system":
            final_messages.append(m)

    tokens_in = 0
    tokens_out = 0
    full_content = ""

    async with httpx.AsyncClient(timeout=90.0) as client:
        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": groq_model,
                    "messages": final_messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "stream": True,
                },
                timeout=90.0,
            )
            response.raise_for_status()

            async for line in response.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue
                data = line[6:]
                if data == "[DONE]":
                    break

                try:
                    chunk = json.loads(data)
                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        full_content += content
                        tokens_out += 1  # approximation par chunk
                        yield {"type": "token", "text": content}

                    # Récupérer usage si présent dans le dernier chunk
                    usage = chunk.get("usage") or chunk.get("x_groq", {}).get("usage")
                    if usage:
                        tokens_in = usage.get("prompt_tokens", 0)
                        tokens_out = usage.get("completion_tokens", tokens_out)
                except json.JSONDecodeError:
                    continue

            yield {"type": "usage", "tokens_in": tokens_in, "tokens_out": tokens_out}
            yield {"type": "done", "content": full_content}

        except httpx.HTTPStatusError as e:
            yield {"type": "error", "message": f"Erreur API : {e.response.status_code}"}
        except httpx.ConnectError:
            yield {"type": "error", "message": "Service temporairement indisponible"}
