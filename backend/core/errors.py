"""
Ñkyel AI — Erreurs de Domaine · SmartANDJ AI Technologies
Modèle d'erreur standardisé pour toutes les couches du backend.
Aucune fuite de stacktrace ou d'information interne vers le client.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

from enum import Enum
from typing import Optional, Any
from dataclasses import dataclass, field

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_408_REQUEST_TIMEOUT,
    HTTP_422_UNPROCESSABLE_ENTITY,
    HTTP_429_TOO_MANY_REQUESTS,
    HTTP_500_INTERNAL_SERVER_ERROR,
    HTTP_502_BAD_GATEWAY,
    HTTP_503_SERVICE_UNAVAILABLE,
)


# ── Codes d'erreur de domaine ────────────────────────────────

class NkyelErrorCode(str, Enum):
    """Codes d'erreur métier stricts et stables de Ñkyel AI."""

    # Auth & Identity
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR"
    SESSION_EXPIRED = "SESSION_EXPIRED"

    # Rate & Quotas
    RATE_LIMITED = "RATE_LIMITED"
    BUDGET_EXCEEDED = "BUDGET_EXCEEDED"
    CREDITS_EXHAUSTED = "CREDITS_EXHAUSTED"
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED"

    # Input
    INVALID_INPUT = "INVALID_INPUT"
    VALIDATION_ERROR = "VALIDATION_ERROR"

    # Resources
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    CONVERSATION_NOT_FOUND = "CONVERSATION_NOT_FOUND"
    MISSION_NOT_FOUND = "MISSION_NOT_FOUND"

    # Model & Provider
    MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE"
    MODEL_TIMEOUT = "MODEL_TIMEOUT"
    PROVIDER_ERROR = "PROVIDER_ERROR"
    ALL_PROVIDERS_FAILED = "ALL_PROVIDERS_FAILED"

    # Tool & Agent
    TOOL_FAILED = "TOOL_FAILED"
    TOOL_TIMEOUT = "TOOL_TIMEOUT"
    TOOL_DENIED = "TOOL_DENIED"
    AGENT_ERROR = "AGENT_ERROR"

    # Mission Lifecycle
    MISSION_TIMEOUT = "MISSION_TIMEOUT"
    MISSION_CANCELLED = "MISSION_CANCELLED"

    # System
    INTERNAL_ERROR = "INTERNAL_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"


# ── Mapping Code → HTTP Status ───────────────────────────────

_CODE_TO_HTTP: dict[NkyelErrorCode, int] = {
    NkyelErrorCode.AUTHENTICATION_ERROR: HTTP_401_UNAUTHORIZED,
    NkyelErrorCode.AUTHORIZATION_ERROR: HTTP_403_FORBIDDEN,
    NkyelErrorCode.SESSION_EXPIRED: HTTP_401_UNAUTHORIZED,
    NkyelErrorCode.RATE_LIMITED: HTTP_429_TOO_MANY_REQUESTS,
    NkyelErrorCode.BUDGET_EXCEEDED: HTTP_429_TOO_MANY_REQUESTS,
    NkyelErrorCode.CREDITS_EXHAUSTED: HTTP_429_TOO_MANY_REQUESTS,
    NkyelErrorCode.QUOTA_EXCEEDED: HTTP_429_TOO_MANY_REQUESTS,
    NkyelErrorCode.INVALID_INPUT: HTTP_400_BAD_REQUEST,
    NkyelErrorCode.VALIDATION_ERROR: HTTP_422_UNPROCESSABLE_ENTITY,
    NkyelErrorCode.RESOURCE_NOT_FOUND: HTTP_404_NOT_FOUND,
    NkyelErrorCode.CONVERSATION_NOT_FOUND: HTTP_404_NOT_FOUND,
    NkyelErrorCode.MISSION_NOT_FOUND: HTTP_404_NOT_FOUND,
    NkyelErrorCode.MODEL_UNAVAILABLE: HTTP_503_SERVICE_UNAVAILABLE,
    NkyelErrorCode.MODEL_TIMEOUT: HTTP_408_REQUEST_TIMEOUT,
    NkyelErrorCode.PROVIDER_ERROR: HTTP_502_BAD_GATEWAY,
    NkyelErrorCode.ALL_PROVIDERS_FAILED: HTTP_503_SERVICE_UNAVAILABLE,
    NkyelErrorCode.TOOL_FAILED: HTTP_500_INTERNAL_SERVER_ERROR,
    NkyelErrorCode.TOOL_TIMEOUT: HTTP_408_REQUEST_TIMEOUT,
    NkyelErrorCode.TOOL_DENIED: HTTP_403_FORBIDDEN,
    NkyelErrorCode.AGENT_ERROR: HTTP_500_INTERNAL_SERVER_ERROR,
    NkyelErrorCode.MISSION_TIMEOUT: HTTP_408_REQUEST_TIMEOUT,
    NkyelErrorCode.MISSION_CANCELLED: HTTP_400_BAD_REQUEST,
    NkyelErrorCode.INTERNAL_ERROR: HTTP_500_INTERNAL_SERVER_ERROR,
    NkyelErrorCode.DATABASE_ERROR: HTTP_503_SERVICE_UNAVAILABLE,
    NkyelErrorCode.SERVICE_UNAVAILABLE: HTTP_503_SERVICE_UNAVAILABLE,
}


# ── Exception de domaine ─────────────────────────────────────

@dataclass
class NkyelAPIError(Exception):
    """
    Exception de domaine structurée.
    Sérialisable en JSON propre sans fuite d'informations internes.
    """

    code: NkyelErrorCode
    message: str
    detail: Optional[str] = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        super().__init__(self.message)

    @property
    def http_status(self) -> int:
        return _CODE_TO_HTTP.get(self.code, HTTP_500_INTERNAL_SERVER_ERROR)

    def to_response_body(self) -> dict:
        """Corps de réponse JSON sécurisé (aucune stacktrace)."""
        body: dict[str, Any] = {
            "error": True,
            "code": self.code.value,
            "message": self.message,
        }
        if self.detail:
            body["detail"] = self.detail
        if self.metadata:
            body["metadata"] = self.metadata
        return body

    def to_response(self) -> JSONResponse:
        """Crée directement un JSONResponse FastAPI."""
        return JSONResponse(
            status_code=self.http_status,
            content=self.to_response_body(),
        )


# ── FastAPI Exception Handler ────────────────────────────────

async def nkyel_error_handler(request: Request, exc: NkyelAPIError) -> JSONResponse:
    """
    Handler FastAPI global pour NkyelAPIError.
    Enregistre à app.add_exception_handler(NkyelAPIError, nkyel_error_handler).
    """
    import logging
    logger = logging.getLogger("nkyel.errors")

    # Log interne avec détail complet
    log_data = {
        "code": exc.code.value,
        "message": exc.message,
        "path": str(request.url),
        "method": request.method,
    }
    if exc.detail:
        log_data["detail"] = exc.detail
    if exc.metadata:
        log_data["metadata"] = exc.metadata

    # Essayer d'ajouter le contexte de requête
    try:
        from core.context import get_context
        ctx = get_context()
        log_data.update(ctx.to_log_dict())
    except Exception:
        pass

    if exc.http_status >= 500:
        logger.error("NkyelAPIError", extra=log_data)
    else:
        logger.warning("NkyelAPIError", extra=log_data)

    return exc.to_response()


# ── Factory Helpers ──────────────────────────────────────────

def auth_error(message: str = "Authentification requise") -> NkyelAPIError:
    return NkyelAPIError(code=NkyelErrorCode.AUTHENTICATION_ERROR, message=message)


def forbidden(message: str = "Accès interdit") -> NkyelAPIError:
    return NkyelAPIError(code=NkyelErrorCode.AUTHORIZATION_ERROR, message=message)


def not_found(resource: str = "Ressource", identifier: str = "") -> NkyelAPIError:
    msg = f"{resource} introuvable"
    if identifier:
        msg += f" : {identifier}"
    return NkyelAPIError(code=NkyelErrorCode.RESOURCE_NOT_FOUND, message=msg)


def rate_limited(
    message: str = "Limite de requêtes atteinte",
    retry_after_seconds: Optional[int] = None,
) -> NkyelAPIError:
    meta = {}
    if retry_after_seconds:
        meta["retry_after_seconds"] = retry_after_seconds
    return NkyelAPIError(
        code=NkyelErrorCode.RATE_LIMITED, message=message, metadata=meta
    )


def model_unavailable(
    model: str, provider: str = "", reason: str = ""
) -> NkyelAPIError:
    return NkyelAPIError(
        code=NkyelErrorCode.MODEL_UNAVAILABLE,
        message=f"Modèle {model} temporairement indisponible",
        detail=reason or None,
        metadata={"model": model, "provider": provider} if provider else {"model": model},
    )


def budget_exceeded(
    current_cost: float, max_budget: float, currency: str = "USD"
) -> NkyelAPIError:
    return NkyelAPIError(
        code=NkyelErrorCode.BUDGET_EXCEEDED,
        message=f"Budget dépassé ({current_cost:.4f} {currency} / {max_budget:.4f} {currency})",
        metadata={
            "current_cost": current_cost,
            "max_budget": max_budget,
            "currency": currency,
        },
    )


def tool_failed(tool_name: str, reason: str = "") -> NkyelAPIError:
    return NkyelAPIError(
        code=NkyelErrorCode.TOOL_FAILED,
        message=f"L'outil {tool_name} a échoué",
        detail=reason or None,
        metadata={"tool": tool_name},
    )
