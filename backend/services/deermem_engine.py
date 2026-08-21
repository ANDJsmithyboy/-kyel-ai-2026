"""
Ñkyel AI — Moteur DeerMem sur Neon PostgreSQL · SmartANDJ AI Technologies
Fournit les 5 capacités cognitives fondamentales de DeerMem :
1. Extraction de faits importants
2. Création de résumés consolidés
3. Recherche sémantique et contextuelle de souvenirs
4. Détection et résolution des contradictions
5. Injection de mémoire personnalisée dans les agents

Toute la persistance est garantie par Neon via NeonMemoryBackend.
Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from services.neon_memory_backend import NeonMemoryBackend

logger = logging.getLogger(__name__)


class DeerMemEngine:
    """Moteur cognitif de mémoire DeerMem propulsé par Neon PostgreSQL."""

    @classmethod
    async def extract_facts(
        cls,
        user_message: str,
        assistant_response: Optional[str],
        user_id: str,
        namespace: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Extrait les faits pertinents (préférences, contraintes métier, identité de marque, langue)
        depuis un échange et les persiste dans Neon.
        """
        target_namespace = namespace or NeonMemoryBackend.get_namespace(user_id, "global")
        facts: List[Dict[str, Any]] = []

        lower_msg = user_message.lower()

        # 1. Détection de préférences linguistiques
        for lang in ["fang", "mpongwe", "punu", "français", "anglais"]:
            if f"en {lang}" in lower_msg or f"parle {lang}" in lower_msg or f"langue {lang}" in lower_msg:
                facts.append({"key": "preferred_language", "value": lang, "category": "preference"})

        # 2. Détection de charte graphique / marque
        if "palette" in lower_msg or "couleur" in lower_msg or "charte" in lower_msg:
            facts.append({"key": "brand_styling", "value": user_message[:300], "category": "brand"})

        # 3. Détection de contraintes de projet
        if "projet" in lower_msg or "budget" in lower_msg or "deadline" in lower_msg:
            facts.append({"key": f"project_constraint_{int(datetime.now(timezone.utc).timestamp())}", "value": user_message[:300], "category": "project"})

        # Sauvegarder dans Neon via NeonMemoryBackend
        for fact in facts:
            await NeonMemoryBackend.store_memory(
                user_id=user_id,
                namespace=target_namespace,
                key=fact["key"],
                content={"value": fact["value"], "category": fact["category"], "updated_at": datetime.now(timezone.utc).isoformat()},
            )

        return facts

    @classmethod
    async def create_summary(
        cls,
        messages: List[Dict[str, Any]],
        user_id: str,
        conversation_id: str,
    ) -> str:
        """Crée un résumé consolidé d'une conversation et le persiste dans Neon."""
        user_texts = [m.get("content", "") for m in messages if m.get("role") == "user"]
        summary = f"Conversation {conversation_id} : {len(messages)} messages échangés. Thèmes principaux : " + ", ".join([t[:60] for t in user_texts[:3]])

        ns = NeonMemoryBackend.get_namespace(user_id, "global")
        await NeonMemoryBackend.store_memory(
            user_id=user_id,
            namespace=ns,
            key=f"summary_conv_{conversation_id}",
            content={"summary": summary, "message_count": len(messages), "timestamp": datetime.now(timezone.utc).isoformat()},
        )
        return summary

    @classmethod
    async def search_memories(
        cls,
        query: str,
        user_id: str,
        namespace: Optional[str] = None,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """Recherche dans les souvenirs de l'utilisateur."""
        return await NeonMemoryBackend.search_memories(
            user_id=user_id,
            query=query,
            namespace=namespace,
            limit=limit,
        )

    @classmethod
    async def resolve_contradictions(
        cls,
        key: str,
        new_value: Any,
        user_id: str,
        namespace: str,
    ) -> Dict[str, Any]:
        """
        Détecte et résout les contradictions en écrasant ou mettant à jour la clé mémoire
        avec historique des modifications.
        """
        existing = await NeonMemoryBackend.get_memory(user_id=user_id, namespace=namespace, key=key)
        old_value = existing.get("content", {}).get("value") if existing else None

        updated_record = await NeonMemoryBackend.store_memory(
            user_id=user_id,
            namespace=namespace,
            key=key,
            content={
                "value": new_value,
                "previous_value": old_value,
                "superseded_at": datetime.now(timezone.utc).isoformat() if old_value else None,
            },
        )
        return updated_record

    @classmethod
    async def inject_memory_context(
        cls,
        agent_name: str,
        user_id: str,
        project_id: Optional[str] = None,
    ) -> str:
        """
        Injecte les 4 niveaux de mémoire personnalisée dans le prompt système de l'agent.
        """
        global_ns = NeonMemoryBackend.get_namespace(user_id, "global")
        agent_ns = NeonMemoryBackend.get_namespace(user_id, agent_name)

        global_memories = await NeonMemoryBackend.list_memories(user_id=user_id, namespace=global_ns, limit=5)
        agent_memories = await NeonMemoryBackend.list_memories(user_id=user_id, namespace=agent_ns, limit=5)

        context_parts = []
        if global_memories:
            context_parts.append("### Préférences et profil utilisateur (DeerMem) :")
            for m in global_memories:
                context_parts.append(f"- {m.get('key')}: {m.get('content')}")

        if agent_memories:
            context_parts.append(f"### Mémoire spécifique de l'agent {agent_name} :")
            for m in agent_memories:
                context_parts.append(f"- {m.get('key')}: {m.get('content')}")

        if project_id:
            proj_ns = NeonMemoryBackend.get_namespace(user_id, "project", sub_id=project_id)
            proj_memories = await NeonMemoryBackend.list_memories(user_id=user_id, namespace=proj_ns, limit=5)
            if proj_memories:
                context_parts.append(f"### Contexte du projet {project_id} :")
                for m in proj_memories:
                    context_parts.append(f"- {m.get('key')}: {m.get('content')}")

        return "\n".join(context_parts)
