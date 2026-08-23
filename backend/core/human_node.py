"""
Ñkyel AI — Human Node · SmartANDJ AI Technologies
L'Humain dans le Graphe — nœud de premier ordre dans le WorkGraph.

L'USER est un participant actif du graphe d'exécution.
Pas une interruption. Pas une erreur. Un NŒUD.

Quand le graphe atteint un HumanNode :
  TASK → WAITING FOR → USER → DECISION → WORKGRAPH CONTINUES

Types de décisions humaines :
  - Approbation simple (oui/non)
  - Choix multi-options
  - Saisie libre (texte, valeur)
  - Redirection (changer le plan)
  - Fork (explorer deux branches)

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import uuid
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum

from core.event_schema import NkyelEvent, event_emitter

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Human Decision Types
# ══════════════════════════════════════════════════════════════

class HumanDecisionType(str, Enum):
    """Types de décision humaine."""
    APPROVAL = "approval"         # Oui / Non
    CHOICE = "choice"             # Choix parmi des options
    INPUT = "input"               # Saisie libre
    REDIRECT = "redirect"         # Changer la direction
    FORK = "fork"                 # Explorer deux chemins


class HumanNodeStatus(str, Enum):
    """Statut du nœud humain."""
    PENDING = "pending"           # En attente de l'humain
    WAITING = "waiting"           # Affiché à l'utilisateur
    DECIDED = "decided"           # Décision reçue
    TIMED_OUT = "timed_out"       # Timeout (délégation auto possible)
    SKIPPED = "skipped"           # Ignoré par politique d'autonomie


class HumanNodeUrgency(str, Enum):
    """Urgence de la décision."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    BLOCKING = "blocking"         # Bloque l'exécution


# ══════════════════════════════════════════════════════════════
# 2. Human Node
# ══════════════════════════════════════════════════════════════

@dataclass
class HumanNode:
    """
    Nœud humain dans le WorkGraph.
    Représente un point où l'exécution attend une décision humaine.
    """
    id: str = field(default_factory=lambda: f"human_{uuid.uuid4().hex[:10]}")
    mission_id: str = ""
    task_id: str = ""

    # Question posée
    question: str = ""
    context: str = ""
    decision_type: HumanDecisionType = HumanDecisionType.APPROVAL
    options: List[str] = field(default_factory=list)
    default_option: Optional[str] = None

    # Statut
    status: HumanNodeStatus = HumanNodeStatus.PENDING
    urgency: HumanNodeUrgency = HumanNodeUrgency.MEDIUM

    # Réponse
    decision: Optional[str] = None
    decision_data: Dict[str, Any] = field(default_factory=dict)
    decided_by: str = ""

    # Timing
    created_at: float = field(default_factory=time.time)
    presented_at: Optional[float] = None
    decided_at: Optional[float] = None
    timeout_seconds: Optional[float] = None  # None = pas de timeout

    @property
    def is_resolved(self) -> bool:
        return self.status in (
            HumanNodeStatus.DECIDED,
            HumanNodeStatus.TIMED_OUT,
            HumanNodeStatus.SKIPPED,
        )

    @property
    def wait_duration(self) -> Optional[float]:
        """Durée d'attente en secondes."""
        if self.presented_at and self.decided_at:
            return round(self.decided_at - self.presented_at, 2)
        if self.presented_at:
            return round(time.time() - self.presented_at, 2)
        return None

    @property
    def is_timed_out(self) -> bool:
        if self.timeout_seconds is None or self.presented_at is None:
            return False
        if self.status == HumanNodeStatus.DECIDED:
            return False
        return (time.time() - self.presented_at) > self.timeout_seconds

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "mission_id": self.mission_id,
            "task_id": self.task_id,
            "question": self.question,
            "context": self.context,
            "decision_type": self.decision_type.value,
            "options": self.options,
            "default_option": self.default_option,
            "status": self.status.value,
            "urgency": self.urgency.value,
            "decision": self.decision,
            "decision_data": self.decision_data,
            "decided_by": self.decided_by,
            "is_resolved": self.is_resolved,
            "wait_duration": self.wait_duration,
            "created_at": self.created_at,
            "presented_at": self.presented_at,
            "decided_at": self.decided_at,
            "timeout_seconds": self.timeout_seconds,
        }


# ══════════════════════════════════════════════════════════════
# 3. Human Node Manager
# ══════════════════════════════════════════════════════════════

class HumanNodeManager:
    """
    Gestionnaire des nœuds humains dans le WorkGraph.
    L'humain est toujours dans la boucle — jamais une afterthought.
    """

    def __init__(self):
        self._nodes: Dict[str, HumanNode] = {}

    def create_node(
        self,
        question: str,
        decision_type: HumanDecisionType = HumanDecisionType.APPROVAL,
        mission_id: str = "",
        task_id: str = "",
        context: str = "",
        options: Optional[List[str]] = None,
        default_option: Optional[str] = None,
        urgency: HumanNodeUrgency = HumanNodeUrgency.MEDIUM,
        timeout_seconds: Optional[float] = None,
    ) -> HumanNode:
        """Crée un nœud humain et le met en attente."""
        node = HumanNode(
            mission_id=mission_id,
            task_id=task_id,
            question=question,
            context=context,
            decision_type=decision_type,
            options=options or [],
            default_option=default_option,
            urgency=urgency,
            timeout_seconds=timeout_seconds,
        )

        self._nodes[node.id] = node

        # Émettre l'événement
        event_emitter.emit(NkyelEvent(
            type="cognitive.decision.needs_human",
            mission_id=mission_id,
            payload={
                "human_node_id": node.id,
                "question": question,
                "decision_type": decision_type.value,
                "urgency": urgency.value,
                "options": options or [],
            },
        ))

        logger.info(
            f"🧑 Nœud humain créé [{node.id}]: \"{question}\" "
            f"type={decision_type.value} urgence={urgency.value}"
        )

        return node

    def present(self, node_id: str) -> Optional[HumanNode]:
        """Marque le nœud comme présenté à l'utilisateur."""
        node = self._nodes.get(node_id)
        if node and node.status == HumanNodeStatus.PENDING:
            node.status = HumanNodeStatus.WAITING
            node.presented_at = time.time()
        return node

    def submit_decision(
        self,
        node_id: str,
        decision: str,
        decided_by: str = "",
        decision_data: Optional[Dict[str, Any]] = None,
    ) -> Optional[HumanNode]:
        """
        L'utilisateur soumet sa décision.
        Le WorkGraph peut alors reprendre.
        """
        node = self._nodes.get(node_id)
        if not node:
            return None

        if node.is_resolved:
            return node  # Déjà résolu

        # Valider la décision selon le type
        if node.decision_type == HumanDecisionType.CHOICE and node.options:
            if decision not in node.options:
                logger.warning(
                    f"⚠️ Décision invalide pour [{node_id}]: "
                    f"\"{decision}\" pas dans {node.options}"
                )
                # On l'accepte quand même mais on log

        node.decision = decision
        node.decision_data = decision_data or {}
        node.decided_by = decided_by
        node.decided_at = time.time()
        node.status = HumanNodeStatus.DECIDED

        # Émettre l'événement
        event_emitter.emit(NkyelEvent(
            type="cognitive.decision.made",
            mission_id=node.mission_id,
            payload={
                "human_node_id": node.id,
                "decision": decision,
                "decision_type": node.decision_type.value,
                "wait_duration": node.wait_duration,
            },
        ))

        logger.info(
            f"✅ Décision humaine [{node.id}]: \"{decision}\" "
            f"(attente: {node.wait_duration}s)"
        )

        return node

    def check_timeouts(self) -> List[HumanNode]:
        """Vérifie et marque les nœuds expirés."""
        timed_out: List[HumanNode] = []
        for node in self._nodes.values():
            if not node.is_resolved and node.is_timed_out:
                node.status = HumanNodeStatus.TIMED_OUT
                if node.default_option:
                    node.decision = node.default_option
                    node.decided_at = time.time()
                timed_out.append(node)
        return timed_out

    def get_node(self, node_id: str) -> Optional[HumanNode]:
        return self._nodes.get(node_id)

    def get_pending(self, mission_id: Optional[str] = None) -> List[HumanNode]:
        """Récupère les nœuds en attente de décision."""
        results = []
        for node in self._nodes.values():
            if node.is_resolved:
                continue
            if mission_id and node.mission_id != mission_id:
                continue
            results.append(node)
        return results

    def list_nodes(
        self,
        mission_id: Optional[str] = None,
        status: Optional[HumanNodeStatus] = None,
    ) -> List[Dict[str, Any]]:
        results = []
        for node in self._nodes.values():
            if mission_id and node.mission_id != mission_id:
                continue
            if status and node.status != status:
                continue
            results.append(node.to_dict())
        return results

    def clear(self) -> None:
        self._nodes.clear()


# ══════════════════════════════════════════════════════════════
# Singleton
# ══════════════════════════════════════════════════════════════

human_node_manager = HumanNodeManager()
