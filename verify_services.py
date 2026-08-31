import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))
load_dotenv("backend/.env")

async def test_db():
    try:
        import asyncpg
        conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
        res = await conn.fetchval("SELECT 1")
        print(f"Neon DB Connection: PASS (Result: {res})")
        await conn.close()
    except Exception as e:
        print(f"Neon DB Connection: FAIL ({e})")

def test_qdrant():
    try:
        import requests
        url = os.getenv("QDRANT_URL")
        api_key = os.getenv("QDRANT_API_KEY")
        if not url:
            print("Qdrant: FAIL (No URL)")
            return
        
        headers = {"api-key": api_key} if api_key else {}
        resp = requests.get(f"{url}/collections", headers=headers, timeout=5)
        if resp.status_code == 200:
            print(f"Qdrant Connection: PASS (Collections: {len(resp.json().get('result', {}).get('collections', []))})")
        else:
            print(f"Qdrant Connection: FAIL (HTTP {resp.status_code})")
    except Exception as e:
        print(f"Qdrant Connection: FAIL ({e})")

if __name__ == "__main__":
    asyncio.run(test_db())
    test_qdrant()
