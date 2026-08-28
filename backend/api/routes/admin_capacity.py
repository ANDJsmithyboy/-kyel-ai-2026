"""
Ñkyel AI — Admin Capacity & Quota Controllers
API routes for managing resources, invites, and queue health.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timezone

from db.session import get_db
# Assuming a dependency get_current_admin exists
# from api.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Capacity"])

@router.get("/capacity")
async def get_system_capacity(db: AsyncSession = Depends(get_db)):
    """
    Overview of system capacity: active missions, queued missions, beta user count.
    """
    beta_users_query = text("SELECT COUNT(*) FROM beta_enrollments WHERE status = 'active'")
    beta_users_res = await db.execute(beta_users_query)
    beta_users = beta_users_res.scalar() or 0
    
    queue_query = text("""
        SELECT status, COUNT(*) 
        FROM mission_queue 
        GROUP BY status
    """)
    queue_res = await db.execute(queue_query)
    queue_stats = {row[0]: row[1] for row in queue_res.fetchall()}
    
    return {
        "public_beta_users": f"{beta_users} / 100",
        "queue_stats": queue_stats,
        "active_missions": queue_stats.get("RUNNING", 0),
        "queued_missions": queue_stats.get("QUEUED", 0),
        "completed_missions": queue_stats.get("COMPLETED", 0),
        "failed_missions": queue_stats.get("FAILED", 0)
    }

@router.get("/providers")
async def get_providers(db: AsyncSession = Depends(get_db)):
    """
    Detailed health and budget of all configured AI providers.
    """
    query = text("SELECT id, provider_type, display_internal_name, enabled, health_status, rate_state_json, budget_state_json FROM provider_accounts")
    res = await db.execute(query)
    providers = []
    for row in res.fetchall():
        providers.append({
            "id": str(row[0]),
            "provider": row[1],
            "name": row[2],
            "enabled": row[3],
            "health": row[4],
            "rate_state": row[5],
            "budget_state": row[6]
        })
    return {"providers": providers}

@router.post("/invites")
async def create_special_invite(
    invite_type: str, 
    max_redemptions: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a special invite link (e.g. PRESIDENTIAL_REVIEWER)
    Returns a one-time cryptographically secure token.
    """
    import secrets
    import hashlib
    
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    
    query = text("""
        INSERT INTO special_invites (token_hash, invite_type, max_redemptions, created_at)
        VALUES (:hash, :type, :max, :now)
        RETURNING id
    """)
    
    res = await db.execute(query, {
        "hash": token_hash,
        "type": invite_type,
        "max": max_redemptions,
        "now": datetime.now(timezone.utc)
    })
    invite_id = res.scalar()
    await db.commit()
    
    return {
        "id": str(invite_id),
        "message": "Store this URL securely. The raw token will never be shown again.",
        "url": f"/r/{raw_token}",
        "invite_type": invite_type,
        "max_redemptions": max_redemptions
    }
