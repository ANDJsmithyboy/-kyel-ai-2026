"""
GabomaAI — API v1 Agent · SmartANDJ AI Technologies
Streaming SSE via DeerFlow (ONYX / BLACK_PANTHER) + Sauvegarde DB Neon.
Protégé par Clerk JWKS.
Fondateur : Daniel Jonathan ANDJ
"""

import json
from typing import AsyncGenerator, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from core.security import get_current_user
from core.database import (
    save_message,
    deduct_credits,
    get_conversation,
    save_conversation,
    save_agent_session,
    update_agent_session_status
)
from services.deerflow_service import stream_deerflow

router = APIRouter(prefix="/v1", tags=["Agent v1"])


class AgentRunRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str = Field(..., description="Objectif pour l'agent")
    context: Optional[str] = None
    model: str = Field(default="ONYX", description="ONYX | BLACK_PANTHER")
    plan_mode: bool = False


async def stream_agent_wrapper(
    req: AgentRunRequest,
    user: dict,
) -> AsyncGenerator[str, None]:
    """Gère le flux SSE DeerFlow et sauvegarde tout en DB."""

    conversation_id = req.conversation_id
    user_id = user["id"]

    # 1. Gérer la conversation
    if not conversation_id:
        title = req.message[:50] + "..." if len(req.message) > 50 else req.message
        conversation_id = await save_conversation(user_id, title, req.model, "agent")
    else:
        conv = await get_conversation(conversation_id, user_id)
        if not conv:
            yield f"data: {json.dumps({'error': 'Conversation non trouvée'})}\n\n"
            yield "data: [DONE]\n\n"
            return

    # 2. Sauvegarder l'objectif (message user)
    await save_message(
        conversation_id=conversation_id,
        user_id=user_id,
        role="user",
        content=req.message,
    )

    # 3. Stream DeerFlow
    full_content = ""
    agent_steps = []
    session_id = None
    thread_id = None
    fallback_used = False

    async for event in stream_deerflow(
        goal=req.message,
        conversation_id=conversation_id,
        model=req.model,
        context=req.context,
        plan_mode=req.plan_mode,
    ):
        if event["type"] == "session_start":
            session_id = event.get("session_id")
            # Sauvegarder la session agent en DB
            await save_agent_session(
                user_id=user_id,
                conversation_id=conversation_id,
                deerflow_thread_id=session_id,
                model=req.model,
            )

        elif event["type"] == "agent_step":
            agent_steps.append(event["step"])
            if event["step"]["type"] == "fallback":
                fallback_used = True

        elif event["type"] == "done":
            full_content = event.get("content", full_content)
            thread_id = event.get("thread_id")

        # Renvoyer l'événement tel quel en SSE
        yield f"data: {json.dumps(event)}\n\n"

    # 4. Fin du stream : Sauvegarder la réponse de l'assistant + steps
    if full_content or agent_steps:
        await save_message(
            conversation_id=conversation_id,
            user_id=user_id,
            role="assistant",
            content=full_content,
            model=req.model,
            agent_steps={"steps": agent_steps, "fallback": fallback_used},
        )
        
        if session_id:
            await update_agent_session_status(session_id, "done")

        # Les agents coûtent plus cher (ex: 5 crédits)
        await deduct_credits(user_id, 5, req.model, "agent")

    # Clôture SSE avec le conversation_id
    yield f"data: {json.dumps({'type': 'done_all', 'conversation_id': conversation_id, 'thread_id': thread_id})}\n\n"
    yield "data: [DONE]\n\n"


@router.post("/agent/run")
async def agent_run(
    req: AgentRunRequest,
    user: dict = Depends(get_current_user),
):
    """
    Lance un agent DeerFlow (ONYX / BLACK_PANTHER).
    Protégé par JWT Clerk. Stream SSE.
    """
    if user.get("credits", 0) < 5:
        raise HTTPException(status_code=402, detail="Crédits insuffisants pour le mode Agent (5 requis)")

    return StreamingResponse(
        stream_agent_wrapper(req, user),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
