"""
Ñkyel AI — Artifacts Metadata API · Neon PostgreSQL
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

PRODUCTION CONTRACT: Artifact metadata in Neon. Binaries on R2.
"""

import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import get_current_user_id
from db.models import Artifact, WorkspaceMember
from db.session import get_db

router = APIRouter(prefix="/artifacts", tags=["Artifacts"])


class ArtifactCreateReq(BaseModel):
    workspace_id: str
    mission_id: Optional[str] = None
    run_id: Optional[str] = None
    artifact_type: str  # REPORT, CODE, CHART, TABLE, IMAGE, FILE
    title: str
    description: Optional[str] = None
    mime_type: Optional[str] = None
    content_text: Optional[str] = None
    content_url: Optional[str] = None
    content_size_bytes: Optional[int] = None
    meta_json: Optional[Dict[str, Any]] = None


class ArtifactResp(BaseModel):
    id: str
    workspace_id: str
    mission_id: Optional[str]
    run_id: Optional[str]
    artifact_type: str
    title: str
    description: Optional[str]
    mime_type: Optional[str]
    content_text: Optional[str]
    content_url: Optional[str]
    content_size_bytes: Optional[int]
    version: int
    created_at: datetime

    class Config:
        from_attributes = True


class ArtifactUpdateReq(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content_text: Optional[str] = None
    content_url: Optional[str] = None
    pinned: Optional[bool] = None


# ══════════════════════════════════════════════════════════════
# ARTIFACTS CRUD
# ══════════════════════════════════════════════════════════════

@router.post("", response_model=ArtifactResp, status_code=201)
async def create_artifact(
    req: ArtifactCreateReq,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_uuid = uuid.UUID(user_id)
        ws_uuid = uuid.UUID(req.workspace_id)
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

    mission_uuid = uuid.UUID(req.mission_id) if req.mission_id else None
    run_uuid = uuid.UUID(req.run_id) if req.run_id else None

    artifact = Artifact(
        workspace_id=ws_uuid,
        mission_id=mission_uuid,
        run_id=run_uuid,
        created_by_user_id=user_uuid,
        artifact_type=req.artifact_type,
        title=req.title,
        description=req.description,
        mime_type=req.mime_type,
        content_text=req.content_text,
        content_url=req.content_url,
        content_size_bytes=req.content_size_bytes,
        meta_json=req.meta_json,
        version=1,
    )
    db.add(artifact)
    await db.flush()
    await db.refresh(artifact)
    return artifact


@router.get("", response_model=List[ArtifactResp])
async def list_artifacts(
    workspace_id: str = Query(...),
    mission_id: Optional[str] = None,
    run_id: Optional[str] = None,
    artifact_type: Optional[str] = None,
    limit: int = Query(50, le=200),
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

    query = (
        select(Artifact)
        .where(Artifact.workspace_id == ws_uuid, Artifact.deleted_at.is_(None))
        .order_by(Artifact.created_at.desc())
        .limit(limit)
    )

    if mission_id:
        try:
            query = query.where(Artifact.mission_id == uuid.UUID(mission_id))
        except ValueError:
            pass

    if run_id:
        try:
            query = query.where(Artifact.run_id == uuid.UUID(run_id))
        except ValueError:
            pass

    if artifact_type:
        query = query.where(Artifact.artifact_type == artifact_type)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{artifact_id}", response_model=ArtifactResp)
async def get_artifact(
    artifact_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        art_uuid = uuid.UUID(artifact_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = select(Artifact).where(Artifact.id == art_uuid)
    result = await db.execute(stmt)
    artifact = result.scalar_one_or_none()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact introuvable")

    return artifact


@router.patch("/{artifact_id}", response_model=ArtifactResp)
async def update_artifact(
    artifact_id: str,
    req: ArtifactUpdateReq,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        art_uuid = uuid.UUID(artifact_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = select(Artifact).where(Artifact.id == art_uuid)
    result = await db.execute(stmt)
    artifact = result.scalar_one_or_none()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact introuvable")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(artifact, key, value)

    artifact.version = (artifact.version or 1) + 1
    await db.flush()
    await db.refresh(artifact)
    return artifact


@router.delete("/{artifact_id}", status_code=204)
async def delete_artifact(
    artifact_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        art_uuid = uuid.UUID(artifact_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = select(Artifact).where(Artifact.id == art_uuid)
    result = await db.execute(stmt)
    artifact = result.scalar_one_or_none()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact introuvable")

    artifact.deleted_at = datetime.now()
    await db.flush()
