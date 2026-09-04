import asyncio
import os
import sys
import json
from sqlalchemy import text

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db.session import async_session

async def sync_google_review():
    quotas = {
        "quota_profile": "GOOGLE_REVIEW",
        "tier_name": "GOOGLE_REVIEWER",
        "max_active_missions": 1,
        "max_queued_missions": 8,
        "token_per_mission": 500000,
        "token_soft_daily": 1000000,
        "token_hard_daily": 1500000,
        "weekly_token_budget": 7000000,
        "deep_research_per_day": 10,
        "searches_per_mission": 50,
        "sources_per_mission": 80,
        "artifacts_per_day": 30,
        "image_limit": 5,
        "video_limit": 2,
        "video_duration_max": 5
    }
    
    async with async_session() as db:
        # 1. Update review_invitations
        await db.execute(text("""
            UPDATE review_invitations
            SET access_profile = :ap
            WHERE token_hash = 'g_rev_7SMNAzSmcavmHI8xWVqzy28k1CMPTheFNNeIclTmw-0'
        """), {"ap": json.dumps(quotas)})
        
        # 2. Verify
        res = await db.execute(text("""
            SELECT id, token_hash, access_profile, created_at, expires_at 
            FROM review_invitations 
            WHERE token_hash = 'g_rev_7SMNAzSmcavmHI8xWVqzy28k1CMPTheFNNeIclTmw-0'
        """))
        row = res.fetchone()
        print("Updated Row in Neon:")
        print("ID:", row[0])
        print("Token:", row[1])
        print("Access Profile:", row[2])
        print("Created At (35-day start):", row[3])
        print("Expires At (35-day expiry):", row[4])
        
        await db.commit()

if __name__ == "__main__":
    asyncio.run(sync_google_review())
