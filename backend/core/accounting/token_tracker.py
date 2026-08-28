"""
Ñkyel AI — Token & Cost Accounting
Tracks cumulative LLM tokens per mission and enforces soft/hard budgets.
"""

from typing import Dict, Any, Optional
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class TokenTracker:
    def __init__(self, session: AsyncSession, mission_id: str, user_id: uuid.UUID, budget_soft: int, budget_hard: int):
        self.session = session
        self.mission_id = mission_id
        self.user_id = user_id
        self.budget_soft = budget_soft
        self.budget_hard = budget_hard
        
        self.cumulative_tokens = 0
        self.FINAL_SYNTHESIS_RESERVE = 4000
        
    async def record_usage(
        self, 
        provider_account_id: str, 
        model_id: str, 
        input_tokens: int, 
        output_tokens: int, 
        reasoning_tokens: int = 0, 
        cached_input_tokens: int = 0
    ) -> Dict[str, Any]:
        """
        Record the token usage into the DB and update cumulative count.
        """
        total_tokens = input_tokens + output_tokens + reasoning_tokens
        self.cumulative_tokens += total_tokens
        
        query = text("""
            INSERT INTO quota_usage_events (
                user_id, event_type, cost_value, idempotency_key, metadata_json, created_at
            ) VALUES (
                :user_id, 'TOKEN_USAGE', :tokens, :idempotency, :meta, :now
            )
        """)
        
        import json
        meta = json.dumps({
            "mission_id": self.mission_id,
            "provider_account_id": provider_account_id,
            "model_id": model_id,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "reasoning_tokens": reasoning_tokens,
            "cached_input_tokens": cached_input_tokens
        })
        
        # Simple idempotency key for token batches
        idempotency = f"tokens_{self.mission_id}_{uuid.uuid4()}"
        
        await self.session.execute(query, {
            "user_id": self.user_id,
            "tokens": total_tokens,
            "idempotency": idempotency,
            "meta": meta,
            "now": datetime.now(timezone.utc)
        })
        await self.session.commit()
        
        return self.check_budget_state()
        
    def check_budget_state(self) -> Dict[str, Any]:
        """
        Check if we are hitting soft limits (requires context compaction)
        or hard limits (requires safe termination).
        """
        state = {
            "cumulative_tokens": self.cumulative_tokens,
            "budget_soft": self.budget_soft,
            "budget_hard": self.budget_hard,
            "needs_compaction": False,
            "needs_safe_termination": False,
            "remaining_until_hard": self.budget_hard - self.cumulative_tokens
        }
        
        pct_used = self.cumulative_tokens / self.budget_hard
        
        if pct_used >= 0.95 or state["remaining_until_hard"] <= self.FINAL_SYNTHESIS_RESERVE:
            state["needs_safe_termination"] = True
        elif pct_used >= 0.60:
            state["needs_compaction"] = True
            
        return state
