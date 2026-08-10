"""
GabomaGPT · error_handler.py · SmartANDJ AI Technologies
Gestionnaire d'erreurs culturel — Circuit Breaker + Rate Limiter + Messages gabonais
L'utilisateur ne voit JAMAIS un message technique
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import time
from collections import defaultdict
from typing import Optional
import logging

logger = logging.getLogger("gabomagpt")

# ── MESSAGES CULTURELS GABONAIS ─────────────────────────────
CULTURAL_ERRORS = {
    400: {
        "message": "Je n'ai pas bien compris ta demande, frère. Reformule et on repart ensemble.",
        "icon": "🌿",
        "action": "reformulate",
        "retry": False,
    },
    401: {
        "message": "Tu dois te connecter pour entrer dans la forêt de GabomaGPT.",
        "icon": "🔒",
        "action": "login",
        "retry": False,
    },
    402: {
        "message": "Tes jetons sont épuisés, frère. Recharge pour continuer l'expédition.",
        "icon": "⚡",
        "action": "payment",
        "retry": False,
    },
    403: {
        "message": "Cette zone de la forêt est réservée. Upgrade ton plan pour y accéder.",
        "icon": "⚫",
        "action": "upgrade",
        "retry": False,
    },
    404: {
        "message": "Les esprits n'ont pas trouvé ce que tu cherches. La piste s'arrête ici.",
        "icon": "🌫️",
        "action": "retry",
        "retry": False,
    },
    408: {
        "message": "Les esprits de la forêt exigent de la patience pour cette requête. Les racines de l'Iboga cherchent plus profondément. Laisse-moi un instant.",
        "icon": "🌿",
        "action": "retry",
        "retry": True,
        "retry_after": 10,
    },
    429: {
        "message": "Le village est très animé aujourd'hui. Laisse le temps aux anciens de reprendre leur souffle, et pose ta question à nouveau.",
        "icon": "🌳",
        "action": "retry",
        "retry": True,
        "retry_after": 60,
    },
    500: {
        "message": "La saison des pluies a effacé nos pistes. La Panthère se replie un instant. On reprend la traque dans quelques minutes.",
        "icon": "🌧️",
        "action": "retry",
        "retry": True,
        "retry_after": 30,
    },
    502: {
        "message": "Le pont de lianes vers la banque est temporairement instable. Je sécurise tes jetons. On retente la traversée dans quelques instants.",
        "icon": "🌉",
        "action": "retry",
        "retry": True,
        "retry_after": 15,
    },
    503: {
        "message": "GabomaGPT est en retraite initiatique. Le système se renforce dans la forêt sacrée. Retour de la Panthère sous peu, plus puissante que jamais.",
        "icon": "⚫",
        "action": "maintenance",
        "retry": True,
        "retry_after": 120,
    },
    "api_error": {
        "message": "Le pont de lianes vers la source est temporairement instable. On sécurise la zone et on retente la traversée.",
        "icon": "🌿",
        "action": "retry",
        "retry": True,
        "retry_after": 20,
    },
    "payment_error": {
        "message": "Le pont de lianes vers la banque est instable. Je sécurise tes jetons. On retente la traversée dans quelques instants.",
        "icon": "🌉",
        "action": "retry_payment",
        "retry": True,
        "retry_after": 10,
    },
    "tokens_depleted": {
        "message": "Tes jetons sont épuisés, frère. L'expédition continue avec un rechargement.",
        "icon": "⚡",
        "action": "payment",
        "retry": False,
    },
}


# ── CIRCUIT BREAKER ─────────────────────────────────────────
class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, reset_timeout: int = 30):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failures: dict[str, list[float]] = defaultdict(list)
        self.open_until: dict[str, float] = {}

    def is_open(self, service: str) -> bool:
        if service in self.open_until:
            if time.time() < self.open_until[service]:
                return True
            else:
                del self.open_until[service]
                self.failures[service] = []
        return False

    def record_failure(self, service: str):
        now = time.time()
        self.failures[service] = [
            t for t in self.failures[service] if now - t < 60
        ]
        self.failures[service].append(now)
        if len(self.failures[service]) >= self.failure_threshold:
            self.open_until[service] = now + self.reset_timeout
            logger.warning(f"Circuit OUVERT pour {service} — {self.reset_timeout}s")

    def record_success(self, service: str):
        self.failures[service] = []


circuit_breaker = CircuitBreaker()


# ── RATE LIMITER PAR UTILISATEUR ────────────────────────────
class UserRateLimiter:
    def __init__(self):
        self.requests: dict[str, list[float]] = defaultdict(list)
        self.limits = {
            "flash": 10,
            "pro": 30,
            "elite": 60,
            "panther": 100,
            "panther_pro": 200,
        }

    def is_allowed(self, user_id: str, plan: str) -> tuple[bool, int]:
        now = time.time()
        limit = self.limits.get(plan, 10)
        self.requests[user_id] = [
            t for t in self.requests[user_id] if now - t < 60
        ]
        if len(self.requests[user_id]) >= limit:
            oldest = self.requests[user_id][0]
            retry_after = int(60 - (now - oldest)) + 1
            return False, retry_after
        self.requests[user_id].append(now)
        return True, 0


rate_limiter = UserRateLimiter()


# ── FORMATAGE RÉPONSE ERREUR ────────────────────────────────
def format_error_response(code, request_id: Optional[str] = None) -> dict:
    error = CULTURAL_ERRORS.get(code, CULTURAL_ERRORS[500])
    response = {
        "success": False,
        "error": {
            "code": code,
            "message": error["message"],
            "icon": error["icon"],
            "action": error["action"],
            "retry": error.get("retry", False),
            "retry_after": error.get("retry_after", 0),
        },
    }
    if request_id:
        response["request_id"] = request_id
    return response


# ── EXCEPTION HANDLERS FASTAPI ──────────────────────────────
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(exc.status_code),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=format_error_response(400),
    )


async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Exception non gérée: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=format_error_response(500),
    )
