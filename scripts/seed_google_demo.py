"""
Ñkyel AI — Google Demo Isolated Tenant Seeder · SmartANDJ AI Technologies
Initialise des données de démonstration propres et exemplaires pour le Reviewer Google AI :
- Tenant isolé : google-demo-isolated-2026
- Scénario 1 : Recherche approfondie & Analyse du Code Forestier Gabonais (Tavily + Gemini)
- Scénario 2 : WorkGraph interactif & Détection de contradictions
- Scénario 3 : Compréhension multimodale et traduction Fang/Mpongwe/Punu

Fondateur : Daniel Jonathan ANDJ
"""

import asyncio
import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import select

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from db.session import AsyncSessionLocal, init_db
from db.models import (
    User,
    UserRole,
    Language,
    Conversation,
    NkyelMode,
    Message,
    MessageRole,
    Artifact,
    AgentMemory,
    WorkGraphEventRecord,
)

GOOGLE_DEMO_CLERK_SUB = "user_google_reviewer_demo_2026"
GOOGLE_DEMO_EMAIL = "reviewer.google@smartandjai.com"


async def seed_google_demo():
    print("🚀 Initialisation du tenant isolé Google Demo...")
    await init_db()

    async with AsyncSessionLocal() as session:
        # 1. Créer ou récupérer l'utilisateur reviewer Google
        stmt = select(User).where(User.clerk_sub == GOOGLE_DEMO_CLERK_SUB)
        res = await session.execute(stmt)
        demo_user = res.scalar_one_or_none()

        if not demo_user:
            demo_user = User(
                clerk_sub=GOOGLE_DEMO_CLERK_SUB,
                email=GOOGLE_DEMO_EMAIL,
                name="Google AI Reviewer (Instance Démo)",
                role=UserRole.pro,
                preferred_language=Language.fr,
                is_active=True,
                tokens_used=14200,
            )
            session.add(demo_user)
            await session.commit()
            await session.refresh(demo_user)
            print(f"✅ Utilisateur Démo créé (ID: {demo_user.id})")
        else:
            print(f"ℹ️ Utilisateur Démo existant (ID: {demo_user.id})")

        # 2. Conversation 1 : Stratégie Économique & Forêt du Gabon (Multimodal + Tavily)
        conv1_stmt = select(Conversation).where(
            Conversation.user_id == demo_user.id,
            Conversation.title == "Analyse Stratégique : Forêt du Bassin du Congo & Crédits Carbone"
        )
        conv1_res = await session.execute(conv1_stmt)
        conv1 = conv1_res.scalar_one_or_none()

        if not conv1:
            conv1 = Conversation(
                user_id=demo_user.id,
                title="Analyse Stratégique : Forêt du Bassin du Congo & Crédits Carbone",
                mode=NkyelMode.pro,
                is_archived=False,
            )
            session.add(conv1)
            await session.commit()
            await session.refresh(conv1)

            msg1 = Message(
                conversation_id=conv1.id,
                role=MessageRole.user,
                content="Peux-tu analyser les opportunités du Gabon dans la valorisation des crédits carbone souverains et synthétiser les exigences du Code Forestier ?",
                mode=NkyelMode.pro,
                language=Language.fr,
                web_search_used=True,
            )
            msg2 = Message(
                conversation_id=conv1.id,
                role=MessageRole.assistant,
                content="### Synthèse Stratégique : Valorisation Carbone & Cadre Légal Gabonais\n\nLe Gabon se positionne comme un leader mondial de l'absorption nette de carbone grâce au couvert forestier du Bassin du Congo (~88% du territoire national).\n\n#### Piliers Clés Identifiés :\n1. **Cadre Juridique Souverain** : La Loi sur les Changements Climatiques et le Code Forestier encadrent l'attribution des crédits.\n2. **Certifications REDD+** : 90 millions de tonnes de crédits certifiés UNFCCC.\n3. **Valorisation Locale** : Transformation industrielle du bois et préservation de la biodiversité.",
                mode=NkyelMode.pro,
                language=Language.fr,
                tokens=850,
                web_search_used=True,
            )
            session.add_all([msg1, msg2])

            # Artefact associé
            art1 = Artifact(
                id=f"art_google_demo_{uuid.uuid4().hex[:8]}",
                user_id=demo_user.id,
                title="Rapport de Synthèse — Crédits Carbone Gabon 2026",
                artifact_type="document",
                content="# Synthèse Stratégique Carbone Gabon\n\nDocument préparé par l'agent autonome Ñkyel pour l'évaluation Google AI.",
                version=1,
            )
            session.add(art1)
            print("✅ Conversation Démo 1 et Artefact créés.")

        # 3. Mémoire persistante DeerMem
        mem_stmt = select(AgentMemory).where(
            AgentMemory.user_id == demo_user.id,
            AgentMemory.key == "user_preference_focus"
        )
        mem_res = await session.execute(mem_stmt)
        if not mem_res.scalar_one_or_none():
            mem = AgentMemory(
                user_id=demo_user.id,
                namespace=f"user/{demo_user.id}/global",
                key="user_preference_focus",
                content="Intérêt majeur pour les systèmes agentiques durables, les graphes de travail vérifiables et les langues gabonaises (Fang, Mpongwe, Punu).",
            )
            session.add(mem)
            print("✅ Mémoire persistante DeerMem initialisée.")

        await session.commit()
        print("🎉 Ensemencement du tenant Google Demo terminé avec succès !")


if __name__ == "__main__":
    asyncio.run(seed_google_demo())
