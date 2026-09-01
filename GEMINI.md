# PERMANENT PROJECT MEMORY & ARCHITECTURAL RULES — ÑKYEL AI

**PROJECT:** ÑKYEL AI  
**OWNER:** SmartANDJ AI Technologies — Founder: Daniel Jonathan ANDJ  

> **CRITICAL ARCHITECTURAL DIRECTIVE**: This file defines permanent, immutable architectural rules for the Ñkyel AI repository. Do not reinterpret, override, or alter these rules in any future session.

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
- Never fake administrative permissions (`admin=true`).
- **ÑKYEL + NEXT.JS 16 = `proxy.ts` EXCLUSIVELY.**
