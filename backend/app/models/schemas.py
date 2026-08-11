"""
Ñkyel AI · Pydantic Schemas
Modèles de données pour les requêtes et réponses API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from enum import Enum


class ModelId(str, Enum):
    AURATA = "aurata"
    NKYEL = "nkyel"
    ONYXGRIS = "onyxgris"
    WANDANA = "wandana"
    BLACK_PANTHER = "black-panther"


# ── Chat ──

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"] = "user"
    content: str


class ChatRequest(BaseModel):
    model: ModelId = ModelId.AURATA
    messages: List[ChatMessage]
    stream: bool = True
    wandana_enabled: bool = False


class ChatResponse(BaseModel):
    id: str
    model: str
    content: str
    sources: Optional[List[dict]] = None
    usage: Optional[dict] = None


# ── Vision ──

class VisionAnalyzeRequest(BaseModel):
    prompt: str = "Décris ce que tu vois en détail."
    image_b64: Optional[str] = None


class VisionAnalyzeResponse(BaseModel):
    text: str
    meta: Optional[dict] = None


# ── Agents ──

class AgentRunRequest(BaseModel):
    model: ModelId = ModelId.NKYEL
    task: str
    context: Optional[str] = None
    tools: Optional[List[str]] = None


class AgentRunResponse(BaseModel):
    id: str
    status: Literal["pending", "running", "completed", "error"]
    result: Optional[str] = None
    events: Optional[List[dict]] = None


# ── Models API ──

class ModelInfo(BaseModel):
    id: str
    name: str
    tagline: str
    icon: str
    available: bool = True
    badge: Optional[str] = None
