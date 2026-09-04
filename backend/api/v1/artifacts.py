"""
Ñkyel AI — API REST des Artefacts Canoniques & Exportations Multi-Formats · SmartANDJ AI Technologies
Points d'entrée pour :
- Récupération, métadonnées, création et filtrage d'artefacts canoniques
- Téléchargement d'exports binaires réels (PDF, DOCX, PPTX, XLSX, CSV, ZIP, PNG, JSON, ICS)
- Création d'artefacts dérivés et lignage (DERIVED_FROM, INPUT_TO, SOURCE_FOR, VERSION_OF)
- Sélection de concepts dans une grille multi-concept
- Partage sécurisé tokenisé et gestion de versions

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import os
import uuid
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Response, Depends, status
from fastapi.responses import Response as RawResponse
from pydantic import BaseModel, Field
from sqlalchemy import select, and_

from core.config import settings
from core.security import get_current_user
from db.session import async_session
from db.models import Artifact as DBArtifact, WorkspaceMember
from services.r2_storage_service import R2StorageService
from services.persistence_service import PersistenceService
from services.artifact_service import (
    ArtifactService,
    ArtifactType,
    ArtifactLifecycleStatus,
    ArtifactRelationType,
    ShareVisibility,
    SharePermission,
    CanonicalArtifact,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/artifacts", tags=["Artefacts Universels"])


# ── Modèles de Requête ───────────────────────────────────────

class PresignUploadRequest(BaseModel):
    filename: str = Field(..., description="Nom du fichier avec extension")
    content_type: str = Field("application/octet-stream", description="Type MIME du fichier")
    category: Optional[str] = Field("artifacts", description="Catégorie (artifacts, documents, media)")


class ConfirmUploadRequest(BaseModel):
    object_key: str = Field(..., description="Clé d'objet R2 issue de /presign-upload")
    title: str = Field(..., description="Titre de l'artefact")
    artifact_type: str = Field("document", description="Type d'artefact (image, document, report, etc.)")
    mission_id: Optional[str] = None
    run_id: Optional[str] = None
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CreateArtifactRequest(BaseModel):
    title: str = Field(..., description="Titre de l'artefact")
    content: str = Field(..., description="Contenu textuel, Markdown, HTML ou JSON")
    type: ArtifactType = Field(ArtifactType.MARKDOWN, description="Type d'artefact")
    mission_id: str = Field(..., description="ID de la mission parente")
    run_id: str = Field(..., description="ID du run parent")
    filename: Optional[str] = None
    description: Optional[str] = ""
    task_id: Optional[str] = None
    agent_id: Optional[str] = "lead_agent"
    parent_artifact_id: Optional[str] = None
    relation_type: Optional[ArtifactRelationType] = None
    provider: Optional[str] = "google"
    model: Optional[str] = "gemini-3.7-flash"
    access_method: Optional[str] = "DIRECT_GOOGLE"
    source_ids: Optional[List[str]] = None
    evidence_ids: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    width: Optional[int] = None
    height: Optional[int] = None
    duration_seconds: Optional[int] = None


class CreateConceptGridRequest(BaseModel):
    title: str = Field(..., description="Titre de la grille de concepts")
    prompts: List[str] = Field(..., min_length=2, max_length=4, description="2 à 4 prompts de concepts")
    mission_id: str = Field(...)
    run_id: str = Field(...)
    agent_id: Optional[str] = "visual_director"


class SelectConceptRequest(BaseModel):
    concept_number: int = Field(..., ge=1, le=4, description="Numéro du concept sélectionné")


class ShareArtifactRequest(BaseModel):
    visibility: ShareVisibility = Field(ShareVisibility.LINK_ONLY)
    permission: SharePermission = Field(SharePermission.DOWNLOAD_ALLOWED)
    expires_in_hours: Optional[int] = Field(72, ge=1, le=8760)


class RestoreVersionRequest(BaseModel):
    target_version: int = Field(..., ge=1)


class NewVersionRequest(BaseModel):
    content: str = Field(..., description="Nouveau contenu")
    change_summary: Optional[str] = "Updated content"


# ── Routes API ───────────────────────────────────────────────

@router.get("", response_model=List[Dict[str, Any]])
async def list_artifacts(
    mission_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
):
    """Liste tous les artefacts créés, restaurables depuis Neon et R2."""
    arts = await ArtifactService.list_artifacts_async(mission_id=mission_id, user_identifier=user_id)
    return [a.to_dict() for a in arts]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_artifact_endpoint(req: CreateArtifactRequest):
    """Crée un nouvel artefact canonique universel."""
    art = await ArtifactService.create_artifact(
        title=req.title,
        content=req.content,
        type=req.type,
        mission_id=req.mission_id,
        run_id=req.run_id,
        filename=req.filename,
        description=req.description or "",
        task_id=req.task_id,
        agent_id=req.agent_id or "lead_agent",
        parent_artifact_id=req.parent_artifact_id,
        relation_type=req.relation_type,
        provider=req.provider or "google",
        model=req.model or "gemini-3.7-flash",
        access_method=req.access_method or "DIRECT_GOOGLE",
        source_ids=req.source_ids,
        evidence_ids=req.evidence_ids,
        metadata=req.metadata,
        width=req.width,
        height=req.height,
        duration_seconds=req.duration_seconds,
    )
    return art.to_dict()


@router.post("/concept-grid", status_code=status.HTTP_201_CREATED)
async def create_concept_grid_endpoint(req: CreateConceptGridRequest):
    """Crée une grille exploratoire de 4 concepts avec sélection interactive."""
    art = await ArtifactService.create_multi_concept_grid(
        title=req.title,
        prompts=req.prompts,
        mission_id=req.mission_id,
        run_id=req.run_id,
        agent_id=req.agent_id or "visual_director",
    )
    return art.to_dict()


@router.post("/{artifact_id}/select-concept")
async def select_concept_endpoint(artifact_id: str, req: SelectConceptRequest):
    """Sélectionne un concept dans la grille et génère l'artefact final dérivé."""
    try:
        final_art = await ArtifactService.select_concept(artifact_id, req.concept_number)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return final_art.to_dict()


@router.post("/presign-upload")
async def presign_upload_endpoint(
    req: PresignUploadRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Génère une URL pré-signée Cloudflare R2 (PUT) pour téléversement direct côté client.
    Cloisonné strictement sous users/{user_id}/artifacts/.
    """
    user_id = str(current_user.get("id") or "")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilisateur non identifié.")

    clean_filename = os.path.basename(req.filename).replace(" ", "_")
    unique_name = f"{uuid.uuid4().hex[:8]}_{clean_filename}"
    object_key = R2StorageService.get_object_key(
        user_id=user_id,
        category=req.category or "artifacts",
        file_name=unique_name,
    )

    upload_url = R2StorageService.get_presigned_upload_url(
        object_key=object_key,
        content_type=req.content_type,
        expires_in=3600,
    )

    return {
        "success": True,
        "upload_url": upload_url,
        "object_key": object_key,
        "user_id": user_id,
        "filename": unique_name,
        "expires_in": 3600,
    }


@router.post("/confirm-upload", status_code=status.HTTP_201_CREATED)
async def confirm_upload_endpoint(
    req: ConfirmUploadRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Confirme et indexe dans Neon un artefact téléversé directement sur Cloudflare R2.
    Vérifie que la clé R2 appartient bien à l'utilisateur appelant (Anti-IDOR).
    """
    user_id = str(current_user.get("id") or "")
    is_admin = bool(current_user.get("is_admin", False))

    expected_prefix = f"users/{user_id}/"
    if not is_admin and not req.object_key.startswith(expected_prefix):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sécurité IDOR : Clé d'objet invalide pour cet utilisateur.",
        )

    bucket = settings.r2_bucket_name or settings.cloudflare_r2_bucket
    r2_domain = settings.r2_public_url or settings.cloudflare_r2_public_domain or f"https://{bucket}.r2.dev"
    public_url = f"{r2_domain}/{req.object_key}"

    art_id = f"art_{uuid.uuid4().hex[:12]}"
    clerk_sub = str(current_user.get("clerk_id") or user_id)

    ok = await PersistenceService.record_artifact(
        artifact_id=art_id,
        mission_id=req.mission_id or f"mission_{uuid.uuid4().hex[:8]}",
        run_id=req.run_id or f"run_{uuid.uuid4().hex[:8]}",
        user_identifier=clerk_sub,
        title=req.title,
        artifact_type=req.artifact_type,
        url=public_url,
        r2_key=req.object_key,
        content=req.content,
        metadata=req.metadata,
    )

    if not ok:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Échec de l'indexation de l'artefact dans Neon.",
        )

    return {
        "success": True,
        "artifact_id": art_id,
        "title": req.title,
        "type": req.artifact_type,
        "url": public_url,
        "r2_key": req.object_key,
    }


@router.get("/{artifact_id}")
async def get_artifact_endpoint(artifact_id: str):
    """Récupère les détails, statut et métadonnées d'un artefact depuis Neon ou cache."""
    art = await ArtifactService.get_artifact_async(artifact_id)
    if not art:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artefact introuvable.")
    return art.to_dict()


@router.get("/{artifact_id}/download-url")
async def get_artifact_download_url(
    artifact_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Génère une URL de téléchargement pré-signée Cloudflare R2 avec contrôle IDOR strict.
    Seul le propriétaire ou un membre du workspace peut accéder au lien.
    """
    try:
        art_uuid = uuid.UUID(str(artifact_id))
    except ValueError:
        art_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.art.{artifact_id}")

    async with async_session() as s:
        stmt = select(DBArtifact).where(DBArtifact.id == art_uuid)
        res = await s.execute(stmt)
        db_art = res.scalar_one_or_none()

    if not db_art:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artefact introuvable.")

    user_id_str = str(current_user.get("id") or "")
    is_admin = bool(current_user.get("is_admin", False))

    # IDOR check: match owner or check workspace membership
    if not is_admin and str(db_art.user_id) != user_id_str:
        allowed = False
        if db_art.workspace_id and user_id_str:
            try:
                u_uuid = uuid.UUID(user_id_str)
                async with async_session() as s:
                    ws_mem = await s.execute(
                        select(WorkspaceMember).where(
                            and_(
                                WorkspaceMember.workspace_id == db_art.workspace_id,
                                WorkspaceMember.user_id == u_uuid,
                            )
                        )
                    )
                    if ws_mem.scalar_one_or_none():
                        allowed = True
            except Exception:
                pass
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès non autorisé : Vous ne pouvez pas télécharger l'artefact d'un autre utilisateur.",
            )

    r2_key = db_art.r2_key or f"users/{db_art.user_id}/artifacts/{db_art.id}"
    presigned_url = R2StorageService.get_presigned_download_url(r2_key, expires_in=3600)
    if not presigned_url:
        presigned_url = db_art.url or f"/static/artifacts/{r2_key}"

    return {
        "success": True,
        "artifact_id": str(db_art.id),
        "title": db_art.title,
        "download_url": presigned_url,
        "expires_in": 3600,
        "r2_key": r2_key,
    }


@router.get("/{artifact_id}/lineage")
async def get_artifact_lineage(artifact_id: str):
    """Récupère le graphe de lignage et dépendances d'un artefact."""
    art = ArtifactService.get_artifact(artifact_id)
    if not art:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artefact introuvable.")

    parent = ArtifactService.get_artifact(art.parent_artifact_id) if art.parent_artifact_id else None
    derived = [ArtifactService.get_artifact(d_id).to_dict() for d_id in art.derived_artifact_ids if ArtifactService.get_artifact(d_id)]

    return {
        "artifact_id": artifact_id,
        "parent": parent.to_dict() if parent else None,
        "relation_to_parent": art.relation_type,
        "derived_artifacts": derived,
    }


@router.get("/{artifact_id}/export")
async def export_artifact_endpoint(
    artifact_id: str,
    format: str = Query("pdf", description="pdf, docx, pptx, xlsx, csv, zip, png, json, ics"),
):
    """Exporte l'artefact dans le format binaire authentique demandé."""
    try:
        raw_bytes, mime_type, filename = await ArtifactService.export_artifact(artifact_id, format)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return RawResponse(
        content=raw_bytes,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Artifact-Format": format,
            "X-Artifact-Id": artifact_id,
        },
    )


@router.post("/{artifact_id}/share")
async def share_artifact_endpoint(artifact_id: str, req: ShareArtifactRequest):
    """Génère un lien de partage sécurisé avec permission et date d'expiration."""
    art = ArtifactService.get_artifact(artifact_id)
    if not art:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artefact introuvable.")

    st = ArtifactService.create_share_link(
        artifact_id=artifact_id,
        visibility=req.visibility,
        permission=req.permission,
        expires_in_hours=req.expires_in_hours,
    )

    return {
        "success": True,
        "token": st.token,
        "share_url": f"/share/{st.token}",
        "permission": st.permission.value,
        "visibility": st.visibility.value,
        "expires_at": st.expires_at,
    }


@router.get("/share/{token}")
async def resolve_share_link_endpoint(token: str):
    """Résout un lien de partage et retourne l'artefact si le token est valide."""
    data = ArtifactService.resolve_share_link(token)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lien de partage expiré ou invalide.")
    return data


@router.get("/{artifact_id}/versions")
async def get_artifact_versions(artifact_id: str):
    """Récupère l'historique complet des versions d'un artefact."""
    art = ArtifactService.get_artifact(artifact_id)
    if not art:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artefact introuvable.")
    return {"artifact_id": artifact_id, "current_version": art.version, "versions": art.versions}


@router.post("/{artifact_id}/versions")
async def add_artifact_version(artifact_id: str, req: NewVersionRequest):
    """Ajoute une nouvelle version sans écraser la précédente."""
    art = ArtifactService.save_new_version(
        artifact_id=artifact_id,
        new_content=req.content,
        author_agent="human_user",
        change_summary=req.change_summary or "Updated content",
    )
    if not art:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artefact introuvable.")
    return art.to_dict()


@router.post("/{artifact_id}/versions/restore")
async def restore_artifact_version(artifact_id: str, req: RestoreVersionRequest):
    """Restaure une version précédente de l'artefact."""
    art = ArtifactService.restore_version(artifact_id, req.target_version)
    if not art:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version cible introuvable.")
    return art.to_dict()
