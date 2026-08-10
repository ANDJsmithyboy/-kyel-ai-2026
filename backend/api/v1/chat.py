"""
GabomaAI — API v1 Chat Completions · SmartANDJ AI Technologies
Streaming SSE via Groq + LOXO RAG + Sauvegarde en DB Neon.
Protégé par Clerk JWKS.
Fondateur : Daniel Jonathan ANDJ
"""

import json
from typing import AsyncGenerator, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from core.security import get_current_user
from core.database import save_message, deduct_credits, get_conversation, save_conversation
from services.groq_service import stream_groq
from services.qdrant_service import query_qdrant, format_loxo_context

router = APIRouter(prefix="/v1", tags=["Chat v1"])


class ChatMessage(BaseModel):
    role: str = Field(..., description="user | assistant | system")
    content: str


class ChatCompletionRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str = Field(..., description="Dernier message de l'utilisateur")
    history: list[ChatMessage] = Field(default_factory=list)
    model: str = Field(default="AURATA", description="AURATA | SONAR")
    loxo_enabled: bool = False
    language: str = "fr"


async def stream_chat_response(
    req: ChatCompletionRequest,
    user: dict,
) -> AsyncGenerator[str, None]:
    """Gère le flux SSE, la recherche LOXO, et sauvegarde en DB."""

    conversation_id = req.conversation_id
    user_id = user["id"]

    # 1. Gérer la conversation
    if not conversation_id:
        # Créer une nouvelle conversation
        title = req.message[:50] + "..." if len(req.message) > 50 else req.message
        conversation_id = await save_conversation(user_id, title, req.model, "chat")
    else:
        # Vérifier que la conversation appartient à l'utilisateur
        conv = await get_conversation(conversation_id, user_id)
        if not conv:
            yield f"data: {json.dumps({'error': 'Conversation non trouvée'})}\n\n"
            yield "data: [DONE]\n\n"
            return

    # 2. Sauvegarder le message de l'utilisateur
    await save_message(
        conversation_id=conversation_id,
        user_id=user_id,
        role="user",
        content=req.message,
    )

    # 3. Radar LOXO (Recherche RAG)
    loxo_context = None
    sources = None
    if req.loxo_enabled:
        yield f"data: {json.dumps({'type': 'status', 'content': 'Radar LOXO actif...'})}\n\n"
        chunks = await query_qdrant(req.message, top_k=3)
        if chunks:
            loxo_context = format_loxo_context(chunks)
            sources = chunks
            yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"

    # 4. Construire l'historique complet pour Groq
    messages = [{"role": m.role, "content": m.content} for m in req.history]
    messages.append({"role": "user", "content": req.message})

    # 5. Lancer le stream Groq
    full_content = ""
    tokens_in = 0
    tokens_out = 0

    async for event in stream_groq(
        messages=messages,
        model=req.model,
        loxo_context=loxo_context,
    ):
        if event["type"] == "token":
            full_content += event["text"]
            # Format SSE compatible OpenAI/Gaboma
            yield f"data: {json.dumps({'type': 'token', 'content': event['text']})}\n\n"
            
        elif event["type"] == "usage":
            tokens_in = event.get("tokens_in", 0)
            tokens_out = event.get("tokens_out", 0)
            
        elif event["type"] == "error":
            yield f"data: {json.dumps({'error': event['message']})}\n\n"

    # 6. Fin du stream : Sauvegarder la réponse de l'assistant
    if full_content:
        await save_message(
            conversation_id=conversation_id,
            user_id=user_id,
            role="assistant",
            content=full_content,
            model=req.model,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            sources=sources,
        )

        # Déduire les crédits (ex: 1 crédit par message, ou basé sur tokens)
        await deduct_credits(user_id, 1, req.model, "chat")

    # Clôture SSE incluant le conversation_id généré si nouveau
    yield f"data: {json.dumps({'type': 'done', 'conversation_id': conversation_id})}\n\n"
    yield "data: [DONE]\n\n"


@router.post("/chat/completions")
async def chat_completions(
    req: ChatCompletionRequest,
    user: dict = Depends(get_current_user),
):
    """
    Endpoint principal de chat (AURATA/SONAR).
    Protégé par JWT Clerk. Stream via SSE.
    """
    # Vérifier les crédits
    if user.get("credits", 0) <= 0:
        raise HTTPException(status_code=402, detail="Crédits épuisés")

    return StreamingResponse(
        stream_chat_response(req, user),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
