"""
Ñkyel AI — Memory Sovereignty API Routes · SmartANDJ AI Technologies
Routes pour le Memory Studio : cartes, provenance, politique, stats.

L'utilisateur contrôle sa mémoire.

Fondateur : Daniel Jonathan ANDJ
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.nkyel_memory import (
    nkyel_memory,
    MemoryCard,
    MemoryScope,
    MemoryVisibility,
    LearningPolicy,
    SensitivityLevel,
    MemoryCandidate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/memory", tags=["Memory Sovereignty"])


# ══════════════════════════════════════════════════════════════
# Request / Response Models
# ══════════════════════════════════════════════════════════════

class CreateMemoryCardRequest(BaseModel):
    content: str
    type: str = "fact"
    scope: str = "user"
    source: str = "manual"
    owner_id: str = ""
    workspace_id: str = ""


class UpdateMemoryCardRequest(BaseModel):
    content: str


class SetLearningPolicyRequest(BaseModel):
    user_id: str
    policy: str  # "never", "always_ask", "auto_preferences", "auto_all"


class SetExpiryRequest(BaseModel):
    ttl_seconds: float


# ══════════════════════════════════════════════════════════════
# Routes — CRUD Memory Cards
# ══════════════════════════════════════════════════════════════

@router.post("/cards", summary="Créer une carte mémoire")
async def create_memory_card(req: CreateMemoryCardRequest):
    """Crée une nouvelle carte mémoire."""
    try:
        card = MemoryCard(
            content=req.content,
            type=req.type,
            scope=MemoryScope(req.scope),
            source=req.source,
            owner_id=req.owner_id,
            workspace_id=req.workspace_id,
        )
        created = nkyel_memory.create_card(card)
        return {"card": created.to_dict(), "created": True}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/cards", summary="Lister les cartes mémoire")
async def list_memory_cards(
    owner_id: Optional[str] = None,
    scope: Optional[str] = None,
    type_filter: Optional[str] = None,
    workspace_id: Optional[str] = None,
):
    """Liste les cartes mémoire avec filtres."""
    scope_enum = MemoryScope(scope) if scope else None
    cards = nkyel_memory.list_cards(
        owner_id=owner_id,
        scope=scope_enum,
        type_filter=type_filter,
        workspace_id=workspace_id,
    )
    return {
        "cards": [c.to_dict() for c in cards],
        "count": len(cards),
    }


@router.get("/cards/{memory_id}", summary="Récupérer une carte")
async def get_memory_card(memory_id: str):
    """Récupère une carte mémoire par son ID."""
    card = nkyel_memory.get_card(memory_id)
    if not card:
        raise HTTPException(status_code=404, detail="Carte mémoire introuvable")
    return {"card": card.to_dict()}


@router.put("/cards/{memory_id}", summary="Modifier une carte")
async def update_memory_card(memory_id: str, req: UpdateMemoryCardRequest):
    """Modifie le contenu d'une carte mémoire."""
    try:
        card = nkyel_memory.update_card(memory_id, req.content)
        if not card:
            raise HTTPException(status_code=404, detail="Carte mémoire introuvable")
        return {"card": card.to_dict(), "updated": True}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.delete("/cards/{memory_id}", summary="Supprimer une carte")
async def delete_memory_card(memory_id: str):
    """Supprime (oublie) une carte mémoire."""
    try:
        deleted = nkyel_memory.delete_card(memory_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Carte mémoire introuvable")
        return {"deleted": True, "memory_id": memory_id}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


# ══════════════════════════════════════════════════════════════
# Routes — User Controls
# ══════════════════════════════════════════════════════════════

@router.post("/cards/{memory_id}/lock", summary="Verrouiller une carte")
async def lock_memory_card(memory_id: str):
    """Verrouille une carte mémoire importante."""
    card = nkyel_memory.lock_card(memory_id)
    if not card:
        raise HTTPException(status_code=404, detail="Carte mémoire introuvable")
    return {"locked": True, "card": card.to_dict()}


@router.post("/cards/{memory_id}/unlock", summary="Déverrouiller une carte")
async def unlock_memory_card(memory_id: str):
    """Déverrouille une carte mémoire."""
    card = nkyel_memory.unlock_card(memory_id)
    if not card:
        raise HTTPException(status_code=404, detail="Carte mémoire introuvable")
    return {"unlocked": True, "card": card.to_dict()}


@router.post("/cards/{memory_id}/block-learning", summary="Bloquer l'apprentissage")
async def block_learning(memory_id: str):
    """Interdit l'apprentissage automatique sur cette mémoire."""
    card = nkyel_memory.block_learning(memory_id)
    if not card:
        raise HTTPException(status_code=404, detail="Carte mémoire introuvable")
    return {"learning_blocked": True, "card": card.to_dict()}


@router.post("/cards/{memory_id}/set-expiry", summary="Définir une expiration")
async def set_memory_expiry(memory_id: str, req: SetExpiryRequest):
    """Définit une durée de vie pour une carte mémoire."""
    card = nkyel_memory.set_expiry(memory_id, req.ttl_seconds)
    if not card:
        raise HTTPException(status_code=404, detail="Carte mémoire introuvable")
    return {"expiry_set": True, "card": card.to_dict()}


# ══════════════════════════════════════════════════════════════
# Routes — Provenance & Policy
# ══════════════════════════════════════════════════════════════

@router.get("/cards/{memory_id}/provenance", summary="Provenance d'une mémoire")
async def get_provenance(memory_id: str):
    """Explique d'où vient une mémoire et pourquoi elle existe."""
    provenance = nkyel_memory.get_provenance(memory_id)
    if not provenance:
        raise HTTPException(status_code=404, detail="Carte mémoire introuvable")
    return {"provenance": provenance}


@router.post("/policy", summary="Définir la politique d'apprentissage")
async def set_learning_policy(req: SetLearningPolicyRequest):
    """Définit la politique d'apprentissage automatique."""
    try:
        policy = LearningPolicy(req.policy)
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail=f"Politique invalide. Options: {[p.value for p in LearningPolicy]}",
        )
    nkyel_memory.set_learning_policy(req.user_id, policy)
    return {"user_id": req.user_id, "policy": policy.value}


@router.get("/policy/{user_id}", summary="Récupérer la politique")
async def get_learning_policy(user_id: str):
    """Récupère la politique d'apprentissage d'un utilisateur."""
    policy = nkyel_memory.get_learning_policy(user_id)
    return {"user_id": user_id, "policy": policy.value}


# ══════════════════════════════════════════════════════════════
# Routes — Stats
# ══════════════════════════════════════════════════════════════

@router.get("/stats", summary="Statistiques mémoire")
async def memory_stats(owner_id: Optional[str] = None):
    """Statistiques de la mémoire Ñkyel."""
    return {"stats": nkyel_memory.stats(owner_id=owner_id)}
