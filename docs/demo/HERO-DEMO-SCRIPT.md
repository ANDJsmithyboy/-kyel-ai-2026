# HERO-DEMO-SCRIPT.md

## Parcours d'enregistrement (90-120s)

**[0:00 - 0:10] Introduction**
- Afficher l'écran vide de Ñkyel VIE.
- Voix-off / Sous-titre : "Ñkyel AI is an autonomous agent whose work becomes a living, verifiable, user-editable visual workspace."

**[0:10 - 0:25] Saisie de la mission**
- L'utilisateur copie-colle la mission officielle : "Compare MCP, A2A and AG-UI. Explain the problem solved by each protocol, connect every important claim to an official source, and build a verifiable visual map. Then evaluate this hypothesis: 'MCP can replace A2A.'"
- Clic sur le bouton de lancement.

**[0:25 - 0:45] Planification par Gemini**
- Le nœud Goal apparaît.
- Le nœud Plan apparaît (généré par Gemini).
- Les tâches (Tasks) se déploient (décomposition).
- Focus visuel sur la rapidité et la clarté du plan.

**[0:45 - 0:65] Exécution et Appel MCP**
- Les requêtes MCP s'affichent (`mcp-server-fetch via stdio`).
- Les sources officielles apparaissent (docs.ag-ui.com, modelcontextprotocol.io, a2a-protocol.org).
- Les affirmations (Claims) et Preuves (Evidence) sont extraites.
- Le WorkGraph se tisse devant les yeux.

**[0:65 - 0:85] Intervention de l'utilisateur**
- Zoom sur l'hypothèse générée "MCP can replace A2A".
- L'utilisateur édite le nœud Hypothèse pour indiquer "Rejected: MCP is for tool integration, A2A is agent-to-agent negotiation".
- Clic sur Replan.

**[0:85 - 1:05] Replanification**
- L'événement de reprise depuis le checkpoint est visible.
- Gemini réévalue et génère une nouvelle branche.
- La contradiction est levée.

**[1:05 - 1:20] Finalisation et Export**
- L'artefact final de synthèse est généré.
- Replay de la timeline depuis 0.
- Fin de la vidéo sur un zoom arrière du graphe complet et vérifiable.
