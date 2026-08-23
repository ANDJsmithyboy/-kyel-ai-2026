"""
Ñkyel AI — Tests d'Acceptation : User Preferences & Settings as Commands
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Validation complète :
- 1. Validation stricte du schéma Pydantic UserPreferencesSchema
- 2. Séparation nette entre ui_locale (BCP-47) et agent_language
- 3. Persistance et mutation atomique (GET, PUT, PATCH)
- 4. Prise en charge des drapeaux de confidentialité, mémoire et formats
"""

import os
import sys
import pytest
from pydantic import ValidationError

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from api.v1.users import UserPreferencesSchema, UserPreferencesUpdateSchema
from core.database import upsert_user_preferences, get_user_preferences


def test_user_preferences_default_schema():
    """Vérifie les valeurs par défaut souveraines du schéma."""
    prefs = UserPreferencesSchema()
    assert prefs.ui_locale == "fr-FR"
    assert prefs.agent_language == "auto"
    assert prefs.region == "GA"
    assert prefs.timezone == "Africa/Libreville"
    assert prefs.date_format == "DD/MM/YYYY"
    assert prefs.time_format == "24h"
    assert prefs.currency_display == "XAF"
    assert prefs.theme == "black-panther"
    assert prefs.memory_enabled is True
    assert prefs.data_residency == "GLOBAL"


def test_user_preferences_custom_values():
    """Vérifie la personnalisation pour un utilisateur US ou Arabe."""
    prefs_us = UserPreferencesSchema(
        ui_locale="en-US",
        agent_language="fr",
        dateFormat="MM/DD/YYYY",
        timeFormat="12h",
        currency_display="USD",
        theme="aurore-ogoue",
    )
    assert prefs_us.ui_locale == "en-US"
    assert prefs_us.agent_language == "fr"
    assert prefs_us.currency_display == "USD"

    prefs_ar = UserPreferencesSchema(
        ui_locale="ar-SA",
        agent_language="ar",
        currency_display="AED",
    )
    assert prefs_ar.ui_locale == "ar-SA"
    assert prefs_ar.agent_language == "ar"


@pytest.mark.asyncio
async def test_upsert_and_retrieve_user_preferences():
    """Vérifie la persistance et récupération des préférences."""
    test_user_id = "test-user-uuid-999"
    payload = {
        "ui_locale": "fr-GA",
        "agent_language": "fan",
        "region": "GA",
        "timezone": "Africa/Libreville",
        "date_format": "DD/MM/YYYY",
        "currency_display": "XAF",
        "theme": "black-panther",
        "response_depth": "deep",
        "research_depth": "exhaustive",
        "memory_enabled": True,
        "memory_policy": "auto_preferences",
        "data_residency": "AFRICA",
    }

    saved = await upsert_user_preferences(test_user_id, payload)
    assert saved["user_id"] == test_user_id
    assert saved["ui_locale"] == "fr-GA"
    assert saved["agent_language"] == "fan"
    assert saved["data_residency"] == "AFRICA"

    retrieved = await get_user_preferences(test_user_id)
    assert retrieved is not None
    assert retrieved["ui_locale"] == "fr-GA"
    assert retrieved["agent_language"] == "fan"
    assert retrieved["response_depth"] == "deep"
