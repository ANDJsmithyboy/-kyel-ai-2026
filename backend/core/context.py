"""
Ñkyel AI — Request Context · SmartANDJ AI Technologies
Contexte de requête thread-safe et asyncio-safe via contextvars.
Propage trace_id, request_id, user_id, tenant isolation à travers tout le backend.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import uuid
import time
from contextvars import ContextVar
from dataclasses import dataclass, field
from typing import Optional

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response


# ── Context Object ───────────────────────────────────────────

@dataclass
class RequestContext:
    """Contexte immutable propagé à travers une requête ou mission agentique."""

    # Identifiants de corrélation
    request_id: str = field(default_factory=lambda: f"req_{uuid.uuid4().hex[:12]}")
    trace_id: str = field(default_factory=lambda: f"trc_{uuid.uuid4().hex[:16]}")

    # Identité utilisateur & tenant
    user_id: Optional[str] = None
    organization_id: Optional[str] = None
    workspace_id: Optional[str] = None

    # Mission & session agentique
    mission_id: Optional[str] = None
    session_id: Optional[str] = None
    conversation_id: Optional[str] = None

    # Métadonnées de requête
    locale: str = "fr"
    client_ip: Optional[str] = None
    user_agent: Optional[str] = None

    # Timing
    started_at: float = field(default_factory=time.time)

    @property
    def elapsed_ms(self) -> int:
        """Temps écoulé depuis le début de la requête en millisecondes."""
        return int((time.time() - self.started_at) * 1000)

    def with_mission(self, mission_id: str) -> "RequestContext":
        """Retourne un nouveau contexte enrichi avec un mission_id."""
        return RequestContext(
            request_id=self.request_id,
            trace_id=self.trace_id,
            user_id=self.user_id,
            organization_id=self.organization_id,
            workspace_id=self.workspace_id,
            mission_id=mission_id,
            session_id=self.session_id,
            conversation_id=self.conversation_id,
            locale=self.locale,
            client_ip=self.client_ip,
            user_agent=self.user_agent,
            started_at=self.started_at,
        )

    def to_headers(self) -> dict[str, str]:
        """Sérialise le contexte en en-têtes HTTP pour propagation inter-services."""
        headers = {
            "X-Request-ID": self.request_id,
            "X-Trace-ID": self.trace_id,
        }
        if self.mission_id:
            headers["X-Mission-ID"] = self.mission_id
        if self.user_id:
            headers["X-User-ID"] = self.user_id
        if self.organization_id:
            headers["X-Organization-ID"] = self.organization_id
        return headers

    def to_log_dict(self) -> dict:
        """Champs de contexte à injecter dans chaque ligne de log structuré."""
        d: dict = {
            "request_id": self.request_id,
            "trace_id": self.trace_id,
        }
        if self.user_id:
            d["user_id"] = self.user_id
        if self.mission_id:
            d["mission_id"] = self.mission_id
        if self.organization_id:
            d["organization_id"] = self.organization_id
        if self.workspace_id:
            d["workspace_id"] = self.workspace_id
        return d


# ── ContextVar Singleton ─────────────────────────────────────

_request_ctx_var: ContextVar[Optional[RequestContext]] = ContextVar(
    "nkyel_request_context", default=None
)


def get_context() -> RequestContext:
    """Récupère le contexte de la requête courante. Crée un contexte vide si absent."""
    ctx = _request_ctx_var.get()
    if ctx is None:
        ctx = RequestContext()
        _request_ctx_var.set(ctx)
    return ctx


def set_context(ctx: RequestContext) -> None:
    """Définit le contexte de la requête courante."""
    _request_ctx_var.set(ctx)


def clear_context() -> None:
    """Nettoie le contexte à la fin d'une requête."""
    _request_ctx_var.set(None)


# ── FastAPI Middleware ───────────────────────────────────────

class NkyelContextMiddleware(BaseHTTPMiddleware):
    """
    Middleware FastAPI qui :
    1. Extrait ou génère request_id / trace_id depuis les en-têtes
    2. Injecte le RequestContext dans contextvars
    3. Ajoute les en-têtes de corrélation à la réponse
    4. Nettoie le contexte après la requête
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Extraire ou générer les identifiants de corrélation
        request_id = (
            request.headers.get("X-Request-ID")
            or f"req_{uuid.uuid4().hex[:12]}"
        )
        trace_id = (
            request.headers.get("X-Trace-ID")
            or f"trc_{uuid.uuid4().hex[:16]}"
        )
        mission_id = request.headers.get("X-Mission-ID")

        # Extraire l'identité utilisateur (sera enrichie par le middleware d'auth)
        user_id = request.headers.get("X-User-ID")

        # Déterminer la locale depuis Accept-Language
        accept_lang = request.headers.get("Accept-Language", "fr")
        locale = accept_lang.split(",")[0].split("-")[0].strip() or "fr"

        # Créer et injecter le contexte
        ctx = RequestContext(
            request_id=request_id,
            trace_id=trace_id,
            user_id=user_id,
            mission_id=mission_id,
            locale=locale,
            client_ip=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent"),
        )
        set_context(ctx)

        try:
            response = await call_next(request)

            # Ajouter les en-têtes de corrélation à la réponse
            response.headers["X-Request-ID"] = ctx.request_id
            response.headers["X-Trace-ID"] = ctx.trace_id
            response.headers["X-Response-Time-Ms"] = str(ctx.elapsed_ms)

            return response
        finally:
            clear_context()
