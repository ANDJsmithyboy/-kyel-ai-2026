# Threat Model — Ñkyel AI

## Scope
This threat model covers the P0 prototype: browser-based Visual Workspace, FastAPI backend, LangGraph agent, Gemini integration, and MCP tool interface.

## Attack Surface Matrix

| Surface | Threats | Mitigations (P0) | Status |
|---------|---------|-------------------|--------|
| **Browser/Frontend** | XSS, DOM injection, localStorage theft | React auto-escaping, CSP headers, no innerHTML, Clerk auth | ✅ Active |
| **MCP Tools** | Tool poisoning, prompt injection via tool results, SSRF | Allowlist of servers, input validation, no auto-activation, timeout limits | 🔧 Partial |
| **A2A Agents** | Unauthorized agent, data exfiltration, amplification | Auth required, scope validation, P1 implementation | 📋 P1 |
| **AG-UI Stream** | Event injection, DoS via flood | Server-only event emission, rate limiting, schema validation | ✅ Active |
| **A2UI Components** | Arbitrary code execution, phishing UI | Schema validation, component allowlist, no arbitrary HTML/JS | 📋 P1 |
| **File Uploads** | Malware, path traversal, oversized files | File type validation, size limits, sandboxed storage | 🔧 Partial |
| **RAG/Vector DB** | Poisoned embeddings, data leakage | Isolated collection per user, content filtering | 🔧 Partial |
| **Memory/Provenance** | Private data exposure, uncontrolled retention | Controllable memory, deletion API, no CoT exposure | ✅ Active |
| **Sub-agents** | Privilege escalation, recursive spawning | Depth limits, inherited permissions, cost caps | 🔧 Partial |
| **Code Execution** | Sandbox escape, resource exhaustion | Sandboxed environment, time/memory limits | 📋 P1 |
| **Replay/Visualization** | Stale data replay as current, misleading timestamps | Clear "historical" vs "live" labels, immutable event log | ✅ Active |

## Critical Security Controls (P0)

1. **No secrets in code** — All credentials via environment variables
2. **No private CoT exposed** — Agent reasoning is never shown to users
3. **Human approval for external actions** — Network calls, file writes, payments require confirmation
4. **Emergency stop** — User can halt any running mission immediately
5. **Cost limits** — Token/API call budgets per run
6. **Input validation** — All API inputs validated via Pydantic models
7. **CORS restricted** — Only allowed origins
8. **Rate limiting** — Upstash Redis-based rate limits on all endpoints
9. **Auth required** — Clerk authentication on protected routes
10. **Audit logging** — All agent events logged with timestamps and correlation IDs

## Prompt Injection Defense

- System prompts are not user-modifiable
- Tool results are treated as untrusted data
- Agent output is sanitized before display
- MCP server responses are schema-validated
- No eval() or dynamic code execution from model output

## Data Classification

| Data Type | Storage | Retention | Deletion |
|-----------|---------|-----------|----------|
| User goals/messages | PostgreSQL | Session-scoped | User-deletable |
| Agent events | Event Store (memory) | Run-scoped | Auto-cleared |
| Search results | Transient | Run-scoped | Auto-cleared |
| API keys | .env files | Never committed | Manual rotation |
| Model responses | Not persisted | Transient | Immediate |
