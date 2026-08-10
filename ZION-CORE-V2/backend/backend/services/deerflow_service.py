"""
GabomaAI — Service DeerFlow (ONYX / BLACK_PANTHER) · SmartANDJ AI Technologies
Bridge SSE vers DeerFlow 2.0 sur RunPod.
Fondateur : Daniel Jonathan ANDJ
"""

import json
import time
import uuid
from typing import AsyncGenerator, Optional

import httpx

from core.config import settings

# ── Mapping événements DeerFlow → labels publics ─────────────
_STEP_LABELS = {
    "planner": "Planification…",
    "web_search": "Radar LOXO…",
    "reporter": "Rédaction du rapport…",
    "coder": "Écriture du code…",
    "reviewer": "Révision…",
    "artifact": "Le Rendu",
}


async def stream_deerflow(
    goal: str,
    conversation_id: str,
    model: str = "ONYX",
    context: Optional[str] = None,
    plan_mode: bool = False,
) -> AsyncGenerator[dict, None]:
    """
    Appelle DeerFlow via HTTP/SSE et yield des événements structurés :
      {type: "agent_step", step: {type, label, status}}
      {type: "token", text: "..."}
      {type: "rendu", rendu: {...}}
      {type: "done", content: "..."}
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
                # DeerFlow non disponible — fallback Groq
                yield {"type": "agent_step", "step": {"type": "fallback", "label": "Mode direct activé", "status": "warning"}}

                # Fallback vers Groq en mode agent
                from services.groq_service import stream_groq
                agent_messages = [
                    {"role": "user", "content": f"[MODE AGENT]\nObjectif: {goal}\n\nContexte: {context or 'Aucun'}\n\nAnalyse en profondeur, structure ta réponse avec des sections claires. Si pertinent, propose un plan d'action étape par étape."},
                ]
                full_content = ""
                async for event in stream_groq(agent_messages, model="SONAR", temperature=0.3, max_tokens=8192):
                    if event["type"] == "token":
                        full_content += event["text"]
                        yield event
                    elif event["type"] == "done":
                        yield {"type": "done", "content": full_content, "fallback": True}
                return

            thread_data = thread_resp.json()
            thread_id = thread_data.get("thread_id", session_id)

            # Lancer le run en streaming
            yield {"type": "agent_step", "step": {"type": "planner", "label": "Planification…", "status": "running"}}

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
                current_step = None

                async for line in response.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    data_str = line[6:]
                    if data_str == "[DONE]":
                        break

                    try:
                        event_data = json.loads(data_str)
                        event_type = event_data.get("type", "")

                        # Mapper les événements DeerFlow
                        if event_type in _STEP_LABELS:
                            if current_step:
                                yield {"type": "agent_step", "step": {"type": current_step, "label": _STEP_LABELS.get(current_step, current_step), "status": "done"}}
                            current_step = event_type
                            yield {"type": "agent_step", "step": {"type": event_type, "label": _STEP_LABELS[event_type], "status": "running"}}

                        elif event_type == "token" or event_type == "content":
                            text = event_data.get("text", event_data.get("content", ""))
                            if text:
                                full_content += text
                                yield {"type": "token", "text": text}

                        elif event_type == "artifact":
                            yield {
                                "type": "rendu",
                                "rendu": {
                                    "title": event_data.get("title", "Le Rendu"),
                                    "type": event_data.get("artifact_type", "doc"),
                                    "content": event_data.get("content", ""),
                                    "language": event_data.get("language"),
                                },
                            }

                        elif event_type == "error":
                            yield {"type": "error", "message": event_data.get("message", "Erreur agent")}

                    except json.JSONDecodeError:
                        continue

                # Fermer le dernier step
                if current_step:
                    yield {"type": "agent_step", "step": {"type": current_step, "label": _STEP_LABELS.get(current_step, current_step), "status": "done"}}

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
        async for event in stream_groq(agent_messages, model="SONAR", temperature=0.3, max_tokens=8192):
            if event["type"] == "token":
                full_content += event["text"]
                yield event
            elif event["type"] == "done":
                yield {"type": "done", "content": full_content, "fallback": True}

    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        yield {"type": "error", "message": str(e), "duration_ms": duration_ms}
