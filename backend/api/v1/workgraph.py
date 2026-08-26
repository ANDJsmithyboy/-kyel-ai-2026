from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import get_current_user_id
from db.models import WorkgraphNode, WorkgraphEdge, WorkspaceMember
from db.session import get_db

router = APIRouter(prefix="/workgraph", tags=["WorkGraph"])


class WorkgraphNodeBase(BaseModel):
    workspace_id: str
    mission_id: Optional[str] = None
    node_type: str
    label: str
    payload: Optional[Dict[str, Any]] = None


class WorkgraphNodeResponse(WorkgraphNodeBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkgraphEdgeBase(BaseModel):
    workspace_id: str
    source_node_id: str
    target_node_id: str
    relation_type: str


class WorkgraphEdgeResponse(WorkgraphEdgeBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/nodes", response_model=List[WorkgraphNodeResponse])
async def list_nodes(
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

    stmt = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == ws_uuid,
        WorkspaceMember.user_id == user_uuid
    )
    res = await db.execute(stmt)
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Accès refusé")

    stmt = select(WorkgraphNode).where(WorkgraphNode.workspace_id == ws_uuid)
    if mission_id:
        try:
            m_uuid = uuid.UUID(mission_id)
            stmt = stmt.where(WorkgraphNode.mission_id == m_uuid)
        except ValueError:
            pass

    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/nodes", response_model=WorkgraphNodeResponse)
async def create_node(
    req: WorkgraphNodeBase,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_uuid = uuid.UUID(user_id)
        ws_uuid = uuid.UUID(req.workspace_id)
        m_uuid = uuid.UUID(req.mission_id) if req.mission_id else None
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == ws_uuid,
        WorkspaceMember.user_id == user_uuid
    )
    res = await db.execute(stmt)
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Accès refusé")

    node = WorkgraphNode(
        workspace_id=ws_uuid,
        mission_id=m_uuid,
        node_type=req.node_type,
        label=req.label,
        payload=req.payload,
    )
    db.add(node)
    await db.flush()
    return node


@router.get("/edges", response_model=List[WorkgraphEdgeResponse])
async def list_edges(
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
    res = await db.execute(stmt)
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Accès refusé")

    stmt = select(WorkgraphEdge).where(WorkgraphEdge.workspace_id == ws_uuid)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/edges", response_model=WorkgraphEdgeResponse)
async def create_edge(
    req: WorkgraphEdgeBase,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_uuid = uuid.UUID(user_id)
        ws_uuid = uuid.UUID(req.workspace_id)
        src_uuid = uuid.UUID(req.source_node_id)
        tgt_uuid = uuid.UUID(req.target_node_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == ws_uuid,
        WorkspaceMember.user_id == user_uuid
    )
    res = await db.execute(stmt)
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Accès refusé")

    edge = WorkgraphEdge(
        workspace_id=ws_uuid,
        source_node_id=src_uuid,
        target_node_id=tgt_uuid,
        relation_type=req.relation_type,
    )
    db.add(edge)
    await db.flush()
    return edge
