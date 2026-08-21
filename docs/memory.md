# Mémoire Permanente DeerMem & Espaces Souverains

> **SmartANDJ AI Technologies** · **Fondateur** : Daniel Jonathan ANDJ

---

## 1. Les 4 Espaces Mémoire
1. `user/{userId}/global` : Faits permanents, préférences linguistiques, design system.
2. `user/{userId}/projects/{projectId}` : Contexte métier et contraintes d'un projet.
3. `user/{userId}/agents/{agentId}` : Directives apprises et style propre à un agent.
4. `user/{userId}/threads/{threadId}` : Historique et résumés d'une mission donnée.

---

## 2. Persistance Durable
Toutes les mémoires sont persistées dans **Neon PostgreSQL** via l'adaptateur `backend/services/neon_memory_backend.py`.
Le moteur cognitif `DeerMemEngine` extrait automatiquement les faits clés, résout les contradictions et injecte les souvenirs pertinents dans le prompt de mission.
