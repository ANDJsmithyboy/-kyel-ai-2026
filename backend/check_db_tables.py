import asyncio, asyncpg, os
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL_UNPOOLED') or os.environ.get('DATABASE_URL')
db_url = db_url.replace('postgresql+asyncpg://', 'postgres://').replace('postgresql://', 'postgres://')

async def check():
    conn = await asyncpg.connect(db_url)
    tables = await conn.fetch("""
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
    """)
    print("ALL TABLES:")
    for t in tables:
        print(f"- {t['table_name']}")
    await conn.close()

asyncio.run(check())
