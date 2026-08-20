# GOOGLE-APPLICATION-FACTS.md

- **Nom :** Ñkyel AI
- **Entreprise :** SmartANDJ AI Technologies
- **Fondateur :** Daniel Jonathan ANDJ
- **Définition officielle :** “Ñkyel AI is an autonomous agent whose work becomes a living, verifiable, user-editable visual workspace.”
- **Problème :** Les agents autonomes opèrent souvent en boîte noire. L'utilisateur attend le résultat final sans pouvoir interagir, valider les preuves ou rediriger le raisonnement pendant son exécution.
- **Solution :** Une interface agentique couplée à un modèle de WorkGraph événementiel. Chaque appel de modèle, appel d'outil (via MCP) ou extraction de preuve est modélisé comme un nœud, permettant à l'utilisateur de voir, valider, modifier et rejeter le raisonnement en temps réel, entraînant une replanification déterministe.
- **Différenciation :** Ce n'est ni un simple chatbot ni un canvas statique, mais un agent dont le graphe d'exécution causal est la véritable base de données (WorkGraph), rejouable et auditable.
- **Fonctionnement WorkGraph & VIE :** Le backend émet des événements via SSE. Le réducteur frontend construit le graphe visuel de causalité. Le temps réel reflète la véracité des appels backend.
- **Rôle matériel de Gemini :** Gemini 2.5/3.0 agit comme l'orchestrateur (planification) et l'analyste principal (synthèse, extraction des réclamations/preuves).
- **Impact prévu :** Permettre l'adoption de l'IA agentique dans les flux de travail critiques (recherche, due diligence, analyse) où la confiance et l'auditabilité sont non négociables.
- **Origine & Ambition :** Origine gabonaise, avec une ambition mondiale, tout en priorisant à terme l'adaptation aux contextes et langues africaines.
- **Stade réel :** Prototype.
- **Limites actuelles :** RAG avancé non implémenté. Graphe limité en scalabilité visuelle au-delà de 200 nœuds simultanés. Pas d'architecture multi-utilisateurs.
- **Roadmap :** Intégration A2A, AP2 (paiements agentiques), portage mobile, modèles locaux via P2P.
- **Métriques :** 0 revenu (stade prototype), 0 partenariat externe.
- **URL de la démo :** [A COMPLETER LORS DU DEPLOIEMENT]
- **Lien vidéo :** [A COMPLETER APRES ENREGISTREMENT]
