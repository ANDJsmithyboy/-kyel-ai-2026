"""
Ñkyel AI — API v1 Admin Command Center Endpoints
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Fournit l'API REST d'administration pour gouverner Ñkyel en temps réel :
- Vue d'ensemble, santé, télémétrie & coûts
- Gestion des 38 Fournisseurs & Modèles (Masquage SecretManager)
- Routage déclaratif des capacités d'IA
- Outils (Tools) & Skills (DeerFlow) avec versionnage et tests
- Connecteurs MCP & Auto-Discovery
- Inbox Feedbacks & Journal des Bugs (Traces / Sentry)
- Feature Flags & Configuration Système (Mode Maintenance)
- Journal d'Audit Immuable (Audit Logs)
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from core.security import require_admin
from services.admin_command_center import AdminCommandCenterService

router = APIRouter(prefix="/v1/admin", tags=["Admin Command Center v1"])


# ── SCHEMAS ──────────────────────────────────────────────────
class ProviderUpdateRequest(BaseModel):
    is_enabled: bool = True
    api_key: Optional[str] = None


class ToolSaveRequest(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    version: str = "v1.0"
    type: str = "native"
    status: str = "enabled"
    permissions: str = "everyone"


class SkillSaveRequest(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    version: str = "v1"
    status: str = "published"
    instructions: str
    required_tools: List[str] = Field(default_factory=list)
    model_policy: str = "gemini-3.1-pro"


class McpSaveRequest(BaseModel):
    id: Optional[str] = None
    name: str
    endpoint: str
    transport: str = "sse"
    status: str = "connected"


class FeedbackStatusRequest(BaseModel):
    status: str


class FeatureFlagUpdateRequest(BaseModel):
    enabled: bool
    scope: str = "everyone"
    rollout_pct: int = 100


class SystemSettingsUpdateRequest(BaseModel):
    maintenance_mode: Optional[bool] = None
    maintenance_message: Optional[str] = None
    default_model_policy: Optional[str] = None
    max_tokens_per_run: Optional[int] = None
    free_tier_daily_credits: Optional[int] = None
    pro_tier_daily_credits: Optional[int] = None


# ── ENDPOINTS ────────────────────────────────────────────────

@router.get("/overview")
async def get_overview(user: dict = Depends(require_admin)):
    """Vue d'ensemble de la santé, des métriques et des coûts de Ñkyel."""
    return AdminCommandCenterService.get_system_overview()


@router.get("/providers")
async def get_providers(user: dict = Depends(require_admin)):
    """Liste des fournisseurs d'IA configurés avec masquage strict des clés."""
    return AdminCommandCenterService.get_providers_management()


@router.post("/providers/{provider_id}")
async def update_provider(
    provider_id: str,
    body: ProviderUpdateRequest,
    user: dict = Depends(require_admin),
):
    """Activer, désactiver ou mettre à jour un fournisseur d'IA."""
    actor = user.get("email", "admin@nkyel.ai")
    try:
        return AdminCommandCenterService.update_provider(
            provider_id=provider_id,
            is_enabled=body.is_enabled,
            api_key=body.api_key,
            actor=actor,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/models")
async def get_models(user: dict = Depends(require_admin)):
    """Liste de tous les modèles d'IA connus avec fenêtres de contexte et pricing."""
    return AdminCommandCenterService.get_models_list()


@router.get("/routing")
async def get_routing(user: dict = Depends(require_admin)):
    """Matrice ordonnée des résolutions de capacités du Model Router."""
    return AdminCommandCenterService.get_routing_matrix()


@router.get("/tools")
async def get_tools(user: dict = Depends(require_admin)):
    """Liste de tous les outils (Tools) disponibles."""
    return AdminCommandCenterService.get_tools_list()


@router.post("/tools")
async def save_tool(body: ToolSaveRequest, user: dict = Depends(require_admin)):
    """Créer ou mettre à jour un outil."""
    actor = user.get("email", "admin@nkyel.ai")
    return AdminCommandCenterService.save_tool(body.model_dump(), actor)


@router.get("/skills")
async def get_skills(user: dict = Depends(require_admin)):
    """Liste des compétences (Skills) DeerFlow versionnées."""
    return AdminCommandCenterService.get_skills_list()


@router.post("/skills")
async def save_skill(body: SkillSaveRequest, user: dict = Depends(require_admin)):
    """Créer, mettre à jour ou publier une compétence (Skill)."""
    actor = user.get("email", "admin@nkyel.ai")
    return AdminCommandCenterService.save_skill(body.model_dump(), actor)


@router.get("/mcp")
async def get_mcp(user: dict = Depends(require_admin)):
    """Liste des serveurs MCP connectés."""
    return AdminCommandCenterService.get_mcp_servers()


@router.post("/mcp")
async def save_mcp(body: McpSaveRequest, user: dict = Depends(require_admin)):
    """Enregistrer et connecter un serveur MCP."""
    actor = user.get("email", "admin@nkyel.ai")
    return AdminCommandCenterService.save_mcp_server(body.model_dump(), actor)


@router.get("/feedback")
async def get_feedback(user: dict = Depends(require_admin)):
    """Inbox des retours utilisateurs de la bêta."""
    return AdminCommandCenterService.get_feedbacks_list()


@router.post("/feedback/{feedback_id}/status")
async def update_feedback_status(
    feedback_id: str,
    body: FeedbackStatusRequest,
    user: dict = Depends(require_admin),
):
    """Mettre à jour le statut d'un feedback (TRIAGED, IN_PROGRESS, RESOLVED)."""
    actor = user.get("email", "admin@nkyel.ai")
    try:
        return AdminCommandCenterService.update_feedback_status(feedback_id, body.status, actor)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/bugs")
async def get_bugs(user: dict = Depends(require_admin)):
    """Centre des erreurs runtime et corrélations Sentry / Traces."""
    return AdminCommandCenterService.get_bugs_list()


@router.get("/feature-flags")
async def get_feature_flags(user: dict = Depends(require_admin)):
    """Liste des drapeaux de fonctionnalités (Feature Flags)."""
    return AdminCommandCenterService.get_feature_flags()


@router.post("/feature-flags/{flag_id}")
async def update_feature_flag(
    flag_id: str,
    body: FeatureFlagUpdateRequest,
    user: dict = Depends(require_admin),
):
    """Mettre à jour un Feature Flag."""
    actor = user.get("email", "admin@nkyel.ai")
    try:
        return AdminCommandCenterService.update_feature_flag(
            flag_id, body.enabled, body.scope, body.rollout_pct, actor
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/settings")
async def get_settings(user: dict = Depends(require_admin)):
    """Paramètres système et configuration globale de production."""
    return AdminCommandCenterService.get_system_settings()


@router.post("/settings")
async def update_settings(
    body: SystemSettingsUpdateRequest,
    user: dict = Depends(require_admin),
):
    """Mettre à jour la configuration système (ex. mode maintenance)."""
    actor = user.get("email", "admin@nkyel.ai")
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    return AdminCommandCenterService.update_system_settings(payload, actor)


@router.get("/audit-logs")
async def get_audit_logs(user: dict = Depends(require_admin)):
    """Journal d'audit immuable des actions d'administration."""
    return AdminCommandCenterService.get_audit_logs()
