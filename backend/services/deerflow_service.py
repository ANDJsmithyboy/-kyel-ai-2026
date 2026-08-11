"""
Ñkyel AI — Service DeerFlow (ONYX / BLACK_PANTHER) · SmartANDJ AI Technologies
Bridge SSE vers DeerFlow 2.0 sur RunPod.
Fondateur : Daniel Jonathan ANDJ
"""

import json
import time
import uuid
from typing import AsyncGenerator, Optional

import httpx

from core.config import settings

async def stream_deerflow(
    goal: str,
    conversation_id: str,
    model: str = "ONYXGRIS",
    context: Optional[str] = None,
    plan_mode: bool = False,
) -> AsyncGenerator[dict, None]:
    """
    Appelle DeerFlow 2.0 via HTTP/SSE et yield les événements natifs LangGraph
    (messages-tuple, values, end) pour que le frontend ZION-CORE-V2 puisse
    afficher l'UI riche.
    Yield aussi un event 'done' à la fin pour sauvegarder en DB.
    """
    deerflow_url = settings.deerflow_url
    session_id = f"agent-{uuid.uuid4().hex[:12]}"
    start_time = time.time()

    yield {"type": "session_start", "session_id": session_id, "model": model}

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            # Créer un thread DeerFlow
            thread_resp = await client.post(
                f"{deerflow_url}/api/v1/threads",
                json={"goal": goal, "context": context or ""},
            )

            if thread_resp.status_code >= 400:
                # DeerFlow non disponible — fallback direct
                yield {"type": "agent_step", "step": {"type": "fallback", "label": "Mode direct activé", "status": "warning"}}

                from services.groq_service import stream_groq
                agent_messages = [
                    {"role": "user", "content": f"[MODE AGENT]\nObjectif: {goal}\n\nContexte: {context or 'Aucun'}\n\nAnalyse en profondeur, structure ta réponse avec des sections claires."},
                ]
                full_content = ""
                async for event in stream_groq(agent_messages, model="WANDANA", temperature=0.3, max_tokens=8192):
                    if event["type"] == "token":
                        full_content += event["text"]
                        yield event
                    elif event["type"] == "done":
                        yield {"type": "done", "content": full_content, "fallback": True}
                return

            thread_data = thread_resp.json()
            thread_id = thread_data.get("thread_id", session_id)

            # Lancer le run en streaming
            async with client.stream(
                "POST",
                f"{deerflow_url}/api/v1/threads/{thread_id}/runs/stream",
                json={
                    "goal": goal,
                    "context": context or "",
                    "plan_mode": plan_mode,
                },
                timeout=180.0,
            ) as response:
                full_content = ""

                async for line in response.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    data_str = line[6:]
                    if data_str == "[DONE]":
                        break

                    try:
                        event_data = json.loads(data_str)
                        event_type = event_data.get("type", "")
                        
                        # Accumuler le texte pour la sauvegarde DB en fin de stream
                        if event_type == "messages-tuple":
                            payload = event_data.get("data", {})
                            if payload.get("type") == "ai" and "content" in payload:
                                # Les messages-tuple envoient des deltas de tokens
                                full_content += payload["content"]

                        # Relayer l'événement LangGraph natif (messages-tuple, values, etc.)
                        yield event_data

                    except json.JSONDecodeError:
                        continue

                duration_ms = int((time.time() - start_time) * 1000)
                yield {
                    "type": "done",
                    "content": full_content,
                    "session_id": session_id,
                    "thread_id": thread_id,
                    "duration_ms": duration_ms,
                }

    except (httpx.ConnectError, httpx.ReadTimeout) as e:
        yield {"type": "agent_step", "step": {"type": "fallback", "label": "DeerFlow hors ligne — mode direct", "status": "warning"}}

        from services.groq_service import stream_groq
        agent_messages = [
            {"role": "user", "content": f"[MODE AGENT FALLBACK]\nObjectif: {goal}\n\nContexte: {context or 'Aucun'}"},
        ]
        full_content = ""
        async for event in stream_groq(agent_messages, model="WANDANA", temperature=0.3, max_tokens=8192):
            if event["type"] == "token":
                full_content += event["text"]
                yield event
            elif event["type"] == "done":
                yield {"type": "done", "content": full_content, "fallback": True}

    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        yield {"type": "error", "message": str(e), "duration_ms": duration_ms}

