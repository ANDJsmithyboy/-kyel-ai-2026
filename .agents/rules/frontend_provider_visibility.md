# FRONTEND PROVIDER VISIBILITY POLICY

Ñkyel must NOT expose backend infrastructure to normal end users.

Normal users interact with Ñkyel capabilities:
- Research
- Image
- Video
- Documents
- Slides
- Spreadsheets
- Web
- Agents
- Sources
- Evidence
- Artifacts

Do NOT expose by default:
- fal.ai
- Runway
- Groq
- Tavily
- internal routing
- provider budgets
- API architecture
- fallback chains
- internal infrastructure.

===================================
GOOGLE SHOWCASE MODE
===================================

Controlled feature flag: `GOOGLE_SHOWCASE_MODE`

This mode is intended for:
- GOOGLE_REVIEWER
- OWNER
- INTERNAL_DEMO

When enabled, frontend MAY visibly identify Google technologies that ACTUALLY executed.

Examples:
- Gemini
- Google Search
- Google Maps
- Google Image / Nano Banana
- Veo
- Google Drive
- Google Docs
- Google Sheets

These can appear in:
- Chat execution cards
- VIE
- WorkGraph
- Visual Flow
- Artifact provenance
- Mission completion summary.

===================================
ABSOLUTE TRUTHFULNESS
===================================

Never display Google branding for an operation that was actually executed by another provider.

Example:
- If: `provider = google` and `access_method = DIRECT_GOOGLE` -> Google attribution is allowed.
- If: `provider = google` and `access_method = RUNWAY_ROUTER` -> advanced provenance may indicate: `Google model via routed media infrastructure`, but do not represent it as Google Direct.
- If: `provider = fal` or `provider = runway` -> do NOT display a Google badge.

In standard user mode, simply display the Ñkyel capability:
- Visual Agent
- Video Agent
- Research Agent
without infrastructure details.

===================================
THREE VISIBILITY LEVELS
===================================

LEVEL 1 — USER
Show:
- Agent
- Task
- Sources
- Evidence
- Status
- Artifact
- Result
Hide infrastructure.

LEVEL 2 — GOOGLE SHOWCASE
Show:
- Google technology actually used
- Google Search grounding
- Gemini execution
- Maps
- Google media
- Google Workspace
Only from real telemetry.

LEVEL 3 — OWNER / ADMIN
Show:
- provider
- model
- access method
- router
- cost
- credits
- latency
- fallback
- provider request ID
- health
- errors

===================================
DESIGN
===================================

Google technology attribution must remain subtle.
Do NOT transform Ñkyel into a Google-branded product.
Ñkyel remains the primary identity.

Preferred visual hierarchy:
1. Ñkyel Agent
2. Task / capability
3. Result
4. Small secondary attribution: `Powered by Google` or `Google Search` or `Gemini` where truthful and useful.

Ñkyel branding remains dominant.

===================================
MISSION COMPLETION
===================================

In `GOOGLE_SHOWCASE_MODE`, mission completion can include a compact:

GOOGLE TECHNOLOGY USED
- Gemini             ✓
- Google Search       ✓
- Google Maps         ✓
- Google Image        ✓
- Veo                 ✓
- Google Workspace    ✓

Values MUST come from actual mission telemetry. Never hardcode them.

===================================
PRODUCT INDEPENDENCE
===================================

Google integration must be deep, but Ñkyel architecture remains provider-independent.
Disabling `GOOGLE_SHOWCASE_MODE` must NOT disable Ñkyel.
It only changes frontend attribution and reviewer-facing visibility.
Provider routing remains backend-controlled.
