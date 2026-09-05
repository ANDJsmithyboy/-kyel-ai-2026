"""
Ñkyel AI — Conversations & Messages API · Neon PostgreSQL
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

PRODUCTION CONTRACT: Every message persists in Neon.
No localStorage. No in-memory-only state.
"""

import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import get_current_user_id
from db.models import Conversation, Message, WorkspaceMember, User
from db.session import get_db

router = APIRouter(prefix="/conversations", tags=["Conversations"])


# ── Request / Response schemas ─────────────────────────────

class ConversationCreateReq(BaseModel):
    workspace_id: Optional[str] = None
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

async def _check_ws_access(db: AsyncSession, user_id: str, workspace_id: Optional[str] = None):
    """Verify user has access to workspace. If workspace_id is None, finds or creates default workspace."""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="User ID invalide")

    if workspace_id:
        try:
            ws_uuid = uuid.UUID(workspace_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Workspace ID invalide")

        stmt = select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == ws_uuid,
            WorkspaceMember.user_id == user_uuid
        )
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Accès refusé au workspace")
        return user_uuid, ws_uuid

    # Auto-resolve or create user's workspace
    from services.persistence_service import PersistenceService
    user_stmt = select(User).where(User.id == user_uuid)
    u_res = await db.execute(user_stmt)
    user_obj = u_res.scalar_one_or_none()
    if not user_obj:
        user_obj = await PersistenceService.get_or_create_user(user_id, session=db)

    ws = await PersistenceService.get_or_create_default_workspace(user_obj, session=db)
    return user_uuid, ws.id


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
        created_by_user_id=user_uuid,
        title=req.title or "Nouvelle conversation",
        conversation_type=req.conversation_type,
        status="ACTIVE",
    )
    db.add(conv)
    await db.flush()
    await db.refresh(conv)
    return conv


@router.get("", response_model=List[ConversationResp])
async def list_conversations(
    workspace_id: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    if workspace_id:
        _, ws_uuid = await _check_ws_access(db, user_id, workspace_id)
        stmt = (
            select(Conversation)
            .where(Conversation.workspace_id == ws_uuid, Conversation.deleted_at.is_(None))
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
            .offset(offset)
        )
    else:
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="User ID invalide")
        stmt = (
            select(Conversation)
            .where(Conversation.created_by_user_id == user_uuid, Conversation.deleted_at.is_(None))
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

    # Compute next sequence
    seq_stmt = (
        select(func.coalesce(func.max(Message.sequence), 0))
        .where(Message.conversation_id == conv_uuid)
    )
    seq_res = await db.execute(seq_stmt)
    next_seq = (seq_res.scalar() or 0) + 1

    content_json = {}
    if req.tool_calls_json:
        content_json["tool_calls"] = req.tool_calls_json
    if req.sources_json:
        content_json["sources"] = req.sources_json
    if req.artifacts_json:
        content_json["artifacts"] = req.artifacts_json

    msg = Message(
        conversation_id=conv_uuid,
        role=req.role,
        content_text=req.content,
        content_json=content_json if content_json else None,
        model_profile=req.model_id or "openai/gpt-oss-120b",
        sequence=next_seq,
        status="COMPLETED",
        parent_message_id=parent_uuid,
    )
    db.add(msg)

    # Update conversation last_message_at
    conv.last_message_at = datetime.now(timezone.utc)

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
