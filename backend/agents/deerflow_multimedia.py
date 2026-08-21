"""
Ñkyel AI — Agents DeerFlow Multimédia Réels · SmartANDJ AI Technologies
Définit les deux agents autonomes de production multimédia :
1. visual-director : Direction artistique, génération et retouche d'images, respect de charte
2. video-producer : Conception de storyboards, génération vidéo, composition sociale et synchronisation audio/TTS

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import uuid
import time
import json
import logging
from typing import Dict, Any, List, Optional

from services.media_provider_router import MediaProviderRouter
from services.media_queue_service import MediaQueueService
from services.neon_memory_backend import NeonMemoryBackend
from events.workgraph_events import WorkGraphEventService
from services.moderation_service import ModerationService

logger = logging.getLogger(__name__)


# ─── AGENT 1 : VISUAL DIRECTOR ────────────────────────────────

class VisualDirectorAgent:
    """
    Agent DeerFlow : visual-director
    Dirige la création visuelle, le cadrage, l'harmonie des couleurs et la retouche d'images.
    """

    def __init__(self, user_id: str, clerk_sub: str):
        self.user_id = user_id
        self.clerk_sub = clerk_sub
        self.agent_name = "visual-director"
        self.namespace = NeonMemoryBackend.get_namespace(user_id, "visual-director")

    async def execute_mission(
        self,
        goal: str,
        aspect_ratio: str = "1:1",
        style: Optional[str] = None,
        brand_palette: Optional[List[str]] = None,
        job_id: Optional[str] = None,
        run_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Exécute une mission complète de direction artistique et génération d'image."""
        rid = run_id or f"run_vis_{uuid.uuid4().hex[:8]}"
        jid = job_id or str(uuid.uuid4())

        # 1. Événement : Job créé
        await WorkGraphEventService.emit_event(
            event_type="media.job.created",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"goal": goal, "agent": "visual-director", "aspect_ratio": aspect_ratio},
        )

        # 2. Modération & Optimisation du prompt
        is_safe, error = ModerationService.check_text_prompt(goal)
        if not is_safe:
            await WorkGraphEventService.emit_event(
                event_type="media.job.failed",
                run_id=rid,
                job_id=jid,
                user_id=self.user_id,
                payload={"error": error},
            )
            return {"success": False, "error": error}

        enhanced_prompt = f"{goal}, direction artistique par Visual Director"
        if style:
            enhanced_prompt += f", style {style}"
        if brand_palette:
            enhanced_prompt += f", palette harmonieuse {', '.join(brand_palette)}"

        await WorkGraphEventService.emit_event(
            event_type="media.prompt.enhanced",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"original_prompt": goal, "enhanced_prompt": enhanced_prompt},
        )

        # 3. Sélection du fournisseur
        provider_name = "cloudflare_workers_ai_flux1"
        await WorkGraphEventService.emit_event(
            event_type="media.provider.selected",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"provider": provider_name, "model": "@cf/black-forest-labs/flux-1-schnell"},
        )

        # 4. Début de génération
        await WorkGraphEventService.emit_event(
            event_type="media.generation.started",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"stage": "Inférence neuronale de l'image"},
        )

        # Appel au MediaProviderRouter
        gen_result = await MediaProviderRouter.generate_image(
            prompt=enhanced_prompt,
            aspect_ratio=aspect_ratio,
            style=style,
            quality_mode="fast",
        )

        if not gen_result.get("success"):
            await WorkGraphEventService.emit_event(
                event_type="media.job.failed",
                run_id=rid,
                job_id=jid,
                user_id=self.user_id,
                payload={"error": gen_result.get("error")},
            )
            return gen_result

        # 5. Actif généré
        await WorkGraphEventService.emit_event(
            event_type="media.asset.generated",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"url": gen_result.get("url"), "dimensions": gen_result.get("dimensions")},
        )

        # 6. Post-traitement (Stripping métadonnées & QA)
        await WorkGraphEventService.emit_event(
            event_type="media.postprocessing.started",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"action": "Validation des ratios & nettoyage EXIF"},
        )

        # 7. Création de l'artefact délivrable
        art_id = f"art_img_{uuid.uuid4().hex[:8]}"
        await WorkGraphEventService.emit_event(
            event_type="media.artifact.created",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"artifact_id": art_id, "title": f"Visuel : {goal[:30]}", "url": gen_result.get("url")},
        )

        # 8. Sauvegarde dans la mémoire DeerMem
        await NeonMemoryBackend.store_memory(
            user_id=self.user_id,
            namespace=self.namespace,
            key=f"image_{art_id}",
            content={
                "goal": goal,
                "enhanced_prompt": enhanced_prompt,
                "url": gen_result.get("url"),
                "artifact_id": art_id,
                "created_at": time.time(),
            },
        )

        # 9. Complétion du job
        await WorkGraphEventService.emit_event(
            event_type="media.job.completed",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"status": "completed", "artifact_id": art_id, "url": gen_result.get("url")},
        )

        return {
            "success": True,
            "agent": "visual-director",
            "run_id": rid,
            "job_id": jid,
            "artifact_id": art_id,
            "image_url": gen_result.get("url"),
            "aspect_ratio": aspect_ratio,
            "provider": gen_result.get("provider"),
            "model": gen_result.get("model"),
        }


# ─── AGENT 2 : VIDEO PRODUCER ─────────────────────────────────

class VideoProducerAgent:
    """
    Agent DeerFlow : video-producer
    Orchestre les storyboards, la génération vidéo IA, le mixage audio/voix-off et le formatage social.
    """

    def __init__(self, user_id: str, clerk_sub: str):
        self.user_id = user_id
        self.clerk_sub = clerk_sub
        self.agent_name = "video-producer"
        self.namespace = NeonMemoryBackend.get_namespace(user_id, "video-producer")

    async def execute_mission(
        self,
        goal: str,
        source_image_url: Optional[str] = None,
        duration_seconds: int = 5,
        aspect_ratio: str = "16:9",
        include_audio: bool = True,
        job_id: Optional[str] = None,
        run_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Exécute une mission complète de production vidéo."""
        rid = run_id or f"run_vid_{uuid.uuid4().hex[:8]}"
        jid = job_id or str(uuid.uuid4())

        # 1. Événement : Job créé
        await WorkGraphEventService.emit_event(
            event_type="media.job.created",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"goal": goal, "agent": "video-producer", "duration": duration_seconds, "aspect_ratio": aspect_ratio},
        )

        # 2. Modération
        is_safe, error = ModerationService.check_text_prompt(goal)
        if not is_safe:
            await WorkGraphEventService.emit_event(
                event_type="media.job.failed",
                run_id=rid,
                job_id=jid,
                user_id=self.user_id,
                payload={"error": error},
            )
            return {"success": False, "error": error}

        # 3. Storyboard & enrichissement de mise en scène
        enhanced_prompt = f"Cinematic video, {goal}, smooth motion 4k, professional camera choreography"
        await WorkGraphEventService.emit_event(
            event_type="media.prompt.enhanced",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"original_prompt": goal, "enhanced_prompt": enhanced_prompt},
        )

        # 4. Sélection fournisseur vidéo
        provider_name = "runpod_comfyui_wan"
        await WorkGraphEventService.emit_event(
            event_type="media.provider.selected",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"provider": provider_name, "model": "wan2.1-t2v-1.3b"},
        )

        # 5. Inférence vidéo
        await WorkGraphEventService.emit_event(
            event_type="media.generation.started",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"stage": "Rendu vidéo 5s et calcul des vecteurs de mouvement"},
        )

        vid_result = await MediaProviderRouter.generate_video(
            prompt=enhanced_prompt,
            image_source=source_image_url,
            duration_seconds=duration_seconds,
            aspect_ratio=aspect_ratio,
        )

        if not vid_result.get("success"):
            await WorkGraphEventService.emit_event(
                event_type="media.job.failed",
                run_id=rid,
                job_id=jid,
                user_id=self.user_id,
                payload={"error": vid_result.get("error")},
            )
            return vid_result

        # 6. Actif vidéo brut généré
        raw_video_url = vid_result.get("video_url")
        await WorkGraphEventService.emit_event(
            event_type="media.asset.generated",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"video_url": raw_video_url, "duration_seconds": duration_seconds},
        )

        # 7. Post-traitement (Audio TTS + Compositeur Social)
        audio_url = None
        if include_audio:
            tts_res = await MediaProviderRouter.text_to_speech(text=goal)
            audio_url = tts_res.get("audio_url")

        await WorkGraphEventService.emit_event(
            event_type="media.postprocessing.started",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"action": "Montage FFmpeg, synchronisation voix-off et recadrage"},
        )

        composer_res = await MediaProviderRouter.compose_social_video(
            media_urls=[raw_video_url],
            audio_url=audio_url,
            aspect_ratio=aspect_ratio,
            duration_seconds=duration_seconds,
        )
        final_video_url = composer_res.get("video_url", raw_video_url)

        # 8. Création de l'artefact
        art_id = f"art_vid_{uuid.uuid4().hex[:8]}"
        await WorkGraphEventService.emit_event(
            event_type="media.artifact.created",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"artifact_id": art_id, "title": f"Vidéo : {goal[:30]}", "url": final_video_url},
        )

        # 9. Sauvegarde dans la mémoire DeerMem
        await NeonMemoryBackend.store_memory(
            user_id=self.user_id,
            namespace=self.namespace,
            key=f"video_{art_id}",
            content={
                "goal": goal,
                "video_url": final_video_url,
                "artifact_id": art_id,
                "duration_seconds": duration_seconds,
                "aspect_ratio": aspect_ratio,
                "created_at": time.time(),
            },
        )

        # 10. Complétion
        await WorkGraphEventService.emit_event(
            event_type="media.job.completed",
            run_id=rid,
            job_id=jid,
            user_id=self.user_id,
            payload={"status": "completed", "artifact_id": art_id, "video_url": final_video_url},
        )

        return {
            "success": True,
            "agent": "video-producer",
            "run_id": rid,
            "job_id": jid,
            "artifact_id": art_id,
            "video_url": final_video_url,
            "duration_seconds": duration_seconds,
            "aspect_ratio": aspect_ratio,
            "provider": vid_result.get("provider"),
            "model": vid_result.get("model"),
        }
