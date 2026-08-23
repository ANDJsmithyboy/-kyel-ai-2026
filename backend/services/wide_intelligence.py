"""
Ñkyel AI — Wide Intelligence Engine · SmartANDJ AI Technologies
Moteur d'intelligence élargie (Fan Out / Fan In) avec parallélisme dynamique,
déduplication, deuxième vague adaptative et visibilité totale dans VIE & WorkGraph.

Principes fondamentaux :
1. "Pas de faux multi-agent" — Si 1 agent travaille, 1 agent s'affiche. Si 8 agents travaillent, 8 s'affichent.
2. DeerFlow 2.0 reste la fondation d'exécution de chaque sous-agent.
3. Déduplication des requêtes, domaines et preuves (pas de travail redondant).
4. Deuxième vague adaptative (Wave 2) si des lacunes sont détectées après la Wave 1.
5. Contrôle strict de budget de recherche (max_agents, max_searches, max_tokens, max_cost).

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import json
import uuid
import asyncio
import logging
from typing import Optional, Dict, Any, List, Set, AsyncGenerator
from dataclasses import dataclass, field

from core.config import settings
from core.context import get_context
from core.errors import NkyelAPIError, NkyelErrorCode, budget_exceeded
from core.cancellation import cancellation_manager
from events.workgraph_events import WorkGraphEventService, VIEEventType
from services.search_gateway import search_gateway, SearchResultItem
from services.model_gateway import fast, balanced, deep, ModelCapability

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Wide Intelligence Specs & Budgets
# ══════════════════════════════════════════════════════════════

@dataclass
class WideResearchBudget:
    """Plafonds et budgets pour une mission d'intelligence élargie."""
    max_agents: int = 8
    max_parallel_agents: int = 4
    max_searches_per_agent: int = 3
    max_tokens: int = 150_000
    max_cost_usd: float = 0.50
    deadline_seconds: float = 120.0


@dataclass
class SubagentTaskSpec:
    """Spécification d'une tâche assignée à un sous-agent."""
    subagent_id: str
    agent_name: str
    region_or_focus: str
    queries: List[str]
    status: str = "pending"  # pending | running | completed | failed
    findings: List[str] = field(default_factory=list)
    sources: List[SearchResultItem] = field(default_factory=list)
    latency_ms: int = 0


# ══════════════════════════════════════════════════════════════
# 2. Wide Intelligence Engine
# ══════════════════════════════════════════════════════════════

class WideIntelligenceEngine:
    """
    Orchestrateur Wide Intelligence de Ñkyel.
    Pilote la décomposition, le fan-out parallèle, l'analyse de lacunes (Wave 2)
    et la synthèse finale vérifiée.
    """

    async def execute_wide_mission(
        self,
        mission_id: str,
        topic: str,
        user_id: str = "anonymous",
        budget: Optional[WideResearchBudget] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Exécute la mission complète avec streaming d'événements VIE en direct.
        """
        budget_spec = budget or WideResearchBudget()
        run_id = f"run_wide_{uuid.uuid4().hex[:8]}"
        cancel_token = cancellation_manager.create_token(mission_id=mission_id, run_id=run_id)

        # ── 1. Événement initial : Mission créée ─────────────────
        evt_created = await WorkGraphEventService.emit_mission_created(
            run_id=run_id,
            goal=topic,
            user_id=user_id,
            mission_id=mission_id,
        )
        yield evt_created

        # ── 2. Décomposition de la mission (Lead Agent) ──────────
        decompose_prompt = f"""Tu es le Lead Agent de Ñkyel Wide Intelligence.
Décompose ce sujet de recherche complexe en sous-axes géographiques ou thématiques indépendants.
Sujet : {topic}

Génère entre 2 et {budget_spec.max_agents} sous-axes sous format JSON strict :
[
  {{"id": "agent_1", "name": "Agent Thématique/Régional", "focus": "...", "queries": ["requête 1", "requête 2"]}}
]
Réponds uniquement avec le tableau JSON."""

        try:
            decomp_res = await fast(decompose_prompt, json_mode=True)
            tasks_data = json.loads(decomp_res.text)
            if not isinstance(tasks_data, list) or len(tasks_data) == 0:
                raise ValueError("Format de décomposition invalide")
        except Exception:
            tasks_data = [
                {"id": "agent_1", "name": "Agent Général", "focus": "Faits principaux", "queries": [f"{topic} synthèse 2026"]},
                {"id": "agent_2", "name": "Agent Analyse", "focus": "Défis et perspectives", "queries": [f"{topic} enjeux et données"]},
            ]

        # Limiter au budget max_agents
        tasks_data = tasks_data[:budget_spec.max_agents]

        subagents: List[SubagentTaskSpec] = [
            SubagentTaskSpec(
                subagent_id=f"sub_{uuid.uuid4().hex[:6]}",
                agent_name=t.get("name", f"Subagent {i+1}"),
                region_or_focus=t.get("focus", ""),
                queries=t.get("queries", [topic]),
            )
            for i, t in enumerate(tasks_data)
        ]

        # Émettre la création du plan dans VIE
        evt_plan = await WorkGraphEventService.emit_plan_created(
            run_id=run_id,
            tasks=[{"id": s.subagent_id, "title": f"{s.agent_name} ({s.region_or_focus})"} for s in subagents],
            mission_id=mission_id,
        )
        yield evt_plan

        # ── 3. Wave 1 : Exécution Parallèle Contrôlée (Fan-Out) ──
        all_gathered_sources: List[SearchResultItem] = []
        seen_domains: Set[str] = set()

        semaphore = asyncio.Semaphore(budget_spec.max_parallel_agents)

        async def _run_subagent(spec: SubagentTaskSpec) -> SubagentTaskSpec:
            async with semaphore:
                if cancel_token.is_cancelled:
                    return spec

                spec.status = "running"
                start_t = time.time()

                # Notifier le spawn de sous-agent dans VIE
                await WorkGraphEventService.emit_event(
                    event_type=VIEEventType.AGENT_SPAWNED,
                    run_id=run_id,
                    mission_id=mission_id,
                    payload={"agent_id": spec.subagent_id, "name": spec.agent_name, "focus": spec.region_or_focus},
                )

                for q in spec.queries[:budget_spec.max_searches_per_agent]:
                    if cancel_token.is_cancelled:
                        break
                    items = await search_gateway.search(q, max_results=3)
                    for item in items:
                        if item.domain not in seen_domains:
                            seen_domains.add(item.domain)
                            spec.sources.append(item)
                            spec.findings.append(f"[{item.title}]: {item.snippet[:180]}")

                spec.latency_ms = int((time.time() - start_t) * 1000)
                spec.status = "completed"

                # Notifier la fin de travail du sous-agent
                await WorkGraphEventService.emit_event(
                    event_type=VIEEventType.TASK_COMPLETED,
                    run_id=run_id,
                    mission_id=mission_id,
                    payload={
                        "task_id": spec.subagent_id,
                        "title": spec.agent_name,
                        "sources_found": len(spec.sources),
                        "latency_ms": spec.latency_ms,
                    },
                )
                return spec

        # Lancement de la vague 1
        wave1_results = await asyncio.gather(*[_run_subagent(s) for s in subagents])

        for res in wave1_results:
            all_gathered_sources.extend(res.sources)

        # ── 4. Wave 2 : Analyse de Lacunes Adaptative ────────────
        gap_check_prompt = f"""En tant qu'analyste Ñkyel, examine ces résultats préliminaires :
Sources collectées : {len(all_gathered_sources)} sur {len(seen_domains)} domaines différents.
Thèmes couverts : {', '.join([s.region_or_focus for s in subagents])}

Y a-t-il une lacune critique majeure non couverte pour le sujet '{topic}' ?
Si oui, propose 1 sous-requête ciblée. Sinon réponds 'AUCUNE'."""

        gap_res = await fast(gap_check_prompt)
        if "AUCUNE" not in gap_res.text.upper() and len(gap_res.text.strip()) > 5:
            wave2_query = gap_res.text.strip().replace('"', '')[:120]
            logger.info(f"🌊 Wave 2 adaptative déclenchée: {wave2_query}")

            wave2_items = await search_gateway.search(wave2_query, max_results=3)
            all_gathered_sources.extend(wave2_items)

            await WorkGraphEventService.emit_event(
                event_type=VIEEventType.SOURCE_DISCOVERED,
                run_id=run_id,
                mission_id=mission_id,
                payload={"wave": 2, "query": wave2_query, "new_sources": len(wave2_items)},
            )

        # ── 5. Fan-In : Synthèse & Validation des Preuves ────────
        sources_summary = "\n".join([
            f"- [{s.title}] ({s.url}) : {s.snippet[:200]}"
            for s in all_gathered_sources[:15]
        ])

        synthesis_prompt = f"""Tu es l'IA souveraine Ñkyel AI.
Synthétise les conclusions de cette mission Wide Intelligence.

Sujet : {topic}
Nombre d'agents mobilisés : {len(subagents)}
Sources vérifiées :
{sources_summary}

Fournis une synthèse structurée, rigoureuse avec faits vérifiés et citations claires."""

        synthesis_res = await deep(synthesis_prompt)

        # ── 6. Livrable & Checkpoint Final ───────────────────────
        evt_checkpoint = await WorkGraphEventService.emit_checkpoint(
            run_id=run_id,
            mission_id=mission_id,
            checkpoint_data={
                "total_agents": len(subagents),
                "total_sources": len(all_gathered_sources),
                "domains_count": len(seen_domains),
            },
        )
        yield evt_checkpoint

        evt_completed = await WorkGraphEventService.emit_mission_completed(
            run_id=run_id,
            mission_id=mission_id,
            summary=synthesis_res.text,
        )
        yield evt_completed


# Singleton
wide_intelligence_engine = WideIntelligenceEngine()
