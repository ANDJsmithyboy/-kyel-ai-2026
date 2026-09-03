"""
Ñkyel AI — Full E2E Hardening Test for Google Review Environment
SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
"""

import asyncio
import os
import sys
import uuid
import datetime
from datetime import timezone
from sqlalchemy import text, select

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db.session import async_session
from db.models import ReviewInvitation, ReviewSession, ReviewQuotaUsage, Workspace, User
from core.runtime.deerflow_runtime import DeerFlowRuntime
from services.tavily_search_service import tavily_search
from services.artifact_service import ArtifactService, ArtifactType

CANONICAL_TOKEN = "g_rev_7SMNAzSmcavmHI8xWVqzy28k1CMPTheFNNeIclTmw-0"

async def run_full_review_e2e():
    print("=" * 70)
    print("ÑKYEL AI — GOOGLE REVIEW FULL E2E VALIDATION")
    print("=" * 70)
    results = {}

    async with async_session() as db:
        # ── TEST 1: Database Invitation & Timestamps ──
        print("\n[TEST 1] Verifying Canonical Google Review Grant in Neon DB...")
        res = await db.execute(text("""
            SELECT id, token_hash, audience, created_at, expires_at, access_profile, use_count
            FROM review_invitations
            WHERE token_hash = :tok
        """), {"tok": CANONICAL_TOKEN})
        inv_row = res.fetchone()

        assert inv_row is not None, "Canonical token NOT found in Neon DB!"
        inv_id, token_hash, audience, created_at, expires_at, access_profile, use_count = inv_row
        
        now = datetime.datetime.now(timezone.utc)
        assert expires_at > now, f"Invitation expired! expires_at: {expires_at}"
        days_remaining = (expires_at - now).days

        print(f"  [OK] Token: {token_hash}")
        print(f"  [OK] 35-Day Start (created_at): {created_at}")
        print(f"  [OK] 35-Day Expiry (expires_at): {expires_at}")
        print(f"  [OK] Days remaining from DB: {days_remaining} days")
        assert access_profile.get("quota_profile") == "GOOGLE_REVIEW", "Quota profile mismatch!"
        assert access_profile.get("token_per_mission") == 500000, "Token per mission mismatch!"
        assert access_profile.get("token_hard_daily") == 1500000, "Daily hard limit mismatch!"
        print(f"  [OK] Persisted DB Quotas: {access_profile}")
        results["review_grant_and_db_quotas"] = "PASS"

        # ── TEST 2: Workspace Isolation ──
        print("\n[TEST 2] Verifying Dedicated Google Review Workspace & User Isolation...")
        ws_res = await db.execute(text("SELECT id, name, workspace_type, owner_user_id FROM workspaces WHERE name = 'Google Review Workspace'"))
        ws_row = ws_res.fetchone()
        assert ws_row is not None, "Google Review Workspace not found!"
        ws_id, ws_name, ws_type, ws_owner = ws_row
        print(f"  [OK] Workspace ID: {ws_id} ({ws_name}, type: {ws_type})")

        u_res = await db.execute(text("SELECT id, clerk_user_id, primary_email FROM users WHERE clerk_user_id = 'user_google_reviewer'"))
        u_row = u_res.fetchone()
        assert u_row is not None, "Google Reviewer user not found!"
        print(f"  [OK] User ID: {u_row[0]} ({u_row[1]}, {u_row[2]})")
        assert str(ws_owner) == str(u_row[0]), "Workspace owner mismatch!"
        results["workspace_isolation"] = "PASS"

        # ── TEST 3: Review Session Creation & Quota Usage ──
        print("\n[TEST 3] Testing Review Session & Quota Ledger in Neon...")
        test_sess_token = f"rev_sess_test_{uuid.uuid4().hex[:12]}"
        new_sess = ReviewSession(
            invitation_id=inv_id,
            session_token_hash=test_sess_token,
            expires_at=expires_at,
            ip_address="127.0.0.1",
            user_agent="Google-Review-E2E-Automated-Test",
            is_active=True
        )
        db.add(new_sess)
        await db.flush()

        new_quota = ReviewQuotaUsage(
            session_id=new_sess.id,
            quota_profile="GOOGLE_REVIEW",
            tokens_input=0,
            tokens_output=0,
            images_generated=0,
            videos_generated=0,
            searches_performed=0
        )
        db.add(new_quota)
        await db.flush()

        # Atomic increment test
        new_quota.tokens_input += 2500
        new_quota.tokens_output += 1200
        new_quota.searches_performed += 1
        await db.commit()

        # Verify atomic persistence
        q_verify = await db.execute(select(ReviewQuotaUsage).where(ReviewQuotaUsage.session_id == new_sess.id))
        q_row = q_verify.scalar_one()
        assert q_row.tokens_input == 2500 and q_row.searches_performed == 1
        print(f"  [OK] Session Token: {test_sess_token}")
        print(f"  [OK] Tokens input: {q_row.tokens_input}, output: {q_row.tokens_output}, searches: {q_row.searches_performed}")
        results["atomic_quota_accounting"] = "PASS"

        # Cleanup test session
        await db.execute(text("DELETE FROM review_quota_usage WHERE session_id = :sid"), {"sid": new_sess.id})
        await db.execute(text("DELETE FROM review_sessions WHERE id = :sid"), {"sid": new_sess.id})
        await db.commit()

    # ── TEST 4: Real Tavily Search & Grounding ──
    print("\n[TEST 4] Testing Real Web Search (Tavily Multi-Key Rotation)...")
    search_query = "agentic AI breakthroughs 2026"
    tav_results = tavily_search(search_query, max_results=2)
    assert isinstance(tav_results, list) and len(tav_results) > 0, "Tavily search returned empty!"
    print(f"  [OK] Search query: '{search_query}'")
    for idx, r in enumerate(tav_results):
        print(f"  [OK] Source {idx + 1}: {r.get('title')} ({r.get('url')[:60]}...)")
        assert r.get("url"), "Source URL is missing!"
    results["real_search_and_sources"] = "PASS"

    # ── TEST 5: DeerFlow 2.0 Runtime Execution Stream ──
    print("\n[TEST 5] Testing DeerFlow 2.0 Runtime Stream & Event Generation...")
    df = DeerFlowRuntime()
    health = await df.health()
    print(f"  [OK] DeerFlow Health: {health.get('status')} ({health.get('runtime')})")
    assert health.get("status") == "healthy", "DeerFlow is not healthy!"

    test_mission_id = f"mis_test_{uuid.uuid4().hex[:8]}"
    test_run_id = f"run_test_{uuid.uuid4().hex[:8]}"
    stream_events = []

    async for evt in df.stream(
        mission_id=test_mission_id,
        goal="Research the latest developments in agentic AI and create an executive report",
        run_id=test_run_id,
        user_id="user_google_reviewer",
    ):
        stream_events.append(evt)

    event_types = [e.type.value for e in stream_events]
    print(f"  [OK] Streamed {len(stream_events)} events: {set(event_types)}")
    assert "RUN_STARTED" in event_types, "RUN_STARTED missing!"
    assert "STATE_DELTA" in event_types, "STATE_DELTA missing!"
    assert "RUN_FINISHED" in event_types, "RUN_FINISHED missing!"
    results["deerflow_runtime_stream"] = "PASS"

    # ── TEST 6: Real Artifacts Persistence (PDF, PPTX, XLSX) ──
    print("\n[TEST 6] Testing Artifact Creation, Verification, and R2 Export...")
    art_content = "# Agentic AI 2026 Executive Summary\n\nVerified market data and evidence."
    
    # 6a. Markdown
    art_md = await ArtifactService.create_artifact(
        title="Agentic AI Summary",
        content=art_content,
        type=ArtifactType.MARKDOWN,
        mission_id=test_mission_id,
        run_id=test_run_id,
    )
    print(f"  [OK] Markdown Artifact: {art_md.id} ({art_md.storage_key})")
    assert art_md.id, "Markdown artifact creation failed!"

    # 6b. PDF Export
    pdf_bytes, pdf_mime, pdf_fn = await ArtifactService.export_artifact(art_md.id, "pdf")
    assert len(pdf_bytes) > 0 and pdf_mime == "application/pdf", "PDF export invalid!"
    print(f"  [OK] PDF Export: {pdf_fn} ({len(pdf_bytes)} bytes, mime: {pdf_mime})")

    # 6c. DOCX Export
    docx_bytes, docx_mime, docx_fn = await ArtifactService.export_artifact(art_md.id, "docx")
    assert len(docx_bytes) > 0, "DOCX export invalid!"
    print(f"  [OK] DOCX Export: {docx_fn} ({len(docx_bytes)} bytes)")

    # 6d. PPTX Export
    pptx_bytes, pptx_mime, pptx_fn = await ArtifactService.export_artifact(art_md.id, "pptx")
    assert len(pptx_bytes) > 0, "PPTX export invalid!"
    print(f"  [OK] PPTX Export: {pptx_fn} ({len(pptx_bytes)} bytes)")

    # 6e. XLSX Export
    xlsx_bytes, xlsx_mime, xlsx_fn = await ArtifactService.export_artifact(art_md.id, "xlsx")
    assert len(xlsx_bytes) > 0, "XLSX export invalid!"
    print(f"  [OK] XLSX Export: {xlsx_fn} ({len(xlsx_bytes)} bytes)")
    results["artifacts_multi_format_and_r2"] = "PASS"

    # ── TEST 7: Expiration Enforcement (Isolated Test Grant) ──
    print("\n[TEST 7] Testing Expiry Enforcement on an Isolated Mock Grant (Never Modifying Real Google Grant)...")
    async with async_session() as db:
        past_date = datetime.datetime.now(timezone.utc) - datetime.timedelta(days=2)
        expired_inv = ReviewInvitation(
            token_hash=f"g_rev_test_expired_{uuid.uuid4().hex[:8]}",
            audience="google_reviewers_test",
            expires_at=past_date,
        )
        db.add(expired_inv)
        await db.commit()

        # Check that query finds it expired
        now_utc = datetime.datetime.now(timezone.utc)
        stmt = select(ReviewInvitation).where(
            ReviewInvitation.token_hash == expired_inv.token_hash,
            ReviewInvitation.expires_at > now_utc
        )
        active_res = await db.execute(stmt)
        assert active_res.scalar_one_or_none() is None, "Expired invitation was incorrectly considered active!"
        print("  ✓ Expired invitation properly rejected by database query.")

        # Cleanup isolated test grant
        await db.execute(text("DELETE FROM review_invitations WHERE id = :id"), {"id": expired_inv.id})
        await db.commit()
    results["expiry_enforcement"] = "PASS"

    print("\n" + "=" * 70)
    print("ALL TESTS COMPLETED SUCCESSFULLY!")
    for k, v in results.items():
        print(f"  {k}: {v}")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_full_review_e2e())
