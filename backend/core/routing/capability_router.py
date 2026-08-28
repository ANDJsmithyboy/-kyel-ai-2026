"""
Ñkyel AI — Capability Router
Selects the best AI model/provider route based on capabilities, priority, context size, and provider health.
"""

from typing import Dict, Any, Optional
from core.providers.registry import ProviderRegistry, ProviderType, ProviderAccount

class CapabilityRouter:
    @staticmethod
    def route_request(capability: str, tier: str, mission_priority: int, estimated_tokens: int, quality_requirement: str = "balanced") -> Optional[ProviderAccount]:
        """
        Determines the optimal provider and model for a given request.
        
        Args:
            capability (str): e.g., "HEAVY_REASONING", "CODING", "FAST_SUBAGENT"
            tier (str): e.g., "FOUNDER", "PUBLIC_BETA"
            mission_priority (int): 0 is highest, 50 is lowest.
            estimated_tokens (int): Required context size.
            quality_requirement (str): "high", "balanced", "economical"
            
        Returns:
            ProviderAccount: The selected provider account or None if exhausted.
        """
        # 1. Fetch eligible providers that offer this capability
        eligible_providers = ProviderRegistry.get_eligible_accounts(required_capability=capability)
        
        if not eligible_providers:
            # Fallback logic: if no direct capability match, try emergency fallback (e.g. RunPod Text)
            return CapabilityRouter._get_emergency_fallback(mission_priority)
            
        # 2. Filter by context size constraints if needed (mocked here, would check model config)
        
        # 3. Apply Priority & Tier logic
        if mission_priority <= 20:
            # Founder, Presidential, Google Reviewer -> Allowed to use higher quality routes earlier
            # Prefer GEMINI or top-tier GROQ
            eligible_providers.sort(key=lambda p: (p.priority, 0 if p.provider_type == ProviderType.GEMINI else 1))
        elif tier == "PUBLIC_BETA":
            # Public Beta -> Prefer economical fast routes
            # Protect high-capacity routes for reviewers
            eligible_providers.sort(key=lambda p: (-p.priority, 1 if p.provider_type == ProviderType.GROQ else 2))
        
        # 4. Return the best match
        return eligible_providers[0] if eligible_providers else None
        
    @staticmethod
    def _get_emergency_fallback(priority: int) -> Optional[ProviderAccount]:
        """Emergency fallback to RunPod Text (e.g., Qwen3 32B) if primary APIs are throttled."""
        fallbacks = ProviderRegistry.get_eligible_accounts(provider_type=ProviderType.RUNPOD, required_capability="TEXT_FALLBACK")
        if fallbacks:
            return fallbacks[0]
        return None
