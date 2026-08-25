# ==============================================================================
# ÑKYEL AI — PRODUCTION DOCKERFILE POUR RUNPOD CPU (4 vCPU / 16 Go)
# SmartANDJ AI Technologies · Fondateur & Lead Architect : Daniel Jonathan ANDJ
# ==============================================================================

FROM python:3.11-slim AS runtime

# Variables d'environnement pour l'exécution Python et le serveur ASGI
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Installation des dépendances système requises (curl pour healthcheck, libpq pour PostgreSQL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Installation de uv pour une résolution et installation optimisées des paquets
RUN pip install --no-cache-dir uv

# Étape 1 : Copie des dépendances pour optimiser le cache Docker
COPY requirements.txt .

# Étape 2 : Installation des dépendances Python
RUN uv pip install --no-cache --system -r requirements.txt

# Étape 3 : Copie de l'ensemble du backend (Ñkyel Core, DeerFlow 2.0, LangGraph, API v1)
COPY . .

# Port d'écoute exposé pour RunPod et reverse proxies
EXPOSE 8000

# Healthcheck natif Docker
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Lancement d'Uvicorn avec 1 worker (état agentique, SSE streaming & verrous mémoire stables)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--timeout-keep-alive", "75"]

