"""
Ñkyel AI — Telemetry & Observability · SmartANDJ AI Technologies
Suivi structuré des métriques : tokens, coûts, latences, budgets.
Format de log structuré JSON compatible OpenTelemetry.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import json
import logging
import threading
from typing import Optional, Any
from dataclasses import dataclass, field, asdict
from enum import Enum

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Structured JSON Logger
# ══════════════════════════════════════════════════════════════

class NkyelJSONFormatter(logging.Formatter):
    """
    Formateur de logs structuré JSON, compatible OpenTelemetry.
    Injecte automatiquement le contexte de requête si disponible.
    """

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
        }

        # Injecter le contexte de requête
        try:
            from core.context import get_context
            ctx = get_context()
            if ctx:
                log_entry.update(ctx.to_log_dict())
        except Exception:
            pass

        # Ajouter les extras (métriques, erreurs, etc.)
        for key in ("request_id", "trace_id", "user_id", "mission_id",
                     "model", "provider", "cost_usd", "latency_ms",
                     "input_tokens", "output_tokens", "error_code"):
            val = getattr(record, key, None)
            if val is not None:
                log_entry[key] = val

        # Ajouter exception si présente
        if record.exc_info and record.exc_info[1]:
            log_entry["exception"] = {
                "type": type(record.exc_info[1]).__name__,
                "message": str(record.exc_info[1]),
            }

        return json.dumps(log_entry, ensure_ascii=False, default=str)


def configure_structured_logging(level: str = "INFO") -> None:
    """
    Configure le logging structuré JSON pour le backend Ñkyel.
    À appeler une fois au démarrage de l'application.
    """
    root = logging.getLogger()
    root.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Supprimer les handlers existants
    for handler in root.handlers[:]:
        root.removeHandler(handler)

    # Handler console avec format JSON
    console = logging.StreamHandler()
    console.setFormatter(NkyelJSONFormatter())
    root.addHandler(console)

    # Réduire le bruit des loggers externes
    for noisy in ("httpx", "httpcore", "urllib3", "watchfiles", "uvicorn.access"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


# ══════════════════════════════════════════════════════════════
# 2. Mission Cost Tracker
# ══════════════════════════════════════════════════════════════

@dataclass
class MissionCostEntry:
    """Entrée de coût pour une opération dans une mission."""
    category: str         # "model", "tool", "search", "storage"
    provider: str         # "google", "groq", "tavily", "qdrant"
    operation: str        # "gemini-3.6-flash", "web_search", "rag_query"
    cost_usd: float
    input_tokens: int = 0
    output_tokens: int = 0
    latency_ms: int = 0
    timestamp: float = field(default_factory=time.time)


class MissionCostTracker:
    """
    Suivi des coûts cumulés pour une mission spécifique.
    Permet le contrôle de budget avec arrêt propre.
    """

    def __init__(
        self,
        mission_id: str,
        max_budget_usd: float = 1.0,
        max_total_tokens: int = 500_000,
    ):
        self.mission_id = mission_id
        self.max_budget_usd = max_budget_usd
        self.max_total_tokens = max_total_tokens
        self._entries: list[MissionCostEntry] = []
        self._lock = threading.RLock()

    def record(self, entry: MissionCostEntry) -> None:
        """Enregistre une opération avec son coût."""
        with self._lock:
            self._entries.append(entry)

        logger.info(
            f"💰 Cost: {entry.category}/{entry.operation} "
            f"${entry.cost_usd:.6f} | {entry.input_tokens}→{entry.output_tokens} tokens | "
            f"{entry.latency_ms}ms | mission={self.mission_id}",
            extra={
                "mission_id": self.mission_id,
                "cost_usd": entry.cost_usd,
                "model": entry.operation,
                "provider": entry.provider,
                "input_tokens": entry.input_tokens,
                "output_tokens": entry.output_tokens,
                "latency_ms": entry.latency_ms,
            },
        )

    @property
    def total_cost(self) -> float:
        with self._lock:
            return sum(e.cost_usd for e in self._entries)

    @property
    def total_tokens(self) -> int:
        with self._lock:
            return sum(e.input_tokens + e.output_tokens for e in self._entries)

    @property
    def is_over_budget(self) -> bool:
        return self.total_cost >= self.max_budget_usd

    @property
    def is_over_token_limit(self) -> bool:
        return self.total_tokens >= self.max_total_tokens

    def check_budget(self) -> None:
        """
        Vérifie le budget et lève BudgetExceeded si dépassé.
        À appeler avant chaque opération coûteuse.
        """
        if self.is_over_budget:
            from core.errors import budget_exceeded
            raise budget_exceeded(self.total_cost, self.max_budget_usd)

    def summary(self) -> dict:
        """Résumé des coûts de la mission."""
        with self._lock:
            by_category: dict[str, float] = {}
            by_provider: dict[str, float] = {}
            total_input = 0
            total_output = 0

            for e in self._entries:
                by_category[e.category] = by_category.get(e.category, 0) + e.cost_usd
                by_provider[e.provider] = by_provider.get(e.provider, 0) + e.cost_usd
                total_input += e.input_tokens
                total_output += e.output_tokens

            return {
                "mission_id": self.mission_id,
                "total_cost_usd": round(self.total_cost, 6),
                "max_budget_usd": self.max_budget_usd,
                "budget_remaining_usd": round(max(0, self.max_budget_usd - self.total_cost), 6),
                "budget_used_pct": round(
                    (self.total_cost / self.max_budget_usd * 100)
                    if self.max_budget_usd > 0 else 0, 1
                ),
                "total_input_tokens": total_input,
                "total_output_tokens": total_output,
                "total_tokens": total_input + total_output,
                "operations_count": len(self._entries),
                "cost_by_category": {k: round(v, 6) for k, v in by_category.items()},
                "cost_by_provider": {k: round(v, 6) for k, v in by_provider.items()},
            }


# ══════════════════════════════════════════════════════════════
# 3. Google Technology Telemetry
# ══════════════════════════════════════════════════════════════

@dataclass
class GoogleTechnologyTelemetry:
    """
    Compteurs et métriques vérifiées d'utilisation des technologies Google.
    Aucun chiffre n'est inventé ou codé en dur : proviennent d'exécutions réelles.
    """
    mission_id: str
    google_ai_executions: int = 0
    google_search_executions: int = 0
    google_maps_executions: int = 0
    google_image_generations: int = 0
    google_video_generations: int = 0
    google_workspace_reads: int = 0
    google_workspace_writes: int = 0
    google_tools_used: int = 0
    google_artifacts_generated: int = 0
    total_latency_ms: int = 0
    total_cost_usd: float = 0.0
    executions: list[dict] = field(default_factory=list)

    def record_execution(
        self,
        capability: str,
        model: str,
        provider: str,
        access_method: str,
        latency_ms: int = 0,
        cost_usd: float = 0.0,
        metadata: Optional[dict] = None,
    ) -> dict:
        """Enregistre une exécution d'une technologie Google."""
        entry = {
            "capability": capability,
            "model": model,
            "provider": provider,
            "access_method": access_method,
            "latency_ms": latency_ms,
            "cost_usd": cost_usd,
            "timestamp": time.time(),
            "metadata": metadata or {},
        }
        self.executions.append(entry)
        self.total_latency_ms += latency_ms
        self.total_cost_usd += cost_usd

        # Incrémentation des compteurs vérifiés
        if capability.startswith("gemini."):
            self.google_ai_executions += 1
            if "search" in capability:
                self.google_search_executions += 1
                self.google_tools_used += 1
        elif capability.startswith("google.search"):
            self.google_search_executions += 1
            self.google_tools_used += 1
        elif capability.startswith("google.maps"):
            self.google_maps_executions += 1
            self.google_tools_used += 1
        elif capability.startswith("google.image"):
            self.google_image_generations += 1
            self.google_artifacts_generated += 1
        elif capability.startswith("google.video"):
            self.google_video_generations += 1
            self.google_artifacts_generated += 1
        elif capability.startswith("google.workspace") or capability.startswith("google.drive") or capability.startswith("google.docs") or capability.startswith("google.sheets"):
            if "read" in capability or "search" in capability:
                self.google_workspace_reads += 1
            else:
                self.google_workspace_writes += 1
                self.google_artifacts_generated += 1
            self.google_tools_used += 1

        return entry

    def summary(self) -> dict:
        """Retourne le bilan technique défendable de l'usage Google."""
        return {
            "mission_id": self.mission_id,
            "google_ai_executions": self.google_ai_executions,
            "google_search_executions": self.google_search_executions,
            "google_maps_executions": self.google_maps_executions,
            "google_image_generations": self.google_image_generations,
            "google_video_generations": self.google_video_generations,
            "google_workspace_reads": self.google_workspace_reads,
            "google_workspace_writes": self.google_workspace_writes,
            "google_tools_used": self.google_tools_used,
            "google_artifacts_generated": self.google_artifacts_generated,
            "total_latency_ms": self.total_latency_ms,
            "total_cost_usd": round(self.total_cost_usd, 6),
            "operations_count": len(self.executions),
        }


# ══════════════════════════════════════════════════════════════
# 4. Global Telemetry Registry
# ══════════════════════════════════════════════════════════════

class TelemetryRegistry:
    """
    Registre global de toutes les missions actives et leurs coûts.
    Permet d'obtenir une vue globale des dépenses du système.
    """

    def __init__(self):
        self._trackers: dict[str, MissionCostTracker] = {}
        self._google_trackers: dict[str, GoogleTechnologyTelemetry] = {}
        self._lock = threading.Lock()
        self._global_stats = {
            "total_missions_tracked": 0,
            "total_global_cost_usd": 0.0,
            "total_global_tokens": 0,
            "total_google_executions": 0,
        }

    def create_tracker(
        self,
        mission_id: str,
        max_budget_usd: float = 1.0,
        max_total_tokens: int = 500_000,
    ) -> MissionCostTracker:
        """Crée un tracker de coûts pour une nouvelle mission."""
        with self._lock:
            tracker = MissionCostTracker(
                mission_id=mission_id,
                max_budget_usd=max_budget_usd,
                max_total_tokens=max_total_tokens,
            )
            self._trackers[mission_id] = tracker
            if mission_id not in self._google_trackers:
                self._google_trackers[mission_id] = GoogleTechnologyTelemetry(mission_id=mission_id)
            self._global_stats["total_missions_tracked"] += 1
            return tracker

    def get_tracker(self, mission_id: str) -> Optional[MissionCostTracker]:
        """Récupère le tracker d'une mission."""
        with self._lock:
            return self._trackers.get(mission_id)

    def get_google_telemetry(self, mission_id: str) -> GoogleTechnologyTelemetry:
        """Récupère ou crée le tracker Google pour une mission."""
        with self._lock:
            if mission_id not in self._google_trackers:
                self._google_trackers[mission_id] = GoogleTechnologyTelemetry(mission_id=mission_id)
            return self._google_trackers[mission_id]

    def finalize_mission(self, mission_id: str) -> Optional[dict]:
        """
        Finalise une mission : collecte le résumé et nettoie le tracker.
        Retourne le résumé des coûts ou None si la mission n'existe pas.
        """
        with self._lock:
            tracker = self._trackers.pop(mission_id, None)
            google_tracker = self._google_trackers.get(mission_id)
        if tracker:
            summary = tracker.summary()
            if google_tracker:
                summary["google_technology_usage"] = google_tracker.summary()
                self._global_stats["total_google_executions"] += len(google_tracker.executions)
            self._global_stats["total_global_cost_usd"] += tracker.total_cost
            self._global_stats["total_global_tokens"] += tracker.total_tokens
            return summary
        return None

    def global_status(self) -> dict:
        """Statut global de la télémétrie."""
        with self._lock:
            active_missions = {
                mid: tracker.summary()
                for mid, tracker in self._trackers.items()
            }
        return {
            **self._global_stats,
            "active_missions_count": len(active_missions),
            "active_missions": active_missions,
        }


# ══════════════════════════════════════════════════════════════
# 5. Convenience: Quick Metrics & Google Recording
# ══════════════════════════════════════════════════════════════

def record_model_call(
    mission_id: str,
    model: str,
    provider: str,
    input_tokens: int,
    output_tokens: int,
    cost_usd: float,
    latency_ms: int,
) -> None:
    """Raccourci pour enregistrer un appel de modèle dans le tracker de la mission."""
    tracker = telemetry_registry.get_tracker(mission_id)
    if tracker:
        tracker.record(MissionCostEntry(
            category="model",
            provider=provider,
            operation=model,
            cost_usd=cost_usd,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
        ))


def record_tool_call(
    mission_id: str,
    tool_name: str,
    provider: str = "mcp",
    cost_usd: float = 0.0,
    latency_ms: int = 0,
) -> None:
    """Raccourci pour enregistrer un appel d'outil dans le tracker."""
    tracker = telemetry_registry.get_tracker(mission_id)
    if tracker:
        tracker.record(MissionCostEntry(
            category="tool",
            provider=provider,
            operation=tool_name,
            cost_usd=cost_usd,
            latency_ms=latency_ms,
        ))


def record_search(
    mission_id: str,
    provider: str = "tavily",
    cost_usd: float = 0.001,
    latency_ms: int = 0,
) -> None:
    """Raccourci pour enregistrer une recherche web."""
    tracker = telemetry_registry.get_tracker(mission_id)
    if tracker:
        tracker.record(MissionCostEntry(
            category="search",
            provider=provider,
            operation="web_search",
            cost_usd=cost_usd,
            latency_ms=latency_ms,
        ))


def record_google_telemetry(
    mission_id: str,
    capability: str,
    model: str,
    provider: str = "google",
    access_method: str = "DIRECT_GOOGLE",
    latency_ms: int = 0,
    cost_usd: float = 0.0,
    metadata: Optional[dict] = None,
) -> dict:
    """Raccourci pour enregistrer une exécution Google avec télémétrie matérielle."""
    gt = telemetry_registry.get_google_telemetry(mission_id)
    return gt.record_execution(
        capability=capability,
        model=model,
        provider=provider,
        access_method=access_method,
        latency_ms=latency_ms,
        cost_usd=cost_usd,
        metadata=metadata,
    )


# ══════════════════════════════════════════════════════════════
# Singleton
# ══════════════════════════════════════════════════════════════

telemetry_registry = TelemetryRegistry()

