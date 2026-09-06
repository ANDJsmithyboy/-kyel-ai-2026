"""
Tests ciblés P0 pour user upsert, conversations et beta.
"""
import asyncio
import uuid
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import async_session
from db.models import User, Conversation, Workspace, WorkspaceMember, BetaCampaign
from services.persistence_service import PersistenceService
from api.v1.conversations import _conversation_to_dict


@pytest.mark.asyncio
async def test_user_upsert_idempotent():
    clerk_id = f"test_clerk_{uuid.uuid4().hex}"
    async with async_session() as db:
        u1 = await PersistenceService.get_or_create_user(clerk_id, display_name="Test", email="test@test.com", session=db)
        u2 = await PersistenceService.get_or_create_user(clerk_id, display_name="Test 2", email="test2@test.com", session=db)
        assert u1.id == u2.id
        assert u2.display_name == "Test 2"


@pytest.mark.asyncio
async def test_conversation_response_no_uuid():
    async with async_session() as db:
        # create user + workspace
        user = await PersistenceService.get_or_create_user(f"conv_test_{uuid.uuid4().hex}", session=db)
        ws = await PersistenceService.get_or_create_default_workspace(user, session=db)

        conv = Conversation(
            workspace_id=ws.id,
            created_by_user_id=user.id,
            title="Test conv",
            conversation_type="CHAT",
            status="ACTIVE",
        )
        db.add(conv)
        await db.flush()
        await db.refresh(conv)

        d = _conversation_to_dict(conv, 0)
        assert isinstance(d["id"], str)
        assert isinstance(d["workspace_id"], str)
        assert d["message_count"] == 0
