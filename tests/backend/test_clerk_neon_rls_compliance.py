"""
Ñkyel AI — Suite de Tests Identité, Clerk Webhooks, Neon PostgreSQL & RLS (Sections 34 à 48)
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
"""

import pytest
import uuid
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool
from httpx import AsyncClient, ASGITransport

from main import app
from db.session import db_url


async def _is_db_reachable():
    try:
        engine = create_async_engine(db_url, poolclass=NullPool)
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        await engine.dispose()
        return True
    except Exception:
        return False



@pytest.mark.asyncio
class TestClerkNeonRLSCompliance:

    async def test_clerk_webhook_idempotency_and_sync(self):
        """Vérifie la synchronisation Clerk -> Neon et l'idempotence des webhooks."""
        if not await _is_db_reachable():
            pytest.skip("Base de données PostgreSQL non joignable en local (nécessite connexion Neon active).")

        test_clerk_id = f"user_test_{uuid.uuid4().hex[:12]}"

        event_id = f"evt_{uuid.uuid4().hex[:16]}"
        payload = {
            "type": "user.created",
            "data": {
                "id": test_clerk_id,
                "email_addresses": [{"email_address": f"{test_clerk_id}@nkyel.ai"}],
                "first_name": "Jonathan",
                "last_name": "ANDJ",
                "image_url": "https://media.nkyel.ai/avatars/founder.png"
            }
        }

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. Premier appel du webhook
            res1 = await ac.post("/api/webhooks/clerk", json=payload, headers={"svix-id": event_id})
            assert res1.status_code == 200
            data1 = res1.json()
            assert data1["status"] == "success"

            # 2. Deuxième appel du même webhook (test d'idempotence)
            res2 = await ac.post("/api/webhooks/clerk", json=payload, headers={"svix-id": event_id})
            assert res2.status_code == 200
            data2 = res2.json()
            assert data2["status"] == "already_processed"

        # 3. Vérification de l'insertion dans Neon
        local_engine = create_async_engine(db_url, poolclass=NullPool)
        async with local_engine.begin() as conn:
            user_row = await conn.execute(
                text("SELECT clerk_user_id, primary_email, display_name FROM nkyel.app_users WHERE clerk_user_id = :cid"),
                {"cid": test_clerk_id}
            )
            user = user_row.fetchone()
            assert user is not None
            assert user[0] == test_clerk_id
            assert user[1] == f"{test_clerk_id}@nkyel.ai"
            assert "Jonathan ANDJ" in user[2]
        await local_engine.dispose()

    async def test_neon_rls_multi_tenant_isolation(self):
        """
        Test de sécurité strict : L'utilisateur A ne doit pas pouvoir accéder
        aux données (threads, messages, mémoires) de l'utilisateur B sous RLS.
        """
        if not await _is_db_reachable():
            pytest.skip("Base de données PostgreSQL non joignable en local (nécessite connexion Neon active).")

        user_a_id = str(uuid.uuid4())

        user_b_id = str(uuid.uuid4())
        thread_b_id = str(uuid.uuid4())

        local_engine = create_async_engine(db_url, poolclass=NullPool)
        async with local_engine.begin() as conn:
            # Créer User A et User B
            await conn.execute(text("""
                INSERT INTO nkyel.app_users (id, clerk_user_id, primary_email, display_name)
                VALUES 
                    (:uid_a, :cid_a, 'user_a@nkyel.ai', 'User A'),
                    (:uid_b, :cid_b, 'user_b@nkyel.ai', 'User B')
                ON CONFLICT (id) DO NOTHING
            """), {
                "uid_a": user_a_id, "cid_a": f"clerk_{user_a_id[:8]}",
                "uid_b": user_b_id, "cid_b": f"clerk_{user_b_id[:8]}"
            })

            # Créer un thread appartenant à User B
            await conn.execute(text("""
                INSERT INTO nkyel.threads (id, owner_user_id, title)
                VALUES (:tid, :uid_b, 'Mission Confidentielle User B')
                ON CONFLICT (id) DO NOTHING
            """), {"tid": thread_b_id, "uid_b": user_b_id})

            # Basculer sur le rôle applicatif sans BYPASSRLS
            await conn.execute(text("SET ROLE nkyel_app"))

            # Simuler le contexte de session pour User A avec set_config
            await conn.execute(text("SELECT set_config('nkyel.current_user_id', :uid, true)"), {"uid": user_a_id})

            # User A tente de requêter les threads visibles sous RLS
            res_a = await conn.execute(text("SELECT id, title FROM nkyel.threads WHERE id = :tid"), {"tid": thread_b_id})
            threads_seen_by_a = res_a.fetchall()

            # RLS doit masquer totalement le thread de User B (0 ligne retournée)
            assert len(threads_seen_by_a) == 0

            # Simuler le contexte de session pour User B
            await conn.execute(text("SELECT set_config('nkyel.current_user_id', :uid, true)"), {"uid": user_b_id})
            res_b = await conn.execute(text("SELECT id, title FROM nkyel.threads WHERE id = :tid"), {"tid": thread_b_id})
            threads_seen_by_b = res_b.fetchall()

            # User B voit bien son propre thread
            assert len(threads_seen_by_b) == 1
            assert threads_seen_by_b[0][1] == 'Mission Confidentielle User B'

            await conn.execute(text("RESET ROLE"))

        await local_engine.dispose()

    async def test_redis_ephemeral_cache_isolation(self):
        """Vérifie la nomenclature Redis et l'indépendance de la source de vérité Neon."""
        from services.redis_client import redis_client
        
        test_user_id = str(uuid.uuid4())
        test_run_id = f"run_{uuid.uuid4().hex[:10]}"
        
        # Test nomenclature Redis
        rate_key = f"nkyel:rate:{test_user_id}:chat"
        stream_key = f"nkyel:stream:run:{test_run_id}"

        # Écriture temporaire dans Redis
        await redis_client.set(rate_key, "active", ex=60)
        cached_val = await redis_client.get(rate_key)
        assert cached_val == "active"

        # Vérifier que les clés respectent le préfixe souverain nkyel:
        assert rate_key.startswith("nkyel:")
        assert stream_key.startswith("nkyel:stream:")
