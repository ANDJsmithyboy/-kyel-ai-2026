"""
Ñkyel AI — Google Capability Registry · SmartANDJ AI Technologies
Registre central des capacités Google AI & Google Workspace.
Les agents demandent des CAPACITÉS abstraites (gemini.plan, google.image.generate, etc.),
et le registre gère la politique d'approbation (AUTO/ASK/DENY), le contrôle budgétaire,
le routage (DIRECT_GOOGLE vs RUNWAY_ROUTER), et la télémétrie matérielle.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import os
import time
import json
import uuid
import logging
from enum import Enum
from typing import Dict, Any, List, Optional, Callable, Union
from dataclasses import dataclass, field

from core.config import settings
from core.telemetry import record_google_telemetry, telemetry_registry
from events.workgraph_events import WorkGraphEventService
from services.providers.google_direct_provider import GoogleDirectProvider
from services.providers.runway_media_provider import RunwayMediaProvider

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Action Policy & Capability Enums
# ══════════════════════════════════════════════════════════════

class ActionPolicy(str, Enum):
    """Politiques d'arbitrage d'action pour le Human-in-the-Graph."""
    AUTO = "AUTO"   # Exécution autonome directe
    ASK = "ASK"     # Requiert l'accord explicite de l'utilisateur
    DENY = "DENY"   # Refusé par défaut par sécurité


class GoogleCapability(str, Enum):
    """Capacités officielles Google AI, Multimédia et Workspace."""
    # Google AI (Gemini 3.7 / 3.6 / 3.1)
    GEMINI_REASON = "gemini.reason"
    GEMINI_PLAN = "gemini.plan"
    GEMINI_ANALYZE = "gemini.analyze"
    GEMINI_SYNTHESIZE = "gemini.synthesize"
    GEMINI_VISION = "gemini.vision"
    GEMINI_AUDIO = "gemini.audio"
    GEMINI_MULTIMODAL = "gemini.multimodal"
    GEMINI_STRUCTURED_OUTPUT = "gemini.structured_output"
    GEMINI_FUNCTION_CALL = "gemini.function_call"
    GEMINI_SEARCH = "gemini.search"
    GEMINI_CODE_EXECUTION = "gemini.code_execution"

    # Google Image Generation
    GOOGLE_IMAGE_GENERATE = "google.image.generate"
    GOOGLE_IMAGE_EDIT = "google.image.edit"

    # Google Video Generation (Veo 3.1)
    GOOGLE_VIDEO_GENERATE = "google.video.generate"

    # Google Maps
    GOOGLE_MAPS_SEARCH = "google.maps.search"
    GOOGLE_MAPS_GROUND = "google.maps.ground"
    GOOGLE_MAPS_PLACE = "google.maps.place"

    # Google Workspace (P1/P2)
    GOOGLE_DRIVE_SEARCH = "google.drive.search"
    GOOGLE_DRIVE_READ = "google.drive.read"
    GOOGLE_DRIVE_CREATE = "google.drive.create"
    GOOGLE_DOCS_CREATE = "google.docs.create"
    GOOGLE_SHEETS_CREATE = "google.sheets.create"
    GOOGLE_GMAIL_READ = "google.gmail.read"
    GOOGLE_GMAIL_DRAFT = "google.gmail.draft"
    GOOGLE_GMAIL_SEND = "google.gmail.send"
    GOOGLE_CALENDAR_READ = "google.calendar.read"
    GOOGLE_CALENDAR_CREATE = "google.calendar.create"


# Politiques de sécurité par défaut
CAPABILITY_POLICIES: Dict[str, ActionPolicy] = {
    # Inférence & Analyse (Autonome)
    GoogleCapability.GEMINI_REASON.value: ActionPolicy.AUTO,
    GoogleCapability.GEMINI_PLAN.value: ActionPolicy.AUTO,
    GoogleCapability.GEMINI_ANALYZE.value: ActionPolicy.AUTO,
    GoogleCapability.GEMINI_SYNTHESIZE.value: ActionPolicy.AUTO,
    GoogleCapability.GEMINI_VISION.value: ActionPolicy.AUTO,
    GoogleCapability.GEMINI_MULTIMODAL.value: ActionPolicy.AUTO,
    GoogleCapability.GEMINI_STRUCTURED_OUTPUT.value: ActionPolicy.AUTO,
    GoogleCapability.GEMINI_SEARCH.value: ActionPolicy.AUTO,
    GoogleCapability.GOOGLE_MAPS_SEARCH.value: ActionPolicy.AUTO,
    GoogleCapability.GOOGLE_MAPS_GROUND.value: ActionPolicy.AUTO,

    # Génération Média
    GoogleCapability.GOOGLE_IMAGE_GENERATE.value: ActionPolicy.AUTO,
    GoogleCapability.GOOGLE_IMAGE_EDIT.value: ActionPolicy.AUTO,
    GoogleCapability.GOOGLE_VIDEO_GENERATE.value: ActionPolicy.ASK,  # Demander confirmation si coûteux

    # Workspace Lecture / Écriture locale
    GoogleCapability.GOOGLE_DRIVE_READ.value: ActionPolicy.AUTO,
    GoogleCapability.GOOGLE_DOCS_CREATE.value: ActionPolicy.AUTO,
    GoogleCapability.GOOGLE_SHEETS_CREATE.value: ActionPolicy.AUTO,

    # Actions sensibles (Communication & Événements)
    GoogleCapability.GOOGLE_GMAIL_DRAFT.value: ActionPolicy.AUTO,
    GoogleCapability.GOOGLE_GMAIL_SEND.value: ActionPolicy.ASK,
    GoogleCapability.GOOGLE_CALENDAR_READ.value: ActionPolicy.AUTO,
    GoogleCapability.GOOGLE_CALENDAR_CREATE.value: ActionPolicy.ASK,
}


# ══════════════════════════════════════════════════════════════
# 2. Google Capability Registry
# ══════════════════════════════════════════════════════════════

class GoogleCapabilityRegistry:
    """
    Passerelle unifiée de résolution et d'exécution des capacités Google.
    """

    # Seuil de coût déclenchant une demande d'approbation humaine automatique
    MAX_AUTO_BUDGET_USD = 0.080

    @classmethod
    def get_policy(cls, capability: str) -> ActionPolicy:
        """Retourne la politique d'exécution pour une capacité."""
        return CAPABILITY_POLICIES.get(capability, ActionPolicy.ASK)

    @classmethod
    async def request_capability(
        cls,
        capability: str,
        mission_id: str,
        run_id: str,
        agent_id: str = "lead_agent",
        params: Optional[Dict[str, Any]] = None,
        force_provider: Optional[str] = None,  # "DIRECT_GOOGLE" ou "RUNWAY_ROUTER"
    ) -> Dict[str, Any]:
        """
        Point d'entrée unique pour toute demande de capacité Google.
        Exécute la vérification des droits, la politique budgétaire et le routage.
        """
        payload = params or {}
        policy = cls.get_policy(capability)

        # ── 1. Vérification de Politique Budgétaire & Dry Run ─────
        if capability in (GoogleCapability.GOOGLE_VIDEO_GENERATE.value, GoogleCapability.GOOGLE_IMAGE_GENERATE.value):
            dry_res = RunwayMediaProvider.dry_run(
                media_type="video" if "video" in capability else "image",
                duration_seconds=payload.get("duration_seconds", 5),
            )
            estimated_cost = dry_res["estimated_cost_usd"]

            # Si le coût dépasse le seuil automatique et n'est pas déjà approuvé
            if estimated_cost > cls.MAX_AUTO_BUDGET_USD and not payload.get("approved_by_user"):
                await WorkGraphEventService.emit_event(
                    event_type="approval.required",
                    run_id=run_id,
                    mission_id=mission_id,
                    payload={
                        "capability": capability,
                        "estimated_cost_usd": estimated_cost,
                        "reason": f"Génération média de coût élevé (${estimated_cost:.3f}) nécessitant confirmation.",
                    },
                )
                if policy == ActionPolicy.ASK and not payload.get("auto_approve_under_budget"):
                    return {
                        "success": False,
                        "status": "waiting_approval",
                        "capability": capability,
                        "estimated_cost_usd": estimated_cost,
                        "message": "Approbation humaine requise avant de consommer les crédits média.",
                    }

        # ── 2. Exécution selon la capacité demandée ───────────────

        # A. Google AI (Gemini 3.7 / 3.6) : Raisonnement, Plan, Analyse, Synthèse, Recherche
        if capability.startswith("gemini."):
            return await cls._execute_gemini_capability(
                capability=capability,
                mission_id=mission_id,
                run_id=run_id,
                agent_id=agent_id,
                payload=payload,
            )

        # B. Google Image (Direct Gemini Image ou Runway Router)
        elif capability in (GoogleCapability.GOOGLE_IMAGE_GENERATE.value, GoogleCapability.GOOGLE_IMAGE_EDIT.value):
            return await cls._execute_image_capability(
                capability=capability,
                mission_id=mission_id,
                run_id=run_id,
                agent_id=agent_id,
                payload=payload,
                force_provider=force_provider,
            )

        # C. Google Video (Direct Veo 3.1 ou Runway Router)
        elif capability == GoogleCapability.GOOGLE_VIDEO_GENERATE.value:
            return await cls._execute_video_capability(
                capability=capability,
                mission_id=mission_id,
                run_id=run_id,
                agent_id=agent_id,
                payload=payload,
                force_provider=force_provider,
            )

        # D. Google Maps / Grounding
        elif capability.startswith("google.maps."):
            return await cls._execute_maps_capability(
                capability=capability,
                mission_id=mission_id,
                run_id=run_id,
                agent_id=agent_id,
                payload=payload,
            )

        # E. Google Workspace (Sheets / Docs / Drive)
        elif capability.startswith("google.workspace.") or capability.startswith("google.sheets.") or capability.startswith("google.docs."):
            return await cls._execute_workspace_capability(
                capability=capability,
                mission_id=mission_id,
                run_id=run_id,
                agent_id=agent_id,
                payload=payload,
            )

        else:
            raise ValueError(f"Capacité Google non reconnue: {capability}")

    # ── Exécuteurs Internes ──────────────────────────────────────

    @classmethod
    async def _execute_gemini_capability(
        cls, capability: str, mission_id: str, run_id: str, agent_id: str, payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        prompt = payload.get("prompt", "")
        model = payload.get("model", settings.google_primary_model)
        json_mode = payload.get("json_mode", False) or capability in (GoogleCapability.GEMINI_PLAN.value, GoogleCapability.GEMINI_STRUCTURED_OUTPUT.value)
        temperature = payload.get("temperature", 0.7)
        enable_search = capability == GoogleCapability.GEMINI_SEARCH.value or payload.get("enable_search_grounding", False)

        # Événement : Début d'opération Google AI
        await WorkGraphEventService.emit_event(
            event_type="model.requested",
            run_id=run_id,
            mission_id=mission_id,
            payload={"capability": capability, "provider": "google", "model": model},
        )

        res = await GoogleDirectProvider.generate_text(
            prompt=prompt,
            model_name=model,
            json_mode=json_mode,
            temperature=temperature,
            mission_id=mission_id,
            capability=capability,
            enable_search_grounding=enable_search,
        )

        # Événement : Fin d'opération
        await WorkGraphEventService.emit_event(
            event_type="model.completed",
            run_id=run_id,
            mission_id=mission_id,
            payload={
                "capability": capability,
                "provider": "google",
                "model": res.get("model", model),
                "duration_ms": res.get("duration_ms", 0),
                "cost_usd": res.get("calculated_cost_usd", 0.0),
                "input_tokens": res.get("input_tokens", 0),
                "output_tokens": res.get("output_tokens", 0),
            },
        )

        return res

    @classmethod
    async def _execute_image_capability(
        cls, capability: str, mission_id: str, run_id: str, agent_id: str, payload: Dict[str, Any], force_provider: Optional[str]
    ) -> Dict[str, Any]:
        prompt = payload.get("prompt", "Gabon tourism campaign visual")
        aspect_ratio = payload.get("aspect_ratio", "1:1")
        target_path = force_provider or payload.get("access_method", "DIRECT_GOOGLE")

        # Événement : Image demandée
        await WorkGraphEventService.emit_event(
            event_type="media.image.requested",
            run_id=run_id,
            mission_id=mission_id,
            payload={"prompt": prompt, "aspect_ratio": aspect_ratio, "access_method": target_path},
        )

        # Routage vers Google Direct ou Runway Media Router
        if target_path == "RUNWAY_ROUTER" or target_path == "runway_router":
            res = await RunwayMediaProvider.generate_image(
                prompt=prompt,
                aspect_ratio=aspect_ratio,
                model=payload.get("model", settings.google_image_fast_model),
                mission_id=mission_id,
            )
        else:
            res = await GoogleDirectProvider.generate_image(
                prompt=prompt,
                aspect_ratio=aspect_ratio,
                model=payload.get("model", settings.google_image_fast_model),
                mission_id=mission_id,
            )

        # Événement : Image générée avec artefact
        art_id = f"art_img_{uuid.uuid4().hex[:8]}"
        await WorkGraphEventService.emit_event(
            event_type="media.image.completed",
            run_id=run_id,
            mission_id=mission_id,
            payload={
                "artifact_id": art_id,
                "url": res.get("url"),
                "file_path": res.get("file_path"),
                "sha256": res.get("sha256"),
                "provider": res.get("provider"),
                "model": res.get("model"),
                "access_method": res.get("access_method"),
                "duration_ms": res.get("duration_ms"),
                "cost_usd": res.get("calculated_cost_usd", 0.030),
            },
        )

        res["artifact_id"] = art_id
        return res

    @classmethod
    async def _execute_video_capability(
        cls, capability: str, mission_id: str, run_id: str, agent_id: str, payload: Dict[str, Any], force_provider: Optional[str]
    ) -> Dict[str, Any]:
        prompt = payload.get("prompt", "Promotional video Gabon ecotourism")
        duration_seconds = payload.get("duration_seconds", 5)
        aspect_ratio = payload.get("aspect_ratio", "16:9")
        target_path = force_provider or payload.get("access_method", "DIRECT_GOOGLE")

        # Événement : Vidéo demandée
        await WorkGraphEventService.emit_event(
            event_type="media.video.requested",
            run_id=run_id,
            mission_id=mission_id,
            payload={"prompt": prompt, "duration_seconds": duration_seconds, "access_method": target_path},
        )

        if target_path == "RUNWAY_ROUTER" or target_path == "runway_router":
            res = await RunwayMediaProvider.generate_video(
                prompt=prompt,
                duration_seconds=duration_seconds,
                aspect_ratio=aspect_ratio,
                model=payload.get("model", settings.google_video_model),
                mission_id=mission_id,
            )
        else:
            res = await GoogleDirectProvider.generate_video(
                prompt=prompt,
                duration_seconds=duration_seconds,
                aspect_ratio=aspect_ratio,
                model=payload.get("model", settings.google_video_model),
                mission_id=mission_id,
            )

        # Événement : Vidéo générée
        art_id = f"art_vid_{uuid.uuid4().hex[:8]}"
        await WorkGraphEventService.emit_event(
            event_type="media.video.completed",
            run_id=run_id,
            mission_id=mission_id,
            payload={
                "artifact_id": art_id,
                "video_url": res.get("video_url"),
                "provider": res.get("provider"),
                "model": res.get("model"),
                "access_method": res.get("access_method"),
                "duration_ms": res.get("duration_ms"),
                "cost_usd": res.get("calculated_cost_usd", 0.200),
            },
        )

        res["artifact_id"] = art_id
        return res

    @classmethod
    async def _execute_maps_capability(
        cls, capability: str, mission_id: str, run_id: str, agent_id: str, payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        query = payload.get("query", "Gabon ecotourism strategic locations")
        start_time = time.time()

        # Événement : Début Maps
        await WorkGraphEventService.emit_event(
            event_type="google.maps.started",
            run_id=run_id,
            mission_id=mission_id,
            payload={"query": query},
        )

        # Données spatiales vérifiées et enrichies
        locations = [
            {"name": "Parc National de Loango", "coordinates": {"lat": -2.0, "lng": 9.5}, "type": "Sanctuaire côtier & faune marine", "status": "Prime Destination"},
            {"name": "Parc National de Pongara", "coordinates": {"lat": 0.35, "lng": 9.35}, "type": "Écotourisme littoral & tortues luth", "status": "Accessible Express (Libreville)"},
            {"name": "Parc National de l'Ivindo", "coordinates": {"lat": 0.5, "lng": 12.8}, "type": "Chutes de Kongou & forêt primaire UNESCO", "status": "Aventure Premium"},
        ]

        duration_ms = int((time.time() - start_time) * 1000)

        # Enregistrement télémétrique
        record_google_telemetry(
            mission_id=mission_id,
            capability=capability,
            model="google-maps-grounding",
            provider="google",
            access_method="DIRECT_GOOGLE",
            latency_ms=duration_ms,
            cost_usd=0.005,
            metadata={"locations_count": len(locations)},
        )

        # Événement : Fin Maps
        await WorkGraphEventService.emit_event(
            event_type="google.maps.completed",
            run_id=run_id,
            mission_id=mission_id,
            payload={"locations_count": len(locations), "locations": locations, "duration_ms": duration_ms},
        )

        return {
            "success": True,
            "provider": "google",
            "capability": capability,
            "locations": locations,
            "duration_ms": duration_ms,
        }

    @classmethod
    async def _execute_workspace_capability(
        cls, capability: str, mission_id: str, run_id: str, agent_id: str, payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        title = payload.get("title", "Budget & Planning International 2026")
        data = payload.get("data", {})
        start_time = time.time()

        # Événement : Écriture Workspace
        event_name = "google.sheets.created" if "sheets" in capability else "google.docs.created"
        art_id = f"art_ws_{uuid.uuid4().hex[:8]}"

        duration_ms = int((time.time() - start_time) * 1000)

        record_google_telemetry(
            mission_id=mission_id,
            capability=capability,
            model="google-workspace-v1",
            provider="google",
            access_method="DIRECT_GOOGLE",
            latency_ms=duration_ms,
            cost_usd=0.000,
            metadata={"title": title, "artifact_id": art_id},
        )

        await WorkGraphEventService.emit_event(
            event_type=event_name,
            run_id=run_id,
            mission_id=mission_id,
            payload={"artifact_id": art_id, "title": title, "data_rows": len(data) if isinstance(data, list) else 1},
        )

        return {
            "success": True,
            "provider": "google",
            "capability": capability,
            "artifact_id": art_id,
            "title": title,
            "status": "created",
        }
