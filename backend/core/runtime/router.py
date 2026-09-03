"""
Ñkyel AI — Runtime Router & Concurrency Controller · SmartANDJ AI Technologies
Routes Missions between NkyelGraphRuntime and DeerFlowRuntime with:
- Concurrency limiting for VPS stability (Contabo 6 vCPU / 12GB)
- Truthful capability matching
- Fallback protection

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import asyncio
import logging
from typing import Dict, Any, Optional, Tuple

from core.runtime.base import AgentRuntime, RuntimeCapabilities
from core.runtime.nkyel_graph_runtime import NkyelGraphRuntime
from core.runtime.deerflow_runtime import DeerFlowRuntime

logger = logging.getLogger(__name__)


class RuntimeRouter:
    """Intelligent router selecting and coordinating execution runtimes."""

    def __init__(self, max_concurrent_deerflow: int = 2, max_concurrent_native: int = 5):
        self.nkyel_runtime = NkyelGraphRuntime()
        self.deerflow_runtime = DeerFlowRuntime()
        self._deerflow_semaphore = asyncio.Semaphore(max_concurrent_deerflow)
        self._native_semaphore = asyncio.Semaphore(max_concurrent_native)

    async def select_runtime(
        self,
        goal: str,
        requirements: Optional[Dict[str, Any]] = None,
    ) -> Tuple[AgentRuntime, str]:
        """
        Determines the optimal runtime based on Mission requirements.
        
        Returns:
            Tuple of (SelectedRuntimeInstance, runtime_name)
        """
        reqs = requirements or {}
        lower_goal = goal.lower()

        # Criteria demanding DeerFlow:
        needs_skills = reqs.get("skills") or any(
            w in lower_goal for w in ["rapport", "report", "présentation", "pptx", "tableur", "xlsx", "site", "landing", "vidéo", "video", "swot", "marché", "pdf"]
        )
        needs_mcp = reqs.get("mcp") or any(
            w in lower_goal for w in ["github", "notion", "postgres", "sql", "browser", "playwright"]
        )
        needs_sandbox = reqs.get("sandbox") or any(
            w in lower_goal for w in ["python", "exécute", "calcule", "script", "code"]
        )
        needs_subagents = reqs.get("subagents") or reqs.get("deep_research") or any(
            w in lower_goal for w in ["recherche approfondie", "deep research", "multi-agent", "sous-agent"]
        )

        if needs_skills or needs_mcp or needs_sandbox or needs_subagents:
            # Check DeerFlow health
            df_health = await self.deerflow_runtime.health()
            if df_health.get("status") == "healthy":
                return self.deerflow_runtime, "DeerFlowRuntime"
            else:
                logger.warning("DeerFlow runtime requested but unhealthy.")
                # If strictly requires sandbox or MCP, cannot fallback
                if needs_mcp or needs_sandbox:
                    raise RuntimeError("Capacités requises (MCP/Sandbox) indisponibles sur DeerFlow.")

        # Default fast & factual native StateGraph runtime
        return self.nkyel_runtime, "NkyelGraphRuntime"

    async def execute_mission(
        self,
        mission_id: str,
        goal: str,
        context: Optional[str] = None,
        model: Optional[str] = None,
        user_id: Optional[str] = None,
        requirements: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ):
        """Executes mission through the chosen runtime under semaphore concurrency control."""
        runtime, runtime_name = await self.select_runtime(goal, requirements)
        sem = self._deerflow_semaphore if runtime_name == "DeerFlowRuntime" else self._native_semaphore

        async with sem:
            return await runtime.run(
                mission_id=mission_id,
                goal=goal,
                context=context,
                model=model,
                user_id=user_id,
                runtime_selection=runtime_name,
                **kwargs,
            )


# Global singleton
runtime_router = RuntimeRouter()
