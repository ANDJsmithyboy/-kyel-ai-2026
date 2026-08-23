"""
Ñkyel AI — Événements WorkGraph & Protocole VIE v1 · SmartANDJ AI Technologies
Émet et persiste les événements du WorkGraph pour visualisation en temps réel
dans le Canvas Ñkyel VIE (Visual Intelligence Experience).

Protocole VIE v1 — Types d'événements canoniques :

Mission Lifecycle:
  vie.mission.created.v1, vie.mission.completed.v1, vie.mission.cancelled.v1,
  vie.mission.failed.v1

Planning:
  vie.plan.created.v1, vie.plan.updated.v1

Tasks:
  vie.task.started.v1, vie.task.completed.v1, vie.task.failed.v1

Agents:
  vie.agent.spawned.v1, vie.agent.completed.v1

Tools:
  vie.tool.requested.v1, vie.tool.started.v1, vie.tool.completed.v1, vie.tool.failed.v1

Knowledge:
  vie.source.discovered.v1, vie.evidence.accepted.v1,
  vie.hypothesis.created.v1, vie.hypothesis.rejected.v1,
  vie.decision.created.v1

Outputs:
  vie.artifact.created.v1, vie.checkpoint.created.v1

Media (Backward Compatibility):
  media.job.created, media.prompt.enhanced, media.provider.selected,
  media.generation.started, media.progress.updated, media.asset.generated,
  media.postprocessing.started, media.artifact.created,
  media.job.failed, media.job.completed

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import uuid
import json
import time
import logging
import asyncio
from enum import Enum
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, AsyncGenerator, Set
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import WorkGraphEventRecord
from db.session import async_session
from events.persistent_store import append_event as sqlite_append_event

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# VIE v1 Event Types
# ══════════════════════════════════════════════════════════════

class VIEEventType(str, Enum):
    """Types d'événements du protocole VIE v1."""

    # Mission Lifecycle
    MISSION_CREATED = "vie.mission.created.v1"
    MISSION_COMPLETED = "vie.mission.completed.v1"
    MISSION_CANCELLED = "vie.mission.cancelled.v1"
    MISSION_FAILED = "vie.mission.failed.v1"

    # Planning
    PLAN_CREATED = "vie.plan.created.v1"
    PLAN_UPDATED = "vie.plan.updated.v1"

    # Tasks
    TASK_STARTED = "vie.task.started.v1"
    TASK_COMPLETED = "vie.task.completed.v1"
    TASK_FAILED = "vie.task.failed.v1"

    # Agents
    AGENT_SPAWNED = "vie.agent.spawned.v1"
    AGENT_COMPLETED = "vie.agent.completed.v1"

    # Tools
    TOOL_REQUESTED = "vie.tool.requested.v1"
    TOOL_STARTED = "vie.tool.started.v1"
    TOOL_COMPLETED = "vie.tool.completed.v1"
    TOOL_FAILED = "vie.tool.failed.v1"

    # Knowledge Graph
    SOURCE_DISCOVERED = "vie.source.discovered.v1"
    EVIDENCE_ACCEPTED = "vie.evidence.accepted.v1"
    HYPOTHESIS_CREATED = "vie.hypothesis.created.v1"
    HYPOTHESIS_REJECTED = "vie.hypothesis.rejected.v1"
    DECISION_CREATED = "vie.decision.created.v1"

    # Outputs
    ARTIFACT_CREATED = "vie.artifact.created.v1"
    CHECKPOINT_CREATED = "vie.checkpoint.created.v1"


# Terminal event types (close the SSE stream)
_TERMINAL_EVENT_TYPES: Set[str] = {
    VIEEventType.MISSION_COMPLETED.value,
    VIEEventType.MISSION_CANCELLED.value,
    VIEEventType.MISSION_FAILED.value,
    "media.job.completed",
    "media.job.failed",
}


# ══════════════════════════════════════════════════════════════
# SSE Subscriber Registry
# ══════════════════════════════════════════════════════════════

# Dual subscriptions: by job_id (media backward compat) and by mission_id (VIE v1)
_SSE_SUBSCRIBERS: Dict[str, List[asyncio.Queue]] = {}       # job_id -> queues
_MISSION_SUBSCRIBERS: Dict[str, List[asyncio.Queue]] = {}   # mission_id -> queues


# ══════════════════════════════════════════════════════════════
# WorkGraph Event Service (VIE v1 + Backward Compatible)
# ══════════════════════════════════════════════════════════════

class WorkGraphEventService:
    """
    Service de publication, persistance et streaming des événements WorkGraph.
    Supporte le protocole VIE v1 et les événements média legacy.
    """

    @classmethod
    async def emit_event(
        cls,
        event_type: str,
        run_id: str,
        job_id: Optional[str] = None,
        user_id: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None,
        db: Optional[AsyncSession] = None,
        *,
        mission_id: Optional[str] = None,
        trace_id: Optional[str] = None,
        node: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Émet un événement WorkGraph VIE v1.

        Args:
            event_type: Type d'événement (VIEEventType ou string legacy)
            run_id: Identifiant de la run LangGraph
            job_id: Identifiant du job média (backward compat)
            user_id: Identifiant de l'utilisateur
            payload: Données supplémentaires de l'événement
            db: Session SQLAlchemy optionnelle
            mission_id: Identifiant de la mission Ñkyel
            trace_id: Identifiant de trace pour corrélation
            node: Nœud WorkGraph associé à l'événement
        """
        event_id = f"evt_{uuid.uuid4().hex[:10]}"
        now = datetime.now(timezone.utc)
        payload_data = payload or {}

        # Résoudre le type d'événement (enum ou string)
        type_str = event_type.value if isinstance(event_type, VIEEventType) else event_type

        # Enrichir avec le contexte de traçabilité s'il n'est pas fourni
        if not trace_id or not mission_id:
            try:
                from core.context import get_context
                ctx = get_context()
                trace_id = trace_id or ctx.trace_id
                mission_id = mission_id or ctx.mission_id
                user_id = user_id or ctx.user_id
            except Exception:
                pass

        # Construire l'événement VIE v1
        event_dict: Dict[str, Any] = {
            "id": event_id,
            "type": type_str,
            "version": "v1",
            "run_id": run_id,
            "timestamp": now.isoformat(),
        }

        # Champs optionnels (ajoutés seulement s'ils existent)
        if mission_id:
            event_dict["mission_id"] = mission_id
        if trace_id:
            event_dict["trace_id"] = trace_id
        if job_id:
            event_dict["job_id"] = job_id
        if user_id:
            event_dict["user_id"] = user_id
        if node:
            event_dict["node"] = node
        if payload_data:
            event_dict["payload"] = payload_data

        # ── 1. Persistance SQLite locale (P0) ────────────────
        try:
            sqlite_append_event(run_id, event_id, type_str, {
                **payload_data,
                "mission_id": mission_id,
                "trace_id": trace_id,
                "node_id": node.get("id") if node else None,
            })
        except Exception as e:
            logger.debug(f"SQLite event store fallback note: {e}")

        # ── 2. Persistance Neon PostgreSQL (async) ───────────
        if db:
            try:
                record = WorkGraphEventRecord(
                    id=event_id,
                    run_id=run_id,
                    job_id=job_id,
                    user_id=user_id,
                    event_type=type_str,
                    payload=json.dumps(
                        {**payload_data, "mission_id": mission_id, "trace_id": trace_id},
                        ensure_ascii=False,
                    ),
                    timestamp=now,
                )
                db.add(record)
                await db.commit()
            except Exception as e:
                logger.warning(f"Neon event store note: {e}")

        # ── 3. Notification SSE — mission subscribers (VIE v1) ─
        if mission_id and mission_id in _MISSION_SUBSCRIBERS:
            for queue in _MISSION_SUBSCRIBERS[mission_id]:
                try:
                    await queue.put(event_dict)
                except Exception:
                    pass

        # ── 4. Notification SSE — job subscribers (backward compat)
        if job_id and job_id in _SSE_SUBSCRIBERS:
            for queue in _SSE_SUBSCRIBERS[job_id]:
                try:
                    await queue.put(event_dict)
                except Exception:
                    pass

        logger.debug(
            f"VIE Event: {type_str} | run={run_id} | mission={mission_id} | id={event_id}"
        )

        return event_dict

    # ── VIE v1 Convenience Emitters ──────────────────────────

    @classmethod
    async def emit_mission_created(
        cls, run_id: str, goal: str, user_id: Optional[str] = None, **kwargs
    ) -> Dict[str, Any]:
        return await cls.emit_event(
            VIEEventType.MISSION_CREATED, run_id,
            user_id=user_id,
            payload={"goal": goal},
            **kwargs,
        )

    @classmethod
    async def emit_plan_created(
        cls, run_id: str, tasks: list, version: int = 1, **kwargs
    ) -> Dict[str, Any]:
        return await cls.emit_event(
            VIEEventType.PLAN_CREATED, run_id,
            payload={"tasks": tasks, "plan_version": version},
            **kwargs,
        )

    @classmethod
    async def emit_task_started(
        cls, run_id: str, task_id: str, title: str, **kwargs
    ) -> Dict[str, Any]:
        return await cls.emit_event(
            VIEEventType.TASK_STARTED, run_id,
            payload={"task_id": task_id, "title": title},
            **kwargs,
        )

    @classmethod
    async def emit_task_completed(
        cls, run_id: str, task_id: str, title: str, result_summary: str = "", **kwargs
    ) -> Dict[str, Any]:
        return await cls.emit_event(
            VIEEventType.TASK_COMPLETED, run_id,
            payload={"task_id": task_id, "title": title, "result_summary": result_summary},
            **kwargs,
        )

    @classmethod
    async def emit_tool_started(
        cls, run_id: str, tool_name: str, tool_input: Optional[str] = None, **kwargs
    ) -> Dict[str, Any]:
        return await cls.emit_event(
            VIEEventType.TOOL_STARTED, run_id,
            payload={"tool_name": tool_name, "input": tool_input},
            **kwargs,
        )

    @classmethod
    async def emit_tool_completed(
        cls, run_id: str, tool_name: str, latency_ms: int = 0, **kwargs
    ) -> Dict[str, Any]:
        return await cls.emit_event(
            VIEEventType.TOOL_COMPLETED, run_id,
            payload={"tool_name": tool_name, "latency_ms": latency_ms},
            **kwargs,
        )

    @classmethod
    async def emit_source_discovered(
        cls, run_id: str, url: str, title: str = "", **kwargs
    ) -> Dict[str, Any]:
        return await cls.emit_event(
            VIEEventType.SOURCE_DISCOVERED, run_id,
            payload={"url": url, "title": title},
            **kwargs,
        )

    @classmethod
    async def emit_mission_completed(
        cls, run_id: str, summary: str = "", **kwargs
    ) -> Dict[str, Any]:
        return await cls.emit_event(
            VIEEventType.MISSION_COMPLETED, run_id,
            payload={"summary": summary},
            **kwargs,
        )

    @classmethod
    async def emit_mission_cancelled(
        cls, run_id: str, reason: str = "user_requested", **kwargs
    ) -> Dict[str, Any]:
        return await cls.emit_event(
            VIEEventType.MISSION_CANCELLED, run_id,
            payload={"reason": reason},
            **kwargs,
        )

    @classmethod
    async def emit_checkpoint(
        cls, run_id: str, checkpoint_data: Optional[Dict] = None, **kwargs
    ) -> Dict[str, Any]:
        return await cls.emit_event(
            VIEEventType.CHECKPOINT_CREATED, run_id,
            payload={"checkpoint": checkpoint_data or {}},
            **kwargs,
        )

    # ── SSE Subscription (Mission Level — VIE v1) ──────────

    @classmethod
    async def subscribe_mission_events(
        cls, mission_id: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Générateur asynchrone SSE pour tous les événements d'une mission."""
        queue: asyncio.Queue = asyncio.Queue()
        if mission_id not in _MISSION_SUBSCRIBERS:
            _MISSION_SUBSCRIBERS[mission_id] = []
        _MISSION_SUBSCRIBERS[mission_id].append(queue)

        try:
            while True:
                event = await queue.get()
                yield event
                if event.get("type") in _TERMINAL_EVENT_TYPES:
                    break
        finally:
            if mission_id in _MISSION_SUBSCRIBERS and queue in _MISSION_SUBSCRIBERS[mission_id]:
                _MISSION_SUBSCRIBERS[mission_id].remove(queue)
                if not _MISSION_SUBSCRIBERS[mission_id]:
                    del _MISSION_SUBSCRIBERS[mission_id]

    # ── SSE Subscription (Job Level — Backward Compatible) ──

    @classmethod
    async def subscribe_job_events(cls, job_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Générateur asynchrone pour abonner un endpoint SSE aux événements d'un job."""
        queue: asyncio.Queue = asyncio.Queue()
        if job_id not in _SSE_SUBSCRIBERS:
            _SSE_SUBSCRIBERS[job_id] = []
        _SSE_SUBSCRIBERS[job_id].append(queue)

        try:
            while True:
                event = await queue.get()
                yield event
                if event.get("type") in _TERMINAL_EVENT_TYPES:
                    break
        finally:
            if job_id in _SSE_SUBSCRIBERS and queue in _SSE_SUBSCRIBERS[job_id]:
                _SSE_SUBSCRIBERS[job_id].remove(queue)
                if not _SSE_SUBSCRIBERS[job_id]:
                    del _SSE_SUBSCRIBERS[job_id]

    # ── Cleanup ──────────────────────────────────────────────

    @classmethod
    def cleanup_subscribers(cls, identifier: str) -> None:
        """Nettoie les abonnés pour un identifiant donné."""
        _SSE_SUBSCRIBERS.pop(identifier, None)
        _MISSION_SUBSCRIBERS.pop(identifier, None)
