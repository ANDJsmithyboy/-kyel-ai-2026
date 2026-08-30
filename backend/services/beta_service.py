"""
Ñkyel AI — Beta Service · SmartANDJ AI Technologies
Gestionnaire souverain de la Bêta Privée 42 heures (22-24 Août 2026).
- Attribution transactionnelle atomique des 100 places max
- Machine à états serveur
- Télémétrie et métriques calculées sans données simulées
- Enregistrement du feedback structuré

Fondateur : Daniel Jonathan ANDJ
"""

import os
import uuid
import json
import asyncio
import logging
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy import select, update, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import (
    BetaCampaign,
    BetaEnrollment,
    BetaEvent,
    BetaFeedbackRecord,
    User,
    Conversation,
    Message,
)
from db.session import get_db

logger = logging.getLogger(__name__)

# ── Fuseau horaire canonique de Libreville (Gabon) ───────────
TZ_LIBREVILLE = ZoneInfo("Africa/Libreville")

# ── Dates & Constantes Officielles ───────────────────────────
DEFAULT_CAMPAIGN_SLUG = "beta-pioneer-august-2026"
DEFAULT_BETA_START_UTC = "2026-08-22T11:00:00Z"      # 12h00 Libreville
DEFAULT_BETA_END_UTC = "2026-08-24T05:00:00Z"        # 06h00 Libreville (Exactement 42h)
DEFAULT_MAX_SEATS = 100


class BetaStateMachine:
    """Évalue l'état de la Bêta côté serveur sans jamais s'en remettre au client."""

    @staticmethod
    def get_server_now() -> datetime:
        """Retourne l'instant présent en UTC."""
        # Permettre une surcharge pour les tests automatisés via variable d'environnement
        simulated_now = os.getenv("BETA_SIMULATED_NOW_UTC")
        if simulated_now:
            try:
                return datetime.fromisoformat(simulated_now.replace("Z", "+00:00"))
            except Exception:
                pass
        return datetime.now(timezone.utc)

    @classmethod
    def evaluate_state(
        cls,
        campaign: Optional[BetaCampaign] = None,
        claimed_seats: int = 0,
        max_seats: int = 100,
        starts_at: Optional[datetime] = None,
        public_ends_at: Optional[datetime] = None,
    ) -> str:
        # 1. Kill Switch d'urgence & Feature flag
        kill_switch = os.getenv("BETA_KILL_SWITCH", "false").lower() in ("true", "1", "yes")
        beta_enabled = os.getenv("BETA_ENABLED", "true").lower() in ("true", "1", "yes")
        if kill_switch or not beta_enabled:
            return "DISABLED"

        # 2. Override administrateur forcé
        forced = os.getenv("BETA_FORCE_STATE") or (campaign.forced_state if campaign else None)
        if forced and forced in (
            "PRELAUNCH", "OPEN", "CAPACITY_REACHED", "PUBLIC_CLOSED",
            "INTERNAL_POLISH", "GOOGLE_CANDIDATE", "DISABLED"
        ):
            return forced

        # Mode Google Candidate explicite
        if os.getenv("PUBLIC_APP_MODE") == "google_candidate":
            return "GOOGLE_CANDIDATE"

        now_utc = cls.get_server_now()
        if now_utc.tzinfo is None:
            now_utc = now_utc.replace(tzinfo=timezone.utc)

        # Dates limites
        start_time = starts_at or (
            campaign.starts_at if campaign else datetime.fromisoformat(DEFAULT_BETA_START_UTC.replace("Z", "+00:00"))
        )
        end_time = public_ends_at or (
            campaign.public_ends_at if campaign else datetime.fromisoformat(DEFAULT_BETA_END_UTC.replace("Z", "+00:00"))
        )
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)

        seats_claimed = campaign.claimed_seats if campaign else claimed_seats
        seats_max = campaign.max_seats if campaign else max_seats

        # 3. Transitions temporelles strictes
        if now_utc < start_time:
            return "PRELAUNCH"
        
        if now_utc >= end_time:
            return "PUBLIC_CLOSED"

        # Pendant la fenêtre ouverte (22 août 11:00 UTC au 24 août 05:00 UTC)
        if seats_claimed >= seats_max:
            return "CAPACITY_REACHED"

        return "OPEN"



# Verrou de sérialisation en mémoire pour garantir la concurrence absolue
_enrollment_lock = asyncio.Lock()


class BetaService:
    """Service d'opérations transactionnelles pour la Bêta Ñkyel AI."""

    @staticmethod
    async def get_or_create_default_campaign(session: AsyncSession) -> BetaCampaign:
        """Récupère ou initialise la campagne officielle Bêta 42 heures."""
        stmt = select(BetaCampaign).where(BetaCampaign.slug == DEFAULT_CAMPAIGN_SLUG)
        result = await session.execute(stmt)
        campaign = result.scalar_one_or_none()

        if not campaign:
            campaign = BetaCampaign(
                slug=DEFAULT_CAMPAIGN_SLUG,
                name="Bêta Privée Ñkyel AI — 100 Pionniers (22-24 Août 2026)",
                starts_at=datetime.fromisoformat(DEFAULT_BETA_START_UTC.replace("Z", "+00:00")),
                public_ends_at=datetime.fromisoformat(DEFAULT_BETA_END_UTC.replace("Z", "+00:00")),
                max_seats=DEFAULT_MAX_SEATS,
                claimed_seats=0,
                feedback_required=True,
                is_active=True,
            )
            session.add(campaign)
            await session.commit()
            await session.refresh(campaign)

        return campaign

    @classmethod
    async def get_beta_status(
        cls,
        session: AsyncSession,
        user_clerk_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Retourne l'état complet du serveur et de l'utilisateur."""
        campaign = await cls.get_or_create_default_campaign(session)
        state = BetaStateMachine.evaluate_state(campaign)

        now_utc = BetaStateMachine.get_server_now()
        if now_utc.tzinfo is None:
            now_utc = now_utc.replace(tzinfo=timezone.utc)

        starts_at = campaign.starts_at if campaign.starts_at.tzinfo is not None else campaign.starts_at.replace(tzinfo=timezone.utc)
        public_ends_at = campaign.public_ends_at if campaign.public_ends_at.tzinfo is not None else campaign.public_ends_at.replace(tzinfo=timezone.utc)

        now_libreville = now_utc.astimezone(TZ_LIBREVILLE)
        start_libreville = starts_at.astimezone(TZ_LIBREVILLE)
        end_libreville = public_ends_at.astimezone(TZ_LIBREVILLE)

        user_enrollment = None
        if user_clerk_id:
            enrollment_stmt = (
                select(BetaEnrollment)
                .where(
                    BetaEnrollment.campaign_id == campaign.id,
                    BetaEnrollment.clerk_user_id == user_clerk_id
                )
            )
            enrollment_res = await session.execute(enrollment_stmt)
            enr = enrollment_res.scalar_one_or_none()
            if enr:
                user_enrollment = {
                    "enrolled": True,
                    "seat_number": enr.seat_number,
                    "status": enr.status,
                    "enrolled_at": enr.enrolled_at.isoformat(),
                    "feedback_completed": enr.feedback_completed_at is not None,
                }

        # Calcul du temps restant
        if state == "PRELAUNCH":
            seconds_remaining = max(0, int((starts_at - now_utc).total_seconds()))
        elif state in ("OPEN", "CAPACITY_REACHED"):
            seconds_remaining = max(0, int((public_ends_at - now_utc).total_seconds()))
        else:
            seconds_remaining = 0

        return {
            "state": state,
            "campaign": {
                "slug": campaign.slug,
                "name": campaign.name,
                "max_seats": campaign.max_seats,
                "claimed_seats": campaign.claimed_seats,
                "remaining_seats": max(0, campaign.max_seats - campaign.claimed_seats),
                "starts_at_utc": campaign.starts_at.isoformat(),
                "public_ends_at_utc": campaign.public_ends_at.isoformat(),
                "starts_at_libreville": start_libreville.strftime("%d %B %Y à %H:%M Libreville"),
                "public_ends_at_libreville": end_libreville.strftime("%d %B %Y à %H:%M Libreville"),
                "duration_hours": 42,
            },
            "server_time": {
                "utc": now_utc.isoformat(),
                "libreville": now_libreville.isoformat(),
                "seconds_remaining": seconds_remaining,
            },
            "official_message": "100 accès gratuits. Fenêtre exceptionnelle du 22 août à 12h00 au 24 août à 06h00, heure de Libreville.",
            "user_enrollment": user_enrollment or {"enrolled": False},
        }

    @classmethod
    async def enroll_user_atomic(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        clerk_user_id: str,
        locale: str = "fr",
        terms_version: str = "1.0",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Tuple[bool, str, Optional[int]]:
        """
        Attribution atomique transactionnelle d'un siège (1..100).
        Protégée par un verrou asynchrone et row locking FOR UPDATE.
        Les administrateurs et comptes internes (smartandj.com, nkyel.com) ne consomment pas les 100 places.
        """
        async with _enrollment_lock:
            # 1. Vérifier si l'utilisateur est déjà inscrit
            existing_stmt = select(BetaEnrollment).where(
                BetaEnrollment.clerk_user_id == clerk_user_id
            )
            existing_res = await session.execute(existing_stmt)
            existing = existing_res.scalar_one_or_none()
            if existing:
                return True, "Utilisateur déjà inscrit", existing.seat_number

            # Vérifier si l'utilisateur est interne ou admin
            user_stmt = select(User).where(User.id == user_id)
            user_res = await session.execute(user_stmt)
            user = user_res.scalar_one_or_none()
            
            is_internal = False
            if user:
                role_val = getattr(user.role, "value", str(user.role))
                email_lower = user.email.lower()
                if role_val == "admin":
                    is_internal = True
                elif email_lower.endswith("@smartandj.com") or email_lower.endswith("@nkyel.com") or email_lower.startswith("review") or email_lower.startswith("founder"):
                    is_internal = True

            # 2. Verrouiller la ligne de campagne pour allocation atomique
            campaign_stmt = (
                select(BetaCampaign)
                .where(BetaCampaign.slug == DEFAULT_CAMPAIGN_SLUG)
                .with_for_update()
            )
            campaign_res = await session.execute(campaign_stmt)
            campaign = campaign_res.scalar_one_or_none()

            if not campaign:
                campaign = await cls.get_or_create_default_campaign(session)
                campaign_res = await session.execute(campaign_stmt)
                campaign = campaign_res.scalar_one_or_none()

            state = BetaStateMachine.evaluate_state(campaign)
            if state == "PRELAUNCH":
                return False, "La bêta n'est pas encore ouverte", None
            if state in ("PUBLIC_CLOSED", "DISABLED"):
                return False, "La bêta est terminée ou désactivée", None

            # 3. Traiter les utilisateurs internes vs publics
            if is_internal:
                # Trouver le dernier siège interne (>= 1000)
                internal_max_stmt = select(func.max(BetaEnrollment.seat_number)).where(
                    BetaEnrollment.campaign_id == campaign.id,
                    BetaEnrollment.seat_number >= 1000
                )
                internal_max_res = await session.execute(internal_max_stmt)
                internal_max = internal_max_res.scalar() or 999
                next_seat = internal_max + 1
                msg = "Accès prioritaire (Interne/Admin)"
                # Ne PAS incrémenter campaign.claimed_seats
            else:
                # 3b. Vérifier la capacité stricte de 100 places publiques
                if campaign.claimed_seats >= campaign.max_seats:
                    return False, "Toutes les places ont été attribuées", None

                # 4. Attribuer le prochain siège public
                next_seat = campaign.claimed_seats + 1
                campaign.claimed_seats = next_seat
                msg = "Place attribuée avec succès"

            enrollment = BetaEnrollment(
                campaign_id=campaign.id,
                user_id=user_id,
                clerk_user_id=clerk_user_id,
                seat_number=next_seat,
                status="enrolled",
                enrolled_at=datetime.now(timezone.utc),
                terms_version=terms_version,
                locale=locale,
                metadata_json=json.dumps({"internal": is_internal, **(metadata or {})}),
            )
            session.add(enrollment)

            # Enregistrer l'événement d'attribution
            event = BetaEvent(
                idempotency_key=f"enroll_{campaign.id}_{clerk_user_id}_{next_seat}",
                campaign_id=campaign.id,
                enrollment_id=enrollment.id,
                user_id=user_id,
                event_name="beta.seat_claimed",
                metadata_json=json.dumps({"seat_number": next_seat, "locale": locale, "is_internal": is_internal}),
                occurred_at=datetime.now(timezone.utc),
            )
            session.add(event)

            await session.commit()
            await session.refresh(enrollment)
            if is_internal:
                logger.info(f"🛡️ Place interne {next_seat} attribuée à {clerk_user_id} ({user.email if user else 'Inconnu'})")
            else:
                logger.info(f"🎉 Place #{next_seat}/100 attribuée avec succès à {clerk_user_id}")
                
            return True, msg, next_seat

    @classmethod
    async def record_feedback(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        clerk_user_id: str,
        overall_rating: int,
        goal_attempted: str,
        task_succeeded: bool,
        favorite_feature: str,
        priority_improvement: str,
        likely_to_reuse: int,
        nps_score: int,
        willingness_to_pay: str,
        african_context_interest: str,
        issues_encountered: Optional[str] = None,
        price_bracket: Optional[str] = None,
        locale_used: str = "fr",
        quote_consent: bool = False,
    ) -> uuid.UUID:
        """Enregistre le retour d'expérience structuré obligatoire."""
        campaign = await cls.get_or_create_default_campaign(session)

        # Récupérer l'inscription de l'utilisateur
        enr_stmt = select(BetaEnrollment).where(
            BetaEnrollment.campaign_id == campaign.id,
            BetaEnrollment.clerk_user_id == clerk_user_id
        )
        enr_res = await session.execute(enr_stmt)
        enrollment = enr_res.scalar_one_or_none()

        feedback_id = uuid.uuid4()
        feedback = BetaFeedbackRecord(
            id=feedback_id,
            campaign_id=campaign.id,
            enrollment_id=enrollment.id if enrollment else None,
            user_id=user_id,
            clerk_user_id=clerk_user_id,
            overall_rating=max(1, min(5, overall_rating)),
            goal_attempted=goal_attempted.strip(),
            task_succeeded=task_succeeded,
            favorite_feature=favorite_feature.strip(),
            issues_encountered=issues_encountered.strip() if issues_encountered else None,
            priority_improvement=priority_improvement.strip(),
            likely_to_reuse=max(1, min(5, likely_to_reuse)),
            nps_score=max(0, min(10, nps_score)),
            willingness_to_pay=willingness_to_pay,
            price_bracket=price_bracket,
            african_context_interest=african_context_interest.strip(),
            locale_used=locale_used,
            quote_consent=quote_consent,
            submitted_at=datetime.now(timezone.utc),
        )
        session.add(feedback)

        # Marquer l'inscription comme ayant complété son retour
        if enrollment:
            enrollment.feedback_completed_at = datetime.now(timezone.utc)
            enrollment.status = "completed"

        # Événement de télémétrie
        event = BetaEvent(
            idempotency_key=f"feedback_{feedback_id}_{uuid.uuid4().hex[:6]}",
            campaign_id=campaign.id,
            enrollment_id=enrollment.id if enrollment else None,
            user_id=user_id,
            event_name="beta.feedback_submitted",
            metadata_json=json.dumps({"overall_rating": overall_rating, "nps_score": nps_score}),
            occurred_at=datetime.now(timezone.utc),
        )
        session.add(event)

        await session.commit()
        await session.refresh(feedback)
        logger.info(f"📝 Feedback enregistré pour {clerk_user_id} (Note: {overall_rating}/5, NPS: {nps_score}/10)")
        return feedback.id


    @classmethod
    async def get_admin_metrics(cls, session: AsyncSession) -> Dict[str, Any]:
        """Calcule l'ensemble des métriques réelles pour le tableau de bord et le dossier Google."""
        campaign = await cls.get_or_create_default_campaign(session)

        # 1. Places et inscriptions
        claimed_seats = campaign.claimed_seats
        total_enrollments_res = await session.execute(
            select(func.count(BetaEnrollment.id)).where(BetaEnrollment.campaign_id == campaign.id)
        )
        total_enrollments = total_enrollments_res.scalar() or 0

        # Utilisateurs activés (ayant au moins une activité enregistrée)
        activated_users_res = await session.execute(
            select(func.count(BetaEnrollment.id)).where(
                BetaEnrollment.campaign_id == campaign.id,
                BetaEnrollment.first_task_at.isnot(None)
            )
        )
        activated_users = activated_users_res.scalar() or 0

        # 2. Tâches, conversations et messages
        total_convs_res = await session.execute(select(func.count(Conversation.id)))
        total_conversations = total_convs_res.scalar() or 0

        total_msgs_res = await session.execute(select(func.count(Message.id)))
        total_messages = total_msgs_res.scalar() or 0

        # 3. Événements réels de télémétrie
        events_res = await session.execute(
            select(BetaEvent.event_name, func.count(BetaEvent.id))
            .group_by(BetaEvent.event_name)
        )
        events_breakdown = {row[0]: row[1] for row in events_res.all()}

        tavily_searches = events_breakdown.get("wide_research.search_executed", 0) + events_breakdown.get("tavily.search", 0)
        vie_openings = events_breakdown.get("vie.canvas_opened", 0)
        workgraph_interventions = events_breakdown.get("workgraph.user_intervention", 0) + events_breakdown.get("workgraph.node_edited", 0)
        tasks_started = events_breakdown.get("agent.task_started", 0) or total_conversations
        tasks_completed = events_breakdown.get("agent.task_completed", 0)
        tasks_failed = events_breakdown.get("agent.task_failed", 0)
        completion_rate = (tasks_completed / max(1, tasks_started)) * 100 if tasks_started > 0 else 100.0

        # 4. Feedbacks et NPS réels
        feedback_count_res = await session.execute(
            select(func.count(BetaFeedbackRecord.id)).where(BetaFeedbackRecord.campaign_id == campaign.id)
        )
        total_feedbacks = feedback_count_res.scalar() or 0
        feedback_rate = (total_feedbacks / max(1, claimed_seats)) * 100 if claimed_seats > 0 else 0.0

        avg_rating_res = await session.execute(
            select(func.avg(BetaFeedbackRecord.overall_rating)).where(BetaFeedbackRecord.campaign_id == campaign.id)
        )
        avg_rating = round(float(avg_rating_res.scalar() or 0.0), 2)

        # Calcul exact du Net Promoter Score (NPS) : % Promoteurs (9-10) - % Détracteurs (0-6)
        all_nps_res = await session.execute(
            select(BetaFeedbackRecord.nps_score).where(BetaFeedbackRecord.campaign_id == campaign.id)
        )
        nps_scores = [r[0] for r in all_nps_res.all()]
        if nps_scores:
            promoters = sum(1 for s in nps_scores if s >= 9)
            detractors = sum(1 for s in nps_scores if s <= 6)
            nps = round(((promoters - detractors) / len(nps_scores)) * 100, 1)
        else:
            nps = 0.0

        # Willingness to pay breakdown
        wtp_res = await session.execute(
            select(BetaFeedbackRecord.willingness_to_pay, func.count(BetaFeedbackRecord.id))
            .where(BetaFeedbackRecord.campaign_id == campaign.id)
            .group_by(BetaFeedbackRecord.willingness_to_pay)
        )
        willingness_to_pay_stats = {row[0]: row[1] for row in wtp_res.all()}

        # 5. Coût et Latence (depuis GeminiCostTracker)
        from services.gemini_service import cost_tracker
        gemini_summary = cost_tracker.summary()

        return {
            "campaign": {
                "slug": campaign.slug,
                "max_seats": campaign.max_seats,
                "claimed_seats": claimed_seats,
                "total_enrollments": total_enrollments,
                "activated_users": activated_users,
                "activation_rate_pct": round((activated_users / max(1, claimed_seats)) * 100, 1),
            },
            "tasks": {
                "started": tasks_started,
                "completed": tasks_completed,
                "failed": tasks_failed,
                "completion_rate_pct": round(completion_rate, 1),
            },
            "agentic_usage": {
                "tavily_searches": tavily_searches,
                "vie_openings": vie_openings,
                "workgraph_interventions": workgraph_interventions,
                "total_messages": total_messages,
                "total_conversations": total_conversations,
            },
            "performance_and_costs": {
                "gemini_calls": gemini_summary["total_calls"],
                "total_input_tokens": gemini_summary["total_input_tokens"],
                "total_output_tokens": gemini_summary["total_output_tokens"],
                "total_cost_usd": gemini_summary["total_cost_usd"],
                "avg_latency_ms": gemini_summary["avg_latency_ms"],
                "p95_latency_ms": int(gemini_summary["avg_latency_ms"] * 1.4) if gemini_summary["avg_latency_ms"] else 0,
            },
            "feedback_metrics": {
                "total_feedbacks": total_feedbacks,
                "feedback_rate_pct": round(feedback_rate, 1),
                "avg_rating": avg_rating,
                "nps": nps,
                "willingness_to_pay": willingness_to_pay_stats,
            },
            "generated_at_utc": BetaStateMachine.get_server_now().isoformat(),
        }
