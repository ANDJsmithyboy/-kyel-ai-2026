"""
Ñkyel AI — DB Fingerprint
Comparaison non-destructive entre la connexion runtime et la connexion migration.
NE JAMAIS afficher de secrets.
"""
import asyncio
import os
import re
from urllib.parse import urlparse

from sqlalchemy import text

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def _sanitize_url(url: str) -> str:
    """Extrait hôte et database uniquement. Masque identifiants."""
    try:
        url = url.replace("postgresql+asyncpg://", "postgresql://").replace("postgres://", "postgresql://")
        parsed = urlparse(url)
        host = parsed.hostname or "unknown"
        database = (parsed.path or "").lstrip("/").split("?")[0] or "unknown"
        return f"{host}/{database}"
    except Exception:
        return "unparseable"


async def _fingerprint_engine(label: str, db_url: str):
    from sqlalchemy.ext.asyncio import create_async_engine

    cleaned_url = db_url.strip().strip('"').strip("'")
    if cleaned_url.startswith("postgresql://"):
        cleaned_url = cleaned_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if "asyncpg" not in cleaned_url:
        cleaned_url = cleaned_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    cleaned_url = cleaned_url.replace("sslmode=require", "ssl=require").replace("channel_binding=require", "")
    if cleaned_url.endswith("&") or cleaned_url.endswith("?"):
        cleaned_url = cleaned_url[:-1]

    engine = create_async_engine(cleaned_url, echo=False, pool_size=1, max_overflow=0)
    try:
        async with engine.connect() as conn:
            result = await conn.execute(
                text("""
                    SELECT
                        current_database() as db,
                        current_schema() as schema,
                        current_setting('search_path') as search_path,
                        to_regclass('public.beta_campaigns') as public_beta_campaigns,
                        to_regclass('beta_campaigns') as beta_campaigns,
                        to_regclass('public.users') as public_users,
                        to_regclass('users') as users
                """)
            )
            row = result.mappings().first()
            if not row:
                raise RuntimeError(f"No row returned from fingerprint query for {label}")
            print(f"[{label}] url={_sanitize_url(db_url)}")
            print(f"[{label}] current_database={row['db']}")
            print(f"[{label}] current_schema={row['schema']}")
            print(f"[{label}] search_path={row['search_path']}")
            print(f"[{label}] public.beta_campaigns={row['public_beta_campaigns']}")
            print(f"[{label}] beta_campaigns={row['beta_campaigns']}")
            print(f"[{label}] public.users={row['public_users']}")
            print(f"[{label}] users={row['users']}")
            return row
    finally:
        await engine.dispose()


async def _apply_schema_fingerprint():
    """Même connexion que db/apply_schema.py (db.session.engine)."""
    from db.session import engine

    async with engine.connect() as conn:
        result = await conn.execute(
            text("""
                SELECT
                    current_database() as db,
                    current_schema() as schema,
                    current_setting('search_path') as search_path,
                    to_regclass('public.beta_campaigns') as public_beta_campaigns,
                    to_regclass('beta_campaigns') as beta_campaigns,
                    to_regclass('public.users') as public_users,
                    to_regclass('users') as users
            """)
        )
        row = result.mappings().first()
        if not row:
            raise RuntimeError("No row returned from apply_schema fingerprint query")
        from core.config import settings
        print(f"[apply_schema] url={_sanitize_url(settings.database_url)}")
        print(f"[apply_schema] current_database={row['db']}")
        print(f"[apply_schema] current_schema={row['schema']}")
        print(f"[apply_schema] search_path={row['search_path']}")
        print(f"[apply_schema] public.beta_campaigns={row['public_beta_campaigns']}")
        print(f"[apply_schema] beta_campaigns={row['beta_campaigns']}")
        print(f"[apply_schema] public.users={row['public_users']}")
        print(f"[apply_schema] users={row['users']}")
        return row


async def main():
    from core.config import settings

    print("=== DATABASE FINGERPRINT (no secrets) ===")

    # Runtime/session connection
    await _apply_schema_fingerprint()

    # Environment variables
    for env_name in ("DATABASE_URL", "DATABASE_URL_UNPOOLED", "DATABASE_URL_DIRECT", "POSTGRES_URL", "NEON_DATABASE_URL"):
        env_val = os.environ.get(env_name)
        if env_val:
            print(f"[{env_name}] present url={_sanitize_url(env_val)}")
            try:
                await _fingerprint_engine(env_name, env_val)
            except Exception as e:
                print(f"[{env_name}] ERROR: {type(e).__name__}: {e}")

    print("=== END FINGERPRINT ===")


if __name__ == "__main__":
    asyncio.run(main())
