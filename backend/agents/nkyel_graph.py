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
    """Append an event to the state's event list."""
    event: NkyelEvent = {
        "id": _gen_id("evt"),
        "type": event_type,
        "run_id": state.get("run_id", ""),
    }
    if node:
        event["node"] = node
    if edge:
        event["edge"] = edge
    if payload:
        event["payload"] = payload

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
    """Parse the user message into a goal."""
    goal_title = state.get("user_message", "Untitled Goal")
    run_id = state.get("run_id") or _gen_id("run")

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
    existing_plan = state.get("plan", [])
    replan_reason = state.get("replan_reason", "")

    start = time.time()

    plan_prompt = f"""You are a planning agent for Ñkyel AI.
Decompose this goal into 3-5 concrete research tasks.

Goal: {goal}
"""
    if replan_reason:
        plan_prompt += f"\nReplanification requested: {replan_reason}\nPrevious plan: {json.dumps(existing_plan, ensure_ascii=False)}\n"

    plan_prompt += """
Return a JSON array of tasks:
[
  {"id": "task_1", "title": "...", "description": "...", "type": "research|analysis|synthesis"},
  ...
]
Only output the JSON array, nothing else."""

    try:
        plan_result = gemini_plan(plan_prompt)
        # Parse the JSON from the response
        plan_text = plan_result.get("text", "[]")
        # Extract JSON from possible markdown code blocks
        if "```" in plan_text:
            plan_text = plan_text.split("```")[1]
            if plan_text.startswith("json"):
                plan_text = plan_text[4:]
            plan_text = plan_text.strip()
        tasks = json.loads(plan_text)
    except Exception as e:
        tasks = [
            {"id": "task_1", "title": "Research the topic", "description": f"Search for: {goal}", "type": "research"},
            {"id": "task_2", "title": "Analyze findings", "description": "Compare and evaluate sources", "type": "analysis"},
            {"id": "task_3", "title": "Synthesize results", "description": "Create a comprehensive summary", "type": "synthesis"},
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
    """Execute web searches for each research task in the plan."""
    from services.tavily_search_service import tavily_search

    plan = state.get("plan", [])
    goal = state.get("goal_title", "")
    all_results = list(state.get("search_results", []))
    all_sources = list(state.get("sources", []))
    new_nodes = []
    new_edges = []
    events = list(state.get("events", []))

    for task in plan:
        if task.get("type") != "research":
            continue

        query = task.get("description", task.get("title", goal))

        try:
            results = tavily_search(query, max_results=3)
        except Exception:
            results = []

        for r in results:
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
                "type": "source.added",
                "run_id": state.get("run_id", ""),
                "node": source_node,
            })

        all_results.extend(results)

    all_nodes = list(state.get("nodes", [])) + new_nodes

    return {
        "search_results": all_results,
        "sources": all_sources,
        "nodes": all_nodes,
        "edges": list(state.get("edges", [])) + new_edges,
        "events": events,
        "steps_taken": list(state.get("steps_taken", [])) + ["research"],
    }


# ─── Node: Analyze ──────────────────────────────────────

def analyze(state: NkyelState) -> dict:
    """Use Gemini to extract claims, evidence, and hypotheses from research."""
    from services.gemini_service import gemini_analyze

    sources = state.get("sources", [])
    goal = state.get("goal_title", "")

    start = time.time()
    sources_text = "\n".join([
        f"- [{s.get('title', 'Source')}]({s.get('url', '')}): {s.get('content', '')[:300]}"
        for s in sources[:10]
    ])

    analysis_prompt = f"""You are an analysis agent for Ñkyel AI.
Given these research sources about "{goal}", extract:
1. Key claims (factual assertions)
2. Supporting evidence for each claim
3. Potential hypotheses or contrasting viewpoints

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
        result = gemini_analyze(analysis_prompt)
        text = result.get("text", "{}")
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()
        analysis = json.loads(text)
    except Exception:
        analysis = {
            "claims": [{"title": f"About {goal}", "summary": "Based on the research...", "source_url": ""}],
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
        events.append({"id": _gen_id("evt"), "type": "claim.created", "run_id": state.get("run_id", ""), "node": cn})

    # Create evidence nodes
    evidence = analysis.get("evidence", [])
    for e in evidence:
        en = _make_node("evidence", e.get("title", "Evidence"), e.get("summary", ""), provenance="retrieved")
        en["source_ref"] = e.get("source_url", "")
        new_nodes.append(en)
        events.append({"id": _gen_id("evt"), "type": "evidence.linked", "run_id": state.get("run_id", ""), "node": en})

    # Create hypothesis nodes
    hypotheses = analysis.get("hypotheses", [])
    for h in hypotheses:
        hn = _make_node("hypothesis", h.get("title", "Hypothesis"), h.get("summary", ""), provenance="generated")
        new_nodes.append(hn)
        events.append({"id": _gen_id("evt"), "type": "hypothesis.created", "run_id": state.get("run_id", ""), "node": hn})

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
    """Use Gemini to produce the final synthesis from claims, evidence, and hypotheses."""
    from services.gemini_service import gemini_synthesize

    goal = state.get("goal_title", "")
    claims = state.get("claims", [])
    evidence = state.get("evidence", [])
    hypotheses = state.get("hypotheses", [])
    sources = state.get("sources", [])

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
2. Present multiple viewpoints when they exist
3. Distinguish verified facts from hypotheses
4. Use clear headings and structure
5. End with key takeaways

Write in the user's language (detect from the goal). Respond in markdown."""

    try:
        result = gemini_synthesize(synth_prompt)
        response_text = result.get("text", "Unable to generate synthesis.")
    except Exception as e:
        response_text = f"Synthesis error: {str(e)}"

    latency = int((time.time() - start) * 1000)

    # Create artifact node
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
    events.append({"id": _gen_id("evt"), "type": "artifact.created", "run_id": state.get("run_id", ""), "node": artifact_node})

    all_nodes = list(state.get("nodes", [])) + [artifact_node]

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
        return "plan"
    return "deliver"


# ─── Node: Deliver ──────────────────────────────────────

def deliver(state: NkyelState) -> dict:
    """Create a checkpoint and finalize the run."""
    checkpoint_node = _make_node("checkpoint", "Mission Complete", "Final checkpoint", status="completed")

    events = list(state.get("events", []))
    events.append({"id": _gen_id("evt"), "type": "checkpoint.created", "run_id": state.get("run_id", ""), "node": checkpoint_node})
    events.append({"id": _gen_id("evt"), "type": "final.delivered", "run_id": state.get("run_id", ""), "payload": {"success": True}})

    all_nodes = list(state.get("nodes", [])) + [checkpoint_node]

    return {
        "nodes": all_nodes,
        "events": events,
        "steps_taken": list(state.get("steps_taken", [])) + ["deliver"],
    }


# ─── Build Graph ───────────────────────────────────────

def build_nkyel_graph() -> StateGraph:
    """Build and compile the Ñkyel autonomous agent graph."""

    graph = StateGraph(NkyelState)

    graph.add_node("receive_goal", receive_goal)
    graph.add_node("plan", plan)
    graph.add_node("research", research)
    graph.add_node("analyze", analyze)
    graph.add_node("synthesize", synthesize)
    graph.add_node("deliver", deliver)

    # Entry point
    graph.set_entry_point("receive_goal")

    # Linear flow with replan loop
    graph.add_edge("receive_goal", "plan")
    graph.add_edge("plan", "research")
    graph.add_edge("research", "analyze")
    graph.add_edge("analyze", "synthesize")

    # Conditional: replan or deliver
    graph.add_conditional_edges(
        "synthesize",
        check_replan,
        {
            "plan": "plan",
            "deliver": "deliver",
        },
    )

    graph.add_edge("deliver", END)

    return graph.compile()


# Pre-compiled instance
nkyel_graph = build_nkyel_graph()
