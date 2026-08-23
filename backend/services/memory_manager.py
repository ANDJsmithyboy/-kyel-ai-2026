"""
Ñkyel AI — Multi-Tier Memory Manager · SmartANDJ AI Technologies
Gestionnaire de mémoire à 6 niveaux avec isolation multi-tenant.

Niveaux de mémoire :
  1. Context    — Mémoire immédiate de la session (éphémère)
  2. Working    — État d'exécution de la mission (durée de la mission)
  3. User       — Préférences persistantes de l'utilisateur (permanent)
  4. Workspace  — Connaissance partagée de l'organisation (permanent)
  5. Knowledge  — Index documentaire RAG / Qdrant (permanent)
  6. Agent      — État et compétences spécifiques d'un agent (semi-permanent)

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import json
import logging
from enum import Enum
from typing import Optional, Any
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Types & Enums
# ══════════════════════════════════════════════════════════════

class MemoryTier(str, Enum):
    """Niveaux de mémoire du système Ñkyel."""
    CONTEXT = "context"       # Session immédiate
    WORKING = "working"       # Mission en cours
    USER = "user"             # Préférences utilisateur persistantes
    WORKSPACE = "workspace"   # Organisation / tenant
    KNOWLEDGE = "knowledge"   # Index RAG documentaire
    AGENT = "agent"           # État agent spécifique


class TrustLevel(str, Enum):
    """Niveau de confiance des données en mémoire."""
    SYSTEM_TRUST = "system"       # Données système fiables
    USER_INPUT = "user_input"     # Entrée utilisateur brute
    RETRIEVED_DATA = "retrieved"  # Données récupérées par RAG/Search
    TOOL_OUTPUT = "tool_output"   # Sortie d'un outil MCP
    INFERRED = "inferred"         # Déduit par un agent


@dataclass
class MemoryEntry:
    """Entrée de mémoire avec métadonnées de traçabilité et isolation."""
    key: str
    value: Any
    tier: MemoryTier
    trust: TrustLevel = TrustLevel.USER_INPUT
    user_id: Optional[str] = None
    organization_id: Optional[str] = None
    workspace_id: Optional[str] = None
    mission_id: Optional[str] = None
    agent_id: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    ttl_seconds: Optional[float] = None  # None = permanent
    source: Optional[str] = None  # Provenance

    @property
    def is_expired(self) -> bool:
        if self.ttl_seconds is None:
            return False
        return (time.time() - self.updated_at) > self.ttl_seconds

    def to_dict(self) -> dict:
        return {
            "key": self.key,
            "value": self.value,
            "tier": self.tier.value,
            "trust": self.trust.value,
            "user_id": self.user_id,
            "organization_id": self.organization_id,
            "workspace_id": self.workspace_id,
            "mission_id": self.mission_id,
            "created_at": self.created_at,
            "source": self.source,
        }


# ══════════════════════════════════════════════════════════════
# 2. Tenant Isolation Key
# ══════════════════════════════════════════════════════════════

def _isolation_key(
    user_id: Optional[str] = None,
    organization_id: Optional[str] = None,
    workspace_id: Optional[str] = None,
) -> str:
    """
    Génère une clé d'isolation unique pour le tenant.
    Garantit qu'aucune donnée ne traverse les frontières d'un tenant.
    """
    parts = []
    if organization_id:
        parts.append(f"org:{organization_id}")
    if workspace_id:
        parts.append(f"ws:{workspace_id}")
    if user_id:
        parts.append(f"usr:{user_id}")
    return "|".join(parts) if parts else "global"


# ══════════════════════════════════════════════════════════════
# 3. Memory Manager
# ══════════════════════════════════════════════════════════════

class MemoryManager:
    """
    Gestionnaire de mémoire multi-niveaux avec isolation logique.

    Chaque entrée est indexée par :
      (tier, isolation_key, key) → MemoryEntry

    L'isolation est STRICTE : un utilisateur ne voit jamais les données
    d'une autre organisation ou d'un autre workspace.
    """

    def __init__(self):
        # Store principal: {tier: {isolation_key: {key: MemoryEntry}}}
        self._store: dict[str, dict[str, dict[str, MemoryEntry]]] = {
            tier.value: {} for tier in MemoryTier
        }
        self._stats = {
            "reads": 0,
            "writes": 0,
            "deletes": 0,
            "evictions": 0,
        }

    # ── Write ─────────────────────────────────────────────────

    def set(
        self,
        key: str,
        value: Any,
        tier: MemoryTier,
        *,
        trust: TrustLevel = TrustLevel.USER_INPUT,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        mission_id: Optional[str] = None,
        agent_id: Optional[str] = None,
        ttl_seconds: Optional[float] = None,
        source: Optional[str] = None,
    ) -> MemoryEntry:
        """Écrit une entrée dans le tier de mémoire spécifié."""
        iso_key = _isolation_key(user_id, organization_id, workspace_id)
        tier_store = self._store[tier.value]

        if iso_key not in tier_store:
            tier_store[iso_key] = {}

        entry = MemoryEntry(
            key=key,
            value=value,
            tier=tier,
            trust=trust,
            user_id=user_id,
            organization_id=organization_id,
            workspace_id=workspace_id,
            mission_id=mission_id,
            agent_id=agent_id,
            ttl_seconds=ttl_seconds,
            source=source,
        )

        # Si la clé existe déjà, préserver created_at
        existing = tier_store[iso_key].get(key)
        if existing:
            entry.created_at = existing.created_at

        tier_store[iso_key][key] = entry
        self._stats["writes"] += 1

        return entry

    # ── Read ──────────────────────────────────────────────────

    def get(
        self,
        key: str,
        tier: MemoryTier,
        *,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
    ) -> Optional[Any]:
        """Lit une valeur depuis le tier spécifié, respectant l'isolation."""
        iso_key = _isolation_key(user_id, organization_id, workspace_id)
        tier_store = self._store.get(tier.value, {})
        entries = tier_store.get(iso_key, {})
        entry = entries.get(key)

        self._stats["reads"] += 1

        if entry is None:
            return None
        if entry.is_expired:
            del entries[key]
            self._stats["evictions"] += 1
            return None

        return entry.value

    def get_entry(
        self,
        key: str,
        tier: MemoryTier,
        *,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
    ) -> Optional[MemoryEntry]:
        """Lit l'entrée complète (avec métadonnées) depuis le tier spécifié."""
        iso_key = _isolation_key(user_id, organization_id, workspace_id)
        tier_store = self._store.get(tier.value, {})
        entries = tier_store.get(iso_key, {})
        entry = entries.get(key)

        self._stats["reads"] += 1

        if entry is None:
            return None
        if entry.is_expired:
            del entries[key]
            self._stats["evictions"] += 1
            return None

        return entry

    # ── Multi-Tier Read (Cascade) ─────────────────────────────

    def recall(
        self,
        key: str,
        *,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        tiers: Optional[list[MemoryTier]] = None,
    ) -> Optional[Any]:
        """
        Cherche une clé dans les tiers en cascade (du plus spécifique au plus large).
        Ordre par défaut: CONTEXT → WORKING → USER → WORKSPACE → KNOWLEDGE → AGENT
        """
        search_tiers = tiers or [
            MemoryTier.CONTEXT,
            MemoryTier.WORKING,
            MemoryTier.USER,
            MemoryTier.WORKSPACE,
            MemoryTier.KNOWLEDGE,
            MemoryTier.AGENT,
        ]

        for tier in search_tiers:
            value = self.get(
                key, tier,
                user_id=user_id,
                organization_id=organization_id,
                workspace_id=workspace_id,
            )
            if value is not None:
                return value

        return None

    # ── Delete ────────────────────────────────────────────────

    def delete(
        self,
        key: str,
        tier: MemoryTier,
        *,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
    ) -> bool:
        """Supprime une entrée d'un tier."""
        iso_key = _isolation_key(user_id, organization_id, workspace_id)
        tier_store = self._store.get(tier.value, {})
        entries = tier_store.get(iso_key, {})

        if key in entries:
            del entries[key]
            self._stats["deletes"] += 1
            return True
        return False

    # ── List & Query ──────────────────────────────────────────

    def list_keys(
        self,
        tier: MemoryTier,
        *,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
    ) -> list[str]:
        """Liste toutes les clés dans un tier pour un tenant donné."""
        iso_key = _isolation_key(user_id, organization_id, workspace_id)
        tier_store = self._store.get(tier.value, {})
        entries = tier_store.get(iso_key, {})
        return [k for k, v in entries.items() if not v.is_expired]

    def list_entries(
        self,
        tier: MemoryTier,
        *,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
    ) -> list[MemoryEntry]:
        """Liste toutes les entrées (avec métadonnées) dans un tier."""
        iso_key = _isolation_key(user_id, organization_id, workspace_id)
        tier_store = self._store.get(tier.value, {})
        entries = tier_store.get(iso_key, {})
        return [v for v in entries.values() if not v.is_expired]

    # ── Lifecycle ─────────────────────────────────────────────

    def clear_mission(
        self,
        mission_id: str,
        *,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
    ) -> int:
        """
        Nettoie la mémoire WORKING et CONTEXT pour une mission terminée.
        Préserve USER, WORKSPACE, KNOWLEDGE et AGENT.
        """
        cleared = 0
        for tier in [MemoryTier.CONTEXT, MemoryTier.WORKING]:
            iso_key = _isolation_key(user_id, organization_id, workspace_id)
            tier_store = self._store.get(tier.value, {})
            entries = tier_store.get(iso_key, {})
            to_remove = [
                k for k, v in entries.items()
                if v.mission_id == mission_id
            ]
            for k in to_remove:
                del entries[k]
                cleared += 1
        return cleared

    def evict_expired(self) -> int:
        """Nettoie toutes les entrées expirées de tous les tiers."""
        evicted = 0
        for tier_store in self._store.values():
            for entries in tier_store.values():
                expired_keys = [k for k, v in entries.items() if v.is_expired]
                for k in expired_keys:
                    del entries[k]
                    evicted += 1
        self._stats["evictions"] += evicted
        return evicted

    # ── Convenience: Context & Working Memory ──────────────────

    def set_context(self, key: str, value: Any, **kwargs) -> MemoryEntry:
        """Raccourci pour écrire dans la mémoire de contexte."""
        return self.set(key, value, MemoryTier.CONTEXT, ttl_seconds=3600, **kwargs)

    def set_working(self, key: str, value: Any, **kwargs) -> MemoryEntry:
        """Raccourci pour écrire dans la mémoire de travail."""
        return self.set(key, value, MemoryTier.WORKING, **kwargs)

    def set_user_pref(self, key: str, value: Any, **kwargs) -> MemoryEntry:
        """Raccourci pour écrire une préférence utilisateur persistante."""
        return self.set(key, value, MemoryTier.USER, trust=TrustLevel.USER_INPUT, **kwargs)

    # ── Status ─────────────────────────────────────────────────

    def status(self) -> dict:
        """Retourne le statut complet du Memory Manager."""
        tier_counts = {}
        for tier_name, tier_store in self._store.items():
            total = sum(
                len([v for v in entries.values() if not v.is_expired])
                for entries in tier_store.values()
            )
            tier_counts[tier_name] = total

        return {
            "tiers": tier_counts,
            "total_entries": sum(tier_counts.values()),
            "stats": self._stats.copy(),
        }


# ══════════════════════════════════════════════════════════════
# Singleton
# ══════════════════════════════════════════════════════════════

memory_manager = MemoryManager()
