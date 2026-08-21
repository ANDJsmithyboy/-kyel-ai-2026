# Ñkyel AI — Makefile Universel de Production & Développement
# SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

.PHONY: install dev test build production health backup restore clean help

help:
	@echo "======================================================================"
	@echo "Ñkyel AI × DeerFlow 2.0 — Commandes Principales"
	@echo "======================================================================"
	@echo "  make install     Installe les dépendances Python et Node.js"
	@echo "  make dev         Lance le backend FastAPI et le frontend Next.js en dev"
	@echo "  make test        Exécute la suite complète de tests de validation (100%)"
	@echo "  make build       Compile le frontend Next.js et vérifie les types"
	@echo "  make production  Démarre l'infrastructure complète de production Docker"
	@echo "  make health      Exécute le bilan de santé complet de tous les services"
	@echo "  make backup      Sauvegarde la base Neon vers Cloudflare R2"
	@echo "  make restore     Restaure la base depuis un instantané R2"
	@echo "  make clean       Nettoie les caches __pycache__, .pytest_cache et .next"

install:
	@echo "📦 Installation des dépendances Backend & Frontend..."
	pip install -r requirements.txt
	cd ZION-CORE-V2 && pnpm install

dev:
	@echo "🚀 Démarrage en mode Développement..."
	python backend/main.py &
	cd ZION-CORE-V2 && pnpm dev

test:
	@echo "🧪 Exécution des suites de validation..."
	python -m pytest tests/backend/test_storage_architecture.py -v
	python -m pytest tests/backend/test_multimedia_e2e.py -v
	python -m pytest tests/backend/test_wide_research.py -v
	python scripts/test_e2e_acceptance.py

build:
	@echo "🏗️ Compilation du Frontend Next.js..."
	cd ZION-CORE-V2 && pnpm build

production:
	@echo "🌍 Démarrage de la stack de Production..."
	docker compose -f docker-compose.production.yml up -d --build

health:
	@echo "🩺 Bilan de santé des services..."
	bash scripts/healthcheck.sh

backup:
	@echo "💾 Exécution de la sauvegarde Neon vers Cloudflare R2..."
	bash scripts/backup.sh

restore:
	@echo "🔄 Restauration de la sauvegarde..."
	bash scripts/restore.sh

clean:
	@echo "🧹 Nettoyage des caches..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	rm -rf ZION-CORE-V2/.next
