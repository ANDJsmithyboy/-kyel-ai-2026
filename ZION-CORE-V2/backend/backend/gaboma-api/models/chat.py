# FILE: gaboma-api/models/chat.py
from enum import StrEnum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class GabomaModel(StrEnum):
    """Identifiants internes autorisés. Aucun nom tiers ne sort vers l'UI."""

    flash = "flash"
    pro = "pro"
    black_panther = "black_panther"


class ChatRequest(BaseModel):
    """Payload pour créer une réponse de chat non streamée."""

    model_config = ConfigDict(str_strip_whitespace=True)

    session_id: Optional[str] = Field(
        default=None,
        min_length=8,
        max_length=128,
        description="Identifiant de session Redis côté gateway.",
    )
    message: str = Field(
        min_length=1,
        max_length=8000,
        description="Message utilisateur.",
    )
    model: GabomaModel = Field(
        default=GabomaModel.flash,
        description="Mode GabomaGPT demandé.",
    )


class ChatResponse(BaseModel):
    """Réponse de chat stabilisée pour le client Android."""

    session_id: str
    model: GabomaModel
    display_name: str
    answer: str
    token_estimate: int


class StreamToken(BaseModel):
    """Contrat logique d'un événement SSE."""

    event: str = Field(description="Nom de l'événement SSE.")
    data: str = Field(description="Payload texte de l'événement.")
