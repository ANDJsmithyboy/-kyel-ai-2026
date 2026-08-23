"""
Ñkyel AI — Tests d'Intégration : Feedback Structuré & Métriques Réelles
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
"""

import os
import uuid
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from db.models import Base, User, UserRole, Language
from services.beta_service import BetaService


@pytest.mark.asyncio
async def test_feedback_and_metrics_calculation(monkeypatch):
    """Vérifie l'enregistrement du feedback et le calcul fidèle des métriques."""
    monkeypatch.setenv("BETA_SIMULATED_NOW_UTC", "2026-08-23T12:00:00Z")

    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    # 1. Créer 5 utilisateurs de test et les inscrire
    users = []
    async with session_factory() as session:
        for i in range(5):
            uid = uuid.uuid4()
            clerk_sub = f"clerk_fb_{i}"
            user = User(
                id=uid,
                clerk_sub=clerk_sub,
                email=f"feedback_tester_{i}@nkyel.ai",
                name=f"Feedback User {i}",
                role=UserRole.free,
                preferred_language=Language.fr,
            )
            session.add(user)
            users.append((uid, clerk_sub))
        await session.commit()

    # Inscrire les 5 utilisateurs
    for uid, csub in users:
        async with session_factory() as session:
            success, msg, seat = await BetaService.enroll_user_atomic(
                session=session,
                user_id=uid,
                clerk_user_id=csub,
            )
            assert success is True

    # 2. Enregistrer 3 feedbacks avec des notes et scores NPS variés
    feedbacks_data = [
        {"rating": 5, "nps": 10, "wtp": "Oui", "succeeded": True},    # Promoteur
        {"rating": 4, "nps": 9, "wtp": "Oui", "succeeded": True},     # Promoteur
        {"rating": 3, "nps": 6, "wtp": "Peut-être", "succeeded": False}, # Détracteur
    ]

    for i, fb in enumerate(feedbacks_data):
        uid, csub = users[i]
        async with session_factory() as session:
            fid = await BetaService.record_feedback(
                session=session,
                user_id=uid,
                clerk_user_id=csub,
                overall_rating=fb["rating"],
                goal_attempted="Synthèse stratégique d'un rapport économique",
                task_succeeded=fb["succeeded"],
                favorite_feature="WorkGraph & VIE",
                priority_improvement="Support audio plus rapide",
                likely_to_reuse=4,
                nps_score=fb["nps"],
                willingness_to_pay=fb["wtp"],
                african_context_interest="Très pertinent pour le contexte gabonais",
                quote_consent=True,
            )
            assert fid is not None

    # 3. Calculer les métriques réelles
    async with session_factory() as session:
        metrics = await BetaService.get_admin_metrics(session)

    # 4. Assertions sur les métriques
    assert metrics["campaign"]["claimed_seats"] == 5
    assert metrics["feedback_metrics"]["total_feedbacks"] == 3
    assert metrics["feedback_metrics"]["feedback_rate_pct"] == 60.0  # 3/5 = 60%
    
    # Note moyenne : (5 + 4 + 3) / 3 = 4.0
    assert metrics["feedback_metrics"]["avg_rating"] == 4.0

    # NPS : 2 promoteurs (10, 9), 0 neutres, 1 détracteur (6) => (2 - 1) / 3 = 33.3%
    assert metrics["feedback_metrics"]["nps"] == 33.3

    # Volonté de payer
    assert metrics["feedback_metrics"]["willingness_to_pay"]["Oui"] == 2
    assert metrics["feedback_metrics"]["willingness_to_pay"]["Peut-être"] == 1

    await engine.dispose()
    print("✅ Test feedback et métriques réussi : calculs mathématiques et agrégations vérifiés.")


@pytest.mark.asyncio
async def test_v1_feedback_api_and_db_persistence():
    """Vérifie l'enregistrement direct de feedback v1 et l'agrégation dynamique des statistiques."""
    from core.database import save_feedback, get_feedback_statistics

    # 1. Enregistrer des feedbacks réels
    fb_id_1 = await save_feedback(
        feedback_type="thumbs_up",
        message_id="msg_101",
        conversation_id="conv_101",
        rating=5,
        comment="Superbe synthèse sur l'économie gabonaise",
        model="gemini-2.5-flash",
    )
    assert fb_id_1 is not None

    fb_id_2 = await save_feedback(
        feedback_type="thumbs_down",
        message_id="msg_102",
        conversation_id="conv_102",
        rating=2,
        comment="Un peu trop verbeux",
        model="gemini-2.5-flash",
    )
    assert fb_id_2 is not None

    # 2. Vérifier les statistiques agrégées
    stats = await get_feedback_statistics()
    assert stats["total"] >= 2
    assert stats["thumbs_up"] >= 1
    assert stats["thumbs_down"] >= 1
    assert 1.0 <= stats["avg_rating"] <= 5.0

