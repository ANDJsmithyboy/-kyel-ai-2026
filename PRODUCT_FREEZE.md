# PRODUCT FREEZE — ÑKYEL AI (BETA-RC1)
**SmartANDJ AI Technologies · Founder & Lead Architect: Daniel Jonathan ANDJ**
*Effective Date: 2026-08-25 19:30:00 UTC*
*Status: FROZEN — PRODUCTION CANDIDATE & 40-HOUR VALIDATION CYCLE*

---

## 1. Product Scope Lockdown
As of this declaration, **all product feature additions and experimental expansions are strictly frozen**.
No new UI surfaces, experimental models, or speculative agent tools may be introduced without an explicit release cycle update.

### Permitted Modifications Only:
- **P0 / P1 Bug Fixes** (Crashes, auth failures, data corruption, mission interruption)
- **Security & Privacy Hardening** (RBAC enforcement, secret isolation, CORS/JWKS security)
- **Production Observability & Telemetry** (Latency metrics, Sentry error traces, SSE streaming health)
- **Admin Command Center Operations** (40-hour test cockpit, triage inbox, budget tracking)
- **Feedback Loop Enhancements** (Safe client context, R2 screenshot attachments, Neon persistence)
- **Docker Containerization & Infrastructure Portability** (RunPod CPU validation, 32-vCPU VPS scaling)

---

## 2. Release & Target Environment Identification
- **Release Version**: `1.0.0-rc1`
- **Release Tag**: `beta-rc1`
- **Target Validation Environment**: RunPod CPU (4 vCPU / 16 GB RAM) for 40 hours of intensive test cycles
- **Target Beta Production Environment**: Strong 32-vCPU Dedicated Linux VPS (via immutable Docker container)
- **Database Sovereign State**: Neon PostgreSQL (RLS / ACID transactions)
- **Object / Artifact Storage**: Cloudflare R2 (Immutable content-addressed binaries)
- **Vector & Memory Store**: Qdrant Cloud

---

## 3. Brand Hierarchy & UI Signature
- **Primary Shell Branding**: Strictly **Wordmark-First (`Ñkyel`)** across all desktop, tablet, and mobile views.
- **UI Interaction Signature**: Canonical **Iboga Glyph** (`/brand/iboga-glyph.svg`, `<IbogaNavigationTrigger />`) replacing all generic hamburger `☰` icons.
- **Ecosystem Coherence**: Shared Iboga gesture across Ñkyel AI and Gaboma AI, preserving individual product palettes.
- **Separate Admin Application**: The Admin Command Center is decoupled from normal consumer UI surfaces and strictly guarded by server-side RBAC (`OWNER`, `SUPER_ADMIN`, `AI_ADMIN`, `SUPPORT`, `OBSERVER`).
