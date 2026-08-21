"""
Ñkyel AI — Applicateur de Schéma PostgreSQL Neon
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
"""

import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from db.session import engine


async def apply_sql_schema():
    migrations_dir = Path(__file__).parent / "migrations"
    sql_files = sorted(migrations_dir.glob("*.sql"))

    if not sql_files:
        print("[ERROR] Aucun fichier de migration trouvé dans", migrations_dir)
        return

    print(f"📦 [1/2] Connexion à Neon PostgreSQL ({len(sql_files)} fichier(s) de migration détecté(s))...")
    async with engine.connect() as conn:
        raw_conn = await conn.get_raw_connection()
        for idx, sql_file in enumerate(sql_files, start=1):
            print(f"   [{idx}/{len(sql_files)}] Application de {sql_file.name}...")
            sql_content = sql_file.read_text(encoding="utf-8")
            await raw_conn.driver_connection.execute(sql_content)

    print("✅ [2/2] Toutes les tables, index, RLS et campagnes Bêta ont été créés avec succès sur Neon PostgreSQL !")


if __name__ == "__main__":
    asyncio.run(apply_sql_schema())

