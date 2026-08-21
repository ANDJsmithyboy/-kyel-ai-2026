# Intégration DeerFlow 2.0 & LangGraph StateGraph

> **SmartANDJ AI Technologies** · **Fondateur** : Daniel Jonathan ANDJ

---

## 1. Principes d'Intégration Native

Ñkyel AI utilise directement le moteur **DeerFlow 2.0** sans surcouche concurrente :
* **StateGraph** : Gestionnaire d'état de mission dans `backend/agents/nkyel_graph.py`.
* **Checkpoints** : Sauvegarde d'instantanés LangGraph dans Neon PostgreSQL (`ThreadMetadata`).
* **Sandbox Native AIO** : Utilisation de l'image de conteneur `all-in-one-sandbox:1.11.0` pour l'exécution Python et Bash sécurisée.
* **Outils MCP & Skills** : 10 compétences multimédias enregistrées dans le registre officiel DeerFlow.
