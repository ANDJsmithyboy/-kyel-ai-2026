"""
Ñkyel AI — Événements WorkGraph Multimédia & Diffusion SSE · SmartANDJ AI Technologies
Émet et persiste les événements du WorkGraph pour visualisation en temps réel dans le Canvas Ñkyel VIE.

10 Types d'événements canoniques :
1. media.job.created
2. media.prompt.enhanced
3. media.provider.selected
4. media.generation.started
5. media.progress.updated
6. media.asset.generated
7. media.postprocessing.started
8. media.artifact.created
9. media.job.failed
10. media.job.completed

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import uuid
import json
import time
import logging
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import WorkGraphEventRecord
from db.session import async_session
from events.persistent_store import append_event as sqlite_append_event

logger = logging.getLogger(__name__)

# Abonnés SSE en mémoire pour le streaming direct vers le client Web
_SSE_SUBSCRIBERS: Dict[str, List[asyncio.Queue]] = {}  # job_id -> list of queues


class WorkGraphEventService:
    """Service de publication, persistance et streaming des événements WorkGraph multimédia."""

    @classmethod
    async def emit_event(
        cls,
        event_type: str,
        run_id: str,
        job_id: Optional[str] = None,
        user_id: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None,
        db: Optional[AsyncSession] = None,
    ) -> Dict[str, Any]:
        """
        Émet un événement WorkGraph, le stocke dans Neon/SQLite et notifie les clients SSE.
        """
        event_id = f"evt_{uuid.uuid4().hex[:10]}"
        now = datetime.now(timezone.utc)
        payload_data = payload or {}

        event_dict = {
            "id": event_id,
            "type": event_type,
            "run_id": run_id,
            "job_id": job_id,
            "user_id": user_id,
            "payload": payload_data,
            "timestamp": now.isoformat(),
        }

        # 1. Sauvegarde SQLite rapide P0
        try:
            sqlite_append_event(run_id, event_id, event_type, payload_data)
        except Exception as e:
            logger.debug(f"SQLite event store fallback note: {e}")

        # 2. Sauvegarde Neon PostgreSQL
        async def _save_neon(session: AsyncSession):
            try:
                record = WorkGraphEventRecord(
                    id=event_id,
                    run_id=run_id,
                    job_id=job_id,
                    user_id=user_id,
                    event_type=event_type,
                    payload=json.dumps(payload_data, ensure_ascii=False),
                    timestamp=now,
                )
                session.add(record)
                await session.commit()
            except Exception as e:
                logger.warning(f"Neon event store note: {e}")

        if db:
            await _save_neon(db)


        # 3. Notification des flux SSE temps réel
        if job_id and job_id in _SSE_SUBSCRIBERS:
            for queue in _SSE_SUBSCRIBERS[job_id]:
                try:
                    await queue.put(event_dict)
                except Exception:
                    pass

        return event_dict

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
                if event.get("type") in ("media.job.completed", "media.job.failed"):
                    break
        finally:
            if job_id in _SSE_SUBSCRIBERS and queue in _SSE_SUBSCRIBERS[job_id]:
                _SSE_SUBSCRIBERS[job_id].remove(queue)
                if not _SSE_SUBSCRIBERS[job_id]:
                    del _SSE_SUBSCRIBERS[job_id]
