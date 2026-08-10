# Protocol Matrix — Ñkyel AI

## Protocol Registry

| Protocol | Full Name | Role | Version Targeted | SDK/Spec | Status | Tests | Fallback |
|----------|-----------|------|-------------------|----------|--------|-------|----------|
| **MCP** | Model Context Protocol | Agent → Tools, data, context | `2025-03-26` stable | `modelcontextprotocol.io` | 🔧 Interface ready | Contract tests planned | Direct HTTP calls |
| **A2A** | Agent2Agent Protocol | Agent ↔ Agent coordination | `latest` | `a2a-protocol.org` | 📋 P1 | — | Internal function calls |
| **AG-UI** | Agent User Interaction | Agent → Frontend streaming | `latest` | `docs.ag-ui.com` | ✅ Adapter built | Event mapping tested | Raw SSE |
| **A2UI** | Agent-to-User Interface | Agent → Dynamic UI cards | `latest` | Google blog + repo | 📋 P1 | — | Static React components |
| **ACP** | Agent Client Protocol (IDE) | Agent → IDE/Editor | `latest` | `zed.dev/acp` | 📋 P2 | — | — |
| **AP2** | Agentic Payments Protocol | Agent → Payment flows | `latest` | `ap2-protocol.org` | 📋 P2 | — | — |

## MCP — Agent → Tools (P0)

**Purpose**: Connect Ñkyel to external tools (web search, file access, code execution) via a standardized protocol.

**Implementation**:
- Internal `ToolRegistry` interface abstracting MCP client
- Tavily web search wrapped as MCP-compatible tool
- Allowlist of authorized MCP servers (none activated by default)
- Permissions and confirmation per tool type
- Timeouts, quotas, schema validation

**Security**:
- No unknown MCP server activated automatically
- No shell commands built from untrusted MCP data
- Input validation on all tool parameters
- Audit log for all tool invocations

## AG-UI — Agent → Frontend (P0)

**Purpose**: Stream structured events from the agent runtime to the Visual Workspace.

**Implementation**: `ZION-CORE-V2/src/lib/nkyel/ag-ui-adapter.ts`

**Mapped Events**:
- Run lifecycle (created, running, completed, cancelled)
- Text messages
- Tool calls and results
- State snapshots
- Progress updates
- Errors and interruptions
- Human approvals

## A2A — Agent ↔ Agent (P1)

**Purpose**: Enable Ñkyel to discover and coordinate with specialized remote agents.

**P1 Plan**:
- Agent Card describing Ñkyel capabilities
- Task creation and status tracking
- Message and artifact exchange
- Authentication and scope validation
- Local demo agent for testing before any remote connection

## A2UI — Dynamic UI (P1)

**Purpose**: Allow agents to propose UI components (cards, forms, tables) within workspace nodes.

**Rules**:
- Client owns the renderer and component catalog
- No arbitrary HTML/JS execution
- Schema validation on all received UI specs
- Respects Ñkyel brand, accessibility, and permissions

## ACP / AP2 — Future (P2)

- **ACP**: IDE integration for developer-facing Ñkyel features
- **AP2**: Agentic payment flows with mandatory human approval, no real transactions in prototype
