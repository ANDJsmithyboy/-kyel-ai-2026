# ÑKYEL AI — AUDIT D'ARCHITECTURE ET DE QUALITÉ VISUELLE FRONTEND
## Apple Liquid Glass × Geist × Ñkyel VIE

**SmartANDJ AI Technologies · Fondateur & Architecte en Chef : Daniel Jonathan ANDJ**  
**Date :** 24 Août 2026  
**Statut :** AUDIT INITIAL & PLAN DE RECONSTRUCTION MÉTHODIQUE

---

## 1. ÉTAT ACTUEL (CURRENT)

### 1.1 Typographie & Lisibilité
* **Problème :** Présence résiduelle de classes d'opacité arbitraire (`text-white/40`, `text-white/50`, `text-gray-500`) générant des contrastes insuffisants (< 3:1) sur les écrans standards et sous Windows à 125% DPI.
* **Taille :** Manque de standardisation stricte entre pages (certains formulaires en 11px au lieu des 14-16px prescrits).
* **Polices :** Définitions Geist parfois fragmentées entre Next/Font et des déclarations inline CSS.

### 1.2 Matériaux & « Glass Partout »
* **Problème :** L'ancien effet glassmorphism (simple `backdrop-blur` avec bordure blanche 10%) a parfois été appliqué sans discernement sur des cartes de contenu, créant une accumulation « verre sur verre sur verre » (Glass card dans Glass modal dans Glass sidebar) qui dilue la lisibilité et détruit la hiérarchie spatiale.
* **Absence de système matériel sémantique :** Absence de composant unifié `<Surface material="..." />` imposant la séparation stricte entre *Content Layer* (solide / stable) et *Functional Layer* (verre liquide fonctionnel).

### 1.3 Sidebar & Navigation
* **Problème :** Hauteurs d'items hétérogènes (40px vs 36px), alignement optique perfectible des icônes de 16-20px avec la ligne de base du texte, et état actif parfois trop marqué ou manquant de finesse.

### 1.4 Zone de Saisie (Composer)
* **Problème :** Le composer doit être perçu comme un *objet physique numérique* indépendant flottant au-dessus du flux de conversation avec halo de focus subtil et gestion exemplaire du drag-and-drop.

### 1.5 Paramètres & Profil
* **Problème :** Certaines sections conservaient un aspect « dashboard B2B / soupe de cartes », au lieu du calme et de la clarté en rangées horizontales inspirées d'Apple et de Luma AI.

---

## 2. OBJECTIF VISUEL CIBLE (TARGET)

* **Architecture Spatiale à 4 Niveaux :**
  1. **Level 0 (Canvas) :** `#05060A` (Dark) / `#FBFBF9` (Light) — Fond profond, silencieux, non texturé.
  2. **Level 1 (Content Layer) :** Surfaces solides, stables, haut contraste pour le chat, les artifacts VIE, le WorkGraph, les documents et les tables. ZÉRO verre inutile.
  3. **Level 2 (Functional Glass Layer) :** Sidebar, Composer, Command Palette, Floating Toolbars — Verre régulier avec réfraction, saturation, halo spéculaire supérieur et ombre ambiante.
  4. **Level 3 (Transient Glass Layer) :** Popovers, menus contextuels, inspecteurs flottants éphémères.
* **Garantie de Contraste Absolu (WCAG 2.2 AA) :**
  * Texte Primaire : 100% contraste (`#FFFFFF` en dark, `#090A0E` en light) ≥ 14:1
  * Texte Secondaire : 80% contraste (`#B4BAC8` en dark, `#474E5D` en light) ≥ 7:1
  * Métadonnées & Tertiaire : 65% contraste (`#828C9E` en dark, `#6E7687` en light) ≥ 4.5:1
* **Discipline Typographique Geist :**
  * `Geist Sans` pour 100% de l'interface utilisateur.
  * `Geist Mono` exclusivement pour code, IDs, logs et tokens techniques.
  * Fallbacks polyglottes soignés pour l'arabe (RTL), le chinois, le japonais et les extensions latines africaines.
* **Ancrage Profil Luma AI :**
  * Profil utilisateur ancré en bas à gauche de la sidebar avec popover compact instantané.
* **Palette de Commande Universelle (⌘K) :**
  * Verre flottant fonctionnel, réactivité instantanée (< 50ms), navigation clavier complète.

---

## 3. ÉCARTS IDENTIFIÉS (GAPS)

| Domaine | État Actuel | Cible Requise | Action Corrective |
| :--- | :--- | :--- | :--- |
| **Tokens Matériaux** | Classes disparates `.glass-*` | Tokens sémantiques `--material-*` | Définir les 8 tokens de matériaux et le composant `<Surface>` |
| **Imbrication Verre** | Verre sur Verre fréquent | Content = Solide / UI = Verre | Nettoyer les cards de chat, tableaux et formulaires |
| **Tailles Typo** | Variabilité (10px - 14px) | Échelle Geist stricte (min 13-16px) | Standardiser l'échelle typographique |
| **Contraste Muted** | `text-white/40` | `var(--text-secondary)` ≥ 4.5:1 | Remplacer toutes les opacités arbitraires |
| **Rayons (Radii)** | `rounded-xl`, `2xl` au hasard | Échelle de concentricité nested | Appliquer la formule `R_inner = R_outer - inset` |
| **Ombres (Shadows)** | Ombres plates Tailwind | Ombres multi-couches (Ambient + Key) | Créer `--shadow-ambient` + `--shadow-key` |
| **Motion** | `transition: all` résiduel | Propriétés explicites (`opacity`, `transform`) | Remplacer par des courbes physiques déterministes |
| **RTL (Arabe)** | Support partiel | Inversion complète de flux et icônes | Vérifier l'agencement RTL sur toutes les vues |

---

## 4. PLAN D'EXÉCUTION MÉTHODIQUE (26 ÉTAPES)

1. **01 AUDIT** — `docs/design/frontend-audit.md` (Ce document).
2. **02 TYPOGRAPHY** — Centralisation Geist Sans/Mono, polices mondiales et rendu sous Windows/Mac/iOS/Android.
3. **03 CONTRAST** — Éradication du texte illisible, validation contrastes WCAG 2.2 AA.
4. **04 COLOR TOKENS** — Rationalisation des palettes Geist, fond noir profond, lumière Apple.
5. **05 MATERIAL SYSTEM** — Implémentation du système à 4 couches et du composant `<Surface />`.
6. **06 SPACING & RADII** — Grille spatiale 4/8px et concentricité des rayons.
7. **07 ICON SYSTEM** — Unification monochrome, épaisseur de trait et centrage optique.
8. **08 APP SHELL** — Unification du conteneur d'application.
9. **09 SIDEBAR** — Couche fonctionnelle inset, profil Luma en bas à gauche.
10. **10 CHAT & 11 COMPOSER** — Objet physique numérique, bulles solides épurées.
11. **12 COMMAND PALETTE** — Surface flottante ⌘K ultra-rapide.
12. **13 PROFILE & 14 SETTINGS** — Rangées calmes Apple × Luma, persistance Neon PostgreSQL.
13. **15 MEMORY, 16 VISUAL AGENT, 17 VIE, 18 WORKGRAPH, 19 WORLD MODEL, 20 ADMIN**.
14. **21 RESPONSIVE & 22 ACCESSIBILITY** — Support mobile safe-areas, tactiles ≥ 44px, navigation clavier.
15. **23 MOTION & 24 PERFORMANCE** — Animations causales, zéro CLS, optimisation GPU.
16. **25 VISUAL QA & 26 SUBPIXEL QA** — Examen à 400% de la géométrie et des bordures.
17. **SPECIFICATION FINALE** — `docs/design/nkyel-design-system.md`.
