"""
Ñkyel AI — Tests de Production E2E : Settings as Commands & Global AI Fabric
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Validation rigoureuse des 8 scénarios d'acceptation requis :
- TEST 1 — Français (fr-FR / fr-GA, formats dates & XAF, persistance)
- TEST 2 — English US (en-US, format MM/DD/YYYY, 12h, USD)
- TEST 3 — Dark Mode & Thèmes souverains (Black Panther, Nuit du Lopé...)
- TEST 4 — Arabic RTL (ar-SA, orientation RTL, devises AED/SAR)
- TEST 5 — Memory Settings & DeerMem (Politiques, persistance)
- TEST 6 — Agent Personalization (Research depth balanced -> deep)
- TEST 7 — Accès Superadmin Illimités (Jonathan & SmartANDJ, mot de passe maître)
- TEST 8 — Matrice Mondiale des Fournisseurs & Fallback multi-modèles
"""

import os
import sys
import pytest
import asyncio

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from core.security import (
    SUPERADMIN_EMAILS,
    SUPERADMIN_MASTER_PASSWORD,
    verify_password,
    hash_password,
    create_access_token,
    require_admin,
)
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
)
from api.v1.users import UserPreferencesSchema, UserPreferencesUpdateSchema
from core.database import upsert_user_preferences, get_user_preferences


# ─────────────────────────────────────────────────────────────
# TEST 1 — FRANÇAIS (FRANCE & GABON)
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_scenario_1_french_preferences():
    """Test 1: Sauvegarde, persistance et formatage en Français (France & Gabon)."""
    user_id = "user-fr-prod-001"
    prefs_payload = {
        "ui_locale": "fr-GA",
        "agent_language": "fr",
        "region": "GA",
        "timezone": "Africa/Libreville",
        "date_format": "DD/MM/YYYY",
        "time_format": "24h",
        "number_format": "space_comma",
        "currency_display": "XAF",
        "theme": "black-panther",
        "response_depth": "balanced",
    }

    # Validation Pydantic
    schema = UserPreferencesSchema(**prefs_payload)
    assert schema.ui_locale == "fr-GA"
    assert schema.currency_display == "XAF"
    assert schema.date_format == "DD/MM/YYYY"

    # Persistance Neon
    saved = await upsert_user_preferences(user_id, prefs_payload)
    assert saved["ui_locale"] == "fr-GA"
    assert saved["currency_display"] == "XAF"

    # Récupération
    retrieved = await get_user_preferences(user_id)
    assert retrieved is not None
    assert retrieved["ui_locale"] == "fr-GA"
    assert retrieved["currency_display"] == "XAF"


# ─────────────────────────────────────────────────────────────
# TEST 2 — ENGLISH US
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_scenario_2_english_us_formatting():
    """Test 2: Sauvegarde, persistance et formatage English US (MM/DD/YYYY, 12h, USD)."""
    user_id = "user-us-prod-002"
    prefs_payload = {
        "ui_locale": "en-US",
        "agent_language": "en",
        "region": "US",
        "timezone": "America/New_York",
        "date_format": "MM/DD/YYYY",
        "time_format": "12h",
        "number_format": "comma_dot",
        "currency_display": "USD",
        "theme": "aurore-ogoue",
    }

    schema = UserPreferencesSchema(**prefs_payload)
    assert schema.ui_locale == "en-US"
    assert schema.date_format == "MM/DD/YYYY"
    assert schema.time_format == "12h"
    assert schema.currency_display == "USD"

    saved = await upsert_user_preferences(user_id, prefs_payload)
    assert saved["ui_locale"] == "en-US"
    assert saved["date_format"] == "MM/DD/YYYY"

    retrieved = await get_user_preferences(user_id)
    assert retrieved["date_format"] == "MM/DD/YYYY"
    assert retrieved["time_format"] == "12h"
    assert retrieved["currency_display"] == "USD"


# ─────────────────────────────────────────────────────────────
# TEST 3 — DARK MODE & THÈMES SOUVERAINS
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_scenario_3_dark_mode_and_themes():
    """Test 3: Vérification de l'application et persistance des 6 thèmes souverains."""
    user_id = "user-theme-003"
    valid_themes = ["black-panther", "nuit-lope", "aurore-ogoue", "bleu-nuit", "violette-mandrille", "neo-blanc"]

    for theme in valid_themes:
        saved = await upsert_user_preferences(user_id, {"theme": theme})
        assert saved["theme"] == theme

    retrieved = await get_user_preferences(user_id)
    assert retrieved["theme"] == "neo-blanc"


# ─────────────────────────────────────────────────────────────
# TEST 4 — ARABIC RTL
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_scenario_4_arabic_rtl():
    """Test 4: Configuration Arabe RTL, monnaie AED et persistance."""
    user_id = "user-ar-004"
    prefs_payload = {
        "ui_locale": "ar-SA",
        "agent_language": "ar",
        "region": "SA",
        "timezone": "Asia/Riyadh",
        "currency_display": "AED",
        "theme": "black-panther",
    }

    schema = UserPreferencesSchema(**prefs_payload)
    assert schema.ui_locale == "ar-SA"
    assert schema.agent_language == "ar"

    saved = await upsert_user_preferences(user_id, prefs_payload)
    assert saved["ui_locale"] == "ar-SA"
    assert saved["currency_display"] == "AED"


# ─────────────────────────────────────────────────────────────
# TEST 5 — MÉMOIRE SOUVERAINE DEERMEM
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_scenario_5_memory_policy_mutation():
    """Test 5: Mutation de la politique mémoire et persistance."""
    user_id = "user-mem-005"
    prefs_payload = {
        "memory_enabled": True,
        "automatic_memory": True,
        "ask_before_remembering": True,
        "memory_policy": "always_ask",
    }

    saved = await upsert_user_preferences(user_id, prefs_payload)
    assert saved["memory_enabled"] is True
    assert saved["memory_policy"] == "always_ask"
    assert saved["ask_before_remembering"] is True

    retrieved = await get_user_preferences(user_id)
    assert retrieved["memory_policy"] == "always_ask"


# ─────────────────────────────────────────────────────────────
# TEST 6 — PERSONNALISATION AGENT (RESEARCH DEPTH)
# ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_scenario_6_agent_personalization():
    """Test 6: Passage de la profondeur de recherche Balanced -> Deep/Exhaustive."""
    user_id = "user-agent-006"
    prefs_payload = {
        "response_depth": "deep",
        "research_depth": "exhaustive",
        "citation_preferences": "always",
        "autonomy_level": "fully_autonomous",
        "visual_intelligence_level": "sovereign_vision",
    }

    saved = await upsert_user_preferences(user_id, prefs_payload)
    assert saved["response_depth"] == "deep"
    assert saved["research_depth"] == "exhaustive"
    assert saved["visual_intelligence_level"] == "sovereign_vision"

    retrieved = await get_user_preferences(user_id)
    assert retrieved["research_depth"] == "exhaustive"
    assert retrieved["autonomy_level"] == "fully_autonomous"


# ─────────────────────────────────────────────────────────────
# TEST 7 — SUPERADMIN ACCÈS ILLIMITÉS
# ─────────────────────────────────────────────────────────────
def test_scenario_7_superadmin_unlimited_access():
    """Test 7: Vérification des privilèges superadmin illimités pour Jonathan & SmartANDJ."""
    # Vérification des emails autorisés
    assert "jonathanakarentoutoume@gmail.com" in SUPERADMIN_EMAILS
    assert "smartandjiatechnologies@gmail.com" in SUPERADMIN_EMAILS

    # Vérification du mot de passe maître
    assert verify_password(SUPERADMIN_MASTER_PASSWORD, "") is True
    assert verify_password("wrong_password", "") is False

    # Hachage et vérification
    hashed = hash_password(SUPERADMIN_MASTER_PASSWORD)
    assert verify_password(SUPERADMIN_MASTER_PASSWORD, hashed) is True

    # Vérification require_admin
    admin_user = {
        "email": "jonathanakarentoutoume@gmail.com",
        "name": "Daniel Jonathan ANDJ",
    }
    checked = asyncio.run(require_admin(admin_user))
    assert checked["is_admin"] is True
    assert checked["role"] == "admin"

    smart_user = {
        "email": "smartandjiatechnologies@gmail.com",
        "name": "SmartANDJ Technologies Admin",
    }
    checked_smart = asyncio.run(require_admin(smart_user))
    assert checked_smart["is_admin"] is True
    assert checked_smart["role"] == "admin"


# ─────────────────────────────────────────────────────────────
# TEST 8 — MATRICE MONDIALE DES FOURNISSEURS & ROUTER
# ─────────────────────────────────────────────────────────────
def test_scenario_8_global_providers_matrix_and_routing():
    """Test 8: Vérification de la complétude du registre mondial (38 providers) et du router."""
    assert len(GLOBAL_PROVIDER_REGISTRY) >= 30

    # Vérification écosystèmes clés
    key_providers = [
        ModelProvider.MISTRAL,
        ModelProvider.SCALEWAY,
        ModelProvider.OVHCLOUD,
        ModelProvider.OPENAI,
        ModelProvider.ANTHROPIC,
        ModelProvider.GOOGLE,
        ModelProvider.DEEPSEEK,
        ModelProvider.ALIBABA_QWEN,
        ModelProvider.ZHIPU_GLM,
        ModelProvider.MOONSHOT_KIMI,
        ModelProvider.NTT_TSUZUMI,
        ModelProvider.NAVER_HYPERCLOVA,
        ModelProvider.SARVAM_AI,
        ModelProvider.FALCON_TII,
        ModelProvider.LELAPA_AI,
        ModelProvider.GABOMA_AI,
        ModelProvider.NKYEL_SOVEREIGN,
        ModelProvider.RUNPOD,
        ModelProvider.VLLM_LOCAL,
        ModelProvider.OLLAMA,
    ]
    for p in key_providers:
        assert p in GLOBAL_PROVIDER_REGISTRY
        meta = GLOBAL_PROVIDER_REGISTRY[p]
        assert meta.name
        assert meta.region
        assert len(meta.capabilities) > 0

    # Résolution Router
    code_models = ModelRouter.resolve_candidates(ModelCapability.CODE)
    assert len(code_models) > 0
    assert any(m.provider == ModelProvider.MISTRAL for m in code_models)

    african_models = ModelRouter.resolve_candidates(ModelCapability.AFRICAN_LANGUAGES)
    assert len(african_models) > 0

    # Zéro clé en clair
    status = get_gateway_status()
    assert "api_key" not in status
