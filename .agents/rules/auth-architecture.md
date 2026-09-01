# PERMANENT ARCHITECTURAL RULES — NEXT.JS 16 AUTHENTICATION & PROXY.TS

**PROJECT:** ÑKYEL AI  
**OWNER:** SmartANDJ AI Technologies  

## Rules:
1. `proxy.ts` = REQUIRED at `src/proxy.ts`.
2. `middleware.ts` = FORBIDDEN anywhere in the project.
3. Next.js 16.3.3 request interception must run through `proxy.ts`.
4. Prebuild guard `scripts/check-next-auth-entry.mjs` enforces this on every build.
5. Clerk integration uses `clerkMiddleware()` inside `proxy.ts`.
6. Public routes must include `/sign-in(.*)`, `/sign-up(.*)`, `/sso-callback(.*)`.
