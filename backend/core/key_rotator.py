"""
Ñkyel AI — Multi-Key Rotator · SmartANDJ AI Technologies
Gestionnaire de rotation multi-comptes avec cooldowns et retries pour :
- Google Gemini (GOOGLE_API_KEYS, GOOGLE_API_KEY, GOOGLE_API_KEY_1..20)
- Groq (GROQ_API_KEYS, GROQ_API_KEY, GROQ_API_KEY_1..20)
- Tavily (TAVILY_API_KEYS, TAVILY_API_KEY, TAVILY_API_KEY_1..20)
- Runway (RUNWAY_API_KEYS, RUNWAY_API_KEY, RUNWAY_API_KEY_1..20)
- Mistral (MISTRAL_API_KEYS, MISTRAL_API_KEY, MISTRAL_API_KEY_1..20)
- OpenAI (OPENAI_API_KEYS, OPENAI_API_KEY, OPENAI_API_KEY_1..20)
- Anthropic (ANTHROPIC_API_KEYS, ANTHROPIC_API_KEY, ANTHROPIC_API_KEY_1..20)
- Together AI (TOGETHER_API_KEYS, TOGETHER_API_KEY, TOGETHER_API_KEY_1..20)
- Free Image APIs (FREE_IMAGE_API_KEYS, POLLINATIONS_API_KEYS, FAL_KEY)
- Video APIs (RUNWAY_API_KEY, RUNPOD_API_KEY, COMFYUI_API_KEY)

Fondateur : Daniel Jonathan ANDJ
"""

import os
import time
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


class KeyRotator:
    """Gère un pool de clés API pour un fournisseur donné avec rotation et exclusion temporaire."""

    def __init__(self, provider_name: str, env_var_names: List[str], fallback_keys: Optional[List[str]] = None):
        self.provider_name = provider_name
        self.env_var_names = env_var_names
        self.fallback_keys = fallback_keys or []
        self.keys: List[str] = []
        self.cooldowns: Dict[str, float] = {}
        self.current_index = 0
        self._load_keys()

    def _load_keys(self) -> None:
        loaded = []
        for env_var in self.env_var_names:
            # 1. Direct variable (comma, semicolon, newline separated)
            raw_val = os.getenv(env_var, "")
            if raw_val:
                parts = [k.strip() for k in raw_val.replace(";", ",").replace("\n", ",").split(",") if k.strip()]
                loaded.extend(parts)
            
            # 2. Numbered variables (e.g., VAR_1, VAR_2 ... VAR_20)
            for i in range(1, 21):
                num_val = os.getenv(f"{env_var}_{i}", "")
                if num_val and num_val.strip():
                    loaded.append(num_val.strip())

        # Deduplicate while preserving order
        seen = set()
        deduped = []
        for k in loaded + self.fallback_keys:
            if k and k not in seen:
                seen.add(k)
                deduped.append(k)

        self.keys = deduped
        if self.keys:
            logger.info(f"🔑 KeyRotator [{self.provider_name}]: {len(self.keys)} clés actives chargées dans le pool.")
        else:
            logger.warning(f"⚠️ KeyRotator [{self.provider_name}]: Aucune clé configurée.")

    def get_active_key(self) -> Optional[str]:
        """Retourne la prochaine clé disponible non en cooldown."""
        if not self.keys:
            self._load_keys()
            if not self.keys:
                return None

        now = time.time()
        available = [k for k in self.keys if self.cooldowns.get(k, 0) <= now]

        if not available:
            # Toutes les clés sont en cooldown, utiliser celle dont le cooldown expire le plus tôt
            earliest_key = min(self.keys, key=lambda k: self.cooldowns.get(k, 0))
            masked = earliest_key[:6] + "..." + earliest_key[-4:] if len(earliest_key) > 10 else "***"
            logger.warning(f"⚠️ KeyRotator [{self.provider_name}]: Toutes les clés sont en cooldown. Utilisation de la clé {masked}.")
            return earliest_key

        self.current_index = (self.current_index + 1) % len(available)
        return available[self.current_index]

    def report_rate_limit(self, key: str, cooldown_seconds: int = 60) -> None:
        """Met une clé en quarantaine suite à une erreur 429 / quota."""
        if not key:
            return
        masked = key[:6] + "..." + key[-4:] if len(key) > 10 else "***"
        self.cooldowns[key] = time.time() + cooldown_seconds
        logger.warning(f"⏳ KeyRotator [{self.provider_name}]: Clé {masked} mise en cooldown pour {cooldown_seconds}s.")

    def report_success(self, key: str) -> None:
        """Réinitialise le cooldown d'une clé en cas de succès confirmé."""
        if key in self.cooldowns:
            del self.cooldowns[key]

    def total_keys(self) -> int:
        return len(self.keys)

    def get_all_keys(self) -> List[str]:
        return list(self.keys)


# ── Singletons de Rotation pour le backend Ñkyel AI ──────────
gemini_rotator = KeyRotator("Google Gemini", ["GOOGLE_API_KEYS", "GOOGLE_GENERATIVE_AI_API_KEY", "GOOGLE_API_KEY"])
groq_rotator = KeyRotator("Groq", ["GROQ_API_KEYS", "GROQ_API_KEY"])
tavily_rotator = KeyRotator("Tavily Search", ["TAVILY_API_KEYS", "TAVILY_API_KEY"])
runway_rotator = KeyRotator("Runway ML", ["RUNWAY_API_KEYS", "RUNWAY_API_KEY", "RUNWAYML_API_SECRET"])
mistral_rotator = KeyRotator("Mistral AI", ["MISTRAL_API_KEYS", "MISTRAL_API_KEY"])
openai_rotator = KeyRotator("OpenAI", ["OPENAI_API_KEYS", "OPENAI_API_KEY"])
anthropic_rotator = KeyRotator("Anthropic", ["ANTHROPIC_API_KEYS", "ANTHROPIC_API_KEY"])
together_rotator = KeyRotator("Together AI", ["TOGETHER_API_KEYS", "TOGETHER_API_KEY"])
image_rotator = KeyRotator("Image Providers", ["FREE_IMAGE_API_KEYS", "POLLINATIONS_API_KEY", "FAL_KEY", "SILICONFLOW_API_KEY", "CLOUDFLARE_API_TOKEN"])
video_rotator = KeyRotator("Video Providers", ["FREE_VIDEO_API_KEYS", "RUNWAY_API_KEY", "RUNPOD_API_KEY", "COMFYUI_API_KEY"])
