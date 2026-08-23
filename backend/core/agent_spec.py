"""
Ñkyel AI — Agent Spec · SmartANDJ AI Technologies
Spécification déclarative versionnée d'un agent Ñkyel.

Chaque agent est représenté par une AgentSpec immuable.
La représentation visuelle et la représentation runtime correspondent exactement.
Visual Agent → Agent Spec → Validation → Agent Compiler → DeerFlow/LangGraph

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import copy
import time
import uuid
import json
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field, asdict
from enum import Enum


# ══════════════════════════════════════════════════════════════
# 1. Enums & Value Objects
# ══════════════════════════════════════════════════════════════

class CognitionMode(str, Enum):
    """Mode cognitif de l'agent."""
    FAST = "fast"
    BALANCED = "balanced"
    DEEP = "deep"
    RESEARCH = "research"
    CODE = "code"
    VISION = "vision"


class PermissionLevel(str, Enum):
    """Niveau de permission pour une action."""
    ALLOWED = "allowed"
    APPROVAL_REQUIRED = "approval_required"
    DENIED = "denied"


class MemoryAccess(str, Enum):
    """Accès mémoire pour un scope donné."""
    NONE = "none"
    READ = "read"
    READ_WRITE = "read_write"
    OWNER_ONLY = "owner_only"


class EditTemperature(str, Enum):
    """Classification de la modifiabilité live."""
    HOT = "hot"      # Modifiable immédiatement
    WARM = "warm"     # Appliqué au prochain checkpoint
    COLD = "cold"     # Nécessite redémarrage / fork


# ══════════════════════════════════════════════════════════════
# 2. Agent Spec Components
# ══════════════════════════════════════════════════════════════

@dataclass
class AgentIdentity:
    """Identité de l'agent."""
    name: str = "Kora"
    role: str = "Assistant Général"
    description: str = ""
    avatar_url: str = ""


@dataclass
class AgentCognition:
    """Paramètres cognitifs de l'agent."""
    mode: CognitionMode = CognitionMode.BALANCED
    autonomy: float = 0.5       # 0.0 (assisté) → 1.0 (autonome)
    verification: float = 0.5   # 0.0 (créatif) → 1.0 (vérificateur)

    def validate(self) -> None:
        """Valide les plages des paramètres."""
        self.autonomy = max(0.0, min(1.0, self.autonomy))
        self.verification = max(0.0, min(1.0, self.verification))


@dataclass
class AgentModelPolicy:
    """Politique de sélection de modèle."""
    capability: str = "BALANCED"
    preferred_provider: Optional[str] = None
    max_tokens_per_call: int = 8192
    temperature: float = 0.7


@dataclass
class AgentMemoryScope:
    """Portée de la mémoire de l'agent."""
    user_profile: MemoryAccess = MemoryAccess.READ_WRITE
    conversations: MemoryAccess = MemoryAccess.READ_WRITE
    workspace: MemoryAccess = MemoryAccess.READ
    private_memory: MemoryAccess = MemoryAccess.OWNER_ONLY
    projects: MemoryAccess = MemoryAccess.READ_WRITE
    knowledge: MemoryAccess = MemoryAccess.READ
    auto_learn: bool = True
    ask_before_save: bool = True
    retention: str = "permanent"  # "session", "30_days", "permanent"


@dataclass
class AgentTools:
    """Outils disponibles pour l'agent."""
    search: bool = True
    browser: bool = True
    code: bool = False
    file_system: bool = False
    mcp_servers: List[str] = field(default_factory=list)
    excluded_sources: List[str] = field(default_factory=list)


@dataclass
class AgentPermissions:
    """Permissions de l'agent pour des actions sensibles."""
    email_send: PermissionLevel = PermissionLevel.APPROVAL_REQUIRED
    file_delete: PermissionLevel = PermissionLevel.DENIED
    file_write: PermissionLevel = PermissionLevel.APPROVAL_REQUIRED
    web_action: PermissionLevel = PermissionLevel.APPROVAL_REQUIRED
    payment: PermissionLevel = PermissionLevel.DENIED
    data_export: PermissionLevel = PermissionLevel.APPROVAL_REQUIRED


@dataclass
class AgentBudget:
    """Plafonds budgétaires de l'agent."""
    max_agents: int = 4
    max_cost_usd: float = 1.0
    max_duration_seconds: int = 600
    max_tokens: int = 500_000
    max_tools_per_mission: int = 20


@dataclass
class AgentLanguage:
    """Préférences linguistiques."""
    preferred: str = "fr-GA"
    fallback: str = "fr"
    african_languages: List[str] = field(default_factory=lambda: ["fang", "mpongwe"])


# ══════════════════════════════════════════════════════════════
# 3. Agent Spec — Source de Vérité
# ══════════════════════════════════════════════════════════════

@dataclass
class AgentSpec:
    """
    Spécification déclarative complète d'un agent Ñkyel.
    C'est la source de vérité unique.
    Le Visual Agent la lit. L'Agent Compiler la traduit en runtime.
    """
    id: str = field(default_factory=lambda: f"agent_{uuid.uuid4().hex[:12]}")
    version: int = 1
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    owner_id: str = ""

    identity: AgentIdentity = field(default_factory=AgentIdentity)
    cognition: AgentCognition = field(default_factory=AgentCognition)
    model_policy: AgentModelPolicy = field(default_factory=AgentModelPolicy)
    memory: AgentMemoryScope = field(default_factory=AgentMemoryScope)
    tools: AgentTools = field(default_factory=AgentTools)
    permissions: AgentPermissions = field(default_factory=AgentPermissions)
    budget: AgentBudget = field(default_factory=AgentBudget)
    language: AgentLanguage = field(default_factory=AgentLanguage)

    def to_dict(self) -> Dict[str, Any]:
        """Sérialise la spec en dictionnaire."""
        return asdict(self)

    def to_json(self) -> str:
        """Sérialise la spec en JSON."""
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=2, default=str)

    def validate(self) -> List[str]:
        """Valide la spec et retourne les erreurs éventuelles."""
        errors: List[str] = []
        if not self.identity.name:
            errors.append("identity.name est requis")
        self.cognition.validate()
        if self.budget.max_cost_usd < 0:
            errors.append("budget.max_cost_usd doit être >= 0")
        if self.budget.max_agents < 1:
            errors.append("budget.max_agents doit être >= 1")
        if self.budget.max_duration_seconds < 10:
            errors.append("budget.max_duration_seconds doit être >= 10")
        return errors

    def clone(self) -> "AgentSpec":
        """Crée une copie profonde de la spec."""
        return copy.deepcopy(self)


# ══════════════════════════════════════════════════════════════
# 4. Edit Temperature Classification
# ══════════════════════════════════════════════════════════════

# Classifie chaque champ de la spec en HOT / WARM / COLD
EDIT_TEMPERATURE_MAP: Dict[str, EditTemperature] = {
    # HOT — Modifiable immédiatement en cours de mission
    "cognition.mode": EditTemperature.HOT,
    "cognition.verification": EditTemperature.HOT,
    "budget.max_cost_usd": EditTemperature.HOT,
    "budget.max_agents": EditTemperature.HOT,
    "budget.max_tokens": EditTemperature.HOT,
    "tools.excluded_sources": EditTemperature.HOT,
    "language.preferred": EditTemperature.HOT,
    "model_policy.temperature": EditTemperature.HOT,

    # WARM — Appliqué au prochain checkpoint
    "cognition.autonomy": EditTemperature.WARM,
    "tools.search": EditTemperature.WARM,
    "tools.browser": EditTemperature.WARM,
    "tools.code": EditTemperature.WARM,
    "tools.mcp_servers": EditTemperature.WARM,
    "memory.auto_learn": EditTemperature.WARM,
    "memory.ask_before_save": EditTemperature.WARM,
    "memory.retention": EditTemperature.WARM,
    "permissions.email_send": EditTemperature.WARM,
    "permissions.file_write": EditTemperature.WARM,
    "permissions.web_action": EditTemperature.WARM,

    # COLD — Nécessite redémarrage / fork
    "identity.name": EditTemperature.COLD,
    "identity.role": EditTemperature.COLD,
    "model_policy.capability": EditTemperature.COLD,
    "permissions.payment": EditTemperature.COLD,
    "permissions.file_delete": EditTemperature.COLD,
    "tools.file_system": EditTemperature.COLD,
}


def get_edit_temperature(path: str) -> EditTemperature:
    """Retourne la classification de température d'un champ."""
    return EDIT_TEMPERATURE_MAP.get(path, EditTemperature.WARM)


# ══════════════════════════════════════════════════════════════
# 5. Versioning & History
# ══════════════════════════════════════════════════════════════

@dataclass
class AgentSpecVersion:
    """Une version historique d'une AgentSpec."""
    version: int
    spec_snapshot: Dict[str, Any]
    changed_fields: List[str]
    change_description: str = ""
    changed_by: str = ""
    timestamp: float = field(default_factory=time.time)


class AgentSpecHistory:
    """
    Historique complet des versions d'un agent.
    Supporte : inspecter, comparer, restaurer, fork, nommer.
    """

    def __init__(self, initial_spec: AgentSpec):
        self.agent_id = initial_spec.id
        self._versions: List[AgentSpecVersion] = [
            AgentSpecVersion(
                version=1,
                spec_snapshot=initial_spec.to_dict(),
                changed_fields=[],
                change_description="Création initiale",
            )
        ]
        self._current_spec = initial_spec

    @property
    def current(self) -> AgentSpec:
        return self._current_spec

    @property
    def current_version(self) -> int:
        return self._current_spec.version

    @property
    def version_count(self) -> int:
        return len(self._versions)

    def commit(
        self,
        new_spec: AgentSpec,
        changed_fields: List[str],
        description: str = "",
        changed_by: str = "",
    ) -> int:
        """Enregistre une nouvelle version."""
        new_version = self.current_version + 1
        new_spec.version = new_version
        new_spec.updated_at = time.time()

        self._versions.append(AgentSpecVersion(
            version=new_version,
            spec_snapshot=new_spec.to_dict(),
            changed_fields=changed_fields,
            change_description=description,
            changed_by=changed_by,
        ))
        self._current_spec = new_spec
        return new_version

    def get_version(self, version: int) -> Optional[Dict[str, Any]]:
        """Récupère une version spécifique."""
        for v in self._versions:
            if v.version == version:
                return v.spec_snapshot
        return None

    def list_versions(self) -> List[Dict[str, Any]]:
        """Liste toutes les versions avec leur métadonnées."""
        return [
            {
                "version": v.version,
                "changed_fields": v.changed_fields,
                "description": v.change_description,
                "changed_by": v.changed_by,
                "timestamp": v.timestamp,
            }
            for v in self._versions
        ]

    def restore(self, version: int) -> Optional[AgentSpec]:
        """Restaure une version précédente (crée une nouvelle version)."""
        snapshot = self.get_version(version)
        if snapshot is None:
            return None

        restored = AgentSpec(**{
            k: v for k, v in snapshot.items()
            if k in AgentSpec.__dataclass_fields__
            and not isinstance(v, dict)
        })
        # Reconstruct nested dataclasses
        restored.id = snapshot.get("id", self.agent_id)
        restored.owner_id = snapshot.get("owner_id", "")

        self.commit(
            restored,
            changed_fields=["*"],
            description=f"Restauration depuis v{version}",
        )
        return restored


# ══════════════════════════════════════════════════════════════
# 6. Visual Diff
# ══════════════════════════════════════════════════════════════

def spec_diff(
    spec_a: Dict[str, Any],
    spec_b: Dict[str, Any],
    prefix: str = "",
) -> List[Dict[str, Any]]:
    """
    Calcule le diff visuel entre deux versions d'AgentSpec.
    Retourne une liste de changements lisibles par l'utilisateur.
    """
    diffs: List[Dict[str, Any]] = []

    all_keys = set(list(spec_a.keys()) + list(spec_b.keys()))
    for key in sorted(all_keys):
        path = f"{prefix}.{key}" if prefix else key
        val_a = spec_a.get(key)
        val_b = spec_b.get(key)

        if isinstance(val_a, dict) and isinstance(val_b, dict):
            diffs.extend(spec_diff(val_a, val_b, prefix=path))
        elif val_a != val_b:
            diffs.append({
                "path": path,
                "old_value": val_a,
                "new_value": val_b,
                "temperature": get_edit_temperature(path).value,
            })

    return diffs


# ══════════════════════════════════════════════════════════════
# 7. Fork Agent
# ══════════════════════════════════════════════════════════════

def fork_agent(
    source_spec: AgentSpec,
    new_name: str,
    new_role: Optional[str] = None,
) -> AgentSpec:
    """
    Duplique un agent avec un nouvel ID et nom.
    L'agent fork hérite de toute la configuration mais diverge ensuite.
    La mémoire privée N'EST PAS copiée (sécurité).
    """
    forked = source_spec.clone()
    forked.id = f"agent_{uuid.uuid4().hex[:12]}"
    forked.version = 1
    forked.created_at = time.time()
    forked.updated_at = time.time()
    forked.identity.name = new_name
    if new_role:
        forked.identity.role = new_role
    return forked
