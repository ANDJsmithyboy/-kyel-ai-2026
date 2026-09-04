import asyncio
import sys, os
from sqlalchemy import text
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db.session import async_session

async def align_schema():
    async with async_session() as db:
        print("Ensuring columns exist...")
        await db.execute(text("ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();"))
        await db.execute(text("ALTER TABLE review_invitations ADD COLUMN IF NOT EXISTS metadata_json TEXT DEFAULT '{}';"))
        # Align runs table for persistence
        await db.execute(text("ALTER TABLE runs ADD COLUMN IF NOT EXISTS workspace_id UUID;"))
        await db.execute(text("ALTER TABLE runs ADD COLUMN IF NOT EXISTS run_type TEXT DEFAULT 'FULL';"))
        # Align workgraph_nodes table for persistence
        await db.execute(text("ALTER TABLE workgraph_nodes ADD COLUMN IF NOT EXISTS payload JSONB;"))
        await db.execute(text("ALTER TABLE workgraph_nodes ADD COLUMN IF NOT EXISTS data JSONB;"))
        await db.execute(text("ALTER TABLE workgraph_nodes ADD COLUMN IF NOT EXISTS position_x FLOAT;"))
        await db.execute(text("ALTER TABLE workgraph_nodes ADD COLUMN IF NOT EXISTS position_y FLOAT;"))
        # Align workgraph_edges table for persistence
        await db.execute(text("ALTER TABLE workgraph_edges ADD COLUMN IF NOT EXISTS data JSONB;"))
        await db.execute(text("ALTER TABLE workgraph_edges ADD COLUMN IF NOT EXISTS label VARCHAR(255);"))
        await db.execute(text("ALTER TABLE workgraph_edges ADD COLUMN IF NOT EXISTS relation_type VARCHAR(64) DEFAULT 'DEPENDENCY';"))
        # Align evidence table
        await db.execute(text("ALTER TABLE evidence ADD COLUMN IF NOT EXISTS evidence_text TEXT;"))
        await db.execute(text("ALTER TABLE evidence ADD COLUMN IF NOT EXISTS relationship VARCHAR(32) DEFAULT 'supports';"))
        await db.execute(text("ALTER TABLE evidence ADD COLUMN IF NOT EXISTS confidence TEXT DEFAULT '0.95';"))
        await db.execute(text("ALTER TABLE evidence ADD COLUMN IF NOT EXISTS claim TEXT;"))
        # Align sources table
        await db.execute(text("ALTER TABLE sources ADD COLUMN IF NOT EXISTS canonical_url TEXT;"))
        await db.execute(text("ALTER TABLE sources ADD COLUMN IF NOT EXISTS domain VARCHAR(255);"))
        await db.execute(text("ALTER TABLE sources ADD COLUMN IF NOT EXISTS author VARCHAR(255);"))
        await db.execute(text("ALTER TABLE sources ADD COLUMN IF NOT EXISTS search_provider VARCHAR(64);"))
        await db.execute(text("ALTER TABLE sources ADD COLUMN IF NOT EXISTS content_hash VARCHAR(128);"))
        # Align artifacts table for persistence
        await db.execute(text("ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS url TEXT;"))
        await db.execute(text("ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS r2_key TEXT;"))
        await db.execute(text("ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS content TEXT;"))
        await db.execute(text("ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS metadata_json TEXT;"))
        await db.execute(text("ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;"))
        await db.execute(text("ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS user_id UUID;"))
        await db.execute(text("ALTER TABLE artifacts ALTER COLUMN workspace_id DROP NOT NULL;"))
        await db.execute(text("ALTER TABLE artifacts ALTER COLUMN status DROP NOT NULL;"))
        await db.execute(text("ALTER TABLE artifacts ALTER COLUMN status SET DEFAULT 'completed';"))
        await db.commit()
        print("Schema aligned successfully.")

if __name__ == "__main__":
    asyncio.run(align_schema())
