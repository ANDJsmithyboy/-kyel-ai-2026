# Architecture Globale — Ñkyel AI × DeerFlow 2.0

> **SmartANDJ AI Technologies** · **Fondateur** : Daniel Jonathan ANDJ  
> **Date de référence** : Août 2026

---

## 1. Principes Fondateurs

Ñkyel AI est un environnement agentique visuel souverain, combinant le moteur **DeerFlow 2.0**, le cadre de graphe d'état **LangGraph**, et une interface utilisateur temps réel haute précision (**ZION-CORE-V2**).

### Matrice de Stockage Souverain
* **Neon PostgreSQL** : Source unique de vérité pour toutes les données persistantes (Utilisateurs internes, conversations, threads, checkpoints LangGraph, mémoires DeerMem, événements WorkGraph, métadonnées d'artefacts, chunks vectorisés).
* **Cloudflare R2** : Stockage immuable de tous les fichiers binaires (images FLUX, vidéos Wan2.1, audios MeloTTS, rapports PDF de Wide Research) avec isolation stricte `users/{user_id}/...`.
* **Upstash Redis** : Gestion éphémère de coordination (verrous distribués, quotas roulants 48h, files d'attente SSE).

---

## 2. Flux de Données & Événements

```text
[Utilisateur Web/Mobile]
        │
        ▼ (JWT RS256)
 [Clerk Auth Guard]
        │
        ▼ (userId interne)
 [FastAPI Gateway] ──► [LangGraph StateGraph / DeerFlow 2.0]
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 [Wide Research]    [MediaRouter]        [MCP Tool Mesh]
  (Tavily + Nav)   (FLUX & Wan2.1)     (10 Skills Déclarées)
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
           [Event Store Append-Only]
           (Neon / events.sqlite3)
                            │
                            ▼ (SSE / WebSockets)
             [Ñkyel VIE & WorkGraph]
             (@xyflow/react + Timeline)
```

---

## 3. Les 4 Protocoles P4
1. **A2A** : Cartes d'agents et délégations mesh inter-agents.
2. **AG-UI** : Flux d'événements et interruptions d'approbation humaine.
3. **A2UI** : Rendu déclaratif sécurisé sans exécution arbitraire de code.
4. **MCP Apps** : Exécution d'applications interactives dans la sandbox native AIO DeerFlow.
