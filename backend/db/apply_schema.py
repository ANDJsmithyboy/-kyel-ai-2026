"""
Ñkyel AI — Applicateur de Schéma PostgreSQL Neon
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
"""

import asyncio
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text

from db.session import engine


def _strip_transaction_markers(sql: str) -> str:
    """Évite les BEGIN/COMMIT imbriqués : le runner gère la transaction."""
    return re.sub(r"(^\s*BEGIN\s*;\s*$|^\s*COMMIT\s*;\s*$)", "", sql, flags=re.MULTILINE | re.IGNORECASE)


async def apply_sql_schema():
    migrations_dir = Path(__file__).parent / "migrations"
    sql_files = sorted(migrations_dir.glob("*.sql"))

    if not sql_files:
        print("[ERROR] Aucun fichier de migration trouvé dans", migrations_dir)
        return

    print(f"📦 Connexion à Neon PostgreSQL ({len(sql_files)} fichier(s) de migration)...")

    async with engine.begin() as conn:
        raw_conn = await conn.get_raw_connection()
        for idx, sql_file in enumerate(sql_files, start=1):
            sql_content = sql_file.read_text(encoding="utf-8")
            cleaned_sql = _strip_transaction_markers(sql_content)
            if not cleaned_sql.strip():
                print(f"   [{idx}/{len(sql_files)}] {sql_file.name}: vide, ignoré")
                continue

            print(f"   [{idx}/{len(sql_files)}] Application de {sql_file.name}...")
            await raw_conn.driver_connection.execute(cleaned_sql)

        # Vérification immédiate au sein de la même transaction
        row = await raw_conn.driver_connection.fetchrow(
            """
            SELECT
                to_regclass('public.beta_campaigns') AS public_beta,
                to_regclass('beta_campaigns') AS beta
            """
        )
        if not row:
            raise RuntimeError("Fingerprint query returned no row")
        public_beta = row.get("public_beta")
        beta = row.get("beta")
        print(f"   [verify] public.beta_campaigns={public_beta}")
        print(f"   [verify] beta_campaigns={beta}")

    print("✅ Migrations terminées.")


if __name__ == "__main__":
    asyncio.run(apply_sql_schema())

