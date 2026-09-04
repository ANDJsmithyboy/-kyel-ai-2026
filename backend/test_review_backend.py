import asyncio
import httpx
from datetime import datetime

BASE_URL = "http://localhost:8000"
TOKEN = "g_rev_7SMNAzSmcavmHI8xWVqzy28k1CMPTheFNNeIclTmw-0"

async def test_review_flow():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        print("=== 1. Test unauthenticated status ===")
        try:
            r = await client.get("/api/v1/review/status")
            print("Status without auth:", r.status_code, r.json())
        except Exception as e:
            print("Local server might not be running on 8000:", e)
            return

        print("\n=== 2. Test authenticating review token ===")
        r = await client.post(f"/api/v1/review/auth/{TOKEN}")
        print("Auth response:", r.status_code, r.json())
        cookies = r.cookies
        session_cookie = cookies.get("nkyel_review_session")
        print("Cookie set:", session_cookie is not None)

        print("\n=== 3. Test status with cookie ===")
        r = await client.get("/api/v1/review/status", cookies=cookies)
        print("Status with cookie:", r.status_code, r.json())

        print("\n=== 4. Test current workspace with cookie ===")
        r = await client.get("/api/v1/workspaces/current", cookies=cookies)
        print("Current workspace:", r.status_code, r.json())

        print("\n=== 5. Test admin blocked with cookie ===")
        r = await client.get("/api/v1/v1/admin/stats", cookies=cookies)
        print("Admin access attempt:", r.status_code, r.text)

if __name__ == "__main__":
    asyncio.run(test_review_flow())
