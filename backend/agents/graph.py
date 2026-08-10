"""
GabomaGPT — StateGraph Principal · SmartANDJ AI Technologies
Graphe de raisonnement LangGraph pour GabomaGPT.
Fondateur : Daniel Jonathan ANDJ

Architecture du graphe :

    ┌──────────────┐
    │   CLASSIFY    │
    │   INTENT      │
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │    ROUTER     │── conversational ──► conversational_handler ──► END
    │  (conditional)│── transactional ───► validate_msisdn ──► transactional_handler ──► END
    │               │── web_search ──────► tavily_search ──► conversational_handler ──► END
    │               │── msisdn_validation► validate_msisdn ──► conversational_handler ──► END
    └───────────────┘
"""

from __future__ import annotations

from langgraph.graph import StateGraph, END

from agents.state import GabomaState
from agents.nodes import (
    classify_intent,
    validate_msisdn,
    tavily_search,
    conversational_handler,
    transactional_handler,
    route_by_intent,
)


def build_gabomagpt_graph() -> StateGraph:
    """Construit et compile le graphe de raisonnement GabomaGPT."""

    graph = StateGraph(GabomaState)

    # ── Ajouter les nœuds ───────────────────────────────
    graph.add_node("classify_intent", classify_intent)
    graph.add_node("validate_msisdn", validate_msisdn)
    graph.add_node("tavily_search", tavily_search)
    graph.add_node("conversational_handler", conversational_handler)
    graph.add_node("transactional_handler", transactional_handler)

    # ── Point d'entrée ──────────────────────────────────
    graph.set_entry_point("classify_intent")

    # ── Routage conditionnel après classification ───────
    graph.add_conditional_edges(
        "classify_intent",
        route_by_intent,
        {
            "validate_msisdn": "validate_msisdn",
            "transactional_handler": "transactional_handler",
            "tavily_search": "tavily_search",
            "conversational_handler": "conversational_handler",
        },
    )

    # ── Après validation MSISDN → handler conversationnel
    #    (pour résumer le résultat de la validation)
    graph.add_edge("validate_msisdn", "conversational_handler")

    # ── Après Tavily → handler conversationnel
    #    (pour synthétiser les résultats de recherche)
    graph.add_edge("tavily_search", "conversational_handler")

    # ── Nœuds terminaux ─────────────────────────────────
    graph.add_edge("conversational_handler", END)
    graph.add_edge("transactional_handler", END)

    return graph.compile()


# Instance globale pré-compilée du graphe
gabomagpt_graph = build_gabomagpt_graph()
