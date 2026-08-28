"""
Ñkyel AI — API v1 Chat Completions · SmartANDJ AI Technologies
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
from db.models import Conversation, Message
from db.session import async_session
from sqlalchemy import select
from services.groq_service import stream_groq
from services.qdrant_service import query_qdrant, format_loxo_context

router = APIRouter(tags=["Chat v1"])


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
    """Gère le flux SSE, la recherche LOXO, et sauvegarde en DB Neon."""

    conversation_id_str = req.conversation_id
    user_id = user["id"]

    # 1. Gérer la conversation
    if not conversation_id_str:
        yield f"data: {json.dumps({'error': 'conversation_id requis via la nouvelle API'})}\n\n"
        yield "data: [DONE]\n\n"
        return

    import uuid
    try:
        conv_uuid = uuid.UUID(conversation_id_str)
    except:
        yield f"data: {json.dumps({'error': 'conversation_id invalide'})}\n\n"
        yield "data: [DONE]\n\n"
        return

    async with async_session() as session:
        # Vérifier que la conversation existe
        stmt = select(Conversation).where(Conversation.id == conv_uuid)
        result = await session.execute(stmt)
        conv = result.scalar_one_or_none()

        if not conv:
            yield f"data: {json.dumps({'error': 'Conversation non trouvée'})}\n\n"
            yield "data: [DONE]\n\n"
            return
            
        # Get next sequence for user message
        seq_stmt = select(Message.sequence).where(Message.conversation_id == conv_uuid).order_by(Message.sequence.desc()).limit(1)
        seq_res = await session.execute(seq_stmt)
        last_seq = seq_res.scalar_one_or_none() or 0
        
        user_msg = Message(
            conversation_id=conv_uuid,
            role="user",
            content_text=req.message,
            sequence=last_seq + 1
        )
        session.add(user_msg)
        await session.commit()

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
            # Format SSE compatible OpenAI/Ñkyel
            yield f"data: {json.dumps({'type': 'token', 'content': event['text']})}\n\n"
            
        elif event["type"] == "usage":
            tokens_in = event.get("tokens_in", 0)
            tokens_out = event.get("tokens_out", 0)
            
        elif event["type"] == "error":
            yield f"data: {json.dumps({'error': event['message']})}\n\n"

    # 6. Fin du stream : Sauvegarder la réponse de l'assistant
    if full_content:
        async with async_session() as session:
            seq_stmt = select(Message.sequence).where(Message.conversation_id == conv_uuid).order_by(Message.sequence.desc()).limit(1)
            seq_res = await session.execute(seq_stmt)
            last_seq = seq_res.scalar_one_or_none() or 0
            
            asst_msg = Message(
                conversation_id=conv_uuid,
                role="assistant",
                content_text=full_content,
                model_profile=req.model,
                sequence=last_seq + 1,
                content_json={"sources": sources} if sources else None
            )
            session.add(asst_msg)
            
            # Update conversation last_message_at
            from datetime import datetime, timezone
            conv_stmt = select(Conversation).where(Conversation.id == conv_uuid)
            conv_res = await session.execute(conv_stmt)
            conv_obj = conv_res.scalar_one_or_none()
            if conv_obj:
                conv_obj.last_message_at = datetime.now(timezone.utc)
                
            await session.commit()

    # Clôture SSE incluant le conversation_id généré si nouveau
    yield f"data: {json.dumps({'type': 'done', 'conversation_id': conversation_id_str})}\n\n"
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
