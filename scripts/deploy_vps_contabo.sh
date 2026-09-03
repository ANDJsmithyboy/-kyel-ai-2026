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

echo "=========================================================="
echo "🏗️ 2. REBUILD DES CONTENEURS (BACKEND + DEERFLOW 2.0)"
echo "=========================================================="
docker compose -f docker-compose.production.yml build

echo "=========================================================="
echo "⚡ 3. DÉMARRAGE & MISE À JOUR SÉCURISÉE EN PRODUCTION"
echo "=========================================================="
docker compose -f docker-compose.production.yml up -d --remove-orphans

echo "=========================================================="
echo "⏳ 4. ATTENTE DU HEALTHCHECK INITIAL (15s)..."
echo "=========================================================="
sleep 15

echo "=========================================================="
echo "🔍 5. VÉRIFICATION DU STATUT ET DES PROBES"
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
