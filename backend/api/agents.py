"""
GabomaGPT — API Agents (LangGraph) · SmartANDJ AI Technologies
Endpoints FastAPI pour le graphe de raisonnement LangGraph.
Fondateur : Daniel Jonathan ANDJ
"""

import json
import logging
from typing import AsyncGenerator, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from core.config import settings
from core.security import get_current_user_id
from agents.graph import gabomagpt_graph

logger = logging.getLogger("gabomagpt.api.agents")

router = APIRouter(prefix="/api/agents", tags=["Agents LangGraph"])


# ── Schémas ──────────────────────────────────────────────
class AgentRequest(BaseModel):
    """Requête vers le graphe LangGraph."""
    message: str
    mode: str = "flash"  # flash | pro | black-panther
    language: str = "fr"
    conversation_id: Optional[str] = None


class AgentResponse(BaseModel):
    """Réponse du graphe LangGraph."""
    response: str
    intent: str
    model_used: Optional[str] = None
    tokens_used: int = 0
    msisdn_valid: Optional[bool] = None
    msisdn_operator: Optional[str] = None
    tavily_context: Optional[str] = None
    steps: list[str] = []
    error: Optional[str] = None


class MSISDNValidationRequest(BaseModel):
    """Requête de validation MSISDN."""
    msisdn: str


class MSISDNValidationResponse(BaseModel):
    """Réponse de validation MSISDN."""
    msisdn: str
    valid: bool
    operator: Optional[str] = None
    error: Optional[str] = None


# ── Endpoints ─────────────────────────────────────────────

@router.post("/invoke", response_model=AgentResponse)
async def invoke_agent(
    body: AgentRequest,
    user_id: str = Depends(get_current_user_id),
) -> AgentResponse:
    """
    Invoque le graphe LangGraph de GabomaGPT.
    Le graphe classifie l'intention, route vers le bon nœud,
    et retourne une réponse enrichie.
    """
    try:
        # Préparer l'état initial
        initial_state = {
            "user_message": body.message,
            "user_id": user_id,
            "mode": body.mode,
            "language": body.language,
            "conversation_id": body.conversation_id,
            "steps_taken": [],
            "tavily_results": [],
            "llm_tokens_used": 0,
        }

        # Exécuter le graphe
        result = await gabomagpt_graph.ainvoke(initial_state)

        return AgentResponse(
            response=result.get("llm_response", "Aucune réponse générée."),
            intent=result.get("intent", "unknown"),
            model_used=result.get("llm_model_used"),
            tokens_used=result.get("llm_tokens_used", 0),
            msisdn_valid=result.get("msisdn_valid"),
            msisdn_operator=result.get("msisdn_operator"),
            tavily_context=result.get("tavily_context"),
            steps=result.get("steps_taken", []),
            error=result.get("error"),
        )

    except Exception as e:
        logger.error("Erreur agent LangGraph : %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur du moteur de raisonnement : {str(e)}",
        )


@router.post("/stream")
async def stream_agent(
    body: AgentRequest,
    user_id: str = Depends(get_current_user_id),
) -> StreamingResponse:
    """
    Stream la réponse du graphe LangGraph via SSE.
    Envoie des événements de progression pour chaque nœud traversé.
    """

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            initial_state = {
                "user_message": body.message,
                "user_id": user_id,
                "mode": body.mode,
                "language": body.language,
                "conversation_id": body.conversation_id,
                "steps_taken": [],
                "tavily_results": [],
                "llm_tokens_used": 0,
            }

            # Événement de début
            yield _sse("agent_start", {"message": "Analyse en cours..."})

            # Exécuter le graphe (non-streaming, on stream les étapes)
            result = await gabomagpt_graph.ainvoke(initial_state)

            # Envoyer les étapes traversées
            for step in result.get("steps_taken", []):
                yield _sse("step", {"node": step})

            # Envoyer le résultat
            response_text = result.get("llm_response", "")
            yield _sse("response", {
                "content": response_text,
                "intent": result.get("intent", "unknown"),
                "model": result.get("llm_model_used"),
            })

            yield _sse("done", {"tokens": result.get("llm_tokens_used", 0)})

        except Exception as e:
            logger.error("Erreur stream agent : %s", str(e))
            yield _sse("error", {"content": str(e)})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/validate-msisdn", response_model=MSISDNValidationResponse)
async def validate_msisdn_endpoint(
    body: MSISDNValidationRequest,
) -> MSISDNValidationResponse:
    """
    Endpoint dédié à la validation MSISDN.
    Vérifie le format et identifie l'opérateur (Airtel/Moov).
    """
    from agents.nodes import validate_msisdn

    result = validate_msisdn({"msisdn": body.msisdn, "steps_taken": []})

    return MSISDNValidationResponse(
        msisdn=result.get("msisdn", body.msisdn),
        valid=result.get("msisdn_valid", False),
        operator=result.get("msisdn_operator"),
        error=result.get("msisdn_error"),
    )


@router.get("/health")
async def agent_health() -> dict:
    """Vérifie que le moteur LangGraph est opérationnel."""
    try:
        # Test simple : le graphe est-il compilé ?
        _ = gabomagpt_graph.get_graph()
        return {
            "status": "healthy",
            "engine": "LangGraph",
            "nodes": ["classify_intent", "validate_msisdn", "tavily_search",
                       "conversational_handler", "transactional_handler"],
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


def _sse(event_type: str, data: dict) -> str:
    """Formate un événement SSE."""
    payload = json.dumps({"type": event_type, **data}, ensure_ascii=False)
    return f"data: {payload}\n\n"
