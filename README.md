# Ñkyel AI

> **An autonomous agent whose work becomes a living, verifiable, user-editable visual workspace.**

*Created from Gabon, built for the world. "Ñkyel" means intelligence, knowledge, and ingenuity in the Fang language.*

---

## What is Ñkyel AI?

Ñkyel AI is a prototype visual-native agentic workspace submitted for the **Google Africa Applied AI Lab** (deadline: August 31, 2026).

It combines:
- **Autonomous execution** — plan, research, analyze, and synthesize end-to-end
- **Spatial visualization** — every step of the agent's work appears as an interactive node graph
- **Verifiable claims** — sources and evidence are linked to assertions
- **User control** — edit branches, reject hypotheses, trigger replanification
- **Replay & checkpoints** — revisit any mission as a navigable space

## Architecture

```
Visual Workspace (React Flow)
        ↕ AG-UI Adapter
    Event Store (append-only)
        ↕
  Canonical Work Graph (typed nodes & edges)
        ↕
    Agent Runtime (LangGraph)
  ┌────┴────┐
  │ Gemini  │  ← Primary model
  │ (Google)│
  └─────────┘
```

See [docs/architecture/NKYEL-ARCHITECTURE.md](docs/architecture/NKYEL-ARCHITECTURE.md) for the full diagram.

## Quick Start

### Frontend (Next.js)

```bash
cd ZION-CORE-V2
cp .env.example .env.local
# Fill in your API keys in .env.local
pnpm install
pnpm run dev
```

Open [http://localhost:3000/workspace](http://localhost:3000/workspace) to access the Visual Workspace.

### Backend (FastAPI + LangGraph)

```bash
cd backend
cp .env.example .env
# Fill in your API keys (GOOGLE_GENERATIVE_AI_API_KEY, TAVILY_API_KEY)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs at [http://localhost:8000/docs](http://localhost:8000/docs).

## Key Technologies

| Layer | Technology | Role |
|-------|-----------|------|
| Primary AI | **Google Gemini** | Planning, analysis, synthesis |
| Agent Orchestration | **LangGraph** | State graph with replan loop |
| Frontend | **Next.js 16 + React 19** | Web application |
| Visual Canvas | **React Flow (@xyflow/react)** | Spatial workspace |
| State Management | **Zustand** | Work Graph store |
| Backend API | **FastAPI** | SSE streaming, REST endpoints |
| Web Search | **Tavily** | Source retrieval (MCP-compatible) |
| Database | **Neon PostgreSQL** | Persistent storage |
| Vector DB | **Qdrant** | RAG knowledge base |
| Auth | **Clerk** | Authentication |
| Observability | **Sentry + PostHog** | Error tracking, analytics |

## Project Structure

```
Nkyel-AI-2026/
├── ZION-CORE-V2/              # Frontend (Next.js)
│   └── src/
│       ├── lib/nkyel/         # Core: Work Graph, Event Store, AG-UI Adapter
│       ├── components/nkyel/  # Visual Workspace Canvas
│       └── app/(main)/workspace/ # Hero demo page
├── backend/                   # Python API
│   ├── agents/                # LangGraph agent (nkyel_graph.py)
│   ├── services/              # Gemini, Tavily, Groq services
│   └── api/v1/                # REST + SSE endpoints
├── docs/                      # Architecture & product documentation
│   ├── architecture/
│   ├── product/
│   ├── migration/
│   └── demo/
└── README.md
```

## Protocols

| Protocol | Status | Role |
|----------|--------|------|
| **AG-UI** | ✅ Adapter implemented | Agent → Frontend event streaming |
| **MCP** | 🔧 Interface ready | Agent → Tools (web search, files) |
| **A2A** | 📋 P1 roadmap | Agent ↔ Agent coordination |
| **A2UI** | 📋 P1 roadmap | Agent → Dynamic UI components |
| **ACP** | 📋 P2 roadmap | IDE integration |
| **AP2** | 📋 P2 roadmap | Agentic payments |

## Honest Capability Matrix

| Capability | Status | Evidence |
|-----------|--------|----------|
| Goal → Plan → Research → Analyze → Synthesize | ✅ Real | LangGraph pipeline with Gemini |
| Visual Workspace with typed nodes | ✅ Real | React Flow canvas driven by events |
| Web search with real sources | ✅ Real | Tavily API integration |
| Claims linked to evidence | ✅ Real | Work Graph edges (supports/contradicts) |
| User branch creation | ✅ Real | Zustand store + event emission |
| Replanification from user edit | 🔧 Partial | Backend endpoint exists, full loop P1 |
| Replay / Checkpoint | 🔧 Partial | Event store replay, UI controls in progress |
| MCP tool security | 🔧 Partial | Interface defined, allowlist P1 |
| A2A agent coordination | 📋 Roadmap | Architecture defined |
| African language support | 📋 Roadmap | i18n structure exists, models not trained |
| Mobile workspace | 📋 Roadmap | Responsive CSS, dedicated views P2 |

## Founder

**Daniel Jonathan ANDJ** — SmartANDJ AI Technologies, Libreville, Gabon.

## License

Proprietary. All rights reserved.
