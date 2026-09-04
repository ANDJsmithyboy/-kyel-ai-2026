import asyncio, asyncpg, os
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL_UNPOOLED') or os.environ.get('DATABASE_URL')
db_url = db_url.replace('postgresql+asyncpg://', 'postgres://').replace('postgresql://', 'postgres://')

async def check():
    conn = await asyncpg.connect(db_url)
    cols = await conn.fetch("""
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_name = 'users';
    """)
    print("USERS COLUMNS:")
    for c in cols:
        print(f"  {c['column_name']}: {c['data_type']}")
    await conn.close()

asyncio.run(check())
