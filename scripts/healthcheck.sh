#!/usr/bin/env bash
# ======================================================================
# Ñkyel AI · Script de Bilan de Santé Système & Services
# SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
# ======================================================================

set -e

echo "🩺 Bilan de Santé des Services Ñkyel AI..."

PORT="${PORT:-8000}"
HOST="${HOST:-localhost}"

# 1. Vérification API Backend
echo -n "1. API Backend FastAPI (/health)... "
HEALTH_RESPONSE=$(curl -s "http://${HOST}:${PORT}/health" || echo "")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"healthy"'; then
    echo "✅ OK"
else
    echo "❌ INACCESSIBLE (Port ${PORT})"
fi

# 2. Vérification Neon Database
echo -n "2. Persistance Neon PostgreSQL... "
python3 -c "
import asyncio, os
from backend.core.config import settings
from backend.db.session import engine
async def check_db():
    async with engine.connect() as conn:
        await conn.execute(__import__('sqlalchemy').text('SELECT 1'))
    print('✅ OK')
try:
    asyncio.run(check_db())
except Exception as e:
    print(f'❌ ERREUR: {e}')
"

# 3. Vérification Cloudflare R2
echo -n "3. Stockage Objet Cloudflare R2... "
python3 -c "
from backend.services.r2_storage_service import r2_service
print('✅ OK (Configuré)') if r2_service.bucket else print('⚠️ Non configuré (Fallback local)')
"

# 4. Vérification Tavily Search
echo -n "4. Moteur de Recherche Tavily... "
python3 -c "
import os
from backend.core.config import settings
print('✅ OK (Clé présente)') if settings.tavily_api_key else print('⚠️ TAVILY_API_KEY absente')
"

echo "======================================================================"
echo "✨ Bilan de santé terminé."
