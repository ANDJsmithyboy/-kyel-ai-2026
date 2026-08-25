"""
Ñkyel AI — Gemini Service · SmartANDJ AI Technologies
Google Gemini integration for the Ñkyel agent runtime.

Features:
- Retry with exponential backoff (3 attempts)
- Structured JSON output mode
- Per-call cost tracking
- Timeout handling
- Detailed call metrics

Fondateur : Daniel Jonathan ANDJ
"""

import os
import time
import json
import logging
from typing import Optional, Any

logger = logging.getLogger(__name__)


# ─── Cost Tracker ────────────────────────────────────────

class GeminiCostTracker:
    """Tracks cumulative token usage and estimated cost."""

    # Approximate pricing per 1M tokens (USD)
    PRICING = {
        # Gemini 3.x generation
        "gemini-3.1-pro":       {"input": 2.50, "output": 10.00},
        "gemini-3.6-flash":     {"input": 0.15, "output": 0.60},
        "gemini-3.5-flash-lite":{"input": 0.05, "output": 0.20},
        "gemini-3-flash":       {"input": 0.10, "output": 0.40},
        # Gemini 2.x generation (legacy)
        "gemini-2.5-flash":     {"input": 0.15, "output": 0.60},
        "gemini-2.5-pro":       {"input": 1.25, "output": 5.00},
        "gemini-2.0-flash":     {"input": 0.10, "output": 0.40},
    }

    def __init__(self):
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_calls = 0
        self.total_cost_usd = 0.0
        self.total_latency_ms = 0
        self.call_history: list[dict] = []

    def record(self, model: str, input_tokens: int, output_tokens: int, latency_ms: int):
        """Record a Gemini call."""
        pricing = self.PRICING.get(model, self.PRICING["gemini-2.5-flash"])
        cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000

        self.total_input_tokens += input_tokens
        self.total_output_tokens += output_tokens
        self.total_calls += 1
        self.total_cost_usd += cost
        self.total_latency_ms += latency_ms

        entry = {
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": round(cost, 6),
            "latency_ms": latency_ms,
            "timestamp": time.time(),
        }
        self.call_history.append(entry)
        return entry

    def summary(self) -> dict:
        return {
            "total_calls": self.total_calls,
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "total_cost_usd": round(self.total_cost_usd, 6),
            "total_latency_ms": self.total_latency_ms,
            "avg_latency_ms": round(self.total_latency_ms / max(1, self.total_calls)),
        }


# Singleton
cost_tracker = GeminiCostTracker()


# ─── Ñkyel → Gemini Model Map ───────────────────────────
# Maps each Ñkyel public model name to the actual Gemini model ID.
NKYEL_MODEL_MAP = {
    "nkyel-chui":       "gemini-3.6-flash",       # Rapide, efficace
    "nkyel-tai":        "gemini-3.1-pro",          # Raisonnement profond
    "nkyel-radi":       "gemini-3.5-flash-lite",   # Langues gabonaises, léger
    "recherche-web":    "gemini-3.6-flash",        # Recherche web
    "blue-panther":     "gemini-3.1-pro",          # Mode Créateur
    # Fallback direct Gemini model names
    "gemini-3.1-pro":       "gemini-3.1-pro",
    "gemini-3.6-flash":     "gemini-3.6-flash",
    "gemini-3.5-flash-lite":"gemini-3.5-flash-lite",
    "gemini-3-flash":       "gemini-3-flash",
}


def resolve_model(nkyel_name: str) -> str:
    """Resolve a Ñkyel model name to the actual Gemini model ID."""
    return NKYEL_MODEL_MAP.get(nkyel_name, nkyel_name)


# ─── Retry Logic ─────────────────────────────────────────

MAX_RETRIES = 3
RETRY_BASE_DELAY = 1.0  # seconds
RETRY_MAX_DELAY = 8.0


def _retry_with_backoff(fn, *args, **kwargs) -> Any:
    """Call fn with exponential backoff on failure."""
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            return fn(*args, **kwargs)
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                delay = min(RETRY_BASE_DELAY * (2 ** attempt), RETRY_MAX_DELAY)
                logger.warning(f"Gemini call failed (attempt {attempt + 1}/{MAX_RETRIES}): {e}. Retrying in {delay}s...")
                time.sleep(delay)
            else:
                logger.error(f"Gemini call failed after {MAX_RETRIES} attempts: {e}")
    raise last_error


# ─── Client Init ─────────────────────────────────────────

def _get_gemini_client():
    """Lazily initialize the Gemini client with multi-key rotator."""
    try:
        import google.generativeai as genai
        from core.key_rotator import gemini_rotator
        api_key = gemini_rotator.get_active_key() or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
        if not api_key:
            raise ValueError("GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_API_KEY not set")
        genai.configure(api_key=api_key)
        return genai
    except ImportError:
        # Fallback: use the OpenAI-compatible endpoint
        return None



# ─── Core Call ───────────────────────────────────────────

def _call_gemini_once(
    prompt: str,
    model_name: Optional[str] = None,
    response_mime_type: Optional[str] = None,
    temperature: float = 0.7,
    timeout: float = 60.0,
    mission_id: str = "",
    capability: str = "gemini.reason",
) -> dict:
    """
    Single Gemini call (no retry).
    Returns {"text": str, "model": str, "provider": str, "latency_ms": int,
             "input_tokens": int, "output_tokens": int, "cost_usd": float}.
    """
    model_name = model_name or os.getenv("NKYEL_PRIMARY_MODEL", "gemini-3.6-flash")
    # Resolve Ñkyel name → real Gemini model ID
    model_name = resolve_model(model_name)
    start = time.time()

    genai = _get_gemini_client()
    input_tokens = 0
    output_tokens = 0

    if genai is not None:
        # Official SDK path
        generation_config = {"temperature": temperature}
        if response_mime_type:
            generation_config["response_mime_type"] = response_mime_type

        # Use gemini-2.5-flash fallback if 3.x alias not yet provisioned in SDK
        sdk_model = model_name
        if "3.6-flash" in sdk_model or "3-flash" in sdk_model:
            sdk_model = "gemini-2.5-flash"
        elif "3.1-pro" in sdk_model:
            sdk_model = "gemini-2.5-pro"

        try:
            model = genai.GenerativeModel(sdk_model, generation_config=generation_config)
            response = model.generate_content(prompt)
            text = response.text
        except Exception:
            # Fallback to gemini-2.5-flash
            model = genai.GenerativeModel("gemini-2.5-flash", generation_config=generation_config)
            response = model.generate_content(prompt)
            text = response.text

        # Extract token counts if available
        if hasattr(response, "usage_metadata"):
            usage = response.usage_metadata
            input_tokens = getattr(usage, "prompt_token_count", 0) or 0
            output_tokens = getattr(usage, "candidates_token_count", 0) or 0
    else:
        # Fallback: OpenAI-compatible endpoint
        import httpx
        api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
        base_url = os.getenv(
            "NKYEL_GEMINI_BASE_URL",
            "https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        with httpx.Client(timeout=timeout) as client:
            body: dict = {
                "model": "gemini-2.5-flash",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
            }
            if response_mime_type == "application/json":
                body["response_format"] = {"type": "json_object"}

            resp = client.post(
                f"{base_url}chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json=body,
            )
            resp.raise_for_status()
            data = resp.json()
            text = data.get("choices", [{}])[0].get("message", {}).get("content", "")

            # Extract token counts
            usage_data = data.get("usage", {})
            input_tokens = usage_data.get("prompt_tokens", 0)
            output_tokens = usage_data.get("completion_tokens", 0)

    latency = int((time.time() - start) * 1000)

    # Estimate tokens if not provided
    if input_tokens == 0:
        input_tokens = len(prompt) // 4  # rough estimate
    if output_tokens == 0:
        output_tokens = len(text) // 4

    # Record cost
    cost_entry = cost_tracker.record(model_name, input_tokens, output_tokens, latency)

    # Enregistrer la télémétrie Google vérifiée
    if mission_id:
        from core.telemetry import record_google_telemetry
        record_google_telemetry(
            mission_id=mission_id,
            capability=capability,
            model=model_name,
            provider="google",
            access_method="DIRECT_GOOGLE",
            latency_ms=latency,
            cost_usd=cost_entry["cost_usd"],
            metadata={"input_tokens": input_tokens, "output_tokens": output_tokens},
        )

    return {
        "text": text,
        "model": model_name,
        "provider": "google",
        "latency_ms": latency,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_usd": cost_entry["cost_usd"],
    }


def _call_gemini(
    prompt: str,
    model_name: Optional[str] = None,
    json_mode: bool = False,
    temperature: float = 0.7,
    timeout: float = 60.0,
    mission_id: str = "",
    capability: str = "gemini.reason",
) -> dict:
    """
    Call Gemini with retry and optional structured JSON output.
    Returns {"text": str, "model": str, "latency_ms": int, ...}.
    """
    mime_type = "application/json" if json_mode else None

    return _retry_with_backoff(
        _call_gemini_once,
        prompt,
        model_name=model_name,
        response_mime_type=mime_type,
        temperature=temperature,
        timeout=timeout,
        mission_id=mission_id,
        capability=capability,
    )


# ─── Public API ──────────────────────────────────────────

def gemini_plan(prompt: str, mission_id: str = "") -> dict:
    """Use Gemini for planning tasks (structured JSON output)."""
    model = os.getenv("NKYEL_PLANNING_MODEL", "gemini-3.6-flash")
    return _call_gemini(prompt, model, json_mode=True, temperature=0.4, mission_id=mission_id, capability="gemini.plan")


def gemini_analyze(prompt: str, mission_id: str = "") -> dict:
    """Use Gemini for analysis tasks (structured JSON output)."""
    return _call_gemini(prompt, json_mode=True, temperature=0.5, mission_id=mission_id, capability="gemini.analyze")


def gemini_synthesize(prompt: str, mission_id: str = "") -> dict:
    """Use Gemini for synthesis tasks (natural language output)."""
    return _call_gemini(prompt, temperature=0.7, mission_id=mission_id, capability="gemini.synthesize")


def gemini_critique(prompt: str, mission_id: str = "") -> dict:
    """Use Gemini for critique/verification tasks."""
    return _call_gemini(prompt, json_mode=True, temperature=0.3, mission_id=mission_id, capability="gemini.reason")


def get_cost_summary() -> dict:
    """Return cumulative cost/usage summary."""
    return cost_tracker.summary()

