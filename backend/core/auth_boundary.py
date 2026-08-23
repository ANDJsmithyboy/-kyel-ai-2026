"""
Ñkyel AI — Auth Boundary & Identity Provider · SmartANDJ AI Technologies
Frontière d'authentification et d'autorisation souveraine.

Principes :
1. "Clerk authentifie, Ñkyel autorise"
2. Clé primaire universelle = ID interne Ñkyel (UUID), JAMAIS l'ID Clerk
3. Abstraction IdentityProvider (ClerkAdapter aujourd'hui, multi-idp possible demain)
4. Contextes de sécurité : permissions, rôles (Owner, Admin, Member, Viewer, Agent)

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import os
import uuid
import logging
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List, Set
from enum import Enum
from dataclasses import dataclass, field

from core.config import settings
from core.errors import auth_error, forbidden

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# 1. Roles & Permissions Model
# ══════════════════════════════════════════════════════════════

class NkyelRole(str, Enum):
    """Rôles internes au sein d'un workspace ou d'une organisation."""
    FOUNDER = "founder"          # Daniel Jonathan ANDJ (SuperAdmin)
    ORG_ADMIN = "org_admin"      # Administrateur d'organisation
    WORKSPACE_LEAD = "ws_lead"   # Chef de projet / Lead workspace
    MEMBER = "member"            # Utilisateur standard
    VIEWER = "viewer"            # Accès lecture seule
    AGENT_ACTOR = "agent"        # Agent autonome délégué


class NkyelPermission(str, Enum):
    """Permissions granulaires de sécurité."""
    # Missions
    MISSION_CREATE = "mission:create"
    MISSION_READ = "mission:read"
    MISSION_CANCEL = "mission:cancel"
    MISSION_APPROVE = "mission:approve"
    MISSION_DELETE = "mission:delete"

    # Tools & Sandbox
    TOOL_EXECUTE = "tool:execute"
    TOOL_APPROVE_HIGH_RISK = "tool:approve_high_risk"
    SANDBOX_SPAWN = "sandbox:spawn"
    SANDBOX_NETWORK_ACCESS = "sandbox:network"

    # Multi-Agent
    SUBAGENT_DELEGATE = "subagent:delegate"
    WIDE_RESEARCH_LAUNCH = "wide_research:launch"

    # Workspace & Billing
    WORKSPACE_MANAGE = "workspace:manage"
    BUDGET_OVERRIDE = "budget:override"
    SECRETS_MANAGE = "secrets:manage"


# Rôles → Permissions par défaut
_ROLE_PERMISSIONS: Dict[NkyelRole, Set[NkyelPermission]] = {
    NkyelRole.FOUNDER: set(NkyelPermission),  # Toutes les permissions
    NkyelRole.ORG_ADMIN: {
        NkyelPermission.MISSION_CREATE,
        NkyelPermission.MISSION_READ,
        NkyelPermission.MISSION_CANCEL,
        NkyelPermission.MISSION_APPROVE,
        NkyelPermission.MISSION_DELETE,
        NkyelPermission.TOOL_EXECUTE,
        NkyelPermission.TOOL_APPROVE_HIGH_RISK,
        NkyelPermission.SANDBOX_SPAWN,
        NkyelPermission.SANDBOX_NETWORK_ACCESS,
        NkyelPermission.SUBAGENT_DELEGATE,
        NkyelPermission.WIDE_RESEARCH_LAUNCH,
        NkyelPermission.WORKSPACE_MANAGE,
        NkyelPermission.BUDGET_OVERRIDE,
        NkyelPermission.SECRETS_MANAGE,
    },
    NkyelRole.WORKSPACE_LEAD: {
        NkyelPermission.MISSION_CREATE,
        NkyelPermission.MISSION_READ,
        NkyelPermission.MISSION_CANCEL,
        NkyelPermission.MISSION_APPROVE,
        NkyelPermission.TOOL_EXECUTE,
        NkyelPermission.SANDBOX_SPAWN,
        NkyelPermission.SUBAGENT_DELEGATE,
        NkyelPermission.WIDE_RESEARCH_LAUNCH,
    },
    NkyelRole.MEMBER: {
        NkyelPermission.MISSION_CREATE,
        NkyelPermission.MISSION_READ,
        NkyelPermission.MISSION_CANCEL,
        NkyelPermission.TOOL_EXECUTE,
        NkyelPermission.SANDBOX_SPAWN,
    },
    NkyelRole.VIEWER: {
        NkyelPermission.MISSION_READ,
    },
    NkyelRole.AGENT_ACTOR: {
        NkyelPermission.TOOL_EXECUTE,
        NkyelPermission.SUBAGENT_DELEGATE,
        NkyelPermission.SANDBOX_SPAWN,
    },
}


# ══════════════════════════════════════════════════════════════
# 2. Authenticated Identity & Authorization Context
# ══════════════════════════════════════════════════════════════

@dataclass
class NkyelIdentity:
    """
    Identité utilisateur interne Ñkyel.
    Isolée des détails spécifiques de Clerk ou de tout IdP externe.
    """
    nkyel_user_id: str                      # UUID interne Ñkyel (toujours la PK)
    email: str
    full_name: str
    idp_provider: str = "clerk"             # "clerk", "internal", "sso"
    idp_user_id: str = ""                   # sub de Clerk (ex: user_2xY...)
    is_founder: bool = False
    tier: str = "pioneer"                   # "free", "pioneer", "pro", "enterprise"
    credits: int = 1000
    created_at: float = field(default_factory=lambda: 0.0)


@dataclass
class AuthorizationContext:
    """
    Contexte d'autorisation évalué pour une action donnée dans un workspace.
    """
    identity: NkyelIdentity
    organization_id: Optional[str] = None
    workspace_id: Optional[str] = None
    role: NkyelRole = NkyelRole.MEMBER
    custom_permissions: Set[NkyelPermission] = field(default_factory=set)

    def has_permission(self, permission: NkyelPermission) -> bool:
        """Vérifie si l'utilisateur possède la permission requise."""
        if self.identity.is_founder:
            return True
        role_perms = _ROLE_PERMISSIONS.get(self.role, set())
        return permission in role_perms or permission in self.custom_permissions

    def require(self, permission: NkyelPermission, action_name: str = "") -> None:
        """Lève forbidden si la permission n'est pas accordée."""
        if not self.has_permission(permission):
            act = f" pour l'action '{action_name}'" if action_name else ""
            raise forbidden(
                f"Permission refusée{act} (requiert {permission.value})"
            )


# ══════════════════════════════════════════════════════════════
# 3. Identity Provider Interface & Clerk Adapter
# ══════════════════════════════════════════════════════════════

class IdentityProvider(ABC):
    """Contrat abstrait d'authentification pour éviter tout lock-in Clerk."""

    @abstractmethod
    async def verify_token_and_get_identity(self, token: str) -> Optional[NkyelIdentity]:
        """Vérifie un jeton d'authentification et résout l'identité interne Ñkyel."""
        pass


class ClerkAdapter(IdentityProvider):
    """
    Adaptateur Clerk utilisant JWKS RS256 pour vérifier les sessions Clerk
    et résoudre les utilisateurs dans Neon PostgreSQL sans faire de Clerk la PK.
    """

    async def verify_token_and_get_identity(self, token: str) -> Optional[NkyelIdentity]:
        if not token:
            return None

        # Mode Démo / Debug rapide
        if token in ("demo", "test", "demo-token-nkyel") or settings.debug:
            return NkyelIdentity(
                nkyel_user_id="usr_founder_001",
                email="founder@nkyel.ai",
                full_name="Daniel Jonathan ANDJ",
                idp_provider="internal",
                idp_user_id="founder_clerk_demo",
                is_founder=True,
                tier="founder",
                credits=999999,
            )

        try:
            from core.security import _get_signing_key
            import jwt
            public_key = await _get_signing_key(token)
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                options={"verify_aud": False},
            )
            clerk_user_id = payload.get("sub")
            if not clerk_user_id:
                return None

            # Résoudre dans Neon pour obtenir le nkyel_user_id interne
            from core.database import get_user_by_clerk_id
            db_user = await get_user_by_clerk_id(clerk_user_id)
            if db_user:
                return NkyelIdentity(
                    nkyel_user_id=str(db_user["id"]),
                    email=db_user.get("email", ""),
                    full_name=db_user.get("full_name", "Utilisateur Ñkyel"),
                    idp_provider="clerk",
                    idp_user_id=clerk_user_id,
                    is_founder=db_user.get("is_admin", False),
                    tier=db_user.get("tier", "pioneer"),
                    credits=db_user.get("credits", 100),
                )

            # Si l'utilisateur n'est pas encore synchronisé dans Neon, créer un profil transitoire
            return NkyelIdentity(
                nkyel_user_id=f"usr_{uuid.uuid5(uuid.NAMESPACE_DNS, clerk_user_id).hex[:12]}",
                email=payload.get("email", ""),
                full_name=payload.get("name", "Pionnier Ñkyel"),
                idp_provider="clerk",
                idp_user_id=clerk_user_id,
            )
        except Exception as e:
            logger.warning(f"Échec de validation JWT Clerk: {e}")
            return None


# ══════════════════════════════════════════════════════════════
# 4. Auth Boundary Service (Singleton)
# ══════════════════════════════════════════════════════════════

class AuthBoundary:
    """
    Gestionnaire central d'authentification et d'autorisation.
    Reçoit un token, extrait l'identité et construit l'AuthorizationContext.
    """

    def __init__(self, provider: Optional[IdentityProvider] = None):
        self._provider = provider or ClerkAdapter()

    async def authenticate(self, token: str) -> NkyelIdentity:
        """Authentifie un token et retourne l'identité interne."""
        identity = await self._provider.verify_token_and_get_identity(token)
        if not identity:
            raise auth_error("Session invalide ou expirée")
        return identity

    def authorize(
        self,
        identity: NkyelIdentity,
        organization_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        role: NkyelRole = NkyelRole.MEMBER,
    ) -> AuthorizationContext:
        """Construit le contexte d'autorisation avec permissions."""
        if identity.is_founder:
            role = NkyelRole.FOUNDER
        return AuthorizationContext(
            identity=identity,
            organization_id=organization_id,
            workspace_id=workspace_id,
            role=role,
        )


# Singleton
auth_boundary = AuthBoundary()
