# Guide de Déploiement — Profils Local, Bêta & Production

> **SmartANDJ AI Technologies** · **Fondateur** : Daniel Jonathan ANDJ

---

## Profil 1 — Développement Local

```bash
# 1. Installer les dépendances
make install

# 2. Lancer les services locaux
make dev
```

* Backend : `http://localhost:8000` (FastAPI)
* Frontend : `http://localhost:3000` (Next.js)

---

## Profil 2 — Bêta Ñkyel (VPS / RunPod)

* **Exécution IA** : RunPod GPU (ComfyUI Wan2.1 / FLUX.1)
* **Auth** : Clerk (`pk_test_...`)
* **Base de données** : Neon PostgreSQL Serverless
* **Fichiers** : Cloudflare R2
* **Coordination** : Upstash Redis

---

## Profil 3 — Production Haute Disponibilité

```bash
# Déploiement via Docker Compose Production
docker compose -f docker-compose.production.yml up -d --build
```

* **Healthcheck K8s** : `GET /health` et `GET /api/v1/nkyel/health`
* **Supervision** : Sentry DSN + Better Stack
* **Sauvegarde automatique** : `make backup` vers Cloudflare R2
