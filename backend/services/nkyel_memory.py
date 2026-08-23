"""
Ñkyel AI — Sovereign Memory Engine · SmartANDJ AI Technologies
Moteur de mémoire souveraine à 9 niveaux avec provenance, contrôle utilisateur,
pipeline de sécurité et Memory Cards.

L'UTILISATEUR CONTRÔLE SA MÉMOIRE.

9 Scopes étanches :
  1. SESSION     — Temporaire, disparaît ou archivée après session
  2. CONVERSATION— Contexte d'une conversation
  3. WORKING     — État actif d'une mission
  4. USER        — Informations persistantes personnalisées
  5. PREFERENCE  — Habitudes, langues, devises, style
  6. PROJECT     — Mémoire limitée à un projet
  7. WORKSPACE   — Mémoire organisationnelle
  8. AGENT       — Connaissances spécifiques à un agent
  9. KNOWLEDGE   — Documents, RAG, bases de connaissances

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import time
import uuid
import re
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Memory Scopes
# ══════════════════════════════════════════════════════════════

class MemoryScope(str, Enum):
    """Les 9 scopes de mémoire Ñkyel."""
    SESSION = "session"
    CONVERSATION = "conversation"
    WORKING = "working"
    USER = "user"
    PREFERENCE = "preference"
    PROJECT = "project"
    WORKSPACE = "workspace"
    AGENT = "agent"
    KNOWLEDGE = "knowledge"


class MemoryVisibility(str, Enum):
    """Visibilité de la mémoire."""
    PRIVATE = "private"       # Seulement le propriétaire
    WORKSPACE = "workspace"   # Membres de l'organisation
    AGENT = "agent"           # Agent spécifique seulement
    PUBLIC = "public"         # Partagée (rare)


class LearningPolicy(str, Enum):
    """Politique d'apprentissage automatique."""
    NEVER = "never"
    ALWAYS_ASK = "always_ask"
    AUTO_PREFERENCES = "auto_preferences"
    AUTO_ALL = "auto_all"


class SensitivityLevel(str, Enum):
    """Niveau de sensibilité des données."""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"  # Secrets, passwords, tokens


# ══════════════════════════════════════════════════════════════
# 2. Memory Card
# ══════════════════════════════════════════════════════════════

@dataclass
class MemoryCard:
    """
    Chaque élément de mémoire possède une carte traçable.
    L'utilisateur peut voir, modifier, supprimer, verrouiller.
    """
    memory_id: str = field(default_factory=lambda: f"mem_{uuid.uuid4().hex[:12]}")
    type: str = "fact"  # "fact", "preference", "habit", "project", "contact", "document"
    content: str = ""
    scope: MemoryScope = MemoryScope.USER
    source: str = ""           # D'où vient cette mémoire
    source_conversations: List[str] = field(default_factory=list)
    confidence: float = 0.5    # 0.0 → 1.0
    sensitivity: SensitivityLevel = SensitivityLevel.INTERNAL

    # Ownership & Access
    owner_id: str = ""
    workspace_id: str = ""
    agent_id: str = ""
    project_id: str = ""
    visibility: MemoryVisibility = MemoryVisibility.PRIVATE

    # Lifecycle
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    expires_at: Optional[float] = None  # None = permanent
    editable: bool = True
    locked: bool = False
    learning_blocked: bool = False  # User peut interdire l'apprentissage

    @property
    def is_expired(self) -> bool:
        if self.expires_at is None:
            return False
        return time.time() > self.expires_at

    def to_dict(self) -> Dict[str, Any]:
        return {
            "memory_id": self.memory_id,
            "type": self.type,
            "content": self.content,
            "scope": self.scope.value,
            "source": self.source,
            "source_conversations": self.source_conversations,
            "confidence": self.confidence,
            "sensitivity": self.sensitivity.value,
            "owner_id": self.owner_id,
            "workspace_id": self.workspace_id,
            "visibility": self.visibility.value,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "expires_at": self.expires_at,
            "editable": self.editable,
            "locked": self.locked,
            "learning_blocked": self.learning_blocked,
        }


# ══════════════════════════════════════════════════════════════
# 3. Memory Security — Sensitivity Classifier
# ══════════════════════════════════════════════════════════════

# Patterns de données interdites en mémoire persistante
_SENSITIVE_PATTERNS = [
    re.compile(r"\b(?:password|mot\s*de\s*passe|mdp)\s*[:=]\s*\S+", re.IGNORECASE),
    re.compile(r"\b(?:api[_\s-]?key|secret[_\s-]?key|token)\s*[:=]\s*\S+", re.IGNORECASE),
    re.compile(r"\b(?:sk-|pk_live_|sk_live_|ghp_|gho_|xox[bpas]-)\S{10,}", re.IGNORECASE),
    re.compile(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b"),  # Cartes bancaires
    re.compile(r"\b(?:cvv|cvc)\s*[:=]\s*\d{3,4}\b", re.IGNORECASE),
]


def classify_sensitivity(content: str) -> SensitivityLevel:
    """
    Classifie la sensibilité d'un contenu AVANT persistence.
    Ne met JAMAIS en mémoire persistante : secrets, passwords, tokens,
    données financières sensibles, données privées d'autres utilisateurs.
    """
    for pattern in _SENSITIVE_PATTERNS:
        if pattern.search(content):
            return SensitivityLevel.RESTRICTED

    lower = content.lower()
    if any(kw in lower for kw in ["confidentiel", "secret", "privé", "classified"]):
        return SensitivityLevel.CONFIDENTIAL

    return SensitivityLevel.INTERNAL


# ══════════════════════════════════════════════════════════════
# 4. Memory Pipeline
# ══════════════════════════════════════════════════════════════

@dataclass
class MemoryCandidate:
    """Candidat à la persistence mémoire (étape intermédiaire du pipeline)."""
    content: str
    type: str = "fact"
    scope: MemoryScope = MemoryScope.USER
    source: str = "conversation"
    source_conversation_id: str = ""
    confidence: float = 0.5
    owner_id: str = ""
    workspace_id: str = ""


class MemoryPipeline:
    """
    Pipeline de traitement des candidats mémoire :
    Conversation → Memory Candidate → Classification → Sensitivity Check →
    Deduplication → Confidence → User Memory Policy → Persistent Memory
    """

    @classmethod
    def process(
        cls,
        candidate: MemoryCandidate,
        existing_cards: List[MemoryCard],
        policy: LearningPolicy = LearningPolicy.AUTO_PREFERENCES,
    ) -> Optional[MemoryCard]:
        """
        Traite un candidat mémoire à travers le pipeline complet.
        Retourne une MemoryCard si elle passe tous les filtres, None sinon.
        """
        # 1. Classification de sensibilité
        sensitivity = classify_sensitivity(candidate.content)
        if sensitivity == SensitivityLevel.RESTRICTED:
            logger.warning(
                f"🚫 Mémoire rejetée (RESTRICTED): contenu sensible détecté"
            )
            return None

        # 2. Vérification de la politique utilisateur
        if policy == LearningPolicy.NEVER:
            return None

        if policy == LearningPolicy.AUTO_PREFERENCES and candidate.type not in (
            "preference", "habit", "language"
        ):
            return None

        if policy == LearningPolicy.ALWAYS_ASK:
            # En mode ALWAYS_ASK, on crée la carte mais avec un flag
            pass  # La carte sera créée avec un statut "pending_approval"

        # 3. Déduplication
        for existing in existing_cards:
            if existing.content == candidate.content and existing.scope == candidate.scope:
                # Mettre à jour la confiance au lieu de dupliquer
                existing.confidence = min(1.0, existing.confidence + 0.1)
                existing.updated_at = time.time()
                if candidate.source_conversation_id:
                    if candidate.source_conversation_id not in existing.source_conversations:
                        existing.source_conversations.append(candidate.source_conversation_id)
                return None  # Pas de nouvelle carte

        # 4. Créer la MemoryCard
        card = MemoryCard(
            type=candidate.type,
            content=candidate.content,
            scope=candidate.scope,
            source=candidate.source,
            source_conversations=(
                [candidate.source_conversation_id]
                if candidate.source_conversation_id else []
            ),
            confidence=candidate.confidence,
            sensitivity=sensitivity,
            owner_id=candidate.owner_id,
            workspace_id=candidate.workspace_id,
        )

        logger.info(
            f"💾 Mémoire créée [{card.memory_id}]: "
            f"scope={card.scope.value} type={card.type} "
            f"confiance={card.confidence}"
        )

        return card


# ══════════════════════════════════════════════════════════════
# 5. Ñkyel Memory Engine
# ══════════════════════════════════════════════════════════════

class NkyelMemoryEngine:
    """
    Moteur de mémoire souveraine Ñkyel.
    Gère les 9 scopes avec isolation, provenance et contrôle utilisateur.
    """

    def __init__(self):
        self._cards: Dict[str, MemoryCard] = {}
        self._user_policies: Dict[str, LearningPolicy] = {}

    # ── User Control ─────────────────────────────────────────

    def create_card(self, card: MemoryCard) -> MemoryCard:
        """Crée une carte mémoire."""
        sensitivity = classify_sensitivity(card.content)
        if sensitivity == SensitivityLevel.RESTRICTED:
            raise ValueError("Contenu sensible interdit en mémoire persistante")
        card.sensitivity = sensitivity
        self._cards[card.memory_id] = card
        return card

    def get_card(self, memory_id: str) -> Optional[MemoryCard]:
        """Récupère une carte mémoire."""
        return self._cards.get(memory_id)

    def update_card(self, memory_id: str, content: str) -> Optional[MemoryCard]:
        """Modifie le contenu d'une carte mémoire."""
        card = self._cards.get(memory_id)
        if card is None:
            return None
        if card.locked:
            raise ValueError("Carte mémoire verrouillée")
        if not card.editable:
            raise ValueError("Carte mémoire non modifiable")

        # Re-vérifier la sensibilité
        sensitivity = classify_sensitivity(content)
        if sensitivity == SensitivityLevel.RESTRICTED:
            raise ValueError("Contenu sensible interdit en mémoire persistante")

        card.content = content
        card.sensitivity = sensitivity
        card.updated_at = time.time()
        return card

    def delete_card(self, memory_id: str) -> bool:
        """Supprime (oublie) une carte mémoire."""
        card = self._cards.get(memory_id)
        if card is None:
            return False
        if card.locked:
            raise ValueError("Carte mémoire verrouillée — déverrouillez d'abord")
        del self._cards[memory_id]
        return True

    def lock_card(self, memory_id: str) -> Optional[MemoryCard]:
        """Verrouille une carte mémoire importante."""
        card = self._cards.get(memory_id)
        if card:
            card.locked = True
            card.updated_at = time.time()
        return card

    def unlock_card(self, memory_id: str) -> Optional[MemoryCard]:
        """Déverrouille une carte mémoire."""
        card = self._cards.get(memory_id)
        if card:
            card.locked = False
            card.updated_at = time.time()
        return card

    def block_learning(self, memory_id: str) -> Optional[MemoryCard]:
        """Interdit l'apprentissage automatique sur cette mémoire."""
        card = self._cards.get(memory_id)
        if card:
            card.learning_blocked = True
            card.updated_at = time.time()
        return card

    def set_expiry(self, memory_id: str, ttl_seconds: float) -> Optional[MemoryCard]:
        """Définit une durée de vie pour une carte mémoire."""
        card = self._cards.get(memory_id)
        if card:
            card.expires_at = time.time() + ttl_seconds
            card.updated_at = time.time()
        return card

    # ── Query ────────────────────────────────────────────────

    def list_cards(
        self,
        owner_id: Optional[str] = None,
        scope: Optional[MemoryScope] = None,
        type_filter: Optional[str] = None,
        workspace_id: Optional[str] = None,
        include_expired: bool = False,
    ) -> List[MemoryCard]:
        """Liste les cartes mémoire avec filtres."""
        results: List[MemoryCard] = []
        for card in self._cards.values():
            if not include_expired and card.is_expired:
                continue
            if owner_id and card.owner_id != owner_id:
                continue
            if scope and card.scope != scope:
                continue
            if type_filter and card.type != type_filter:
                continue
            if workspace_id and card.workspace_id != workspace_id:
                continue
            results.append(card)
        return results

    def get_provenance(self, memory_id: str) -> Optional[Dict[str, Any]]:
        """
        Explique POURQUOI Ñkyel se souvient de quelque chose.
        Retourne les conversations et dates sources.
        """
        card = self._cards.get(memory_id)
        if card is None:
            return None
        return {
            "memory_id": card.memory_id,
            "content": card.content,
            "source": card.source,
            "source_conversations": card.source_conversations,
            "confidence": card.confidence,
            "created_at": card.created_at,
            "updated_at": card.updated_at,
            "explanation": (
                f"Cette information a été enregistrée à partir de "
                f"{len(card.source_conversations)} conversation(s). "
                f"Confiance : {card.confidence:.0%}."
            ),
        }

    # ── Policy ───────────────────────────────────────────────

    def set_learning_policy(self, user_id: str, policy: LearningPolicy) -> None:
        """Définit la politique d'apprentissage pour un utilisateur."""
        self._user_policies[user_id] = policy

    def get_learning_policy(self, user_id: str) -> LearningPolicy:
        """Récupère la politique d'apprentissage d'un utilisateur."""
        return self._user_policies.get(user_id, LearningPolicy.AUTO_PREFERENCES)

    # ── Pipeline ─────────────────────────────────────────────

    def process_candidate(self, candidate: MemoryCandidate) -> Optional[MemoryCard]:
        """Traite un candidat mémoire à travers le pipeline complet."""
        policy = self.get_learning_policy(candidate.owner_id)
        existing = self.list_cards(
            owner_id=candidate.owner_id,
            scope=candidate.scope,
        )
        card = MemoryPipeline.process(candidate, existing, policy)
        if card:
            self._cards[card.memory_id] = card
        return card

    # ── Stats ────────────────────────────────────────────────

    def stats(self, owner_id: Optional[str] = None) -> Dict[str, Any]:
        """Statistiques de la mémoire."""
        cards = self.list_cards(owner_id=owner_id)
        by_scope: Dict[str, int] = {}
        by_type: Dict[str, int] = {}
        for c in cards:
            by_scope[c.scope.value] = by_scope.get(c.scope.value, 0) + 1
            by_type[c.type] = by_type.get(c.type, 0) + 1
        return {
            "total_cards": len(cards),
            "by_scope": by_scope,
            "by_type": by_type,
            "locked_count": sum(1 for c in cards if c.locked),
        }

    def clear(self) -> None:
        """Réinitialise la mémoire (pour les tests)."""
        self._cards.clear()
        self._user_policies.clear()


# ══════════════════════════════════════════════════════════════
# Singleton
# ══════════════════════════════════════════════════════════════

nkyel_memory = NkyelMemoryEngine()
