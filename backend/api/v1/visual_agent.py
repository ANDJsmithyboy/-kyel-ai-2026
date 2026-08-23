"""
Ñkyel AI — Visual Agent API Routes · SmartANDJ AI Technologies
Routes pour le Visual Agent Studio : spec CRUD, compilation, fork, diff, patch.

Fondateur : Daniel Jonathan ANDJ
"""

import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.agent_spec import (
    AgentSpec,
    AgentSpecHistory,
    AgentIdentity,
    AgentCognition,
    AgentModelPolicy,
    AgentMemoryScope,
    AgentTools,
    AgentPermissions,
    AgentBudget,
    AgentLanguage,
    CognitionMode,
    PermissionLevel,
    MemoryAccess,
    spec_diff,
    fork_agent,
)
from core.agent_compiler import AgentCompiler
from core.vie_patch import (
    VIEPatch,
    VIEPatchEngine,
    PatchOperation,
    PatchTarget,
    vie_patch_engine,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/visual-agent", tags=["Visual Agent"])

# ── In-Memory Store (production: Redis/DB) ──────────────────
_agent_specs: Dict[str, AgentSpec] = {}
_agent_histories: Dict[str, AgentSpecHistory] = {}


# ══════════════════════════════════════════════════════════════
# Request / Response Models
# ══════════════════════════════════════════════════════════════

class CreateAgentRequest(BaseModel):
    name: str = "Kora"
    role: str = "Assistant Général"
    description: str = ""
    owner_id: str = ""
    cognition_mode: str = "balanced"
    autonomy: float = 0.5
    verification: float = 0.5


class PatchRequest(BaseModel):
    agent_id: str
    path: str
    new_value: Any
    reason: str = ""
    user_id: str = ""
    mission_id: str = ""


class ForkRequest(BaseModel):
    source_agent_id: str
    new_name: str
    new_role: Optional[str] = None


class DiffRequest(BaseModel):
    agent_id: str
    version_a: int
    version_b: int


# ══════════════════════════════════════════════════════════════
# Routes
# ══════════════════════════════════════════════════════════════

@router.post("/specs", summary="Créer un nouvel agent")
async def create_agent_spec(req: CreateAgentRequest):
    """Crée un nouvel AgentSpec et retourne la spec compilée."""
    spec = AgentSpec(
        owner_id=req.owner_id,
        identity=AgentIdentity(
            name=req.name,
            role=req.role,
            description=req.description,
        ),
        cognition=AgentCognition(
            mode=CognitionMode(req.cognition_mode),
            autonomy=req.autonomy,
            verification=req.verification,
        ),
    )

    errors = spec.validate()
    if errors:
        raise HTTPException(status_code=422, detail={"errors": errors})

    _agent_specs[spec.id] = spec
    _agent_histories[spec.id] = AgentSpecHistory(spec)

    compiled = AgentCompiler.compile(spec)

    logger.info(f"✅ Agent créé: {spec.identity.name} ({spec.id})")

    return {
        "agent_id": spec.id,
        "spec": spec.to_dict(),
        "compiled": compiled.to_dict(),
        "version": spec.version,
    }


@router.get("/specs/{agent_id}", summary="Récupérer un agent")
async def get_agent_spec(agent_id: str):
    """Récupère l'AgentSpec d'un agent."""
    spec = _agent_specs.get(agent_id)
    if not spec:
        raise HTTPException(status_code=404, detail="Agent introuvable")

    compiled = AgentCompiler.compile(spec)

    return {
        "agent_id": spec.id,
        "spec": spec.to_dict(),
        "compiled": compiled.to_dict(),
        "version": spec.version,
    }


@router.get("/specs", summary="Lister les agents")
async def list_agent_specs(owner_id: Optional[str] = None):
    """Liste tous les agents avec filtrage optionnel par propriétaire."""
    results = []
    for spec in _agent_specs.values():
        if owner_id and spec.owner_id != owner_id:
            continue
        results.append({
            "agent_id": spec.id,
            "name": spec.identity.name,
            "role": spec.identity.role,
            "version": spec.version,
            "cognition_mode": spec.cognition.mode.value,
            "autonomy": spec.cognition.autonomy,
        })
    return {"agents": results, "count": len(results)}


@router.post("/patch", summary="Appliquer un patch visuel")
async def apply_patch(req: PatchRequest):
    """
    Applique un VIEPatch sur un agent.
    Le patch est classifié HOT/WARM/COLD et traité en conséquence.
    """
    spec = _agent_specs.get(req.agent_id)
    if not spec:
        raise HTTPException(status_code=404, detail="Agent introuvable")

    # Resolve old value
    old_value = _resolve_path(spec.to_dict(), req.path)

    patch = VIEPatch(
        operation=PatchOperation.UPDATE,
        target=PatchTarget.AGENT_SPEC,
        agent_id=req.agent_id,
        path=req.path,
        old_value=old_value,
        new_value=req.new_value,
        reason=req.reason,
        user_id=req.user_id,
        mission_id=req.mission_id,
    )

    result = vie_patch_engine.submit(patch)

    # If HOT and applied, update the spec
    if result.status.value == "applied":
        _apply_value_to_spec(spec, req.path, req.new_value)
        spec.updated_at = __import__("time").time()

        # Version commit
        history = _agent_histories.get(req.agent_id)
        if history:
            history.commit(
                spec, [req.path],
                description=req.reason or f"Patch: {req.path}",
                changed_by=req.user_id,
            )

    return {
        "patch_id": result.id,
        "status": result.status.value,
        "temperature": result.temperature.value,
        "path": result.path,
        "old_value": result.old_value,
        "new_value": result.new_value,
    }


@router.post("/patch/undo", summary="Annuler le dernier patch")
async def undo_patch():
    """Annule le dernier patch appliqué."""
    inverse = vie_patch_engine.undo()
    if inverse is None:
        raise HTTPException(status_code=404, detail="Rien à annuler")
    return {"undone": True, "inverse_patch": inverse.to_dict()}


@router.post("/patch/redo", summary="Rétablir le dernier undo")
async def redo_patch():
    """Rétablit le dernier undo."""
    patch = vie_patch_engine.redo()
    if patch is None:
        raise HTTPException(status_code=404, detail="Rien à rétablir")
    return {"redone": True, "patch": patch.to_dict()}


@router.get("/patch/history", summary="Historique des patchs")
async def patch_history(limit: int = 50):
    """Retourne l'historique des patchs appliqués."""
    return {
        "history": vie_patch_engine.get_history(limit),
        "pending": vie_patch_engine.get_pending_count(),
    }


@router.post("/compile/{agent_id}", summary="Recompiler un agent")
async def compile_agent(agent_id: str):
    """Force la recompilation d'un agent."""
    spec = _agent_specs.get(agent_id)
    if not spec:
        raise HTTPException(status_code=404, detail="Agent introuvable")

    # Apply pending warm patches
    warm_applied = vie_patch_engine.apply_warm_patches()

    compiled = AgentCompiler.compile(spec)
    return {
        "agent_id": spec.id,
        "compiled": compiled.to_dict(),
        "warm_patches_applied": len(warm_applied),
        "pending_cold": vie_patch_engine.get_pending_count().get("cold", 0),
    }


@router.post("/fork", summary="Dupliquer un agent")
async def fork_agent_route(req: ForkRequest):
    """Fork (duplique) un agent avec un nouveau nom."""
    source = _agent_specs.get(req.source_agent_id)
    if not source:
        raise HTTPException(status_code=404, detail="Agent source introuvable")

    forked = fork_agent(source, req.new_name, req.new_role)
    _agent_specs[forked.id] = forked
    _agent_histories[forked.id] = AgentSpecHistory(forked)

    compiled = AgentCompiler.compile(forked)

    return {
        "forked_agent_id": forked.id,
        "source_agent_id": source.id,
        "spec": forked.to_dict(),
        "compiled": compiled.to_dict(),
    }


@router.post("/diff", summary="Comparer deux versions")
async def diff_versions(req: DiffRequest):
    """Compare deux versions d'un AgentSpec."""
    history = _agent_histories.get(req.agent_id)
    if not history:
        raise HTTPException(status_code=404, detail="Agent introuvable")

    snap_a = history.get_version(req.version_a)
    snap_b = history.get_version(req.version_b)

    if snap_a is None:
        raise HTTPException(status_code=404, detail=f"Version {req.version_a} introuvable")
    if snap_b is None:
        raise HTTPException(status_code=404, detail=f"Version {req.version_b} introuvable")

    diffs = spec_diff(snap_a, snap_b)

    return {
        "agent_id": req.agent_id,
        "version_a": req.version_a,
        "version_b": req.version_b,
        "changes": diffs,
        "change_count": len(diffs),
    }


@router.get("/versions/{agent_id}", summary="Historique des versions")
async def list_versions(agent_id: str):
    """Liste toutes les versions d'un agent."""
    history = _agent_histories.get(agent_id)
    if not history:
        raise HTTPException(status_code=404, detail="Agent introuvable")

    return {
        "agent_id": agent_id,
        "current_version": history.current_version,
        "versions": history.list_versions(),
    }


# ══════════════════════════════════════════════════════════════
# Helpers
# ══════════════════════════════════════════════════════════════

def _resolve_path(data: Dict[str, Any], path: str) -> Any:
    """Résout un chemin pointé (ex: 'cognition.autonomy') dans un dict."""
    parts = path.split(".")
    current = data
    for part in parts:
        if isinstance(current, dict):
            current = current.get(part)
        else:
            return None
    return current


def _apply_value_to_spec(spec: AgentSpec, path: str, value: Any) -> None:
    """Applique une valeur à un champ de l'AgentSpec via son chemin."""
    parts = path.split(".")
    if len(parts) < 2:
        return

    section = parts[0]
    field_name = parts[1]

    section_obj = getattr(spec, section, None)
    if section_obj is not None and hasattr(section_obj, field_name):
        setattr(section_obj, field_name, value)
