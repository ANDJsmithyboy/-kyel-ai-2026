"""
Ñkyel AI — Vision Engine · SmartANDJ AI Technologies
Transforme une vision / intention / idée en réalité exécutable.

INVISIBLE → VISIBLE → STRUCTURED → ACTIONABLE → REAL

Habacuc 2:2 — Écrire la vision, la rendre claire.
Hébreux 11:3 — L'invisible produit le visible.
Exode 25:40 — Construire selon le pattern.

VisionMap décompose chaque intention en 6 piliers :
  WHY · WHO · WHAT · CONSTRAINTS · RESOURCES · SUCCESS

Vision Mode → Make It Real → WorkGraph → Execution → Artifact

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import uuid
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum

from core.event_schema import NkyelEvent, NkyelEventType, event_emitter

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Vision Status
# ══════════════════════════════════════════════════════════════

class VisionStatus(str, Enum):
    """Statut de la vision dans son cycle de vie."""
    DRAFT = "draft"           # Idée brute, encore floue
    STRUCTURED = "structured" # Décomposée en VisionMap
    VALIDATED = "validated"   # Confirmée par l'utilisateur
    COMPILED = "compiled"     # Traduite en WorkGraph
    EXECUTING = "executing"   # En cours d'exécution
    COMPLETED = "completed"   # Matérialisée
    ARCHIVED = "archived"     # Archivée


# ══════════════════════════════════════════════════════════════
# 2. VisionMap — Les 6 Piliers
# ══════════════════════════════════════════════════════════════

@dataclass
class VisionPillar:
    """Un pilier individuel de la VisionMap."""
    id: str = field(default_factory=lambda: f"pillar_{uuid.uuid4().hex[:8]}")
    label: str = ""
    items: List[str] = field(default_factory=list)
    confidence: float = 0.5
    user_validated: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "items": self.items,
            "confidence": self.confidence,
            "user_validated": self.user_validated,
        }


@dataclass
class VisionMap:
    """
    Carte de vision structurée — décomposition d'une intention en 6 piliers.
    C'est le pont entre l'INVISIBLE et le VISIBLE.
    """
    id: str = field(default_factory=lambda: f"vision_{uuid.uuid4().hex[:10]}")
    raw_input: str = ""
    title: str = ""
    status: VisionStatus = VisionStatus.DRAFT
    owner_id: str = ""
    mission_id: str = ""

    # Les 6 piliers
    why: VisionPillar = field(default_factory=lambda: VisionPillar(label="WHY"))
    who: VisionPillar = field(default_factory=lambda: VisionPillar(label="WHO"))
    what: VisionPillar = field(default_factory=lambda: VisionPillar(label="WHAT"))
    constraints: VisionPillar = field(default_factory=lambda: VisionPillar(label="CONSTRAINTS"))
    resources: VisionPillar = field(default_factory=lambda: VisionPillar(label="RESOURCES"))
    success: VisionPillar = field(default_factory=lambda: VisionPillar(label="SUCCESS"))

    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)

    @property
    def pillars(self) -> Dict[str, VisionPillar]:
        return {
            "why": self.why,
            "who": self.who,
            "what": self.what,
            "constraints": self.constraints,
            "resources": self.resources,
            "success": self.success,
        }

    @property
    def completeness(self) -> float:
        """Score de complétude de la vision (0.0 → 1.0)."""
        filled = sum(1 for p in self.pillars.values() if p.items)
        return round(filled / 6, 2)

    @property
    def validation_score(self) -> float:
        """Score de validation utilisateur (0.0 → 1.0)."""
        validated = sum(1 for p in self.pillars.values() if p.user_validated)
        return round(validated / 6, 2)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "raw_input": self.raw_input,
            "title": self.title,
            "status": self.status.value,
            "owner_id": self.owner_id,
            "mission_id": self.mission_id,
            "pillars": {k: v.to_dict() for k, v in self.pillars.items()},
            "completeness": self.completeness,
            "validation_score": self.validation_score,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


# ══════════════════════════════════════════════════════════════
# 3. Vision Parser
# ══════════════════════════════════════════════════════════════

class VisionParser:
    """
    Analyse un texte d'intention / vision flou et produit
    une VisionMap structurée.

    En production, utilise un LLM pour l'extraction.
    Ici, extraction heuristique + structure prête pour LLM.
    """

    # Mots-clés heuristiques par pilier
    _WHY_KEYWORDS = frozenset({
        "parce que", "because", "pour", "for", "afin de", "in order to",
        "objectif", "objective", "goal", "raison", "reason", "mission",
        "purpose", "but", "ambition", "besoin", "need",
    })
    _WHO_KEYWORDS = frozenset({
        "utilisateur", "user", "client", "customer", "public", "audience",
        "équipe", "team", "entreprise", "company", "marché", "market",
        "personne", "people", "startup", "organisation",
    })
    _CONSTRAINT_KEYWORDS = frozenset({
        "budget", "limite", "limit", "maximum", "deadline", "contrainte",
        "constraint", "restriction", "interdit", "forbidden", "pas de",
        "without", "sauf", "except", "réglementation", "regulation",
        "délai", "cost", "coût", "time",
    })
    _RESOURCE_KEYWORDS = frozenset({
        "outil", "tool", "api", "données", "data", "technologie",
        "technology", "compétence", "skill", "infrastructure",
        "plateforme", "platform", "service", "framework",
    })
    _SUCCESS_KEYWORDS = frozenset({
        "succès", "success", "kpi", "métrique", "metric", "résultat",
        "result", "livrable", "deliverable", "objectif", "target",
        "mesure", "measure", "critère", "criteria", "validation",
    })

    @classmethod
    def parse(cls, raw_input: str, owner_id: str = "") -> VisionMap:
        """
        Parse un texte brut en VisionMap structurée.
        """
        vision = VisionMap(
            raw_input=raw_input,
            owner_id=owner_id,
        )

        # Extraction du titre (première phrase significative)
        lines = [l.strip() for l in raw_input.strip().split("\n") if l.strip()]
        if lines:
            title_candidate = lines[0]
            if len(title_candidate) > 100:
                title_candidate = title_candidate[:97] + "..."
            vision.title = title_candidate

        # Extraction heuristique par pilier
        lower_input = raw_input.lower()
        sentences = cls._split_sentences(raw_input)

        for sentence in sentences:
            lower_sentence = sentence.lower()

            # WHY
            if any(kw in lower_sentence for kw in cls._WHY_KEYWORDS):
                vision.why.items.append(sentence)
            # WHO
            if any(kw in lower_sentence for kw in cls._WHO_KEYWORDS):
                vision.who.items.append(sentence)
            # CONSTRAINTS
            if any(kw in lower_sentence for kw in cls._CONSTRAINT_KEYWORDS):
                vision.constraints.items.append(sentence)
            # RESOURCES
            if any(kw in lower_sentence for kw in cls._RESOURCE_KEYWORDS):
                vision.resources.items.append(sentence)
            # SUCCESS
            if any(kw in lower_sentence for kw in cls._SUCCESS_KEYWORDS):
                vision.success.items.append(sentence)

        # WHAT = tout ce qui n'est pas classé dans les autres piliers
        classified_sentences = set()
        for pillar in [vision.why, vision.who, vision.constraints,
                       vision.resources, vision.success]:
            classified_sentences.update(pillar.items)

        for sentence in sentences:
            if sentence not in classified_sentences:
                vision.what.items.append(sentence)

        # Mettre à jour la confiance par pilier
        for pillar in vision.pillars.values():
            if pillar.items:
                pillar.confidence = min(0.3 + 0.15 * len(pillar.items), 0.9)

        # Passer en statut STRUCTURED si au moins 2 piliers remplis
        if vision.completeness >= 0.33:
            vision.status = VisionStatus.STRUCTURED

        logger.info(
            f"🔮 Vision parsée: \"{vision.title}\" "
            f"complétude={vision.completeness} "
            f"piliers={sum(1 for p in vision.pillars.values() if p.items)}/6"
        )

        return vision

    @staticmethod
    def _split_sentences(text: str) -> List[str]:
        """Découpe un texte en phrases distinctes."""
        import re
        sentences = re.split(r'[.!?\n]+', text)
        return [s.strip() for s in sentences if s.strip() and len(s.strip()) > 5]


# ══════════════════════════════════════════════════════════════
# 4. WorkGraph Task (Lightweight)
# ══════════════════════════════════════════════════════════════

@dataclass
class WorkGraphTask:
    """Tâche dans le WorkGraph compilé."""
    id: str = field(default_factory=lambda: f"task_{uuid.uuid4().hex[:8]}")
    title: str = ""
    description: str = ""
    agent_type: str = "general"
    priority: int = 1
    depends_on: List[str] = field(default_factory=list)
    status: str = "pending"  # "pending", "running", "waiting_human", "done", "failed"
    is_human_node: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "agent_type": self.agent_type,
            "priority": self.priority,
            "depends_on": self.depends_on,
            "status": self.status,
            "is_human_node": self.is_human_node,
        }


@dataclass
class CompiledWorkGraph:
    """WorkGraph compilé à partir d'une VisionMap."""
    id: str = field(default_factory=lambda: f"wg_{uuid.uuid4().hex[:10]}")
    vision_id: str = ""
    mission_id: str = ""
    tasks: List[WorkGraphTask] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)

    @property
    def task_count(self) -> int:
        return len(self.tasks)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "vision_id": self.vision_id,
            "mission_id": self.mission_id,
            "tasks": [t.to_dict() for t in self.tasks],
            "task_count": len(self.tasks),
            "created_at": self.created_at,
        }


# ══════════════════════════════════════════════════════════════
# 5. Make-It-Real Compiler
# ══════════════════════════════════════════════════════════════

class MakeItRealCompiler:
    """
    Compile une VisionMap validée en WorkGraph exécutable.
    VISION MODE → MAKE IT REAL → EXECUTION MODE.

    C'est le pont entre :
      CE QUI EST IMAGINÉ → CE QUI PEUT ÊTRE CONSTRUIT.
    """

    @classmethod
    def compile(cls, vision: VisionMap) -> CompiledWorkGraph:
        """
        Compile une VisionMap en WorkGraph.
        Crée des tâches basées sur les piliers de la vision.
        """
        workgraph = CompiledWorkGraph(
            vision_id=vision.id,
            mission_id=vision.mission_id or f"mission_{uuid.uuid4().hex[:8]}",
        )

        # Phase 1: Recherche & Compréhension (basée sur WHO + WHAT)
        if vision.who.items or vision.what.items:
            research_task = WorkGraphTask(
                title="Recherche & Compréhension",
                description="Analyser le contexte, les acteurs et le périmètre",
                agent_type="researcher",
                priority=1,
            )
            workgraph.tasks.append(research_task)

        # Phase 2: Contraintes & Faisabilité
        if vision.constraints.items:
            constraints_task = WorkGraphTask(
                title="Analyse des Contraintes",
                description="Évaluer les contraintes et la faisabilité",
                agent_type="analyst",
                priority=2,
                depends_on=[workgraph.tasks[0].id] if workgraph.tasks else [],
            )
            workgraph.tasks.append(constraints_task)

        # Phase 3: Planification stratégique
        planning_deps = [t.id for t in workgraph.tasks]
        planning_task = WorkGraphTask(
            title="Planification Stratégique",
            description="Élaborer le plan d'action détaillé",
            agent_type="planner",
            priority=3,
            depends_on=planning_deps,
        )
        workgraph.tasks.append(planning_task)

        # Phase 4: Validation humaine
        human_task = WorkGraphTask(
            title="Validation Humaine",
            description="L'utilisateur valide le plan avant exécution",
            agent_type="human",
            priority=4,
            depends_on=[planning_task.id],
            is_human_node=True,
        )
        workgraph.tasks.append(human_task)

        # Phase 5: Exécution (basée sur WHAT)
        for i, item in enumerate(vision.what.items[:5]):  # Max 5 tâches d'exécution
            exec_task = WorkGraphTask(
                title=f"Exécution: {item[:50]}",
                description=item,
                agent_type="executor",
                priority=5 + i,
                depends_on=[human_task.id],
            )
            workgraph.tasks.append(exec_task)

        # Phase 6: Vérification (basée sur SUCCESS)
        exec_ids = [t.id for t in workgraph.tasks if t.agent_type == "executor"]
        if vision.success.items:
            verify_task = WorkGraphTask(
                title="Vérification & Validation",
                description="Vérifier les critères de succès",
                agent_type="verifier",
                priority=10,
                depends_on=exec_ids or [human_task.id],
            )
            workgraph.tasks.append(verify_task)

        # Émettre l'événement
        event_emitter.emit(NkyelEvent(
            type="vision.compiled",
            mission_id=workgraph.mission_id,
            payload={
                "vision_id": vision.id,
                "workgraph_id": workgraph.id,
                "task_count": len(workgraph.tasks),
                "human_nodes": sum(1 for t in workgraph.tasks if t.is_human_node),
            },
        ))

        logger.info(
            f"🚀 MAKE IT REAL: Vision \"{vision.title}\" → "
            f"WorkGraph {workgraph.id} ({len(workgraph.tasks)} tâches)"
        )

        return workgraph


# ══════════════════════════════════════════════════════════════
# 6. Vision Engine (Orchestrateur)
# ══════════════════════════════════════════════════════════════

class VisionEngine:
    """
    Moteur de vision Ñkyel.
    Orchestre le cycle complet : Parse → Structure → Validate → Compile → Execute.
    """

    def __init__(self):
        self._visions: Dict[str, VisionMap] = {}
        self._workgraphs: Dict[str, CompiledWorkGraph] = {}

    def parse_vision(self, raw_input: str, owner_id: str = "") -> VisionMap:
        """Parse une intention en VisionMap."""
        vision = VisionParser.parse(raw_input, owner_id)
        self._visions[vision.id] = vision

        event_emitter.emit(NkyelEvent(
            type="cognitive.vision.parsed",
            payload={
                "vision_id": vision.id,
                "title": vision.title,
                "completeness": vision.completeness,
                "pillar_count": sum(1 for p in vision.pillars.values() if p.items),
            },
        ))

        return vision

    def get_vision(self, vision_id: str) -> Optional[VisionMap]:
        return self._visions.get(vision_id)

    def update_pillar(
        self,
        vision_id: str,
        pillar_name: str,
        items: List[str],
    ) -> Optional[VisionMap]:
        """Met à jour un pilier spécifique de la vision."""
        vision = self._visions.get(vision_id)
        if not vision:
            return None

        pillar = vision.pillars.get(pillar_name)
        if not pillar:
            return None

        pillar.items = items
        pillar.confidence = min(0.3 + 0.15 * len(items), 0.9)
        vision.updated_at = time.time()

        return vision

    def validate_pillar(self, vision_id: str, pillar_name: str) -> Optional[VisionMap]:
        """L'utilisateur valide un pilier."""
        vision = self._visions.get(vision_id)
        if not vision:
            return None

        pillar = vision.pillars.get(pillar_name)
        if pillar:
            pillar.user_validated = True
            pillar.confidence = 1.0
            vision.updated_at = time.time()

            if vision.validation_score >= 0.5:
                vision.status = VisionStatus.VALIDATED

        return vision

    def make_it_real(self, vision_id: str) -> Optional[CompiledWorkGraph]:
        """
        MAKE IT REAL — Compile la vision en WorkGraph exécutable.
        Transition: Vision Mode → Execution Mode.
        """
        vision = self._visions.get(vision_id)
        if not vision:
            return None

        if vision.completeness < 0.17:  # Au moins 1 pilier
            return None

        vision.status = VisionStatus.COMPILED
        workgraph = MakeItRealCompiler.compile(vision)
        self._workgraphs[workgraph.id] = workgraph

        vision.status = VisionStatus.EXECUTING
        vision.updated_at = time.time()

        return workgraph

    def get_workgraph(self, workgraph_id: str) -> Optional[CompiledWorkGraph]:
        return self._workgraphs.get(workgraph_id)

    def list_visions(self, owner_id: Optional[str] = None) -> List[Dict[str, Any]]:
        results = []
        for v in self._visions.values():
            if owner_id and v.owner_id != owner_id:
                continue
            results.append({
                "id": v.id,
                "title": v.title,
                "status": v.status.value,
                "completeness": v.completeness,
                "validation_score": v.validation_score,
            })
        return results

    def clear(self) -> None:
        self._visions.clear()
        self._workgraphs.clear()


# ══════════════════════════════════════════════════════════════
# Singleton
# ══════════════════════════════════════════════════════════════

vision_engine = VisionEngine()
