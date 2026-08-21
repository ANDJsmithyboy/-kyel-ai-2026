# Ñkyel WorkGraph & Espace VIE — Guide d'Exécution & Intervention

> **SmartANDJ AI Technologies** · **Fondateur** : Daniel Jonathan ANDJ

---

## 1. Vision de l'Espace Visuel VIE

L'espace **Ñkyel VIE** transforme l'exécution agentique en une réalité visuelle transparente et vérifiable. L'utilisateur ne consulte pas des données simulées, mais observe les événements exacts émis par le StateGraph DeerFlow :

* `search.started`, `search.query_created`, `browser.navigated`, `browser.extracted`
* `hypothesis.created`, `contradiction.detected`, `artifact.created`
* `checkpoint.created`, `plan.recalculated`

---

## 2. Cycle de l'Intervention Visuelle Sémantique (Section 27)

L'utilisateur peut intervenir directement sur n'importe quel nœud ou relation du WorkGraph :

```text
1. Clic sur un nœud dans l'Espace VIE
2. Choix de l'intervention :
   - Modifier une contrainte (human.constraint_updated)
   - Rejeter une hypothèse (human.hypothesis_rejected)
   - Demander une preuve certifiée (human.proof_requested)
   - Réaffecter la tâche (human.task_reassigned)
   - Mettre en pause une branche (human.branch_paused)
3. Appel API : POST /api/v1/workgraph/intervene
4. Événement append-only enregistré dans Neon / Event Store
5. Interruption contrôlée du runtime DeerFlow
6. Replanification sémantique (plan.recalculated)
7. Actualisation instantanée du WorkGraph et reprise de la mission.
```
