"""
Ñkyel AI — Admin Provider Registry & Capability Matrix API
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Gestion sécurisée des fournisseurs d'IA pour les administrateurs :
- Consultation des métriques de santé (latence, taux d'erreurs, TTFT)
- Activation / désactivation dynamique de fournisseurs sans redémarrage
- Matrice de capacités par fournisseur (Chat, Vision, Code, Embed, STT, TTS)
- SÉCURITÉ ABSOLUE : Zéro clé API exposée en clair
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from core.security import require_admin
from services.model_gateway import (
    GLOBAL_PROVIDER_REGISTRY,
    MODEL_REGISTRY,
    ModelProvider,
    ProviderStatus,
    ProviderRegion,
    ModelCapability,
    circuit_breaker,
    gateway_metrics,
)

router = APIRouter(prefix="/v1/admin/providers", tags=["Admin Providers"])


class ProviderAdminResponse(BaseModel):
    id: str
    name: str
    region: str
    status: str
    enabled: bool
    is_configured: bool
    capabilities: List[str]
    supported_models_count: int
    models: List[str]
    avg_latency_ms: int
    error_rate: float
    circuit_state: str
    is_openai_compatible: bool
    notes: Optional[str] = None


class ToggleProviderRequest(BaseModel):
    enabled: bool


@router.get("", response_model=List[ProviderAdminResponse])
async def list_providers(user: dict = Depends(require_admin)):
    """
    Liste sécurisée de tous les fournisseurs du registre mondial.
    Accessible uniquement aux administrateurs (Daniel ANDJ).
    AUCUNE clé API n'est exposée.
    """
    circuit_status = circuit_breaker.status()
    result = []

    for provider_enum, meta in GLOBAL_PROVIDER_REGISTRY.items():
        cb = circuit_status.get(provider_enum.value, {})
        c_state = cb.get("state", "closed")
        
        # Déterminer les modèles associés
        models = [m.id for m in MODEL_REGISTRY if m.provider == provider_enum]
        
        # Déterminer le statut effectif
        effective_status = meta.status.value
        if not meta.enabled:
            effective_status = ProviderStatus.DISABLED.value
        elif c_state == "open":
            effective_status = ProviderStatus.UNAVAILABLE.value
        elif meta.is_configured():
            effective_status = ProviderStatus.CONFIGURED.value

        result.append(ProviderAdminResponse(
            id=provider_enum.value,
            name=meta.name,
            region=meta.region.value,
            status=effective_status,
            enabled=meta.enabled,
            is_configured=meta.is_configured(),
            capabilities=[c.value for c in meta.capabilities],
            supported_models_count=len(models) or len(meta.supported_models),
            models=models or meta.supported_models,
            avg_latency_ms=meta.avg_latency_ms,
            error_rate=meta.error_rate,
            circuit_state=c_state,
            is_openai_compatible=meta.is_openai_compatible,
            notes=meta.notes,
        ))

    return result


@router.post("/{provider_id}/toggle")
async def toggle_provider(
    provider_id: str,
    req: ToggleProviderRequest,
    user: dict = Depends(require_admin),
):
    """Active ou désactive dynamiquement un fournisseur mondial."""
    try:
        provider_enum = ModelProvider(provider_id)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Fournisseur {provider_id} introuvable")

    meta = GLOBAL_PROVIDER_REGISTRY.get(provider_enum)
    if not meta:
        raise HTTPException(status_code=404, detail="Métadonnées fournisseur introuvables")

    meta.enabled = req.enabled
    return {
        "success": True,
        "provider_id": provider_id,
        "enabled": meta.enabled,
        "message": f"Fournisseur {meta.name} {'activé' if meta.enabled else 'désactivé'} avec succès",
    }


@router.get("/matrix")
async def get_capability_matrix(user: dict = Depends(require_admin)):
    """
    Matrice dynamique des capacités par fournisseur mondial.
    Générée dynamiquement depuis le Provider Registry.
    """
    matrix = []
    for provider_enum, meta in GLOBAL_PROVIDER_REGISTRY.items():
        caps_set = {c.value for c in meta.capabilities}
        models = [m.id for m in MODEL_REGISTRY if m.provider == provider_enum]
        
        matrix.append({
            "provider_id": provider_enum.value,
            "provider_name": meta.name,
            "region": meta.region.value,
            "enabled": meta.enabled,
            "models_count": len(models) or len(meta.supported_models),
            "chat": bool({"FAST", "BALANCED", "DEEP", "REASONING"} & caps_set),
            "vision": "VISION" in caps_set,
            "code": "CODE" in caps_set,
            "embed": "EMBEDDING" in caps_set,
            "research": bool({"RESEARCH", "LONG_CONTEXT"} & caps_set),
            "multilingual": "MULTILINGUAL" in caps_set,
            "african_languages": "AFRICAN_LANGUAGES" in caps_set,
            "stt": "STT" in caps_set,
            "tts": "TTS" in caps_set,
            "sovereign": bool({"SOVEREIGN", "LOCAL", "PRIVATE"} & caps_set),
        })

    return {
        "matrix": matrix,
        "total_providers": len(matrix),
        "gateway_metrics": gateway_metrics.summary(),
    }
