"""
Ñkyel AI — Resource Management Tests
Testing quotas, priority queue, special invites, and provider abstractions.
"""

import pytest
import uuid
from datetime import datetime, timezone
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from core.queue.priority_queue import PriorityQueue
from core.accounting.token_tracker import TokenTracker

# Mock DB for testing logic without full API spin-up
@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    # We would normally create tables here for tests using Base.metadata.create_all
    # But since we use raw SQL in some methods (e.g., PostgreSQL FOR UPDATE SKIP LOCKED),
    # testing against SQLite memory will fail on specific PG syntax.
    # In a real environment, this should point to a test PostgreSQL container.
    
    # Returning a mock session for unit tests that don't hit PG-specific locks
    from unittest.mock import AsyncMock
    session = AsyncMock(spec=AsyncSession)
    yield session
    
@pytest.mark.asyncio
async def test_token_tracker_compaction(db_session):
    """Test that context compaction is recommended at 60% budget."""
    mission_id = "test_mission_001"
    user_id = uuid.uuid4()
    tracker = TokenTracker(db_session, mission_id, user_id, budget_soft=500000, budget_hard=650000)
    
    # Use 55%
    await tracker.record_usage("groq_1", "llama3", input_tokens=200000, output_tokens=150000)
    state = tracker.check_budget_state()
    assert state["needs_compaction"] is False
    assert state["needs_safe_termination"] is False
    
    # Push past 60%
    await tracker.record_usage("groq_1", "llama3", input_tokens=20000, output_tokens=30000)
    state = tracker.check_budget_state()
    assert state["needs_compaction"] is True
    assert state["needs_safe_termination"] is False

@pytest.mark.asyncio
async def test_token_tracker_hard_limit(db_session):
    """Test that safe termination is triggered near hard limit."""
    tracker = TokenTracker(db_session, "test_m2", uuid.uuid4(), budget_soft=500000, budget_hard=650000)
    
    # Use 96%
    await tracker.record_usage("groq_1", "llama3", input_tokens=300000, output_tokens=325000)
    state = tracker.check_budget_state()
    assert state["needs_safe_termination"] is True
    
def test_capability_router_priority():
    """Test capability router logic (without DB)."""
    from core.routing.capability_router import CapabilityRouter
    from core.providers.registry import ProviderRegistry, ProviderAccount, ProviderType
    
    # Mock some accounts
    ProviderRegistry._accounts = {
        "1": ProviderAccount("1", ProviderType.GROQ, "Groq Fast", "key1", priority=10, capabilities=["FAST_SUBAGENT"]),
        "2": ProviderAccount("2", ProviderType.GEMINI, "Gemini Flash", "key2", priority=5, capabilities=["FAST_SUBAGENT"]),
    }
    
    # Public Beta should prefer Groq (economical) over Gemini
    res_public = CapabilityRouter.route_request("FAST_SUBAGENT", "PUBLIC_BETA", 50, 1000)
    # The router prioritizes GROQ for PUBLIC_BETA
    assert res_public.provider_type == ProviderType.GROQ
    
    # Founder should prefer Gemini (quality) over Groq
    res_founder = CapabilityRouter.route_request("FAST_SUBAGENT", "FOUNDER", 0, 1000)
    # The router prioritizes GEMINI for FOUNDER
    assert res_founder.provider_type == ProviderType.GEMINI

def test_media_router():
    """Test media router restrictions."""
    from core.routing.media_router import MediaRouter
    from core.providers.registry import ProviderRegistry, ProviderAccount, ProviderType
    
    ProviderRegistry._accounts = {
        "r1": ProviderAccount("r1", ProviderType.RUNPOD, "RunPod", "k", priority=10, capabilities=["IMAGE_GEN", "VIDEO_GEN"]),
        "f1": ProviderAccount("f1", ProviderType.FAL, "Fal", "k", priority=5, capabilities=["IMAGE_GEN", "VIDEO_GEN"]),
    }
    
    # Public beta video -> RunPod draft
    provider, model, res = MediaRouter.route_video("PUBLIC_BETA", 50)
    assert provider.provider_type == ProviderType.RUNPOD
    assert res == "720p_draft"
    
    # Presidential video -> Fal standard
    provider, model, res = MediaRouter.route_video("PRESIDENTIAL_REVIEWER", 10, quality_preference="standard")
    assert provider.provider_type == ProviderType.FAL
    assert res == "standard"
