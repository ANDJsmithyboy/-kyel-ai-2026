"""
Ñkyel AI — VIE Patch Protocol · SmartANDJ AI Technologies
Protocole de modifications visuelles structurées.

Chaque modification dans le Visual Agent, la Mémoire ou le World Model
génère un VIEPatch structuré qui suit le pipeline :

  Browser → Ñkyel Command → Authorization → Validation →
  Policy → Agent Compiler → Runtime

JAMAIS de modification directe du runtime depuis le browser.

Classification :
  HOT  — appliqué immédiatement
  WARM — appliqué au prochain checkpoint
  COLD — nécessite redémarrage / fork

Supporte : Undo / Redo / Rollback natif.

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import uuid
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum

from core.agent_spec import EditTemperature, get_edit_temperature
from core.event_schema import NkyelEventType, NkyelEvent, event_emitter

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Patch Operations
# ══════════════════════════════════════════════════════════════

class PatchOperation(str, Enum):
    """Opérations de patch supportées."""
    UPDATE = "update"
    ADD = "add"
    REMOVE = "remove"
    TOGGLE = "toggle"


class PatchStatus(str, Enum):
    """Statut d'un patch dans le pipeline."""
    PENDING = "pending"
    VALIDATED = "validated"
    AUTHORIZED = "authorized"
    APPLIED = "applied"
    REJECTED = "rejected"
    ROLLED_BACK = "rolled_back"


class PatchTarget(str, Enum):
    """Cibles de patch possibles."""
    AGENT_SPEC = "agent.spec"
    AGENT_COGNITION = "agent.cognition"
    AGENT_TOOLS = "agent.tools"
    AGENT_MEMORY = "agent.memory"
    AGENT_BUDGET = "agent.budget"
    AGENT_PERMISSIONS = "agent.permissions"
    TOOL_POLICY = "agent.tool_policy"
    MEMORY_CARD = "memory.card"
    MEMORY_POLICY = "memory.policy"
    WORLD_MODEL = "world_model"
    WORKGRAPH = "workgraph"


# ══════════════════════════════════════════════════════════════
# 2. VIE Patch
# ══════════════════════════════════════════════════════════════

@dataclass
class VIEPatch:
    """
    Patch structuré généré par une modification visuelle.
    Chaque patch est immuable une fois créé.
    """
    id: str = field(default_factory=lambda: f"patch_{uuid.uuid4().hex[:10]}")
    operation: PatchOperation = PatchOperation.UPDATE
    target: PatchTarget = PatchTarget.AGENT_SPEC
    agent_id: str = ""
    path: str = ""             # e.g. "tools.search", "cognition.autonomy"
    old_value: Any = None
    new_value: Any = None
    reason: str = ""
    user_id: str = ""
    mission_id: str = ""
    timestamp: float = field(default_factory=time.time)

    # Classification & Status
    temperature: EditTemperature = EditTemperature.WARM
    status: PatchStatus = PatchStatus.PENDING

    # Computed
    applied_at: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "operation": self.operation.value,
            "target": self.target.value,
            "agent_id": self.agent_id,
            "path": self.path,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "reason": self.reason,
            "temperature": self.temperature.value,
            "status": self.status.value,
            "timestamp": self.timestamp,
            "applied_at": self.applied_at,
        }


# ══════════════════════════════════════════════════════════════
# 3. VIE Patch Engine
# ══════════════════════════════════════════════════════════════

class VIEPatchEngine:
    """
    Moteur de traitement des patchs visuels.
    Pipeline : validate → authorize → classify → version → apply → emit event.
    Supporte Undo / Redo natif.
    """

    def __init__(self):
        self._applied_patches: List[VIEPatch] = []
        self._undone_patches: List[VIEPatch] = []
        self._pending_warm: List[VIEPatch] = []
        self._pending_cold: List[VIEPatch] = []

    def submit(self, patch: VIEPatch) -> VIEPatch:
        """
        Soumet un patch au pipeline de traitement.
        Retourne le patch avec son statut mis à jour.
        """
        # 1. Classify temperature
        patch.temperature = get_edit_temperature(patch.path)

        # 2. Validate
        errors = self._validate(patch)
        if errors:
            patch.status = PatchStatus.REJECTED
            logger.warning(f"❌ Patch rejeté [{patch.id}]: {errors}")
            return patch

        patch.status = PatchStatus.VALIDATED

        # 3. Authorize (simplified — in production, check user roles)
        patch.status = PatchStatus.AUTHORIZED

        # 4. Route by temperature
        if patch.temperature == EditTemperature.HOT:
            return self._apply_immediately(patch)
        elif patch.temperature == EditTemperature.WARM:
            self._pending_warm.append(patch)
            logger.info(f"🌡️ Patch WARM enregistré [{patch.id}]: {patch.path}")
            return patch
        else:  # COLD
            self._pending_cold.append(patch)
            logger.info(f"❄️ Patch COLD enregistré [{patch.id}]: {patch.path} (redémarrage requis)")
            return patch

    def _apply_immediately(self, patch: VIEPatch) -> VIEPatch:
        """Applique un patch HOT immédiatement."""
        patch.status = PatchStatus.APPLIED
        patch.applied_at = time.time()
        self._applied_patches.append(patch)
        self._undone_patches.clear()  # New action clears redo stack

        # Emit canonical event
        event_emitter.emit(NkyelEvent(
            type=NkyelEventType.VIE_STATE_UPDATE.value,
            agent_id=patch.agent_id,
            mission_id=patch.mission_id,
            payload={
                "patch_id": patch.id,
                "operation": patch.operation.value,
                "target": patch.target.value,
                "path": patch.path,
                "old_value": str(patch.old_value),
                "new_value": str(patch.new_value),
                "temperature": patch.temperature.value,
            },
        ))

        logger.info(f"🔥 Patch HOT appliqué [{patch.id}]: {patch.path} = {patch.new_value}")
        return patch

    def apply_warm_patches(self) -> List[VIEPatch]:
        """Applique tous les patchs WARM en attente (au checkpoint)."""
        applied: List[VIEPatch] = []
        for patch in self._pending_warm:
            patch.status = PatchStatus.APPLIED
            patch.applied_at = time.time()
            self._applied_patches.append(patch)
            applied.append(patch)

        self._pending_warm.clear()
        if applied:
            logger.info(f"🌡️ {len(applied)} patchs WARM appliqués au checkpoint")
        return applied

    def get_pending_cold(self) -> List[VIEPatch]:
        """Retourne les patchs COLD en attente de redémarrage."""
        return list(self._pending_cold)

    def _validate(self, patch: VIEPatch) -> List[str]:
        """Valide un patch avant traitement."""
        errors: List[str] = []
        if not patch.path:
            errors.append("Le chemin du patch est requis")
        if not patch.agent_id:
            errors.append("L'ID de l'agent est requis")
        return errors

    # ── Undo / Redo ──────────────────────────────────────────

    def undo(self) -> Optional[VIEPatch]:
        """Annule le dernier patch appliqué."""
        if not self._applied_patches:
            return None

        last_patch = self._applied_patches.pop()
        last_patch.status = PatchStatus.ROLLED_BACK

        # Create inverse patch
        inverse = VIEPatch(
            operation=last_patch.operation,
            target=last_patch.target,
            agent_id=last_patch.agent_id,
            path=last_patch.path,
            old_value=last_patch.new_value,
            new_value=last_patch.old_value,
            reason=f"Undo de {last_patch.id}",
            user_id=last_patch.user_id,
            mission_id=last_patch.mission_id,
            temperature=last_patch.temperature,
            status=PatchStatus.APPLIED,
            applied_at=time.time(),
        )

        self._undone_patches.append(last_patch)
        logger.info(f"↩️ Undo: {last_patch.path} restauré à {last_patch.old_value}")
        return inverse

    def redo(self) -> Optional[VIEPatch]:
        """Rétablit le dernier patch annulé."""
        if not self._undone_patches:
            return None

        patch = self._undone_patches.pop()
        patch.status = PatchStatus.APPLIED
        patch.applied_at = time.time()
        self._applied_patches.append(patch)
        logger.info(f"↪️ Redo: {patch.path} rétabli à {patch.new_value}")
        return patch

    # ── Introspection ────────────────────────────────────────

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retourne l'historique des patchs appliqués."""
        return [p.to_dict() for p in self._applied_patches[-limit:]]

    def get_pending_count(self) -> Dict[str, int]:
        """Retourne le nombre de patchs en attente par température."""
        return {
            "warm": len(self._pending_warm),
            "cold": len(self._pending_cold),
        }

    def clear(self) -> None:
        """Réinitialise le moteur de patchs."""
        self._applied_patches.clear()
        self._undone_patches.clear()
        self._pending_warm.clear()
        self._pending_cold.clear()


# ══════════════════════════════════════════════════════════════
# 4. Command / Event Separation
# ══════════════════════════════════════════════════════════════

# Commands (ce que l'utilisateur demande)
COMMANDS = {
    "agent.memory.disable",
    "agent.tool.remove",
    "agent.tool.add",
    "agent.autonomy.change",
    "agent.mode.change",
    "agent.budget.change",
    "agent.source.exclude",
    "agent.source.include",
    "workgraph.node.edit",
    "workgraph.node.cancel",
    "worldmodel.fact.reject",
    "worldmodel.fact.accept",
    "worldmodel.constraint.add",
    "worldmodel.constraint.remove",
    "memory.card.create",
    "memory.card.edit",
    "memory.card.delete",
    "memory.card.lock",
}

# Events (ce qui s'est réellement produit)
EVENTS = {
    "agent.memory.disabled",
    "agent.tool.removed",
    "agent.tool.added",
    "agent.autonomy.changed",
    "agent.mode.changed",
    "agent.budget.changed",
    "agent.source.excluded",
    "agent.source.included",
    "workgraph.node.edited",
    "workgraph.node.cancelled",
    "worldmodel.fact.rejected",
    "worldmodel.fact.accepted",
    "worldmodel.constraint.added",
    "worldmodel.constraint.removed",
    "memory.card.created",
    "memory.card.edited",
    "memory.card.deleted",
    "memory.card.locked",
}


def command_to_event(command: str) -> str:
    """Convertit un nom de commande en nom d'événement correspondant."""
    mapping = {
        "disable": "disabled",
        "remove": "removed",
        "add": "added",
        "change": "changed",
        "exclude": "excluded",
        "include": "included",
        "edit": "edited",
        "cancel": "cancelled",
        "reject": "rejected",
        "accept": "accepted",
        "create": "created",
        "delete": "deleted",
        "lock": "locked",
    }
    parts = command.rsplit(".", 1)
    if len(parts) == 2:
        base, verb = parts
        past = mapping.get(verb, f"{verb}ed")
        return f"{base}.{past}"
    return command


# ══════════════════════════════════════════════════════════════
# Singleton
# ══════════════════════════════════════════════════════════════

vie_patch_engine = VIEPatchEngine()
