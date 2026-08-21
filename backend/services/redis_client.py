"""
Ñkyel AI — Client Redis Éphémère & Coordination (Section 43)
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Fournit l'interface Upstash Redis REST & fallback mémoire pour :
- Rate limiting : nkyel:rate:{userId}:{bucket}
- Quotas : nkyel:quota:{userId}:{period}
- Verrous : nkyel:lock:thread:{threadId}, nkyel:lock:run:{runId}
- Streaming éphémère : nkyel:stream:run:{runId}
- Cache éphémère : nkyel:cache:thread:{threadId}, nkyel:cache:user:{userId}
"""

import os
import time
import httpx
import logging
from typing import Optional, Any, Dict

logger = logging.getLogger("nkyel.redis")


class SovereignRedisClient:
    def __init__(self):
        self.rest_url = os.getenv("UPSTASH_REDIS_REST_URL", "").rstrip("/")
        self.rest_token = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")
        self._memory_store: Dict[str, Any] = {}
        self._expiry_store: Dict[str, float] = {}

    async def get(self, key: str) -> Optional[str]:
        """Récupère une valeur par clé."""
        now = time.time()
        # 1. Tentative Upstash REST si configuré
        if self.rest_url and self.rest_token:
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.get(
                        f"{self.rest_url}/get/{key}",
                        headers={"Authorization": f"Bearer {self.rest_token}"}
                    )
                    if resp.status_code == 200:
                        res_json = resp.json()
                        return res_json.get("result")
            except Exception as e:
                logger.warning(f"Upstash REST get error: {e}, fallback mémoire")

        # 2. Fallback mémoire
        if key in self._expiry_store and self._expiry_store[key] < now:
            self._memory_store.pop(key, None)
            self._expiry_store.pop(key, None)
            return None

        return self._memory_store.get(key)

    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        """Écrit une clé avec TTL optionnel."""
        now = time.time()
        # 1. Tentative Upstash REST
        if self.rest_url and self.rest_token:
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    endpoint = f"{self.rest_url}/set/{key}/{value}"
                    if ex:
                        endpoint += f"?EX={ex}"
                    resp = await client.post(
                        endpoint,
                        headers={"Authorization": f"Bearer {self.rest_token}"}
                    )
                    if resp.status_code == 200:
                        return True
            except Exception as e:
                logger.warning(f"Upstash REST set error: {e}, fallback mémoire")

        # 2. Fallback mémoire
        self._memory_store[key] = str(value)
        if ex:
            self._expiry_store[key] = now + ex
        return True

    async def delete(self, key: str) -> bool:
        """Supprime une clé."""
        if self.rest_url and self.rest_token:
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    await client.post(
                        f"{self.rest_url}/del/{key}",
                        headers={"Authorization": f"Bearer {self.rest_token}"}
                    )
            except Exception:
                pass
        self._memory_store.pop(key, None)
        self._expiry_store.pop(key, None)
        return True


redis_client = SovereignRedisClient()
