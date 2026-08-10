"""
GabomaAI · Agent Router
SmartANDJ AI Technologies
Endpoints FastAPI : SSE stream, WebSocket screencast, fichiers sandbox.
"""

import json
import uuid
import asyncio
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request, HTTPException
from fastapi.responses import StreamingResponse

from app.services.deerflow_service import deerflow_service
from app.services.browser_screencast import screencast_service

logger = logging.getLogger("gaboma.agent_router")

router = APIRouter(prefix="/api/agent", tags=["agent"])


# ──────────────────────────────────────────────
# POST /api/agent/start
# ──────────────────────────────────────────────
@router.post("/start")
async def start_agent_session(request: Request):
    """
    Crée une session agent et retourne le session_id.
    Body attendu : { "prompt": "...", "agent": "onyx" | "black-panther" }
    """
    body = await request.json()
    prompt = body.get("prompt", "")
    agent = body.get("agent", "onyx")

    if not prompt:
        raise HTTPException(status_code=400, detail="Le prompt est requis.")

    session_id = str(uuid.uuid4())
    agent_name = "lead_agent" if agent == "onyx" else "black_panther"
    thread_id = f"gaboma-{session_id[:8]}"

    return {
        "session_id": session_id,
        "thread_id": thread_id,
        "agent_name": agent_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


# ──────────────────────────────────────────────
# GET /api/agent/stream/{session_id}
# SSE relay des événements DeerFlow
# ──────────────────────────────────────────────
@router.get("/stream/{session_id}")
async def stream_agent(session_id: str, request: Request):
    """
    Relais SSE des événements de l'agent DeerFlow.
    Query params : prompt, thread_id, agent_name
    """
    prompt = request.query_params.get("prompt", "")
    thread_id = request.query_params.get("thread_id", f"gaboma-{session_id[:8]}")
    agent_name = request.query_params.get("agent_name", "lead_agent")

    if not prompt:
        raise HTTPException(status_code=400, detail="Le prompt est requis.")

    async def event_generator():
        async for chunk in deerflow_service.stream_agent(
            prompt=prompt,
            thread_id=thread_id,
            agent_name=agent_name,
        ):
            yield chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ──────────────────────────────────────────────
# WebSocket /ws/agent/browser/{session_id}
# Frames JPEG du navigateur Playwright
# ──────────────────────────────────────────────
@router.websocket("/browser/{session_id}")
async def ws_browser_screencast(websocket: WebSocket, session_id: str):
    """
    WebSocket binaire : envoie les frames JPEG du screencast CDP.
    Le client dessine chaque frame sur un <canvas>.
    """
    await websocket.accept()
    logger.info(f"WS browser connecté : {session_id}")

    # Chercher la queue de la session
    session = screencast_service._sessions.get(session_id)
    if not session:
        await websocket.send_json({"error": "Aucune session de screencast active."})
        await websocket.close()
        return

    queue = session.queue

    try:
        while True:
            frame = await asyncio.wait_for(queue.get(), timeout=30.0)
            if frame is None:
                # Fin du screencast
                break
            await websocket.send_bytes(frame)
    except asyncio.TimeoutError:
        logger.warning(f"WS timeout pour {session_id}")
    except WebSocketDisconnect:
        logger.info(f"WS browser déconnecté : {session_id}")
    except Exception as e:
        logger.error(f"WS browser erreur : {e}")
    finally:
        await websocket.close()


# ──────────────────────────────────────────────
# GET /api/agent/health
# ──────────────────────────────────────────────
@router.get("/health")
async def agent_health():
    """Statut du service agent."""
    return {
        "status": "ok",
        "deerflow_available": deerflow_service.client is not None,
        "active_screencasts": len(screencast_service._sessions),
    }
