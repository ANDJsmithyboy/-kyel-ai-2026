"""
Ñkyel AI — Media Router
Selects the best provider for image and video generation based on beta budget constraints and user priority.
"""

from typing import Dict, Any, Optional, Tuple
from core.providers.registry import ProviderRegistry, ProviderType, ProviderAccount

class MediaRouter:
    @staticmethod
    def route_image(tier: str, priority: int) -> Tuple[Optional[ProviderAccount], str]:
        """
        Route image generation.
        Returns:
            (ProviderAccount, model_id)
        """
        # Public Beta defaults to RunPod Flux Schnell (Economical)
        # Higher priority can use fal.ai if configured
        
        if priority <= 20: # Founder, Presidential, Google
            fal_providers = ProviderRegistry.get_eligible_accounts(provider_type=ProviderType.FAL)
            if fal_providers:
                return fal_providers[0], "fal-ai/flux-pro"
                
        # Default RunPod route
        runpod_providers = ProviderRegistry.get_eligible_accounts(provider_type=ProviderType.RUNPOD, required_capability="IMAGE_GEN")
        if runpod_providers:
            return runpod_providers[0], "flux-schnell"
            
        return None, ""

    @staticmethod
    def route_video(tier: str, priority: int, quality_preference: str = "draft") -> Tuple[Optional[ProviderAccount], str, str]:
        """
        Route video generation.
        Returns:
            (ProviderAccount, model_id, resolution_profile)
        """
        # 1. Check if Runway API is available AND Funded
        # The prompt explicitly warns that Runway Web App credits don't count here.
        runway_providers = ProviderRegistry.get_eligible_accounts(provider_type=ProviderType.RUNWAY)
        if runway_providers and priority <= 10: # Only Founders / Presidential get Runway API if it exists
            return runway_providers[0], "gen3-alpha", "standard"
            
        # 2. fal.ai for high-quality fallback if allowed by budget
        if priority <= 20 and quality_preference == "standard":
            fal_providers = ProviderRegistry.get_eligible_accounts(provider_type=ProviderType.FAL)
            if fal_providers:
                return fal_providers[0], "fal-ai/kling-video", "standard"
                
        # 3. Default Public Beta Economical Route (RunPod Pruna)
        runpod_providers = ProviderRegistry.get_eligible_accounts(provider_type=ProviderType.RUNPOD, required_capability="VIDEO_GEN")
        if runpod_providers:
            return runpod_providers[0], "pruna-video", "720p_draft"
            
        return None, "", ""
