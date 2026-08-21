"""
Ñkyel AI — Session Base de Données · SmartANDJ AI Technologies
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
db_url = settings.database_url
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Nettoyage des paramètres libpq incompatibles avec asyncpg
db_url = db_url.replace("sslmode=require", "ssl=require").replace("channel_binding=require", "")
if db_url.endswith("&") or db_url.endswith("?"):
    db_url = db_url[:-1]

engine = create_async_engine(
    db_url,
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    connect_args={"timeout": 3.0} if "asyncpg" in db_url else {},
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
