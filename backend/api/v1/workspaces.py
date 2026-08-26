from typing import List
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
