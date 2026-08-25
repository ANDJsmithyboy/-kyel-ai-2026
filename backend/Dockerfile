# ==============================================================================
# ÑKYEL AI — PRODUCTION DOCKERFILE (PORTABLE RUNPOD & 32-vCPU VPS)
# SmartANDJ AI Technologies · Fondateur & Lead Architect : Daniel Jonathan ANDJ
# ==============================================================================

FROM python:3.11-slim AS runtime

# Variables d'environnement pour l'exécution Python et le serveur ASGI
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PORT=8000 \
    HOST=0.0.0.0 \
    RELEASE_VERSION=1.0.0-rc1

WORKDIR /app

# Installation des dépendances système requises (curl pour healthcheck, libpq pour PostgreSQL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Création d'un utilisateur non-root pour l'isolation de sécurité
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -s /bin/bash -m appuser

# Installation de uv pour une résolution et installation optimisées des paquets
RUN pip install --no-cache-dir uv

# Étape 1 : Copie des dépendances pour optimiser le cache Docker
COPY requirements.txt .

# Étape 2 : Installation des dépendances Python
RUN uv pip install --no-cache --system -r requirements.txt

# Étape 3 : Copie de l'ensemble du backend
COPY --chown=appuser:appgroup . .

# Passage à l'utilisateur non-root
USER appuser

# Port d'écoute exposé
EXPOSE 8000

# Healthcheck natif Docker
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Lancement d'Uvicorn avec 1 worker par conteneur (scale horizontalement si besoin)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--timeout-keep-alive", "75"]
