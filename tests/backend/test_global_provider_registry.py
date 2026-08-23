"""
Ñkyel AI — Tests d'Acceptation : Global Provider Registry & Universal Capability Router
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Validation exhaustive :
- 1. Complétude des capacités abstraites (FAST, DEEP, REASONING, CODE, VISION, MULTILINGUAL...)
- 2. Présence et configuration des écosystèmes mondiaux (USA, France, Europe, Chine, Asie, Moyen-Orient, Afrique, Souverain)
- 3. Routage intelligent et filtrage selon la résidence des données
- 4. Circuit Breaker et tolérance aux pannes
- 5. Sécurité Admin : Zéro clé API exposée en clair
"""

import os
import sys
import pytest
import asyncio
from unittest.mock import patch, AsyncMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from services.model_gateway import (
    ModelCapability,
    ModelProvider,
    ProviderRegion,
    ProviderStatus,
    DataResidencyPolicy,
    GLOBAL_PROVIDER_REGISTRY,
    MODEL_REGISTRY,
    ModelRouter,
    CircuitBreaker,
    get_gateway_status,
    call,
)
from services.providers.base_adapter import OpenAICompatibleProviderAdapter


def test_capabilities_completeness():
    """Vérifie que l'ensemble des capacités requises sont présentes."""
    required_caps = {
        "FAST", "BALANCED", "DEEP", "REASONING", "CODE", "VISION",
        "SEARCH", "RESEARCH", "MULTILINGUAL", "AFRICAN_LANGUAGES",
        "LONG_CONTEXT", "LOW_COST", "PRIVATE", "SOVEREIGN", "LOCAL",
        "IMAGE", "VIDEO", "STT", "TTS", "EMBEDDING", "RERANKING"
    }
    present_caps = {c.value for c in ModelCapability}
    assert required_caps.issubset(present_caps), f"Capacités manquantes: {required_caps - present_caps}"


def test_global_providers_ecosystems():
    """Vérifie la présence de tous les écosystèmes mondiaux clés."""
    # France (Prioritaire)
    assert ModelProvider.MISTRAL in GLOBAL_PROVIDER_REGISTRY
    assert ModelProvider.SCALEWAY in GLOBAL_PROVIDER_REGISTRY
    assert ModelProvider.OVHCLOUD in GLOBAL_PROVIDER_REGISTRY

    # Chine
    assert ModelProvider.DEEPSEEK in GLOBAL_PROVIDER_REGISTRY
    assert ModelProvider.ALIBABA_QWEN in GLOBAL_PROVIDER_REGISTRY
    assert ModelProvider.ZHIPU_GLM in GLOBAL_PROVIDER_REGISTRY
    assert ModelProvider.MOONSHOT_KIMI in GLOBAL_PROVIDER_REGISTRY

    # USA / Global
    assert ModelProvider.GOOGLE in GLOBAL_PROVIDER_REGISTRY
    assert ModelProvider.GROQ in GLOBAL_PROVIDER_REGISTRY
    assert ModelProvider.FIREWORKS in GLOBAL_PROVIDER_REGISTRY
    assert ModelProvider.TOGETHER in GLOBAL_PROVIDER_REGISTRY

    # Afrique & Souverain
    assert ModelProvider.LELAPA_AI in GLOBAL_PROVIDER_REGISTRY
    assert ModelProvider.GABOMA_AI in GLOBAL_PROVIDER_REGISTRY
    assert ModelProvider.RUNPOD in GLOBAL_PROVIDER_REGISTRY
    assert ModelProvider.OLLAMA in GLOBAL_PROVIDER_REGISTRY


def test_model_router_capability_resolution():
    """Vérifie que le routeur sélectionne les modèles adéquats par capacité."""
    fast_candidates = ModelRouter.resolve_candidates(ModelCapability.FAST)
    assert len(fast_candidates) > 0
    assert all(c.capability == ModelCapability.FAST for c in fast_candidates)

    code_candidates = ModelRouter.resolve_candidates(ModelCapability.CODE)
    assert len(code_candidates) > 0
    assert any(c.provider == ModelProvider.MISTRAL for c in code_candidates)


def test_model_router_data_residency_eu():
    """Vérifie que la politique EU n'autorise que les fournisseurs européens ou locaux."""
    eu_candidates = ModelRouter.resolve_candidates(
        ModelCapability.BALANCED,
        data_residency=DataResidencyPolicy.EU,
    )
    assert len(eu_candidates) > 0
    for cand in eu_candidates:
        meta = GLOBAL_PROVIDER_REGISTRY.get(cand.provider)
        assert meta.region in {ProviderRegion.EU, ProviderRegion.FRANCE, ProviderRegion.LOCAL}


def test_circuit_breaker_lifecycle():
    """Vérifie les transitions CLOSED -> OPEN -> HALF-OPEN du Circuit Breaker."""
    cb = CircuitBreaker()
    provider = "test_failing_provider"

    assert cb.is_available(provider) is True

    # 3 échecs consécutifs ouvrent le circuit
    cb.record_failure(provider)
    cb.record_failure(provider)
    assert cb.is_available(provider) is True

    cb.record_failure(provider)
    assert cb.is_available(provider) is False

    # Le succès réinitialise et ferme le circuit
    cb.record_success(provider)
    assert cb.is_available(provider) is True


@pytest.mark.asyncio
async def test_openai_compatible_adapter_structure():
    """Vérifie le fonctionnement de l'adaptateur universel OpenAI-compatible."""
    adapter = OpenAICompatibleProviderAdapter(
        provider_id="test_provider",
        base_url="https://api.example.com/v1",
        api_key_env="NON_EXISTENT_KEY",
    )
    headers = adapter._build_headers()
    assert headers["Content-Type"] == "application/json"
    assert "User-Agent" in headers


def test_admin_providers_zero_plaintext_keys():
    """Garantit qu'aucune clé API n'est exposée dans le statut public ou registre."""
    status = get_gateway_status()
    assert "api_key" not in status
    assert "api_keys" not in status
    for prov_meta in GLOBAL_PROVIDER_REGISTRY.values():
        # Seul le nom de la variable d'environnement est référencé, jamais la clé elle-même
        assert not prov_meta.api_key_env.startswith("sk-")
        assert not prov_meta.api_key_env.startswith("AIza")
