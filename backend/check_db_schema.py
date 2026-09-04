import asyncio, os, asyncpg
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL_UNPOOLED') or os.environ.get('DATABASE_URL')
db_url = db_url.replace('postgresql+asyncpg://', 'postgres://').replace('postgresql://', 'postgres://')

async def check():
    conn = await asyncpg.connect(db_url)
    tables = await conn.fetch("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    print("ALL TABLES IN DB:")
    for t in tables:
        tname = t["table_name"]
        if any(k in tname.lower() for k in ["quota", "review", "usage", "plan", "limit", "workspace", "mission", "run"]):
            print(f"\nTABLE: {tname}")
            cols = await conn.fetch(f"""
                SELECT column_name, data_type FROM information_schema.columns 
                WHERE table_name = '{tname}'
            """)
            for c in cols:
                print(f"    {c['column_name']}: {c['data_type']}")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(check())
