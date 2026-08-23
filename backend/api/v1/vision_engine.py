"""
Ñkyel AI — Vision Engine API Routes · SmartANDJ AI Technologies
Points d'entrée REST & SSE pour The Vision Engine :
  - Vision Mode parsing & Make It Real
  - What-If Simulations
  - Human in the Graph (arbitrage humain)
  - Agent Pulse
  - Flux SSE des événements cognitifs explicables (Event Spine)

Fondateur : Daniel Jonathan ANDJ
"""

import json
import asyncio
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from core.vision_engine import (
    vision_engine,
    VisionMap,
    VisionStatus,
)
from core.simulation_engine import (
    simulation_engine,
    WhatIfScenario,
    TemporalFact,
    TemporalHorizon,
    EpistemicStatus,
)
from core.human_node import (
    human_node_manager,
    HumanNode,
    HumanDecisionType,
    HumanNodeUrgency,
)
from core.agent_pulse import (
    agent_pulse,
    PulseState,
)
from core.interpretation_layer import interpretation_layer
from core.event_schema import event_emitter, NkyelEvent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/vision", tags=["Vision Engine"])


# ══════════════════════════════════════════════════════════════
# Request / Response Models
# ══════════════════════════════════════════════════════════════

class ParseVisionRequest(BaseModel):
    raw_input: str
    owner_id: str = ""


class UpdatePillarRequest(BaseModel):
    items: List[str]


class MakeItRealRequest(BaseModel):
    vision_id: str


class SimulateRequest(BaseModel):
    title: str
    description: str = ""
    mission_id: str = ""
    variables: List[Dict[str, Any]] = []


class HumanDecisionRequest(BaseModel):
    human_node_id: str
    decision: str
    decided_by: str = ""
    decision_data: Dict[str, Any] = {}


class PulseTransitionRequest(BaseModel):
    state: str
    message: Optional[str] = None
    activity_description: str = ""
    current_tool: Optional[str] = None
    progress: Optional[float] = None


# ══════════════════════════════════════════════════════════════
# Routes — Vision Mode & Make It Real
# ══════════════════════════════════════════════════════════════

@router.post("/parse", summary="Parser une vision en VisionMap")
async def parse_vision(req: ParseVisionRequest):
    """
    Parse une intention ou une intuition en VisionMap structurée (6 piliers).
    """
    if not req.raw_input or not req.raw_input.strip():
        raise HTTPException(status_code=422, detail="raw_input ne peut pas être vide")

    vision = vision_engine.parse_vision(req.raw_input, req.owner_id)
    return {
        "vision": vision.to_dict(),
        "parsed": True,
    }


@router.get("/maps/{vision_id}", summary="Récupérer une VisionMap")
async def get_vision_map(vision_id: str):
    """Récupère une VisionMap par son identifiant."""
    vision = vision_engine.get_vision(vision_id)
    if not vision:
        raise HTTPException(status_code=404, detail="VisionMap introuvable")
    return {"vision": vision.to_dict()}


@router.put("/maps/{vision_id}/pillars/{pillar_name}", summary="Mettre à jour un pilier")
async def update_pillar(vision_id: str, pillar_name: str, req: UpdatePillarRequest):
    """Met à jour les éléments d'un pilier spécifique."""
    updated = vision_engine.update_pillar(vision_id, pillar_name, req.items)
    if not updated:
        raise HTTPException(status_code=404, detail="Vision ou pilier introuvable")
    return {"vision": updated.to_dict(), "updated": True}


@router.post("/maps/{vision_id}/pillars/{pillar_name}/validate", summary="Valider un pilier")
async def validate_pillar(vision_id: str, pillar_name: str):
    """Valide un pilier par l'utilisateur."""
    validated = vision_engine.validate_pillar(vision_id, pillar_name)
    if not validated:
        raise HTTPException(status_code=404, detail="Vision ou pilier introuvable")
    return {"vision": validated.to_dict(), "validated": True}


@router.post("/make-it-real", summary="Compiler la vision en WorkGraph (Make It Real)")
async def make_it_real(req: MakeItRealRequest):
    """
    MAKE IT REAL — Transforme le mode vision en mode exécution (WorkGraph).
    """
    workgraph = vision_engine.make_it_real(req.vision_id)
    if not workgraph:
        raise HTTPException(
            status_code=422,
            detail="Impossible de compiler la vision. Vérifiez que la vision existe et comporte au moins un pilier.",
        )
    return {
        "workgraph": workgraph.to_dict(),
        "compiled": True,
    }


# ══════════════════════════════════════════════════════════════
# Routes — What-If Simulations
# ══════════════════════════════════════════════════════════════

@router.post("/simulate", summary="Créer et exécuter une simulation what-if")
async def simulate_scenario(req: SimulateRequest):
    """
    Simule l'impact d'une décision avant exécution.
    """
    scenario = simulation_engine.create_scenario(
        title=req.title,
        description=req.description,
        mission_id=req.mission_id,
        variables=req.variables,
    )
    result = simulation_engine.run_simulation(scenario.id)
    if not result:
        raise HTTPException(status_code=500, detail="Erreur lors de l'exécution de la simulation")
    return {"scenario": result.to_dict()}


@router.get("/simulate/{scenario_id}", summary="Récupérer un scénario de simulation")
async def get_simulation_scenario(scenario_id: str):
    scenario = simulation_engine.get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scénario introuvable")
    return {"scenario": scenario.to_dict()}


@router.post("/simulate/{scenario_id}/accept", summary="Accepter un scénario")
async def accept_simulation_scenario(scenario_id: str):
    scenario = simulation_engine.accept_scenario(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scénario introuvable")
    return {"scenario": scenario.to_dict(), "accepted": True}


# ══════════════════════════════════════════════════════════════
# Routes — Human in the Graph (Arbitrage humain)
# ══════════════════════════════════════════════════════════════

@router.post("/human-decision", summary="Soumettre une décision humaine")
async def submit_human_decision(req: HumanDecisionRequest):
    """
    L'utilisateur soumet sa décision pour un nœud humain (HumanNode).
    """
    node = human_node_manager.submit_decision(
        node_id=req.human_node_id,
        decision=req.decision,
        decided_by=req.decided_by,
        decision_data=req.decision_data,
    )
    if not node:
        raise HTTPException(status_code=404, detail="Nœud humain introuvable")
    return {"human_node": node.to_dict(), "resolved": True}


@router.get("/human-nodes/pending", summary="Lister les décisions humaines en attente")
async def list_pending_human_nodes(mission_id: Optional[str] = None):
    """Récupère tous les arbitrages humains en attente."""
    nodes = human_node_manager.get_pending(mission_id=mission_id)
    return {
        "pending_nodes": [n.to_dict() for n in nodes],
        "count": len(nodes),
    }


# ══════════════════════════════════════════════════════════════
# Routes — Agent Pulse
# ══════════════════════════════════════════════════════════════

@router.get("/pulse/{agent_id}", summary="Récupérer l'état de pulsation de l'agent")
async def get_agent_pulse(agent_id: str):
    """Récupère l'état de présence dynamique d'un agent."""
    snapshot = agent_pulse.get_or_create(agent_id)
    return {"pulse": snapshot.to_dict()}


@router.post("/pulse/{agent_id}/transition", summary="Changer l'état de pulsation")
async def transition_agent_pulse(agent_id: str, req: PulseTransitionRequest):
    """Effectue une transition d'état de pulsation de l'agent."""
    try:
        new_state = PulseState(req.state)
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail=f"État invalide. Choix possibles: {[s.value for s in PulseState]}",
        )

    snapshot = agent_pulse.transition(
        agent_id=agent_id,
        new_state=new_state,
        message=req.message,
        activity_description=req.activity_description,
        current_tool=req.current_tool,
        progress=req.progress,
    )
    return {"pulse": snapshot.to_dict()}


# ══════════════════════════════════════════════════════════════
# Routes — Cognitive Latency & Event Spine (SSE)
# ══════════════════════════════════════════════════════════════

@router.get("/latency/{mission_id}", summary="Métriques de latence cognitive")
async def get_cognitive_latency(mission_id: str):
    """
    Récupère les métriques de ressenti cognitif pour une mission :
    time_to_understanding, time_to_first_action, time_to_first_evidence, time_to_control.
    """
    metrics = interpretation_layer.get_latency(mission_id)
    if not metrics:
        raise HTTPException(status_code=404, detail="Métriques introuvables pour cette mission")
    return {"metrics": metrics}


@router.get("/events/stream", summary="Flux SSE des événements cognitifs explicables")
async def stream_cognitive_events(mission_id: Optional[str] = None):
    """
    Flux SSE continu des événements cognitifs (Event Spine).
    Ne transmet QUE des événements explicables et sanitizés.
    """
    async def event_generator():
        # Envoyer les événements récents en premier
        recent = interpretation_layer.get_cognitive_log(mission_id=mission_id, limit=10)
        for item in recent:
            yield f"data: {json.dumps(item, ensure_ascii=False)}\n\n"

        # Boucle de stream avec ping de maintien
        for _ in range(30):  # 30 pings de 1 seconde pour ce stream de test/demo
            await asyncio.sleep(1.0)
            yield f": ping\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
