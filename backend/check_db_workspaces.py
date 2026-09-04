import asyncio, asyncpg, os
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL_UNPOOLED') or os.environ.get('DATABASE_URL')
db_url = db_url.replace('postgresql+asyncpg://', 'postgres://').replace('postgresql://', 'postgres://')

async def check():
    conn = await asyncpg.connect(db_url)
    constraints = await conn.fetch("""
        SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'workspace_members';
    """)
    for c in constraints:
        print(f"  {c['indexname']}: {c['indexdef']}")
    await conn.close()

asyncio.run(check())
