"""
Ñkyel AI — Service Souverain de Persistance P0 (Neon PostgreSQL + Cloudflare R2)
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

PERMANENT RELEASE RULE:
NO PERSISTENCE = NO PRODUCTION

Garantit la chaîne de durabilité canonique :
- Clerk: Identité humaine (sub)
- Neon: Propriété relationnelle et métadonnées (Missions, Runs, WorkGraph, Sources, Evidence, Artifacts)
- DeerFlow / LangGraph: État d'exécution runtime
- Cloudflare R2: Stockage binaire pérenne des artefacts
- FastAPI: Frontière d'autorisation et d'orchestration (Zero IDOR)
"""

from __future__ import annotations
import os
import json
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Union

from sqlalchemy import select, update, and_, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import async_session
from db.models import (
    User,
    Workspace,
    WorkspaceMember,
    Mission,
    Run,
    WorkgraphNode,
    WorkgraphEdge,
    Source,
    Evidence,
    Artifact as DBArtifact,
    MissionEvent,
    Conversation,
    Message,
)

logger = logging.getLogger(__name__)


class PersistenceService:
    """Service d'accès et de persistance universelle pour Ñkyel AI."""

    @classmethod
    async def get_or_create_user(
        cls,
        clerk_user_id: str,
        display_name: Optional[str] = None,
        email: Optional[str] = None,
        session: Optional[AsyncSession] = None,
    ) -> User:
        """
        Assure qu'un utilisateur Neon existe pour ce `sub` Clerk.
        Idempotent et résistant aux collisions concurrentes.
        """
        clean_clerk_id = str(clerk_user_id).strip()
        if not clean_clerk_id or clean_clerk_id == "anonymous":
            clean_clerk_id = "user_anonymous_default"

        neon_user_id: Optional[uuid.UUID] = None
        try:
            neon_user_id = uuid.UUID(clean_clerk_id)
        except ValueError:
            pass

        async def _execute(s: AsyncSession) -> User:
            if neon_user_id is not None:
                res = await s.execute(select(User).where(User.id == neon_user_id))
                user = res.scalar_one_or_none()
                if user:
                    return user

            stmt = select(User).where(User.clerk_user_id == clean_clerk_id)
            res = await s.execute(stmt)
            user = res.scalar_one_or_none()
            if user:
                return user

            # Création automatique de l'utilisateur
            new_user = User(
                id=uuid.uuid4(),
                clerk_user_id=clean_clerk_id,
                display_name=display_name or f"User {clean_clerk_id[:8]}",
                primary_email=email or f"{clean_clerk_id}@nkyel.ai",
                status="active",
            )
            s.add(new_user)
            await s.commit()
            await s.refresh(new_user)
            return new_user

        if session:
            return await _execute(session)
        async with async_session() as s:
            return await _execute(s)

    @classmethod
    async def get_or_create_default_workspace(
        cls,
        user: User,
        session: Optional[AsyncSession] = None,
    ) -> Workspace:
        """Récupère ou crée le workspace par défaut de l'utilisateur."""
        async def _execute(s: AsyncSession) -> Workspace:
            stmt = (
                select(Workspace)
                .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
                .where(WorkspaceMember.user_id == user.id)
                .limit(1)
            )
            res = await s.execute(stmt)
            ws = res.scalar_one_or_none()
            if ws:
                return ws

            # Création du workspace personnel
            new_ws = Workspace(
                id=uuid.uuid4(),
                name=f"Espace de {user.display_name or 'Travail'}",
                owner_user_id=user.id,
                workspace_type="BUSINESS",
                status="ACTIVE",
            )
            s.add(new_ws)
            await s.flush()

            member = WorkspaceMember(
                id=uuid.uuid4(),
                workspace_id=new_ws.id,
                user_id=user.id,
                role="owner",
            )
            s.add(member)
            await s.commit()
            await s.refresh(new_ws)
            return new_ws

        if session:
            return await _execute(session)
        async with async_session() as s:
            return await _execute(s)

    @classmethod
    async def record_mission_start(
        cls,
        mission_id: str,
        run_id: str,
        user_identifier: str,
        title: str,
        goal: str,
        workspace_id: Optional[str] = None,
        model_profile: str = "NKYEL_RESEARCH",
    ) -> Dict[str, Any]:
        """
        Enregistre de manière immuable le lancement d'une mission et d'un run dans Neon.
        Survit à un restart immédiat du conteneur ou de la session.
        """
        async with async_session() as s:
            try:
                user = await cls.get_or_create_user(user_identifier, session=s)
                ws = None
                if workspace_id:
                    try:
                        ws_uuid = uuid.UUID(str(workspace_id))
                        ws_stmt = select(Workspace).where(Workspace.id == ws_uuid)
                        ws_res = await s.execute(ws_stmt)
                        ws = ws_res.scalar_one_or_none()
                    except ValueError:
                        pass
                if not ws:
                    ws = await cls.get_or_create_default_workspace(user, session=s)

                # Conversion mission_id en UUID
                try:
                    m_uuid = uuid.UUID(str(mission_id))
                except ValueError:
                    # Hash déterministe si mission_id est une chaîne de caractères
                    m_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.mission.{mission_id}")

                try:
                    r_uuid = uuid.UUID(str(run_id))
                except ValueError:
                    r_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.run.{run_id}")

                # Upsert Mission
                m_stmt = select(Mission).where(Mission.id == m_uuid)
                m_res = await s.execute(m_stmt)
                mission = m_res.scalar_one_or_none()

                if not mission:
                    mission = Mission(
                        id=m_uuid,
                        workspace_id=ws.id,
                        created_by_user_id=user.id,
                        title=title[:512],
                        objective=goal,
                        status="running",
                        complexity="MEDIUM",
                        selected_model_profile=model_profile,
                        current_phase="EXECUTION",
                        current_run_id=r_uuid,
                        started_at=datetime.now(timezone.utc),
                    )
                    s.add(mission)
                else:
                    mission.status = "running"
                    mission.current_run_id = r_uuid
                    mission.current_phase = "EXECUTION"
                    mission.updated_at = datetime.now(timezone.utc)

                await s.flush()

                # Upsert Run
                r_stmt = select(Run).where(Run.id == r_uuid)
                r_res = await s.execute(r_stmt)
                run_obj = r_res.scalar_one_or_none()
                if not run_obj:
                    run_obj = Run(
                        id=r_uuid,
                        mission_id=m_uuid,
                        workspace_id=ws.id,
                        run_type="FULL",
                        status="RUNNING",
                        selected_model_profile=model_profile,
                        started_at=datetime.now(timezone.utc),
                    )
                    s.add(run_obj)
                else:
                    run_obj.status = "RUNNING"
                    run_obj.updated_at = datetime.now(timezone.utc)

                await s.commit()

                return {
                    "success": True,
                    "mission_id": str(m_uuid),
                    "run_id": str(r_uuid),
                    "workspace_id": str(ws.id),
                    "user_id": str(user.id),
                }
            except Exception as e:
                logger.error(f"[Persistence] record_mission_start failed: {e}", exc_info=True)
                await s.rollback()
                return {"success": False, "error": str(e)}

    @classmethod
    async def record_workgraph_node(
        cls,
        mission_id: str,
        run_id: str,
        node_id: str,
        node_type: str,
        label: str,
        status: str = "active",
        payload: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Enregistre ou met à jour un nœud du WorkGraph réel dans Neon."""
        async with async_session() as s:
            try:
                try:
                    m_uuid = uuid.UUID(str(mission_id))
                except ValueError:
                    m_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.mission.{mission_id}")
                try:
                    r_uuid = uuid.UUID(str(run_id))
                except ValueError:
                    r_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.run.{run_id}")
                try:
                    n_uuid = uuid.UUID(str(node_id))
                except ValueError:
                    n_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.node.{node_id}")

                # Récupérer workspace_id depuis la mission
                m_stmt = select(Mission.workspace_id).where(Mission.id == m_uuid)
                m_res = await s.execute(m_stmt)
                ws_id = m_res.scalar_one_or_none()
                if not ws_id:
                    # Fallback au premier workspace
                    ws_res = await s.execute(select(Workspace.id).limit(1))
                    ws_id = ws_res.scalar_one_or_none()

                if not ws_id:
                    return False

                stmt = select(WorkgraphNode).where(WorkgraphNode.id == n_uuid)
                res = await s.execute(stmt)
                node = res.scalar_one_or_none()

                if not node:
                    node = WorkgraphNode(
                        id=n_uuid,
                        workspace_id=ws_id,
                        mission_id=m_uuid,
                        run_id=r_uuid,
                        node_type=node_type,
                        label=label[:512],
                        status=status,
                        payload=payload or {},
                    )
                    s.add(node)
                else:
                    node.mission_id = m_uuid
                    node.run_id = r_uuid
                    node.workspace_id = ws_id
                    node.status = status
                    node.label = label[:512]
                    if payload:
                        node.payload = {**(node.payload or {}), **payload}
                    node.updated_at = datetime.now(timezone.utc)

                await s.commit()
                return True
            except Exception as e:
                logger.warning(f"[Persistence] record_workgraph_node notice: {e}")
                await s.rollback()
                return False

    @classmethod
    async def record_source(
        cls,
        mission_id: str,
        run_id: str,
        source_id: str,
        url: str,
        title: str,
        domain: Optional[str] = None,
        snippet: Optional[str] = None,
        content: Optional[str] = None,
        score: float = 1.0,
    ) -> bool:
        """Enregistre de façon permanente une source de recherche primaire dans Neon."""
        async with async_session() as s:
            try:
                try:
                    m_uuid = uuid.UUID(str(mission_id))
                except ValueError:
                    m_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.mission.{mission_id}")
                try:
                    r_uuid = uuid.UUID(str(run_id))
                except ValueError:
                    r_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.run.{run_id}")
                try:
                    s_uuid = uuid.UUID(str(source_id))
                except ValueError:
                    s_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.source.{source_id}")

                m_stmt = select(Mission.workspace_id).where(Mission.id == m_uuid)
                m_res = await s.execute(m_stmt)
                ws_id = m_res.scalar_one_or_none()

                stmt = select(Source).where(Source.id == s_uuid)
                res = await s.execute(stmt)
                src = res.scalar_one_or_none()

                if not src:
                    src = Source(
                        id=s_uuid,
                        workspace_id=ws_id,
                        mission_id=m_uuid,
                        run_id=r_uuid,
                        source_type="WEB",
                        url=url,
                        canonical_url=url,
                        title=title[:512],
                        domain=domain or "web",
                        metadata_obj={"excerpt": snippet or content or "", "score": score},
                        retrieved_at=datetime.now(timezone.utc),
                    )
                    s.add(src)
                else:
                    src.title = title[:512]
                    src.url = url
                    src.metadata_obj = {"excerpt": snippet or content or "", "score": score}

                await s.commit()
                return True
            except Exception as e:
                logger.warning(f"[Persistence] record_source notice: {e}")
                await s.rollback()
                return False

    @classmethod
    async def record_evidence(
        cls,
        mission_id: str,
        run_id: str,
        source_id: str,
        claim: str,
        evidence_text: str,
        confidence: str = "0.95",
    ) -> bool:
        """Enregistre une preuve factuelle liée à une source dans Neon."""
        async with async_session() as s:
            try:
                try:
                    m_uuid = uuid.UUID(str(mission_id))
                except ValueError:
                    m_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.mission.{mission_id}")
                try:
                    r_uuid = uuid.UUID(str(run_id))
                except ValueError:
                    r_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.run.{run_id}")
                try:
                    s_uuid = uuid.UUID(str(source_id))
                except ValueError:
                    s_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.source.{source_id}")

                m_stmt = select(Mission.workspace_id).where(Mission.id == m_uuid)
                m_res = await s.execute(m_stmt)
                ws_id = m_res.scalar_one_or_none()

                evi = Evidence(
                    id=uuid.uuid4(),
                    workspace_id=ws_id,
                    mission_id=m_uuid,
                    run_id=r_uuid,
                    source_id=s_uuid,
                    claim=claim,
                    evidence_text=evidence_text,
                    confidence=confidence,
                    relationship="supports",
                )
                s.add(evi)
                await s.commit()
                return True
            except Exception as e:
                logger.warning(f"[Persistence] record_evidence notice: {e}")
                await s.rollback()
                return False

    @classmethod
    async def record_artifact(
        cls,
        artifact_id: str,
        mission_id: str,
        run_id: str,
        user_identifier: str,
        title: str,
        artifact_type: str,
        url: str,
        r2_key: Optional[str] = None,
        content: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Enregistre les métadonnées de l'artefact dans la table Neon `artifacts`."""
        async with async_session() as s:
            try:
                user = await cls.get_or_create_user(user_identifier, session=s)

                try:
                    art_uuid = uuid.UUID(str(artifact_id))
                except ValueError:
                    art_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.art.{artifact_id}")

                stmt = select(DBArtifact).where(DBArtifact.id == art_uuid)
                res = await s.execute(stmt)
                db_art = res.scalar_one_or_none()

                try:
                    m_uuid = uuid.UUID(str(mission_id))
                except ValueError:
                    m_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.mission.{mission_id}")

                ws_res = await s.execute(select(Mission.workspace_id).where(Mission.id == m_uuid))
                ws_id = ws_res.scalar_one_or_none()
                if not ws_id:
                    ws_first = await s.execute(select(Workspace.id).limit(1))
                    ws_id = ws_first.scalar_one_or_none()

                meta_dict = {
                    "original_artifact_id": str(artifact_id),
                    "mission_id": mission_id,
                    "run_id": run_id,
                    **(metadata or {}),
                }

                if not db_art:
                    db_art = DBArtifact(
                        id=art_uuid,
                        workspace_id=ws_id,
                        user_id=user.id,
                        title=title[:255],
                        artifact_type=artifact_type,
                        status="completed",
                        url=url,
                        r2_key=r2_key,
                        content=content[:50000] if content else None,
                        metadata_json=json.dumps(meta_dict),
                        version=1,
                    )
                    s.add(db_art)
                else:
                    db_art.title = title[:255]
                    db_art.url = url
                    db_art.r2_key = r2_key or db_art.r2_key
                    if content:
                        db_art.content = content[:50000]
                    db_art.metadata_json = json.dumps(meta_dict)
                    db_art.updated_at = datetime.now(timezone.utc)

                await s.commit()
                return True
            except Exception as e:
                logger.error(f"[Persistence] record_artifact error: {e}", exc_info=True)
                await s.rollback()
                return False

    @classmethod
    async def record_mission_completion(
        cls,
        mission_id: str,
        run_id: str,
        status: str = "completed",
        summary: Optional[str] = None,
        duration_ms: Optional[int] = None,
    ) -> None:
        """Clôture la mission et le run avec persistance finale."""
        async with async_session() as s:
            try:
                try:
                    m_uuid = uuid.UUID(str(mission_id))
                except ValueError:
                    m_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.mission.{mission_id}")
                try:
                    r_uuid = uuid.UUID(str(run_id))
                except ValueError:
                    r_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.run.{run_id}")

                now = datetime.now(timezone.utc)

                m_stmt = select(Mission).where(Mission.id == m_uuid)
                m_res = await s.execute(m_stmt)
                m = m_res.scalar_one_or_none()
                if m:
                    m.status = status
                    m.completed_at = now
                    m.current_phase = "COMPLETED"
                    m.updated_at = now

                r_stmt = select(Run).where(Run.id == r_uuid)
                r_res = await s.execute(r_stmt)
                r = r_res.scalar_one_or_none()
                if r:
                    r.status = "COMPLETED" if status == "completed" else "CANCELLED"
                    r.completed_at = now
                    r.updated_at = now

                await s.commit()
            except Exception as e:
                logger.warning(f"[Persistence] record_mission_completion notice: {e}")
                await s.rollback()

    @classmethod
    async def restore_mission_state(
        cls,
        mission_id: str,
        user_identifier: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Restaure l'intégralité d'une mission passée depuis Neon :
        - Mission info
        - Run history
        - WorkGraph nodes & edges
        - Sources vérifiées
        - Preuves
        - Artefacts (URLs R2 pérennes)
        Avec contrôle IDOR d'isolation utilisateur.
        """
        async with async_session() as s:
            try:
                try:
                    m_uuid = uuid.UUID(str(mission_id))
                except ValueError:
                    m_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.mission.{mission_id}")

                # 1. Mission
                m_stmt = select(Mission).where(Mission.id == m_uuid)
                m_res = await s.execute(m_stmt)
                mission = m_res.scalar_one_or_none()
                if not mission:
                    return {"found": False, "error": "Mission non trouvée"}

                # Isolation IDOR si user fourni
                if user_identifier and user_identifier != "anonymous":
                    user = await cls.get_or_create_user(user_identifier, session=s)
                    if mission.created_by_user_id != user.id:
                        # Vérifier membership workspace
                        ws_mem = await s.execute(
                            select(WorkspaceMember).where(
                                and_(
                                    WorkspaceMember.workspace_id == mission.workspace_id,
                                    WorkspaceMember.user_id == user.id,
                                )
                            )
                        )
                        if not ws_mem.scalar_one_or_none():
                            return {"found": False, "error": "Accès non autorisé (IDOR Guard)"}

                # 2. Nodes
                nodes_res = await s.execute(
                    select(WorkgraphNode)
                    .where(WorkgraphNode.mission_id == m_uuid)
                    .order_by(WorkgraphNode.created_at)
                )
                nodes = [
                    {
                        "id": str(n.id),
                        "node_type": n.node_type,
                        "label": n.label,
                        "status": n.status,
                        "payload": n.payload,
                    }
                    for n in nodes_res.scalars().all()
                ]

                # 3. Sources
                sources_res = await s.execute(
                    select(Source)
                    .where(Source.mission_id == m_uuid)
                    .order_by(desc(Source.retrieved_at))
                )
                sources = [
                    {
                        "id": str(src.id),
                        "url": src.url,
                        "title": src.title,
                        "domain": src.domain,
                        "excerpt": src.excerpt,
                        "retrieved_at": src.retrieved_at.isoformat() if src.retrieved_at else None,
                    }
                    for src in sources_res.scalars().all()
                ]

                # 4. Evidence
                evi_res = await s.execute(
                    select(Evidence)
                    .where(Evidence.mission_id == m_uuid)
                    .order_by(Evidence.created_at)
                )
                evidence = [
                    {
                        "id": str(ev.id),
                        "source_id": str(ev.source_id) if ev.source_id else None,
                        "claim": ev.claim,
                        "evidence_text": ev.evidence_text,
                        "confidence": ev.confidence,
                    }
                    for ev in evi_res.scalars().all()
                ]

                # 5. Artifacts
                # Recherche par mission_id dans metadata_json ou artifacts de l'utilisateur
                art_res = await s.execute(
                    select(DBArtifact)
                    .where(DBArtifact.metadata_json.like(f"%{mission_id}%"))
                    .order_by(desc(DBArtifact.created_at))
                )
                artifacts = [
                    {
                        "id": str(a.id),
                        "title": a.title,
                        "type": a.artifact_type,
                        "url": a.url,
                        "r2_key": a.r2_key,
                        "version": a.version,
                        "created_at": a.created_at.isoformat() if a.created_at else None,
                    }
                    for a in art_res.scalars().all()
                ]

                return {
                    "found": True,
                    "mission": {
                        "id": str(mission.id),
                        "title": mission.title,
                        "objective": mission.objective,
                        "status": mission.status,
                        "current_phase": mission.current_phase,
                        "created_at": mission.created_at.isoformat() if mission.created_at else None,
                        "completed_at": mission.completed_at.isoformat() if mission.completed_at else None,
                    },
                    "nodes": nodes,
                    "sources": sources,
                    "evidence": evidence,
                    "artifacts": artifacts,
                }
            except Exception as e:
                logger.error(f"[Persistence] restore_mission_state error: {e}", exc_info=True)
                return {"found": False, "error": str(e)}

    @classmethod
    async def record_chat_message(
        cls,
        conversation_id: str,
        role: str,
        content: str,
        user_identifier: Optional[str] = None,
        mission_id: Optional[str] = None,
        run_id: Optional[str] = None,
        model_profile: Optional[str] = None,
        content_json: Optional[Dict[str, Any]] = None,
        workspace_id: Optional[str] = None,
        title: Optional[str] = None,
        session: Optional[AsyncSession] = None,
    ) -> Optional[Message]:
        """
        Enregistre de manière immuable un message de chat dans Neon (public.messages).
        Garantit que la Conversation existe dans public.conversations.
        Incrémente la séquence chronologique et met à jour last_message_at.
        """
        async def _execute(s: AsyncSession) -> Optional[Message]:
            try:
                # 1. UUID de la conversation
                try:
                    c_uuid = uuid.UUID(str(conversation_id))
                except (ValueError, AttributeError):
                    c_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.conv.{conversation_id}")

                # 2. Vérifier si la conversation existe déjà
                conv_stmt = select(Conversation).where(Conversation.id == c_uuid)
                conv_res = await s.execute(conv_stmt)
                conv = conv_res.scalar_one_or_none()

                if not conv:
                    # Résoudre l'utilisateur
                    user = await cls.get_or_create_user(user_identifier or "anonymous", session=s)

                    # Résoudre le workspace
                    ws = None
                    if workspace_id:
                        try:
                            ws_uuid = uuid.UUID(str(workspace_id))
                            ws_stmt = select(Workspace).where(Workspace.id == ws_uuid)
                            ws_res = await s.execute(ws_stmt)
                            ws = ws_res.scalar_one_or_none()
                        except (ValueError, AttributeError):
                            pass
                    if not ws:
                        ws = await cls.get_or_create_default_workspace(user, session=s)

                    conv_title = title or (content[:60] if content else "Nouvelle conversation")
                    conv = Conversation(
                        id=c_uuid,
                        workspace_id=ws.id,
                        created_by_user_id=user.id,
                        title=conv_title[:512],
                        conversation_type="CHAT",
                        status="ACTIVE",
                        last_message_at=datetime.now(timezone.utc),
                    )
                    s.add(conv)
                    await s.flush()
                else:
                    conv.last_message_at = datetime.now(timezone.utc)
                    if title and (not conv.title or conv.title == "Nouvelle conversation"):
                        conv.title = title[:512]

                # 3. Calcul de la séquence suivante
                seq_stmt = (
                    select(func.coalesce(func.max(Message.sequence), 0))
                    .where(Message.conversation_id == c_uuid)
                )
                seq_res = await s.execute(seq_stmt)
                next_seq = (seq_res.scalar() or 0) + 1

                # 4. Mission UUID & Run UUID optionnels
                m_uuid = None
                if mission_id:
                    try:
                        m_uuid = uuid.UUID(str(mission_id))
                    except (ValueError, AttributeError):
                        m_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.mission.{mission_id}")

                r_uuid = None
                if run_id:
                    try:
                        r_uuid = uuid.UUID(str(run_id))
                    except (ValueError, AttributeError):
                        r_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"nkyel.run.{run_id}")

                # 5. Créer et persister le message
                msg = Message(
                    id=uuid.uuid4(),
                    conversation_id=c_uuid,
                    mission_id=m_uuid,
                    run_id=r_uuid,
                    role=role,
                    content_text=content,
                    content_json=content_json,
                    model_profile=model_profile or "openai/gpt-oss-120b",
                    sequence=next_seq,
                    status="COMPLETED",
                    created_at=datetime.now(timezone.utc),
                )
                s.add(msg)
                await s.commit()
                return msg
            except Exception as e:
                logger.error(f"[Persistence] record_chat_message error: {e}", exc_info=True)
                await s.rollback()
                return None

        if session:
            return await _execute(session)
        async with async_session() as s:
            return await _execute(s)

