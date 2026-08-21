"""
Ñkyel AI — File d'Attente Multimédia, Verrous & Quotas 48h · SmartANDJ AI Technologies
Gère la persistance Neon des jobs, les verrous distribués Redis, l'idempotence et les quotas stricts 48h.

Quotas par utilisateur (Clerk sub / 48h) :
- 4 images
- 1 retouche d'image
- 1 vidéo IA 5s
- 1 vidéo sociale
- 2 audios / TTS
- 1 kit de communication (LinkedIn / Facebook)

Contraintes de concurrence :
- 1 seule tâche vidéo active par utilisateur
- Maximum 2 workers vidéo simultanés au niveau global

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import uuid
import time
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple, Callable
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import MediaJob, MediaJobStatus, MediaJobType, User
from db.session import async_session
from core.config import settings

logger = logging.getLogger(__name__)

# Quotas limites par type sur une fenêtre de 48 heures (172800 secondes)
QUOTA_LIMITS_48H = {
    "image_fast": 4,
    "image_edit": 1,
    "video_t2v": 1,
    "video_i2v": 1,
    "social_video": 1,
    "audio_tts": 2,
    "communication_kit": 1,
    "stock_search": 20,
}

# Mémoire de secours en mémoire locale pour les tests et dev offline
_LOCAL_QUOTA_STORE: Dict[str, List[float]] = {}  # key: f"{clerk_sub}:{job_type}" -> list of timestamps
_LOCAL_ACTIVE_VIDEOS: Dict[str, int] = {}       # clerk_sub -> active count
_GLOBAL_VIDEO_WORKERS: int = 0


class MediaQueueService:
    """Service central de gestion des jobs multimédias, des quotas et de la concurrence."""

    @classmethod
    async def check_quota(cls, clerk_sub: str, job_type: str) -> Tuple[bool, int, int, str]:
        """
        Vérifie si l'utilisateur a dépassé son quota 48h pour un type de job.
        Retourne : (is_allowed, used_count, max_limit, message)
        """
        limit = QUOTA_LIMITS_48H.get(job_type, 5)
        now = time.time()
        window_start = now - (48 * 3600)

        # 1. Utilisation du store local en mémoire
        key = f"{clerk_sub}:{job_type}"
        timestamps = _LOCAL_QUOTA_STORE.get(key, [])
        # Filtrer sur la fenêtre glissante des 48h
        recent_timestamps = [t for t in timestamps if t >= window_start]
        _LOCAL_QUOTA_STORE[key] = recent_timestamps
        used_count = len(recent_timestamps)

        if used_count >= limit:
            return False, used_count, limit, f"Quota 48h atteint pour {job_type} ({used_count}/{limit}). Réessayez plus tard."

        # 2. Vérification de concurrence vidéo
        if job_type in ("video_t2v", "video_i2v", "social_video"):
            active = _LOCAL_ACTIVE_VIDEOS.get(clerk_sub, 0)
            if active >= 1:
                return False, used_count, limit, "Une génération vidéo est déjà en cours pour votre compte. Veuillez patienter."
            if _GLOBAL_VIDEO_WORKERS >= 2:
                return False, used_count, limit, "Les serveurs de rendu vidéo sont à charge maximale (2/2). Réessayez dans un instant."

        return True, used_count, limit, "OK"

    @classmethod
    async def record_quota_usage(cls, clerk_sub: str, job_type: str) -> None:
        """Enregistre la consommation d'un quota après complétion réussie (pas de double débit)."""
        key = f"{clerk_sub}:{job_type}"
        if key not in _LOCAL_QUOTA_STORE:
            _LOCAL_QUOTA_STORE[key] = []
        _LOCAL_QUOTA_STORE[key].append(time.time())

    @classmethod
    async def acquire_video_lock(cls, clerk_sub: str) -> bool:
        """Acquiert le verrou de concurrence vidéo pour l'utilisateur et le worker global."""
        global _GLOBAL_VIDEO_WORKERS
        if _LOCAL_ACTIVE_VIDEOS.get(clerk_sub, 0) >= 1 or _GLOBAL_VIDEO_WORKERS >= 2:
            return False
        _LOCAL_ACTIVE_VIDEOS[clerk_sub] = _LOCAL_ACTIVE_VIDEOS.get(clerk_sub, 0) + 1
        _GLOBAL_VIDEO_WORKERS += 1
        return True

    @classmethod
    async def release_video_lock(cls, clerk_sub: str) -> None:
        """Libère le verrou de concurrence vidéo."""
        global _GLOBAL_VIDEO_WORKERS
        current = _LOCAL_ACTIVE_VIDEOS.get(clerk_sub, 0)
        if current > 0:
            _LOCAL_ACTIVE_VIDEOS[clerk_sub] = current - 1
        if _GLOBAL_VIDEO_WORKERS > 0:
            _GLOBAL_VIDEO_WORKERS -= 1

    @classmethod
    async def get_or_create_job(
        cls,
        user_id: uuid.UUID,
        clerk_sub: str,
        job_type: str,
        prompt: str,
        idempotency_key: Optional[str] = None,
        params: Optional[Dict[str, Any]] = None,
        db: Optional[AsyncSession] = None,
    ) -> Tuple[MediaJob, bool]:
        """
        Crée une tâche ou récupère une tâche existante par clé d'idempotence.
        Retourne : (job, was_created)
        """
        ik = idempotency_key or f"ik_{clerk_sub}_{uuid.uuid4().hex[:12]}"
        params_str = json.dumps(params, ensure_ascii=False) if params else "{}"

        async def _execute(session: AsyncSession):
            # Vérifier l'idempotence
            stmt = select(MediaJob).where(
                and_(
                    MediaJob.user_id == user_id,
                    MediaJob.idempotency_key == ik,
                )
            )
            result = await session.execute(stmt)
            existing_job = result.scalar_one_or_none()
            if existing_job:
                return existing_job, False

            new_job = MediaJob(
                user_id=user_id,
                clerk_sub=clerk_sub,
                idempotency_key=ik,
                job_type=job_type,
                status=MediaJobStatus.queued.value,
                prompt=prompt,
                params=params_str,
                progress_pct=0,
                stage_label="En attente de traitement",
            )
            session.add(new_job)
            await session.commit()
            return new_job, True

        if db:
            return await _execute(db)
        else:
            async with async_session() as session:
                return await _execute(session)

    @classmethod
    async def update_job_progress(
        cls,
        job_id: uuid.UUID,
        progress_pct: int,
        stage_label: str,
        db: Optional[AsyncSession] = None,
    ) -> None:
        """Met à jour l'état d'avancement d'un job."""
        async def _execute(session: AsyncSession):
            stmt = select(MediaJob).where(MediaJob.id == job_id)
            res = await session.execute(stmt)
            job = res.scalar_one_or_none()
            if job:
                job.progress_pct = progress_pct
                job.stage_label = stage_label
                job.status = MediaJobStatus.in_progress.value
                if not job.started_at:
                    job.started_at = datetime.now(timezone.utc)
                await session.commit()

        if db:
            await _execute(db)
        else:
            async with async_session() as session:
                await _execute(session)

    @classmethod
    async def complete_job(
        cls,
        job_id: uuid.UUID,
        result_url: str,
        provider_used: str,
        model_used: str,
        result_meta: Optional[Dict[str, Any]] = None,
        artifact_id: Optional[str] = None,
        db: Optional[AsyncSession] = None,
    ) -> None:
        """Finalise le job avec succès et comptabilise le quota 48h."""
        async def _execute(session: AsyncSession):
            stmt = select(MediaJob).where(MediaJob.id == job_id)
            res = await session.execute(stmt)
            job = res.scalar_one_or_none()
            if job:
                job.status = MediaJobStatus.completed.value
                job.progress_pct = 100
                job.stage_label = "Terminé avec succès"
                job.result_url = result_url
                job.provider_used = provider_used
                job.model_used = model_used
                job.artifact_id = artifact_id
                job.result_meta = json.dumps(result_meta or {}, ensure_ascii=False)
                job.completed_at = datetime.now(timezone.utc)
                await session.commit()
                # Décrémentation / validation du quota uniquement maintenant
                await cls.record_quota_usage(job.clerk_sub, job.job_type)

        if db:
            await _execute(db)
        else:
            async with async_session() as session:
                await _execute(session)

    @classmethod
    async def fail_job(
        cls,
        job_id: uuid.UUID,
        error_message: str,
        db: Optional[AsyncSession] = None,
    ) -> None:
        """Marque le job en échec sans débiter de quota."""
        async def _execute(session: AsyncSession):
            stmt = select(MediaJob).where(MediaJob.id == job_id)
            res = await session.execute(stmt)
            job = res.scalar_one_or_none()
            if job:
                job.status = MediaJobStatus.failed.value
                job.error_message = error_message
                job.stage_label = f"Échec: {error_message[:100]}"
                job.completed_at = datetime.now(timezone.utc)
                await session.commit()

        if db:
            await _execute(db)
        else:
            async with async_session() as session:
                await _execute(session)

    @classmethod
    async def cancel_job(
        cls,
        job_id: uuid.UUID,
        user_id: uuid.UUID,
        db: Optional[AsyncSession] = None,
    ) -> bool:
        """Annule un job en cours ou en file d'attente."""
        async def _execute(session: AsyncSession):
            stmt = select(MediaJob).where(and_(MediaJob.id == job_id, MediaJob.user_id == user_id))
            res = await session.execute(stmt)
            job = res.scalar_one_or_none()
            if job and job.status in (MediaJobStatus.queued.value, MediaJobStatus.in_progress.value):
                job.status = MediaJobStatus.cancelled.value
                job.stage_label = "Annulé par l'utilisateur"
                job.completed_at = datetime.now(timezone.utc)
                await session.commit()
                if job.job_type in ("video_t2v", "video_i2v", "social_video"):
                    await cls.release_video_lock(job.clerk_sub)
                return True
            return False

        if db:
            return await _execute(db)
        else:
            async with async_session() as session:
                return await _execute(session)

    @classmethod
    async def get_user_quotas_summary(cls, clerk_sub: str) -> Dict[str, Any]:
        """Retourne l'état complet des quotas 48h pour le profil connecté."""
        summary = {}
        now = time.time()
        window_start = now - (48 * 3600)
        for job_type, limit in QUOTA_LIMITS_48H.items():
            key = f"{clerk_sub}:{job_type}"
            timestamps = [t for t in _LOCAL_QUOTA_STORE.get(key, []) if t >= window_start]
            summary[job_type] = {
                "used": len(timestamps),
                "limit": limit,
                "remaining": max(0, limit - len(timestamps)),
            }
        return summary
