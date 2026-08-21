"""
Ñkyel AI — Test Critique de Concurrence : Attribution Atomique des 100 Places
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

Simule 120 inscriptions simultanées concurrentes (ex: vague de trafic massif).
Résultat obligatoire :
- Exactement 100 places attribuées
- Aucun doublon de numéro de siège
- Numéros de sièges strictement compris entre 1 et 100
- 20 utilisateurs rejetés avec message de capacité atteinte
"""

import os
import uuid
import asyncio
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from db.models import Base, BetaCampaign, BetaEnrollment, User, UserRole, Language
from services.beta_service import BetaService, DEFAULT_CAMPAIGN_SLUG


@pytest.mark.asyncio
async def test_atomic_120_concurrency_enrollment(monkeypatch):
    """Simule 120 requêtes simultanées et vérifie que la limite de 100 est strictement respectée."""
    # Simuler que la bêta est dans la fenêtre ouverte
    monkeypatch.setenv("BETA_SIMULATED_NOW_UTC", "2026-08-22T14:00:00Z")
    monkeypatch.delenv("BETA_FORCE_STATE", raising=False)
    monkeypatch.delenv("BETA_KILL_SWITCH", raising=False)

    # Base de données SQLite en mémoire pour isolation complète
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    # 1. Initialiser la campagne
    async with session_factory() as session:
        campaign = await BetaService.get_or_create_default_campaign(session)
        assert campaign.max_seats == 100
        assert campaign.claimed_seats == 0

    # 2. Préparer 120 utilisateurs distincts
    users_data = []
    async with session_factory() as session:
        for i in range(120):
            uid = uuid.uuid4()
            clerk_sub = f"clerk_user_{i}_{uuid.uuid4().hex[:6]}"
            user = User(
                id=uid,
                clerk_sub=clerk_sub,
                email=f"tester{i}@nkyel.ai",
                name=f"Tester #{i}",
                role=UserRole.free,
                preferred_language=Language.fr,
            )
            session.add(user)
            users_data.append((uid, clerk_sub))
        await session.commit()

    # 3. Fonction concurrente d'inscription
    async def enroll_worker(u_id: uuid.UUID, c_sub: str):
        async with session_factory() as s:
            return await BetaService.enroll_user_atomic(
                session=s,
                user_id=u_id,
                clerk_user_id=c_sub,
                locale="fr",
            )

    # 4. Lancement de 120 requêtes simultanées
    tasks = [enroll_worker(u_id, c_sub) for u_id, c_sub in users_data]
    results = await asyncio.gather(*tasks)

    # 5. Assertions Strictes
    successful = [r for r in results if r[0] is True]
    failed = [r for r in results if r[0] is False]

    # Exactement 100 succès et 20 échecs
    assert len(successful) == 100, f"Attendu: 100 succès, Obtenu: {len(successful)}"
    assert len(failed) == 20, f"Attendu: 20 échecs, Obtenu: {len(failed)}"

    # Vérification des numéros de sièges
    seat_numbers = [r[2] for r in successful]
    assert len(set(seat_numbers)) == 100, "Doublons détectés dans les numéros de sièges !"
    assert min(seat_numbers) == 1, f"Siège minimum invalide: {min(seat_numbers)}"
    assert max(seat_numbers) == 100, f"Siège maximum invalide: {max(seat_numbers)}"
    assert sorted(seat_numbers) == list(range(1, 101)), "La séquence des sièges n'est pas 1..100 continue !"

    # Vérification des messages d'échec
    for f in failed:
        assert "Toutes les places ont été attribuées" in f[1]

    # Vérification en base
    async with session_factory() as session:
        campaign = await BetaService.get_or_create_default_campaign(session)
        assert campaign.claimed_seats == 100

    await engine.dispose()
    print("✅ Test de concurrence réussi : 100 places attribuées, 0 dépassement, 20 en liste d'attente.")
