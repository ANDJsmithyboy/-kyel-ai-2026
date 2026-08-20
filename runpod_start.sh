#!/bin/bash
# ==============================================================================
# Ñkyel AI — Script de Démarrage Officiel RunPod.io
# SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
# ==============================================================================

set -e

echo "🚀 [1/4] Détection de l'interpréteur Python..."
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi
echo "Utilisation de : $($PYTHON_CMD --version)"

echo "📦 [2/4] Vérification et installation des dépendances clés..."
$PYTHON_CMD -m pip install --no-cache-dir fastapi uvicorn pydantic python-dotenv httpx requests

echo "🛑 [3/4] Arrêt des anciens processus résiduels..."
pkill -f "uvicorn" || true
sleep 1

echo "⚡ [4/4] Démarrage du serveur Ñkyel Backend sur le port 8080 (Port Public RunPod)..."
export PYTHONPATH="/workspace/-kyel-ai-2026/backend:$PYTHONPATH"
cd /workspace/-kyel-ai-2026/backend

# Lancement en arrière-plan
nohup $PYTHON_CMD main_dev.py > /workspace/backend.log 2>&1 &

echo "⏳ Attente du démarrage..."
sleep 3

echo "📋 Vérification immédiate de la santé :"
if curl -s -f http://localhost:8080/health > /dev/null; then
    echo "✅ SUCCÈS : Le backend Ñkyel AI tourne sur le port 8080 !"
    curl -s http://localhost:8080/health
    echo ""
    echo "🌐 Accessible publiquement sur votre URL RunPod proxy 8080."
else
    echo "⚠️ Le serveur n'a pas répondu immédiatement. Affichage des 20 dernières lignes de log :"
    tail -n 20 /workspace/backend.log
fi
