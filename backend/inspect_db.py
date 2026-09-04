import asyncio
import sys
import os
from sqlalchemy import text

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db.session import async_session

async def main():
    async with async_session() as db:
        print("--- ReviewInvitations ---")
        res = await db.execute(text("SELECT id, token_hash, audience, expires_at FROM review_invitations"))
        for row in res.fetchall():
            print("Invite:", row)

        print("\n--- ReviewSessions ---")
        res = await db.execute(text("SELECT id, invitation_id, session_token_hash, expires_at, is_active FROM review_sessions"))
        for row in res.fetchall():
            print("Session:", row)

        print("\n--- ReviewQuotaUsage ---")
        res = await db.execute(text("SELECT * FROM review_quota_usage"))
        for row in res.fetchall():
            print("Quota:", row)

        print("\n--- Users (google/reviewer) ---")
        res = await db.execute(text("SELECT id, clerk_user_id, primary_email, display_name FROM users WHERE clerk_user_id ILIKE '%google%' OR primary_email ILIKE '%google%' OR clerk_user_id ILIKE '%review%'"))
        for row in res.fetchall():
            print("User:", row)

        print("\n--- Workspaces (all) ---")
        res = await db.execute(text("SELECT id, name, workspace_type, owner_user_id FROM workspaces"))
        for row in res.fetchall():
            print("Workspace:", row)

if __name__ == "__main__":
    asyncio.run(main())
