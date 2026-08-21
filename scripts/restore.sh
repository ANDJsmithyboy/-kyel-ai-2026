#!/usr/bin/env bash
# ======================================================================
# Ñkyel AI · Script de Restauration depuis Sauvegarde
# SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
# ======================================================================

set -e

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: bash scripts/restore.sh <path_or_r2_key_to_backup.sql>"
    exit 1
fi

echo "🔄 Restauration de la base de données depuis $BACKUP_FILE..."

if [ -n "$DATABASE_URL" ]; then
    psql "$DATABASE_URL" < "$BACKUP_FILE"
    echo "✅ Base de données restaurée avec succès."
else
    echo "❌ DATABASE_URL non définie."
    exit 1
fi
