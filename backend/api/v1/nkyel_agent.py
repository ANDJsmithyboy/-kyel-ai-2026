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
        final_state = None
        # Using astream with stream_mode='values' emits the full state after each node completes
        yielded_count = 0
        async for state in nkyel_graph.astream(initial_state, stream_mode="values"):
            events = state.get("events", [])
            # Yield any new events
            for i in range(yielded_count, len(events)):
                evt = events[i]
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

                yield _sse_event(event_type, data)
            
            yielded_count = len(events)
            final_state = state

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
    This returns a new SSE stream that resumes the graph.
    """
    async def _run_replan() -> AsyncGenerator[str, None]:
        from agents.nkyel_graph import nkyel_graph
        
        from events.persistent_store import get_snapshot
        
        snapshot = get_snapshot(request.run_id)
        if not snapshot:
            yield _sse_event("error", {"run_id": request.run_id, "message": "Snapshot not found."})
            yield "data: [DONE]\n\n"
            return
            
        initial_state = dict(snapshot)
        
        # Apply updates to the specific node (e.g. a hypothesis)
        for node in initial_state.get("nodes", []):
            if node.get("id") == request.edited_node_id:
                node.update(request.updates)
                break
                
        initial_state["replan_requested"] = True
        initial_state["replan_reason"] = request.reason
        initial_state["replan_edited_node_id"] = request.edited_node_id

        # Emit replan.requested
        yield _sse_event("replan.requested", {
            "run_id": request.run_id,
            "payload": {"reason": request.reason}
        })

        # Emit run.resumed event
        yield _sse_event("run_started", {
            "run_id": request.run_id,
            "status": "resumed",
        })

        try:
            yielded_count = 0
            # Route to "do_plan" directly
            async for state in nkyel_graph.astream(initial_state, stream_mode="values"):
                events = state.get("events", [])
                for i in range(yielded_count, len(events)):
                    evt = events[i]
                    data = {
                        "event_id": evt.get("id", ""),
                        "run_id": evt.get("run_id", ""),
                    }
                    if evt.get("node"): data["node"] = evt["node"]
                    if evt.get("edge"): data["edge"] = evt["edge"]
                    if evt.get("payload"): data["payload"] = evt["payload"]
                    yield _sse_event(evt.get("type", "agent_step"), data)
                yielded_count = len(events)
            
            yield _sse_event("replan.completed", {
                "run_id": request.run_id,
            })
            
            yield _sse_event("run_completed", {
                "run_id": request.run_id,
                "status": "completed",
            })
        except Exception as e:
            yield _sse_event("error", {"run_id": request.run_id, "message": str(e)})
            
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        _run_replan(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/health")
async def nkyel_health():
    """Ñkyel agent health check."""
    return {
        "status": "healthy",
        "agent": "nkyel",
        "version": "1.0.0",
    }
