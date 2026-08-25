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

import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Response, status
from fastapi.responses import Response as RawResponse
from pydantic import BaseModel, Field

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

router = APIRouter(prefix="/api/v1/artifacts", tags=["Artefacts Universels"])


# ── Modèles de Requête ───────────────────────────────────────

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
async def list_artifacts(mission_id: Optional[str] = Query(None)):
    """Liste tous les artefacts créés, filtrables par mission."""
    arts = ArtifactService.list_artifacts(mission_id)
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


@router.get("/{artifact_id}")
async def get_artifact_endpoint(artifact_id: str):
    """Récupère les détails, statut et métadonnées d'un artefact."""
    art = ArtifactService.get_artifact(artifact_id)
    if not art:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artefact introuvable.")
    return art.to_dict()


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
