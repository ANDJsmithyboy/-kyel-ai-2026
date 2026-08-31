# ÑKYEL — PRODUCTION INTERNATIONALIZATION CONTRACT

## 1. ENGLISH US FIRST
- `en-US` is the canonical source language and the fallback.
- Phase 1 locales: `en-US`, `fr-FR`, `es-ES`, `zh-Hans`, `ar` (FULL RTL).

## 2. REAL I18N
- Changing the application language updates the ENTIRE static UI (Auth, Sidebar, Modals, etc).
- No mixed-language UI.

## 3. APPLICATION LANGUAGE != CONVERSATION LANGUAGE
- Application UI language (e.g. English) is independent of the Mission/Conversation language (e.g. French).
- Artifacts generation language prioritizes explicit user instruction → Mission language → App locale.

## 4. ARCHITECTURE
- Use a structured translation framework (e.g. next-intl or i18next). No hardcoded UI strings.
- Backend logic uses stable machine identifiers, never translated strings (e.g. `status = "mission_completed"`, not `"Mission terminée"`).

## 5. RTL & SCRIPT SUPPORT
- Arabic (`ar`) must implement TRUE right-to-left layout (`dir="rtl"`). Use CSS logical properties (`margin-inline`, etc). Mirror directional icons.
- Simplified Chinese (`zh-Hans`) typography must support Chinese characters properly.

## 6. QA MATRIX
- Every locale must be tested at 390px, 430px, 768px, and 1440px to ensure translations (especially longer French/Spanish strings) do not clip or break layouts.
