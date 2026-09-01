"""
Ñkyel AI · Clerk JWT Auth Middleware
Vérifie les tokens Clerk pour sécuriser les endpoints en s'appuyant sur core.security.
"""

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from core.security import get_current_user, _verify_clerk_token, security_scheme
from app.config import settings

security = security_scheme

__all__ = ["get_current_user", "security", "_verify_clerk_token"]

