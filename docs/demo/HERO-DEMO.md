# Hero Demo — Visual Research & Learning Mission

## Scenario

A student or professional submits a complex research topic. Ñkyel AI autonomously plans, researches, analyzes, and synthesizes — all visible in the spatial workspace.

## Step-by-Step Flow

| Step | What Happens | Event Type | Visual Result |
|------|-------------|------------|---------------|
| 1 | User types a goal | `goal.received` | 🎯 Central gold node appears |
| 2 | Gemini creates a plan | `plan.created` | 📋 Plan node expands with task children |
| 3 | Tasks decompose | `task.created` ×3 | ⚡ Task nodes radiate from plan |
| 4 | Researcher agent spawns | `agent.spawned` | 🤖 Purple agent node with assignment edge |
| 5 | Web search executes | `tool.started` → `tool.completed` | 🔧 Tool node pulses, then completes |
| 6 | Sources arrive | `source.added` ×N | 📄 Green source nodes with URLs |
| 7 | Claims extracted | `claim.created` | 💬 Amber claim nodes |
| 8 | Evidence linked | `evidence.linked` | ✅ Green evidence → claim edges (supports) |
| 9 | Hypothesis appears | `hypothesis.created` | 🔀 Pink hypothesis with contradicts edge |
| 10 | User edits a branch | `user.node_edited` | Node title changes, replan triggers |
| 11 | Agent replans | `replan.completed` | Plan updates visually |
| 12 | Synthesis produced | `artifact.created` | 📦 Cyan artifact with final report |
| 13 | Checkpoint saved | `checkpoint.created` | 💾 Grey checkpoint node |
| 14 | Mission complete | `final.delivered` | All nodes settle, replay available |

## How to Run

### With Backend (Real Gemini)
```bash
# Terminal 1: Backend
cd backend && pip install -r requirements.txt
# Set GOOGLE_GENERATIVE_AI_API_KEY and TAVILY_API_KEY in .env
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd ZION-CORE-V2 && pnpm install && pnpm run dev
```
Open `http://localhost:3000/workspace` and enter a research goal.

### Demo Mode (No Backend)
If the backend is unavailable, the workspace page automatically runs a demo sequence with staggered events showing the full flow.

## Example Goals to Try

1. "Explain the impact of artificial intelligence on education systems in Sub-Saharan Africa"
2. "Compare renewable energy policies across CEMAC countries"
3. "What are the latest advances in malaria vaccine development?"

## WOW Formula Verification

| Component | How It's Achieved |
|-----------|-------------------|
| **Clarity** | Goal → Plan → Tasks visible as spatial hierarchy |
| **Causality** | Typed edges show why each node exists |
| **Control** | User can edit nodes, create branches, reject hypotheses |
| **Proof** | Sources linked to claims via evidence nodes, provenance badges on every node |
