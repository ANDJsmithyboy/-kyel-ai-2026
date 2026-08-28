"""
Ñkyel AI — Priority Queue
Durable PostgreSQL-backed priority queue using FOR UPDATE SKIP LOCKED.
Ensures zero race conditions and strict priority honoring for Mission scheduling.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Optional

class PriorityQueue:
    @staticmethod
    async def enqueue_mission(
        session: AsyncSession, 
        user_id: uuid.UUID, 
        mission_id: str, 
        entitlement_tier: str, 
        priority: int,
        estimated_budget: int = 300000
    ) -> str:
        """
        Add a mission to the queue with its calculated priority.
        """
        # In SQLAlchemy 2.0 async we use text for raw queries for simplicity here
        query = text("""
            INSERT INTO mission_queue (
                mission_id, user_id, entitlement_tier, priority, status, 
                estimated_token_budget, requested_at, available_at
            ) VALUES (
                :mission_id, :user_id, :tier, :priority, 'QUEUED', 
                :budget, :now, :now
            ) RETURNING id;
        """)
        
        result = await session.execute(query, {
            "mission_id": mission_id,
            "user_id": user_id,
            "tier": entitlement_tier,
            "priority": priority,
            "budget": estimated_budget,
            "now": datetime.now(timezone.utc)
        })
        
        queue_id = result.scalar()
        await session.commit()
        return str(queue_id)

    @staticmethod
    async def claim_next_mission(session: AsyncSession, worker_id: str) -> Optional[dict]:
        """
        Atomically claim the next eligible mission.
        Prioritizes by priority (ASC, 0 is highest) and requested_at (ASC).
        """
        # PostgreSQL FOR UPDATE SKIP LOCKED guarantees only one worker gets the row
        claim_query = text("""
            UPDATE mission_queue
            SET status = 'CLAIMED',
                claimed_at = :now,
                claimed_by = :worker_id
            WHERE id = (
                SELECT id
                FROM mission_queue
                WHERE status = 'QUEUED'
                  AND available_at <= :now
                ORDER BY priority ASC, requested_at ASC
                LIMIT 1
                FOR UPDATE SKIP LOCKED
            )
            RETURNING id, mission_id, user_id, entitlement_tier, priority, estimated_token_budget;
        """)
        
        result = await session.execute(claim_query, {
            "now": datetime.now(timezone.utc),
            "worker_id": worker_id
        })
        
        row = result.fetchone()
        if row:
            await session.commit()
            return {
                "queue_id": str(row[0]),
                "mission_id": row[1],
                "user_id": str(row[2]),
                "entitlement_tier": row[3],
                "priority": row[4],
                "estimated_token_budget": row[5]
            }
            
        return None

    @staticmethod
    async def complete_mission(session: AsyncSession, queue_id: str):
        query = text("""
            UPDATE mission_queue
            SET status = 'COMPLETED',
                finished_at = :now
            WHERE id = :id
        """)
        await session.execute(query, {"now": datetime.now(timezone.utc), "id": queue_id})
        await session.commit()

    @staticmethod
    async def fail_mission(session: AsyncSession, queue_id: str, error_msg: str):
        query = text("""
            UPDATE mission_queue
            SET status = 'FAILED',
                finished_at = :now,
                last_error = :err
            WHERE id = :id
        """)
        await session.execute(query, {"now": datetime.now(timezone.utc), "id": queue_id, "err": error_msg})
        await session.commit()
