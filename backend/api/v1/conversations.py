"""
Ñkyel AI — Conversations & Messages API · Neon PostgreSQL
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

PRODUCTION CONTRACT: Every message persists in Neon.
No localStorage. No in-memory-only state.
"""

import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import get_current_user_id
from db.models import Conversation, Message, WorkspaceMember
from db.session import get_db

router = APIRouter(prefix="/conversations", tags=["Conversations"])


# ── Request / Response schemas ─────────────────────────────

class ConversationCreateReq(BaseModel):
    workspace_id: str
    title: Optional[str] = None
    conversation_type: str = "CHAT"
    model_profile: Optional[str] = None


class ConversationResp(BaseModel):
    id: str
    workspace_id: str
    title: Optional[str]
    conversation_type: str
    model_profile: Optional[str]
    status: str
    message_count: int
    last_message_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationUpdateReq(BaseModel):
    title: Optional[str] = None
    pinned: Optional[bool] = None
    archived: Optional[bool] = None


class MessageCreateReq(BaseModel):
    role: str  # user | assistant | system | tool
    content: str
    model_id: Optional[str] = None
    parent_message_id: Optional[str] = None
    tool_calls_json: Optional[dict] = None
    sources_json: Optional[list] = None
    artifacts_json: Optional[list] = None


class MessageResp(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    model_id: Optional[str]
    token_count: Optional[int]
    parent_message_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Helpers ─────────────────────────────────────────────────

async def _check_ws_access(db: AsyncSession, user_id: str, workspace_id: str):
    """Verify user has access to workspace. Raises 403 if not."""
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
    return user_uuid, ws_uuid


# ══════════════════════════════════════════════════════════════
# CONVERSATIONS CRUD
# ══════════════════════════════════════════════════════════════

@router.post("", response_model=ConversationResp, status_code=201)
async def create_conversation(
    req: ConversationCreateReq,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    user_uuid, ws_uuid = await _check_ws_access(db, user_id, req.workspace_id)

    conv = Conversation(
        workspace_id=ws_uuid,
        started_by_user_id=user_uuid,
        title=req.title or "Nouvelle conversation",
        conversation_type=req.conversation_type,
        model_profile=req.model_profile,
        status="ACTIVE",
        message_count=0,
    )
    db.add(conv)
    await db.flush()
    await db.refresh(conv)
    return conv


@router.get("", response_model=List[ConversationResp])
async def list_conversations(
    workspace_id: str = Query(...),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    _, ws_uuid = await _check_ws_access(db, user_id, workspace_id)

    stmt = (
        select(Conversation)
        .where(Conversation.workspace_id == ws_uuid, Conversation.deleted_at.is_(None))
        .order_by(Conversation.updated_at.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{conversation_id}", response_model=ConversationResp)
async def get_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = select(Conversation).where(Conversation.id == conv_uuid)
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation introuvable")

    await _check_ws_access(db, user_id, str(conv.workspace_id))
    return conv


@router.patch("/{conversation_id}", response_model=ConversationResp)
async def update_conversation(
    conversation_id: str,
    req: ConversationUpdateReq,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = select(Conversation).where(Conversation.id == conv_uuid)
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation introuvable")

    await _check_ws_access(db, user_id, str(conv.workspace_id))

    if req.title is not None:
        conv.title = req.title
    if req.pinned is not None:
        conv.pinned = req.pinned
    if req.archived is not None:
        if req.archived:
            conv.archived_at = datetime.now()
        else:
            conv.archived_at = None

    await db.flush()
    await db.refresh(conv)
    return conv


@router.delete("/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    stmt = select(Conversation).where(Conversation.id == conv_uuid)
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation introuvable")

    await _check_ws_access(db, user_id, str(conv.workspace_id))
    conv.deleted_at = datetime.now()
    await db.flush()


# ══════════════════════════════════════════════════════════════
# MESSAGES CRUD
# ══════════════════════════════════════════════════════════════

@router.post("/{conversation_id}/messages", response_model=MessageResp, status_code=201)
async def create_message(
    conversation_id: str,
    req: MessageCreateReq,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    # Get conversation and check access
    stmt = select(Conversation).where(Conversation.id == conv_uuid)
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation introuvable")

    await _check_ws_access(db, user_id, str(conv.workspace_id))

    parent_uuid = None
    if req.parent_message_id:
        try:
            parent_uuid = uuid.UUID(req.parent_message_id)
        except ValueError:
            pass

    # Compute rough token count
    token_count = len(req.content.split()) * 2  # rough estimate

    msg = Message(
        conversation_id=conv_uuid,
        role=req.role,
        content=req.content,
        model_id=req.model_id,
        token_count=token_count,
        parent_message_id=parent_uuid,
        tool_calls_json=req.tool_calls_json,
        sources_json=req.sources_json,
        artifacts_json=req.artifacts_json,
    )
    db.add(msg)

    # Update conversation counters
    conv.message_count = (conv.message_count or 0) + 1
    conv.last_message_at = datetime.now()

    await db.flush()
    await db.refresh(msg)
    return msg


@router.get("/{conversation_id}/messages", response_model=List[MessageResp])
async def list_messages(
    conversation_id: str,
    limit: int = Query(100, le=500),
    before: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")

    # Get conversation and check access
    stmt = select(Conversation).where(Conversation.id == conv_uuid)
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation introuvable")

    await _check_ws_access(db, user_id, str(conv.workspace_id))

    query = (
        select(Message)
        .where(Message.conversation_id == conv_uuid, Message.deleted_at.is_(None))
        .order_by(Message.created_at.asc())
        .limit(limit)
    )

    if before:
        try:
            before_uuid = uuid.UUID(before)
            # Get the timestamp of the 'before' message
            before_stmt = select(Message.created_at).where(Message.id == before_uuid)
            before_res = await db.execute(before_stmt)
            before_ts = before_res.scalar_one_or_none()
            if before_ts:
                query = query.where(Message.created_at < before_ts)
        except ValueError:
            pass

    result = await db.execute(query)
    return result.scalars().all()
