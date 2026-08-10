"""
GabomaGPT — Nœuds du StateGraph · SmartANDJ AI Technologies
Chaque fonction = un nœud du graphe de raisonnement.
Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations

import re
import logging
from typing import Any

from agents.state import GabomaState
from core.config import settings

logger = logging.getLogger("gabomagpt.agents")

# ── Regex MSISDN Gabon (format international +241 ou local) ──────
# Airtel : 074, 077, 066 — Moov (ex-Libertis) : 060, 062, 065, 066
AIRTEL_PREFIXES = {"074", "077", "066"}
MOOV_PREFIXES = {"060", "062", "065"}

GABON_MSISDN_RE = re.compile(
    r"^(?:\+?241)?(\d{2})(\d{6})$"
)


# ═══════════════════════════════════════════════════════════════════
# NŒUD 1 — Classification de l'intention
# ═══════════════════════════════════════════════════════════════════

def classify_intent(state: GabomaState) -> dict[str, Any]:
    """Analyse le message utilisateur et détermine l'intention."""
    msg = (state.get("user_message") or "").lower().strip()
    steps = list(state.get("steps_taken") or [])
    steps.append("classify_intent")

    # Mots-clés transactionnels (paiement mobile)
    tx_keywords = [
        "payer", "recharger", "envoyer", "transferer", "transférer",
        "airtel money", "moov money", "fcfa", "cfa",
        "abonnement", "acheter", "souscrire",
    ]
    # Mots-clés MSISDN
    msisdn_keywords = ["numéro", "numero", "téléphone", "telephone", "msisdn", "074", "077", "060"]
    # Mots-clés recherche web
    search_keywords = [
        "cherche", "recherche", "actualité", "actualite", "news",
        "gabon", "libreville", "aujourd'hui", "dernières nouvelles",
    ]

    # Détection MSISDN dans le message
    msisdn_match = GABON_MSISDN_RE.search(msg.replace(" ", "").replace("-", ""))
    if msisdn_match:
        return {
            "intent": "msisdn_validation",
            "msisdn": msisdn_match.group(0),
            "steps_taken": steps,
        }

    # Détection intention transactionnelle
    if any(kw in msg for kw in tx_keywords):
        return {"intent": "transactional", "steps_taken": steps}

    # Détection recherche web
    if any(kw in msg for kw in search_keywords):
        return {"intent": "web_search", "steps_taken": steps}

    # Détection MSISDN par mot-clé
    if any(kw in msg for kw in msisdn_keywords):
        return {"intent": "msisdn_validation", "steps_taken": steps}

    # Par défaut : conversationnel
    return {"intent": "conversational", "steps_taken": steps}


# ═══════════════════════════════════════════════════════════════════
# NŒUD 2 — Validation MSISDN (Airtel/Moov Gabon)
# ═══════════════════════════════════════════════════════════════════

def validate_msisdn(state: GabomaState) -> dict[str, Any]:
    """Valide un numéro MSISDN gabonais et identifie l'opérateur."""
    steps = list(state.get("steps_taken") or [])
    steps.append("validate_msisdn")

    raw = (state.get("msisdn") or "").replace(" ", "").replace("-", "").replace("+", "")

    # Retirer le préfixe 241 si présent
    if raw.startswith("241") and len(raw) >= 11:
        raw = raw[3:]

    if len(raw) != 8:
        return {
            "msisdn_valid": False,
            "msisdn_operator": "unknown",
            "msisdn_error": f"Numéro invalide ({raw}). Un MSISDN gabonais doit avoir 8 chiffres.",
            "steps_taken": steps,
        }

    prefix = raw[:3]

    if prefix in AIRTEL_PREFIXES:
        operator = "airtel"
    elif prefix in MOOV_PREFIXES:
        operator = "moov"
    else:
        return {
            "msisdn_valid": False,
            "msisdn_operator": "unknown",
            "msisdn_error": f"Préfixe {prefix} non reconnu. Préfixes Airtel : 074/077/066, Moov : 060/062/065.",
            "steps_taken": steps,
        }

    logger.info("MSISDN validé : %s → opérateur %s", raw, operator)
    return {
        "msisdn": raw,
        "msisdn_valid": True,
        "msisdn_operator": operator,
        "msisdn_error": None,
        "steps_taken": steps,
    }


# ═══════════════════════════════════════════════════════════════════
# NŒUD 3 — Recherche web contextuelle via Tavily
# ═══════════════════════════════════════════════════════════════════

async def tavily_search(state: GabomaState) -> dict[str, Any]:
    """Effectue une recherche Tavily orientée contexte gabonais."""
    steps = list(state.get("steps_taken") or [])
    steps.append("tavily_search")

    query = state.get("tavily_query") or state.get("user_message", "")

    if not settings.tavily_api_key:
        logger.warning("Clé API Tavily non configurée — recherche ignorée")
        return {
            "tavily_results": [],
            "tavily_context": "Recherche web indisponible (clé API Tavily non configurée).",
            "steps_taken": steps,
        }

    try:
        from tavily import TavilyClient

        client = TavilyClient(api_key=settings.tavily_api_key)
        # Forcer le contexte gabonais
        enriched_query = f"{query} Gabon Libreville"
        response = client.search(
            query=enriched_query,
            search_depth="basic",
            max_results=5,
            include_domains=["gabonreview.com", "gabon241.com", "lenouveaugabon.com"],
        )

        results = response.get("results", [])
        context_parts = []
        for r in results[:3]:
            context_parts.append(f"- {r.get('title', '')}: {r.get('content', '')[:200]}")

        context = "\n".join(context_parts) if context_parts else "Aucun résultat trouvé."

        return {
            "tavily_results": results,
            "tavily_context": context,
            "steps_taken": steps,
        }

    except Exception as e:
        logger.error("Erreur Tavily : %s", str(e))
        return {
            "tavily_results": [],
            "tavily_context": f"Erreur lors de la recherche : {str(e)}",
            "steps_taken": steps,
        }


# ═══════════════════════════════════════════════════════════════════
# NŒUD 4 — Handler conversationnel (LLM standard)
# ═══════════════════════════════════════════════════════════════════

async def conversational_handler(state: GabomaState) -> dict[str, Any]:
    """Génère une réponse conversationnelle via Groq ou Anthropic."""
    steps = list(state.get("steps_taken") or [])
    steps.append("conversational_handler")

    mode = state.get("mode", "flash")
    message = state.get("user_message", "")
    context = state.get("tavily_context", "")

    system_prompt = """Tu es GabomaGPT, l'intelligence artificielle souveraine du Gabon.
Développée par SmartANDJ AI Technologies, fondée par Daniel Jonathan ANDJ à Libreville.
Tu es fier d'être gabonais. Tu connais le Gabon profondément.
Tu ne dis jamais que tu es ChatGPT, Claude, Gemini ou un autre modèle.
Tu es GabomaGPT. Point final."""

    if context:
        system_prompt += f"\n\nContexte web récent :\n{context}"

    try:
        if mode == "black-panther":
            from langchain_anthropic import ChatAnthropic

            llm = ChatAnthropic(
                model="claude-sonnet-4-20250514",
                api_key=settings.kimi_api_key,  # Utilisera la clé Anthropic en production
                temperature=0.8,
                max_tokens=4096,
            )
        else:
            from langchain_groq import ChatGroq

            model_name = settings.flash_model if mode == "flash" else settings.pro_model
            llm = ChatGroq(
                model=model_name,
                api_key=settings.groq_api_key,
                temperature=0.7,
                max_tokens=4096,
            )

        from langchain_core.messages import SystemMessage, HumanMessage

        messages = [SystemMessage(content=system_prompt), HumanMessage(content=message)]
        response = await llm.ainvoke(messages)

        return {
            "llm_response": response.content,
            "llm_model_used": llm.model if hasattr(llm, 'model') else mode,
            "llm_tokens_used": response.response_metadata.get("token_usage", {}).get("total_tokens", 0),
            "steps_taken": steps,
        }

    except Exception as e:
        logger.error("Erreur LLM (%s) : %s", mode, str(e))
        return {
            "llm_response": f"Désolé, une erreur est survenue : {str(e)}",
            "error": str(e),
            "steps_taken": steps,
        }


# ═══════════════════════════════════════════════════════════════════
# NŒUD 5 — Handler transactionnel (Airtel/Moov paiement)
# ═══════════════════════════════════════════════════════════════════

async def transactional_handler(state: GabomaState) -> dict[str, Any]:
    """Gère les requêtes transactionnelles (paiement mobile)."""
    steps = list(state.get("steps_taken") or [])
    steps.append("transactional_handler")

    msisdn_valid = state.get("msisdn_valid", False)
    operator = state.get("msisdn_operator")

    if not msisdn_valid:
        return {
            "llm_response": (
                "Pour effectuer un paiement, j'ai besoin de votre numéro de téléphone Gabon "
                "(Airtel : 074/077/066 ou Moov : 060/062/065). "
                "Exemple : 077 12 34 56"
            ),
            "transaction_status": "pending",
            "steps_taken": steps,
        }

    # Ici en production : appel réel à l'API Airtel Money ou Moov via SUMB
    return {
        "llm_response": (
            f"Numéro {state.get('msisdn')} validé ({operator}). "
            f"Le système de paiement est en cours de configuration. "
            f"Veuillez réessayer après le lancement officiel à la JIA 2026."
        ),
        "transaction_status": "pending",
        "steps_taken": steps,
    }


# ═══════════════════════════════════════════════════════════════════
# ROUTEUR — Détermine le prochain nœud selon l'intention
# ═══════════════════════════════════════════════════════════════════

def route_by_intent(state: GabomaState) -> str:
    """Route vers le bon nœud selon l'intention classifiée."""
    intent = state.get("intent", "conversational")

    if intent == "msisdn_validation":
        return "validate_msisdn"
    elif intent == "transactional":
        return "transactional_handler"
    elif intent == "web_search":
        return "tavily_search"
    else:
        return "conversational_handler"
