"""
GabomaAI — Session Base de Données · SmartANDJ AI Technologies
Neon PostgreSQL async via SQLAlchemy 2.0 + asyncpg.
Fondateur : Daniel Jonathan ANDJ
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from core.config import settings

# ── Engine async Neon PostgreSQL ─────────────────────────────
# DATABASE_URL dans .env doit commencer par postgresql+asyncpg://
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

# ── Session factory ──────────────────────────────────────────
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """Dépendance FastAPI pour obtenir une session DB."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Vérifie la connexion à Neon au démarrage. Ne crée PAS de tables."""
    async with engine.begin() as conn:
        # Simple ping pour vérifier que Neon est accessible
        from sqlalchemy import text
        await conn.execute(text("SELECT 1"))


async def close_db() -> None:
    """Ferme le pool de connexions."""
    await engine.dispose()
