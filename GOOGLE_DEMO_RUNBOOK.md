# Ñkyel AI — Google Demo Candidate Runbook & Reviewer Guide
**SmartANDJ AI Technologies** · **Founder & AI Systems Architect : Daniel Jonathan ANDJ**

---

## 1. Objectif & Environnement Reviewer

L'instance **Google Demo Candidate** est spécialement configurée pour permettre aux équipes de revue et d'évaluation de Google AI d'inspecter, tester et éprouver le système en totale autonomie :
- **URL Dédiée** : `https://demo.nkyel.smartandjai.com`
- **Période de Stabilité Garantie** : Du 27 août 2026 jusqu'au 31 décembre 2026 au minimum
- **Indexation** : `noindex, nofollow, noarchive` via balises `<meta>` et en-tête HTTP `X-Robots-Tag`
- **Isolation du Tenant** : Données séparées (`google-demo-isolated-2026`), zéro donnée de bêta-testeur accessible.

---

## 2. Authentification Reviewer Autonome

Aucun contact préalable ou création manuelle de compte n'est requis par l'examinateur Google :

### Méthode 1 : Via l'URL Directe avec Jeton Confidentiel
L'examinateur reçoit une URL sécurisée de type :
`https://demo.nkyel.smartandjai.com/?reviewer_token=nkyel-google-reviewer-2026`

1. Le client envoie le jeton à `POST /api/v1/google-demo/auth`.
2. Le serveur valide le hachage **SHA-256** du jeton en temps constant via `hmac.compare_digest`.
3. Le serveur dépose un cookie de session chiffré `HttpOnly`, `Secure`, `SameSite=Lax`.
4. Le jeton est immédiatement retiré de la barre d'adresse du navigateur.

---

## 3. Capacités Google AI Intégrées & Vérifiables

Dans Ñkyel AI, **Google Gemini** n'est pas une simple intégration cosmétique : il intervient de façon matérielle et vérifiable :
1. **Compréhension Multimodale** : Analyse conjointe de documents juridiques gabonais, cartes forestières et images satellites.
2. **Planification & Critique Agentique** : Décomposition du but utilisateur en graphe de tâches vérifiables.
3. **Synthèse Multi-Sources** : Fusion et détection de contradictions entre les résultats Tavily et le RAG souverain.
4. **Langues Nationales Africaines** : Traduction et restitution en Fang, Mpongwe et Punu.
5. **Replanification Interactive** : Réajustement dynamique du WorkGraph lorsque l'utilisateur modifie une contrainte ou rejette une hypothèse dans le canvas VIE.

---

## 4. Scénarios Pré-ensemencés de Démonstration

Pour tester immédiatement les capacités sans partir d'une page blanche :
- **Scénario 1** : « Analyse Stratégique : Forêt du Bassin du Congo & Crédits Carbone »
- **Scénario 2** : « Audit Comparatif du Code Forestier Gabonais & Détection de Contradictions »
- **Scénario 3** : « Génération de Kit de Communication Multilingue (Français / Fang / Mpongwe) »

Pour réinitialiser les données démo :
```bash
python scripts/seed_google_demo.py
```
