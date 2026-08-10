"""
Ñkyel AI — Agent API Route · SmartANDJ AI Technologies
SSE streaming endpoint for the Ñkyel autonomous agent.

Emits events in AG-UI compatible format:
  data: {"type": "...", "data": {...}}

Fondateur : Daniel Jonathan ANDJ
"""

import json
import uuid
import asyncio
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field


router = APIRouter(prefix="/api/v1/nkyel", tags=["Ñkyel Agent"])


class NkyelRunRequest(BaseModel):
    """Request to start a Ñkyel agent run."""
    message: str = Field(..., description="The user's goal or question")
    user_id: str = Field(default="anonymous", description="User identifier")
    language: str = Field(default="fr", description="Language code")
    run_id: str | None = Field(default=None, description="Optional run ID for replay/resume")


class NkyelReplanRequest(BaseModel):
    """Request to trigger replanification."""
    run_id: str
    edited_node_id: str
    reason: str
    updates: dict = Field(default_factory=dict)


def _sse_event(event_type: str, data: dict) -> str:
    """Format an SSE event line."""
    payload = {"type": event_type, "data": data}
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


async def _run_nkyel_agent(request: NkyelRunRequest) -> AsyncGenerator[str, None]:
    """
    Run the Ñkyel agent graph and yield SSE events.
    Each event maps to a Canonical Work Graph event.
    """
    from agents.nkyel_graph import nkyel_graph

    run_id = request.run_id or f"run_{uuid.uuid4().hex[:8]}"

    # Emit run.created
    yield _sse_event("run_started", {
        "run_id": run_id,
        "status": "started",
        "message": request.message,
    })

    try:
        # Prepare initial state
        initial_state = {
            "user_message": request.message,
            "user_id": request.user_id,
            "language": request.language,
            "run_id": run_id,
            "nodes": [],
            "edges": [],
            "events": [],
            "search_results": [],
            "sources": [],
            "claims": [],
            "evidence": [],
            "hypotheses": [],
            "artifacts": [],
            "plan": [],
            "plan_version": 0,
            "steps_taken": [],
            "total_cost": 0.0,
            "total_latency_ms": 0,
            "replan_requested": False,
        }

        # Run the graph — stream events as they happen
        # LangGraph streams node outputs in order
        final_state = None
        async for event in _stream_graph(nkyel_graph, initial_state):
            yield _sse_event(event["type"], event["data"])
            if event.get("final_state"):
                final_state = event["final_state"]

        # Emit final
        if final_state:
            yield _sse_event("run_completed", {
                "run_id": run_id,
                "status": "completed",
                "steps": final_state.get("steps_taken", []),
                "total_latency_ms": final_state.get("total_latency_ms", 0),
            })

            # Emit the final response as a text message
            if final_state.get("final_response"):
                yield _sse_event("messages-tuple", {
                    "type": "ai",
                    "content": final_state["final_response"],
                })

    except Exception as e:
        yield _sse_event("error", {
            "run_id": run_id,
            "message": str(e),
        })

    yield "data: [DONE]\n\n"


async def _stream_graph(graph, initial_state: dict) -> AsyncGenerator[dict, None]:
    """
    Run the LangGraph graph synchronously (in a thread) and
    yield events as each node completes.
    """
    loop = asyncio.get_event_loop()

    # Run graph in thread to not block the event loop
    result = await loop.run_in_executor(
        None,
        lambda: graph.invoke(initial_state),
    )

    # Emit events from the state
    events = result.get("events", [])
    for evt in events:
        event_type = evt.get("type", "agent_step")
        node = evt.get("node")
        edge = evt.get("edge")

        data = {
            "event_id": evt.get("id", ""),
            "run_id": evt.get("run_id", ""),
        }
        if node:
            data["node"] = node
        if edge:
            data["edge"] = edge
        if evt.get("payload"):
            data["payload"] = evt["payload"]

        yield {"type": event_type, "data": data}

    # Yield final state marker
    yield {
        "type": "_internal_final",
        "data": {},
        "final_state": result,
    }


@router.post("/run")
async def run_nkyel_agent(request: NkyelRunRequest):
    """
    Start a Ñkyel agent run.
    Returns an SSE stream of AG-UI compatible events.
    """
    return StreamingResponse(
        _run_nkyel_agent(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/replan")
async def replan(request: NkyelReplanRequest):
    """
    Trigger replanification for a running mission.
    This would be called when the user edits a node in the Visual Workspace.
    """
    # In a full implementation, this would:
    # 1. Load the current state from the event store
    # 2. Set replan_requested = True with the reason
    # 3. Re-invoke the graph from the "plan" node
    # For P0, return acknowledgement
    return {
        "status": "replan_queued",
        "run_id": request.run_id,
        "edited_node_id": request.edited_node_id,
        "reason": request.reason,
    }


@router.get("/health")
async def nkyel_health():
    """Ñkyel agent health check."""
    return {
        "status": "healthy",
        "agent": "nkyel",
        "version": "1.0.0",
    }
