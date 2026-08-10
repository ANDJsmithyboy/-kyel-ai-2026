# Visual Workspace — Ñkyel AI

## Overview

The Visual Workspace is the primary interface of Ñkyel AI — not a secondary screen. It renders the Canonical Work Graph as an interactive spatial canvas where users observe, inspect, and modify the agent's work.

## Views

| View | Purpose | P0 Status |
|------|---------|-----------|
| **Mission View** | Central goal, overall progress | ✅ Implemented |
| **Plan View** | Steps, dependencies, critical paths | ✅ Implemented |
| **Agent Constellation** | Sub-agents, responsibilities, status | ✅ Implemented |
| **Evidence Map** | Claims ↔ Sources ↔ Evidence | ✅ Implemented |
| **Hypothesis Lab** | Branches, scenarios, comparisons | ✅ Implemented |
| **Artifact Dock** | Documents, code, reports produced | 🔧 Partial |
| **Timeline & Replay** | Chronological event history | 🔧 Partial |
| **Focus Mode** | Single branch, no noise | 📋 P1 |
| **Accessible Outline** | Full text representation | 📋 P1 |

## Semantic Zoom

| Level | Content |
|-------|---------|
| 0 | Goal, result, overall health |
| 1 | Major plan axes |
| 2 | Tasks, agents, sources, hypotheses |
| 3 | Metadata, tool calls, citations, versions, errors |

## User Actions

- Select and inspect any node
- Move nodes without breaking relationships
- Pin important nodes
- Hide/reveal details
- Edit a node title or constraint → triggers replanification
- Create a branch (hypothesis)
- Reject a hypothesis
- Request additional evidence
- Approve an action
- Restart from a checkpoint
- Compare two scenarios
- Replay the mission

## Implementation

- **Canvas**: `ZION-CORE-V2/src/components/nkyel/NkyelWorkspaceCanvas.tsx`
- **Styles**: `ZION-CORE-V2/src/components/nkyel/nkyel-workspace.css`
- **Page**: `ZION-CORE-V2/src/app/(main)/workspace/page.tsx`
- **Store**: `ZION-CORE-V2/src/lib/nkyel/work-graph-store.ts`
