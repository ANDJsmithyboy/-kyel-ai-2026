# PERMANENT ÑKYEL RELEASE RULE & PERSISTENCE DOCTRINE (P0 ABSOLUTE)

**PROJECT:** ÑKYEL AI  
**OWNER:** SmartANDJ AI Technologies — Founder: Daniel Jonathan ANDJ  

---

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

---

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

---

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
