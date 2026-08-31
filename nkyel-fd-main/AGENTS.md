# ÑKYEL P0 — PRODUCTION DATA TRUTH CONTRACT

This file is mandatory for every coding agent.

## ABSOLUTE INVARIANT

A ÑKYEL UI STATE MUST NEVER CLAIM MORE THAN THE BACKEND HAS PROVEN.

## Valid production states

- Loading
- Empty
- Populated with real data
- Partial
- Error
- Degraded
- Unavailable
- Offline
- Stale previously verified data

## Invalid production state

"Create believable data so the screenshot looks complete."

## Forbidden

No fake:

- credits
- plans
- members
- users
- Messages
- Missions
- Projects
- Agents
- Programs
- Connectors
- statuses
- tool availability
- MCP servers
- sources
- evidence
- WorkGraph nodes
- artifacts
- protocol health
- latency
- usage
- tokens
- progress
- timestamps
- confidence
- charts
- metrics
- health states.

## Screenshots

Screenshot STRUCTURE = UI contract.

Screenshot CONTENT = example only.

## Connected

CONNECTED requires:

auth/config valid
+
health verified
+
usable capability/tool.

A database row is not enough.

## Artifact ready

READY requires:

generation completed
+
validation
+
binary persisted
+
metadata persisted.

## Running

RUNNING requires an actual backend run.

## Saved

SAVED requires backend acknowledgement.

## Success

SUCCESS requires backend acknowledgement.

## Test fixtures

Fixtures may exist only under:

tests/
stories/
fixtures/
dev-only/

Never production runtime.

## Backend ownership

Business truth:
FastAPI / Coolify.

Frontend:
Next.js / Vercel.

Next.js BFF does not create competing domain truth.

## Report honesty

Only these statuses are allowed:

PASS
FAIL
BLOCKED
NOT TESTED.

Never report PASS without actually testing it.

Build success is not proof that functionality works.

## Before completion

Every coding agent must inspect:

git diff
lint
typecheck
tests
production build
real runtime/network behavior.

Search production source for:

mock
fake
dummy
sample
fallback
demo
fixture
hardcoded metrics.

Review every match.

P0:
TRUTH > VISUAL COMPLETENESS.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
