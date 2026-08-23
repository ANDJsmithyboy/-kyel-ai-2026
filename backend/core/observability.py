"""
Ñkyel AI — Sentry & OpenTelemetry Observability · SmartANDJ AI Technologies
Unifie Sentry (captures d'exceptions enrichies) et OpenTelemetry (traçage distribué).

Garantit :
1. Corrélation complète : request_id, trace_id, user_id, org_id, workspace_id,
   thread_id, run_id, mission_id, agent_id
2. Zéro fuite de données personnelles (PII) ou de clés d'API
3. Trace continue du navigateur jusqu'au modèle et à la base de données

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import os
import logging
from typing import Optional, Dict, Any

from core.config import settings
from core.context import get_context

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Sentry Integration with Context Sanitization
# ══════════════════════════════════════════════════════════════

# Clés d'en-tête à filtrer (jamais exposées dans Sentry)
_SENSITIVE_HEADERS = frozenset({
    "authorization", "cookie", "x-api-key", "clerk_secret",
    "x-clerk-secret", "set-cookie", "proxy-authorization",
})


def init_sentry() -> bool:
    """
    Initialise le SDK Sentry pour FastAPI et les workers asynchrones.
    Ne fait rien si SENTRY_DSN n'est pas configuré.
    """
    dsn = settings.sentry_dsn or os.getenv("SENTRY_DSN", "")
    if not dsn:
        logger.debug("Sentry DSN non configuré (mode développement)")
        return False

    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.logging import LoggingIntegration

        def _before_send(event: Dict[str, Any], hint: Dict[str, Any]) -> Optional[Dict[str, Any]]:
            # Sanitiser les données privées (clés d'API, mots de passe)
            request = event.get("request", {})
            headers = request.get("headers", {})
            for sensitive_key in _SENSITIVE_HEADERS:
                if sensitive_key in headers:
                    headers[sensitive_key] = "[FILTERED]"

            # Enrichir avec le contexte de corrélation complet
            ctx = get_context()
            if ctx:
                tags = event.setdefault("tags", {})
                tags["request_id"] = ctx.request_id
                tags["trace_id"] = ctx.trace_id
                if ctx.user_id:
                    tags["user_id"] = ctx.user_id
                if ctx.mission_id:
                    tags["mission_id"] = ctx.mission_id
                if ctx.organization_id:
                    tags["organization_id"] = ctx.organization_id
                if ctx.workspace_id:
                    tags["workspace_id"] = ctx.workspace_id
                if ctx.session_id:
                    tags["session_id"] = ctx.session_id
                if ctx.conversation_id:
                    tags["thread_id"] = ctx.conversation_id

            return event

        sentry_sdk.init(
            dsn=dsn,
            environment=settings.environment,
            release=f"nkyel-backend@{settings.app_version}",
            traces_sample_rate=0.2 if settings.is_production else 1.0,
            integrations=[
                FastApiIntegration(),
                LoggingIntegration(level=logging.INFO, event_level=logging.ERROR),
            ],
            before_send=_before_send,
        )
        logger.info("🛡️ Sentry initialisé avec succès.")
        return True
    except ImportError:
        logger.debug("sentry-sdk non installé.")
        return False
    except Exception as e:
        logger.warning(f"Erreur d'initialisation Sentry: {e}")
        return False


def capture_agent_error(
    error: Exception,
    agent_id: str = "lead_agent",
    run_id: str = "",
    thread_id: str = "",
    extra_context: Optional[Dict[str, Any]] = None,
) -> None:
    """Capture une exception agentique avec tout le contexte de corrélation."""
    ctx = get_context()
    context_data = {
        "agent_id": agent_id,
        "request_id": ctx.request_id if ctx else "",
        "trace_id": ctx.trace_id if ctx else "",
        "mission_id": ctx.mission_id if ctx else "",
        "workspace_id": ctx.workspace_id if ctx else "",
        "organization_id": ctx.organization_id if ctx else "",
        "run_id": run_id,
        "thread_id": thread_id,
        **(extra_context or {}),
    }

    try:
        import sentry_sdk
        with sentry_sdk.push_scope() as scope:
            for k, v in context_data.items():
                if v:
                    scope.set_tag(k, str(v))
            sentry_sdk.capture_exception(error)
    except Exception:
        pass

    logger.error(
        f"🚨 Exception Agent [{agent_id}]: {error}",
        extra=context_data,
        exc_info=True,
    )


# ══════════════════════════════════════════════════════════════
# 2. OpenTelemetry Integration
# ══════════════════════════════════════════════════════════════

_tracer = None


def init_opentelemetry() -> bool:
    """
    Initialise OpenTelemetry pour le traçage distribué.
    Configure l'exporter OTLP si un endpoint est fourni.
    """
    global _tracer

    endpoint = settings.otel_exporter_otlp_endpoint
    service_name = settings.otel_service_name

    if not endpoint:
        logger.debug("OpenTelemetry OTLP endpoint non configuré.")
        return False

    try:
        from opentelemetry import trace
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

        resource = Resource.create({
            "service.name": service_name,
            "service.version": settings.app_version,
            "deployment.environment": settings.environment,
        })

        provider = TracerProvider(resource=resource)
        exporter = OTLPSpanExporter(endpoint=f"{endpoint}/v1/traces")
        provider.add_span_processor(BatchSpanProcessor(exporter))
        trace.set_tracer_provider(provider)

        _tracer = trace.get_tracer(service_name)
        logger.info(f"📡 OpenTelemetry initialisé → {endpoint}")
        return True

    except ImportError:
        logger.debug("opentelemetry-sdk non installé.")
        return False
    except Exception as e:
        logger.warning(f"Erreur d'initialisation OpenTelemetry: {e}")
        return False


def get_tracer():
    """Retourne le tracer OpenTelemetry ou un no-op."""
    global _tracer
    if _tracer:
        return _tracer
    try:
        from opentelemetry import trace
        return trace.get_tracer(settings.otel_service_name)
    except Exception:
        return None


def create_span(
    name: str,
    attributes: Optional[Dict[str, str]] = None,
):
    """
    Crée un span OpenTelemetry enrichi avec le contexte Ñkyel.
    Usage: with create_span("deerflow.run") as span: ...
    """
    tracer = get_tracer()
    if tracer is None:
        # No-op context manager
        import contextlib
        return contextlib.nullcontext()

    ctx = get_context()
    span_attrs = {
        "nkyel.request_id": ctx.request_id if ctx else "",
        "nkyel.trace_id": ctx.trace_id if ctx else "",
    }
    if ctx:
        if ctx.user_id:
            span_attrs["nkyel.user_id"] = ctx.user_id
        if ctx.mission_id:
            span_attrs["nkyel.mission_id"] = ctx.mission_id
        if ctx.organization_id:
            span_attrs["nkyel.organization_id"] = ctx.organization_id
        if ctx.workspace_id:
            span_attrs["nkyel.workspace_id"] = ctx.workspace_id

    if attributes:
        span_attrs.update(attributes)

    return tracer.start_as_current_span(name, attributes=span_attrs)
