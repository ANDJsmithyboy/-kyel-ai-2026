import asyncio
import sys
import os
from sqlalchemy import text

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db.session import async_session

async def setup_google_review_workspace():
    async with async_session() as db:
        # 1. Check or create Google Reviewer User
        res = await db.execute(text("SELECT id FROM users WHERE clerk_user_id = 'user_google_reviewer'"))
        user_row = res.fetchone()
        if not user_row:
            user_insert = await db.execute(text("""
                INSERT INTO users (id, clerk_user_id, primary_email, display_name, status, created_at, updated_at)
                VALUES (gen_random_uuid(), 'user_google_reviewer', 'google-reviewer@nkyel.smartandjai.com', 'Google Reviewer', 'active', NOW(), NOW())
                RETURNING id
            """))
            user_id = user_insert.fetchone()[0]
            print(f"Created Google Reviewer user: {user_id}")
        else:
            user_id = user_row[0]
            print(f"Existing Google Reviewer user: {user_id}")

        # 2. Check or create Google Review Workspace
        res = await db.execute(text("SELECT id FROM workspaces WHERE name = 'Google Review Workspace'"))
        ws_row = res.fetchone()
        if not ws_row:
            ws_insert = await db.execute(text("""
                INSERT INTO workspaces (id, name, slug, workspace_type, owner_user_id, status, created_at, updated_at)
                VALUES (gen_random_uuid(), 'Google Review Workspace', 'google-review', 'REVIEW', :user_id, 'ACTIVE', NOW(), NOW())
                RETURNING id
            """), {"user_id": user_id})
            workspace_id = ws_insert.fetchone()[0]
            print(f"Created Google Review Workspace: {workspace_id}")
        else:
            workspace_id = ws_row[0]
            print(f"Existing Google Review Workspace: {workspace_id}")

        # 3. Ensure membership
        res = await db.execute(text("SELECT user_id FROM workspace_members WHERE workspace_id = :ws_id AND user_id = :u_id"),
                               {"ws_id": workspace_id, "u_id": user_id})
        if not res.fetchone():
            await db.execute(text("""
                INSERT INTO workspace_members (workspace_id, user_id, role, status, joined_at)
                VALUES (:ws_id, :u_id, 'owner', 'ACTIVE', NOW())
            """), {"ws_id": workspace_id, "u_id": user_id})
            print(f"Linked Google Reviewer as owner of Google Review Workspace")

        # 4. Verify existing invitation
        res = await db.execute(text("SELECT id, token_hash, expires_at FROM review_invitations WHERE token_hash = 'g_rev_7SMNAzSmcavmHI8xWVqzy28k1CMPTheFNNeIclTmw-0'"))
        inv = res.fetchone()
        if inv:
            print(f"Preserved Google Review Invitation: {inv[1]} with expires_at: {inv[2]}")
        else:
            print("WARNING: Review invitation not found!")

        await db.commit()
        print("Setup completed successfully.")

if __name__ == "__main__":
    asyncio.run(setup_google_review_workspace())
