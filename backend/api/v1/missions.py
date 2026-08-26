from typing import List, Optional
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import get_current_user_id
from db.models import Mission, WorkspaceMember
from db.session import get_db

router = APIRouter(prefix="/missions", tags=["Missions"])


class MissionCreateRequest(BaseModel):
    workspace_id: str
    title: str
    objective: str
    priority: str = "normal"
    autonomy_level: str = "semi_autonomous"


class MissionResponse(BaseModel):
    id: str
    workspace_id: str
    title: str
    objective: str
    status: str
    priority: str
    autonomy_level: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("", response_model=MissionResponse)
async def create_mission(
    req: MissionCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_uuid = uuid.UUID(user_id)
        ws_uuid = uuid.UUID(req.workspace_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    # Vérifier l'accès au workspace
    stmt = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == ws_uuid,
        WorkspaceMember.user_id == user_uuid
    )
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Accès refusé au workspace")

    mission = Mission(
        workspace_id=ws_uuid,
        created_by_user_id=user_uuid,
        title=req.title,
        objective=req.objective,
        priority=req.priority,
        autonomy_level=req.autonomy_level,
        status="draft"
    )
    db.add(mission)
    await db.flush()
    return mission


@router.get("", response_model=List[MissionResponse])
async def list_missions(
    workspace_id: str = Query(...),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_uuid = uuid.UUID(user_id)
        ws_uuid = uuid.UUID(workspace_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == ws_uuid,
        WorkspaceMember.user_id == user_uuid
    )
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Accès refusé au workspace")

    stmt = select(Mission).where(Mission.workspace_id == ws_uuid).order_by(Mission.created_at.desc())
    result = await db.execute(stmt)
    missions = result.scalars().all()
    return missions


@router.get("/{mission_id}", response_model=MissionResponse)
async def get_mission(
    mission_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_uuid = uuid.UUID(user_id)
        m_uuid = uuid.UUID(mission_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = select(Mission).where(Mission.id == m_uuid)
    result = await db.execute(stmt)
    mission = result.scalar_one_or_none()

    if not mission:
        raise HTTPException(status_code=404, detail="Mission introuvable")

    # Vérifier l'accès
    stmt_ws = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == mission.workspace_id,
        WorkspaceMember.user_id == user_uuid
    )
    res_ws = await db.execute(stmt_ws)
    if not res_ws.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Accès refusé")

    return mission
