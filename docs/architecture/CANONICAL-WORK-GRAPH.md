# Canonical Work Graph — Ñkyel AI

## Overview

The Canonical Work Graph is a typed, versioned, protocol-independent data model that represents all work performed by the Ñkyel agent. It is the single source of truth from which the Visual Workspace, the Event Stream, and the Replay engine are derived.

## Node Types

| Type | Icon | Description |
|------|------|-------------|
| `goal` | 🎯 | The user's objective |
| `plan` | 📋 | A structured decomposition of the goal |
| `task` | ⚡ | An individual unit of work |
| `agent` | 🤖 | A sub-agent assigned to a task |
| `tool_call` | 🔧 | An invocation of an external tool |
| `source` | 📄 | A retrieved document, URL, or dataset |
| `evidence` | ✅ | Data supporting or refuting a claim |
| `claim` | 💬 | A factual assertion made by the agent |
| `hypothesis` | 🔀 | An alternative interpretation or branch |
| `scenario` | 🔮 | A simulated future or comparison |
| `decision` | ⚖️ | A selection between alternatives |
| `artifact` | 📦 | A deliverable (report, code, image) |
| `approval` | 🔐 | A human approval gate |
| `checkpoint` | 💾 | A saved state for replay/resume |
| `error` | ❌ | A failure or exception |

## Edge Types

| Type | Description |
|------|-------------|
| `decomposes_into` | Goal → Plan, Plan → Tasks |
| `assigned_to` | Task → Agent |
| `depends_on` | Task → Task (ordering) |
| `uses` | Agent → Tool |
| `produces` | Tool/Agent → Source/Artifact |
| `supports` | Evidence → Claim |
| `contradicts` | Evidence/Hypothesis → Claim |
| `derived_from` | Hypothesis → Source/Claim |
| `compares_with` | Scenario ↔ Scenario |
| `selected` | Decision → chosen option |
| `rejected` | Decision → rejected option |
| `blocked_by` | Task → blocking dependency |
| `resumes_from` | Run → Checkpoint |

## Node Schema (v1.0.0)

```typescript
interface WorkNode {
  id: string;              // Stable unique identifier
  type: WorkNodeType;      // From the vocabulary above
  version: string;         // Schema version
  parentId?: string;       // Hierarchy
  title: string;           // Short public title
  summary?: string;        // Public summary
  status: WorkNodeStatus;  // pending|active|completed|failed|cancelled|blocked|waiting_approval
  provenance: ContentOrigin; // generated|simulated|retrieved|calculated|user_provided|verified
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
  sourceRef?: string;      // URL or path
  provider?: string;       // e.g. 'gemini', 'groq'
  model?: string;          // e.g. 'gemini-2.5-flash'
  cost?: number;           // USD
  latencyMs?: number;      // Milliseconds
  confidence?: number;     // Only when calculated by documented method
  confidenceMethod?: string;
}
```

## Implementation

- **TypeScript types**: `ZION-CORE-V2/src/lib/nkyel/work-graph.types.ts`
- **Python types**: `backend/agents/nkyel_state.py`
- **Event Store**: `ZION-CORE-V2/src/lib/nkyel/event-store.ts`
- **Zustand Store**: `ZION-CORE-V2/src/lib/nkyel/work-graph-store.ts`
