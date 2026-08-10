"""
GabomaGPT — Backend DEV (Simplifié pour démo locale)
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
Mode développement — Pas de DB externe requise
Frontend + Backend servis depuis ce serveur
"""

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime
import os
from pathlib import Path
import httpx
import asyncio

# ── Chemins ──────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_BUILD = BASE_DIR / "apps" / "web" / "build"
FRONTEND_STATIC = BASE_DIR / "apps" / "web" / "static"

# ── Application FastAPI ──────────────────────────────────────
app = FastAPI(
    title="GabomaGPT API",
    description="Backend API + Frontend - Développement Local",
    version="1.0.0"
)

# ── CORS Middleware ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ───────────────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = "gpt-4o-mini"

class Model(BaseModel):
    id: str
    name: str
    provider: str

class Config(BaseModel):
    app_name: str
    version: str

# ── In-Memory Store ──────────────────────────────────────────
MOCK_MODELS = [
    Model(id="gpt-4o-mini", name="GabomaGPT Flash Pro", provider="groq"),
    Model(id="llama-3.1-70b", name="GabomaGPT Élite", provider="groq"),
    Model(id="mixtral-8x7b", name="GabomaGPT Panthère", provider="groq"),
]

CURRENT_USER = {
    "id": "user_001",
    "name": "Daniel Jonathan ANDJ",
    "role": "admin",
    "email": "daniel@smartandj.ai"
}

# ── API Endpoints ────────────────────────────────────────────

@app.get("/api/config")
async def get_config():
    """Get backend configuration"""
    return {
        "status": "ok",
        "app_name": "GabomaGPT",
        "version": "1.0.0",
        "mode": "development",
        "backend_version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/models")
async def get_models():
    """List available models"""
    return {
        "data": [
            {
                "id": m.id,
                "name": m.name,
                "object": "model",
                "created": 1234567890,
                "owned_by": m.provider,
                "permission": [],
                "root": None,
                "parent": None
            }
            for m in MOCK_MODELS
        ]
    }

@app.get("/api/auth/user")
async def get_user():
    """Get current user"""
    return CURRENT_USER

@app.post("/api/auth/login")
async def login(username: str, password: str):
    """Mock login endpoint"""
    return {
        "success": True,
        "user": CURRENT_USER,
        "token": "mock_jwt_token_dev_mode"
    }

@app.get("/api/chats")
async def get_chats():
    """Get user's chats"""
    return {
        "data": []
    }

@app.post("/api/chat/completions")
async def chat_completion(request: ChatRequest):
    """Mock chat completion endpoint"""
    return {
        "id": "chatcmpl-001",
        "object": "text_completion.chunk",
        "created": int(datetime.now().timestamp()),
        "model": request.model or "gpt-4o-mini",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": f"[GabomaGPT - Mode Développement] Vous avez envoyé: {request.messages[-1].content if request.messages else 'message vide'}"
                },
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": 10,
            "completion_tokens": 20,
            "total_tokens": 30
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

# ── Servir les fichiers statiques ──────────────────────────────
if FRONTEND_STATIC.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_STATIC)), name="static")

# ── Servir root / en tant que SPA ──────────────────────────────
@app.get("/")
async def serve_root():
    """Serve root - redirige vers le frontend dev"""
    return RedirectResponse(url="http://localhost:5175/", status_code=307)

# ── Servir le frontend SPA ─────────────────────────────────────
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve SPA - redirige les paths non-API vers frontend dev"""
    # Ignorer les chemins API, docs, etc
    if any(full_path.startswith(prefix) for prefix in ["api/", "docs", "openapi.json", "swagger", "redoc"]):
        return JSONResponse({"error": "Not found"}, status_code=404)
    
    # Rediriger les autres requêtes vers le frontend dev
    return RedirectResponse(url=f"http://localhost:5175/{full_path}", status_code=307)


if __name__ == "__main__":
    import uvicorn
    print("""
    ╔════════════════════════════════════════════════════════════════╗
    ║                  GabomaGPT Backend - DEV MODE                  ║
    ║              SmartANDJ AI Technologies · Gabon 🇬🇦            ║
    ║                                                                ║
    ║  🚀 Server starting on http://localhost:8000                  ║
    ║  📚 Docs:      http://localhost:8000/docs                     ║
    ║  🔌 API:       http://localhost:8000/api/models               ║
    ║  ⚙️  Status:     http://localhost:8000/health                 ║
    ║                                                                ║
    ║  Note: Development mode without external database              ║
    ║        Chat persistence not available                          ║
    ╚════════════════════════════════════════════════════════════════╝
    """)
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
