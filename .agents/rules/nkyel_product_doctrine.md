# ÑKYEL PRODUCT DOCTRINE & PRODUCTION CONSTRAINTS

**PROJECT:** ÑKYEL AI · **OWNER:** SmartANDJ AI Technologies — Founder: Daniel Jonathan ANDJ · **ORIGIN:** Gabon
**READ THIS BEFORE ANY MODIFICATION.** Complements `AGENTS.md` (mirrored by `GEMINI.md`) and the other rules in `.agents/rules/`. Never overwrite founder doctrine; extend it.

---

## 1. What Ñkyel is

Category: **Visual Agentic Intelligence**.
Purpose: transform human intention into work that is observable, controllable, persistent, traceable, verifiable and visually understandable.

Ñkyel is NOT: a chatbot skin, a Manus clone, a workflow dashboard, a fake multi-agent visualization, decorative progress.

Manus = QUALITY benchmark only (speed, polish, simplicity, restraint). Never copy its branding, wording or architecture.

## 2. Proprietary layers (already defined — do not redefine, rename or redesign)

| Layer | Answers | Location in repo (verified 2026-09-05) |
|---|---|---|
| Habakkuk Vision Engine™ | WHY (preserves intention → Vision Object) | `backend/core/vision_engine.py` |
| WorkGraph | WHAT IS HAPPENING (real work, evidence-backed) | `backend/api/v1/workgraph.py`, `db.models.WorkgraphNode`, FE `lib/nkyel/work-graph-store` |
| Runtime (DeerFlow adapter / LangGraph) | WHAT MUST BE DONE | `backend/core/runtime/deerflow_runtime.py`, `backend/agents/nkyel_graph.py` |
| VIFLOW™ | WHAT DESERVES ATTENTION ("the deeper the work, the quieter the interface") | internal; laws listed in `AGENTS.md §8` |
| VIE | WHAT THE HUMAN SEES, CONTROLS, VERIFIES | FE `components/chat/*`, `lib/visualEvents.ts` |

Rule: **IF ÑKYEL SHOWS THAT SOMETHING HAPPENED, ÑKYEL MUST BE ABLE TO PROVE IT HAPPENED.** No fake agents, no fake sources, no fake tool results, no hardcoded step lists, no "Connected ✓" without a real connection.

MCP / A2A / AG-UI / A2UI are infrastructure. Ñkyel uses an **AG-UI ADAPTER** (`_sse_event` in `api/v1/nkyel_agent.py`, FE `lib/nkyel/ag-ui-adapter.ts`), NOT native AG-UI. Never claim native compliance.

## 3. Ownership model (final)

- **Clerk** = identity (WHO). Trusted identity = verified RS256 `sub` only. Frontend user id / email / role / admin flag are never security evidence.
- **Neon PostgreSQL** = durable application state, relationships, ownership (WHAT EXISTS / WHO OWNS IT).
- **Cloudflare R2** = durable binary artifact bytes.
- **Runtime (DeerFlow adapter / LangGraph)** = execution.
- **FastAPI / Contabo** = authorization + orchestration boundary. **THE CHAT INTELLIGENCE COMES FROM THE BACKEND, NEVER FROM NEXT.JS.**
- **Next.js / Vercel** = presentation only. No LLM calls, no provider routing, no provider keys, no durable persistence in the browser.
- **Redis** = cache / rate-limit / ephemeral only. Never the only copy of messages, missions, artifacts.

## 4. Verified production path (repo reality, 2026-09-05)

```
Composer → useChat.sendMessage → POST {NEXT_PUBLIC_API_URL}/api/v1/nkyel/run (Bearer Clerk JWT)
→ FastAPI get_current_user (core/security.py) → Neon user upsert
→ DeerFlowRuntime.stream (in-repo adapter) → Tavily search → InferenceRouter → ArtifactService (R2 + Neon)
→ SSE (AG-UI adapter) → WorkGraph store / Sources / Artifacts
Restore: GET /api/v1/conversations, GET /api/v1/conversations/{id}/messages, GET /api/v1/nkyel/mission/{id}/restore
```

- `nkyel-fd-main/src/app/api/chat/stream/route.ts` = **LEGACY fallback**. Do not extend it (no providers, no Neon, no DeerFlow there).
- "DeerFlow 2.0" in this repo is an **in-repo adapter** (`backend/deerflow_core/*`, `core/runtime/deerflow_runtime.py`). The upstream `deer-flow` package is NOT installed. The `deerflow` container (`Dockerfile.deerflow`, port 8080) is only health-probed by the backend; runs execute in-process. Report it as "DeerFlowRuntime adapter", never as upstream DeerFlow.
- LangGraph 0.2.x IS installed and used by the NATIVE engine path (`agents/nkyel_graph.py`), without a durable checkpointer.

## 5. Inference (founder decision, fixed)

Sequential chain, backend-only, in `backend/core/routing/inference_router.py`:
1. RunPod public endpoint GPT-OSS 120B → 2. RunPod public endpoint Qwen3 32B AWQ → 3. Groq A → 4. Groq B → 5. Gemini (last resort).
RunPod PUBLIC ENDPOINTS ONLY. Never create pods / workers / GPUs. Never parallel paid requests. Bounded retries.

## 6. Google review context (EXTREME PRIORITY)

- Review access = `/review/google/{token}` (frontend) ↔ `backend/api/v1/review.py` + `middleware/review_auth.py`, cookie `nkyel_review_session`. **DO NOT CHANGE OR ROTATE THE SUBMITTED LINK OR FLOW** unless a reproduced bug requires it.
- Google may test at any moment. Priority = observable reliability for founder + reviewers, not new features, not refactors, not speculative scale. Multi-user isolation must remain correct.

## 7. Engineering law for every session

1. Read memory → read architecture → trace production path → run tests → observe failures → THEN fix.
2. Smallest surgical change. Never refactor unrelated working code. Never `git reset --hard`, `git clean -fd`, force push, `docker compose down -v`, `docker system prune -a`.
3. Every visible control WORKS or IS NOT SHOWN.
4. Never print or commit secrets (Clerk, RunPod, Groq, Gemini, Neon, R2, MCP, OAuth).
5. "Production ready" requires END-TO-END proof: fresh browser → sign in → mission → real execution → sources → WorkGraph → artifact → F5 → sign out → clear localStorage → sign in → same mission restored from backend → Docker restart → still there. Not TypeScript passing. Not a 200 on /health.

## 8. Known root causes fixed on 2026-09-05 (do not reintroduce)

- Identity mismatch: `get_current_user` returns `id` = Neon `users.id`; `PersistenceService.get_or_create_user()` matched only on `clerk_user_id`, creating phantom owners → missions/conversations invisible to the real user. Resolution must match `User.id` when the identifier is a UUID.
- `core/security.py` accepted HS256 tokens signed with a hardcoded default secret before Clerk RS256. HS256 local tokens are development-only.
- First message of a new chat was sent with `mission_id=null` (React state race in `app/(main)/chat/page.tsx`) → messages landed in a second, orphan conversation.
- DeerFlowRuntime emitted simulated activity (canned subagent "findings", `print()` sandbox step, fictitious fallback source, hardcoded step list). Removed; only real Tavily / inference / artifact steps remain.
