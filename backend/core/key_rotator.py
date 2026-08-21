"""
Ñkyel AI — Multi-Key Rotator · SmartANDJ AI Technologies
Gestionnaire de rotation multi-comptes avec cooldowns et retries pour :
- Google Gemini (GOOGLE_API_KEYS / GOOGLE_GENERATIVE_AI_API_KEY)
- Groq (GROQ_API_KEYS / GROQ_API_KEY)
- Free Image APIs (FREE_IMAGE_API_KEYS / POLLINATIONS_API_KEYS)
- Free Video APIs (FREE_VIDEO_API_KEYS / RUNPOD_API_KEYS)

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
            raw_val = os.getenv(env_var, "")
            if raw_val:
                # Support comma, semicolon, space separated keys
                parts = [k.strip() for k in raw_val.replace(";", ",").replace("\n", ",").split(",") if k.strip()]
                loaded.extend(parts)
        
        # Deduplicate while preserving order
        seen = set()
        deduped = []
        for k in loaded + self.fallback_keys:
            if k and k not in seen:
                seen.add(k)
                deduped.append(k)
        
        self.keys = deduped
        if self.keys:
            logger.info(f"🔑 KeyRotator [{self.provider_name}]: {len(self.keys)} clés actives chargées.")
        else:
            logger.warning(f"⚠️ KeyRotator [{self.provider_name}]: Aucune clé configurée.")

    def get_active_key(self) -> Optional[str]:
        """Retourne la prochaine clé disponible non en cooldown."""
        if not self.keys:
            # Essayer de recharger au cas où les variables d'environnement ont changé
            self._load_keys()
            if not self.keys:
                return None

        now = time.time()
        available = [k for k in self.keys if self.cooldowns.get(k, 0) <= now]

        if not available:
            # Toutes les clés sont en cooldown, trouver celle qui expire le plus tôt
            earliest_key = min(self.keys, key=lambda k: self.cooldowns.get(k, 0))
            logger.warning(f"⚠️ KeyRotator [{self.provider_name}]: Toutes les clés sont en cooldown. Utilisation de la plus ancienne.")
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

    def total_keys(self) -> int:
        return len(self.keys)


# Singletons pour le backend Ñkyel AI
gemini_rotator = KeyRotator("Google Gemini", ["GOOGLE_API_KEYS", "GOOGLE_GENERATIVE_AI_API_KEY", "GOOGLE_API_KEY"])
groq_rotator = KeyRotator("Groq", ["GROQ_API_KEYS", "GROQ_API_KEY"])
image_rotator = KeyRotator("Image Providers", ["FREE_IMAGE_API_KEYS", "POLLINATIONS_API_KEY", "CLOUDFLARE_API_TOKEN"])
video_rotator = KeyRotator("Video Providers", ["FREE_VIDEO_API_KEYS", "RUNPOD_API_KEY", "COMFYUI_API_KEY"])
