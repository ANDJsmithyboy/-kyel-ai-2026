import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from db.session import async_session
from sqlalchemy import text

async def inspect():
    async with async_session() as s:
        res = await s.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='evidence'"))
        for r in res.fetchall():
            print(f"EVIDENCE COL: {r[0]} ({r[1]})")

if __name__ == "__main__":
    asyncio.run(inspect())
