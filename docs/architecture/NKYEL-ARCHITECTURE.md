# Ñkyel AI — Architecture Document

## Vision

> **Ñkyel AI is an autonomous agent whose work becomes a living, verifiable, user-editable visual workspace.**

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                         ÑKYEL AI ARCHITECTURE                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────────┐  │
│  │ Visual       │◄──►│  AG-UI Adapter    │◄──►│  Event Store        │  │
│  │ Workspace    │    │  (Event Stream)   │    │  (Canonical Events) │  │
│  │ (React Flow) │    └──────────────────┘    └─────────┬────────────┘  │
│  └──────────────┘                                      │               │
│                                                        │               │
│  ┌──────────────────────────────────────────────────────▼────────────┐ │
│  │                    CANONICAL WORK GRAPH                           │ │
│  │  Nodes: Goal, Plan, Task, Agent, ToolCall, Source, Evidence,     │ │
│  │         Claim, Hypothesis, Scenario, Decision, Artifact,         │ │
│  │         Approval, Checkpoint, Error                              │ │
│  │  Edges: decomposes_into, assigned_to, depends_on, uses,         │ │
│  │         produces, supports, contradicts, derived_from,          │ │
│  │         compares_with, selected, rejected, blocked_by,          │ │
│  │         resumes_from                                             │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                              │                                        │
│  ┌───────────────────────────▼──────────────────────────────────────┐ │
│  │                      AGENT RUNTIME                               │ │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │ │
│  │  │Planner  │  │Researcher│  │Executor  │  │Critic/Verifier   │  │ │
│  │  └────┬────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │ │
│  │       └────────────┴─────────────┴──────────────────┘            │ │
│  │                    LangGraph Orchestration                       │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                              │                                        │
│  ┌───────────────┐  ┌───────▼───────┐  ┌─────────────────────────┐  │
│  │ Protocol      │  │ Model         │  │ Memory & Provenance     │  │
│  │ Gateway       │  │ Gateway       │  │ (Session + Persistent)  │  │
│  │ MCP│A2A│A2UI  │  │ Gemini(main)  │  │                         │  │
│  │ AG-UI│ACP│AP2 │  │ Groq(fallback)│  │                         │  │
│  └───────────────┘  └───────────────┘  └─────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                 POLICY & APPROVAL ENGINE                         │ │
│  │  Human-in-the-loop • Cost limits • Permissions • Emergency stop │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                      OBSERVABILITY                               │ │
│  │  Logs • Traces • Metrics • Evaluations (no private CoT)        │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

## Nine Core Subsystems

### 1. Agent Runtime
LangGraph-based orchestration with specialized sub-agents:
- **Planner**: Decomposes goals into structured plans
- **Researcher**: Web search, source retrieval, fact gathering
- **Executor**: Tool calls, code execution, file operations
- **Critic/Verifier**: Validates claims against evidence

### 2. Canonical Work Graph
Typed, versioned graph representing all work. See `CANONICAL-WORK-GRAPH.md`.

### 3. Event Store / Event Stream
Append-only log of versioned events enabling reconstruction, replay, and resume.

### 4. Visual Workspace
React Flow-based spatial canvas driven by real Work Graph events.

### 5. Protocol Gateway
Adapters for MCP (tools), A2A (agent coordination), AG-UI (frontend streaming), A2UI (dynamic UI).

### 6. Model Gateway
Gemini as primary model. Groq/other as fallback. Abstracted behind a unified interface.

### 7. Memory & Provenance
Controllable session and persistent memory. Source tracking, citations, versions.

### 8. Policy & Approval Engine
Human-in-the-loop approvals, cost limits, permissions, emergency stop.

### 9. Observability
Structured logging, OpenTelemetry traces, metrics. No private chain-of-thought exposed.
