# Ñkyel AI — Deployment Runbook & Production Guide
**SmartANDJ AI Technologies** · **Founder & Lead Architect : Daniel Jonathan ANDJ**

---

## 1. Vue d'Ensemble & Architecture de Déploiement

Ñkyel AI est déployé selon une topologie découplée haute disponibilité :
- **Frontend (Zone Publique & Bêta)** : `nkyel.smartandjai.com` (Vercel / Node.js Next.js 16)
- **Frontend (Instance Démo Google AI)** : `demo.nkyel.smartandjai.com` (Tenant isolé, `noindex, nofollow`)
- **Backend Core & Agentic Runtime** : `api.nkyel.smartandjai.com` (FastAPI / Python 3.13 / LangGraph / DeerFlow 2.0 Native)
- **Source de Vérité Canonique** : Neon PostgreSQL (Pooler & Unpooled SSL)
- **Coordination & Cache** : Upstash Redis (Quotas, verrous de concurrence atomiques)
- **RAG & Mémoire Sémantique** : Qdrant Vector Engine
- **Stockage Artefacts & Multimédia** : Cloudflare R2 (`media.nkyel.ai` & `artifacts.nkyel.ai`)
- **Inférence Multimodale & Synthèse** : Google Gemini (Gemini 2.5 Flash / Pro) + Groq + RunPod (GPU Wan2.1/Flux)

---

## 2. Variables d'Environnement Requises (Production)

| Variable | Description | Exemple / Format |
|---|---|---|
| `APP_ENV` | Environnement d'exécution | `production` |
| `BETA_START_AT` | Heure UTC d'ouverture (12h00 Libreville) | `2026-08-22T11:00:00Z` |
| `BETA_PUBLIC_END_AT` | Heure UTC de clôture (06h00 Libreville) | `2026-08-24T05:00:00Z` |
| `BETA_MAX_SEATS` | Nombre maximal absolu de testeurs | `100` |
| `DATABASE_URL` | Chaîne de connexion Neon PostgreSQL | `postgresql+asyncpg://user:pass@ep-...neon.tech/neondb?sslmode=require` |
| `REDIS_URL` | URL de connexion Redis Upstash | `rediss://default:token@...upstash.io:6379` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Clé API Google Gemini | `AIzaSy...` |
| `GOOGLE_API_KEYS` | Pool de clés de rotation Gemini | `key1,key2,key3` |
| `TAVILY_API_KEY` | Clé API Tavily Web Search | `tvly-...` |
| `CLERK_SECRET_KEY` | Clé secrète Clerk Backend | `sk_live_...` |
| `CLERK_WEBHOOK_SECRET` | Secret de signature Svix Clerk | `whsec_...` |
| `GOOGLE_REVIEWER_TOKEN_HASH` | Hash SHA-256 du token Reviewer Google | `e3b0c44298fc1c149afbf4c8996fb92427ae...` |
| `SENTRY_DSN` | DSN de supervision des erreurs | `https://...@ingest.sentry.io/...` |

---

## 3. Procédure de Déploiement Étape par Étape

### Étape 1 : Migrations de Base de Données
```bash
# Vérification et application du schéma Neon PostgreSQL
python backend/db/apply_schema.py
```

### Étape 2 : Vérification des Tests & Intégrité
```bash
# Exécution de la suite de tests unitaires et de concurrence
pytest -v
```

### Étape 3 : Build & Déploiement Frontend
```bash
cd ZION-CORE-V2
pnpm install --frozen-lockfile
pnpm build
```

### Étape 4 : Lancement du Backend
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Étape 5 : Ensemencement du Tenant Démo Google
```bash
python scripts/seed_google_demo.py
```

---

## 4. Healthcheck & Monitoring de Disponibilité

- **Endpoint de Santé** : `GET /health`
- **Statut Bêta Temps Réel** : `GET /api/v1/beta/status`
- **Dashboard Métriques Administrateur** : `https://nkyel.smartandjai.com/admin`
- **Alertes SRE** : Notification instantanée via Sentry et Better Stack.

---

## 5. Procédure de Rollback Immédiat

En cas d'anomalie critique :
1. **Activer le Kill Switch d'urgence** :
   ```env
   BETA_KILL_SWITCH=true
   ```
2. **Rollback de la release Vercel** vers le tag précédent via le dashboard Vercel ou la CLI :
   ```bash
   vercel rollback
   ```
3. **Restauration de la base de données** à partir du dernier snapshot Neon (voir `BACKUP_RESTORE.md`).
