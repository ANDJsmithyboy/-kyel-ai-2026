from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import get_current_user_id
from db.models import Workspace, WorkspaceMember, User
from db.session import get_db

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    tier: str
    role: str

    class Config:
        from_attributes = True


class WorkspaceCreateRequest(BaseModel):
    name: str
    tier: Optional[str] = "free"


async def _get_or_create_default_workspace(user_uuid: uuid.UUID, db: AsyncSession) -> tuple[Workspace, str]:
    stmt = (
        select(Workspace, WorkspaceMember.role)
        .join(WorkspaceMember, Workspace.id == WorkspaceMember.workspace_id)
        .where(WorkspaceMember.user_id == user_uuid)
    )
    result = await db.execute(stmt)
    rows = result.all()

    if rows:
        return rows[0][0], rows[0][1]

    # Auto-provision primary workspace
    ws = Workspace(
        name="Espace Personnel",
        created_by_user_id=user_uuid,
    )
    ws.tier = "free"
    db.add(ws)
    await db.flush()

    member = WorkspaceMember(
        workspace_id=ws.id,
        user_id=user_uuid,
        role="owner",
    )
    db.add(member)
    await db.flush()

    return ws, "owner"


@router.get("", response_model=List[WorkspaceResponse])
async def list_workspaces(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Liste tous les workspaces auxquels l'utilisateur a accès."""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")

    stmt = (
        select(Workspace, WorkspaceMember.role)
        .join(WorkspaceMember, Workspace.id == WorkspaceMember.workspace_id)
        .where(WorkspaceMember.user_id == user_uuid)
    )
    result = await db.execute(stmt)
    rows = result.all()

    if not rows:
        ws, role = await _get_or_create_default_workspace(user_uuid, db)
        return [
            WorkspaceResponse(
                id=str(ws.id),
                name=ws.name,
                tier=ws.tier,
                role=role,
            )
        ]

    workspaces = []
    for ws, role in rows:
        workspaces.append(
            WorkspaceResponse(
                id=str(ws.id),
                name=ws.name,
                tier=ws.tier,
                role=role,
            )
        )
    return workspaces


@router.get("/current", response_model=WorkspaceResponse)
async def get_current_workspace(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Retourne l'espace de travail actif pour l'utilisateur."""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")

    ws, role = await _get_or_create_default_workspace(user_uuid, db)
    return WorkspaceResponse(
        id=str(ws.id),
        name=ws.name,
        tier=ws.tier,
        role=role,
    )


@router.post("", response_model=WorkspaceResponse, status_code=201)
async def create_workspace(
    body: WorkspaceCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Crée un nouvel espace de travail pour l'utilisateur."""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")

    ws = Workspace(
        name=body.name,
        created_by_user_id=user_uuid,
    )
    ws.tier = body.tier or "free"
    db.add(ws)
    await db.flush()

    member = WorkspaceMember(
        workspace_id=ws.id,
        user_id=user_uuid,
        role="owner",
    )
    db.add(member)
    await db.flush()

    return WorkspaceResponse(
        id=str(ws.id),
        name=ws.name,
        tier=ws.tier,
        role="owner",
    )
