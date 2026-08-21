# UPSTREAM_SYNC.md — Synchronisation Upstream DeerFlow 2.0 & Ñkyel AI

**Auteur** : Principal AI Systems Architect & Staff Engineer (Ñkyel AI)  
**Fondateur** : Daniel Jonathan ANDJ · SmartANDJ AI Technologies  
**Dépôt Upstream Officiel** : [https://github.com/bytedance/deer-flow](https://github.com/bytedance/deer-flow)  
**Dépôt Fork Souverain** : [https://github.com/ANDJsmithyboy/-kyel-ai-2026](https://github.com/ANDJsmithyboy/-kyel-ai-2026)  

---

## 1. Contexte & Historique de Synchronisation

| Propriété | État / Valeur |
| :--- | :--- |
| **Upstream Repository** | `https://github.com/bytedance/deer-flow.git` |
| **Upstream Branch** | `main` |
| **Commit Upstream Intégré** | `3f8a92b` (DeerFlow 2.0.4 Core Release) |
| **Commit Fork Initial (Gaboma/Ñkyel)** | `59ada2c` |
| **Commit Souverain Actuel** | `79c605a` |
| **Date de Synchronisation** | 20 Août 2026 |

---

## 2. Inventaire des Extensions & Spécificités Ñkyel AI Conservées

1. **Design System & Expérience Modèle (Apple + Wada Sanzo)** :
   - Tokens chromatiques sémantiques 88% neutres (`#08090D`, `#0E121A`, `#151922`, `#F1EEE7`) et 12% accents (`#665F9E`, `#315A70`, `#6F9485`, `#C39A52`).
   - Logo heptagramme souverain à 7 branches (`NkyelSeptBranchLogo.tsx`).
   - Mode Switcher fluide Apple Spring entre **Conversation** et **Mission VIE**.

2. **Moteur d'Orchestration Agentique Ñkyel StateGraph** :
   - Normalisation canonique d'événements `NkyelEvent` (23 types append-only).
   - Intégration directe de Gemini Multimodal (`gemini-2.5-flash`, `gemini-2.5-pro`) via le registre dynamique sans nom codé en dur.
   - Support natif du Sandbox AIO (`enterprise-public-cn-beijing.cr.volces.com/vefaas-public/all-in-one-sandbox:1.11.0`).

3. **Couche de Protocoles Souverains** :
   - **MCP** : Registre avec passerelle de permissions, validation de schéma et audit logging.
   - **Skills** : Chargeur de capacités avec support direct `SKILL.md`.
   - **A2A (Agent-to-Agent)** : Cartes d'agents et négociation de tâches mesh.
   - **AG-UI** : Streaming d'événements 60 FPS vers React Flow.
   - **A2UI** : Rendu déclaratif sécurisé zero-eval (cartes, formulaires, tables).

4. **Persistance & Mémoire** :
   - **Neon PostgreSQL** : Source de vérité durable pour conversations, checkpoints, métadonnées et événements.
   - **Redis (Upstash)** : Coordination distribuée, verrous d'exécution et streaming SSE fan-out.
   - **DeerMem** : Mémoire sémantique native avec isolation stricte par identifiant Clerk `sub`.

---

## 3. Matrice de Résolution des Conflits

| Fichier / Composant | Source du Conflit | Stratégie de Résolution Adoptée |
| :--- | :--- | :--- |
| `backend/services/deerflow_service.py` | Format d'événements upstream vs AG-UI | Encapsulation via l'Event Normalizer Ñkyel sans altérer le contrat SSE upstream. |
| `backend/core/config.py` | Paramètres d'environnement | Fusion stricte avec validation Pydantic Settings v2, isolation des secrets. |
| `backend/core/security.py` | Auth générique vs Clerk RS256 | Implémentation du `ClerkAuthAdapter` avec vérification JWKS et clé immuable `sub`. |
| `ZION-CORE-V2/src/lib/models.ts` | Types de rendus / artefacts | Extension des types pour supporter les 7 onglets d'Artifact Studio et les cards A2UI. |

---

## 4. Commandes de Validation Exécutées

```bash
# Vérification de l'intégrité du code Python
pytest tests/backend/ -v

# Vérification du build Frontend Next.js (Turbopack)
cd ZION-CORE-V2 && pnpm build

# Validation du healthcheck et des protocoles
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/nkyel/health
```
