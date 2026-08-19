"""
Ñkyel AI · Router : Agents
POST /api/agents/run — exécution d'agents DeerFlow.
"""

from fastapi import APIRouter, Depends

from app.models.schemas import AgentRunRequest, AgentRunResponse
from app.services.deerflow_service import deerflow
from app.auth.clerk import get_current_user

router = APIRouter()


@router.post("/agents/run", response_model=AgentRunResponse)
async def run_agent(
    request: AgentRunRequest,
    user: dict = Depends(get_current_user),
):
    """
    Lance un agent DeerFlow pour une tâche complexe.
    Limité à 1 exécution concurrente sur RunPod CPU.
    """
    result = await deerflow.run_agent(
        model_id=request.model.value,
        task=request.task,
        context=request.context,
        tool_names=request.tools,
    )

    return AgentRunResponse(
        id=result["id"],
        status=result["status"],
        result=result.get("result"),
        events=result.get("events"),
    )


@router.get("/agents/status")
async def agents_status(user: dict = Depends(get_current_user)):
    """Retourne le nombre d'agents actifs."""
    return {
        "active_runs": deerflow.active_run_count,
        "max_concurrent": deerflow.max_concurrent_runs,
    }


from pydantic import BaseModel
from typing import Dict, Any, Optional

class ReplanRequest(BaseModel):
    run_id: str
    edited_node_id: str
    updates: Dict[str, Any]
    user_id: str = "demo-user"

@router.post("/agents/replan")
async def replan_agent(
    request: ReplanRequest,
    user: dict = Depends(get_current_user),
):
    """
    Relance le runtime (nkyel_graph) depuis le dernier checkpoint 
    suite à une modification sémantique d'un nœud (ex: Hypothèse).
    """
    from backend.agents.nkyel_graph import build_nkyel_graph
    from backend.events.persistent_store import get_snapshot
    import json
    
    # 1. Charger le checkpoint
    checkpoint = get_snapshot(request.run_id)
    if not checkpoint:
        return {"error": "Snapshot non trouvé pour cette run_id."}
        
    # 2. Injecter la modification
    for node in checkpoint.get("nodes", []):
        if node.get("id") == request.edited_node_id:
            node.update(request.updates)
            break
            
    # 3. Indiquer qu'une replanification est requise
    checkpoint["replan_requested"] = True
    checkpoint["replan_reason"] = f"User edited node {request.edited_node_id}"
    
    # 4. Exécuter le graphe (en P0 on relance juste depuis "do_plan" vu qu'on a le state)
    graph = build_nkyel_graph()
    
    # Run the graph starting from the 'do_plan' node (since we're replanning)
    # Note: langgraph invoke runs the graph from the state. Since the state is already populated, 
    # if we just invoke, it will start from entrypoint unless we pass a specific config or the state 
    # dictates it. In this case, we just re-run plan directly.
    new_state = graph.invoke(checkpoint, {"configurable": {"thread_id": request.run_id}})
    
    return {
        "status": "completed",
        "run_id": request.run_id,
        "events": new_state.get("events", [])
    }
