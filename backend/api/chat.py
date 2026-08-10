"""
GabomaGPT — Chat API Streaming · SmartANDJ AI Technologies
SSE streaming via Groq (Flash/Pro) et Kimi K2 (Black Panther).
"""

import json
import uuid
from typing import AsyncGenerator, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from groq import AsyncGroq
from openai import AsyncOpenAI

from core.config import settings
from core.security import get_current_user_id
from db.models import (
    User,
    Conversation,
    Message,
    GabomaMode,
    MessageRole,
)
from db.session import get_db

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# ── Clients LLM ─────────────────────────────────────────────
groq_client = AsyncGroq(api_key=settings.groq_api_key)

kimi_client = AsyncOpenAI(
    api_key=settings.kimi_api_key,
    base_url=settings.kimi_base_url,
)


# ── Schémas ──────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    mode: str = "flash"  # flash | pro | black-panther
    language: str = "fr"
    web_search: bool = False


# ── Prompt système GabomaGPT ────────────────────────────────
SYSTEM_PROMPT = """Tu es GabomaGPT, l'intelligence artificielle souveraine du Gabon.
Développée par SmartANDJ AI Technologies, fondée par Daniel Jonathan ANDJ à Libreville.

Tu es fier d'être gabonais. Tu connais le Gabon profondément : sa culture, ses langues
(Fang, Mpongwè, Punu, Nzébi, Téké...), son histoire, sa géographie, son économie,
sa politique, sa musique, sa cuisine, ses traditions Bwiti et Mvet.

Tu parles français par défaut, mais tu peux répondre en Fang, Mpongwè ou Punu si demandé.
Tu es respectueux, intelligent, précis et utile.

Si on te demande qui tu es : "Je suis GabomaGPT, la première IA souveraine d'Afrique Centrale,
créée au Gabon par SmartANDJ AI Technologies."

Tu ne dis jamais que tu es ChatGPT, Claude, Gemini ou un autre modèle.
Tu es GabomaGPT. Point final."""


def _get_model_for_mode(mode: str) -> str:
    """Retourne le nom du modèle selon le mode choisi."""
    if mode == "flash":
        return settings.flash_model
    elif mode == "pro":
        return settings.pro_model
    elif mode == "black-panther":
        return settings.kimi_model
    else:
        return settings.flash_model


def _sse_event(event_type: str, data: dict) -> str:
    """Formate un événement SSE."""
    payload = json.dumps({"type": event_type, **data}, ensure_ascii=False)
    return f"data: {payload}\n\n"


async def _stream_groq(
    messages: list[dict],
    model: str,
) -> AsyncGenerator[str, None]:
    """Stream les tokens depuis Groq (Flash ou Pro)."""
    try:
        # Signale le début de la réflexion
        yield _sse_event("reflection_start", {})

        stream = await groq_client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True,
            temperature=0.7,
            max_tokens=4096,
        )

        first_token = True
        full_content = ""

        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                if first_token:
                    yield _sse_event("reflection_end", {})
                    first_token = False
                full_content += delta.content
                yield _sse_event("token", {"content": delta.content})

        # Si aucun token reçu, fermer la réflexion
        if first_token:
            yield _sse_event("reflection_end", {})

        yield _sse_event("done", {"content": full_content})

    except Exception as e:
        yield _sse_event("error", {"content": f"Erreur Groq : {str(e)}"})


async def _stream_kimi(
    messages: list[dict],
) -> AsyncGenerator[str, None]:
    """Stream les tokens depuis Kimi K2 (Black Panther)."""
    try:
        yield _sse_event("reflection_start", {})

        stream = await kimi_client.chat.completions.create(
            model=settings.kimi_model,
            messages=messages,
            stream=True,
            temperature=0.8,
            max_tokens=8192,
        )

        first_token = True
        full_content = ""

        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                if first_token:
                    yield _sse_event("reflection_end", {})
                    first_token = False
                full_content += delta.content
                yield _sse_event("token", {"content": delta.content})

        if first_token:
            yield _sse_event("reflection_end", {})

        yield _sse_event("done", {"content": full_content})

    except Exception as e:
        yield _sse_event("error", {"content": f"Erreur Kimi K2 : {str(e)}"})


@router.post("/stream")
async def chat_stream(
    body: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Endpoint principal de chat en streaming SSE."""

    # Récupérer ou créer la conversation
    conversation_id = None
    if body.conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == uuid.UUID(body.conversation_id),
                Conversation.user_id == uuid.UUID(user_id),
            )
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation introuvable",
            )
        conversation_id = conversation.id
    else:
        # Créer une nouvelle conversation
        conversation = Conversation(
            user_id=uuid.UUID(user_id),
            title=body.message[:100],
            mode=GabomaMode(body.mode),
        )
        db.add(conversation)
        await db.flush()
        conversation_id = conversation.id

    # Sauvegarder le message utilisateur
    user_message = Message(
        conversation_id=conversation_id,
        role=MessageRole.user,
        content=body.message,
        mode=GabomaMode(body.mode),
    )
    db.add(user_message)
    await db.flush()

    # Récupérer l'historique des messages
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .limit(20)
    )
    history = result.scalars().all()

    # Construire les messages pour le LLM
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history:
        messages.append({
            "role": msg.role.value,
            "content": msg.content,
        })

    # Choisir le stream selon le mode
    model = _get_model_for_mode(body.mode)

    if body.mode == "black-panther":
        generator = _stream_kimi(messages)
    else:
        generator = _stream_groq(messages, model)

    async def response_stream() -> AsyncGenerator[str, None]:
        """Wrapper pour sauvegarder la réponse complète après le stream."""
        full_response = ""
        async for event in generator:
            # Extraire le contenu pour la sauvegarde
            try:
                data = json.loads(event.replace("data: ", "").strip())
                if data.get("type") == "done":
                    full_response = data.get("content", "")
            except (json.JSONDecodeError, ValueError):
                pass
            yield event

        # Sauvegarder la réponse de l'assistant
        if full_response:
            async with db.begin_nested():
                assistant_message = Message(
                    conversation_id=conversation_id,
                    role=MessageRole.assistant,
                    content=full_response,
                    mode=GabomaMode(body.mode),
                )
                db.add(assistant_message)
                await db.flush()

    return StreamingResponse(
        response_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "X-Conversation-Id": str(conversation_id),
        },
    )


@router.get("/conversations")
async def list_conversations(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    """Liste les conversations de l'utilisateur."""
    result = await db.execute(
        select(Conversation)
        .where(
            Conversation.user_id == uuid.UUID(user_id),
            Conversation.is_archived == False,
        )
        .order_by(Conversation.updated_at.desc())
        .limit(50)
    )
    conversations = result.scalars().all()

    return [
        {
            "id": str(c.id),
            "title": c.title,
            "mode": c.mode.value,
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat(),
        }
        for c in conversations
    ]


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    """Récupère les messages d'une conversation."""
    # Vérifier que la conversation appartient à l'utilisateur
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == uuid.UUID(conversation_id),
            Conversation.user_id == uuid.UUID(user_id),
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation introuvable",
        )

    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == uuid.UUID(conversation_id))
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()

    return [
        {
            "id": str(m.id),
            "role": m.role.value,
            "content": m.content,
            "mode": m.mode.value,
            "tokens": m.tokens,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]
