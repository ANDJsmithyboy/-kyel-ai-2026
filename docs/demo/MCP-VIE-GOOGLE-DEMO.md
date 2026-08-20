# Démonstration P0 : Ñkyel AI + MCP + VIE (Google Africa Applied AI Lab)

Ce document décrit la tranche verticale P0 implémentée pour la démonstration officielle de Ñkyel AI, intégrant l'Agent Runtime, le protocole MCP, le WorkGraph canonique, et le moteur visuel VIE.

## 1. Scénario de Démonstration

**Mission :**
> Compare MCP, A2A et AG-UI. Explique le problème résolu par chaque protocole, relie chaque affirmation à une source officielle et construis une carte visuelle vérifiable. Examine ensuite l'hypothèse suivante : « MCP peut remplacer A2A ».

## 2. Déroulement Technique (End-to-End)

1. **Initialisation (`receive_goal`)**
   - L'utilisateur saisit la mission dans l'interface VIE.
   - Le backend génère un `run_id` et émet les événements `run.created` et `goal.received`.
   - Le nœud `Goal` apparaît instantanément sur le canevas spatial.

2. **Planification (`do_plan`)**
   - **Gemini** décompose l'objectif en tâches spécifiques (Recherche MCP/A2A/AG-UI, Analyse des protocoles, Synthèse comparative).
   - Le backend émet `plan.created` et `task.created` / `task.started`.
   - Le graphe se déploie visuellement.

3. **Recherche via MCP (`do_research`)**
   - Le runtime détecte le besoin de consulter des sources officielles.
   - Il invoque le client **MCP Fetch** (`mcp-server-fetch` via stdio).
   - Les appels sont filtrés par le `MCPNetworkAllowlist` (seuls `modelcontextprotocol.io`, `a2a-protocol.org`, et `docs.ag-ui.com` sont autorisés).
   - Émission de `tool.requested`, `tool.started`, et `tool.completed` (ou `tool.failed` en cas de refus).
   - Les résultats sont ajoutés au graphe via `source.added`.

4. **Analyse & Extraction (`do_analyze`)**
   - **Gemini** analyse les sources brutes pour en extraire :
     - Des **affirmations** (`claim.created`)
     - Des **preuves** rattachées (`evidence.linked`)
     - Des **hypothèses** comme "MCP peut remplacer A2A" (`hypothesis.created`).
   - Le canevas relie visuellement les affirmations à leurs sources.

5. **Synthèse Finale (`do_synthesize`)**
   - Génération d'un résumé Markdown global par Gemini.
   - Émission de `artifact.created` contenant le texte de la comparaison.

6. **Intervention Utilisateur & Replanification**
   - L'utilisateur sélectionne le nœud Hypothèse (« MCP peut remplacer A2A ») dans le canevas VIE et en modifie le statut ou la description (ex: *Contredit par la spécification A2A*).
   - L'événement `user.node_edited` et `replan.requested` sont envoyés au backend via `/api/v1/nkyel/replan`.
   - Le backend reprend l'exécution depuis l'état de planification (`plan.updated`), produisant de nouvelles synthèses basées sur la modification humaine.
   - Le WorkGraph est mis à jour en temps réel avec la nouvelle branche.

7. **Exportation**
   - L'artefact généré (Markdown) peut être exporté pour consultation externe.

## 3. Preuves d'Intégration

- **Google Gemini :** Utilisé explicitement dans `nkyel_graph.py` pour la planification, l'analyse des claims/evidences, et la synthèse.
- **Model Context Protocol (MCP) :** Implémenté de manière native via `fetch_client.py` en exploitant `uvx mcp-server-fetch`.
- **Ñkyel VIE :** Les composants React Flow dans `NkyelWorkspaceCanvas.tsx` réagissent au flux SSE streamé par le backend.
- **Vérifiabilité :** Chaque nœud de l'interface graphique correspond à un événement backend cryptographiquement conservé dans l'Event Store.
