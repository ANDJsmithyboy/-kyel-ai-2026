import asyncio
import asyncpg
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

async def main():
    db_url = os.environ.get("DATABASE_URL_UNPOOLED")
    if not db_url:
        db_url = os.environ.get("DATABASE_URL")
        
    if not db_url:
        raise ValueError("DATABASE_URL or DATABASE_URL_UNPOOLED must be set in the environment")

    db_url = db_url.replace("postgresql+asyncpg://", "postgres://").replace("postgresql://", "postgres://")
    
    try:
        conn = await asyncpg.connect(db_url)
        token_raw = f"g_rev_{secrets.token_urlsafe(32)}"
        expires_at = datetime.now(timezone.utc) + timedelta(days=35)
        
        await conn.execute(
            """
            INSERT INTO review_invitations (token_hash, audience, expires_at)
            VALUES ($1, $2, $3)
            """,
            token_raw, "google_reviewers", expires_at
        )
        
        print(f"LINK: https://nkyel.smartandjai.com/review/google/{token_raw}")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
