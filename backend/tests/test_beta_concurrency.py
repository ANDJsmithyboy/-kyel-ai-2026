import asyncio
import uuid
import sys
import os

# Add backend to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from db.session import async_session_maker
from services.beta_service import BetaService
from db.models import BetaCampaign, BetaEnrollment

async def concurrent_enrollment_test():
    print("🚀 Démarrage du test de concurrence pour la Bêta (150 requêtes simultanées)...")
    
    async with async_session_maker() as session:
        # 1. Reset the campaign and enrollments to a clean state
        campaign = await BetaService.get_or_create_default_campaign(session)
        campaign.claimed_seats = 0
        campaign.max_seats = 100
        
        # Clear existing enrollments
        await session.execute(BetaEnrollment.__table__.delete().where(BetaEnrollment.campaign_id == campaign.id))
        await session.commit()
        print("✅ Base de données réinitialisée à 0 places réclamées.")

    async def single_enroll_task(task_id: int):
        user_id = uuid.uuid4()
        clerk_id = f"test_clerk_{task_id}"
        async with async_session_maker() as session:
            success, message, seat = await BetaService.enroll_user_atomic(
                session=session,
                user_id=user_id,
                clerk_user_id=clerk_id
            )
            return success, message, seat

    # Create 150 concurrent tasks
    tasks = [single_enroll_task(i) for i in range(150)]
    results = await asyncio.gather(*tasks)

    successes = sum(1 for r in results if r[0])
    failures = sum(1 for r in results if not r[0])
    
    print(f"\n📊 Résultats du test:")
    print(f"👉 Inscriptions réussies : {successes}")
    print(f"👉 Inscriptions refusées : {failures}")
    
    # Assertions
    assert successes == 100, f"Erreur : On attend 100 succès, on a eu {successes}"
    assert failures == 50, f"Erreur : On attend 50 refus, on a eu {failures}"

    async with async_session_maker() as session:
        campaign = await BetaService.get_or_create_default_campaign(session)
        print(f"👉 Places réclamées en base : {campaign.claimed_seats}/100")
        assert campaign.claimed_seats == 100, "Erreur: La base de données a dépassé 100 places!"
        
    print("\n✅ TEST DE CONCURRENCE RÉUSSI : LE CAP DES 100 PLACES EST INVIOLABLE !")

if __name__ == "__main__":
    asyncio.run(concurrent_enrollment_test())
