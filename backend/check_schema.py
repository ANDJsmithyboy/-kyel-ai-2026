import asyncio
import sys, os
from sqlalchemy import text
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db.session import async_session

async def check_schema():
    async with async_session() as db:
        res = await db.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'workspace_members'"))
        for row in res.fetchall():
            print(row)

if __name__ == "__main__":
    asyncio.run(check_schema())
