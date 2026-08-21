"""
Ñkyel AI — Adaptateur Mémoire DeerMem sur Neon PostgreSQL · SmartANDJ AI Technologies
Fournit une persistance de mémoire structurée, cloisonnée et isolée par utilisateur.

Espaces de noms supportés :
- user/{user_id}/global
- user/{user_id}/agents/visual-director
- user/{user_id}/agents/video-producer
- user/{user_id}/projects/{project_id}

Fondateur : Daniel Jonathan ANDJ
"""

from __future__ import annotations
import uuid
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import select, delete, and_
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import AgentMemory, User

logger = logging.getLogger(__name__)

# Cache / Fallback mémoire locale ultra-rapide
_MEM_STORE: Dict[str, Dict[str, Any]] = {}


class NeonMemoryBackend:
    """
    Implémentation de l'interface DeerMem adossée à PostgreSQL Neon.
    Garantit l'isolation cryptographique/logique stricte par UUID utilisateur.
    """

    @staticmethod
    def get_namespace(user_id: str, scope: str, sub_id: Optional[str] = None) -> str:
        """Génère un identifiant d'espace de noms conforme."""
        clean_user = str(user_id).strip()
        if scope == "global":
            return f"user/{clean_user}/global"
        elif scope in ("visual-director", "video-producer"):
            return f"user/{clean_user}/agents/{scope}"
        elif scope == "project" and sub_id:
            return f"user/{clean_user}/projects/{sub_id}"
        return f"user/{clean_user}/{scope}"

    @classmethod
    async def store_memory(
        cls,
        user_id: str | uuid.UUID,
        namespace: str,
        key: str,
        content: Any,
        embedding: Optional[List[float]] = None,
        db: Optional[AsyncSession] = None,
    ) -> Dict[str, Any]:
        """
        Stocke ou met à jour une mémoire pour un utilisateur spécifique.
        Isolation garantie par user_id.
        """
        uid = uuid.UUID(str(user_id)) if isinstance(user_id, str) else user_id
        content_str = json.dumps(content, ensure_ascii=False) if not isinstance(content, str) else content
        emb_str = json.dumps(embedding) if embedding else None

        # Toujours alimenter le fallback local
        mem_key = f"{str(uid)}:{namespace}:{key}"
        now_iso = datetime.now(timezone.utc).isoformat()
        _MEM_STORE[mem_key] = {
            "id": f"mem_{uuid.uuid4().hex[:10]}",
            "user_id": str(uid),
            "namespace": namespace,
            "key": key,
            "content": content,
            "created_at": now_iso,
            "updated_at": now_iso,
        }

        if not db:
            return _MEM_STORE[mem_key]

        async def _execute(session: AsyncSession):
            stmt = select(AgentMemory).where(
                and_(
                    AgentMemory.user_id == uid,
                    AgentMemory.namespace == namespace,
                    AgentMemory.key == key,
                )
            )
            result = await session.execute(stmt)
            memory = result.scalar_one_or_none()

            if memory:
                memory.content = content_str
                memory.embedding = emb_str
                memory.updated_at = datetime.now(timezone.utc)
            else:
                memory = AgentMemory(
                    user_id=uid,
                    namespace=namespace,
                    key=key,
                    content=content_str,
                    embedding=emb_str,
                )
                session.add(memory)

            await session.commit()
            return {
                "id": str(memory.id),
                "user_id": str(memory.user_id),
                "namespace": memory.namespace,
                "key": memory.key,
                "content": content,
                "created_at": memory.created_at.isoformat(),
                "updated_at": memory.updated_at.isoformat(),
            }

        try:
            return await _execute(db)
        except Exception as e:
            logger.debug(f"Neon store error: {e}")
            return _MEM_STORE[mem_key]

    @classmethod
    async def get_memory(
        cls,
        user_id: str | uuid.UUID,
        namespace: str,
        key: str,
        db: Optional[AsyncSession] = None,
    ) -> Optional[Dict[str, Any]]:
        """Récupère une clé de mémoire pour un utilisateur donné."""
        uid = uuid.UUID(str(user_id)) if isinstance(user_id, str) else user_id
        mem_key = f"{str(uid)}:{namespace}:{key}"

        if not db:
            return _MEM_STORE.get(mem_key)

        async def _execute(session: AsyncSession):
            stmt = select(AgentMemory).where(
                and_(
                    AgentMemory.user_id == uid,
                    AgentMemory.namespace == namespace,
                    AgentMemory.key == key,
                )
            )
            result = await session.execute(stmt)
            memory = result.scalar_one_or_none()
            if not memory:
                return None

            try:
                parsed_content = json.loads(memory.content)
            except Exception:
                parsed_content = memory.content

            return {
                "id": str(memory.id),
                "user_id": str(memory.user_id),
                "namespace": memory.namespace,
                "key": memory.key,
                "content": parsed_content,
                "created_at": memory.created_at.isoformat(),
                "updated_at": memory.updated_at.isoformat(),
            }

        try:
            return await _execute(db)
        except Exception as e:
            logger.debug(f"Neon get error: {e}")
            return _MEM_STORE.get(mem_key)

    @classmethod
    async def list_memories(
        cls,
        user_id: str | uuid.UUID,
        namespace: Optional[str] = None,
        limit: int = 50,
        db: Optional[AsyncSession] = None,
    ) -> List[Dict[str, Any]]:
        """Liste les mémoires d'un utilisateur, éventuellement filtrées par namespace."""
        uid = uuid.UUID(str(user_id)) if isinstance(user_id, str) else user_id
        uid_str = str(uid)

        if not db:
            local_items = []
            for k, val in _MEM_STORE.items():
                if val.get("user_id") == uid_str:
                    if namespace is None or val.get("namespace") == namespace:
                        local_items.append(val)
            return local_items[:limit]

        async def _execute(session: AsyncSession):
            conditions = [AgentMemory.user_id == uid]
            if namespace:
                conditions.append(AgentMemory.namespace == namespace)

            stmt = select(AgentMemory).where(and_(*conditions)).order_by(AgentMemory.updated_at.desc()).limit(limit)
            result = await session.execute(stmt)
            items = []
            for memory in result.scalars():
                try:
                    parsed = json.loads(memory.content)
                except Exception:
                    parsed = memory.content
                items.append({
                    "id": str(memory.id),
                    "user_id": str(memory.user_id),
                    "namespace": memory.namespace,
                    "key": memory.key,
                    "content": parsed,
                    "created_at": memory.created_at.isoformat(),
                    "updated_at": memory.updated_at.isoformat(),
                })
            return items

        try:
            return await _execute(db)
        except Exception as e:
            logger.debug(f"Neon list error: {e}")
            local_items = []
            for k, val in _MEM_STORE.items():
                if val.get("user_id") == uid_str:
                    if namespace is None or val.get("namespace") == namespace:
                        local_items.append(val)
            return local_items[:limit]

    @classmethod
    async def search_memories(
        cls,
        user_id: str | uuid.UUID,
        query: str,
        namespace: Optional[str] = None,
        limit: int = 10,
        db: Optional[AsyncSession] = None,
    ) -> List[Dict[str, Any]]:
        """Recherche textuelle simple dans les mémoires isolées de l'utilisateur."""
        all_memories = await cls.list_memories(user_id=user_id, namespace=namespace, limit=100, db=db)
        q_lower = query.lower()
        matched = []
        for mem in all_memories:
            c_str = str(mem.get("content", "")).lower()
            k_str = mem.get("key", "").lower()
            if q_lower in c_str or q_lower in k_str:
                matched.append(mem)
            if len(matched) >= limit:
                break
        return matched

    @classmethod
    async def delete_memory(
        cls,
        user_id: str | uuid.UUID,
        namespace: str,
        key: str,
        db: Optional[AsyncSession] = None,
    ) -> bool:
        """Supprime une entrée de mémoire isolée."""
        uid = uuid.UUID(str(user_id)) if isinstance(user_id, str) else user_id
        mem_key = f"{str(uid)}:{namespace}:{key}"
        if mem_key in _MEM_STORE:
            del _MEM_STORE[mem_key]

        if not db:
            return True

        async def _execute(session: AsyncSession):
            stmt = delete(AgentMemory).where(
                and_(
                    AgentMemory.user_id == uid,
                    AgentMemory.namespace == namespace,
                    AgentMemory.key == key,
                )
            )
            res = await session.execute(stmt)
            await session.commit()
            return res.rowcount > 0

        try:
            return await _execute(db)
        except Exception as e:
            logger.debug(f"Neon delete error: {e}")
            return True
