# Matrice de Migration et Rebranding Ñkyel AI

Ce document trace toutes les occurrences du terme "Gaboma" ou des marques précédentes et indique l'action décidée pour la création de Ñkyel AI.

| Élément | Emplacement | Statut | Action | Nouvelle Valeur | Justification / Remarque |
|---------|-------------|--------|--------|-----------------|--------------------------|
| Nom du projet principal | `package.json` (ZION-CORE-V2, gabomagpt) | Remplacer | `nkyel-zion-core` / `nkyel-ai` | Séparation complète de l'identité. |
| Nom affiché | Partout dans le frontend | Remplacer | `Ñkyel AI` | "Ñkyel" signifie intelligence en langue Fang. |
| Fichiers images | Racine (`gaboma-ai-*.png`) | Supprimer/Remplacer | Fichiers `nkyel-ai-*.png` ou SVG générés | Nouvelle direction visuelle neutre et mondiale. |
| Variables d'environnement | `.env`, `.env.example` | Remplacer | Préfixe `NKYEL_` au lieu de `GABOMA_` | Assainissement des configurations. |
| Identifiants (IDs/Keys) | Codebase, DB (Drizzle, etc.) | Refactoriser | Ex: `nkyel_session` au lieu de `gaboma_session` | Indépendance des caches et storages (localStorage, Redis). |
| Noms de dossiers | `gabomagpt`, `gabomagpt-app-mobile-kotlin`, `GabomaGPT-iOS` | Revoir (P1/P2) | À renommer ou archiver si obsolète | Pour la P0, les répertoires peuvent rester si trop risqué, mais à isoler. |

## Principes de Remplacement
- Préserver les configurations techniques non liées à la marque.
- Remplacer les valeurs exposées à l'utilisateur.
- Refactoriser les clés de cache ou variables d'environnement.
- Revoir les dossiers racine pour la P1 ou P2, afin de ne pas casser les imports absolus dans l'immédiat (sauf si on peut tout `grep` sans risque).
