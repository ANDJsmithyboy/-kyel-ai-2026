"""
Ñkyel AI — Système de Rotation de Clés API Souverain
SmartANDJ AI Technologies — Libreville, Gabon
Rotation intelligente multi-comptes pour les paliers gratuits (Google, GitHub, Groq, HuggingFace, Free Video & Image APIs).
"""

import os
import random
import time
from typing import List, Dict, Optional


class KeyRotator:
    def __init__(self, service_name: str, env_var_name: str, fallback_keys: Optional[List[str]] = None):
        self.service_name = service_name
        self.env_var_name = env_var_name
        self.keys: List[str] = []
        self.cooldowns: Dict[str, float] = {}  # key -> cooldown end timestamp
        self._index = 0
        self._load_keys(fallback_keys)

    def _load_keys(self, fallback_keys: Optional[List[str]] = None):
        raw = os.getenv(self.env_var_name, "")
        keys_from_env = [k.strip() for k in raw.split(",") if k.strip()]
        if keys_from_env:
            self.keys = keys_from_env
        elif fallback_keys:
            self.keys = [k.strip() for k in fallback_keys if k.strip()]
        else:
            self.keys = []

    def add_key(self, key: str):
        cleaned = key.strip()
        if cleaned and cleaned not in self.keys:
            self.keys.append(cleaned)

    def get_active_key(self) -> Optional[str]:
        if not self.keys:
            return None

        now = time.time()
        # Find available keys not in cooldown
        available = [k for k in self.keys if self.cooldowns.get(k, 0) < now]
        if not available:
            # If all are cooling down, reset cooldown of earliest
            earliest_key = min(self.keys, key=lambda k: self.cooldowns.get(k, 0))
            return earliest_key

        # Round robin selection
        self._index = (self._index + 1) % len(available)
        return available[self._index]

    def report_rate_limit(self, key: str, cooldown_seconds: float = 60.0):
        """Mark a key as rate-limited (HTTP 429) for a cooldown duration."""
        self.cooldowns[key] = time.time() + cooldown_seconds

    def total_keys(self) -> int:
        return len(self.keys)


# Pre-configured rotators for multi-account free tiers
google_rotator = KeyRotator("Google/Gemini/Imagen", "GOOGLE_API_KEYS")
groq_rotator = KeyRotator("Groq", "GROQ_API_KEYS")
huggingface_rotator = KeyRotator("HuggingFace", "HUGGINGFACE_API_KEYS")
video_rotator = KeyRotator("Free Video APIs", "FREE_VIDEO_API_KEYS")
image_rotator = KeyRotator("Free Image APIs", "FREE_IMAGE_API_KEYS")
