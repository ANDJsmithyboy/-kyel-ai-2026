#!/usr/bin/env bash
# ==============================================================================
# ÑKYEL AI — RESET TOTAL & REBUILD PROPRE EN PRODUCTION (ZERO ARTIFACT RÉSIDUEL)
# SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo "🧹 1. ARRÊT TOTAL ET NETTOYAGE COMPLET DES RESSOURCES"
echo "=========================================================="
cd /opt/nkyel

# Arrêter et supprimer absolument tous les conteneurs Docker existants
echo "[*] Suppression des conteneurs existants..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true
docker network prune -f 2>/dev/null || true

# Tuer tout processus orphelin occupant le port 8000 ou 8080 sur la machine hôte
echo "[*] Libération des ports système 8000 et 8080..."
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 8080/tcp 2>/dev/null || true

echo "=========================================================="
echo "📥 2. SYNCHRONISATION DU CODE SOURCE (MAIN)"
echo "=========================================================="
git fetch origin main
git reset --hard origin/main

echo "=========================================================="
echo "🔐 3. VÉRIFICATION ET SYNCHRONISATION DU FICHIER .ENV"
echo "=========================================================="
# Si backend/.env existe et est complet, on le synchronise à la racine
if [ -f backend/.env ]; then
    cp -f backend/.env .env
    echo "[+] .env synchronisé depuis backend/.env"
elif [ -f .env ]; then
    cp -f .env backend/.env
    echo "[+] backend/.env synchronisé depuis la racine .env"
else
    echo "[-] ERREUR: Aucun fichier .env trouvé !"
    exit 1
fi

ENV_LINES=$(wc -l < .env)
echo "[*] Fichier .env actif contenant $ENV_LINES lignes de configuration."

echo "=========================================================="
echo "🏗️ 4. REBUILD PROPRE ET DÉMARRAGE DES CONTENEURS"
echo "=========================================================="
docker compose -f docker-compose.production.yml build backend deerflow
docker compose -f docker-compose.production.yml up -d --force-recreate --remove-orphans backend deerflow

echo "=========================================================="
echo "⏳ 5. ATTENTE DU CHARGEMENT COMPLET (15s)..."
echo "=========================================================="
sleep 15

echo "=========================================================="
echo "🔍 6. VÉRIFICATION DE SANTÉ ET ÉTAT DES PORTS"
echo "=========================================================="
docker compose -f docker-compose.production.yml ps

echo ""
echo "--- TEST FASTAPI HEALTH (PORT 8000) ---"
curl -s -i http://localhost:8000/health || echo "Attente supplémentaire requise..."
echo ""

echo "--- TEST DEERFLOW GATEWAY (PORT 8080) ---"
curl -s -i http://localhost:8080/health || echo "Attente supplémentaire requise..."
echo ""

echo "=========================================================="
echo "📋 DERNIERS LOGS DU BACKEND FASTAPI"
echo "=========================================================="
docker compose -f docker-compose.production.yml logs --tail=25 backend

echo ""
echo "=========================================================="
echo "✅ RESET TOTAL ET DÉPLOIEMENT TERMINÉS AVEC SUCCÈS !"
echo "=========================================================="
