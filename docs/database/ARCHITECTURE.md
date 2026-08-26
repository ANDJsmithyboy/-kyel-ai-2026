# Ñkyel AI — Architecture de Données & Modèle Canonique de Production

> **SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ**  
> **Infrastructure : Neon PostgreSQL Serverless · 57 Tables Canoniques**

---

## 1. Vue d'Ensemble & Responsabilités Architecturales

Ñkyel repose sur une séparation stricte des responsabilités entre les différents systèmes de persistance et d'identité :

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLERK (Auth & IDP)                            │
│  Identité externe, Sessions, OAuth Providers, Tokens RS256              │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (Sync clerk_user_id)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEON POSTGRESQL (Source of Truth)                    │
│  - Identity & Tenancy : users, workspaces, members, settings            │
│  - Intelligence & Execution : missions, runs, mission_events, tasks     │
│  - WorkGraph : workgraph_nodes, workgraph_edges, simulations            │
│  - Evidence & Knowledge : sources, evidence, hypotheses, decisions      │
│  - Agentic Infrastructure : agents, versions, skills, tools, MCP, A2A   │
│  - Artifact Sovereign Domain : artifacts, versions, relations, lineage │
│  - Enterprise Security : quotas, usage, feedback, audit_logs            │
└──────────────────┬──────────────────┬──────────────────┬────────────────┘
                   │                  │                  │
                   ▼                  ▼                  ▼
        ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
        │  CLOUDFLARE R2   │ │      QDRANT      │ │   SSE / AG-UI    │
        │ (Binary Storage) │ │ (Vector Engine)  │ │ (Realtime Event) │
        │ PDF, XLSX, PPTX, │ │ Embeddings RAG,  │ │ Live Flow        │
        │ Images, Videos   │ │ Mémoire sémant.  │ │ Visual Tree      │
        └──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 2. Principes Fondamentaux de Conception

1. **Clés Primaires UUIDv4** : Générées nativement via `uuid_generate_v4()` ou `gen_random_uuid()`. Aucune clé auto-incrémentée exposée publiquement.
2. **Horodatage UTC Strict** : Tous les champs temporels utilisent `TIMESTAMPTZ` (`created_at`, `updated_at`, `started_at`, `completed_at`, `deleted_at`).
3. **Multi-Tenant Natif (Workspaces)** : Toutes les entités métier appartiennent à un `workspace_id`. Isolation stricte des requêtes au niveau de la couche domaine.
4. **Event Spine Append-Only** : `mission_events` enregistre l'historique complet des exécutions de manière ordonnée et immuable (`sequence` unique par mission).
5. **Multi-Versioning des Artefacts** : Les métadonnées logiques d'un artefact (`artifacts`) sont découplées de ses versions physiques binaires (`artifact_versions`), avec traçabilité complète de lignage (`artifact_relations`, `artifact_sources`, `artifact_evidence`).
6. **Sécurité & Zero-Plaintext** : Les secrets et jetons d'accès OAuth sont isolés dans `connection_credentials` avec chiffrement AES-256-GCM.

---

## 3. Domaines & Découpage des 57 Tables

### I. Identity & Tenancy
- `users` : Profil produit interne lié au `clerk_user_id`.
- `workspaces` : Espaces de travail isolés (Personal, Team, Business, Government).
- `workspace_members` : Rôles et appartenances (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
- `user_settings` : Préférences d'interface persistantes (thème, langue, profil de modèle).
- `workspace_settings` : Politiques d'approbation et profils par défaut de l'espace.

### II. Projets & Conversations
- `projects` : Projets transverses regroupant missions, conversations et artefacts.
- `conversations` : Fils de discussion synchrones (Chat).
- `messages` : Messages ordonnés avec index unique `(conversation_id, sequence)`.
- `message_artifacts` : Liaison relationnelle entre messages et artefacts.

### III. Missions, Runs & Event Spine
- `missions` : Unité fondamentale de travail agentique.
- `runs` : Tentatives d'exécution successives d'une mission (`attempt_number`).
- `mission_events` : Colonne vertébrale événementielle (Event Spine) pour le Live Flow et le replay.
- `tasks` : Tâches d'exécution hiérarchiques avec parent-child tracking.
- `checkpoints` : Instantanés d'état pour la reprise sur incident.
- `idempotency_keys` : Garantie d'idempotence sur les mutations critiques.

### IV. WorkGraph & Intelligence Prédictive
- `workgraph_nodes` : Noeuds du graphe d'exécution sémantique (OBJECTIVE, PLAN, TASK, AGENT, TOOL, SOURCE, EVIDENCE, ARTIFACT).
- `workgraph_edges` : Relations sémantiques orientées (DEPENDS_ON, PRODUCES, GROUNDED_BY, USED_AS_INPUT).
- `simulations` : Plans prédictifs et simulations de coût/temps/risques avant exécution.
- `predictions` : Estimations de marché et métriques probabilistes.

### V. Sources, Preuves, Hypothèses, Décisions & Approbations
- `sources` : Documents et URLs sources découverts avec hash de déduplication.
- `evidence` : Faits et extraits probants qualifiés (`SUPPORTS`, `CONTRADICTS`).
- `hypotheses` : Hypothèses formulées par le moteur de raisonnement.
- `hypothesis_evidence` : Preuves appuyant ou réfutant les hypothèses.
- `decisions` : Décisions stratégiques validées par l'agent ou l'utilisateur.
- `decision_evidence` : Justification factuelle des décisions.
- `approval_requests` : Demandes d'approbation humaine (Human-in-the-Loop).
- `approval_decisions` : Historique immuable des approbations accordées ou rejetées.

### VI. Agents, Compétences & Outils
- `agents` : Définition des agents spécialisés.
- `agent_versions` : Versions immuables des instructions, configurations et politiques mémoire.
- `agent_capabilities` : Capacités activées par version d'agent (RESEARCH, SPREADSHEET, CODE, etc.).
- `skills` : Registre des compétences modulaires.
- `agent_skills` : Association d'une compétence à une version d'agent.
- `tools` : Registre des outils disponibles avec schémas JSON input/output.
- `tool_executions` : Télémétrie et logs d'exécution des outils.

### VII. Connexions, MCP, Agents Distants & Computer Use
- `connections` : Connexions OAuth2 et comptes externes.
- `connection_credentials` : Coffre-fort chiffré des jetons (AES-256-GCM).
- `connection_capabilities` : Capacités découvertes sur les comptes connectés.
- `mcp_servers` : Serveurs Model Context Protocol enregistrés.
- `mcp_tools` : Outils dynamiques exposés par les serveurs MCP.
- `mcp_resources` : Ressources de contexte exposées par MCP.
- `remote_agents` : Agents externes distants (Agent-to-Agent / A2A).
- `a2a_handoffs` : Transferts de sous-tâches entre agents (A2A Handoffs).
- `computer_sessions` : Sessions de navigation / Computer Use sécurisées.
- `computer_actions` : Actions interactives horodatées.

### VIII. Artefacts & Lineage
- `artifacts` : Objet logique d'artefact (DOCUMENT, SPREADSHEET, PRESENTATION, WEBSITE, IMAGE, VIDEO).
- `artifact_versions` : Versions binaires durables avec hash SHA-256 et clés Cloudflare R2.
- `artifact_relations` : Graphe de filiation et de dérivation entre artefacts (`USED_AS_INPUT`, `VERSION_OF`, `EXPORT_OF`).
- `artifact_sources` : Traçabilité des sources ayant servi à produire l'artefact.
- `artifact_evidence` : Preuves ayant fondé la génération de l'artefact.

### IX. Automatisations & Mémoire
- `automations` : Règles d'automatisation planifiées (Cron / Schedule).
- `automation_runs` : Historique des déclenchements et missions associées.
- `memories` : Mémoire transactionnelle à long terme liée aux points Qdrant.

### X. Partage, Quotas, Usage, Feedback & Audit
- `share_links` : Liens publics et partages sécurisés par hash de jeton.
- `usage_events` : Télémétrie de consommation de jetons et coûts estimés.
- `quota_counters` : Compteurs atomiques de quotas par workspace et période.
- `feedback` : Retours utilisateurs et diagnostics d'incidents.
- `audit_logs` : Journalisation d'audit immuable pour conformité entreprise.

---

## 4. Stratégie de Persistance

- **Règle d'or** : `LIVE = SSE / AG-UI` · `HISTORY = NEON POSTGRESQL` · `BINARIES = CLOUDFLARE R2` · `VECTORS = QDRANT`.
- **Aucune donnée métier en `localStorage`**.
- **Reconnexion SSE avec Curseur** : En cas de déconnexion réseau, le client transmet son dernier `sequence` et le backend rejoue les événements manquants depuis `mission_events` avant de reprendre le flux en direct.
