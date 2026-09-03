"""
Ñkyel AI — Event Spine API · Neon PostgreSQL
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

PRODUCTION CONTRACT: All events persisted to Neon event_spine.
SSE for live delivery, PostgreSQL for history.
"""

import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel, Field
import uuid

from core.security import get_current_user_id
from db.session import get_db
from db.models import MissionEvent, Run, WorkspaceMember
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

router = APIRouter(prefix="/events", tags=["events"])


# ── Schemas ─────────────────────────────────────────────────

class EventCreateReq(BaseModel):
    run_id: str
    event_type: str
    version: str = "1.0.0"
    payload: Optional[Dict[str, Any]] = None
    node_id: Optional[str] = None
    idempotency_key: Optional[str] = None


class EventResp(BaseModel):
    id: str
    run_id: str
    event_type: str
    version: str
    sequence: int
    payload: Optional[Dict[str, Any]]
    node_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class RunCreateReq(BaseModel):
    workspace_id: str
    mission_id: str
    run_type: str = "FULL"


class RunResp(BaseModel):
    id: str
    mission_id: str
    workspace_id: str
    run_type: str
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════
# RUNS CRUD
# ══════════════════════════════════════════════════════════════

@router.post("/runs", response_model=RunResp, status_code=201)
async def create_run(
    req: RunCreateReq,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_uuid = uuid.UUID(user_id)
        ws_uuid = uuid.UUID(req.workspace_id)
        mission_uuid = uuid.UUID(req.mission_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    # Check workspace access
    stmt = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == ws_uuid,
        WorkspaceMember.user_id == user_uuid
    )
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Accès refusé")

    run = Run(
        mission_id=mission_uuid,
        status="QUEUED",
    )
    db.add(run)
    await db.flush()
    await db.refresh(run)
    return run


@router.get("/runs/{run_id}", response_model=RunResp)
async def get_run(
    run_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        run_uuid = uuid.UUID(run_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = select(Run).where(Run.id == run_uuid)
    result = await db.execute(stmt)
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run introuvable")
    return run


@router.get("/runs", response_model=List[RunResp])
async def list_runs(
    workspace_id: str = Query(...),
    mission_id: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_uuid = uuid.UUID(user_id)
        ws_uuid = uuid.UUID(workspace_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    # Check workspace access
    stmt = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == ws_uuid,
        WorkspaceMember.user_id == user_uuid
    )
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Accès refusé")

    query = select(Run).where(Run.workspace_id == ws_uuid).order_by(Run.created_at.desc())
    if mission_id:
        try:
            m_uuid = uuid.UUID(mission_id)
            query = query.where(Run.mission_id == m_uuid)
        except ValueError:
            pass

    result = await db.execute(query)
    return result.scalars().all()


# ══════════════════════════════════════════════════════════════
# EVENT SPINE CRUD
# ══════════════════════════════════════════════════════════════

@router.post("", response_model=EventResp, status_code=201)
async def append_event(
    req: EventCreateReq,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        run_uuid = uuid.UUID(req.run_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    # Get next sequence number for this run
    from sqlalchemy import func
    seq_stmt = select(func.coalesce(func.max(MissionEvent.sequence), 0) + 1).where(
        MissionEvent.run_id == run_uuid
    )
    seq_result = await db.execute(seq_stmt)
    next_seq = seq_result.scalar()

    node_uuid = None
    if req.node_id:
        try:
            node_uuid = uuid.UUID(req.node_id)
        except ValueError:
            pass

    # Get Run to fetch mission_id and workspace_id
    run_stmt = select(Run).where(Run.id == run_uuid)
    run_res = await db.execute(run_stmt)
    run_obj = run_res.scalar_one_or_none()
    if not run_obj:
        raise HTTPException(status_code=404, detail="Run non trouvé")

    event = MissionEvent(
        workspace_id=run_obj.workspace_id,
        mission_id=run_obj.mission_id,
        run_id=run_uuid,
        event_type=req.event_type,
        version=req.version,
        sequence=next_seq,
        payload=req.payload,
        node_id=node_uuid,
        idempotency_key=req.idempotency_key,
    )
    db.add(event)
    await db.flush()
    await db.refresh(event)
    return event


@router.get("", response_model=List[EventResp])
async def list_events(
    run_id: str = Query(...),
    after_sequence: int = Query(0),
    limit: int = Query(200, le=1000),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        run_uuid = uuid.UUID(run_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = (
        select(MissionEvent)
        .where(MissionEvent.run_id == run_uuid, MissionEvent.sequence > after_sequence)
        .order_by(MissionEvent.sequence.asc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/runs/{run_id}/cancel", response_model=RunResp)
async def cancel_run(
    run_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Annule immédiatement l'exécution d'un run."""
    try:
        run_uuid = uuid.UUID(run_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = select(Run).where(Run.id == run_uuid)
    result = await db.execute(stmt)
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run introuvable")

    run.status = "CANCELLED"
    run.completed_at = datetime.now(timezone.utc)
    await db.flush()

    try:
        from core.cancellation import cancellation_manager
        cancellation_manager.cancel_mission(run_id, reason="user_requested")
    except Exception:
        pass

    return run

