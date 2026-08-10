# GabomaGPT · admin_metrics.py · SmartANDJ AI Technologies
# Métriques admin temps réel — tableau de bord invisible
# Fondateur: Daniel Jonathan ANDJ

import time
import logging
import asyncio
from typing import Dict, Any, Optional
from collections import defaultdict
from dataclasses import dataclass, field

log = logging.getLogger(__name__)


# ============================================================
# Collecteur de métriques temps réel
# ============================================================

@dataclass
class RequestMetric:
    """Métrique d'une requête individuelle."""
    user_id: str
    plan: str
    model: str
    tokens_in: int = 0
    tokens_out: int = 0
    latency_ms: float = 0.0
    status: str = "ok"
    timestamp: float = field(default_factory=time.time)


class MetricsCollector:
    """
    Collecteur de métriques temps réel pour le dashboard admin.

    Métriques collectées :
    - Requêtes par seconde / minute / heure
    - Latence moyenne par modèle
    - Tokens consommés par plan
    - Utilisateurs actifs
    - Erreurs par type
    - Revenus estimés par plan
    """

    def __init__(self, window_minutes: int = 60):
        self._window = window_minutes * 60  # en secondes
        self._requests: list[RequestMetric] = []
        self._active_users: dict[str, float] = {}  # user_id → last_seen
        self._error_counts: defaultdict = defaultdict(int)
        self._plan_revenue: dict[str, int] = {
            "flash": 0,
            "pro": 2500,
            "elite": 13000,
            "panther": 50000,
            "panther_pro": 150000,
        }
        self._lock = asyncio.Lock()
        log.info("GabomaGPT MetricsCollector initialisé")

    async def record(self, metric: RequestMetric) -> None:
        """Enregistre une métrique de requête."""
        async with self._lock:
            self._requests.append(metric)
            self._active_users[metric.user_id] = metric.timestamp
            if metric.status != "ok":
                self._error_counts[metric.status] += 1

    async def _cleanup(self) -> None:
        """Nettoie les métriques expirées."""
        cutoff = time.time() - self._window
        self._requests = [r for r in self._requests if r.timestamp > cutoff]
        self._active_users = {
            uid: ts for uid, ts in self._active_users.items()
            if ts > cutoff
        }

    async def get_dashboard(self) -> Dict[str, Any]:
        """
        Retourne les métriques complètes pour le dashboard admin.

        Accessible uniquement via /api/admin/metrics avec ADMIN_SECRET.
        """
        async with self._lock:
            await self._cleanup()

            now = time.time()
            last_minute = [r for r in self._requests if r.timestamp > now - 60]
            last_hour = self._requests

            # Requêtes par période
            rpm = len(last_minute)
            rph = len(last_hour)

            # Latence moyenne
            latencies = [r.latency_ms for r in last_hour if r.latency_ms > 0]
            avg_latency = sum(latencies) / len(latencies) if latencies else 0

            # Tokens par plan
            tokens_by_plan: Dict[str, Dict[str, int]] = defaultdict(
                lambda: {"in": 0, "out": 0, "count": 0}
            )
            for r in last_hour:
                tokens_by_plan[r.plan]["in"] += r.tokens_in
                tokens_by_plan[r.plan]["out"] += r.tokens_out
                tokens_by_plan[r.plan]["count"] += 1

            # Modèles utilisés
            models_usage: Dict[str, int] = defaultdict(int)
            for r in last_hour:
                models_usage[r.model] += 1

            # Utilisateurs actifs
            active_5min = sum(
                1 for ts in self._active_users.values()
                if ts > now - 300
            )
            active_1h = len(self._active_users)

            # Utilisateurs par plan
            users_by_plan: Dict[str, int] = defaultdict(int)
            plan_of_user: Dict[str, str] = {}
            for r in last_hour:
                plan_of_user[r.user_id] = r.plan
            for plan in plan_of_user.values():
                users_by_plan[plan] += 1

            # Revenu estimé mensuel
            estimated_revenue = sum(
                self._plan_revenue.get(plan, 0) * count
                for plan, count in users_by_plan.items()
            )

            return {
                "timestamp": now,
                "requests": {
                    "per_minute": rpm,
                    "per_hour": rph,
                    "total_window": len(self._requests),
                },
                "latency": {
                    "avg_ms": round(avg_latency, 1),
                    "p50_ms": round(sorted(latencies)[len(latencies) // 2], 1) if latencies else 0,
                    "p95_ms": round(sorted(latencies)[int(len(latencies) * 0.95)] if latencies else 0, 1),
                    "p99_ms": round(sorted(latencies)[int(len(latencies) * 0.99)] if latencies else 0, 1),
                },
                "tokens": dict(tokens_by_plan),
                "models": dict(models_usage),
                "users": {
                    "active_5min": active_5min,
                    "active_1h": active_1h,
                    "by_plan": dict(users_by_plan),
                },
                "errors": dict(self._error_counts),
                "revenue": {
                    "estimated_monthly_fcfa": estimated_revenue,
                    "currency": "FCFA",
                },
            }


# ============================================================
# Instance globale
# ============================================================

metrics_collector = MetricsCollector(window_minutes=60)
