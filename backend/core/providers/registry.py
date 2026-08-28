"""
Ñkyel AI — Provider Registry
Abstractions for managing multiple AI providers, health states, and rate limits.
"""

from enum import Enum
from typing import Dict, Optional, Any, List
from datetime import datetime, timezone

class ProviderType(str, Enum):
    GROQ = "GROQ"
    GEMINI = "GEMINI"
    RUNPOD = "RUNPOD"
    FAL = "FAL"
    RUNWAY = "RUNWAY"
    TAVILY = "TAVILY"

class ProviderHealthStatus(str, Enum):
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    THROTTLED = "THROTTLED"
    EXHAUSTED = "EXHAUSTED"
    DISABLED = "DISABLED"
    ERROR = "ERROR"

class ProviderAccount:
    """In-memory representation of a provider account, matching the DB model."""
    def __init__(self, id: str, provider_type: ProviderType, display_name: str, 
                 credential_ref: str, priority: int = 10, capabilities: List[str] = None):
        self.id = id
        self.provider_type = provider_type
        self.display_name = display_name
        self.credential_ref = credential_ref
        self.priority = priority
        self.capabilities = capabilities or []
        self.health_status = ProviderHealthStatus.HEALTHY
        self.rate_state: Dict[str, Any] = {}
        self.budget_state: Dict[str, float] = {}
        self.last_success_at: Optional[datetime] = None
        self.last_error_at: Optional[datetime] = None
        self.last_429_at: Optional[datetime] = None
        self.cooldown_until: Optional[datetime] = None

    def update_rate_limit(self, headers: dict):
        """Parse standard rate limit headers (e.g., from Groq)."""
        if not headers:
            return
            
        remaining_reqs = headers.get("x-ratelimit-remaining-requests")
        remaining_tokens = headers.get("x-ratelimit-remaining-tokens")
        retry_after = headers.get("retry-after")
        
        if remaining_reqs is not None:
            self.rate_state["remaining_requests"] = int(remaining_reqs)
        if remaining_tokens is not None:
            self.rate_state["remaining_tokens"] = int(remaining_tokens)
            
        if retry_after:
            from datetime import timedelta
            self.cooldown_until = datetime.now(timezone.utc) + timedelta(seconds=float(retry_after))
            self.health_status = ProviderHealthStatus.THROTTLED

    def is_healthy_and_ready(self) -> bool:
        if self.health_status in [ProviderHealthStatus.DISABLED, ProviderHealthStatus.EXHAUSTED]:
            return False
            
        if self.cooldown_until and self.cooldown_until > datetime.now(timezone.utc):
            return False
            
        return True

class ProviderRegistry:
    """Global registry to manage and select providers dynamically."""
    _accounts: Dict[str, ProviderAccount] = {}

    @classmethod
    def load_from_db(cls, db_session):
        # In a real run, this fetches from the `provider_accounts` table
        pass

    @classmethod
    def get_eligible_accounts(cls, provider_type: ProviderType = None, required_capability: str = None) -> List[ProviderAccount]:
        eligible = []
        for acc in cls._accounts.values():
            if provider_type and acc.provider_type != provider_type:
                continue
            if required_capability and required_capability not in acc.capabilities:
                continue
            if acc.is_healthy_and_ready():
                eligible.append(acc)
                
        # Sort by priority (lower is better) and then remaining capacity if available
        eligible.sort(key=lambda a: (a.priority, -a.rate_state.get("remaining_tokens", 0)))
        return eligible
