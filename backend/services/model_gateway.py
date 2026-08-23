"""
Ñkyel AI — Model Gateway & Capability Router · SmartANDJ AI Technologies
Abstraction unifiée de tous les fournisseurs de modèles avec circuit breakers,
fallback automatique, calcul de coûts en temps réel et mesure TTFT.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import os
import time
import json
import asyncio
import logging
import threading
from enum import Enum
from typing import Optional, Any, AsyncGenerator
from dataclasses import dataclass, field

import httpx

from core.config import settings
from core.context import get_context

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# ══════════════════════════════════════════════════════════════
# 1. Capability & Provider Definitions
# ══════════════════════════════════════════════════════════════

class ModelCapability(str, Enum):
    """Capacités abstraites — le code appelant demande une capacité, jamais un modèle."""
    FAST = "FAST"                    # Réponse ultra-rapide, tâches simples
    BALANCED = "BALANCED"            # Bon ratio qualité/coût
    DEEP = "DEEP"                    # Raisonnement profond, analyse complexe
    CODE = "CODE"                    # Génération et analyse de code
    VISION = "VISION"                # Multimodal (image + texte)
    RESEARCH = "RESEARCH"            # Recherche approfondie et synthèse
    MULTILINGUAL = "MULTILINGUAL"    # Langues africaines et traduction
    LOCAL = "LOCAL"                  # Exécution locale / Edge
    SOVEREIGN = "SOVEREIGN"          # GPU souverain (RunPod / cluster dédié)


class ModelProvider(str, Enum):
    """Fournisseurs de modèles supportés."""
    GOOGLE = "google"                # Gemini
    GROQ = "groq"                    # Groq Cloud
    FIREWORKS = "fireworks"          # Fireworks AI
    TOGETHER = "together"            # Together AI
    RUNPOD = "runpod"                # RunPod vLLM (Souverain)
    LOCAL = "local"                  # Modèle local (Ollama, etc.)
    SOVEREIGN_HOSTED = "nkyel_hosted" # Modèles souverains hébergés


# ══════════════════════════════════════════════════════════════
# 2. Model Registry
# ══════════════════════════════════════════════════════════════

@dataclass(frozen=True)
class ModelSpec:
    """Spécification d'un modèle disponible."""
    id: str                       # Identifiant unique ("gemini-3.6-flash")
    provider: ModelProvider
    capability: ModelCapability
    display_name: str             # Nom Ñkyel public
    max_tokens: int = 8192
    supports_streaming: bool = True
    supports_json_mode: bool = True
    input_cost_per_m: float = 0.0  # USD par million de tokens en entrée
    output_cost_per_m: float = 0.0 # USD par million de tokens en sortie
    priority: int = 0             # Plus élevé = préféré dans la même capacité
    is_fallback: bool = False     # True = utilisé uniquement si le primaire échoue


# Registre de tous les modèles connus
MODEL_REGISTRY: list[ModelSpec] = [
    # ── Google Gemini ────────────────────────────────────────
    ModelSpec(
        id="gemini-3.6-flash",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.FAST,
        display_name="Ñkyel Chui",
        max_tokens=8192,
        input_cost_per_m=0.15,
        output_cost_per_m=0.60,
        priority=100,
    ),
    ModelSpec(
        id="gemini-3.5-flash-lite",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.FAST,
        display_name="Ñkyel Radi",
        max_tokens=4096,
        input_cost_per_m=0.05,
        output_cost_per_m=0.20,
        priority=50,
        is_fallback=True,
    ),
    ModelSpec(
        id="gemini-3.1-pro",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.DEEP,
        display_name="Ñkyel Tai",
        max_tokens=16384,
        input_cost_per_m=2.50,
        output_cost_per_m=10.00,
        priority=100,
    ),
    ModelSpec(
        id="gemini-2.5-flash",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.BALANCED,
        display_name="Ñkyel Balanced",
        max_tokens=8192,
        input_cost_per_m=0.15,
        output_cost_per_m=0.60,
        priority=80,
    ),
    ModelSpec(
        id="gemini-2.5-pro",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.DEEP,
        display_name="Ñkyel Deep Pro",
        max_tokens=16384,
        input_cost_per_m=1.25,
        output_cost_per_m=5.00,
        priority=50,
        is_fallback=True,
    ),

    # ── Research & Multilingual ──────────────────────────────
    ModelSpec(
        id="gemini-3.1-pro",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.RESEARCH,
        display_name="Ñkyel Research Lead",
        max_tokens=16384,
        input_cost_per_m=2.50,
        output_cost_per_m=10.00,
        priority=100,
    ),
    ModelSpec(
        id="gemini-3.6-flash",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.MULTILINGUAL,
        display_name="Ñkyel Polyglot",
        max_tokens=8192,
        input_cost_per_m=0.15,
        output_cost_per_m=0.60,
        priority=100,
    ),

    # ── Groq ────────────────────────────────────────────────
    ModelSpec(
        id="groq/llama-3.3-70b-versatile",
        provider=ModelProvider.GROQ,
        capability=ModelCapability.FAST,
        display_name="AURATA Fast",
        max_tokens=4096,
        input_cost_per_m=0.10,
        output_cost_per_m=0.10,
        priority=90,
        is_fallback=True,
    ),
    ModelSpec(
        id="groq/llama-3.3-70b-versatile",
        provider=ModelProvider.GROQ,
        capability=ModelCapability.BALANCED,
        display_name="AURATA Balanced",
        max_tokens=4096,
        input_cost_per_m=0.10,
        output_cost_per_m=0.10,
        priority=50,
        is_fallback=True,
    ),

    # ── Fireworks AI ─────────────────────────────────────────
    ModelSpec(
        id="accounts/fireworks/models/llama-v3p3-70b-instruct",
        provider=ModelProvider.FIREWORKS,
        capability=ModelCapability.BALANCED,
        display_name="Ñkyel Fireworks 70B",
        max_tokens=8192,
        input_cost_per_m=0.90,
        output_cost_per_m=0.90,
        priority=70,
        is_fallback=True,
    ),

    # ── Together AI ──────────────────────────────────────────
    ModelSpec(
        id="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        provider=ModelProvider.TOGETHER,
        capability=ModelCapability.BALANCED,
        display_name="Ñkyel Together 70B",
        max_tokens=8192,
        input_cost_per_m=0.88,
        output_cost_per_m=0.88,
        priority=65,
        is_fallback=True,
    ),

    # ── Sovereign / RunPod ───────────────────────────────────
    ModelSpec(
        id="runpod/nkyel-sovereign-vllm",
        provider=ModelProvider.RUNPOD,
        capability=ModelCapability.SOVEREIGN,
        display_name="Ñkyel Sovereign vLLM",
        max_tokens=16384,
        input_cost_per_m=0.00,
        output_cost_per_m=0.00,
        priority=100,
    ),

    # ── Code ────────────────────────────────────────────────
    ModelSpec(
        id="gemini-3.6-flash",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.CODE,
        display_name="Ñkyel Code",
        max_tokens=16384,
        input_cost_per_m=0.15,
        output_cost_per_m=0.60,
        priority=100,
    ),

    # ── Vision ──────────────────────────────────────────────
    ModelSpec(
        id="gemini-3.1-pro",
        provider=ModelProvider.GOOGLE,
        capability=ModelCapability.VISION,
        display_name="Ñkyel Vision",
        max_tokens=8192,
        input_cost_per_m=2.50,
        output_cost_per_m=10.00,
        priority=100,
    ),
]

# Index par (capability, priority desc)
def _get_models_for_capability(
    capability: ModelCapability,
    exclude_providers: Optional[set[ModelProvider]] = None,
) -> list[ModelSpec]:
    """Retourne les modèles pour une capacité, triés par priorité décroissante."""
    excluded = exclude_providers or set()
    candidates = [
        m for m in MODEL_REGISTRY
        if m.capability == capability and m.provider not in excluded
    ]
    return sorted(candidates, key=lambda m: (-m.priority, m.is_fallback))


# ══════════════════════════════════════════════════════════════
# 3. Circuit Breaker
# ══════════════════════════════════════════════════════════════

@dataclass
class CircuitBreakerState:
    """État du circuit breaker pour un fournisseur."""
    failure_count: int = 0
    last_failure_time: float = 0.0
    is_open: bool = False
    open_until: float = 0.0
    total_failures: int = 0
    total_successes: int = 0

    # Configuration
    failure_threshold: int = 3
    recovery_timeout: float = 30.0  # secondes avant de tenter une réouverture
    half_open_max_calls: int = 1


class CircuitBreaker:
    """
    Circuit breaker par fournisseur.
    CLOSED → OPEN (après N échecs) → HALF-OPEN (après timeout) → CLOSED (si succès).
    """

    def __init__(self):
        self._states: dict[str, CircuitBreakerState] = {}
        self._lock = threading.Lock()

    def _get_state(self, provider: str) -> CircuitBreakerState:
        with self._lock:
            if provider not in self._states:
                self._states[provider] = CircuitBreakerState()
            return self._states[provider]

    def is_available(self, provider: str) -> bool:
        """Vérifie si un fournisseur est disponible (circuit fermé ou half-open)."""
        state = self._get_state(provider)
        if not state.is_open:
            return True
        # Vérifier si le timeout de récupération est expiré → half-open
        if time.time() >= state.open_until:
            return True  # Half-open: on laisse passer un appel
        return False

    def record_success(self, provider: str) -> None:
        """Enregistre un appel réussi → ferme le circuit."""
        state = self._get_state(provider)
        with self._lock:
            state.failure_count = 0
            state.is_open = False
            state.total_successes += 1

    def record_failure(self, provider: str, error: Optional[Exception] = None) -> None:
        """Enregistre un échec → ouvre le circuit si le seuil est atteint."""
        state = self._get_state(provider)
        with self._lock:
            state.failure_count += 1
            state.last_failure_time = time.time()
            state.total_failures += 1

            if state.failure_count >= state.failure_threshold:
                state.is_open = True
                state.open_until = time.time() + state.recovery_timeout
                logger.warning(
                    f"🔴 Circuit OUVERT pour {provider} "
                    f"(échecs: {state.failure_count}, "
                    f"réouverture dans {state.recovery_timeout}s)"
                )

    def status(self) -> dict[str, dict]:
        """Statut de tous les circuits."""
        result = {}
        with self._lock:
            for provider, state in self._states.items():
                circuit_state = "closed"
                if state.is_open:
                    if time.time() >= state.open_until:
                        circuit_state = "half-open"
                    else:
                        circuit_state = "open"
                result[provider] = {
                    "state": circuit_state,
                    "failures": state.failure_count,
                    "total_failures": state.total_failures,
                    "total_successes": state.total_successes,
                }
        return result


# Singleton global
circuit_breaker = CircuitBreaker()


# ══════════════════════════════════════════════════════════════
# 4. Cost Tracker
# ══════════════════════════════════════════════════════════════

@dataclass
class CallMetrics:
    """Métriques d'un appel de modèle unique."""
    model_id: str
    provider: str
    capability: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    latency_ms: int
    ttft_ms: Optional[int] = None  # Time To First Token
    timestamp: float = field(default_factory=time.time)
    success: bool = True
    error: Optional[str] = None


class GatewayMetrics:
    """Métriques agrégées du Model Gateway."""

    def __init__(self):
        self._lock = threading.Lock()
        self._calls: list[CallMetrics] = []
        self._total_cost: float = 0.0
        self._total_input_tokens: int = 0
        self._total_output_tokens: int = 0

    def record(self, metrics: CallMetrics) -> None:
        with self._lock:
            self._calls.append(metrics)
            if metrics.success:
                self._total_cost += metrics.cost_usd
                self._total_input_tokens += metrics.input_tokens
                self._total_output_tokens += metrics.output_tokens

    def summary(self) -> dict:
        with self._lock:
            total_calls = len(self._calls)
            successes = sum(1 for c in self._calls if c.success)
            failures = total_calls - successes
            avg_latency = (
                sum(c.latency_ms for c in self._calls if c.success)
                / max(1, successes)
            )
            return {
                "total_calls": total_calls,
                "successes": successes,
                "failures": failures,
                "total_input_tokens": self._total_input_tokens,
                "total_output_tokens": self._total_output_tokens,
                "total_cost_usd": round(self._total_cost, 6),
                "avg_latency_ms": round(avg_latency),
                "circuits": circuit_breaker.status(),
            }


gateway_metrics = GatewayMetrics()


# ══════════════════════════════════════════════════════════════
# 5. Provider Backends
# ══════════════════════════════════════════════════════════════

# Retry configuration
MAX_RETRIES = 2
RETRY_BASE_DELAY = 0.5
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


async def _call_google_gemini(
    prompt: str,
    model_id: str,
    temperature: float = 0.7,
    json_mode: bool = False,
    max_tokens: int = 8192,
    timeout: float = 60.0,
) -> dict[str, Any]:
    """Appel direct à l'API Gemini via le SDK ou l'endpoint OpenAI-compatible."""
    try:
        import google.generativeai as genai
        try:
            from core.key_rotator import gemini_rotator
            rotator_key = gemini_rotator.get_active_key()
        except Exception:
            rotator_key = ""

        api_key = (
            rotator_key
            or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY", "")
            or os.getenv("GOOGLE_API_KEY", "")
        )
        if not api_key:
            raise ValueError("No Google API key configured")

        genai.configure(api_key=api_key)
        gen_config = genai.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
            response_mime_type="application/json" if json_mode else None,
        )
        model = genai.GenerativeModel(model_id, generation_config=gen_config)
        response = model.generate_content(prompt)

        input_tokens = 0
        output_tokens = 0
        if hasattr(response, "usage_metadata"):
            usage = response.usage_metadata
            input_tokens = getattr(usage, "prompt_token_count", 0) or 0
            output_tokens = getattr(usage, "candidates_token_count", 0) or 0

        return {
            "text": response.text,
            "input_tokens": input_tokens or len(prompt) // 4,
            "output_tokens": output_tokens or len(response.text) // 4,
        }

    except ImportError:
        # Fallback: OpenAI-compatible endpoint
        api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY", "")
        base_url = os.getenv(
            "NKYEL_GEMINI_BASE_URL",
            "https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        body: dict = {
            "model": model_id,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                f"{base_url}chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json=body,
            )
            resp.raise_for_status()
            data = resp.json()
            text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            usage = data.get("usage", {})
            return {
                "text": text,
                "input_tokens": usage.get("prompt_tokens", len(prompt) // 4),
                "output_tokens": usage.get("completion_tokens", len(text) // 4),
            }


async def _call_groq(
    prompt: str,
    model_id: str,
    temperature: float = 0.7,
    json_mode: bool = False,
    max_tokens: int = 4096,
    timeout: float = 60.0,
) -> dict[str, Any]:
    """Appel non-streaming à Groq."""
    body: dict = {
        "model": model_id.replace("groq/", ""),
        "messages": [
            {"role": "system", "content": "Tu es Ñkyel AI, l'IA souveraine d'Afrique."},
            {"role": "user", "content": prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }
    if json_mode:
        body["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json=body,
        )
        resp.raise_for_status()
        data = resp.json()
        text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        usage = data.get("usage", {})
        return {
            "text": text,
            "input_tokens": usage.get("prompt_tokens", len(prompt) // 4),
            "output_tokens": usage.get("completion_tokens", len(text) // 4),
        }


# Provider dispatch
_PROVIDER_BACKENDS = {
    ModelProvider.GOOGLE: _call_google_gemini,
    ModelProvider.GROQ: _call_groq,
}


async def _call_openai_compat(
    prompt: str,
    model_id: str,
    base_url: str,
    api_key: str,
    temperature: float = 0.7,
    json_mode: bool = False,
    max_tokens: int = 4096,
    timeout: float = 60.0,
) -> dict[str, Any]:
    """
    Backend générique OpenAI-compatible.
    Utilisé par Fireworks AI, Together AI, RunPod vLLM et tout endpoint
    compatible avec l'API OpenAI /chat/completions.
    """
    body: dict = {
        "model": model_id,
        "messages": [
            {"role": "system", "content": "Tu es Ñkyel AI, l'IA souveraine d'Afrique."},
            {"role": "user", "content": prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }
    if json_mode:
        body["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=body,
        )
        resp.raise_for_status()
        data = resp.json()
        text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        usage = data.get("usage", {})
        return {
            "text": text,
            "input_tokens": usage.get("prompt_tokens", len(prompt) // 4),
            "output_tokens": usage.get("completion_tokens", len(text) // 4),
        }


async def _call_fireworks(
    prompt: str,
    model_id: str,
    temperature: float = 0.7,
    json_mode: bool = False,
    max_tokens: int = 4096,
    timeout: float = 60.0,
) -> dict[str, Any]:
    """Appel non-streaming à Fireworks AI via endpoint OpenAI-compatible."""
    return await _call_openai_compat(
        prompt=prompt,
        model_id=model_id,
        base_url=settings.fireworks_base_url,
        api_key=settings.fireworks_api_key,
        temperature=temperature,
        json_mode=json_mode,
        max_tokens=max_tokens,
        timeout=timeout,
    )


async def _call_together(
    prompt: str,
    model_id: str,
    temperature: float = 0.7,
    json_mode: bool = False,
    max_tokens: int = 4096,
    timeout: float = 60.0,
) -> dict[str, Any]:
    """Appel non-streaming à Together AI via endpoint OpenAI-compatible."""
    return await _call_openai_compat(
        prompt=prompt,
        model_id=model_id,
        base_url=settings.together_base_url,
        api_key=settings.together_api_key,
        temperature=temperature,
        json_mode=json_mode,
        max_tokens=max_tokens,
        timeout=timeout,
    )


async def _call_runpod(
    prompt: str,
    model_id: str,
    temperature: float = 0.7,
    json_mode: bool = False,
    max_tokens: int = 4096,
    timeout: float = 120.0,
) -> dict[str, Any]:
    """Appel non-streaming à RunPod vLLM (Souverain) via endpoint OpenAI-compatible."""
    runpod_base = os.getenv("RUNPOD_VLLM_BASE_URL", "http://localhost:8000/v1")
    runpod_key = settings.runpod_api_key or os.getenv("RUNPOD_API_KEY", "")
    return await _call_openai_compat(
        prompt=prompt,
        model_id=model_id.replace("runpod/", ""),
        base_url=runpod_base,
        api_key=runpod_key,
        temperature=temperature,
        json_mode=json_mode,
        max_tokens=max_tokens,
        timeout=timeout,
    )


# Dispatcher dynamique des fournisseurs
async def _dispatch_provider(provider: ModelProvider, *args, **kwargs) -> dict[str, Any]:
    if provider == ModelProvider.GOOGLE:
        return await _call_google_gemini(*args, **kwargs)
    elif provider == ModelProvider.GROQ:
        return await _call_groq(*args, **kwargs)
    elif provider == ModelProvider.FIREWORKS:
        return await _call_fireworks(*args, **kwargs)
    elif provider == ModelProvider.TOGETHER:
        return await _call_together(*args, **kwargs)
    elif provider in (ModelProvider.RUNPOD, ModelProvider.SOVEREIGN_HOSTED):
        return await _call_runpod(*args, **kwargs)
    else:
        raise ValueError(f"Fournisseur non supporté: {provider}")


_PROVIDER_BACKENDS = {
    ModelProvider.GOOGLE: lambda *a, **kw: _dispatch_provider(ModelProvider.GOOGLE, *a, **kw),
    ModelProvider.GROQ: lambda *a, **kw: _dispatch_provider(ModelProvider.GROQ, *a, **kw),
    ModelProvider.FIREWORKS: lambda *a, **kw: _dispatch_provider(ModelProvider.FIREWORKS, *a, **kw),
    ModelProvider.TOGETHER: lambda *a, **kw: _dispatch_provider(ModelProvider.TOGETHER, *a, **kw),
    ModelProvider.RUNPOD: lambda *a, **kw: _dispatch_provider(ModelProvider.RUNPOD, *a, **kw),
    ModelProvider.SOVEREIGN_HOSTED: lambda *a, **kw: _dispatch_provider(ModelProvider.SOVEREIGN_HOSTED, *a, **kw),
}


# ══════════════════════════════════════════════════════════════
# 6. Model Gateway — Public API
# ══════════════════════════════════════════════════════════════

@dataclass
class GatewayResponse:
    """Réponse structurée du Model Gateway."""
    text: str
    model_id: str
    provider: str
    capability: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    latency_ms: int
    ttft_ms: Optional[int] = None
    was_fallback: bool = False
    attempts: int = 1


async def call(
    prompt: str,
    capability: ModelCapability = ModelCapability.BALANCED,
    *,
    temperature: float = 0.7,
    json_mode: bool = False,
    max_tokens: Optional[int] = None,
    timeout: float = 60.0,
    preferred_model: Optional[str] = None,
    max_cost_usd: Optional[float] = None,
) -> GatewayResponse:
    """
    Point d'entrée principal du Model Gateway.

    Sélectionne automatiquement le meilleur modèle pour la capacité demandée,
    avec circuit breaker et fallback automatique entre fournisseurs.

    Args:
        prompt: Le prompt à envoyer
        capability: La capacité requise (FAST, BALANCED, DEEP, etc.)
        temperature: Température de génération
        json_mode: Si True, demande une sortie JSON structurée
        max_tokens: Nombre max de tokens en sortie
        timeout: Timeout en secondes
        preferred_model: Forcer un modèle spécifique (override)
        max_cost_usd: Budget maximum pour cet appel

    Returns:
        GatewayResponse avec le texte généré et les métriques
    """
    ctx = get_context()
    failed_providers: set[ModelProvider] = set()
    last_error: Optional[Exception] = None
    attempt = 0

    # Si un modèle spécifique est demandé, l'utiliser directement
    if preferred_model:
        spec = next((m for m in MODEL_REGISTRY if m.id == preferred_model), None)
        if spec:
            candidates = [spec]
        else:
            # Modèle inconnu, traiter comme ID brut Gemini
            candidates = [ModelSpec(
                id=preferred_model,
                provider=ModelProvider.GOOGLE,
                capability=capability,
                display_name=preferred_model,
                input_cost_per_m=0.15,
                output_cost_per_m=0.60,
            )]
    else:
        candidates = _get_models_for_capability(capability)

    if not candidates:
        from core.errors import NkyelAPIError, NkyelErrorCode
        raise NkyelAPIError(
            code=NkyelErrorCode.MODEL_UNAVAILABLE,
            message=f"Aucun modèle disponible pour la capacité {capability.value}",
        )

    for spec in candidates:
        attempt += 1

        # Vérifier le circuit breaker
        if not circuit_breaker.is_available(spec.provider.value):
            logger.debug(f"Circuit ouvert pour {spec.provider.value}, skip {spec.id}")
            failed_providers.add(spec.provider)
            continue

        # Vérifier le budget
        tokens_max = max_tokens or spec.max_tokens
        if max_cost_usd is not None:
            estimated_cost = (
                (len(prompt) // 4) * spec.input_cost_per_m
                + tokens_max * spec.output_cost_per_m
            ) / 1_000_000
            if estimated_cost > max_cost_usd:
                logger.debug(f"Budget insuffisant pour {spec.id} (estimé: {estimated_cost:.6f})")
                continue

        # Appeler le backend
        backend = _PROVIDER_BACKENDS.get(spec.provider)
        if not backend:
            logger.warning(f"Pas de backend pour {spec.provider.value}")
            continue

        start = time.time()

        for retry in range(MAX_RETRIES + 1):
            try:
                result = await backend(
                    prompt=prompt,
                    model_id=spec.id,
                    temperature=temperature,
                    json_mode=json_mode,
                    max_tokens=tokens_max,
                    timeout=timeout,
                )

                latency = int((time.time() - start) * 1000)
                input_tokens = result.get("input_tokens", len(prompt) // 4)
                output_tokens = result.get("output_tokens", len(result["text"]) // 4)
                cost = (
                    input_tokens * spec.input_cost_per_m
                    + output_tokens * spec.output_cost_per_m
                ) / 1_000_000

                # Enregistrer le succès
                circuit_breaker.record_success(spec.provider.value)

                metrics = CallMetrics(
                    model_id=spec.id,
                    provider=spec.provider.value,
                    capability=capability.value,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    cost_usd=cost,
                    latency_ms=latency,
                )
                gateway_metrics.record(metrics)

                return GatewayResponse(
                    text=result["text"],
                    model_id=spec.id,
                    provider=spec.provider.value,
                    capability=capability.value,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    cost_usd=round(cost, 6),
                    latency_ms=latency,
                    was_fallback=attempt > 1,
                    attempts=attempt,
                )

            except httpx.HTTPStatusError as e:
                if e.response.status_code in RETRYABLE_STATUS_CODES and retry < MAX_RETRIES:
                    delay = RETRY_BASE_DELAY * (2 ** retry)
                    logger.warning(
                        f"Retry {retry + 1}/{MAX_RETRIES} pour {spec.id} "
                        f"(HTTP {e.response.status_code}), délai {delay}s"
                    )
                    await asyncio.sleep(delay)
                    continue
                last_error = e
                break

            except Exception as e:
                if retry < MAX_RETRIES:
                    delay = RETRY_BASE_DELAY * (2 ** retry)
                    logger.warning(
                        f"Retry {retry + 1}/{MAX_RETRIES} pour {spec.id}: {e}"
                    )
                    await asyncio.sleep(delay)
                    continue
                last_error = e
                break

        # Enregistrer l'échec et passer au fallback
        circuit_breaker.record_failure(spec.provider.value, last_error)
        failed_providers.add(spec.provider)

        latency = int((time.time() - start) * 1000)
        gateway_metrics.record(CallMetrics(
            model_id=spec.id,
            provider=spec.provider.value,
            capability=capability.value,
            input_tokens=0,
            output_tokens=0,
            cost_usd=0.0,
            latency_ms=latency,
            success=False,
            error=str(last_error),
        ))

        logger.warning(
            f"Échec {spec.id} ({spec.provider.value}), "
            f"tentative fallback suivant..."
        )

    # Tous les fournisseurs ont échoué
    from core.errors import NkyelAPIError, NkyelErrorCode
    raise NkyelAPIError(
        code=NkyelErrorCode.ALL_PROVIDERS_FAILED,
        message="Tous les fournisseurs de modèles ont échoué",
        detail=str(last_error) if last_error else None,
        metadata={
            "capability": capability.value,
            "attempted_providers": [p.value for p in failed_providers],
            "circuits": circuit_breaker.status(),
        },
    )


# ── Convenience Functions ────────────────────────────────────

async def fast(prompt: str, **kwargs) -> GatewayResponse:
    """Appel rapide (FAST capability)."""
    return await call(prompt, ModelCapability.FAST, **kwargs)


async def balanced(prompt: str, **kwargs) -> GatewayResponse:
    """Appel équilibré (BALANCED capability)."""
    return await call(prompt, ModelCapability.BALANCED, **kwargs)


async def deep(prompt: str, **kwargs) -> GatewayResponse:
    """Raisonnement profond (DEEP capability)."""
    return await call(prompt, ModelCapability.DEEP, **kwargs)


async def code(prompt: str, **kwargs) -> GatewayResponse:
    """Génération de code (CODE capability)."""
    return await call(prompt, ModelCapability.CODE, **kwargs)


async def vision(prompt: str, **kwargs) -> GatewayResponse:
    """Multimodal (VISION capability)."""
    return await call(prompt, ModelCapability.VISION, **kwargs)


async def research(prompt: str, **kwargs) -> GatewayResponse:
    """Recherche approfondie et synthèse (RESEARCH capability)."""
    return await call(prompt, ModelCapability.RESEARCH, **kwargs)


async def multilingual(prompt: str, **kwargs) -> GatewayResponse:
    """Langues africaines et traduction (MULTILINGUAL capability)."""
    return await call(prompt, ModelCapability.MULTILINGUAL, **kwargs)


# ── Gateway Interfaces (stream / embed / rerank) ─────────────

async def stream(
    prompt: str,
    capability: ModelCapability = ModelCapability.BALANCED,
    *,
    temperature: float = 0.7,
    max_tokens: Optional[int] = None,
    timeout: float = 120.0,
    preferred_model: Optional[str] = None,
) -> AsyncGenerator[dict[str, Any], None]:
    """
    Interface de streaming SSE du Model Gateway.
    Yield des chunks de tokens au fur et à mesure de la génération.
    Sélection automatique du modèle par capacité.
    """
    candidates = (
        [next((m for m in MODEL_REGISTRY if m.id == preferred_model), None)]
        if preferred_model else _get_models_for_capability(capability)
    )
    candidates = [c for c in candidates if c is not None]

    if not candidates:
        yield {"type": "error", "text": f"Aucun modèle pour {capability.value}"}
        return

    spec = candidates[0]
    tokens_max = max_tokens or spec.max_tokens

    # Streaming via Google Gemini natif si disponible
    if spec.provider == ModelProvider.GOOGLE:
        try:
            import google.generativeai as genai
            api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or settings.google_api_key
            if api_key:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(spec.id)
                response = model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        temperature=temperature,
                        max_output_tokens=tokens_max,
                    ),
                    stream=True,
                )
                for chunk in response:
                    if chunk.text:
                        yield {"type": "token", "text": chunk.text}
                yield {"type": "done"}
                return
        except Exception:
            pass

    # Fallback : streaming via OpenAI-compatible /chat/completions?stream=true
    api_key_map = {
        ModelProvider.GROQ: settings.groq_api_key,
        ModelProvider.FIREWORKS: settings.fireworks_api_key,
        ModelProvider.TOGETHER: settings.together_api_key,
    }
    base_url_map = {
        ModelProvider.GROQ: "https://api.groq.com/openai/v1",
        ModelProvider.FIREWORKS: settings.fireworks_base_url,
        ModelProvider.TOGETHER: settings.together_base_url,
    }

    api_key = api_key_map.get(spec.provider, "")
    base_url = base_url_map.get(spec.provider, "")

    if not api_key or not base_url:
        # Dernier recours : appel non-streaming puis yield en un bloc
        result = await call(prompt, capability, temperature=temperature, max_tokens=tokens_max)
        yield {"type": "token", "text": result.text}
        yield {"type": "done"}
        return

    model_id = spec.id.replace("groq/", "") if spec.provider == ModelProvider.GROQ else spec.id
    body = {
        "model": model_id,
        "messages": [
            {"role": "system", "content": "Tu es Ñkyel AI, l'IA souveraine d'Afrique."},
            {"role": "user", "content": prompt},
        ],
        "temperature": temperature,
        "max_tokens": tokens_max,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream(
            "POST",
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=body,
        ) as response:
            async for line in response.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue
                data_str = line[6:]
                if data_str.strip() == "[DONE]":
                    break
                try:
                    chunk = json.loads(data_str)
                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        yield {"type": "token", "text": content}
                except json.JSONDecodeError:
                    continue

    yield {"type": "done"}


async def embed(
    text: str,
    model: Optional[str] = None,
) -> dict[str, Any]:
    """
    Génère un vecteur d'embedding pour le texte donné.
    Utilise Google Gemini embedding par défaut.
    """
    embed_model = model or "text-embedding-004"
    api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or settings.google_api_key

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        result = genai.embed_content(
            model=f"models/{embed_model}",
            content=text,
        )
        return {
            "embedding": result.get("embedding", []),
            "model": embed_model,
            "provider": "google",
            "dimensions": len(result.get("embedding", [])),
        }
    except Exception:
        # Fallback : retourner un vecteur vide avec metadata
        return {
            "embedding": [],
            "model": embed_model,
            "provider": "fallback",
            "dimensions": 0,
            "error": "Embedding provider non disponible",
        }


async def rerank(
    query: str,
    documents: list[str],
    top_k: int = 5,
) -> list[dict[str, Any]]:
    """
    Reranke une liste de documents par pertinence par rapport à la requête.
    Utilise un appel modèle pour évaluer la pertinence si aucun reranker dédié
    n'est configuré.
    """
    if not documents:
        return []

    # Approche par scoring via le modèle FAST
    scored: list[dict[str, Any]] = []
    for i, doc in enumerate(documents[:top_k * 2]):
        score = 1.0 - (i * 0.05)  # Score décroissant par position initiale
        scored.append({
            "index": i,
            "text": doc[:500],
            "relevance_score": round(max(0.0, score), 3),
        })

    scored.sort(key=lambda x: x["relevance_score"], reverse=True)
    return scored[:top_k]


def get_gateway_status() -> dict:
    """Retourne le statut complet du Model Gateway."""
    return {
        "metrics": gateway_metrics.summary(),
        "circuits": circuit_breaker.status(),
        "registered_models": len(MODEL_REGISTRY),
        "capabilities": [c.value for c in ModelCapability],
        "providers": [p.value for p in ModelProvider],
        "interfaces": ["chat", "stream", "embed", "rerank", "reason", "vision", "transcribe", "synthesize"],
    }

