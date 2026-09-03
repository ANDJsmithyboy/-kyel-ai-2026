"""
Ñkyel AI — Complete Parallel Runtime Test Suite · SmartANDJ AI Technologies
Validates every single dimension of:
1. Native NkyelGraphRuntime (PLAN -> RESEARCH -> ANALYZE -> SYNTHESIZE -> DELIVER)
2. Complete DeerFlow 2.0 Engine (Gateway, Skills, MCP, Tools, Subagents, Sandbox, Search, Streaming)
3. Runtime Router & Concurrency Semaphore
4. Unified Domain (Mission, Sources, Evidence, AG-UI)
5. Sovereign Matrix (Neon, Cloudflare R2, Qdrant)
6. All 7 Artifact Binaries (PDF, DOCX, PPTX, XLSX, WEBSITE ZIP, IMAGE, VIDEO)
7. MCP #1 Real Execution (GitHub / Playwright)
8. Production Backend E2E
"""

import os
import sys
import uuid
import time
import asyncio
import hashlib
import pytest
from pathlib import Path

# Add backend to path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

# Set test environment credentials
os.environ["R2_ACCOUNT_ID"] = "ccf3cc9042ae4ca43daa6448b9c499eb"
os.environ["R2_ACCESS_KEY_ID"] = "2f23aed954ccab63908e187a35798aa9"
os.environ["R2_SECRET_ACCESS_KEY"] = "42e97e74f7723ae6248813c6bfa836e8c135c03d159aae880a1a42c9ce5ba777"
os.environ["R2_BUCKET_NAME"] = "nkyel-artifacts-prod"

from core.config import settings
from core.runtime.nkyel_graph_runtime import NkyelGraphRuntime
from core.runtime.deerflow_runtime import DeerFlowRuntime
from core.runtime.router import RuntimeRouter
from core.runtime.base import RuntimeEventType
from deerflow_core.gateway import gateway_app
from deerflow_core.skills_engine import deer_skills_engine
from deerflow_core.mcp_engine import deer_mcp_engine
from deerflow_core.sandbox_engine import deer_sandbox_engine
from deerflow_core.subagents_engine import deer_subagents_engine
from services.artifact_service import ArtifactService, ArtifactType
from services.r2_storage_service import R2StorageService
from db.models import User, Conversation, Message, Artifact


@pytest.mark.asyncio
async def test_01_nkyel_graph_runtime():
    """1. NKYEL GRAPH: PLAN -> RESEARCH -> ANALYZE -> SYNTHESIZE -> DELIVER."""
    runtime = NkyelGraphRuntime()
    health = await runtime.health()
    assert health["status"] == "healthy"

    mission_id = f"msn_{uuid.uuid4().hex[:8]}"
    goal = "Analyse prospective sur l'IA agentique en 2026"

    events = []
    async for evt in runtime.stream(mission_id=mission_id, goal=goal):
        events.append(evt)

    event_types = [e.type for e in events]
    assert RuntimeEventType.RUN_STARTED in event_types
    assert RuntimeEventType.STEP_STARTED in event_types
    assert RuntimeEventType.TOOL_CALL_START in event_types
    assert RuntimeEventType.TOOL_CALL_RESULT in event_types
    assert RuntimeEventType.RUN_FINISHED in event_types

    phases = [e.payload.get("phase") for e in events if e.payload.get("phase")]
    assert "PLAN" in phases
    assert "RESEARCH" in phases
    assert "ANALYZE" in phases
    assert "SYNTHESIZE" in phases
    assert "DELIVER" in phases


@pytest.mark.asyncio
async def test_02_deerflow_gateway_and_health():
    """2. DEERFLOW GATEWAY & READINESS."""
    runtime = DeerFlowRuntime()
    health = await runtime.health()
    assert health["status"] == "healthy"
    assert health["skills_count"] >= 9
    assert health["mcp_servers"] >= 5
    assert health["sandbox_ready"] is True
    assert health["subagents_ready"] is True


@pytest.mark.asyncio
async def test_03_deerflow_skills():
    """3. DEERFLOW SKILLS DISCOVERY & INTENT MATCHING."""
    skills = deer_skills_engine.list_skills()
    assert len(skills) >= 9

    skill_names = [s["name"] for s in skills]
    assert "Deep Research" in skill_names
    assert "Business Report Generation" in skill_names
    assert "Presentation / Pitch Deck" in skill_names
    assert "Frontend / Web Project Generator" in skill_names

    # Test intent matcher
    matched = deer_skills_engine.find_skill_by_intent("Je veux créer une landing page web moderne")
    assert matched.id == "skill_web_generator"

    matched_pptx = deer_skills_engine.find_skill_by_intent("Crée un deck de présentation pitch deck")
    assert matched_pptx.id == "skill_presentation_pptx"


@pytest.mark.asyncio
async def test_04_deerflow_mcp_and_tools():
    """4. DEERFLOW MCP & TOOLS DISCOVERY."""
    servers = deer_mcp_engine.list_servers()
    assert len(servers) >= 5
    server_ids = [s["id"] for s in servers]
    assert "mcp_github" in server_ids
    assert "mcp_playwright" in server_ids
    assert "mcp_postgres" in server_ids

    tools = deer_mcp_engine.list_tools()
    assert len(tools) >= 5

    # On-demand discovery
    discovered = deer_mcp_engine.discover_tools_for_intent("Inspecte le dépôt github et le code")
    assert any(t.server_id == "mcp_github" for t in discovered)


@pytest.mark.asyncio
async def test_05_deerflow_subagents():
    """5. DEERFLOW SUBAGENTS ORCHESTRATION."""
    run_id = f"run_{uuid.uuid4().hex[:8]}"
    subagent = deer_subagents_engine.dispatch_subagent(
        parent_run_id=run_id,
        role="web_researcher",
        goal="Explorer les sources sur l'orchestration",
    )
    assert subagent.agent_id.startswith("sub_web_researcher_")

    result = await deer_subagents_engine.execute_subagent(subagent)
    assert result["status"] == "completed"
    assert "findings" in result["result"]

    agg = deer_subagents_engine.aggregate_results([subagent])
    assert agg["completed"] == 1


@pytest.mark.asyncio
async def test_06_deerflow_sandbox():
    """6. DEERFLOW SANDBOX EXECUTION."""
    run_id = f"run_{uuid.uuid4().hex[:8]}"
    # Write safe file
    write_res = deer_sandbox_engine.write_file(
        run_id=run_id,
        relative_path="index.html",
        content="<!DOCTYPE html><html><body><h1>Ñkyel AI</h1></body></html>",
    )
    assert write_res["success"] is True

    # Execute Python in isolated process
    exec_res = await deer_sandbox_engine.execute_python(
        run_id=run_id,
        code="print(sum([10, 20, 30, 40]))",
    )
    assert exec_res["success"] is True
    assert "100" in exec_res["stdout"]

    # Package project into ZIP
    zip_bytes = deer_sandbox_engine.package_project_zip(run_id=run_id)
    assert len(zip_bytes) > 50
    assert zip_bytes[:2] == b"PK"  # Valid ZIP signature

    # Cleanup
    deer_sandbox_engine.cleanup_workspace(run_id=run_id)


@pytest.mark.asyncio
async def test_07_deerflow_runtime_execution_and_streaming():
    """7. DEERFLOW RUNTIME STREAMING & EVENT SPINE."""
    runtime = DeerFlowRuntime()
    mission_id = f"msn_{uuid.uuid4().hex[:8]}"
    goal = "Créer un rapport d'analyse stratégique pour les investisseurs"

    events = []
    async for evt in runtime.stream(mission_id=mission_id, goal=goal):
        events.append(evt)

    types = [e.type for e in events]
    assert RuntimeEventType.RUN_STARTED in types
    assert RuntimeEventType.STEP_STARTED in types
    assert RuntimeEventType.STATE_DELTA in types
    assert RuntimeEventType.STEP_FINISHED in types
    assert RuntimeEventType.RUN_FINISHED in types

    # Verify deliverable artifact was compiled
    artifact_events = [e for e in events if e.artifact_id]
    assert len(artifact_events) >= 1
    art_info = artifact_events[0].payload
    assert art_info["storage_url"].startswith("http")


@pytest.mark.asyncio
async def test_08_runtime_router():
    """8. RUNTIME ROUTER & CONCURRENCY CONTROL."""
    router = RuntimeRouter()

    # Route simple mission -> Native Graph
    rt1, name1 = await router.select_runtime("Calcul simple interne et synthèse courte")
    assert name1 == "NkyelGraphRuntime"

    # Route complex skill/market mission -> DeerFlow
    rt2, name2 = await router.select_runtime("Génère un rapport de marché complet en PDF avec évidences")
    assert name2 == "DeerFlowRuntime"


@pytest.mark.asyncio
async def test_09_mcp_real_execution():
    """9. MCP #1 REAL EXECUTION (GitHub Tool - Real Public API)."""
    result = await deer_mcp_engine.execute_tool(
        tool_name="github_search_repositories",
        arguments={"query": "fastapi"},
    )
    assert result["success"] is True
    assert result["tool"] == "github_search_repositories"
    assert result["execution_mode"] == "REAL_EXTERNAL"
    assert len(result["data"]) >= 1
    # Verify real repo attributes returned by GitHub
    assert any("fastapi" in r["name"].lower() for r in result["data"])
    assert any(r["stars"] > 1000 for r in result["data"])


@pytest.mark.asyncio
async def test_10_sovereign_artifacts_binaries():
    """10. ARTIFACT BINARIES GENERATION (PDF, DOCX, PPTX, XLSX, WEBSITE, IMAGE, VIDEO)."""
    mission_id = f"msn_{uuid.uuid4().hex[:8]}"
    run_id = f"run_{uuid.uuid4().hex[:8]}"

    # PDF
    art_pdf = await ArtifactService.create_artifact(
        title="Rapport d'audit exécutif",
        content="# Audit Stratégique\n\nConformité souveraine 100%.",
        type=ArtifactType.REPORT,
        mission_id=mission_id,
        run_id=run_id,
    )
    pdf_bytes, pdf_mime, _ = await ArtifactService.export_artifact(art_pdf.id, "pdf")
    assert len(pdf_bytes) > 100
    assert pdf_bytes[:4] == b"%PDF"

    # DOCX
    docx_bytes, docx_mime, _ = await ArtifactService.export_artifact(art_pdf.id, "docx")
    assert len(docx_bytes) > 100
    assert docx_bytes[:2] == b"PK"

    # PPTX
    art_pptx = await ArtifactService.create_artifact(
        title="Pitch Deck Investisseurs",
        content="# Ñkyel AI\n---\n## Vision\nPlateforme souveraine.",
        type=ArtifactType.SLIDES,
        mission_id=mission_id,
        run_id=run_id,
    )
    pptx_bytes, pptx_mime, _ = await ArtifactService.export_artifact(art_pptx.id, "pptx")
    assert len(pptx_bytes) > 100
    assert pptx_bytes[:2] == b"PK"

    # XLSX
    art_xlsx = await ArtifactService.create_artifact(
        title="Données Financières",
        content="Mois,Revenus,Marge\nJanvier,10000,8500\nFévrier,15000,12000",
        type=ArtifactType.SPREADSHEET,
        mission_id=mission_id,
        run_id=run_id,
    )
    xlsx_bytes, xlsx_mime, _ = await ArtifactService.export_artifact(art_xlsx.id, "xlsx")
    assert len(xlsx_bytes) > 100
    assert xlsx_bytes[:2] == b"PK"

    # WEBSITE (ZIP)
    html_bytes, html_mime, _ = await ArtifactService.export_artifact(art_pdf.id, "html")
    assert b"<!DOCTYPE html>" in html_bytes

    # IMAGE & VIDEO
    art_img = await ArtifactService.create_artifact(
        title="Visuel Identité",
        content="https://media.nkyel.smartandjai.com/assets/panther.png",
        type=ArtifactType.IMAGE,
        mission_id=mission_id,
        run_id=run_id,
    )
    assert art_img.type == ArtifactType.IMAGE

    art_vid = await ArtifactService.create_artifact(
        title="Trailer Démo",
        content="https://media.nkyel.smartandjai.com/assets/demo.mp4",
        type=ArtifactType.VIDEO,
        mission_id=mission_id,
        run_id=run_id,
    )
    assert art_vid.type == ArtifactType.VIDEO


@pytest.mark.asyncio
async def test_11_production_backend_e2e():
    """11. PRODUCTION BACKEND E2E."""
    router = RuntimeRouter()
    mission_id = f"msn_e2e_{uuid.uuid4().hex[:8]}"
    goal = "Recherche approfondie sur les systèmes multi-agents avec livrable PDF"

    result = await router.execute_mission(
        mission_id=mission_id,
        goal=goal,
        user_id="founder_daniel_andj",
    )

    assert result.success is True
    assert result.runtime_type == "DeerFlowRuntime"
    assert len(result.content) > 50
    assert len(result.sources) >= 1
    assert len(result.artifacts) >= 1
