#!/usr/bin/env bash
# ======================================================================
# Ñkyel AI · Script de Sauvegarde Neon vers Cloudflare R2
# SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
# ======================================================================

set -e

BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="/tmp/nkyel_backup_${BACKUP_DATE}.sql"

echo "💾 Démarrage de la sauvegarde de la base de données..."

if [ -n "$DATABASE_URL" ]; then
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
    echo "✅ Dump SQL local généré : $BACKUP_FILE"
    
    # Export vers R2
    python3 -c "
import os
from backend.services.r2_storage_service import r2_service
with open('$BACKUP_FILE', 'rb') as f:
    r2_service.upload_bytes(f.read(), 'backups/nkyel_backup_${BACKUP_DATE}.sql', content_type='application/sql')
print('✅ Sauvegarde archivée avec succès sur Cloudflare R2.')
"
    rm -f "$BACKUP_FILE"
else
    echo "⚠️ DATABASE_URL non définie. Sauvegarde ignorée."
fi
