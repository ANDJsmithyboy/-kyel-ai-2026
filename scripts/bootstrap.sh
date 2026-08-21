#!/usr/bin/env bash
# ======================================================================
# Ñkyel AI · Script de Bootstrap & Installation Initiale
# SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
# ======================================================================

set -e

echo "🌟 Initialisation de l'environnement souverain Ñkyel AI..."

# 1. Vérification des prérequis système
echo "🔍 Vérification des prérequis..."
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 est requis mais non installé."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js est requis mais non installé."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "⚠️ pnpm non détecté. Installation..."; npm install -g pnpm; }

# 2. Configuration du fichier d'environnement
if [ ! -f ".env" ]; then
    echo "📋 Création du fichier .env à partir de .env.example..."
    cp .env.example .env
fi

# 3. Installation des dépendances Python
echo "📦 Installation des dépendances Backend..."
python3 -m pip install --upgrade pip
pip install -r requirements.txt

# 4. Installation des dépendances Frontend
echo "🎨 Installation des dépendances Frontend ZION-CORE-V2..."
cd ZION-CORE-V2 && pnpm install && cd ..

# 5. Application des migrations de base de données
echo "🗄️ Application du schéma Neon PostgreSQL..."
python3 -c "import asyncio; from backend.db.session import init_db; asyncio.run(init_db())"

# 6. Exécution du test d'acceptation E2E
echo "🧪 Validation finale du cycle de vie..."
python3 scripts/test_e2e_acceptance.py

echo "======================================================================"
echo "🎉 Bootstrap Ñkyel AI terminé avec succès !"
echo "👉 Lancez l'application avec : make dev"
echo "======================================================================"
