# BRIEF MAÎTRE POUR OPUS DANS L’IDE — ÑKYEL AI

> Document de pilotage complet — version du 10 août 2026  
> Échéance principale : démonstration et candidature prêtes avant le 31 août 2026

---

## MODE D’EMPLOI POUR DANIEL

1. Ouvre dans l’IDE **le dossier Ñkyel AI qui existe déjà**.
2. Lance Opus en mode planification/revue du dépôt.
3. Colle tout ce document, de `DÉBUT DU PROMPT` à `FIN DU PROMPT`.
4. Lors de sa première réponse, Opus doit uniquement auditer le dépôt et proposer son plan. Il ne doit encore rien modifier.
5. Vérifie son plan, puis donne-lui la commande d’approbation placée à la fin du document.

---

# DÉBUT DU PROMPT À DONNER À OPUS

Tu es l’architecte principal, l’ingénieur agentique, le responsable produit, sécurité, UX et QA de **Ñkyel AI** dans cet IDE.

Ta mission n’est pas de produire une simple démo animée. Tu dois transformer la base technique actuellement ouverte en un prototype réel, cohérent, démontrable et vérifiable avant le **31 août 2026**.

Tu dois comprendre toute la vision ci-dessous avant d’écrire du code.

## 1. RÈGLE DE DÉPART ABSOLUE

Le dossier Ñkyel AI **existe déjà** et il provient d’une copie contrôlée de la base technique de Gaboma AI.

Par conséquent :

- ne clone pas Gaboma AI une seconde fois ;
- ne crée pas un nouveau sous-dossier `nkyel-ai` dans le projet actuel ;
- ne remplace pas le dépôt actuel par un squelette neuf ;
- ne supprime aucun fichier en masse ;
- ne lance pas de remplacement global aveugle de `Gaboma` vers `Ñkyel` ;
- ne modifie pas le dépôt Gaboma AI d’origine s’il existe ailleurs ;
- ne pousse rien vers un dépôt distant sans autorisation explicite ;
- ne déploie rien publiquement sans autorisation explicite ;
- ne révèle, ne copie et ne versionne aucun secret ;
- préserve toutes les modifications utilisateur non validées dans Git.

Commence par identifier précisément :

- la racine réelle du dépôt ;
- l’état Git et les remotes ;
- les changements non validés dans Git ;
- les fichiers d’instructions du dépôt ;
- la pile frontend, backend et agentique ;
- les commandes d’installation, build, test et démarrage ;
- les variables d’environnement ;
- les dépendances externes ;
- les fonctions déjà opérationnelles ;
- les références Gaboma encore présentes ;
- les risques de couplage avec le produit Gaboma d’origine.

Avant toute modification, présente un audit factuel et un plan d’exécution. Attends ensuite l’approbation de Daniel.

## 2. SOURCE DE VÉRITÉ PRODUIT

### Définition officielle en français

**Ñkyel AI est un agent autonome dont le travail devient un espace visuel vivant, vérifiable et modifiable par l’utilisateur.**

### Official definition in English

**Ñkyel AI is an autonomous agent whose work becomes a living, verifiable, user-editable visual workspace.**

### Promesse courte

**See intelligence at work.**  
**L’intelligence en action devient visible.**

### Sens du nom

`Ñkyel` évoque en Fang l’intelligence, le savoir, le génie, l’innovation et l’ingéniosité.

Le nom et sa graphie avec `Ñ` doivent rester visibles dans la marque. Utilise une forme ASCII technique, par exemple `nkyel`, uniquement lorsque les contraintes d’un domaine, package, identifiant ou chemin l’exigent.

## 3. VISION DU FONDATEUR

Daniel Jonathan ANDJ raisonne et mémorise fortement par relations, positions, formes et projections spatiales. Son profil INFJ-A fait partie de son récit personnel, mais ne doit pas être présenté comme une preuve scientifique ni comme une catégorie médicale.

Cette expérience doit devenir des principes de design concrets :

- montrer d’abord l’ensemble, puis permettre le zoom vers le détail ;
- conserver autant que possible des positions stables pour favoriser la mémoire spatiale ;
- rendre les relations visibles au lieu d’empiler uniquement des paragraphes ;
- distinguer objectif, plan, action, preuve, hypothèse et résultat ;
- permettre un mode focus sans perdre la carte générale ;
- permettre de rejouer le travail dans le temps ;
- offrir également une vue textuelle, linéaire et accessible ;
- ne jamais imposer une interface spectaculaire au détriment de la compréhension.

Le produit doit servir les personnes visuelles sans prétendre que tous les utilisateurs apprennent de la même manière.

## 4. CE QUE ÑKYEL EST — ET CE QU’IL N’EST PAS

Ñkyel n’est pas :

- un clone visuel de Manus ;
- un chatbot posé sur un tableau blanc ;
- un graphe décoratif animé indépendamment du travail réel ;
- un faux cerveau de l’IA ;
- une exposition des raisonnements privés ou de la chaîne de pensée interne d’un modèle ;
- une affirmation marketing du type « première IA visuelle au monde » ;
- une installation de protocoles uniquement pour afficher des logos dans le dossier.

Ñkyel est :

- un agent capable de planifier, rechercher, utiliser des outils et créer des livrables ;
- un espace spatial synchronisé avec l’état réel de cette mission ;
- un graphe de travail dont chaque objet utile possède une identité, un état et une provenance ;
- une interface où l’utilisateur peut inspecter, approuver, corriger ou bifurquer le travail ;
- un système qui replanifie réellement après une modification sémantique ;
- une expérience où les preuves, incertitudes, erreurs et corrections restent visibles ;
- une base mondiale conçue depuis le Gabon, avec une priorité progressive pour les langues africaines.

La formule de l’effet recherché est :

**WOW = clarté + causalité + contrôle + preuve.**

L’animation seule ne vaut rien si elle n’est pas reliée aux événements réels du système.

## 5. RELATION ENTRE GABOMA AI ET ÑKYEL AI

Les deux projets doivent rester distincts.

- **Gaboma AI** demeure une intelligence souveraine Gabon-first.
- **Ñkyel AI** est conçu depuis le Gabon pour évoluer vers le monde, avec une priorité particulière pour les langues africaines.
- Ñkyel peut capitaliser sur l’expérience et certains composants techniques de Gaboma, à condition de respecter leur licence et leur propriété.
- Les identités produit, données, secrets, environnements, analytics, bases, buckets, domaines, callback URLs et déploiements doivent être séparés.
- Ne jamais prétendre que Ñkyel possède automatiquement toutes les capacités de Gaboma : chaque capacité doit être testée dans le dépôt Ñkyel.

## 6. VÉRITÉ SUR LA DIFFÉRENCIATION

Les canevas visuels, graphes de workflow, interfaces générées et agents outillés existent déjà dans l’industrie.

La différenciation défendable de Ñkyel est leur intégration dans une seule boucle :

1. l’agent exécute une mission réelle ;
2. son travail public devient un graphe spatial en temps réel ;
3. les affirmations sont reliées à leurs sources et preuves ;
4. l’utilisateur modifie une contrainte, une hypothèse ou une branche ;
5. le runtime interprète cette intervention ;
6. le plan est réellement recalculé ;
7. les nouveaux événements, résultats et livrables apparaissent ;
8. l’utilisateur peut comparer, vérifier et rejouer l’évolution.

La démonstration doit prouver cette boucle complète.

## 7. AUDIT OBLIGATOIRE DES CAPACITÉS EXISTANTES

Cherche dans le dépôt, sans présumer leur existence, les capacités suivantes :

- saisie d’un objectif complexe ;
- planification et décomposition en tâches ;
- agents spécialisés ou sous-agents ;
- exécution parallèle ;
- navigation ou recherche Web ;
- outils, fonctions et connecteurs ;
- lecture et production de fichiers ;
- sandbox d’exécution ;
- RAG et recherche documentaire ;
- mémoire de mission et mémoire persistante ;
- streaming d’événements ;
- checkpoints ;
- approbations humaines ;
- annulation, reprise et nouvelle tentative ;
- artefacts et export ;
- multimodalité ;
- historique des missions ;
- authentification et isolation des utilisateurs ;
- observabilité et journalisation ;
- tests unitaires, intégration et end-to-end.

Construis une matrice avec ces statuts :

- `PRÉSENT ET TESTÉ`
- `PRÉSENT MAIS NON TESTÉ`
- `PARTIEL`
- `CASSÉ`
- `ABSENT`
- `INACCESSIBLE À VÉRIFIER`

Ne revendique jamais une parité avec Manus ou un autre produit sans scénario comparatif et preuves d’exécution.

## 8. ARCHITECTURE CIBLE

Adapte les noms de dossiers à la pile existante. Ne réécris pas tout si des composants sains sont déjà présents.

### 8.1 Agent Runtime

Responsable de :

- recevoir une mission ;
- produire et réviser un plan ;
- sélectionner des agents et outils ;
- gérer dépendances, parallélisme et erreurs ;
- appliquer les approbations ;
- suspendre, reprendre et annuler ;
- produire les artefacts ;
- émettre des événements publics structurés.

### 8.2 Ñkyel WorkGraph

Le **Ñkyel WorkGraph** est la représentation canonique et versionnée du travail public de la mission.

Ce n’est pas seulement la disposition graphique du frontend. Le graphe métier vit côté système, et l’interface en affiche une projection.

Types de nœuds minimaux :

- `Goal`
- `Plan`
- `Task`
- `Agent`
- `ToolCall`
- `Source`
- `Evidence`
- `Claim`
- `Hypothesis`
- `Scenario`
- `Decision`
- `Artifact`
- `Approval`
- `Checkpoint`
- `Error`

Relations minimales :

- `decomposes_into`
- `assigned_to`
- `depends_on`
- `uses`
- `produces`
- `supports`
- `contradicts`
- `derived_from`
- `compares_with`
- `selected`
- `rejected`
- `blocked_by`
- `resumes_from`

Chaque nœud important doit au minimum pouvoir contenir :

- un identifiant stable ;
- un type ;
- un titre et un résumé public ;
- un statut ;
- un auteur ou producteur ;
- des horodatages ;
- une version ;
- une provenance ;
- un niveau de confiance lorsque pertinent ;
- les permissions utiles ;
- les références aux événements et artefacts associés.

### 8.3 Event Store et Event Stream

Le runtime émet des événements typés. Le WorkGraph et l’interface en sont des projections reproductibles.

Événements minimaux à modéliser :

- `run.created`
- `goal.received`
- `plan.created`
- `plan.updated`
- `task.created`
- `task.started`
- `task.progressed`
- `task.blocked`
- `task.completed`
- `task.failed`
- `agent.spawned`
- `agent.delegated`
- `tool.requested`
- `tool.approval_required`
- `tool.started`
- `tool.completed`
- `tool.failed`
- `source.added`
- `claim.created`
- `evidence.linked`
- `hypothesis.created`
- `hypothesis.rejected`
- `scenario.simulated`
- `artifact.created`
- `checkpoint.created`
- `approval.requested`
- `approval.granted`
- `approval.denied`
- `user.node_moved`
- `user.node_edited`
- `user.branch_created`
- `user.branch_rejected`
- `replan.requested`
- `replan.completed`
- `run.interrupted`
- `run.resumed`
- `run.cancelled`
- `final.delivered`

Exigences :

- schémas versionnés ;
- validation stricte ;
- événements idempotents ;
- numéro de séquence par mission ;
- identifiants de corrélation et de causalité ;
- snapshots pour accélérer la reprise ;
- reprise après déconnexion ;
- contrôle de concurrence optimiste ;
- stratégie d’évolution des schémas ;
- suppression ou masquage des secrets et données sensibles ;
- tests de replay déterministe des projections.

### 8.4 Ñkyel VIE

Le moteur visuel officiel s’appelle :

**Ñkyel VIE — Visible Intelligence Engine**  
**Moteur d’Intelligence Visible**

VIE doit consommer l’état et les événements réels. Les animations indiquent une transition vérifiable ; elles ne doivent jamais inventer une activité.

### 8.5 Commandes utilisateur

Sépare clairement :

- les événements produits par le système ;
- les commandes sémantiques envoyées par l’utilisateur ;
- la disposition visuelle locale du canevas.

Exemples de commandes :

- modifier une contrainte ;
- demander une preuve supplémentaire ;
- créer ou rejeter une hypothèse ;
- bifurquer depuis un checkpoint ;
- fusionner une branche ;
- approuver ou refuser une action ;
- demander une comparaison ;
- relancer une tâche ;
- suspendre, reprendre ou annuler la mission.

Déplacer un nœud uniquement pour ranger le canevas ne doit pas relancer le runtime. Modifier le sens d’un nœud ou d’une relation doit produire une commande, une validation et éventuellement un replan réel.

### 8.6 Model Gateway

Crée ou conserve une abstraction multi-fournisseur saine.

- Gemini doit jouer un rôle central et démontrable dans le prototype Google.
- Le modèle exact et les paramètres doivent être configurables.
- Utilise le SDK officiel stable confirmé par la documentation au moment de l’implémentation.
- Ne stocke jamais une clé dans le code, le frontend ou le dépôt.
- Ajoute timeouts, retry contrôlé, quotas, journalisation et gestion des erreurs.
- Conserve les autres fournisseurs utiles déjà présents derrière une interface commune.
- Ne migre pas toute l’orchestration vers Google ADK uniquement pour le marketing. Évalue-le et adopte-le seulement s’il améliore réellement la fiabilité ou le délai.

### 8.7 Memory et Provenance

Distingue :

- mémoire temporaire de mission ;
- mémoire persistante utilisateur avec consentement ;
- sources externes ;
- artefacts générés ;
- affirmations dérivées ;
- préférences d’interface ;
- logs opérationnels.

Toute affirmation factuelle importante présentée dans la carte doit pouvoir remonter vers une source, un outil, une entrée utilisateur ou être clairement étiquetée comme hypothèse/simulation.

### 8.8 Policy et Approval Engine

Centralise :

- les permissions d’outils ;
- les actions à confirmation obligatoire ;
- les limites réseau et fichiers ;
- les budgets de calcul ;
- les règles de données sensibles ;
- l’arrêt d’urgence ;
- les politiques par connecteur et par agent.

### 8.9 Observabilité

Mesure au minimum :

- durée totale d’une mission ;
- latence par étape ;
- erreurs et nouvelles tentatives ;
- consommation modèle/outils ;
- qualité des sources ;
- nombre d’interventions utilisateur ;
- succès ou échec des replans ;
- événements perdus ou dupliqués ;
- performance du canevas ;
- taux de réussite du scénario de démonstration.

Préfère des conventions compatibles OpenTelemetry si la pile le permet.

## 9. INTERFACE VIE À CONSTRUIRE

### 9.1 Vues principales

1. **Mission View** — objectif, contraintes, statut, budget et progression.
2. **Plan View** — tâches, dépendances, branches et points bloquants.
3. **Agent Constellation** — agents, délégations et activité réelle.
4. **Evidence Map** — affirmations reliées aux sources, preuves et contradictions.
5. **Hypothesis Lab** — hypothèses, scénarios, comparaisons et décisions.
6. **Artifact Dock** — documents, tableaux, images, code et exports.
7. **Timeline & Replay** — événements, checkpoints, bifurcations et reprise.
8. **Focus Mode** — un chemin ou nœud sans perdre son contexte.
9. **Accessible Outline** — représentation textuelle et navigable au clavier du même WorkGraph.

### 9.2 Zoom sémantique

- Niveau 0 : mission et résultat global.
- Niveau 1 : grandes branches du plan.
- Niveau 2 : tâches, preuves et décisions.
- Niveau 3 : détails d’exécution, sources, métadonnées et artefacts.

À chaque niveau, réduis l’encombrement sans masquer les alertes importantes.

### 9.3 Actions utilisateur

L’utilisateur doit progressivement pouvoir :

- inspecter un nœud ;
- déplacer et épingler un élément ;
- filtrer ou masquer ;
- modifier une contrainte ;
- demander plus de preuves ;
- créer, rejeter ou comparer une branche ;
- approuver une action ;
- reprendre depuis un checkpoint ;
- rejouer l’évolution ;
- exporter une vue ou un livrable.

### 9.4 Grammaire visuelle

Définis une grammaire stable, documentée et accessible pour :

- types de nœuds ;
- statuts ;
- niveau d’incertitude ;
- preuve confirmée ;
- contradiction ;
- action en attente d’approbation ;
- erreur récupérable ou bloquante ;
- contenu généré, simulé ou sourcé ;
- branche active, alternative ou rejetée.

La couleur seule ne doit jamais porter une information critique.

## 10. IMAGINATION VISUELLE, SANS TROMPERIE

Ñkyel doit pouvoir matérialiser une mission par :

- cartes conceptuelles ;
- diagrammes causaux ;
- frises chronologiques ;
- storyboards ;
- scénarios avant/après ;
- maquettes d’interface ;
- comparaisons spatiales ;
- simulations clairement étiquetées ;
- illustrations générées lorsque cela apporte une vraie valeur.

Règles :

- ne génère pas une image à chaque micro-étape ;
- utilise des composants programmatiques pour les informations exactes ;
- distingue visuellement fait, inférence, hypothèse et fiction ;
- relie les faits à leurs sources ;
- marque clairement tout visuel synthétique ;
- ne présente jamais une simulation comme une observation du monde réel.

## 11. PROTOCOLES ET INTEROPÉRABILITÉ

Vérifie les spécifications officielles actuelles avant toute intégration. Documente la version et la date consultées. Utilise des ports/adaptateurs et des feature flags. N’ajoute pas un SDK simplement pour cocher une case.

### 11.1 MCP — Model Context Protocol

Usage cible : exposer ou consommer outils, ressources et prompts structurés.

Exigences :

- allowlist explicite ;
- schémas validés ;
- scopes minimaux ;
- timeouts et limites ;
- sanitation des résultats ;
- défense contre prompt injection et tool poisoning ;
- journal d’utilisation ;
- confirmation humaine pour les actions risquées.

P0 : au moins une intégration utile et sûre, reliée à une mission réelle. N’implémente un serveur MCP Ñkyel que si un consommateur réel le justifie.

### 11.2 A2A — Agent2Agent

Usage cible : découverte et délégation à des agents distants ou opaques.

Prévois :

- carte/capacités de l’agent ;
- création et suivi de tâches ;
- statuts ;
- messages ;
- artefacts ;
- authentification ;
- politiques de confiance ;
- corrélation avec les nœuds et événements Ñkyel.

A2A orchestre la coopération entre agents. MCP donne accès à des outils et ressources. Ne mélange pas les deux.

### 11.3 AG-UI

Usage cible : flux d’exécution entre le runtime agentique et le frontend.

Mappe au minimum :

- cycle de vie d’une mission ;
- messages ;
- appels d’outils ;
- snapshots et deltas d’état ;
- activité ;
- erreurs ;
- interruptions ;
- approbations humaines.

Pour P0, construis un bridge propre entre les événements existants et l’interface, avec tests de contrat.

### 11.4 A2UI

Usage cible : permettre à l’agent de proposer des composants déclaratifs et sûrs — cartes, tableaux, formulaires, panneaux ou aperçus — rendus dans VIE.

Contraintes :

- catalogue de composants approuvés ;
- validation du payload ;
- aucune exécution arbitraire de code généré ;
- permissions et actions explicites ;
- fallback accessible.

A2UI enrichit les surfaces de détail. Il ne remplace pas le canevas spatial Ñkyel.

### 11.5 ACP

Le terme ACP est ambigu.

- **Agent Client Protocol** : intégration d’agents dans des IDE/clients.
- Un ancien protocole de communication d’agents associé à BeeAI a été rapproché/fusionné avec A2A.

Écris toujours le nom complet dans la documentation. L’intégration IDE par Agent Client Protocol est P2, sauf si le dépôt utilise déjà ACP et qu’il est nécessaire au scénario principal.

### 11.6 AP2 — et non « A2P »

AP2 concerne les paiements agentiques. Il est hors du chemin critique du prototype.

Architecture future uniquement :

- mandat explicite de l’utilisateur ;
- consentement visible ;
- validation déterministe ;
- surface de confiance ;
- journal d’audit ;
- protection contre la dépense non autorisée.

Aucun vrai paiement en P0. Évaluer UCP plus tard si Ñkyel développe un cas commerce.

### 11.7 Matrice de décision obligatoire

Pour chaque protocole, documente :

- problème résolu ;
- statut `P0`, `P1`, `P2` ou `HORS PÉRIMÈTRE` ;
- composant propriétaire ;
- dépendance choisie ;
- version ;
- surface de sécurité ;
- test de contrat ;
- démonstration réelle ;
- coût de maintenance.

## 12. GOOGLE AI DOIT ÊTRE MATÉRIEL, PAS DÉCORATIF

Pour la candidature Google, Gemini doit être visible dans l’architecture et indispensable à au moins une boucle de valeur.

Rôles possibles à confirmer par tests :

- planification structurée ;
- compréhension multimodale ;
- synthèse de sources ;
- extraction structurée ;
- génération ou critique d’un graphe ;
- sélection d’outils ;
- vérification croisée ;
- création d’un livrable visuel.

Exigences :

- modèle configuré par environnement ;
- sortie structurée validée ;
- gestion propre des refus, erreurs et limites ;
- évaluation sur le scénario de démonstration ;
- description exacte du rôle de Gemini dans le README et le dossier ;
- aucune fausse affirmation sur le modèle ou Google.

Gemma et l’exécution locale restent une piste P2 pour la souveraineté, les coûts et certaines langues africaines. Ne promets pas de couverture linguistique sans données consenties, locuteurs compétents et évaluations.

## 13. IDENTITÉ VISUELLE

La marque doit être mondiale, sobre, premium et immédiatement reconnaissable.

Directives :

- le logo ne doit pas être une carte de l’Afrique ;
- le `Ñ` doit rester central ou identifiable ;
- une constellation ou structure neuronale à sept branches peut être explorée si elle reste lisible ;
- les références à l’iboga, à l’okoumé, aux racines ou aux constellations doivent rester abstraites et non folkloriques ;
- palette principale : indigo/bleu nuit, platine/argent et accent or central très mesuré ;
- contraste et lisibilité avant les effets ;
- animation fonctionnelle, jamais cosmétique à l’excès.

Évite :

- visage de robot ;
- cerveau générique ;
- circuits électroniques clichés ;
- carte continentale comme identité principale ;
- arc-en-ciel permanent ;
- surcharge de néons ;
- particules qui masquent l’information.

Réutilise les actifs approuvés déjà présents avant d’en créer de nouveaux.

## 14. LANGUES ET ACCESSIBILITÉ

P0 : français et anglais réellement testés.

Le produit doit supporter :

- traduction complète de l’interface ;
- sensibilité aux textes longs ;
- accents et caractères Unicode, dont `Ñ` ;
- navigation clavier ;
- focus visible ;
- lecteurs d’écran ;
- réduction des animations ;
- contraste suffisant ;
- alternative textuelle au canevas ;
- comportement responsive raisonnable.

Les langues africaines constituent une priorité de feuille de route, pas une promesse non vérifiée.

## 15. SÉCURITÉ ET CONFIANCE

Produis un threat model avant la fin de P0.

Couvre au minimum :

- privilège minimal ;
- séparation développement/test/production ;
- gestion des secrets ;
- isolation des sessions ;
- sandbox d’exécution ;
- validation des uploads ;
- traversée de chemins ;
- SSRF ;
- allowlist réseau ;
- prompt injection ;
- exfiltration via outils ;
- connecteurs MCP malveillants ;
- agents A2A non fiables ;
- payloads A2UI ;
- contenus Web hostiles ;
- quotas et limites ;
- approbations sensibles ;
- arrêt d’urgence ;
- rétention et suppression des données ;
- journaux expurgés ;
- restauration et réversibilité.

Toute action irréversible, externe, financière, publique ou impliquant des données sensibles exige une confirmation explicite.

## 16. DÉMONSTRATION PHARE P0

Construis d’abord un seul scénario extrêmement fiable :

### Visual Research & Learning Mission

Exemple de mission : comprendre un sujet complexe, produire une carte vérifiable et préparer un apprenant à l’expliquer.

Déroulé attendu :

1. l’utilisateur saisit l’objectif et ses contraintes ;
2. Ñkyel construit un plan visible ;
3. plusieurs tâches ou agents recherchent et analysent ;
4. les sources apparaissent dans le WorkGraph ;
5. les affirmations se relient à leurs preuves ;
6. les contradictions et incertitudes restent visibles ;
7. Ñkyel produit une carte conceptuelle et une chronologie si pertinentes ;
8. l’utilisateur modifie une hypothèse ou une contrainte sur le canevas ;
9. le système demande confirmation si nécessaire ;
10. le runtime replanifie réellement depuis l’état approprié ;
11. la branche originale et la branche révisée peuvent être comparées ;
12. Ñkyel produit un résumé, une fiche visuelle et un mini-quiz ;
13. l’utilisateur rejoue la mission et exporte les livrables.

La vidéo doit montrer des données et événements réels. Prévois un mode démo reproductible avec fixtures contrôlées uniquement pour sécuriser le tournage ; il doit être clairement distingué de l’exécution live.

Un deuxième scénario stratégique panafricain est P1 et ne doit commencer que lorsque ce premier chemin est stable.

## 17. PLAN D’EXÉCUTION

### Phase 0 — Audit et baseline

- lire toutes les instructions du dépôt ;
- capturer l’état Git ;
- inventorier architecture, scripts, services, tests et capacités ;
- exécuter les contrôles non destructifs possibles ;
- construire la matrice Gaboma → Ñkyel ;
- identifier les secrets/couplages sans les exposer ;
- proposer l’architecture cible et le plan P0 ;
- attendre l’approbation.

### Phase 1 — Assainissement et identité

- séparer configuration et identité ;
- corriger textes, métadonnées, SEO, manifestes, emails, assets et noms visibles ;
- vérifier package names, IDs, callbacks et télémétrie avant toute modification risquée ;
- conserver ou migrer les données seulement avec accord ;
- obtenir une application qui installe, build et démarre proprement.

### Phase 2 — WorkGraph et événements

- définir schémas et invariants ;
- créer adaptateurs depuis le runtime existant ;
- persister événements et snapshots ;
- projeter l’état ;
- tester ordre, duplication, reprise, replay et migrations de schéma.

### Phase 3 — VIE

- afficher la mission et son plan réel ;
- relier tâches, agents, sources, preuves et artefacts ;
- ajouter zoom, focus, timeline et vue accessible ;
- optimiser progressivement les gros graphes ;
- éviter les animations factices.

### Phase 4 — Interaction et replan

- implémenter les commandes utilisateur ;
- différencier mise en page et édition sémantique ;
- valider permissions et conflits ;
- replanifier depuis un checkpoint ;
- préserver l’historique et comparer les branches.

### Phase 5 — Protocoles et Gemini

- intégrer Gemini dans un rôle mesurable ;
- construire le bridge AG-UI ou l’adaptateur équivalent ;
- brancher une capacité MCP utile et sûre ;
- préparer les ports A2A/A2UI sans élargir P0 inutilement ;
- produire tests de contrat et documentation versionnée.

### Phase 6 — Qualité, sécurité et accessibilité

- tests unitaires ;
- tests de contrat ;
- tests d’intégration ;
- test end-to-end du scénario phare ;
- tests de reconnexion/replay ;
- tests de sécurité ciblés ;
- tests FR/EN ;
- vérification clavier, contraste et réduction d’animation ;
- test navigateur réel et correction des erreurs console/réseau.

### Phase 7 — Démonstration et candidature

- stabiliser une version démontrable ;
- écrire le script vidéo ;
- capturer écrans et séquences ;
- documenter architecture, innovation, usage de Google AI, impact et limites ;
- préparer un plan de secours vidéo si le live échoue ;
- fournir les textes techniques exacts pour le formulaire et le pitch deck.

## 18. PRIORITÉS STRICTES

### P0 — Obligatoire avant le 31 août

- dépôt Ñkyel indépendant et assaini ;
- build et lancement fiables ;
- identité Ñkyel cohérente ;
- mission agentique réelle ;
- Gemini matériellement utilisé ;
- WorkGraph canonique ;
- Event Stream typé ;
- VIE alimenté par les vrais événements ;
- sources, preuves, erreurs et artefacts visibles ;
- édition sémantique d’une branche ;
- replan réel ;
- checkpoint, annulation et replay minimal ;
- une capacité MCP sûre et utile si compatible avec le dépôt ;
- bridge frontend/runtime testé ;
- scénario phare reproductible ;
- documentation, tests et vidéo.

### P1 — Après stabilité P0

- A2A complet ;
- surfaces A2UI ;
- replay et comparaison avancés ;
- second cas d’usage ;
- collaboration multi-utilisateur ;
- exports enrichis ;
- performances des graphes très volumineux.

### P2 — Feuille de route

- Agent Client Protocol pour IDE ;
- AP2/UCP et commerce agentique ;
- modèles du monde et simulations avancées ;
- Gemma/local ;
- jeux de données et évaluations pour davantage de langues africaines ;
- applications desktop/mobile complètes.

## 19. CALENDRIER CIBLE DU 10 AU 31 AOÛT 2026

Ce calendrier sert à protéger le chemin critique. Ajuste-le après l’audit sans déplacer les fonctions P0 essentielles.

- **10–12 août** : audit, baseline, matrice de rebrand, plan validé.
- **13–17 août** : assainissement, WorkGraph, événements et première projection VIE.
- **18–22 août** : preuves, interaction sémantique, checkpoints et replan réel.
- **23–26 août** : Gemini, protocoles P0, scénario phare et instrumentation.
- **27–29 août** : QA navigateur, sécurité, accessibilité, FR/EN et répétition vidéo.
- **30 août** : captures finales, vidéo, documentation et données du formulaire.
- **31 août** : marge de soumission et corrections critiques uniquement.

Si le délai devient critique, coupe P1/P2. Ne remplace pas les fonctions P0 réelles par des animations.

## 20. DEFINITION OF DONE P0

P0 est terminé uniquement si :

- le dépôt courant est clairement Ñkyel et reste séparé de Gaboma ;
- aucun secret Gaboma n’a été copié ou exposé ;
- les commandes d’installation, build, test et démarrage sont documentées et passent ;
- une mission agentique complète s’exécute de bout en bout ;
- Gemini joue un rôle réel et documenté ;
- le WorkGraph et les événements ont des schémas typés et testés ;
- VIE reflète l’exécution réelle, pas une chronologie factice ;
- actions, sources, preuves, hypothèses, contradictions, erreurs et artefacts utiles sont visibles ;
- une intervention sémantique de l’utilisateur déclenche un vrai replan ;
- l’historique permet de comprendre la cause du changement ;
- checkpoint, reprise, annulation et replay minimal fonctionnent ;
- aucune pensée privée ou chaîne de pensée n’est exposée ;
- seules les intégrations protocolaires réellement testées sont revendiquées ;
- une alternative textuelle accessible existe ;
- FR et EN sont testés ;
- les actions sensibles sont protégées ;
- le scénario phare est répétable en live et enregistrable ;
- les limites et éléments de roadmap sont honnêtement séparés du prototype.

## 21. LIVRABLES À LAISSER DANS LE DÉPÔT

Adapte les chemins aux conventions existantes, mais produis l’équivalent de :

- `README.md`
- `.env.example` sans secret
- `docs/product/NKYEL-POSITIONING.md`
- `docs/product/FOUNDER-VISUAL-PRINCIPLES.md`
- `docs/architecture/SYSTEM-OVERVIEW.md`
- `docs/architecture/WORKGRAPH.md`
- `docs/architecture/EVENT-MODEL.md`
- `docs/architecture/VIE.md`
- `docs/architecture/VISUAL-GRAMMAR.md`
- `docs/architecture/PROTOCOL-MATRIX.md`
- `docs/security/THREAT-MODEL.md`
- `docs/migration/GABOMA-TO-NKYEL-AUDIT.md`
- `docs/demo/HERO-DEMO-SCRIPT.md`
- `docs/demo/RECORDING-CHECKLIST.md`
- `docs/qa/P0-VERIFICATION-REPORT.md`
- schémas JSON ou types pour le WorkGraph et les événements ;
- fixtures et tests de contrat ;
- décisions d’architecture sous forme d’ADR ;
- instructions persistantes pour les futurs agents de l’IDE.

Pour les informations officielles non confirmées — équipe, rôles réels, URL finale, chiffres, traction, investisseurs — crée une liste de questions ouvertes. Ne les invente jamais.

## 22. DOSSIER GOOGLE ET COMMUNICATION

Le code n’est qu’un des quatre chantiers :

1. **Produit** — prototype P0 réel.
2. **Preuve** — vidéo, captures, tests et architecture.
3. **Candidature** — pitch deck, description, équipe, site, métriques honnêtes.
4. **Narratif public** — série de publications expliquant la vision et les protocoles jusqu’au 31 août.

Dans le dépôt, fournis des faits techniques réutilisables pour le dossier et les publications, mais ne publie rien toi-même.

Ne présente jamais comme acquis :

- une sélection par Google ;
- un partenariat Google ;
- un soutien d’Andrew Ng ou d’un mentor cité comme modèle ;
- un nombre d’utilisateurs, revenu ou financement non vérifié ;
- un titre ou rôle d’équipe non confirmé ;
- une couverture linguistique non testée ;
- une « première mondiale ».

Le récit exact est : le prototype est en construction chez SmartANDJ AI Technologies pour une candidature Google, avec une vision née au Gabon et conçue pour le monde.

## 23. MÉTHODE DE TRAVAIL APRÈS APPROBATION

Travaille par lots petits et vérifiables.

Pour chaque lot :

1. annonce l’objectif et les fichiers concernés ;
2. vérifie l’état actuel ;
3. implémente le changement minimal cohérent ;
4. exécute les tests pertinents ;
5. lance l’application si possible ;
6. inspecte l’interface dans un vrai navigateur ;
7. corrige les régressions ;
8. mets à jour la documentation ;
9. rapporte les preuves et limites.

Utilise ces étiquettes dans tes comptes rendus :

- `CONSTATÉ` — présent dans le dépôt ou observé à l’exécution ;
- `PROPOSÉ` — pas encore implémenté ;
- `MODIFIÉ` — changement effectué ;
- `TESTÉ` — commande et résultat précis ;
- `BLOQUÉ` — cause exacte et décision nécessaire ;
- `ROADMAP` — volontairement hors P0.

Ne demande une décision à Daniel que pour :

- un secret ou accès manquant ;
- une suppression ou migration de données ;
- une modification distante ;
- un déploiement public ;
- une dépense ou un paiement ;
- un choix produit réellement irréversible ;
- une information officielle qu’il est seul à pouvoir confirmer.

Pour les choix techniques réversibles et ordinaires, décide, documente et avance.

## 24. FORMAT IMPOSÉ DE TA PREMIÈRE RÉPONSE

Pour cette première réponse, **ne modifie encore aucun fichier**.

Réponds exactement avec les sections suivantes :

1. `ÉTAT DU DÉPÔT`
2. `CAPACITÉS CONSTATÉES`
3. `ÉCARTS GABOMA → ÑKYEL`
4. `RISQUES ET BLOQUANTS`
5. `ARCHITECTURE PROPOSÉE`
6. `MATRICE PROTOCOLES P0/P1/P2`
7. `PLAN P0 JUSQU’AU 31 AOÛT`
8. `FICHIERS À MODIFIER OU CRÉER`
9. `PLAN DE TEST ET DE DÉMONSTRATION`
10. `QUESTIONS STRICTEMENT NÉCESSAIRES`

Chaque affirmation doit être marquée `CONSTATÉ` ou `PROPOSÉ`.

Termine par :

> Audit terminé. J’attends l’approbation du plan avant de modifier le dépôt Ñkyel actuel.

## 25. COMMANDE QUE DANIEL T’ENVERRA APRÈS VALIDATION

Quand Daniel répond avec la commande suivante, commence l’exécution P0 et ne t’arrête pas à de nouvelles recommandations générales :

> **Plan approuvé. Exécute P0 dans le dépôt Ñkyel actuel, par lots vérifiables. À la fin de chaque lot, lance les tests pertinents, corrige les régressions et rapporte MODIFIÉ, TESTÉ, BLOQUÉ et ROADMAP. Ne déploie, ne pousse, ne supprime et ne migre rien sans mon accord explicite.**

# FIN DU PROMPT À DONNER À OPUS

---

## RÉSULTAT ATTENDU

Opus doit d’abord transformer la vision en constat technique, puis livrer le chemin critique réel :

**Mission autonome → événements réels → WorkGraph → VIE → intervention utilisateur → replan réel → preuves → livrables → replay.**

Tout ce qui ne renforce pas cette boucle avant le 31 août est secondaire.
