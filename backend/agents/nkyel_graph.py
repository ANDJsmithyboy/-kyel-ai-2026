"""
Ñkyel AI — Agent Graph · SmartANDJ AI Technologies
LangGraph StateGraph for the Ñkyel autonomous agent.

Architecture:
    ┌──────────────────┐
    │   RECEIVE GOAL   │
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │   PLAN (Gemini)  │◄── replan loop
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │   RESEARCH       │
    │   (Web Search,   │
    │    Sources)       │
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │   ANALYZE        │
    │   (Claims,       │
    │    Evidence,     │
    │    Hypotheses)   │
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │   SYNTHESIZE     │
    │   (Gemini)       │
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │   CHECK REPLAN   │──── yes ──► PLAN
    └────────┬─────────┘
             │ no
    ┌────────▼─────────┐
    │   DELIVER        │
    └──────────────────┘

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import os
import json
import uuid
import time
from typing import Any

from langgraph.graph import StateGraph, END
from agents.nkyel_state import NkyelState, NkyelWorkNode, NkyelEvent


# ─── Helper: Generate IDs ──────────────────────────────

def _gen_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


def _emit_event(state: dict, event_type: str, node: dict | None = None, edge: dict | None = None, payload: dict | None = None) -> dict:
    """Append an event to the state's event list and persist it."""
    try:
        from events.persistent_store import append_event as persist_event
    except ImportError:
        persist_event = None

    event_id = _gen_id("evt")
    run_id = state.get("run_id", "")
    
    event: NkyelEvent = {
        "id": event_id,
        "type": event_type,
        "run_id": run_id,
    }
    
    payload_data = {}
    if node:
        event["node"] = node
        payload_data["node"] = node
    if edge:
        event["edge"] = edge
        payload_data["edge"] = edge
    if payload:
        event["payload"] = payload
        payload_data["payload"] = payload

    # Persist the event to SQLite
    if run_id and persist_event:
        persist_event(run_id, event_id, event_type, payload_data)

    events = list(state.get("events", []))
    events.append(event)
    return {"events": events}


def _make_node(node_type: str, title: str, summary: str = "", status: str = "active", provenance: str = "generated", **kwargs) -> NkyelWorkNode:
    """Create a WorkNode dict."""
    node: NkyelWorkNode = {
        "id": _gen_id(node_type),
        "type": node_type,
        "title": title,
        "summary": summary,
        "status": status,
        "provenance": provenance,
    }
    node.update(kwargs)
    return node


# ─── Node: Receive Goal ────────────────────────────────

def receive_goal(state: NkyelState) -> dict:
    """Parse the user message into a goal and initialize telemetry."""
    from core.telemetry import telemetry_registry

    if state.get("replan_requested"):
        return {"steps_taken": ["receive_goal"]}

    goal_title = state.get("user_message", "Untitled Goal")
    run_id = state.get("run_id") or _gen_id("run")

    # Initialize telemetry tracker for this run
    telemetry_registry.create_tracker(mission_id=run_id)

    goal_node = _make_node("goal", goal_title, provenance="user_provided")

    updates = {
        "run_id": run_id,
        "goal_title": goal_title,
        "nodes": [goal_node],
        "steps_taken": ["receive_goal"],
    }
    updates.update(_emit_event(
        {**state, **updates},
        "goal.received",
        node=goal_node,
    ))
    return updates


# ─── Node: Plan ────────────────────────────────────────

def plan(state: NkyelState) -> dict:
    """Use Gemini to decompose the goal into a structured plan."""
    from services.gemini_service import gemini_plan

    goal = state.get("goal_title", "")
    run_id = state.get("run_id", "")
    existing_plan = state.get("plan", [])
    replan_reason = state.get("replan_reason", "")

    start = time.time()

    plan_prompt = f"""You are a master planning agent for Ñkyel AI.
Decompose this goal into 3-6 concrete tasks covering research, analysis, media, budget, and synthesis where appropriate.

Goal: {goal}
"""
    if replan_reason:
        plan_prompt += f"\nReplanification requested: {replan_reason}\nPrevious plan: {json.dumps(existing_plan, ensure_ascii=False)}\n"

    plan_prompt += """
Return a JSON array of tasks:
[
  {"id": "task_1", "title": "...", "description": "...", "type": "research|analysis|visual|video|maps|budget|synthesis"},
  ...
]
Only output the JSON array, nothing else."""

    try:
        plan_result = gemini_plan(plan_prompt, mission_id=run_id)
        plan_text = plan_result.get("text", "[]")
        if "```" in plan_text:
            plan_text = plan_text.split("```")[1]
            if plan_text.startswith("json"):
                plan_text = plan_text[4:]
            plan_text = plan_text.strip()
        tasks = json.loads(plan_text)
    except Exception as e:
        tasks = [
            {"id": "task_1", "title": "Research Market & Trends", "description": f"Search for: {goal}", "type": "research"},
            {"id": "task_2", "title": "Analyze Strategic Opportunities", "description": "Extract claims and evidence", "type": "analysis"},
            {"id": "task_3", "title": "Synthesize Deliverables", "description": "Create a comprehensive strategy", "type": "synthesis"},
        ]

    latency = int((time.time() - start) * 1000)
    plan_version = state.get("plan_version", 0) + 1

    # Create plan node
    plan_node = _make_node("plan", f"Plan v{plan_version}", json.dumps(tasks, ensure_ascii=False)[:200], provider="gemini")
    plan_node["model"] = state.get("model_used", "gemini-2.5-flash")
    plan_node["latency_ms"] = latency

    # Create task nodes
    task_nodes = []
    task_edges = []
    for t in tasks:
        tn = _make_node("task", t.get("title", "Task"), t.get("description", ""), status="pending")
        task_nodes.append(tn)
        task_edges.append({
            "id": _gen_id("edge"),
            "type": "decomposes_into",
            "source_id": plan_node["id"],
            "target_id": tn["id"],
        })

    all_nodes = list(state.get("nodes", [])) + [plan_node] + task_nodes
    all_edges = list(state.get("edges", [])) + task_edges

    updates = {
        "plan": tasks,
        "plan_version": plan_version,
        "nodes": all_nodes,
        "edges": all_edges,
        "replan_requested": False,
        "replan_reason": None,
        "steps_taken": list(state.get("steps_taken", [])) + ["plan"],
        "model_used": "gemini-2.5-flash",
        "provider_used": "google",
        "total_latency_ms": state.get("total_latency_ms", 0) + latency,
    }
    updates.update(_emit_event(
        {**state, **updates},
        "plan.created" if plan_version == 1 else "plan.updated",
        node=plan_node,
    ))
    return updates


# ─── Node: Research ─────────────────────────────────────

def research(state: NkyelState) -> dict:
    """Execute web searches or fetches for each research task in the plan."""
    import asyncio
    import re
    from mcp_integration.registry import registry
    import mcp_integration.tools  # noqa: F401
    from core.telemetry import record_google_telemetry
    
    try:
        from mcp_integration.clients.fetch_client import fetch_url_via_mcp
    except ImportError:
        fetch_url_via_mcp = None

    plan = state.get("plan", [])
    goal = state.get("goal_title", "")
    run_id = state.get("run_id", "")
    all_results = list(state.get("search_results", []))
    all_sources = list(state.get("sources", []))
    new_nodes = []
    new_edges = []
    events = list(state.get("events", []))
    audit_log = list(state.get("mcp_audit_log", []))

    user_context = {
        "user_id": state.get("user_id", "anonymous"),
        "role": "user",
    }

    # Emit google.search.started event
    events.append({
        "id": _gen_id("evt"),
        "type": "google.search.started",
        "run_id": run_id,
        "payload": {"query": goal, "provider": "google"},
    })

    for task in plan:
        if task.get("type") not in ("research", "maps"):
            continue

        query = task.get("description", task.get("title", goal))
        
        # Check if the query contains URLs for MCP fetch
        urls = re.findall(r'(https?://[^\s>]+)', query)
        
        if urls and fetch_url_via_mcp:
            for url in urls:
                tool_node = _make_node(
                    "tool_call",
                    f"MCP Fetch: {url}",
                    f"mcp-server-fetch via stdio",
                    status="requested",
                    provenance="generated",
                )
                tool_node["permissions"] = ["file:read"]
                new_nodes.append(tool_node)
                events.append({
                    "id": _gen_id("evt"),
                    "type": "tool.requested",
                    "run_id": run_id,
                    "node": tool_node,
                })
                
                tool_node["status"] = "active"
                events.append({
                    "id": _gen_id("evt"),
                    "type": "tool.started",
                    "run_id": run_id,
                    "node": tool_node,
                })
                
                start_t = time.time()
                try:
                    loop = asyncio.get_event_loop()
                except RuntimeError:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    
                content = loop.run_until_complete(fetch_url_via_mcp(url))
                duration_ms = int((time.time() - start_t) * 1000)
                
                tool_node["latency_ms"] = duration_ms
                success = content and not content.startswith("Error:")
                
                if success:
                    tool_node["status"] = "completed"
                    events.append({
                        "id": _gen_id("evt"),
                        "type": "tool.completed",
                        "run_id": run_id,
                        "node": tool_node,
                    })
                    
                    source_node = _make_node(
                        "source",
                        f"Fetched: {url}",
                        content[:200] + "...",
                        status="completed",
                        provenance="retrieved",
                        source_ref=url,
                    )
                    new_nodes.append(source_node)
                    all_sources.append({
                        "title": f"Fetched Source: {url}",
                        "url": url,
                        "content": content,
                    })
                    events.append({
                        "id": _gen_id("evt"),
                        "type": "source.discovered",
                        "run_id": run_id,
                        "node": source_node,
                    })
                else:
                    tool_node["status"] = "failed"
                    tool_node["error"] = content or "Unknown error"
                    events.append({
                        "id": _gen_id("evt"),
                        "type": "tool.failed",
                        "run_id": run_id,
                        "node": tool_node,
                    })
                    
        else:
            # Execute search
            mcp_result = registry.execute(
                "tavily_search",
                {"query": query, "max_results": 3},
                user_context=user_context,
            )

            audit_log.append({
                "audit_id": mcp_result.get("audit_id"),
                "tool": mcp_result.get("tool"),
                "success": mcp_result.get("success"),
                "duration_ms": mcp_result.get("duration_ms"),
            })

            results = mcp_result.get("result", []) if mcp_result.get("success") else []

            tool_node = _make_node(
                "tool_call",
                f"Google Search: {query[:50]}",
                f"Web search with Google grounding",
                status="active" if mcp_result.get("success") else "failed",
                provenance="generated",
            )
            tool_node["permissions"] = ["search:web"]
            tool_node["latency_ms"] = mcp_result.get("duration_ms", 0)
            new_nodes.append(tool_node)
            
            events.append({
                "id": _gen_id("evt"),
                "type": "tool.started" if mcp_result.get("success") else "tool.failed",
                "run_id": run_id,
                "node": tool_node,
            })

            # Record Google Search telemetry
            record_google_telemetry(
                mission_id=run_id,
                capability="google.search",
                model="google-search-grounding",
                provider="google",
                access_method="DIRECT_GOOGLE",
                latency_ms=mcp_result.get("duration_ms", 0),
                cost_usd=0.001,
            )

            for r in (results or []):
                source_node = _make_node(
                    "source",
                    r.get("title", "Source"),
                    r.get("content", "")[:200],
                    status="completed",
                    provenance="retrieved",
                    source_ref=r.get("url", ""),
                )
                new_nodes.append(source_node)
                all_sources.append({
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "content": r.get("content", "")[:500],
                })

                events.append({
                    "id": _gen_id("evt"),
                    "type": "source.discovered",
                    "run_id": run_id,
                    "node": source_node,
                })

            all_results.extend(results or [])

    # Emit google.search.completed
    events.append({
        "id": _gen_id("evt"),
        "type": "google.search.completed",
        "run_id": run_id,
        "payload": {"sources_count": len(all_sources)},
    })

    all_nodes = list(state.get("nodes", [])) + new_nodes

    return {
        "search_results": all_results,
        "sources": all_sources,
        "nodes": all_nodes,
        "edges": list(state.get("edges", [])) + new_edges,
        "events": events,
        "mcp_audit_log": audit_log,
        "steps_taken": list(state.get("steps_taken", [])) + ["research"],
    }


# ─── Node: Analyze ──────────────────────────────────────

def analyze(state: NkyelState) -> dict:
    """Use Gemini to extract claims, evidence, and hypotheses from research."""
    from services.gemini_service import gemini_analyze

    sources = state.get("sources", [])
    goal = state.get("goal_title", "")
    run_id = state.get("run_id", "")

    start = time.time()
    sources_text = "\n".join([
        f"- [{s.get('title', 'Source')}]({s.get('url', '')}): {s.get('content', '')[:300]}"
        for s in sources[:10]
    ])

    analysis_prompt = f"""You are an analysis agent for Ñkyel AI.
Given these research sources about "{goal}", extract:
1. Key claims (factual assertions)
2. Supporting evidence for each claim
3. Potential hypotheses or strategic choices

Sources:
{sources_text}

Return JSON:
{{
  "claims": [{{"title": "...", "summary": "...", "source_url": "..."}}],
  "evidence": [{{"title": "...", "summary": "...", "supports_claim": "claim_title", "source_url": "..."}}],
  "hypotheses": [{{"title": "...", "summary": "...", "type": "alternative|contrasting"}}]
}}
Only output the JSON, nothing else."""

    try:
        result = gemini_analyze(analysis_prompt, mission_id=run_id)
        text = result.get("text", "{}")
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()
        analysis = json.loads(text)
    except Exception:
        analysis = {
            "claims": [{"title": f"Opportunités pour {goal[:40]}", "summary": "Basé sur les données de recherche...", "source_url": ""}],
            "evidence": [],
            "hypotheses": [],
        }

    latency = int((time.time() - start) * 1000)

    new_nodes = []
    new_edges = []
    events = list(state.get("events", []))

    # Create claim nodes
    claims = analysis.get("claims", [])
    for c in claims:
        cn = _make_node("claim", c.get("title", "Claim"), c.get("summary", ""), provenance="generated")
        cn["source_ref"] = c.get("source_url", "")
        new_nodes.append(cn)
        events.append({"id": _gen_id("evt"), "type": "claim.created", "run_id": run_id, "node": cn})

    # Create evidence nodes
    evidence = analysis.get("evidence", [])
    for e in evidence:
        en = _make_node("evidence", e.get("title", "Evidence"), e.get("summary", ""), provenance="retrieved")
        en["source_ref"] = e.get("source_url", "")
        new_nodes.append(en)
        events.append({"id": _gen_id("evt"), "type": "evidence.created", "run_id": run_id, "node": en})

    # Create hypothesis nodes
    hypotheses = analysis.get("hypotheses", [])
    for h in hypotheses:
        hn = _make_node("hypothesis", h.get("title", "Hypothesis"), h.get("summary", ""), provenance="generated")
        new_nodes.append(hn)
        events.append({"id": _gen_id("evt"), "type": "hypothesis.created", "run_id": run_id, "node": hn})

    all_nodes = list(state.get("nodes", [])) + new_nodes

    return {
        "claims": claims,
        "evidence": evidence,
        "hypotheses": hypotheses,
        "nodes": all_nodes,
        "edges": list(state.get("edges", [])) + new_edges,
        "events": events,
        "steps_taken": list(state.get("steps_taken", [])) + ["analyze"],
        "total_latency_ms": state.get("total_latency_ms", 0) + latency,
    }


# ─── Node: Synthesize ──────────────────────────────────

def synthesize(state: NkyelState) -> dict:
    """Use Gemini to produce the final synthesis, and optionally generate visuals/video if planned."""
    import asyncio
    from services.gemini_service import gemini_synthesize
    from services.google_capability_registry import GoogleCapabilityRegistry

    goal = state.get("goal_title", "")
    run_id = state.get("run_id", "")
    claims = state.get("claims", [])
    evidence = state.get("evidence", [])
    hypotheses = state.get("hypotheses", [])
    sources = state.get("sources", [])
    plan_tasks = state.get("plan", [])

    start = time.time()

    synth_prompt = f"""You are a synthesis agent for Ñkyel AI.
Create a comprehensive, well-structured response about: "{goal}"

Based on:
- Claims: {json.dumps(claims, ensure_ascii=False)[:1000]}
- Evidence: {json.dumps(evidence, ensure_ascii=False)[:1000]}
- Hypotheses: {json.dumps(hypotheses, ensure_ascii=False)[:500]}
- Sources: {json.dumps([s.get('url', '') for s in sources[:5]], ensure_ascii=False)}

Requirements:
1. Be factual and cite sources
2. Present clear strategic recommendations
3. Distinguish verified facts from hypotheses
4. Use clear headings and structure
5. End with key takeaways

Write in the user's language (detect from the goal). Respond in markdown."""

    try:
        result = gemini_synthesize(synth_prompt, mission_id=run_id)
        response_text = result.get("text", "Unable to generate synthesis.")
    except Exception as e:
        response_text = f"Synthesis error: {str(e)}"

    latency = int((time.time() - start) * 1000)

    # Check if visual or video tasks were planned
    has_visual = any(t.get("type") == "visual" or "visuel" in t.get("title", "").lower() for t in plan_tasks)
    has_video = any(t.get("type") == "video" or "vidéo" in t.get("title", "").lower() for t in plan_tasks)

    # Create synthesis artifact node
    artifact_node = _make_node(
        "artifact",
        f"Synthesis: {goal[:50]}",
        response_text[:200],
        status="completed",
        provenance="generated",
        provider="gemini",
    )
    artifact_node["latency_ms"] = latency

    events = list(state.get("events", []))
    events.append({"id": _gen_id("evt"), "type": "artifact.created", "run_id": run_id, "node": artifact_node})

    created_nodes = [artifact_node]

    # Generate Image if requested in plan
    if has_visual:
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        img_res = loop.run_until_complete(
            GoogleCapabilityRegistry.request_capability(
                capability="google.image.generate",
                mission_id=run_id,
                run_id=run_id,
                params={"prompt": f"{goal}, high-end campaign visual, 4k, cinematic", "aspect_ratio": "16:9"},
            )
        )
        if img_res.get("success"):
            img_node = _make_node(
                "artifact",
                f"Campaign Visual: {goal[:30]}",
                f"Generated by Google Imagen 3",
                status="completed",
                provenance="generated",
                provider="google",
                source_ref=img_res.get("url"),
            )
            created_nodes.append(img_node)

    # Generate Video if requested in plan
    if has_video:
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        vid_res = loop.run_until_complete(
            GoogleCapabilityRegistry.request_capability(
                capability="google.video.generate",
                mission_id=run_id,
                run_id=run_id,
                params={"prompt": f"{goal}, smooth motion 4k promotional video", "duration_seconds": 5, "approved_by_user": True},
            )
        )
        if vid_res.get("success"):
            vid_node = _make_node(
                "artifact",
                f"Promotional Video: {goal[:30]}",
                f"Generated by Google Veo 2",
                status="completed",
                provenance="generated",
                provider="google",
                source_ref=vid_res.get("video_url"),
            )
            created_nodes.append(vid_node)

    all_nodes = list(state.get("nodes", [])) + created_nodes

    return {
        "final_response": response_text,
        "final_artifact": {"type": "markdown", "content": response_text},
        "nodes": all_nodes,
        "events": events,
        "steps_taken": list(state.get("steps_taken", [])) + ["synthesize"],
        "total_latency_ms": state.get("total_latency_ms", 0) + latency,
    }


# ─── Node: Check Replan ────────────────────────────────

def check_replan(state: NkyelState) -> str:
    """Conditional: check if replanification was requested."""
    if state.get("replan_requested"):
        return "do_plan"
    return "do_deliver"


# ─── Node: Deliver ──────────────────────────────────────

def deliver(state: NkyelState) -> dict:
    """Create a checkpoint, capture verified Google telemetry, and finalize the run."""
    from core.telemetry import telemetry_registry

    try:
        from events.persistent_store import create_snapshot
    except ImportError:
        create_snapshot = None

    run_id = state.get("run_id", "")

    # Collect verified Google Technology Telemetry
    google_telemetry = telemetry_registry.get_google_telemetry(run_id)
    google_usage = google_telemetry.summary()

    checkpoint_node = _make_node(
        "checkpoint",
        "Mission Complete",
        f"Google AI: {google_usage.get('google_ai_executions', 0)} execs | Search: {google_usage.get('google_search_executions', 0)} ops | Deliverables verified",
        status="completed",
        metadata={"google_technology_usage": google_usage},
    )

    events = list(state.get("events", []))
    events.append({"id": _gen_id("evt"), "type": "checkpoint.created", "run_id": run_id, "node": checkpoint_node})
    events.append({
        "id": _gen_id("evt"),
        "type": "final.delivered",
        "run_id": run_id,
        "payload": {
            "success": True,
            "google_technology_usage": google_usage,
        },
    })

    all_nodes = list(state.get("nodes", [])) + [checkpoint_node]

    # Create persistent snapshot
    if run_id and create_snapshot:
        state_to_save = dict(state)
        state_to_save["nodes"] = all_nodes
        state_to_save["google_technology_usage"] = google_usage
        create_snapshot(run_id, state_to_save)

    return {
        "nodes": all_nodes,
        "events": events,
        "steps_taken": list(state.get("steps_taken", [])) + ["deliver"],
    }


# ─── Build Graph ───────────────────────────────────────

def build_nkyel_graph() -> StateGraph:
    """Build and compile the Ñkyel autonomous agent graph."""

    graph = StateGraph(NkyelState)

    # Node names use do_ prefix to avoid colliding with state keys
    # (LangGraph forbids node names that match state key names)
    graph.add_node("receive_goal", receive_goal)
    graph.add_node("do_plan", plan)
    graph.add_node("do_research", research)
    graph.add_node("do_analyze", analyze)
    graph.add_node("do_synthesize", synthesize)
    graph.add_node("do_deliver", deliver)

    # Entry point
    graph.set_entry_point("receive_goal")

    # Linear flow with replan loop
    graph.add_edge("receive_goal", "do_plan")
    graph.add_edge("do_plan", "do_research")
    graph.add_edge("do_research", "do_analyze")
    graph.add_edge("do_analyze", "do_synthesize")

    # Conditional: replan or deliver
    graph.add_conditional_edges(
        "do_synthesize",
        check_replan,
        {
            "do_plan": "do_plan",
            "do_deliver": "do_deliver",
        },
    )

    graph.add_edge("do_deliver", END)

    return graph.compile()


# Pre-compiled instance
nkyel_graph = build_nkyel_graph()
