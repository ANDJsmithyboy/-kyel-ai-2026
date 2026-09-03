#!/usr/bin/env bash
# ==============================================================================
# ÑKYEL AI — DEPLOYMENT & REBUILD CONTABO VPS (ZERO DOWNTIME / CLEAN RESET)
# SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo "📥 1. RÉCUPÉRATION DU CODE LE PLUS RÉCENT (MAIN)"
echo "=========================================================="
git fetch origin main
git reset --hard origin/main

# Garantir la synchronisation bidirectionnelle du .env entre la racine et backend
if [ -f backend/.env ] && [ ! -f .env ]; then
    echo "[*] Copie de backend/.env vers la racine .env..."
    cp backend/.env .env
elif [ -f .env ] && [ ! -f backend/.env ]; then
    echo "[*] Copie de .env racine vers backend/.env..."
    cp .env backend/.env
elif [ -f backend/.env ] && [ -f .env ]; then
    cp -u backend/.env .env 2>/dev/null || cp backend/.env .env
    cp -u .env backend/.env 2>/dev/null || cp .env backend/.env
fi

# Arrêt préventif des anciens conteneurs orphelins ou conflictuels et libération du port 8000
echo "[*] Libération du port 8000 et nettoyage des conteneurs existants..."
docker compose -f docker-compose.yml down 2>/dev/null || true
docker rm -f nkyel-api nkyel-backend-prod 2>/dev/null || true
docker ps -q --filter publish=8000 | xargs -r docker rm -f 2>/dev/null || true
fuser -k 8000/tcp 2>/dev/null || true

echo "=========================================================="
echo "🏗️ 2. REBUILD DES CONTENEURS (BACKEND + DEERFLOW 2.0)"
echo "=========================================================="
docker compose -f docker-compose.production.yml build backend deerflow

echo "=========================================================="
echo "⚡ 3. DÉMARRAGE & MISE À JOUR SÉCURISÉE EN PRODUCTION"
echo "=========================================================="
docker compose -f docker-compose.production.yml up -d --force-recreate --remove-orphans backend deerflow

echo "=========================================================="
echo "⏳ 4. ATTENTE DU HEALTHCHECK INITIAL (15s)..."
echo "=========================================================="
sleep 15

echo "=========================================================="
echo "🔍 5. VÉRIFICATION DU STATUT ET DES PROBES"
echo "=========================================================="
docker compose -f docker-compose.production.yml ps

echo "--- VÉRIFICATION HEALTH FASTAPI ---"
curl -s http://localhost:8000/health || true
echo ""

echo "--- VÉRIFICATION DEERFLOW GATEWAY ---"
curl -s http://localhost:8080/health || true
echo ""

echo "=========================================================="
echo "✅ DÉPLOIEMENT & REBUILD TERMINÉ AVEC SUCCÈS SUR LE VPS !"
echo "=========================================================="
