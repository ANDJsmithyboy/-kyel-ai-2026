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
