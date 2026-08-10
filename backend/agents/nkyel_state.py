"""
Ñkyel AI — Agent State · SmartANDJ AI Technologies
TypedDict for the Ñkyel autonomous agent's state graph.

This replaces the simple intent-router GabomaState with a full
autonomous agent state supporting planning, research, evidence,
hypotheses, and replanification.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
from typing import Literal, Optional
from typing_extensions import TypedDict


class NkyelWorkNode(TypedDict, total=False):
    """A node in the Canonical Work Graph."""
    id: str
    type: Literal[
        "goal", "plan", "task", "agent", "tool_call",
        "source", "evidence", "claim", "hypothesis",
        "scenario", "decision", "artifact", "approval",
        "checkpoint", "error",
    ]
    title: str
    summary: str
    status: Literal[
        "pending", "active", "completed", "failed",
        "cancelled", "blocked", "waiting_approval",
    ]
    provenance: Literal[
        "generated", "simulated", "retrieved",
        "calculated", "user_provided", "verified",
    ]
    parent_id: Optional[str]
    source_ref: Optional[str]
    provider: Optional[str]
    model: Optional[str]
    cost: Optional[float]
    latency_ms: Optional[int]


class NkyelWorkEdge(TypedDict, total=False):
    """An edge in the Canonical Work Graph."""
    id: str
    type: Literal[
        "decomposes_into", "assigned_to", "depends_on",
        "uses", "produces", "supports", "contradicts",
        "derived_from", "compares_with", "selected",
        "rejected", "blocked_by", "resumes_from",
    ]
    source_id: str
    target_id: str
    label: Optional[str]


class NkyelEvent(TypedDict, total=False):
    """An event emitted by the Ñkyel agent runtime."""
    id: str
    type: str
    run_id: str
    task_id: Optional[str]
    agent_id: Optional[str]
    node: Optional[NkyelWorkNode]
    edge: Optional[NkyelWorkEdge]
    payload: Optional[dict]


class NkyelState(TypedDict, total=False):
    """State for the Ñkyel autonomous agent."""

    # ── User Input ───────────────────────────────────
    user_message: str
    user_id: str
    language: str
    run_id: str

    # ── Goal ─────────────────────────────────────────
    goal_title: str
    goal_summary: str

    # ── Plan ─────────────────────────────────────────
    plan: list[dict]  # List of planned tasks
    plan_version: int

    # ── Work Graph ───────────────────────────────────
    nodes: list[NkyelWorkNode]
    edges: list[NkyelWorkEdge]

    # ── Events ───────────────────────────────────────
    events: list[NkyelEvent]

    # ── Research Results ─────────────────────────────
    search_queries: list[str]
    search_results: list[dict]
    sources: list[dict]

    # ── Claims & Evidence ────────────────────────────
    claims: list[dict]
    evidence: list[dict]

    # ── Hypotheses ───────────────────────────────────
    hypotheses: list[dict]

    # ── Artifacts ────────────────────────────────────
    artifacts: list[dict]

    # ── Agent Output ─────────────────────────────────
    final_response: Optional[str]
    final_artifact: Optional[dict]

    # ── Replanification ──────────────────────────────
    replan_requested: bool
    replan_reason: Optional[str]
    replan_edited_node_id: Optional[str]

    # ── Metadata ─────────────────────────────────────
    error: Optional[str]
    steps_taken: list[str]
    total_cost: float
    total_latency_ms: int
    model_used: Optional[str]
    provider_used: Optional[str]
