# PERMANENT PROJECT MEMORY & ARCHITECTURAL RULES — ÑKYEL AI

**PROJECT:** ÑKYEL AI  
**OWNER:** SmartANDJ AI Technologies — Founder: Daniel Jonathan ANDJ  

> **CRITICAL ARCHITECTURAL DIRECTIVE**: This file defines permanent, immutable architectural rules for the Ñkyel AI repository. Do not reinterpret, override, or alter these rules in any future session.

---

## PERMANENT ÑKYEL ARCHITECTURE MEMORY

VIFLOW™, Habakkuk Vision Engine™, WorkGraph and VIE are established proprietary Ñkyel systems.

They must never be renamed, redefined, replaced or redesigned without explicit founder instruction.

Before modifying any related code, always read the existing project-memory definitions first.

Architecture:

User Intention
→ Habakkuk Vision Engine
→ Vision Object
→ Mission
→ WorkGraph
→ Real Agent Runtime
→ Runtime Events
→ VIFLOW
→ VIE
→ Evidence
→ Deliverable

Habakkuk preserves the vision.

WorkGraph structures the work.

The runtime executes the work.

VIFLOW protects human attention.

VIE makes intelligence observable, controllable and verifiable.

MCP, A2A, AG-UI and A2UI are infrastructure/interoperability standards.

They do NOT replace Ñkyel proprietary architecture.

DeerFlow and LangGraph are runtime/orchestration infrastructure.

They do NOT replace Ñkyel proprietary architecture.

Never expose proprietary VIFLOW or Habakkuk internal mechanisms publicly.

Never display fake agentic activity.

If Ñkyel shows it, Ñkyel must be able to prove it happened.

NEXT.JS PERMANENT RULE:

Next.js 16 uses proxy.ts.

Never create middleware.ts.

One proxy.ts.
Zero middleware.ts.

---

---

## 1. PERMANENT MEMORY — NEXT.JS / CLERK ARCHITECTURE

1. **Next.js 16.3.3**: Ñkyel frontend strictly uses Next.js 16.
2. **`proxy.ts` = REQUIRED**: Next.js 16 request interception and Clerk auth execution is done via `src/proxy.ts`.
3. **`middleware.ts` = FORBIDDEN**: `middleware.ts` and `middleware.js` are strictly FORBIDDEN in this project.
4. **NEVER**:
   - Create `middleware.ts` or `middleware.js`
   - Recreate `middleware.ts`
   - Rename `proxy.ts` to `middleware.ts`
   - Delete `proxy.ts`
   - Migrate Clerk back to `middleware.ts`
   - Copy old Next.js 15 Clerk architecture
5. **Clerk Integration**: Clerk authentication MUST remain integrated through `src/proxy.ts`.
6. **Protected File**: `src/proxy.ts` is protected infrastructure and MUST NOT be removed or replaced.
7. **Permanent File Header**: `src/proxy.ts` must always retain the header:
   ```typescript
   // NEXT.JS 16 ARCHITECTURE
   // DO NOT CREATE middleware.ts
   // Clerk authentication MUST remain in proxy.ts
   ```
8. **File Counts**: The repository must contain **EXACTLY ONE active `proxy.ts`** and **ZERO active `middleware.ts`**.
9. **No Blind Overwriting**: Inspect existing `src/proxy.ts` logic before editing. Preserve existing routing rules.
10. **Public Routes**: Must include:
    - `/sign-in` and `/sign-in/(.*)`
    - `/sign-up` and `/sign-up/(.*)`
    - `/sso-callback` and `/sso-callback/(.*)`
    - `/api/webhooks(.*)`, `/api/v1/clerk-webhook(.*)`, `/api/health(.*)`
    - `/`, `/terms(.*)`, `/privacy(.*)`, `/legal(.*)`, `/cookies(.*)`, `/acceptable-use(.*)`, `/security(.*)`, `/review(.*)`
11. **No Redirect Loops**: Do not create redirect loops between protected routes and `/sign-in`.
12. **No Blocking**: Never block Clerk callbacks, Clerk internal routes, Next.js internals, static assets, images, fonts, or auth pages.

---

## 2. PERMANENT BUILD GUARD

The project enforces a build guard (`scripts/check-next-auth-entry.mjs`) configured as `"prebuild"` in `package.json`:
- Asserts that `proxy.ts` exists.
- Asserts that `middleware.ts` / `middleware.js` does NOT exist.
- Fails immediately with: `"Ñkyel uses Next.js 16. middleware.ts is forbidden. Use proxy.ts only."` if any middleware file is detected.

---

## 3. PERMANENT FRONTEND & AUTH UI RULES

The Ñkyel authentication UI is **APPROVED & FINAL**:
- **Visual Identity**: Panther background, white premium authentication card, Ñkyel logo, `"by SmartANDJ AI Technologies"` luxury signature.
- **Languages**: EN / FR language selector.
- **Supported Auth Providers**: 1. Email (OTP/Magic Link), 2. Google OAuth.
- **Do NOT redesign or alter auth UI** unless explicitly requested by the founder.

---

## 4. PERMANENT PRODUCTION STACK & DOMAIN CONTRACT

- **Frontend**: Next.js 16 on Vercel ➔ `https://nkyel.smartandjai.com`
- **Clerk Frontend API**: `https://clerk.smartandjai.com`
- **Clerk JWKS**: `https://clerk.smartandjai.com/.well-known/jwks.json`
- **Clerk Backend API (Clerk server only)**: `https://api.clerk.com`
- **Ñkyel FastAPI Core Backend**: Docker on Contabo VPS ➔ `https://api.nkyel.smartandjai.com`
- **Database**: Neon PostgreSQL Serverless (asyncpg)

### Responsibility Separation:
- **Clerk**: Authentication & identity tokens.
- **Next.js / Vercel**: Frontend UI, session handling, user interaction.
- **FastAPI**: Business logic, autonomous agents, authorization, IDOR checks.
- **Neon**: Persistent application database.

---

## 5. PERMANENT BACKEND & SECURITY RULES

The FastAPI Clerk security layer in `backend/core/security.py` is **HARDENED & LOCKED**:
- **Strict RS256**: Enforced algorithm check. Reject any HS256/other algorithms.
- **Dynamic JWKS**: Cached with in-memory TTL and automatic key rotation on unknown `kid`.
- **Claims Verification**: `exp`, `nbf`, `iat` (10s leeway), `iss` (`https://clerk.smartandjai.com`), mandatory `azp` (`https://nkyel.smartandjai.com`).
- **Identity Derivation**: User identity is derived strictly from verified `sub`.
- **Do NOT weaken or rewrite** the security core.

---

## 6. PERMANENT DEBUGGING ORDER

When diagnosing authentication or access issues, ALWAYS proceed in this strict order:
1. Verify `proxy.ts` exists and `middleware.ts` does not exist.
2. Verify `pnpm run build` succeeds locally / on CI.
3. Deploy to Vercel.
4. Verify `/sign-in` renders custom Ñkyel UI.
5. Verify Clerk Email login completes and creates session.
6. Verify Clerk Google OAuth completes via `/sso-callback` and creates session.
7. Verify session persistence after browser page refresh.
8. Verify authenticated user enters `/chat` or `/workspace` without redirect loop.
9. Verify authenticated admin enters `/admin` with actual permissions (no fake `admin=true`).
10. Verify `getToken()` returns valid RS256 JWT.
11. Verify frontend sends `Authorization: Bearer <token>` to `https://api.nkyel.smartandjai.com/api/auth/me`.
12. Verify FastAPI verifies JWT and provisions/reads user in Neon PostgreSQL.

---

## 7. PERMANENT CHANGE POLICY

- Make the smallest possible surgical change.
- Never refactor unrelated working components.
- Never downgrade Next.js or Clerk.
- **ÑKYEL + NEXT.JS 16 = `proxy.ts` EXCLUSIVELY.**

---

## 8. PROPRIETARY VISUAL INTELLIGENCE DOCTRINE (VIFLOW™ & HABAKKUK™)

VIFLOW™ (Visual Intelligence Flow Protocol) and Habakkuk Vision Engine™ are ALREADY DEFINED proprietary Ñkyel systems.
DO NOT redesign them. DO NOT rename them. DO NOT invent new principles for them. DO NOT replace their existing doctrine with generic UX theory.

The architecture is strictly:
1. **USER INTENTION**
2. **HABAKKUK VISION ENGINE** (Transforms intent to Vision Object)
3. **WORKGRAPH** (Structures the work: goals, plans, tasks, agents, tools)
4. **REAL AGENT EXECUTION** (DeerFlow / LangGraph)
5. **VIFLOW** (Regulates how work is exposed. "The deeper the work, the quieter the interface.")
6. **VISUAL INTELLIGENCE EXPERIENCE (VIE)** (The visible UI)
7. **EVIDENCE + DELIVERABLE**

**Responsibility Separation:**
- Habakkuk makes the vision explicit (WHERE we are going).
- WorkGraph structures the work.
- The Runtime (AG-UI) executes the work (WHAT is happening).
- VIFLOW protects the mind performing it by deciding HOW MUCH is shown.
- VIE is what the human actually sees.

**VIFLOW Laws:**
- One dominant objective
- Redeemed time
- Visual silence
- Progressive revelation
- Order before motion
- Count the cost
- Wisdom before execution
- No vanity metrics
- Fruit over activity
- Context survives interruption
- Completion reward
- User agency

**SECURITY / IP RULE:**
The detailed VIFLOW and Habakkuk mechanisms are INTERNAL. DO NOT expose them in public UI, README, marketing pages, client-side comments, public API documentation, public GitHub repositories, browser bundles, or console logs. Publicly expose only approved high-level doctrine.

---

## 9. PERMANENT ÑKYEL RELEASE RULE & PERSISTENCE DOCTRINE (P0 ABSOLUTE)

### Product Rule:
```text
NO PERSISTENCE
= NO PRODUCTION
```

### Standard Minimum Requirement:
```text
User logs in
→ starts a mission
→ DeerFlow / LangGraph execute
→ sources appear
→ agents/subagents act
→ artifacts are created
→ images/files are saved
→ mission completes
→ user closes browser
→ backend restarts if necessary
→ user returns later
→ everything is still there
```

With exactly the same:
- `user` (Identity & authorization)
- `mission`
- `thread`
- `run` & RunStore
- `WorkGraph`
- `sources`
- `artifacts`
- `images`
- `files`
- `history`
- `status`
- `final result`

Strict tenant isolation:
```text
User A ≠ User B
```

### Mandatory Release Blockers:
1. **Clerk `sub` → user Neon fiable**: Reliable mapping, verified claims, auto-provisioning.
2. **Mission persistée**: Saved in Neon relational store.
3. **DeerFlow thread persisté**: Checkpointed runtime state.
4. **DeerFlow run / RunStore persisté**: Durable execution checkpoints and events.
5. **WorkGraph restaurable**: Graph structure, nodes, statuses faithfully reloadable without regeneration.
6. **Sources persistées**: Grounding and citation references retained with the mission.
7. **Artifacts indexés dans Neon**: Metadata, links, and content pointers permanently logged.
8. **Fichiers/Images dans Cloudflare R2**: Durable binary storage; never lost on container teardown.
9. **Restore après refresh**: Browser page refresh preserves complete active/historical state.
10. **Restore après reconnexion**: New login session loads full prior history and deliverables.
11. **Restore après restart Docker**: Backend reboot loses zero state or deliverables.
12. **User isolation**: Strict IDOR guards prevent cross-user data leakage.
13. **Admin role preserved**: Actual role persistence across sessions and reboots.
14. **Cancel / Retry réels**: Mission lifecycle control backed by runtime state.
15. **No temporary provider URLs as final storage**: URLs expire; store binary assets in R2 and index in Neon.

### The Immutable Release Directive:
```text
PERMANENT ÑKYEL RELEASE RULE

Persistence is a P0 production requirement.

Ñkyel must never be considered production-ready unless a real authenticated user can:

create a mission,
close the application,
return later,
and recover the same:

thread
mission
run history
WorkGraph
agents
sources
artifacts
images
files
status
final result

without regeneration.

The system must also survive:

browser refresh
new login session
frontend redeploy
FastAPI restart
Docker restart

Final user artifacts must not depend on:

React state
temporary provider URLs
ephemeral container files
browser localStorage

Canonical ownership:

Clerk
= human identity

Neon
= relational ownership and metadata

DeerFlow / LangGraph
= runtime execution state

Cloudflare R2
= durable binary artifact storage

FastAPI
= authorization and orchestration boundary

If this durability chain is not proven with real production tests:

DO NOT SAY PRODUCTION READY.
```

---

## 10. FINAL MODEL PRIORITY — FOUNDER DECISION

This routing order is now FIXED unless explicitly changed by the founder.

### PRIMARY MODEL:
RunPod Public Endpoint GPT-OSS 120B
- Base URL: `https://api.runpod.ai/v2/gpt-oss-120b/openai/v1`
- Model ID: `openai/gpt-oss-120b`

### SECONDARY ACTIVE MODEL:
RunPod Public Endpoint Qwen3 32B AWQ
- Base URL: `https://api.runpod.ai/v2/qwen3-32b-awq/openai/v1`
- Model ID: `Qwen/Qwen3-32B-AWQ`

Both RunPod models must be configured and production-tested.
DO NOT deploy our own GPU.
DO NOT create a Pod.
DO NOT create a custom RunPod Serverless worker.
Use RunPod READY-TO-USE PUBLIC ENDPOINTS only.

### FINAL FALLBACK CHAIN:
1. GPT-OSS 120B — RunPod (Primary)
2. Qwen3 32B AWQ — RunPod (Secondary Active)
3. Existing Groq Model A (`llama-3.3-70b-versatile` / AURATA)
4. Existing Groq Model B (`llama-3.1-8b-instant` / SONAR)
5. Existing Gemini model — LAST RESORT

Do not invent Groq or Gemini model IDs. Read the existing project configuration and preserve the actual models already selected by the founder.

### WHY GPT-OSS IS PRIMARY:
GPT-OSS 120B currently receives priority because:
- larger documented context window (131,072 tokens in RunPod coding integration)
- strong reasoning & instruction following
- OpenAI-compatible API & streaming support
- suitable for coding workflows & long DeerFlow missions
- appropriate for tool-oriented agent execution

### WHY QWEN REMAINS ACTIVE:
Qwen3 32B AWQ must NOT be treated as an unused backup. It is an active secondary model because it provides:
- reasoning & instruction following
- agent capabilities & multilingual strengths
- OpenAI-compatible API & streaming
- lower model complexity than GPT-OSS 120B
It may outperform GPT-OSS on specific multilingual or structured tasks.

### ONE CANONICAL INFERENCE ROUTER:
```text
DeerFlow
  ↓
InferenceRouter
  │
  ├── GPTOSSRunPodProvider (Primary)
  ├── QwenRunPodProvider (Secondary Active)
  ├── GroqProvider Model A (Fallback 1)
  ├── GroqProvider Model B (Fallback 2)
  └── GeminiProvider (Last Resort)
```
Do NOT place fallback logic separately inside `useChat.ts`, agents, tools, API routes, or React components. The routing policy belongs strictly server-side.

### RUNPOD CREDIT PROTECTION & RATE POLICIES:
- Starting credit: **$7.47**
- NO parallel paid requests (one model request at a time, sequential fallback).
- Track: provider, model, input tokens, output tokens, latency, status, fallback reason.
- Zero token waste: no infinite retries, no duplicate prompts, no unbounded subagents.

