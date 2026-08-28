"""
Ñkyel AI — Production Multi-Key Rotator (100+ Keys per Provider)
SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ

Robust multi-account key pool management with:
- Up to 100 keys per provider via delimited string or numbered env vars (_1 .. _100)
- Auto-quarantine on HTTP 429 / Rate Limit with dynamic cooldown
- Round-robin load balancing & smart fallback to earliest recovering key
- Full support for RunPod.io, Coolify, Docker, and bare-metal VPS
- Providers: Gemini, Groq, Imagen/Nano Banana, Veo/Runway, OpenAI, Anthropic, Mistral, DeepSeek, Together, Tavily
"""

import os
import time
import logging
from typing import List, Dict, Optional

logger = logging.getLogger("nkyel.key_rotator")


class KeyRotator:
    """Gère un pool de jusqu'à 100 clés API par fournisseur avec rotation et tolérance aux pannes."""

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
            # 1. Direct delimited variable (comma, semicolon, newline, pipe)
            raw_val = os.getenv(env_var, "")
            if raw_val:
                parts = [
                    k.strip() 
                    for k in raw_val.replace(";", ",").replace("\n", ",").replace("|", ",").split(",") 
                    if k.strip()
                ]
                loaded.extend(parts)
            
            # 2. Numbered variables from _1 up to _100
            for i in range(1, 101):
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
            logger.info(f"🔑 KeyRotator [{self.provider_name}]: {len(self.keys)} clés actives chargées dans le pool (Capacité max 100+).")
        else:
            logger.warning(f"⚠️ KeyRotator [{self.provider_name}]: Aucune clé configurée.")

    def get_active_key(self) -> Optional[str]:
        """Retourne la prochaine clé active disponible hors cooldown."""
        if not self.keys:
            self._load_keys()
            if not self.keys:
                return None

        now = time.time()
        available = [k for k in self.keys if self.cooldowns.get(k, 0) <= now]

        if not available:
            # Toutes les clés sont en cooldown: sélectionner celle qui expire le plus tôt
            earliest_key = min(self.keys, key=lambda k: self.cooldowns.get(k, 0))
            masked = earliest_key[:6] + "..." + earliest_key[-4:] if len(earliest_key) > 10 else "***"
            logger.warning(f"⚠️ KeyRotator [{self.provider_name}]: Toutes les clés ({len(self.keys)}) sont en cooldown. Utilisation de la clé {masked}.")
            return earliest_key

        self.current_index = (self.current_index + 1) % len(available)
        return available[self.current_index]

    def report_rate_limit(self, key: str, cooldown_seconds: int = 60) -> None:
        """Met une clé en quarantaine suite à un dépassement de quota (HTTP 429)."""
        if not key:
            return
        masked = key[:6] + "..." + key[-4:] if len(key) > 10 else "***"
        self.cooldowns[key] = time.time() + cooldown_seconds
        logger.warning(f"⏳ KeyRotator [{self.provider_name}]: Clé {masked} mise en cooldown pour {cooldown_seconds}s.")

    def report_success(self, key: str) -> None:
        """Réinitialise le cooldown d'une clé lors d'une requête réussie."""
        if key in self.cooldowns:
            del self.cooldowns[key]

    def total_keys(self) -> int:
        return len(self.keys)


# ══════════════════════════════════════════════════════════════════════════════
# POOLS DE ROTATION PRÉ-CONFIGURÉS POUR LA PRODUCTION (COOLIFY & RUNPOD)
# ══════════════════════════════════════════════════════════════════════════════

# 1. Google Gemini & Vision (Supporte GOOGLE_API_KEYS, GEMINI_API_KEYS, GOOGLE_API_KEY_1..100)
google_rotator = KeyRotator(
    "Google Gemini",
    ["GOOGLE_API_KEYS", "GEMINI_API_KEYS", "GOOGLE_API_KEY", "GEMINI_API_KEY"]
)

# 2. Groq LPU (Supporte GROQ_API_KEYS, GROQ_API_KEY, GROQ_API_KEY_1..100)
groq_rotator = KeyRotator(
    "Groq LPU",
    ["GROQ_API_KEYS", "GROQ_API_KEY"]
)

# 3. Images IA (Imagen, Nano Banana, Pollinations, Fal.ai, Flux)
image_rotator = KeyRotator(
    "Images IA",
    ["FREE_IMAGE_API_KEYS", "IMAGEN_API_KEYS", "FAL_KEY", "POLLINATIONS_API_KEYS", "IMAGE_API_KEY"]
)

# 4. Vidéos IA (Veo 2, Runway Gen-3, RunPod ComfyUI, Wan2.1)
video_rotator = KeyRotator(
    "Vidéos IA",
    ["FREE_VIDEO_API_KEYS", "RUNWAY_API_KEYS", "VEO_API_KEYS", "RUNPOD_API_KEY", "VIDEO_API_KEY", "RUNWAY_API_KEY"]
)

# 5. OpenAI Ecosystem (o3-mini, o1, GPT-4o)
openai_rotator = KeyRotator(
    "OpenAI",
    ["OPENAI_API_KEYS", "OPENAI_API_KEY"]
)

# 6. Anthropic Claude (Claude 3.7 / 3.5 Sonnet)
anthropic_rotator = KeyRotator(
    "Anthropic Claude",
    ["ANTHROPIC_API_KEYS", "ANTHROPIC_API_KEY"]
)

# 7. Mistral AI & DeepSeek
mistral_rotator = KeyRotator(
    "Mistral AI",
    ["MISTRAL_API_KEYS", "MISTRAL_API_KEY"]
)

deepseek_rotator = KeyRotator(
    "DeepSeek",
    ["DEEPSEEK_API_KEYS", "DEEPSEEK_API_KEY"]
)

# 8. Recherche Web & Grounding (Tavily, Brave, Serper)
tavily_rotator = KeyRotator(
    "Tavily Search",
    ["TAVILY_API_KEYS", "TAVILY_API_KEY", "SEARCH_API_KEYS"]
)
