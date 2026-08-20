"""
Ñkyel AI — Security Middleware
Production-ready security headers and CORS configuration.

Fondateur : Daniel Jonathan ANDJ
"""

import os
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware


def add_security_headers(app: FastAPI) -> None:
    """Add security headers middleware for production."""

    is_production = os.getenv("NKYEL_ENV", "development") == "production"

    # CORS — restricted in production
    if is_production:
        allowed_origins = [
            os.getenv("NKYEL_FRONTEND_URL", "https://nkyel.ai"),
        ]
    else:
        allowed_origins = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def security_headers(request: Request, call_next):
        response: Response = await call_next(request)

        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        if is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "connect-src 'self' https://api.nkyel.ai; "
                "font-src 'self' https://fonts.gstatic.com"
            )

        return response
