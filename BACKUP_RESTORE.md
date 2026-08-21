# Ñkyel AI — Backup, Disaster Recovery & Restore Runbook
**SmartANDJ AI Technologies** · **SRE & Security Engineering**

---

## 1. Stratégie de Sauvegarde Hybride

1. **Neon PostgreSQL (Données Canoniques)** :
   - Point-in-time Recovery (PITR) continu actif sur Neon.
   - Snapshots automatiques horaires et avant chaque migration majeure.
   - Sauvegarde logique chiffrée quotidienne via `pg_dump` exportée vers Cloudflare R2 (`nkyel-backups-sovereign`).
2. **Cloudflare R2 (Artefacts & Documents)** :
   - Versioning activé sur le bucket `nkyel-artifacts-production`.
   - Réplication cross-région activée.
3. **Qdrant (Vecteurs RAG)** :
   - Snapshots de collection automatiques stockés sur R2.

---

## 2. Procédure de Sauvegarde Manuelle (`pg_dump` vers R2)

```bash
#!/usr/bin/env bash
# Exécuter une sauvegarde complète chiffrée
TIMESTAMP=$(date -u +"%Y%m%d_%H%M%SZ")
BACKUP_FILE="backup_nkyel_${TIMESTAMP}.sql.gz"

echo "📦 Sauvegarde de Neon PostgreSQL en cours..."
pg_dump "$DATABASE_URL" | gzip > "/tmp/${BACKUP_FILE}"

echo "🔐 Chiffrement et téléversement vers Cloudflare R2..."
rclone copy "/tmp/${BACKUP_FILE}" "r2:nkyel-backups-sovereign/daily/"

echo "✅ Sauvegarde terminée : ${BACKUP_FILE}"
```

---

## 3. Procédure de Restauration d'Urgence

### Cas 1 : Restauration Instantanée Neon (PITR)
1. Accéder à la console Neon PostgreSQL (`console.neon.tech`).
2. Sélectionner le projet `nkyel-production`.
3. Choisir le point temporel exact souhaité (ex: `2026-08-22T10:59:00Z`).
4. Cliquer sur **Restore to this point in time** ou créer une branche à partir de cet instant.

### Cas 2 : Restauration depuis un Dump Chiffré R2
```bash
# 1. Téléchargement du dump
rclone copy "r2:nkyel-backups-sovereign/daily/backup_nkyel_20260822_100000Z.sql.gz" /tmp/

# 2. Décompression et injection
gunzip < /tmp/backup_nkyel_20260822_100000Z.sql.gz | psql "$DATABASE_URL"

echo "✅ Base de données restaurée avec succès."
```
