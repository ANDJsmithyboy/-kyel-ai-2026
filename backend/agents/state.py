"""
GabomaGPT — État du graphe LangGraph · SmartANDJ AI Technologies
TypedDict décrivant l'état qui circule entre les nœuds du StateGraph.
Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

from typing import Literal, Optional
from typing_extensions import TypedDict


class GabomaState(TypedDict, total=False):
    """État partagé entre tous les nœuds du graphe GabomaGPT."""

    # ── Entrée utilisateur ────────────────────────────────
    user_message: str
    user_id: str
    language: str  # "fr" | "en" | "fang" | "mpongwe" | "punu"
    mode: str  # "flash" | "pro" | "black-panther"
    conversation_id: Optional[str]

    # ── Classification de l'intention ─────────────────────
    intent: Literal[
        "conversational",
        "transactional",
        "web_search",
        "msisdn_validation",
        "unknown",
    ]

    # ── Validation MSISDN (Airtel/Moov) ──────────────────
    msisdn: Optional[str]
    msisdn_valid: bool
    msisdn_operator: Optional[Literal["airtel", "moov", "unknown"]]
    msisdn_error: Optional[str]

    # ── Contexte Tavily (recherche web gabonaise) ─────────
    tavily_query: Optional[str]
    tavily_results: list[dict]
    tavily_context: Optional[str]

    # ── Réponse du LLM ───────────────────────────────────
    llm_response: Optional[str]
    llm_model_used: Optional[str]
    llm_tokens_used: int

    # ── Transaction (Airtel Money / Moov) ─────────────────
    transaction_type: Optional[Literal["payment", "recharge", "transfer"]]
    transaction_amount: Optional[int]
    transaction_status: Optional[Literal["pending", "success", "failed"]]
    transaction_reference: Optional[str]

    # ── Métadonnées ──────────────────────────────────────
    error: Optional[str]
    steps_taken: list[str]
