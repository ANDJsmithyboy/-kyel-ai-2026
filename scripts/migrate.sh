#!/usr/bin/env bash
# ======================================================================
# Ñkyel AI · Script de Migration de la Base de Données
# SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
# ======================================================================

set -e

echo "🗄️ Application des tables et index Neon PostgreSQL..."

python3 -c "
import asyncio
from backend.db.session import init_db
asyncio.run(init_db())
print('✅ Schéma Neon PostgreSQL synchronisé avec succès.')
"
