import asyncio
import asyncpg
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

async def main():
    db_url = os.environ.get("DATABASE_URL_UNPOOLED")
    if not db_url:
        db_url = os.environ.get("DATABASE_URL")
        
    if not db_url:
        print("DATABASE_URL missing")
        return
        
    # asyncpg expects postgres:// instead of postgresql+asyncpg://
    db_url = db_url.replace("postgresql+asyncpg://", "postgres://").replace("postgresql://", "postgres://")
    
    print(f"Connecting to Neon...")
    try:
        conn = await asyncpg.connect(db_url)
        print("Connected!")
        
        sql_file = Path("db/migrations/004_google_review.sql")
        sql = sql_file.read_text(encoding="utf-8")
        
        print(f"Executing {sql_file.name}...")
        await conn.execute(sql)
        print("Done!")
        
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
