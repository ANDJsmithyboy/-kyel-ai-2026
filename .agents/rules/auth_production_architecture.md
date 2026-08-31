# ÑKYEL — PRODUCTION AUTH EXPERIENCE STRICT IMPLEMENTATION

## 1. PRIMARY OBJECTIVE
Create one coherent Ñkyel authentication experience across WEB, PWA, ANDROID, IOS, WINDOWS, MACOS with the SAME visual identity, typography, proportions, and behavior. Use the CORRECT Clerk SDK for each platform.

## 2. WEB / PWA — NEXT.JS 16
- Use `proxy.ts` with `clerkMiddleware()`. DO NOT use obsolete `middleware.ts`.
- Wrap root in `<ClerkProvider>`.
- Use Clerk's `<SignIn />` and `<SignUp />` wrapped inside Ñkyel's responsive page.
- Customize with Clerk `appearance` variables to match Ñkyel's identity (warm-white card, centered, etc).

## 3. RESPONSIVE DESIGN
- Truly responsive (320px up to 1920px). Full viewport background on desktop, card dominance on mobile.

## 4. LIGHT / DARK / SYSTEM
- Support Light, Dark, System. Keep composition identical.

## 5. AUTH FLOW & NEON
- Clerk: identity / authentication / session.
- Neon: application data.
- Flow: Clerk session → JWT → FastAPI verifies JWT → JWT sub → Neon user/workspace lookup.
- Do NOT block first login waiting for webhook. Use transaction UPSERT on first hit.

## 6. CROSS-PLATFORM IDENTITY CONTRACT
- Users across all platforms map to the SAME Clerk identity and SAME Neon application user. No isolated account silos.
