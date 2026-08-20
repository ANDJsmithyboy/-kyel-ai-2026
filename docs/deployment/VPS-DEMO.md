# Déploiement VPS P0 — Démo Google

Ce guide décrit comment déployer Ñkyel AI sur un VPS (via Coolify ou Docker Compose natif) pour héberger publiquement la démonstration.

## Architecture Cible

- **Frontend (ZION-CORE-V2) :** Déployé séparément via Vercel ou via Coolify Nixpacks pour Next.js (port exposé 3000 -> 80/443 public proxy).
- **Backend (FastAPI) :** Image Docker personnalisée.
- **Bases de Données :**
  - Redis (mémoire & queues)
  - Qdrant (vecteurs)
- **Réseau :**
  - Seuls les ports HTTP/HTTPS (80/443) de la passerelle (Reverse Proxy) sont exposés publiquement.
  - Le backend, Redis, Qdrant communiquent via le réseau Docker privé.
  - Cloudflare est utilisé devant le serveur pour SSL, DDoS protection, et cache statique.

## Pré-requis

1. Un VPS (ex: Hetzner CPX31 - 4 vCPU, 8 GB RAM) avec Ubuntu 22.04 LTS.
2. Un nom de domaine pointé vers l'IP du serveur (ex: `api.nkyel.com`).
3. Coolify installé ou Docker + Docker Compose.

## 1. Déploiement via Docker Compose (Stand-alone)

Si vous n'utilisez pas Coolify :

```bash
# 1. Cloner le dépôt (assurez-vous d'utiliser un deploy token)
git clone https://github.com/votre-org/nkyel-ai.git /opt/nkyel
cd /opt/nkyel

# 2. Configurer les secrets
cp backend/.env.example backend/.env
nano backend/.env
# Ajouter : GOOGLE_GENERATIVE_AI_API_KEY, TAVILY_API_KEY, CLERK_SECRET_KEY, etc.

# 3. Construire et Lancer
docker-compose up -d --build
```

### Configuration du Reverse Proxy (Caddy ou Nginx)
Configurez Nginx ou Caddy pour router le trafic de `api.nkyel.com` vers `localhost:8000`.

*Exemple Caddyfile :*
```
api.nkyel.com {
    reverse_proxy localhost:8000
}
```

## 2. Déploiement via Coolify

Coolify gère automatiquement les certificats SSL et le reverse proxy.

1. **Créer un Projet et un Environnement** dans Coolify.
2. **Ajouter la ressource Redis :** Utilisez l'image `redis:7-alpine`.
3. **Ajouter la ressource Qdrant :** Utilisez l'image `qdrant/qdrant:latest`, mappez les volumes persistants.
4. **Ajouter le Backend FastAPI :**
   - Source : Dépôt Git.
   - Build Pack : Dockerfile.
   - Root Directory : `/backend`
   - Variables d'environnement :
     - `REDIS_URL=redis://<nom-service-redis>:6379/0`
     - `QDRANT_URL=http://<nom-service-qdrant>:6333`
     - Les clés API Google / Tavily / Clerk.
5. **Déployer**.

## Sécurité & Contraintes

1. **Auth Obligatoire :** Assurez-vous que l'authentification Clerk bloque les routes sensibles (le backend valide le JWT).
2. **MCP Fetch :** Le backend lance `uvx mcp-server-fetch`. Assurez-vous que le conteneur backend a bien accès à Internet sortant pour contacter `modelcontextprotocol.io`, etc.
3. **Sentry :** Les variables `SENTRY_DSN` doivent être activées sans inclure les variables d'environnement PII (Clerk IDs).

## Scripts Utiles

**Sauvegarder l'Event Store SQLite (si utilisé avant Postgres) :**
```bash
docker exec nkyel-backend cp /app/db/events.db /app/db/events.backup.db
```

**Voir les logs en direct (y compris MCP) :**
```bash
docker-compose logs -f api
```

## Procédure de Rollback

Si la mise à jour P0 échoue :
```bash
docker tag nkyel_api:previous nkyel_api:latest
docker-compose up -d
```
