# ÑKYEL AI — Threat Model & Security Hardening

## 1. Architecture Overview

```
User → Next.js Frontend → FastAPI Backend → LangGraph Agent → Gemini API
                    ↓                ↓              ↓
              [Clerk Auth]    [MCP Registry]   [Tavily API]
                              [SQLite Events]
```

## 2. Threat Actors

| Actor | Capability | Intent |
|-------|-----------|--------|
| **Unauthenticated user** | HTTP requests to API | Abuse, data scraping |
| **Authenticated user** | Valid session, API calls | Prompt injection, cost abuse |
| **Malicious prompt** | Crafted input text | LLM manipulation, data exfiltration |
| **MITM attacker** | Network interception | Token theft, response manipulation |

## 3. Threat Matrix

### T1: Prompt Injection
- **Risk**: HIGH
- **Attack**: User injects system-level instructions in their goal
- **Mitigation**:
  - ✅ All user input passed through `MCPInputValidator` (JSON schema validation)
  - ✅ Goals are sanitized in `receive_goal()` before LLM processing
  - ✅ System prompts are hardcoded, not user-configurable
  - 🔲 TODO: Add LLM output validation (check for sensitive data leakage)

### T2: MCP Tool Abuse
- **Risk**: MEDIUM
- **Attack**: User triggers excessive tool calls or accesses unauthorized tools
- **Mitigation**:
  - ✅ `MCPPermissionGate` — role-based tool access control
  - ✅ `MCPRateLimiter` — 30 calls/min per user/tool sliding window
  - ✅ `MCPNetworkAllowlist` — only 5 approved hosts
  - ✅ `MCPInputValidator` — parameter validation before execution
  - ✅ Full audit log of all MCP calls

### T3: API Key Exposure
- **Risk**: HIGH
- **Attack**: API keys leaked through logs, error messages, or client
- **Mitigation**:
  - ✅ Keys loaded from environment variables only
  - ✅ No keys in frontend code
  - ✅ No keys in git history (.env in .gitignore)
  - ✅ Events are redacted before persistence (`.redacted` flag)
  - 🔲 TODO: Rotate keys after any suspected breach

### T4: Cost Abuse (LLM Billing)
- **Risk**: MEDIUM
- **Attack**: Attacker triggers many expensive LLM calls
- **Mitigation**:
  - ✅ `GeminiCostTracker` tracks cumulative spend per session
  - ✅ `MCPRateLimiter` limits tool execution frequency
  - 🔲 TODO: Add per-user daily cost cap (configurable)
  - 🔲 TODO: Alert when cost exceeds threshold

### T5: SQLite Injection
- **Risk**: LOW
- **Attack**: Malicious data in event payloads corrupts SQLite
- **Mitigation**:
  - ✅ All SQLite queries use parameterized statements (`?` placeholders)
  - ✅ Event payloads serialized via `json.dumps()` before storage
  - ✅ No user-controlled SQL in any query

### T6: Cross-Site Scripting (XSS)
- **Risk**: LOW
- **Attack**: Malicious HTML/JS in LLM response rendered in frontend
- **Mitigation**:
  - ✅ React auto-escapes all rendered content by default
  - ✅ Markdown rendered via sanitized renderer (no raw HTML)
  - ✅ CSP headers recommended for production

### T7: CORS Misconfiguration
- **Risk**: MEDIUM (dev only)
- **Attack**: Any origin can call the API
- **Mitigation**:
  - ⚠️ Current: `allow_origins=["*"]` in development
  - 🔲 TODO: Restrict to `localhost:5175` and production domain in non-dev mode

## 4. Security Controls Summary

| Control | Status | Layer |
|---------|--------|-------|
| Role-based permissions (MCP) | ✅ Active | Backend |
| Rate limiting (sliding window) | ✅ Active | Backend |
| Network allowlist (5 hosts) | ✅ Active | Backend |
| Input validation (JSON schema) | ✅ Active | Backend |
| Parameterized SQL | ✅ Active | Database |
| Cost tracking | ✅ Active | Backend |
| Audit logging | ✅ Active | Backend |
| Event redaction | ✅ Active | Backend |
| Environment variable secrets | ✅ Active | Infrastructure |
| React XSS protection | ✅ Active | Frontend |
| CORS restriction | 🔲 Prod only | Backend |
| Daily cost cap | 🔲 TODO | Backend |
| Output validation | 🔲 TODO | Backend |

## 5. Recommendations for Production

1. **Enable Clerk authentication** on all `/api/agent/*` endpoints
2. **Restrict CORS** to production domain only
3. **Add rate limiting** at the reverse proxy level (nginx/Cloudflare)
4. **Enable HTTPS** with TLS 1.3
5. **Set up Sentry** for error monitoring and alerting
6. **Add daily cost cap** per user with configurable limits
7. **Implement output scanning** for PII/sensitive data in LLM responses
8. **Run security audit** with OWASP ZAP before launch
