# FILE: gaboma-api/routers/chat.py
import asyncio
from uuid import uuid4

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from models.chat import ChatRequest, ChatResponse, GabomaModel

router = APIRouter(prefix="/chat", tags=["Chat"])


def _display_name(model: GabomaModel) -> str:
    """Retourne uniquement les noms autorisés côté branding GabomaGPT."""
    mapping = {
        GabomaModel.flash: "GabomaGPT Flash",
        GabomaModel.pro: "GabomaGPT Pro",
        GabomaModel.black_panther: "GabomaGPT Black Panther",
    }
    return mapping[model]


@router.post(
    "",
    response_model=ChatResponse,
    summary="Créer une réponse de chat GabomaGPT",
    description="Endpoint non-streamé. Le branchement Open WebUI headless sera ajouté dans le slice Chat Core.",
)
async def create_chat_response(payload: ChatRequest) -> ChatResponse:
    """Réponse temporaire de contrat sans appeler de fournisseur tiers."""
    session_id = payload.session_id or str(uuid4())
    answer = (
        "Mbolo ! Le Gateway GabomaGPT est prêt. "
        "Le moteur Open WebUI headless sera connecté derrière FastAPI au prochain slice."
    )

    return ChatResponse(
        session_id=session_id,
        model=payload.model,
        display_name=_display_name(payload.model),
        answer=answer,
        token_estimate=len(answer.split()),
    )


@router.get(
    "/stream",
    summary="Streamer une réponse GabomaGPT en SSE",
    description="Flux Server-Sent Events optimisé pour Android. Aucun appel direct à Open WebUI depuis l'application mobile.",
)
async def stream_chat_response(
    message: str = Query(min_length=1, max_length=8000),
    model: GabomaModel = Query(default=GabomaModel.flash),
    session_id: str | None = Query(default=None, min_length=8, max_length=128),
) -> StreamingResponse:
    """Flux SSE de démonstration pour valider le client Android."""
    resolved_session_id = session_id or str(uuid4())
    display_name = _display_name(model)

    async def event_generator():
        yield f"event: session\ndata: {resolved_session_id}\n\n"
        yield f"event: model\ndata: {display_name}\n\n"

        words = [
            "Mbolo",
            "!",
            "GabomaGPT",
            "stream",
            "correctement",
            "via",
            "FastAPI",
            "SSE",
            ".",
        ]

        for word in words:
            await asyncio.sleep(0.08)
            yield f"event: token\ndata: {word}\n\n"

        yield "event: done\ndata: completed\n\n"

    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers=headers,
    )
