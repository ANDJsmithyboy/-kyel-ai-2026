"""
Ñkyel AI — Service Groq · SmartANDJ AI Technologies
Streaming SSE vers Groq (AURATA / SONAR) avec Rotation (18 clés) & Fallback Gemini.
Fondateur : Daniel Jonathan ANDJ
"""

import json
import time
import uuid
import os
from typing import AsyncGenerator, Optional

import httpx

from core.config import settings

# ── Mapping modèles publics → modèles réels (JAMAIS exposé côté client) ──
_MODEL_MAP = {
    "AURATA": settings.aurata_model,
    "SONAR": settings.sonar_model,
    "NKYEL_CHUI": settings.aurata_model,
    "NKYEL_RADI": settings.sonar_model,
    "NKYEL_TAI": settings.aurata_model,
    "BLACK_PANTHER": settings.aurata_model,
    "WANDANA": settings.sonar_model,
}

# ── System prompt national ───────────────────────────────────
NKYEL_SYSTEM_PROMPT = (
    "Tu es Ñkyel AI, l'intelligence artificielle souveraine d'Afrique, "
    "développée par SmartANDJ AI Technologies sous la direction de Daniel Jonathan ANDJ, CEO. "
    "Tu réponds en français par défaut, et tu maîtrises le fang, le mpongwé et le punu. "
    "Tu es expert sur l'Afrique : culture, histoire, économie, droit, géographie, santé, éducation. "
    "Tu es précis, clair, respectueux, et utile. "
    "Tu ne mentionnes JAMAIS le nom de ton modèle réel (LLaMA, Groq, Gemini, etc.). "
    "Tu es Ñkyel AI, point final."
)

_key_index = 0

def get_next_groq_key() -> str:
    global _key_index
    pool = settings.groq_keys_pool
    if not pool:
        return settings.groq_api_key
    key = pool[_key_index % len(pool)]
    _key_index += 1
    return key


async def stream_gemini_fallback(
    messages: list[dict],
    system_content: str,
    max_tokens: int,
    temperature: float,
) -> AsyncGenerator[dict, None]:
    """Fallback sur Gemini via REST API SSE en cas de Rate Limit Groq"""
    gemini_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or settings.google_api_key
    if not gemini_key:
        yield {"type": "error", "message": "Aucune clé Gemini disponible pour le fallback."}
        return

    # Convert to Gemini format
    gemini_contents = []
    for m in messages:
        if m["role"] == "system": continue
        gemini_contents.append({
            "role": "model" if m["role"] == "assistant" else "user",
            "parts": [{"text": m["content"]}]
        })

    model_name = os.getenv("NKYEL_PRIMARY_MODEL", "gemini-2.0-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:streamGenerateContent?alt=sse&key={gemini_key}"
    
    payload = {
        "contents": gemini_contents,
        "systemInstruction": {"parts": [{"text": system_content}]},
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens
        }
    }

    full_content = ""
    tokens_in = 0
    tokens_out = 0

    async with httpx.AsyncClient(timeout=90.0) as client:
        try:
            response = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
            response.raise_for_status()

            async for line in response.aiter_lines():
                line = line.strip()
                if not line or not line.startswith("data: "): continue
                data = line[6:].strip()
                if data == "[DONE]": continue

                try:
                    chunk = json.loads(data)
                    parts = chunk.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                    if parts:
                        text = parts[0].get("text", "")
                        if text:
                            full_content += text
                            tokens_out += 1
                            yield {"type": "token", "text": text}
                except:
                    pass

            yield {"type": "usage", "tokens_in": tokens_in, "tokens_out": tokens_out}
            yield {"type": "done", "content": full_content}

        except Exception as e:
            yield {"type": "error", "message": f"Erreur Gemini Fallback : {str(e)}"}


async def stream_groq(
    messages: list[dict],
    model: str = "AURATA",
    temperature: float = 0.7,
    max_tokens: int = 4096,
    loxo_context: Optional[str] = None,
) -> AsyncGenerator[dict, None]:
    """
    Appelle Groq en streaming. 
    Effectue des rotations de clés jusqu'à 3 tentatives.
    En cas d'échec total (Rate Limit sur toutes les clés), bascule sur Gemini en Fallback transparent.
    """
    groq_model = _MODEL_MAP.get(model, settings.aurata_model)

    # Construire le prompt système
    system_content = NKYEL_SYSTEM_PROMPT
    if loxo_context:
        system_content += f"\n\n--- CONTEXTE LOXO (sources web) ---\n{loxo_context}\n--- FIN CONTEXTE ---"

    final_messages = [{"role": "system", "content": system_content}]
    for m in messages:
        if m["role"] != "system":
            final_messages.append(m)

    max_retries = 3
    for attempt in range(max_retries):
        active_key = get_next_groq_key()
        tokens_in = 0
        tokens_out = 0
        full_content = ""

        async with httpx.AsyncClient(timeout=90.0) as client:
            try:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {active_key}",
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
                
                if response.status_code == 429:
                    # Rate limit, rotate and retry
                    continue
                    
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
                            tokens_out += 1
                            yield {"type": "token", "text": content}

                        usage = chunk.get("usage") or chunk.get("x_groq", {}).get("usage")
                        if usage:
                            tokens_in = usage.get("prompt_tokens", 0)
                            tokens_out = usage.get("completion_tokens", tokens_out)
                    except json.JSONDecodeError:
                        continue

                yield {"type": "usage", "tokens_in": tokens_in, "tokens_out": tokens_out}
                yield {"type": "done", "content": full_content}
                return # Succès complet

            except (httpx.HTTPStatusError, httpx.ConnectError) as e:
                # Erreur réseau ou 500, rotate and retry
                if attempt == max_retries - 1:
                    break # On basculera vers le fallback
                continue

    # Si on arrive ici, c'est que toutes les tentatives Groq ont échoué.
    # Fallback transparent vers Gemini
    async for event in stream_gemini_fallback(messages, system_content, max_tokens, temperature):
        yield event
