"""
Ñkyel AI · Router : Chat
POST /api/chat — streaming et non-streaming.
"""

import json
import uuid
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.models.schemas import ChatRequest, ModelId
from app.services.groq_service import groq_chat, groq_chat_stream
from app.services.wandana_service import wandana_search_and_summarize
from app.auth.clerk import get_current_user

router = APIRouter()


@router.post("/chat")
async def chat(
    request: ChatRequest,
    user: dict = Depends(get_current_user),
):
    """
    Endpoint principal de chat.
    Supporte le streaming SSE et le mode WANDANA (recherche web).
    """
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    # Si WANDANA est activé, enrichir le dernier message avec la recherche web
    if request.wandana_enabled and messages:
        last_user_msg = next(
            (m["content"] for m in reversed(messages) if m["role"] == "user"),
            None,
        )
        if last_user_msg:
            augmented = await wandana_search_and_summarize(last_user_msg, messages)
            messages.append({"role": "system", "content": augmented})

    model_id = request.model.value

    if request.stream:
        return StreamingResponse(
            _stream_response(model_id, messages),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    else:
        content = await groq_chat(model_id, messages)
        return {
            "id": str(uuid.uuid4()),
            "model": request.model.name,
            "content": content,
        }


async def _stream_response(model_id: str, messages: list):
    """Générateur SSE pour le streaming."""
    msg_id = str(uuid.uuid4())

    # Événement de début
    yield f"data: {json.dumps({'type': 'start', 'id': msg_id})}\n\n"

    # Chunks de contenu
    async for chunk in groq_chat_stream(model_id, messages):
        payload = json.dumps({"type": "chunk", "content": chunk})
        yield f"data: {payload}\n\n"

    # Événement de fin
    yield f"data: {json.dumps({'type': 'end', 'id': msg_id})}\n\n"
