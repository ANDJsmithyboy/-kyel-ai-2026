# GUIDE DE DÉPLOIEMENT & SCALING 32-vCPU VPS
**Ñkyel AI — Production Candidate & Validation 40 Heures**
*SmartANDJ AI Technologies · Founder & Lead Architect: Daniel Jonathan ANDJ*

---

## 1. Vue d'Ensemble de l'Architecture
Ñkyel AI est conçu selon un principe de **souveraineté et portabilité totale**.
- **Phase 1 (Validation Immédiate)** : RunPod CPU (4 vCPU / 16 Go RAM) pendant 40 heures.
- **Phase 2 (Production Bêta Scalable)** : Serveur Dédié Linux 32-vCPU (ex. AMD EPYC / Intel Xeon 32 vCPU, 64-128 Go RAM).

---

## 2. Règle Fondamentale de Concurrency & Workers Uvicorn
> **IMPORTANT** : Ne JAMAIS configurer aveuglément 32 workers Uvicorn sur un serveur 32-vCPU pour une application agentique FastAPI / SSE !

### Pourquoi ?
1. **Nature Asyncio de FastAPI** : 1 worker Uvicorn avec boucle d'événements `uvloop` gère des milliers de connexions SSE concurrentes en mémoire partagée.
2. **Cohérence d'État Agentique** : Les générateurs d'événements et les verrous de session en mémoire restent sans conflit.
3. **Scaling Recommandé** :
   - Démarrer avec **1 worker par conteneur**.
   - Mesurer la charge CPU et la latence moyenne sous le Cockpit 40h.
   - Si besoin de parallélisation CPU pure (ex. compilation d'artefacts locale ou OCR lourd), scaler **horizontalement** en lançant `N` conteneurs Docker backend derrière un reverse proxy Nginx / Caddy avec load balancing à hachage d'IP / session persistante.

---

## 3. Prérequis sur le Serveur Linux 32-vCPU

```bash
# 1. Mise à jour du système (Ubuntu 22.04 / 24.04 LTS ou Debian 12)
sudo apt update && sudo apt upgrade -y

# 2. Installation de Docker & Docker Compose
sudo apt install -y curl ufw git
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Configuration du Firewall (UFW)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 4. Déploiement via Docker Compose

### Étape 1 : Cloner le Répertoire & Configurer les Secrets
```bash
git clone https://github.com/ANDJsmithyboy/-kyel-ai-2026.git /opt/nkyel-ai
cd /opt/nkyel-ai

# Créer le fichier .env de production (valeurs non commitées)
cp .env.example .env
nano .env
```

### Étape 2 : Build & Démarrage des Conteneurs
```bash
docker compose -f docker-compose.production.yml up -d --build
```

### Étape 3 : Vérification de la Santé
```bash
# Vérifier l'état des conteneurs
docker compose -f docker-compose.production.yml ps

# Vérifier les logs en temps réel
docker compose -f docker-compose.production.yml logs -f backend

# Tester le healthcheck
curl -I http://localhost:8000/health
```

---

## 5. Configuration Nginx Reverse-Proxy avec SSL (Certbot)

Créez le fichier `/etc/nginx/sites-available/nkyel.conf` :

```nginx
server {
    server_name nkyel.ai www.nkyel.ai;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Configuration indispensable pour les flux SSE en streaming
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

Activez et générez le certificat SSL :
```bash
sudo ln -s /etc/nginx/sites-available/nkyel.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d nkyel.ai -d www.nkyel.ai
```

---

## 6. Surveillance & Cockpit 40 Heures
Accédez au Cockpit de contrôle souverain via `/admin` (authentification requise via Clerk avec rôle `OWNER` ou `SUPER_ADMIN`).
Vérifiez :
1. Le temps écoulé de la fenêtre de validation (0h à 40h).
2. Le taux de succès des missions (cible > 98.5%).
3. La latence P50 / P95.
4. Le nombre de retours P0 / P1 ouverts (doit être égal à 0 pour le Go de production).
