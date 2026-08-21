"""
Ñkyel AI — API REST & SSE Multimédia · SmartANDJ AI Technologies
Points d'entrée pour la génération d'images, retouches, vidéos, kits sociaux, suivi de jobs et streaming SSE.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import uuid
import json
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db
from db.models import MediaJob, MediaJobStatus, MediaJobType, User
from services.media_queue_service import MediaQueueService
from services.media_provider_router import MediaProviderRouter
from services.moderation_service import ModerationService
from events.workgraph_events import WorkGraphEventService
from agents.deerflow_multimedia import VisualDirectorAgent, VideoProducerAgent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/media", tags=["Multimédia Réel"])


# ── Schémas Pydantic ─────────────────────────────────────────

class ImageGenerateRequest(BaseModel):
    prompt: str = Field(..., description="Description de l'image souhaitée")
    aspect_ratio: str = Field("1:1", description="1:1, 4:5, 16:9, 9:16")
    style: Optional[str] = None
    brand_palette: Optional[List[str]] = None
    idempotency_key: Optional[str] = None


class ImageEditRequest(BaseModel):
    image_url: str = Field(..., description="URL de l'image source à retoucher")
    prompt: str = Field(..., description="Instructions de modification")
    mode: str = Field("edit", description="edit, inpaint, variation")
    idempotency_key: Optional[str] = None


class VideoGenerateRequest(BaseModel):
    prompt: str = Field(..., description="Description de la vidéo")
    source_image_url: Optional[str] = None
    duration_seconds: int = Field(5, ge=3, le=10)
    aspect_ratio: str = Field("16:9", description="16:9, 9:16, 1:1, 4:5")
    include_audio: bool = True
    idempotency_key: Optional[str] = None


class SocialKitRequest(BaseModel):
    topic: str = Field(..., description="Sujet ou mission de la publication")
    media_asset_urls: Optional[List[str]] = None
    language: str = "fr"
    call_to_action: Optional[str] = None
    idempotency_key: Optional[str] = None


# Helper pour récupérer l'utilisateur (avec fallback dev user si nécessaire)
async def get_request_user(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Extrait l'utilisateur authentifié ou crée un utilisateur par défaut pour le dev."""
    # Rechercher un utilisateur existant
    stmt = select(User).limit(1)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        # Créer un utilisateur démo
        user = User(
            id=uuid.uuid4(),
            email="daniel@smartandj.ai",
            name="Daniel Jonathan ANDJ",
            hashed_password="demo_hashed_password",
        )
        db.add(user)
        await db.commit()

    return {
        "id": user.id,
        "clerk_sub": f"user_clerk_{str(user.id)[:8]}",
        "email": user.email,
        "name": user.name,
    }


# ── Routes API ───────────────────────────────────────────────

@router.post("/generate", status_code=202)
async def generate_image_endpoint(
    body: ImageGenerateRequest,
    bg: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_request_user),
    db: AsyncSession = Depends(get_db),
):
    """Lance la génération d'une image haute fidélité avec l'agent visual-director."""
    # 1. Vérification des quotas 48h
    allowed, used, limit, msg = await MediaQueueService.check_quota(current_user["clerk_sub"], "image_fast")
    if not allowed:
        raise HTTPException(status_code=429, detail=msg)

    # 2. Modération
    is_safe, reason = ModerationService.check_text_prompt(body.prompt)
    if not is_safe:
        raise HTTPException(status_code=400, detail=reason)

    # 3. Création du Job
    job, created = await MediaQueueService.get_or_create_job(
        user_id=current_user["id"],
        clerk_sub=current_user["clerk_sub"],
        job_type="image_fast",
        prompt=body.prompt,
        idempotency_key=body.idempotency_key,
        params=body.model_dump(),
        db=db,
    )

    if not created and job.status == MediaJobStatus.completed.value:
        return {"job_id": str(job.id), "status": job.status, "result_url": job.result_url, "idempotent": True}

    # 4. Tâche de fond d'exécution
    async def _run_task():
        agent = VisualDirectorAgent(user_id=str(current_user["id"]), clerk_sub=current_user["clerk_sub"])
        await MediaQueueService.update_job_progress(job.id, 25, "Direction artistique & inférence Flux")
        result = await agent.execute_mission(
            goal=body.prompt,
            aspect_ratio=body.aspect_ratio,
            style=body.style,
            brand_palette=body.brand_palette,
            job_id=str(job.id),
        )
        if result.get("success"):
            await MediaQueueService.complete_job(
                job_id=job.id,
                result_url=result.get("image_url", ""),
                provider_used=result.get("provider", "cloudflare"),
                model_used=result.get("model", "flux-1-schnell"),
                artifact_id=result.get("artifact_id"),
                result_meta={"aspect_ratio": body.aspect_ratio},
            )
        else:
            await MediaQueueService.fail_job(job.id, result.get("error", "Échec inconnu"))

    bg.add_task(_run_task)

    return {
        "job_id": str(job.id),
        "status": MediaJobStatus.queued.value,
        "quota": {"used": used, "limit": limit},
        "stream_url": f"/api/v1/media/stream/{str(job.id)}",
    }


@router.post("/edit", status_code=202)
async def edit_image_endpoint(
    body: ImageEditRequest,
    bg: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_request_user),
    db: AsyncSession = Depends(get_db),
):
    """Retouche une image existante avec l'agent visual-director."""
    allowed, used, limit, msg = await MediaQueueService.check_quota(current_user["clerk_sub"], "image_edit")
    if not allowed:
        raise HTTPException(status_code=429, detail=msg)

    is_safe, reason = ModerationService.check_text_prompt(body.prompt)
    if not is_safe:
        raise HTTPException(status_code=400, detail=reason)

    job, created = await MediaQueueService.get_or_create_job(
        user_id=current_user["id"],
        clerk_sub=current_user["clerk_sub"],
        job_type="image_edit",
        prompt=body.prompt,
        idempotency_key=body.idempotency_key,
        params=body.model_dump(),
        db=db,
    )

    async def _run_task():
        await MediaQueueService.update_job_progress(job.id, 30, "Inférence retouche Flux-2 Klein")
        res = await MediaProviderRouter.edit_image(image_url_or_bytes=body.image_url, prompt=body.prompt, mode=body.mode)
        if res.get("success"):
            await MediaQueueService.complete_job(
                job_id=job.id,
                result_url=res.get("url", ""),
                provider_used=res.get("provider", "cloudflare"),
                model_used=res.get("model", "flux-2-klein-4b"),
                result_meta={"original_image": body.image_url},
            )
        else:
            await MediaQueueService.fail_job(job.id, res.get("error", "Échec retouche"))

    bg.add_task(_run_task)

    return {
        "job_id": str(job.id),
        "status": MediaJobStatus.queued.value,
        "quota": {"used": used, "limit": limit},
        "stream_url": f"/api/v1/media/stream/{str(job.id)}",
    }


@router.post("/video", status_code=202)
async def generate_video_endpoint(
    body: VideoGenerateRequest,
    bg: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_request_user),
    db: AsyncSession = Depends(get_db),
):
    """Génère une vidéo IA de 5 secondes avec l'agent video-producer."""
    job_type = "video_i2v" if body.source_image_url else "video_t2v"
    allowed, used, limit, msg = await MediaQueueService.check_quota(current_user["clerk_sub"], job_type)
    if not allowed:
        raise HTTPException(status_code=429, detail=msg)

    # Verrouillage de concurrence
    acquired = await MediaQueueService.acquire_video_lock(current_user["clerk_sub"])
    if not acquired:
        raise HTTPException(status_code=429, detail="Limite de calcul vidéo simultanée atteinte.")

    job, _ = await MediaQueueService.get_or_create_job(
        user_id=current_user["id"],
        clerk_sub=current_user["clerk_sub"],
        job_type=job_type,
        prompt=body.prompt,
        idempotency_key=body.idempotency_key,
        params=body.model_dump(),
        db=db,
    )

    async def _run_task():
        try:
            agent = VideoProducerAgent(user_id=str(current_user["id"]), clerk_sub=current_user["clerk_sub"])
            await MediaQueueService.update_job_progress(job.id, 20, "Génération des frames vidéo")
            res = await agent.execute_mission(
                goal=body.prompt,
                source_image_url=body.source_image_url,
                duration_seconds=body.duration_seconds,
                aspect_ratio=body.aspect_ratio,
                include_audio=body.include_audio,
                job_id=str(job.id),
            )
            if res.get("success"):
                await MediaQueueService.complete_job(
                    job_id=job.id,
                    result_url=res.get("video_url", ""),
                    provider_used=res.get("provider", "comfyui_wan"),
                    model_used=res.get("model", "wan2.1"),
                    artifact_id=res.get("artifact_id"),
                    result_meta={"duration": body.duration_seconds, "aspect_ratio": body.aspect_ratio},
                )
            else:
                await MediaQueueService.fail_job(job.id, res.get("error", "Échec vidéo"))
        finally:
            await MediaQueueService.release_video_lock(current_user["clerk_sub"])

    bg.add_task(_run_task)

    return {
        "job_id": str(job.id),
        "status": MediaJobStatus.queued.value,
        "stream_url": f"/api/v1/media/stream/{str(job.id)}",
    }


@router.post("/social-kit")
async def generate_social_kit_endpoint(
    body: SocialKitRequest,
    current_user: Dict[str, Any] = Depends(get_request_user),
    db: AsyncSession = Depends(get_db),
):
    """Génère un pack complet de diffusion pour les réseaux sociaux (LinkedIn & Facebook)."""
    allowed, used, limit, msg = await MediaQueueService.check_quota(current_user["clerk_sub"], "communication_kit")
    if not allowed:
        raise HTTPException(status_code=429, detail=msg)

    # Exécution directe
    from mcp_integration.tools.multimedia_tools import communication_kit_tool
    kit = communication_kit_tool(
        topic=body.topic,
        media_asset_urls=body.media_asset_urls,
        language=body.language,
        call_to_action=body.call_to_action,
    )
    # Enregistrer quota
    await MediaQueueService.record_quota_usage(current_user["clerk_sub"], "communication_kit")
    return kit


@router.get("/jobs/{job_id}")
async def get_job_status(
    job_id: str,
    current_user: Dict[str, Any] = Depends(get_request_user),
    db: AsyncSession = Depends(get_db),
):
    """Récupère l'état et le résultat d'un job multimédia."""
    try:
        jid = uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="UUID de job invalide")

    stmt = select(MediaJob).where(and_(MediaJob.id == jid, MediaJob.user_id == current_user["id"]))
    res = await db.execute(stmt)
    job = res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Tâche introuvable ou accès non autorisé")

    meta = {}
    if job.result_meta:
        try:
            meta = json.loads(job.result_meta)
        except Exception:
            pass

    return {
        "id": str(job.id),
        "job_type": job.job_type,
        "status": job.status,
        "progress_pct": job.progress_pct,
        "stage_label": job.stage_label,
        "prompt": job.prompt,
        "result_url": job.result_url,
        "result_meta": meta,
        "provider_used": job.provider_used,
        "model_used": job.model_used,
        "artifact_id": job.artifact_id,
        "error_message": job.error_message,
        "created_at": job.created_at.isoformat() if job.created_at else None,
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
    }


@router.post("/jobs/{job_id}/cancel")
async def cancel_job_endpoint(
    job_id: str,
    current_user: Dict[str, Any] = Depends(get_request_user),
    db: AsyncSession = Depends(get_db),
):
    """Annule un job multimédia en cours."""
    try:
        jid = uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="UUID invalide")

    success = await MediaQueueService.cancel_job(jid, current_user["id"], db=db)
    if not success:
        raise HTTPException(status_code=400, detail="Impossible d'annuler cette tâche (déjà terminée ou introuvable)")
    return {"success": True, "message": "Tâche annulée avec succès"}


@router.get("/stream/{job_id}")
async def stream_job_events(job_id: str):
    """Flux SSE temps réel des événements WorkGraph d'un job pour Ñkyel VIE."""
    async def _event_generator():
        async for event in WorkGraphEventService.subscribe_job_events(job_id):
            yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

    return StreamingResponse(_event_generator(), media_type="text/event-stream")


@router.get("/quotas")
async def get_user_quotas(
    current_user: Dict[str, Any] = Depends(get_request_user),
):
    """Retourne l'état des quotas 48h de l'utilisateur."""
    quotas = await MediaQueueService.get_user_quotas_summary(current_user["clerk_sub"])
    return {"clerk_sub": current_user["clerk_sub"], "quotas_48h": quotas}
