# GabomaGPT API Gateway

SmartANDJ AI Technologies · Constitution Zion Core  
Fondateur: Daniel Jonathan ANDJ

Gateway FastAPI pour GabomaGPT - Point d'entrée unique pour l'app Android

## Architecture

```
[App Android Kotlin]
       ↓ HTTPS + SSE
[FastAPI Gateway — gabomagpt.andjanalytics.com/api]
       ↓ Auth + RAG          ↓ Agentic tasks
[Open WebUI headless]    [Deer Flow Engine]
       ↓ Paiement
[E-Billing API — billing-easy.net]
       ↓ USSD Push
[Téléphone utilisateur — PIN Airtel/Moov]
```

## Installation

```bash
# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Copier le fichier .env.example
cp .env.example .env

# Éditer .env avec vos clés API
```

## Lancement

```bash
# Développement
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Endpoints

### Documentation
- `GET /api/docs` - Swagger UI
- `GET /api/redoc` - ReDoc

### Health
- `GET /health` - Health check

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Connexion téléphone + OTP
- `POST /api/auth/register` - Inscription
- `POST /api/auth/send-otp` - Envoyer OTP par SMS
- `POST /api/auth/google` - Auth Google OAuth
- `POST /api/auth/refresh` - Renouveler token
- `POST /api/auth/logout` - Déconnexion

### Chat (`/api/chat`)
- `POST /api/chat/` - Créer conversation (synchrone)
- `POST /api/chat/stream` - Streaming SSE
- `GET /api/chat/{conversation_id}` - Récupérer conversation
- `DELETE /api/chat/{conversation_id}` - Supprimer conversation
- `GET /api/chat/` - Lister conversations

### Payments (`/api/payments`)
- `POST /api/payments/initiate` - Initier paiement USSD
- `POST /api/payments/callback` - Webhook E-Billing
- `GET /api/payments/status/{payment_id}` - Statut paiement
- `GET /api/payments/plans` - Plans disponibles

### Tiers (`/api/tiers`)
- `GET /api/tiers/user/{user_id}` - Tier utilisateur
- `GET /api/tiers/` - Lister tous les tiers
- `POST /api/tiers/user/{user_id}/upgrade` - Upgrade tier (admin)
- `GET /api/tiers/user/{user_id}/tokens` - Tokens restants

## Modes GabomaGPT

L'UI n'affiche JAMAIS les noms de modèles tiers. Les utilisateurs voient :

- **GabomaGPT Flash** → rapide, réponses instantanées (gratuit)
- **GabomaGPT Pro** → raisonnement avancé (abonnement)
- **GabomaGPT Black Panther** → agent autonome, paiements & web (premium)

## Règle Absolue

L'app Android ne parle JAMAIS directement à Open WebUI ou E-Billing.  
TOUT passe par ce FastAPI Gateway.
