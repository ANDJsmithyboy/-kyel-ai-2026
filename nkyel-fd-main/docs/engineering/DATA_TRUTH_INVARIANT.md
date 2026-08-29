P0: No production UI may display invented business data.

=====================================================================
ÑKYEL — ABSOLUTE DATA TRUTH CONTRACT
P0 INVARIANT — NEVER VIOLATE THIS
=====================================================================

STOP.

Before writing ANY code, understand this:

ÑKYEL HAS A ZERO-FABRICATION PRODUCTION POLICY.

This rule has higher priority than:
- visual fidelity
- screenshot similarity
- demo attractiveness
- convenience
- development speed
- perceived completeness.

A beautiful empty state is ALWAYS preferable to fabricated data.

=====================================================================
1. NEVER FABRICATE PRODUCTION DATA
=====================================================================

NEVER create fake runtime/product data in production code.

This includes, without limitation:

- fake credits
- fake quotas
- fake plans
- fake workspace names
- fake member counts
- fake users
- fake Projects
- fake Missions
- fake Agents
- fake Memories
- fake Connectors
- fake connection states
- fake Artifacts
- fake Sources
- fake Evidence
- fake WorkGraph nodes
- fake Live Flow events
- fake VIE metrics
- fake tokens
- fake latency
- fake progress percentages
- fake timestamps
- fake execution duration
- fake MCP servers
- fake protocol health
- fake usage values
- fake provider status.

=====================================================================
2. FORBIDDEN FALLBACK PATTERN
=====================================================================

This is STRICTLY FORBIDDEN:

try {
  data = await api()
} catch {
  data = {
    plan: "free",
    credits: 1250,
    members: 1
  }
}

Also forbidden:

const fallbackData = [...]
const demoWorkspace = ...
const mockMission = ...
const fakeConnector = ...
const sampleArtifacts = ...

inside production runtime paths.

A catch block must NEVER manufacture business data.

=====================================================================
3. CORRECT FAILURE BEHAVIOR
=====================================================================

If API succeeds with data:

render REAL DATA.

If API succeeds with no data:

render REAL EMPTY STATE.

If API is loading:

render SKELETON / LOADING STATE.

If API fails:

render REAL ERROR STATE + RETRY.

Therefore:

REAL DATA
OR
EMPTY
OR
LOADING
OR
ERROR.

There is NO fifth production state called:
"make it look populated".

=====================================================================
4. NULL IS VALID
=====================================================================

These are valid:

workspace = null
projects = []
missions = []
artifacts = []
agents = []
connectedConnectors = []
usage = null

Do NOT "repair" legitimate empty values with fabricated content.

The frontend must know how to beautifully render empty product state.

=====================================================================
5. SCREENSHOTS ARE VISUAL CONTRACTS ONLY
=====================================================================

Attached screenshots define:

- geometry
- spacing
- typography
- hierarchy
- card design
- colors
- responsive composition
- icon placement
- interaction intent.

They DO NOT authorize copying screenshot DATA.

Example screenshot:

"1 250 credits"

means:
DESIGN A CREDITS/USAGE ROW WITH THAT VISUAL GEOMETRY.

It does NOT mean:
hardcode 1,250 credits.

Example:

"3 connected"

means:
DESIGN THE COUNTER VISUALLY.

Production value must be:

actualConnectedConnectors.length

or backend-provided count.

=====================================================================
6. MOCK DATA IS ALLOWED ONLY IN ISOLATED DEVELOPMENT SYSTEMS
=====================================================================

Mock/demo fixtures may exist ONLY under explicitly isolated paths such as:

/__fixtures__
/mocks
/stories
/tests
/dev-only

They must NEVER be imported by production runtime code.

Production build must not fall back to them.

If demo mode exists, it must require an explicit:

DEMO_MODE=true

and must NEVER be automatically activated because an API failed.

=====================================================================
7. BACKEND IS THE SOURCE OF PRODUCT TRUTH
=====================================================================

Frontend displays backend truth.

Canonical sources:

Clerk
→ authentication / identity

Neon/PostgreSQL
→ product state / settings / Missions / Projects / Agents /
   Programs / metadata / usage / permissions / events

R2
→ binary artifacts

Qdrant
→ vector/RAG state

AG-UI/SSE
→ live execution

MCP
→ tool/server availability

A2A
→ real Agent handoffs

A2UI
→ validated dynamic UI schema.

Frontend must never infer business truth from appearance.

=====================================================================
8. CONNECTED HAS A STRICT MEANING
=====================================================================

CONNECTED may be rendered ONLY when:

authentication succeeded
AND
connection health verified
AND
usable capability/tool is available.

Having configuration data alone != Connected.

Having an API key stored != Connected.

Screenshot says Connected != Connected.

=====================================================================
9. READY HAS A STRICT MEANING
=====================================================================

Artifact READY means:

generation completed
AND
validation completed
AND
binary durably persisted
AND
metadata persisted.

Before this:
REQUESTED / QUEUED / PROCESSING / VALIDATING.

Never mark READY for visual convenience.

=====================================================================
10. RUNNING HAS A STRICT MEANING
=====================================================================

"Agent working"
"Mission running"
"Live Flow active"

must correspond to an actual backend run/event.

Do not simulate activity with timers.

No fake progress animation implying work that is not happening.

=====================================================================
11. PROTOCOL METRICS MUST BE REAL
=====================================================================

Never fabricate:

MCP latency
A2A latency
AG-UI latency
A2UI health
server count
sessions
errors
execution count.

If unavailable:

—
Unknown
Unavailable

depending on UX context.

=====================================================================
12. NO CLIENT-SIDE PERSISTENCE THEATER
=====================================================================

For persistent business state, this is forbidden:

setState(...)
localStorage.setItem(...)
toast.success("Saved")

without backend acknowledgement.

Temporary UI state may use React state.

Persistent product state must be confirmed by backend.

=====================================================================
13. MUTATION CONTRACT
=====================================================================

For every mutation:

USER ACTION
→ FRONTEND REQUEST
→ AUTH
→ BACKEND VALIDATION
→ DATABASE/RUNTIME MUTATION
→ BACKEND ACKNOWLEDGEMENT
→ FRONTEND CONFIRMATION.

Only after acknowledgement may the UI claim:

Saved
Connected
Created
Updated
Deleted
Completed
Ready.

=====================================================================
14. NEVER HIDE FAILURES WITH FAKE SUCCESS
=====================================================================

Never catch an error and return a fabricated success result.

FORBIDDEN:

catch {
  return { success: true }
}

FORBIDDEN:

catch {
  toast.success(...)
}

FORBIDDEN:

catch {
  setStatus("connected")
}

Errors must remain errors until genuinely recovered.

=====================================================================
15. STRICT STORE RULE
=====================================================================

Audit ALL frontend stores.

Especially:

workspace.store
mission.store
connector.store
agent.store
artifact.store
settings.store
program.store
usage.store
memory.store.

Stores may:

cache
normalize
coordinate requests.

Stores may NOT invent backend entities.

Failure should produce:

data = null
or
data = previous verified data
+
error state

according to correct stale-data strategy.

Never synthetic business data.

=====================================================================
16. STALE DATA RULE
=====================================================================

Previously verified server data MAY remain visible during transient
network failure if clearly handled as stale cached data.

But it must be real previously fetched data.

Never replace it with invented defaults.

=====================================================================
17. DEFAULTS VS FAKE DATA
=====================================================================

Product configuration defaults are allowed ONLY for genuine preferences.

Examples:

theme = system
accent = neutral
locale = browser/default locale
density = standard

These are CONFIGURATION DEFAULTS.

They are not business data.

Forbidden defaults include:

credits = 1250
memberCount = 1
connected = true
plan = "pro"
sourceCount = 128
confidence = 92.

=====================================================================
18. AUTOMATED ANTI-FABRICATION AUDIT
=====================================================================

Before declaring each screen complete:

search production source for suspicious:

mock
fake
dummy
sample
demo
fixture
placeholderData
fallbackData
hardcoded counts
hardcoded credits
hardcoded usage
hardcoded connected
hardcoded metrics.

Review every match.

Do not blindly delete legitimate test fixtures.

Ensure no fixture enters production runtime.

=====================================================================
19. SCREEN DELIVERY CONTRACT
=====================================================================

For EVERY screen, report:

DATA SOURCES:
[...]

REAL ENDPOINTS:
[...]

REAL EVENTS:
[...]

MUTATIONS:
[...]

LOADING STATE:
PASS / FAIL

EMPTY STATE:
PASS / FAIL

POPULATED STATE:
PASS / FAIL

ERROR STATE:
PASS / FAIL

FAKE DATA IN PRODUCTION:
ZERO / FOUND

FRONTEND-ONLY FAKE PERSISTENCE:
ZERO / FOUND

BACKEND CONNECTED:
YES / NO

If either:

FAKE DATA IN PRODUCTION != ZERO

or

FRONTEND-ONLY FAKE PERSISTENCE != ZERO

then:

SCREEN_READY = NO.

=====================================================================
20. REQUIRED CODE REVIEW BEFORE CLAIMING SUCCESS
=====================================================================

Before saying:

"Done"
"Ready"
"Production-ready"
"PASS"

perform:

1. inspect actual changed files
2. inspect git diff
3. search for fabricated fallback data
4. run typecheck
5. run build
6. run relevant tests
7. launch application
8. exercise actual UI
9. verify actual network calls
10. verify persistence/backend acknowledgement.

A successful build alone does NOT prove functionality.

=====================================================================
21. DO NOT SELF-CERTIFY WITHOUT EVIDENCE
=====================================================================

Never report:

PASS

unless you actually tested that requirement.

Use:

NOT TESTED

when it was not tested.

Use:

BLOCKED

when backend/environment is unavailable.

Use:

FAIL

when test failed.

This reporting honesty is mandatory.

=====================================================================
22. NEVER MODIFY CODE JUST TO MAKE SCREENSHOT LOOK POPULATED
=====================================================================

Pixel fidelity applies to STRUCTURE and STYLE.

Not to fabricated product data.

If screenshot contains rich user data but current user has none:

reproduce:

container
layout
typography
spacing

then show the proper production empty state.

Do not manufacture data to visually fill the screen.

=====================================================================
23. GOOGLE REVIEW RULE
=====================================================================

A truthful partially empty product is superior to a fake complete product.

For review/demo:

real seeded/test data is allowed ONLY if explicitly created through
the SAME real backend workflows as normal user data.

Example:

A test Mission may be legitimately created via backend
to demonstrate WorkGraph.

That is REAL TEST ACCOUNT DATA.

It must not be hardcoded frontend fiction.

=====================================================================
24. P0 INVARIANT
=====================================================================

THE ÑKYEL UI MUST NEVER CLAIM MORE THAN THE BACKEND HAS PROVEN.

If visual fidelity conflicts with truth:

TRUTH WINS.

If screenshot content conflicts with backend:

BACKEND WINS.

If backend is empty:

EMPTY STATE WINS.

If backend fails:

ERROR STATE WINS.

NO EXCEPTIONS.
=====================================================================
