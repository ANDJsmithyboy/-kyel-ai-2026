#!/usr/bin/env bash
# ==============================================================================
# ÑKYEL AI — DEPLOYMENT & REBUILD CONTABO VPS (ZERO DOWNTIME / CLEAN RESET)
# SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo "🚀 1. ARRÊT & PURGE COMPLÈTE DE L'ANCIEN ENVIRONNEMENT DOCKER"
echo "=========================================================="
docker compose -f docker-compose.production.yml down -v --remove-orphans || true
docker rm -f nkyel-backend-prod nkyel-deerflow-prod nkyel-frontend-prod 2>/dev/null || true
docker system prune -af --volumes

echo "=========================================================="
echo "📥 2. RÉCUPÉRATION DU CODE LE PLUS RÉCENT (MAIN)"
echo "=========================================================="
git fetch origin main
git reset --hard origin/main

echo "=========================================================="
echo "🏗️ 3. REBUILD INTÉGRAL SANS CACHE (BACKEND + DEERFLOW 2.0)"
echo "=========================================================="
docker compose -f docker-compose.production.yml build --no-cache

echo "=========================================================="
echo "⚡ 4. DÉMARRAGE DES CONTENEURS EN PRODUCTION"
echo "=========================================================="
docker compose -f docker-compose.production.yml up -d

echo "=========================================================="
echo "⏳ 5. ATTENTE DU HEALTHCHECK INITIAL (15s)..."
echo "=========================================================="
sleep 15

echo "=========================================================="
echo "🔍 6. VÉRIFICATION DU STATUT ET DES PROBES"
echo "=========================================================="
docker compose -f docker-compose.production.yml ps

echo "--- VÉRIFICATION READINESS FASTAPI ---"
curl -s http://localhost:8000/readiness || true
echo ""

echo "--- VÉRIFICATION DEERFLOW GATEWAY ---"
curl -s http://localhost:8080/health || true
echo ""

echo "=========================================================="
echo "✅ DÉPLOIEMENT & REBUILD TERMINÉ AVEC SUCCÈS SUR LE VPS !"
echo "=========================================================="
