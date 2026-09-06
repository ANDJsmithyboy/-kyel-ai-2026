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

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from core.security import get_current_user


router = APIRouter(prefix="/api/v1/nkyel", tags=["Ñkyel Agent"])


class NkyelRunRequest(BaseModel):
    """Request to start a Ñkyel agent run."""
    message: str = Field(..., description="The user's goal or question")
    user_id: str = Field(default="anonymous", description="User identifier")
    language: str = Field(default="fr", description="Language code")
    run_id: str | None = Field(default=None, description="Optional run ID for replay/resume")
    mission_id: str | None = Field(default=None, description="Optional parent mission ID")
    workspace_id: str | None = Field(default=None, description="Optional workspace ID")
    engine: str | None = Field(default=None, description="DEERFLOW or NATIVE")
    features: dict | None = Field(default_factory=dict, description="Agentic features toggles")


class NkyelCancelRequest(BaseModel):
    """Request to cancel a running mission."""
    run_id: str = Field(..., description="The run ID to cancel")
    reason: str = Field(default="user_requested", description="Cancellation reason")


class NkyelReplanRequest(BaseModel):
    """Request to trigger replanification for a mission."""
    run_id: str = Field(..., description="The run ID to replan")
    edited_node_id: str = Field(..., description="The node ID that was edited/modified")
    updates: dict = Field(default_factory=dict, description="Updates to apply to the node")
    reason: str = Field(default="user_intervention", description="Reason for replanification")


def _sse_event(event_type: str, data: dict, ag_ui_type: str | None = None) -> str:
    """Format an SSE event line with official AG-UI protocol and legacy aliases."""
    canonical_type = ag_ui_type or event_type
    payload = {
        "type": canonical_type,
        "event_type": event_type,
        "ag_ui_type": canonical_type,
        "data": data,
        **data,
    }
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


async def _run_nkyel_agent(request: NkyelRunRequest) -> AsyncGenerator[str, None]:
    """
    Run the Ñkyel agent graph or DeerFlow 2.0 runtime and yield SSE events.
    Each event maps to a Canonical Work Graph event in AG-UI format.
    """
    from core.cancellation import cancellation_manager

    run_id = request.run_id or f"run_{uuid.uuid4().hex[:8]}"

    # Register cancellation token for this run
    cancel_token = cancellation_manager.create_token(mission_id=run_id, run_id=run_id, owner_id=request.user_id)

    # Emit RUN_STARTED (official AG-UI)
    yield _sse_event("run_started", {
        "run_id": run_id,
        "status": "started",
        "message": request.message,
    }, ag_ui_type="RUN_STARTED")

    # Persist initial user message in Neon (P0 absolute)
    conv_id = request.mission_id or run_id
    try:
        from services.persistence_service import PersistenceService
        await PersistenceService.record_chat_message(
            conversation_id=conv_id,
            role="user",
            content=request.message,
            user_identifier=request.user_id,
            mission_id=request.mission_id or run_id,
            run_id=run_id,
            workspace_id=request.workspace_id,
        )
    except Exception:
        pass

    # Decide runtime via engine / goal intent — DeerFlow 2.0 is primary canonical runtime
    use_deerflow = (
        (request.engine is None or request.engine.upper() not in ("NATIVE", "LANGGRAPH_ONLY"))
        or (request.engine and request.engine.upper() in ("DEERFLOW", "DEER_FLOW"))
        or (request.features and (request.features.get("deepResearch") or request.features.get("executiveArtifacts")))
        or any(w in request.message.lower() for w in ["deerflow", "rapport", "report", "présentation", "pptx", "xlsx", "tableur", "swot", "marché"])
    )

    if use_deerflow:
        try:
            from core.runtime.base import RuntimeEventType
            from core.runtime.deerflow_runtime import DeerFlowRuntime

            df_runtime = DeerFlowRuntime()
            completed_steps: list[str] = []
            async for rt_event in df_runtime.stream(
                mission_id=request.mission_id or run_id,
                goal=request.message,
                run_id=run_id,
                user_id=request.user_id,
            ):
                if cancel_token.is_cancelled:
                    yield _sse_event("run_cancelled", {"run_id": run_id, "status": "cancelled", "reason": "user_requested"}, ag_ui_type="RUN_ERROR")
                    break

                if rt_event.type == RuntimeEventType.STEP_STARTED:
                    step_name = rt_event.payload.get("step", "Étape")
                    task_id = rt_event.task_id or f"task_{uuid.uuid4().hex[:6]}"
                    yield _sse_event("agent_step", {
                        "run_id": run_id,
                        "task_id": task_id,
                        "node": {"id": task_id, "label": step_name, "status": "running"},
                        "payload": {"label": step_name, "step": step_name, "status": "running"},
                    }, ag_ui_type="STEP_STARTED")
                elif rt_event.type == RuntimeEventType.STATE_DELTA:
                    if rt_event.payload.get("source"):
                        s = rt_event.payload["source"]
                        yield _sse_event("source_found", {
                            "run_id": run_id,
                            "source": s,
                            "source_id": s.get("id") or s.get("source_id"),
                            "url": s.get("url"),
                            "title": s.get("title"),
                            "domain": s.get("domain"),
                            "favicon": s.get("favicon"),
                            "snippet": s.get("snippet"),
                            "payload": s,
                        }, ag_ui_type="STATE_DELTA")
                    elif rt_event.payload.get("evidence"):
                        ev = rt_event.payload["evidence"]
                        yield _sse_event("evidence_recorded", {"run_id": run_id, "evidence": ev, "payload": ev}, ag_ui_type="STATE_DELTA")
                    elif rt_event.payload.get("artifact_id"):
                        art = rt_event.payload
                        yield _sse_event("artifact_created", {"run_id": run_id, "payload": art, "artifact": art}, ag_ui_type="STATE_DELTA")
                    elif rt_event.payload.get("selected_skill"):
                        skill_name = rt_event.payload['selected_skill']
                        yield _sse_event("agent_step", {
                            "run_id": run_id,
                            "task_id": rt_event.task_id or "skill",
                            "node": {"id": rt_event.task_id or "skill", "label": f"Compétence : {skill_name}", "status": "active"},
                            "payload": {"label": f"Compétence : {skill_name}", "skill": skill_name},
                        }, ag_ui_type="STEP_STARTED")
                elif rt_event.type == RuntimeEventType.TOOL_CALL_START:
                    yield _sse_event("tool.started", {"run_id": run_id, "payload": rt_event.payload, **rt_event.payload}, ag_ui_type="TOOL_CALL_START")
                elif rt_event.type == RuntimeEventType.TOOL_CALL_RESULT:
                    yield _sse_event("tool.completed", {"run_id": run_id, "payload": rt_event.payload, **rt_event.payload}, ag_ui_type="TOOL_CALL_RESULT")
                elif rt_event.type == RuntimeEventType.STEP_FINISHED:
                    step_name = rt_event.payload.get("step", "Étape terminée")
                    completed_steps.append(step_name)
                    task_id = rt_event.task_id or "step"
                    yield _sse_event("node_completed", {
                        "run_id": run_id,
                        "task_id": task_id,
                        "node": {"id": task_id, "label": step_name, "status": "completed"},
                        "payload": rt_event.payload,
                    }, ag_ui_type="STEP_FINISHED")
                elif rt_event.type == RuntimeEventType.RUN_FINISHED:
                    yield _sse_event("run_completed", {
                        "run_id": run_id,
                        "status": "completed",
                        "steps": completed_steps,
                    }, ag_ui_type="RUN_FINISHED")
                    if rt_event.payload.get("content"):
                        yield _sse_event("messages-tuple", {
                            "type": "ai",
                            "content": rt_event.payload["content"],
                        }, ag_ui_type="TEXT_MESSAGE_CONTENT")
                        try:
                            from services.persistence_service import PersistenceService
                            await PersistenceService.record_chat_message(
                                conversation_id=conv_id,
                                role="assistant",
                                content=rt_event.payload["content"],
                                user_identifier=request.user_id,
                                mission_id=request.mission_id or run_id,
                                run_id=run_id,
                                model_profile=rt_event.payload.get("model", "openai/gpt-oss-120b"),
                                content_json=rt_event.payload,
                                workspace_id=request.workspace_id,
                            )
                        except Exception:
                            pass
                elif rt_event.type == RuntimeEventType.RUN_ERROR:
                    yield _sse_event("error", {"run_id": run_id, "message": rt_event.payload.get("error", "Execution error")}, ag_ui_type="RUN_ERROR")

        except Exception as e:
            yield _sse_event("error", {"run_id": run_id, "message": str(e)}, ag_ui_type="RUN_ERROR")

        yield "data: [DONE]\n\n"
        return

    # Default: Native LangGraph Runtime
    try:
        from agents.nkyel_graph import nkyel_graph
        from services.persistence_service import PersistenceService

        try:
            await PersistenceService.record_mission_start(
                mission_id=request.mission_id or run_id,
                run_id=run_id,
                user_identifier=request.user_id,
                title=request.message[:120],
                goal=request.message,
            )
        except Exception as pe:
            pass

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
        yielded_count = 0
        async for state in nkyel_graph.astream(initial_state, stream_mode="values"):
            # Check cancellation
            if cancel_token.is_cancelled:
                yield _sse_event("run_cancelled", {
                    "run_id": run_id,
                    "status": "cancelled",
                    "reason": cancel_token.cancel_reason or "user_requested",
                })
                try:
                    await PersistenceService.record_mission_completion(
                        mission_id=request.mission_id or run_id,
                        run_id=run_id,
                        status="cancelled",
                    )
                except Exception:
                    pass
                break

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
                    if node.get("id"):
                        try:
                            await PersistenceService.record_workgraph_node(
                                mission_id=request.mission_id or run_id,
                                run_id=run_id,
                                node_id=str(node["id"]),
                                node_type=node.get("type", "step"),
                                label=node.get("label") or node.get("title") or "Étape",
                                status=node.get("status", "completed"),
                                payload=node.get("payload") or evt.get("payload"),
                            )
                        except Exception:
                            pass

                if edge:
                    data["edge"] = edge

                if evt.get("payload"):
                    data["payload"] = evt["payload"]

                if evt.get("source"):
                    s = evt["source"]
                    try:
                        await PersistenceService.record_source(
                            mission_id=request.mission_id or run_id,
                            run_id=run_id,
                            source_id=s.get("id") or s.get("source_id") or f"src_{uuid.uuid4().hex[:8]}",
                            url=s.get("url", ""),
                            title=s.get("title", ""),
                            domain=s.get("domain", ""),
                            snippet=s.get("snippet", ""),
                        )
                    except Exception:
                        pass

                yield _sse_event(event_type, data)
            
            yielded_count = len(events)
            final_state = state

        # Emit final if not cancelled
        if final_state and not cancel_token.is_cancelled:
            yield _sse_event("run_completed", {
                "run_id": run_id,
                "status": "completed",
                "steps": final_state.get("steps_taken", []),
                "total_latency_ms": final_state.get("total_latency_ms", 0),
            })

            try:
                await PersistenceService.record_mission_completion(
                    mission_id=request.mission_id or run_id,
                    run_id=run_id,
                    status="completed",
                    summary=final_state.get("final_response"),
                )
            except Exception:
                pass

            # Emit the final response as a text message
            if final_state.get("final_response"):
                yield _sse_event("messages-tuple", {
                    "type": "ai",
                    "content": final_state["final_response"],
                })
                try:
                    from services.persistence_service import PersistenceService
                    await PersistenceService.record_chat_message(
                        conversation_id=conv_id,
                        role="assistant",
                        content=final_state["final_response"],
                        user_identifier=request.user_id,
                        mission_id=request.mission_id or run_id,
                        run_id=run_id,
                        model_profile="openai/gpt-oss-120b",
                        workspace_id=request.workspace_id,
                    )
                except Exception:
                    pass

    except Exception as e:
        yield _sse_event("error", {
            "run_id": run_id,
            "message": str(e),
        })
        try:
            await PersistenceService.record_mission_completion(
                mission_id=request.mission_id or run_id,
                run_id=run_id,
                status="failed",
            )
        except Exception:
            pass

    yield "data: [DONE]\n\n"




@router.post("/run")
async def run_nkyel_agent(
    request: NkyelRunRequest,
    user: dict = Depends(get_current_user),
):
    """
    Start a Ñkyel agent run.
    Returns an SSE stream of AG-UI compatible events.
    Enforces review quotas atomically for Google Review sessions.
    """
    # Enforce real authenticated user identity
    if user and user.get("id"):
        request.user_id = user["id"]

    # Server-side Google Review quota enforcement
    if user and user.get("is_review"):
        from core.config import settings
        from db.session import async_session
        from db.models import ReviewQuotaUsage
        from sqlalchemy import select
        from fastapi import status
        import uuid

        session_id = user.get("review_session_id")
        if session_id:
            try:
                sess_uuid = uuid.UUID(session_id)
                async with async_session() as db:
                    stmt = select(ReviewQuotaUsage).where(ReviewQuotaUsage.session_id == sess_uuid).with_for_update()
                    res = await db.execute(stmt)
                    quota = res.scalar_one_or_none()
                    if quota:
                        total_tokens = quota.tokens_input + quota.tokens_output
                        if total_tokens >= settings.google_review_token_hard_daily:
                            raise HTTPException(
                                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                                detail="Review quota reached: daily token allowance exhausted."
                            )
                        # Atomic increment
                        quota.tokens_input += 1000
                        quota.searches_performed += 1
                        await db.commit()
            except HTTPException:
                raise
            except Exception as e:
                pass

    return StreamingResponse(
        _run_nkyel_agent(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/cancel")
@router.post("/stop")
async def cancel_run(
    request: NkyelCancelRequest,
    user: dict = Depends(get_current_user),
):
    """
    Cancel an ongoing mission run immediately.
    """
    from core.cancellation import cancellation_manager

    owner_id = str(user.get("id") or user.get("clerk_id") or "") or None
    cancelled = cancellation_manager.cancel_mission(
        mission_id=request.run_id,
        reason=request.reason,
        owner_id=owner_id,
    )
    return {
        "success": cancelled,
        "run_id": request.run_id,
        "cancelled": cancelled,
        "reason": request.reason,
    }


@router.post("/replan")
async def replan(
    request: NkyelReplanRequest,
    user: dict = Depends(get_current_user),
):
    """
    Trigger replanification for a running mission.
    This returns a new SSE stream that resumes the graph.
    """
    async def _run_replan() -> AsyncGenerator[str, None]:
        from agents.nkyel_graph import nkyel_graph
        from events.persistent_store import get_snapshot
        from core.cancellation import cancellation_manager
        
        cancel_token = cancellation_manager.create_token(mission_id=request.run_id, run_id=request.run_id)

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
                if cancel_token.is_cancelled:
                    yield _sse_event("run_cancelled", {
                        "run_id": request.run_id,
                        "status": "cancelled",
                        "reason": cancel_token.cancel_reason or "user_requested",
                    })
                    break

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
            
            if not cancel_token.is_cancelled:
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


@router.get("/mission/{mission_id}/restore")
async def restore_mission_endpoint(
    mission_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Restaure l'intégralité d'une mission passée depuis Neon (P0 Release Rule).
    Survit au refresh navigateur, à une nouvelle session ou au reboot conteneur.
    """
    user_id = user.get("id") if user else None
    from services.persistence_service import PersistenceService
    data = await PersistenceService.restore_mission_state(mission_id=mission_id, user_identifier=user_id)
    if not data.get("found"):
        raise HTTPException(status_code=404, detail=data.get("error", "Mission introuvable"))
    return data

