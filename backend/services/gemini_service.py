"""
Ñkyel AI — Gemini Service · SmartANDJ AI Technologies
Google Gemini integration for the Ñkyel agent runtime.

This service wraps Google's Generative AI SDK to provide
planning, analysis, and synthesis capabilities.

Fondateur : Daniel Jonathan ANDJ
"""

import os
import time
import json
from typing import Optional


def _get_gemini_client():
    """Lazily initialize the Gemini client."""
    try:
        import google.generativeai as genai
        api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY", "")
        if not api_key:
            raise ValueError("GOOGLE_GENERATIVE_AI_API_KEY not set")
        genai.configure(api_key=api_key)
        return genai
    except ImportError:
        # Fallback: use the OpenAI-compatible endpoint
        return None


def _call_gemini(prompt: str, model_name: Optional[str] = None) -> dict:
    """
    Call Gemini via the official SDK or the OpenAI-compatible endpoint.
    Returns {"text": str, "model": str, "latency_ms": int}.
    """
    model_name = model_name or os.getenv("NKYEL_PRIMARY_MODEL", "gemini-2.5-flash")
    start = time.time()

    genai = _get_gemini_client()

    if genai is not None:
        # Official SDK path
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        text = response.text
    else:
        # Fallback: OpenAI-compatible endpoint
        import httpx
        api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY", "")
        base_url = os.getenv(
            "NKYEL_GEMINI_BASE_URL",
            "https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        client = httpx.Client(timeout=60.0)
        resp = client.post(
            f"{base_url}chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        text = data.get("choices", [{}])[0].get("message", {}).get("content", "")

    latency = int((time.time() - start) * 1000)

    return {
        "text": text,
        "model": model_name,
        "provider": "google",
        "latency_ms": latency,
    }


def gemini_plan(prompt: str) -> dict:
    """Use Gemini for planning tasks."""
    model = os.getenv("NKYEL_PLANNING_MODEL", "gemini-2.5-flash")
    return _call_gemini(prompt, model)


def gemini_analyze(prompt: str) -> dict:
    """Use Gemini for analysis tasks."""
    return _call_gemini(prompt)


def gemini_synthesize(prompt: str) -> dict:
    """Use Gemini for synthesis tasks."""
    return _call_gemini(prompt)


def gemini_critique(prompt: str) -> dict:
    """Use Gemini for critique/verification tasks."""
    return _call_gemini(prompt)
