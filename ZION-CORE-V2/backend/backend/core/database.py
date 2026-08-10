"""
GabomaAI — Database Helpers · SmartANDJ AI Technologies
Requêtes Neon PostgreSQL via SQLAlchemy async + text().
Fondateur : Daniel Jonathan ANDJ
"""

from typing import Optional
from datetime import datetime, timezone

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import async_session


# ── Users ────────────────────────────────────────────────────

async def get_user_by_clerk_id(clerk_id: str) -> Optional[dict]:
    async with async_session() as session:
        result = await session.execute(
            text("SELECT * FROM users WHERE clerk_id = :cid LIMIT 1"),
            {"cid": clerk_id},
        )
        row = result.mappings().first()
        return dict(row) if row else None


async def get_user_by_id(user_id: str) -> Optional[dict]:
    async with async_session() as session:
        result = await session.execute(
            text("SELECT * FROM users WHERE id = :uid LIMIT 1"),
            {"uid": user_id},
        )
        row = result.mappings().first()
        return dict(row) if row else None


# ── Conversations ────────────────────────────────────────────

async def save_conversation(user_id: str, title: str, model: str, mode: str = "chat") -> str:
    async with async_session() as session:
        result = await session.execute(
            text("""
                INSERT INTO conversations (user_id, title, model, mode)
                VALUES (:uid, :title, :model, :mode)
                RETURNING id
            """),
            {"uid": user_id, "title": title, "model": model, "mode": mode},
        )
        await session.commit()
        return str(result.scalar_one())


async def get_conversation(conversation_id: str, user_id: str) -> Optional[dict]:
    async with async_session() as session:
        result = await session.execute(
            text("SELECT * FROM conversations WHERE id = :cid AND user_id = :uid LIMIT 1"),
            {"cid": conversation_id, "uid": user_id},
        )
        row = result.mappings().first()
        return dict(row) if row else None


async def update_conversation_title(conversation_id: str, title: str) -> None:
    async with async_session() as session:
        await session.execute(
            text("UPDATE conversations SET title = :title WHERE id = :cid"),
            {"title": title, "cid": conversation_id},
        )
        await session.commit()


async def list_conversations(user_id: str, limit: int = 50, offset: int = 0) -> list[dict]:
    async with async_session() as session:
        result = await session.execute(
            text("""
                SELECT id, title, model, mode, is_pinned, is_archived, tokens_used, created_at, updated_at
                FROM conversations
                WHERE user_id = :uid AND is_archived = FALSE
                ORDER BY is_pinned DESC, updated_at DESC
                LIMIT :lim OFFSET :off
            """),
            {"uid": user_id, "lim": limit, "off": offset},
        )
        return [dict(row) for row in result.mappings().all()]


# ── Messages ─────────────────────────────────────────────────

async def save_message(
    conversation_id: str,
    user_id: str,
    role: str,
    content: str,
    model: Optional[str] = None,
    tokens_in: int = 0,
    tokens_out: int = 0,
    sources: Optional[dict] = None,
    agent_steps: Optional[dict] = None,
) -> str:
    async with async_session() as session:
        result = await session.execute(
            text("""
                INSERT INTO messages (conversation_id, user_id, role, content, model, tokens_in, tokens_out, sources, agent_steps)
                VALUES (:cid, :uid, :role, :content, :model, :tin, :tout, :sources::jsonb, :steps::jsonb)
                RETURNING id
            """),
            {
                "cid": conversation_id,
                "uid": user_id,
                "role": role,
                "content": content,
                "model": model,
                "tin": tokens_in,
                "tout": tokens_out,
                "sources": sources,
                "steps": agent_steps,
            },
        )
        await session.commit()
        return str(result.scalar_one())


async def get_conversation_messages(conversation_id: str, limit: int = 100) -> list[dict]:
    async with async_session() as session:
        result = await session.execute(
            text("""
                SELECT id, role, content, model, tokens_in, tokens_out, has_rendu, sources, agent_steps, created_at
                FROM messages
                WHERE conversation_id = :cid
                ORDER BY created_at ASC
                LIMIT :lim
            """),
            {"cid": conversation_id, "lim": limit},
        )
        return [dict(row) for row in result.mappings().all()]


# ── Credits Ledger ───────────────────────────────────────────

async def deduct_credits(user_id: str, amount: int, model: str, method: str = "usage") -> int:
    """Déduit les crédits et retourne le nouveau solde."""
    async with async_session() as session:
        # Charger solde actuel
        result = await session.execute(
            text("SELECT credits, credits_used FROM users WHERE id = :uid FOR UPDATE"),
            {"uid": user_id},
        )
        row = result.mappings().first()
        if not row:
            return 0

        new_credits = max(0, row["credits"] - amount)
        new_used = row["credits_used"] + amount

        # Mettre à jour l'utilisateur
        await session.execute(
            text("UPDATE users SET credits = :c, credits_used = :cu WHERE id = :uid"),
            {"c": new_credits, "cu": new_used, "uid": user_id},
        )

        # Écrire dans le ledger
        await session.execute(
            text("""
                INSERT INTO credits_ledger (user_id, type, amount, balance_after, model, method)
                VALUES (:uid, 'usage', :amt, :bal, :model, :method)
            """),
            {"uid": user_id, "amt": -amount, "bal": new_credits, "model": model, "method": method},
        )
        await session.commit()
        return new_credits


# ── Agent Sessions ───────────────────────────────────────────

async def save_agent_session(
    user_id: str,
    conversation_id: str,
    deerflow_thread_id: str,
    model: str,
    status: str = "running",
    steps: Optional[dict] = None,
) -> str:
    async with async_session() as session:
        result = await session.execute(
            text("""
                INSERT INTO agent_sessions (user_id, conversation_id, deerflow_thread_id, model, status, steps)
                VALUES (:uid, :cid, :tid, :model, :status, :steps::jsonb)
                RETURNING id
            """),
            {
                "uid": user_id,
                "cid": conversation_id,
                "tid": deerflow_thread_id,
                "model": model,
                "status": status,
                "steps": steps,
            },
        )
        await session.commit()
        return str(result.scalar_one())


async def update_agent_session_status(session_id: str, status: str, error_message: Optional[str] = None) -> None:
    async with async_session() as session:
        await session.execute(
            text("""
                UPDATE agent_sessions SET status = :status, error_message = :err
                WHERE id = :sid
            """),
            {"status": status, "err": error_message, "sid": session_id},
        )
        await session.commit()


# ── Admin Stats ──────────────────────────────────────────────

async def get_admin_stats() -> dict:
    async with async_session() as session:
        stats = {}

        r = await session.execute(text("SELECT COUNT(*) FROM users"))
        stats["total_users"] = r.scalar_one()

        r = await session.execute(text("SELECT COUNT(*) FROM conversations"))
        stats["total_conversations"] = r.scalar_one()

        r = await session.execute(text("SELECT COUNT(*) FROM messages"))
        stats["total_messages"] = r.scalar_one()

        r = await session.execute(text("SELECT COALESCE(SUM(tokens_in + tokens_out), 0) FROM messages"))
        stats["total_tokens"] = r.scalar_one()

        r = await session.execute(text("SELECT COALESCE(SUM(credits_used), 0) FROM users"))
        stats["total_credits_used"] = r.scalar_one()

        r = await session.execute(text("SELECT COUNT(*) FROM waitlist WHERE status = 'pending'"))
        stats["waitlist_pending"] = r.scalar_one()

        r = await session.execute(text("SELECT COUNT(*) FROM agent_sessions"))
        stats["total_agent_sessions"] = r.scalar_one()

        return stats


# ── Admin Lists ──────────────────────────────────────────────

async def list_all_users(limit: int = 100, offset: int = 0) -> list[dict]:
    async with async_session() as session:
        result = await session.execute(
            text("""
                SELECT id, clerk_id, email, full_name, tier, credits, credits_used,
                       is_admin, is_banned, beta_pioneer, pioneer_number, created_at
                FROM users ORDER BY created_at DESC
                LIMIT :lim OFFSET :off
            """),
            {"lim": limit, "off": offset},
        )
        return [dict(row) for row in result.mappings().all()]


async def list_all_conversations(limit: int = 100, offset: int = 0) -> list[dict]:
    async with async_session() as session:
        result = await session.execute(
            text("""
                SELECT c.id, c.title, c.model, c.mode, c.tokens_used, c.created_at, c.updated_at,
                       u.email, u.full_name
                FROM conversations c
                JOIN users u ON c.user_id = u.id
                ORDER BY c.updated_at DESC
                LIMIT :lim OFFSET :off
            """),
            {"lim": limit, "off": offset},
        )
        return [dict(row) for row in result.mappings().all()]


async def list_audit_logs(limit: int = 100, offset: int = 0) -> list[dict]:
    async with async_session() as session:
        result = await session.execute(
            text("""
                SELECT a.*, u.email, u.full_name
                FROM audit_logs a
                LEFT JOIN users u ON a.user_id = u.id
                ORDER BY a.created_at DESC
                LIMIT :lim OFFSET :off
            """),
            {"lim": limit, "off": offset},
        )
        return [dict(row) for row in result.mappings().all()]


async def list_waitlist(limit: int = 100, offset: int = 0) -> list[dict]:
    async with async_session() as session:
        result = await session.execute(
            text("""
                SELECT * FROM waitlist
                ORDER BY pioneer_number ASC
                LIMIT :lim OFFSET :off
            """),
            {"lim": limit, "off": offset},
        )
        return [dict(row) for row in result.mappings().all()]
