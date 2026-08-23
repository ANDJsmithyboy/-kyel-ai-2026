"""
Ñkyel AI — World Model API Routes · SmartANDJ AI Technologies
Routes pour le World Model View : entités, relations, faits, contraintes,
corrections utilisateur avec analyse d'impact.

Fondateur : Daniel Jonathan ANDJ
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.world_model import (
    WorldModel,
    WorldEntity,
    WorldRelationship,
    WorldFact,
    WorldConstraint,
    EntityStatus,
    FactStatus,
    RelationType,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/world-model", tags=["World Model"])

# ── In-Memory Store (production: Redis/DB) ──────────────────
_world_models: dict[str, WorldModel] = {}


# ══════════════════════════════════════════════════════════════
# Request Models
# ══════════════════════════════════════════════════════════════

class CreateWorldModelRequest(BaseModel):
    mission_id: str


class AddEntityRequest(BaseModel):
    name: str
    entity_type: str = ""
    properties: dict = {}
    confidence: float = 0.5
    source: str = ""


class AddFactRequest(BaseModel):
    statement: str
    confidence: float = 0.5
    source: str = ""
    entity_ids: list[str] = []


class AddRelationshipRequest(BaseModel):
    source_entity_id: str
    target_entity_id: str
    relation_type: str = "depends_on"
    label: str = ""
    confidence: float = 0.5


class AddConstraintRequest(BaseModel):
    description: str
    constraint_type: str = "user_defined"
    entity_ids: list[str] = []


class RejectFactRequest(BaseModel):
    reason: str = ""


class CorrectEntityRequest(BaseModel):
    corrections: dict = {}
    reason: str = ""


# ══════════════════════════════════════════════════════════════
# Routes — World Model Lifecycle
# ══════════════════════════════════════════════════════════════

@router.post("/create", summary="Créer un World Model")
async def create_world_model(req: CreateWorldModelRequest):
    """Crée un nouveau World Model pour une mission."""
    wm = WorldModel(mission_id=req.mission_id)
    _world_models[req.mission_id] = wm
    return {"mission_id": req.mission_id, "created": True}


@router.get("/{mission_id}", summary="Récupérer le World Model")
async def get_world_model(mission_id: str):
    """Récupère le World Model complet d'une mission."""
    wm = _world_models.get(mission_id)
    if not wm:
        raise HTTPException(status_code=404, detail="World Model introuvable")
    return wm.to_dict()


# ══════════════════════════════════════════════════════════════
# Routes — Entities
# ══════════════════════════════════════════════════════════════

@router.post("/{mission_id}/entities", summary="Ajouter une entité")
async def add_entity(mission_id: str, req: AddEntityRequest):
    wm = _world_models.get(mission_id)
    if not wm:
        raise HTTPException(status_code=404, detail="World Model introuvable")

    entity = WorldEntity(
        name=req.name,
        entity_type=req.entity_type,
        properties=req.properties,
        confidence=req.confidence,
        source=req.source,
    )
    wm.add_entity(entity)
    return {"entity": entity.to_dict(), "created": True}


# ══════════════════════════════════════════════════════════════
# Routes — Facts
# ══════════════════════════════════════════════════════════════

@router.post("/{mission_id}/facts", summary="Ajouter un fait")
async def add_fact(mission_id: str, req: AddFactRequest):
    wm = _world_models.get(mission_id)
    if not wm:
        raise HTTPException(status_code=404, detail="World Model introuvable")

    fact = WorldFact(
        statement=req.statement,
        confidence=req.confidence,
        source=req.source,
        entity_ids=req.entity_ids,
    )
    wm.add_fact(fact)
    return {"fact": fact.to_dict(), "created": True}


@router.get("/{mission_id}/facts", summary="Lister les faits")
async def list_facts(mission_id: str, status: Optional[str] = None):
    wm = _world_models.get(mission_id)
    if not wm:
        raise HTTPException(status_code=404, detail="World Model introuvable")

    status_enum = FactStatus(status) if status else None
    facts = wm.get_facts(status=status_enum)
    return {"facts": [f.to_dict() for f in facts], "count": len(facts)}


# ══════════════════════════════════════════════════════════════
# Routes — Relationships
# ══════════════════════════════════════════════════════════════

@router.post("/{mission_id}/relationships", summary="Ajouter une relation")
async def add_relationship(mission_id: str, req: AddRelationshipRequest):
    wm = _world_models.get(mission_id)
    if not wm:
        raise HTTPException(status_code=404, detail="World Model introuvable")

    rel = WorldRelationship(
        source_entity_id=req.source_entity_id,
        target_entity_id=req.target_entity_id,
        relation_type=RelationType(req.relation_type),
        label=req.label,
        confidence=req.confidence,
    )
    wm.add_relationship(rel)
    return {"relationship": rel.to_dict(), "created": True}


# ══════════════════════════════════════════════════════════════
# Routes — Constraints
# ══════════════════════════════════════════════════════════════

@router.post("/{mission_id}/constraints", summary="Ajouter une contrainte utilisateur")
async def add_constraint(mission_id: str, req: AddConstraintRequest):
    """L'utilisateur ajoute une contrainte au World Model."""
    wm = _world_models.get(mission_id)
    if not wm:
        raise HTTPException(status_code=404, detail="World Model introuvable")

    result = wm.user_add_constraint(
        description=req.description,
        constraint_type=req.constraint_type,
        entity_ids=req.entity_ids,
    )
    return result


# ══════════════════════════════════════════════════════════════
# Routes — Human Editable World Model
# ══════════════════════════════════════════════════════════════

@router.post("/{mission_id}/facts/{fact_id}/reject", summary="Rejeter un fait")
async def reject_fact(mission_id: str, fact_id: str, req: RejectFactRequest):
    """L'utilisateur rejette un fait. Déclenche analyse d'impact + replan."""
    wm = _world_models.get(mission_id)
    if not wm:
        raise HTTPException(status_code=404, detail="World Model introuvable")

    result = wm.user_reject_fact(fact_id, req.reason)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error", "Erreur"))
    return result


@router.post("/{mission_id}/facts/{fact_id}/accept", summary="Confirmer un fait")
async def accept_fact(mission_id: str, fact_id: str):
    """L'utilisateur confirme un fait comme vérifié."""
    wm = _world_models.get(mission_id)
    if not wm:
        raise HTTPException(status_code=404, detail="World Model introuvable")

    result = wm.user_accept_fact(fact_id)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error", "Erreur"))
    return result


@router.post("/{mission_id}/entities/{entity_id}/correct", summary="Corriger une entité")
async def correct_entity(mission_id: str, entity_id: str, req: CorrectEntityRequest):
    """L'utilisateur corrige une entité du World Model."""
    wm = _world_models.get(mission_id)
    if not wm:
        raise HTTPException(status_code=404, detail="World Model introuvable")

    result = wm.user_correct_entity(entity_id, req.corrections, req.reason)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error", "Erreur"))
    return result
