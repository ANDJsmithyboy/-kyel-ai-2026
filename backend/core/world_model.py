"""
Ñkyel AI — World Model · SmartANDJ AI Technologies
Représentation dynamique que Ñkyel construit d'une situation.

MEMORY  = Ce que Ñkyel se rappelle.
WORLD MODEL = La compréhension dynamique du problème.
WORKGRAPH = L'organisation du travail pour résoudre le problème.

Le World Model évolue pendant que Ñkyel recherche et raisonne.
Il est MODIFIABLE par l'utilisateur (Human Editable World Model) :

  USER CORRECTION → WORLD MODEL PATCH → DEPENDENCY ANALYSIS →
  WORKGRAPH IMPACT → REPLAN IF REQUIRED

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import uuid
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum

from core.event_schema import NkyelEventType, NkyelEvent, event_emitter

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. World Model Primitives
# ══════════════════════════════════════════════════════════════

class EntityStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    REJECTED = "rejected"
    UNCERTAIN = "uncertain"


class FactStatus(str, Enum):
    BELIEVED = "believed"
    VERIFIED = "verified"
    DISPUTED = "disputed"
    REJECTED = "rejected"
    USER_CORRECTED = "user_corrected"


class RelationType(str, Enum):
    COMPETITOR = "competitor"
    PARTNER = "partner"
    SUPPLIER = "supplier"
    REGULATOR = "regulator"
    MARKET = "market"
    RISK = "risk"
    OPPORTUNITY = "opportunity"
    DEPENDS_ON = "depends_on"
    CAUSES = "causes"
    BLOCKS = "blocks"
    SUPPORTS = "supports"
    CONTRADICTS = "contradicts"


@dataclass
class WorldEntity:
    """Entité dans le modèle du monde."""
    id: str = field(default_factory=lambda: f"ent_{uuid.uuid4().hex[:8]}")
    name: str = ""
    entity_type: str = ""  # "company", "person", "market", "regulation", "product"
    status: EntityStatus = EntityStatus.ACTIVE
    properties: Dict[str, Any] = field(default_factory=dict)
    confidence: float = 0.5
    source: str = ""
    source_refs: List[str] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "entity_type": self.entity_type,
            "status": self.status.value,
            "properties": self.properties,
            "confidence": self.confidence,
            "source": self.source,
            "source_refs": self.source_refs,
        }


@dataclass
class WorldRelationship:
    """Relation entre deux entités."""
    id: str = field(default_factory=lambda: f"rel_{uuid.uuid4().hex[:8]}")
    source_entity_id: str = ""
    target_entity_id: str = ""
    relation_type: RelationType = RelationType.DEPENDS_ON
    label: str = ""
    confidence: float = 0.5
    source: str = ""
    status: FactStatus = FactStatus.BELIEVED
    created_at: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "source_entity_id": self.source_entity_id,
            "target_entity_id": self.target_entity_id,
            "relation_type": self.relation_type.value,
            "label": self.label,
            "confidence": self.confidence,
            "status": self.status.value,
        }


@dataclass
class WorldFact:
    """Fait découvert ou déclaré dans le modèle du monde."""
    id: str = field(default_factory=lambda: f"fact_{uuid.uuid4().hex[:8]}")
    statement: str = ""
    status: FactStatus = FactStatus.BELIEVED
    confidence: float = 0.5
    source: str = ""
    source_refs: List[str] = field(default_factory=list)
    entity_ids: List[str] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "statement": self.statement,
            "status": self.status.value,
            "confidence": self.confidence,
            "source": self.source,
            "source_refs": self.source_refs,
            "entity_ids": self.entity_ids,
        }


@dataclass
class WorldConstraint:
    """Contrainte imposée (par l'utilisateur ou découverte)."""
    id: str = field(default_factory=lambda: f"cstr_{uuid.uuid4().hex[:8]}")
    description: str = ""
    constraint_type: str = ""  # "regulatory", "budget", "time", "geographic", "technical"
    imposed_by: str = "system"  # "user", "system", "agent", "regulation"
    entity_ids: List[str] = field(default_factory=list)
    active: bool = True
    created_at: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "description": self.description,
            "constraint_type": self.constraint_type,
            "imposed_by": self.imposed_by,
            "entity_ids": self.entity_ids,
            "active": self.active,
        }


# ══════════════════════════════════════════════════════════════
# 2. World Model
# ══════════════════════════════════════════════════════════════

class WorldModel:
    """
    Modèle dynamique du monde pour une mission.
    Construit et mis à jour au fur et à mesure de la recherche et du raisonnement.
    Modifiable par l'utilisateur (Human Editable).
    """

    def __init__(self, mission_id: str = ""):
        self.mission_id = mission_id
        self._entities: Dict[str, WorldEntity] = {}
        self._relationships: Dict[str, WorldRelationship] = {}
        self._facts: Dict[str, WorldFact] = {}
        self._constraints: Dict[str, WorldConstraint] = {}

    # ── Entities ─────────────────────────────────────────────

    def add_entity(self, entity: WorldEntity) -> WorldEntity:
        self._entities[entity.id] = entity
        return entity

    def get_entity(self, entity_id: str) -> Optional[WorldEntity]:
        return self._entities.get(entity_id)

    def update_entity(self, entity_id: str, **updates) -> Optional[WorldEntity]:
        entity = self._entities.get(entity_id)
        if entity:
            for key, value in updates.items():
                if hasattr(entity, key):
                    setattr(entity, key, value)
            entity.updated_at = time.time()
        return entity

    # ── Relationships ────────────────────────────────────────

    def add_relationship(self, rel: WorldRelationship) -> WorldRelationship:
        self._relationships[rel.id] = rel
        return rel

    def get_relationships_for(self, entity_id: str) -> List[WorldRelationship]:
        return [
            r for r in self._relationships.values()
            if r.source_entity_id == entity_id or r.target_entity_id == entity_id
        ]

    # ── Facts ────────────────────────────────────────────────

    def add_fact(self, fact: WorldFact) -> WorldFact:
        self._facts[fact.id] = fact
        return fact

    def get_facts(self, status: Optional[FactStatus] = None) -> List[WorldFact]:
        if status:
            return [f for f in self._facts.values() if f.status == status]
        return list(self._facts.values())

    # ── Constraints ──────────────────────────────────────────

    def add_constraint(self, constraint: WorldConstraint) -> WorldConstraint:
        self._constraints[constraint.id] = constraint
        return constraint

    def get_active_constraints(self) -> List[WorldConstraint]:
        return [c for c in self._constraints.values() if c.active]

    # ── Human Editable World Model ───────────────────────────

    def user_reject_fact(self, fact_id: str, reason: str = "") -> Dict[str, Any]:
        """
        L'utilisateur rejette un fait du World Model.
        Déclenche une analyse d'impact et potentiellement un replan.
        """
        fact = self._facts.get(fact_id)
        if fact is None:
            return {"success": False, "error": "Fait introuvable"}

        old_status = fact.status
        fact.status = FactStatus.REJECTED
        fact.updated_at = time.time()

        # Analyse d'impact sur toutes les entités liées au fait
        impact = self._analyze_fact_impact(fact)

        # Émettre un événement
        event_emitter.emit(NkyelEvent(
            type="worldmodel.fact.rejected",
            mission_id=self.mission_id,
            payload={
                "fact_id": fact_id,
                "statement": fact.statement,
                "old_status": old_status.value,
                "reason": reason,
                "impacted_entities": impact["impacted_entities"],
                "impacted_decisions": impact["impacted_decisions"],
                "replan_required": impact["replan_required"],
            },
        ))

        return {
            "success": True,
            "fact_id": fact_id,
            "impact": impact,
        }

    def user_accept_fact(self, fact_id: str) -> Dict[str, Any]:
        """L'utilisateur confirme un fait."""
        fact = self._facts.get(fact_id)
        if fact is None:
            return {"success": False, "error": "Fait introuvable"}

        fact.status = FactStatus.VERIFIED
        fact.confidence = 1.0
        fact.updated_at = time.time()

        return {"success": True, "fact_id": fact_id}

    def user_add_constraint(
        self,
        description: str,
        constraint_type: str = "user_defined",
        entity_ids: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        L'utilisateur ajoute une contrainte au World Model.
        Ex: « Le Nigeria est exclu par réglementation. »
        """
        constraint = WorldConstraint(
            description=description,
            constraint_type=constraint_type,
            imposed_by="user",
            entity_ids=entity_ids or [],
        )
        self.add_constraint(constraint)

        # Analyser l'impact de la nouvelle contrainte
        impact = self._analyze_constraint_impact(constraint)

        # Émettre un événement
        event_emitter.emit(NkyelEvent(
            type="worldmodel.constraint.added",
            mission_id=self.mission_id,
            payload={
                "constraint_id": constraint.id,
                "description": description,
                "constraint_type": constraint_type,
                "impacted_entities": impact["impacted_entities"],
                "invalidated_decisions": impact["invalidated_decisions"],
                "affected_tasks": impact["affected_tasks"],
                "replan_required": impact["replan_required"],
            },
        ))

        return {
            "success": True,
            "constraint_id": constraint.id,
            "impact": impact,
        }

    def user_correct_entity(
        self,
        entity_id: str,
        corrections: Dict[str, Any],
        reason: str = "",
    ) -> Dict[str, Any]:
        """L'utilisateur corrige une entité du World Model."""
        entity = self._entities.get(entity_id)
        if entity is None:
            return {"success": False, "error": "Entité introuvable"}

        old_props = dict(entity.properties)
        entity.properties.update(corrections)
        entity.updated_at = time.time()

        impact = self._analyze_impact(entity_id)

        event_emitter.emit(NkyelEvent(
            type="worldmodel.entity.corrected",
            mission_id=self.mission_id,
            payload={
                "entity_id": entity_id,
                "entity_name": entity.name,
                "old_properties": old_props,
                "new_properties": entity.properties,
                "reason": reason,
                "replan_required": impact["replan_required"],
            },
        ))

        return {"success": True, "entity_id": entity_id, "impact": impact}

    # ── Impact Analysis ──────────────────────────────────────

    def _analyze_fact_impact(self, fact: WorldFact) -> Dict[str, Any]:
        """Analyse l'impact du rejet ou de la modification d'un fait sur le World Model."""
        impacted_entities: List[str] = []
        impacted_decisions: int = 1

        for eid in fact.entity_ids:
            if eid not in impacted_entities:
                impacted_entities.append(eid)
            for rel in self._relationships.values():
                if rel.source_entity_id == eid or rel.target_entity_id == eid:
                    other_id = (
                        rel.target_entity_id
                        if rel.source_entity_id == eid
                        else rel.source_entity_id
                    )
                    if other_id not in impacted_entities:
                        impacted_entities.append(other_id)

        for other_fact in self._facts.values():
            if other_fact.id != fact.id and other_fact.status != FactStatus.REJECTED:
                if any(eid in other_fact.entity_ids for eid in fact.entity_ids):
                    impacted_decisions += 1

        replan_required = impacted_decisions > 0 or len(impacted_entities) >= 1

        return {
            "impacted_entities": impacted_entities,
            "impacted_decisions": impacted_decisions,
            "affected_tasks": impacted_decisions,
            "replan_required": replan_required,
        }

    def _analyze_impact(self, changed_id: str) -> Dict[str, Any]:
        """Analyse l'impact d'une modification sur le World Model."""
        impacted_entities: List[str] = []
        impacted_decisions: int = 0

        # Trouver les relations affectées
        for rel in self._relationships.values():
            if rel.source_entity_id == changed_id or rel.target_entity_id == changed_id:
                other_id = (
                    rel.target_entity_id
                    if rel.source_entity_id == changed_id
                    else rel.source_entity_id
                )
                if other_id not in impacted_entities:
                    impacted_entities.append(other_id)

        # Trouver les faits affectés
        for fact in self._facts.values():
            if changed_id in fact.entity_ids and fact.status != FactStatus.REJECTED:
                impacted_decisions += 1

        replan_required = impacted_decisions > 0 or len(impacted_entities) >= 2

        return {
            "impacted_entities": impacted_entities,
            "impacted_decisions": impacted_decisions,
            "affected_tasks": impacted_decisions,
            "replan_required": replan_required,
        }

    def _analyze_constraint_impact(self, constraint: WorldConstraint) -> Dict[str, Any]:
        """Analyse l'impact d'une nouvelle contrainte."""
        impacted_entities = list(constraint.entity_ids)
        invalidated_decisions = 0
        affected_tasks = 0

        for fact in self._facts.values():
            for eid in constraint.entity_ids:
                if eid in fact.entity_ids and fact.status not in (
                    FactStatus.REJECTED, FactStatus.USER_CORRECTED
                ):
                    invalidated_decisions += 1
                    affected_tasks += 1

        return {
            "impacted_entities": impacted_entities,
            "invalidated_decisions": invalidated_decisions,
            "affected_tasks": affected_tasks,
            "replan_required": invalidated_decisions > 0,
        }

    # ── Serialization ────────────────────────────────────────

    def to_dict(self) -> Dict[str, Any]:
        """Sérialise le World Model complet."""
        return {
            "mission_id": self.mission_id,
            "entities": [e.to_dict() for e in self._entities.values()],
            "relationships": [r.to_dict() for r in self._relationships.values()],
            "facts": [f.to_dict() for f in self._facts.values()],
            "constraints": [c.to_dict() for c in self._constraints.values()],
            "stats": {
                "entity_count": len(self._entities),
                "relationship_count": len(self._relationships),
                "fact_count": len(self._facts),
                "constraint_count": len(self._constraints),
                "verified_facts": len([f for f in self._facts.values() if f.status == FactStatus.VERIFIED]),
                "active_constraints": len(self.get_active_constraints()),
            },
        }
