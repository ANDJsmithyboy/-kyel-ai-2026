# PROMPT D'EXECUTION P0 — DEMO GOOGLE MCP + ÑKYEL VIE + WORKGRAPH

Tu travailles dans le dépôt **Ñkyel AI déjà ouvert**. Ne recrée pas le projet, ne reclone pas Gaboma AI, ne crée pas un sous-dossier parallèle et ne fais aucun remplacement global aveugle.

Lis d'abord intégralement les fichiers d'instructions du dépôt, puis audite l'état Git, les scripts, la stack, DeerFlow 2.0, le runtime, le frontend, les événements existants, les intégrations MCP et les variables d'environnement. Préserve toutes les modifications utilisateur.

## Objectif unique

Livrer une tranche verticale réellement exécutable pour la démonstration Google :

**Mission réelle → Gemini planifie → outil MCP Fetch réellement appelé → événements backend persistés → Ñkyel WorkGraph mis à jour → Ñkyel VIE affiche l'exécution en direct → l'utilisateur modifie une hypothèse → replanification réelle → artefact final exportable.**

La démo ne doit contenir aucune fausse activité, aucun faux terminal, aucune chronologie inventée et aucune chaîne de pensée privée.

## Priorité absolue

Implémente uniquement ce chemin P0. Ne commence pas A2A, A2UI, ACP, AP2, Veo, l'application mobile, Iboga Cloud ou une refonte générale tant que ce scénario ne passe pas de bout en bout.

## Scénario de démonstration déterministe

Mission proposée :

> Compare MCP, A2A et AG-UI. Explique le problème résolu par chaque protocole, relie chaque affirmation à une source officielle et construis une carte visuelle vérifiable. Examine ensuite l'hypothèse suivante : « MCP peut remplacer A2A ».

Sources officielles préapprouvées pour rendre la démo répétable :

- `https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro`
- `https://a2a-protocol.org/latest/topics/what-is-a2a/`
- `https://docs.ag-ui.com/introduction`

## Intégration MCP P0

1. Réutilise l'intégration MCP native de DeerFlow si elle existe et fonctionne. N'ajoute pas un second client parallèle sans justification.
2. Utilise le serveur de référence officiel **Fetch MCP Server** : `mcp-server-fetch`.
3. En développement, la configuration de référence peut utiliser `uvx mcp-server-fetch`.
4. Pour l'image de production, épingle la dépendance réellement testée. Ne télécharge pas un paquet flottant à chaque démarrage.
5. Enregistre la version MCP négociée et la version du serveur dans la documentation et les événements publics.
6. Ajoute un feature flag, par exemple `NKYEL_MCP_FETCH_ENABLED`.
7. Le connecteur doit refuser par défaut :
   - HTTP non chiffré ;
   - `localhost`, loopback, adresses privées, link-local et metadata endpoints ;
   - redirections vers une destination non autorisée ;
   - domaines absents de l'allowlist ;
   - réponses trop volumineuses ;
   - temps d'exécution excessif.
8. Pour la démo, l'allowlist contient uniquement les domaines officiels nécessaires.
9. Aucun port MCP ne doit être exposé publiquement. Utilise STDIO dans le conteneur ou un transport interne protégé.
10. Sanitize les résultats avant de les transmettre au modèle et traite le contenu distant comme non fiable.

## Événements publics obligatoires

Mappe le vrai cycle MCP vers l'Event Store existant. Au minimum :

- `run.created`
- `goal.received`
- `plan.created`
- `task.created`
- `task.started`
- `tool.requested`
- `tool.started`
- `tool.completed` ou `tool.failed`
- `source.added`
- `claim.created`
- `evidence.linked`
- `hypothesis.created`
- `artifact.created`
- `checkpoint.created`
- `user.node_edited`
- `replan.requested`
- `plan.updated`
- `hypothesis.rejected` ou mise à jour justifiée
- `replan.completed`
- `final.delivered`

Chaque événement possède :

- `event_id` stable et idempotent ;
- `schema_version` ;
- `run_id` ;
- `sequence` monotone par mission ;
- `correlation_id` ;
- `causation_id` lorsque pertinent ;
- horodatage serveur ;
- résumé public expurgé ;
- provenance ;
- état d'erreur structuré ;
- aucune clé, aucun token et aucune pensée privée.

## Projection Ñkyel WorkGraph

Le WorkGraph est une projection métier backend, pas seulement un dessin React.

Crée ou réutilise les nœuds :

- `Goal`
- `Plan`
- `Task`
- `Agent`
- `ToolCall`
- `Source`
- `Evidence`
- `Claim`
- `Hypothesis`
- `Artifact`
- `Checkpoint`
- `Error`

Relations minimales pour cette démo :

- `decomposes_into`
- `assigned_to`
- `uses`
- `produces`
- `derived_from`
- `supports`
- `contradicts`
- `rejected`
- `resumes_from`

Le reducer doit produire le même graphe après replay des mêmes événements, même en présence d'un événement dupliqué. Persiste les événements et au moins un snapshot.

## Ñkyel VIE P0

Réutilise les composants et la bibliothèque de graphe déjà présents. N'ajoute une nouvelle dépendance de canvas qu'en l'absence d'une solution saine dans le dépôt.

L'écran de démonstration doit montrer :

1. l'objectif central ;
2. le plan réel ;
3. les tâches et l'agent actif ;
4. un nœud `ToolCall` MCP avec états `requested`, `running`, `completed` ou `failed` ;
5. les sources officielles cliquables ;
6. les affirmations reliées à leurs preuves ;
7. l'hypothèse « MCP peut remplacer A2A » clairement séparée des faits ;
8. une timeline fondée sur les vrais événements ;
9. un panneau de détail affichant provenance, statut, durée et erreur éventuelle ;
10. un artefact final Markdown ou HTML exportable.

Les animations doivent uniquement représenter une transition réellement reçue du backend. Affiche un état vide, chargement, interruption, reconnexion et erreur.

## Intervention et replanification réels

Permets à l'utilisateur d'éditer sémantiquement l'hypothèse ou d'exiger une preuve supplémentaire.

Cette action doit :

1. émettre `user.node_edited` ;
2. créer `replan.requested` ;
3. relancer réellement le runtime depuis le dernier checkpoint valide ;
4. déclencher au besoin un nouvel appel MCP ;
5. produire `plan.updated` et `replan.completed` ;
6. conserver la branche originale pour comparaison.

Un simple déplacement visuel de nœud ne doit pas provoquer de replanification.

## Gemini et fallback

- Gemini reste le modèle par défaut et son rôle doit être mesurable dans cette démo.
- Conserve les autres fournisseurs déjà configurés.
- Ne déclenche un fallback que sur une condition publique et observable : indisponibilité, timeout, capacité manquante ou vérification explicitement demandée.
- Affiche le fournisseur actif et le changement éventuel sans exposer de raisonnement privé.

## Tests obligatoires avant toute publication

1. `make doctor` ou l'équivalent du dépôt passe.
2. Build, lint et typecheck passent.
3. Le serveur MCP est testable avec MCP Inspector.
4. Contract test : `tools/list` expose `fetch` avec le schéma attendu.
5. Contract test : un appel autorisé réussit.
6. Test sécurité : URL privée, localhost et domaine non autorisé sont refusés.
7. Test erreur : timeout ou panne MCP crée `tool.failed` et un nœud `Error` visible.
8. Test idempotence : un événement dupliqué ne duplique pas le nœud.
9. Test replay : le graphe reconstruit correspond au graphe initial.
10. Test E2E navigateur : mission, source, preuve, édition, replan et artefact final.
11. Test responsive desktop et mobile.
12. Aucune erreur critique dans la console ou le réseau.

## Déploiement VPS P0

- Utilise l'image Docker/Compose existante et Coolify si déjà prévu.
- Seuls les ports 80/443 du reverse proxy sont publics.
- DeerFlow Gateway, MCP, Redis et services internes restent sur le réseau Docker privé.
- HTTPS obligatoire derrière Cloudflare.
- Authentification Clerk ou protection d'accès existante obligatoire.
- Secrets uniquement dans les variables d'environnement du VPS/Coolify.
- Active Sentry sans enregistrer les prompts privés, clés ou documents sensibles.
- Ajoute healthchecks, limites CPU/RAM, redémarrage contrôlé et nettoyage des conteneurs.
- Prépare une sauvegarde de l'Event Store avant la démo.
- Fournis une commande de rollback vers l'image précédente.

## Livrables exigés

- code fonctionnel ;
- schémas typés des événements et du WorkGraph ;
- tests et résultats ;
- configuration MCP sans secret ;
- `docs/demo/MCP-VIE-GOOGLE-DEMO.md` ;
- `docs/demo/RECORDING-CHECKLIST.md` ;
- `docs/deployment/VPS-DEMO.md` ;
- captures de l'appel MCP réel, du WorkGraph et du replan ;
- URL de démonstration ou procédure exacte d'accès ;
- tableau final `IMPLÉMENTÉ / TESTÉ / BLOQUÉ / ROADMAP`.

## Règle de communication

Ne déclare jamais MCP, VIE, WorkGraph ou le replan « opérationnels » avant les tests correspondants. À la fin, réponds avec :

1. ce qui fonctionne réellement ;
2. les fichiers modifiés ;
3. les commandes de test exécutées et leurs résultats ;
4. les limites restantes ;
5. l'URL ou la commande de lancement ;
6. les trois captures à utiliser dans le post LinkedIn de preuve.

