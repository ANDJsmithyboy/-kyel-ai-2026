# ÑKYEL AI — SYSTÈME DE DESIGN OFFICIEL V2
## Apple Liquid Glass × Geist × Ñkyel VIE

**SmartANDJ AI Technologies · Fondateur & Architecte en Chef : Daniel Jonathan ANDJ**  
**Édition de Référence Mondiale 2026**

---

## 1. PHILOSOPHIE & PRINCIPES FONDAMENTAUX

1. **READABILITY BEFORE AESTHETICS** : Aucun compromis visuel ne doit dégrader la lisibilité. Le texte informatif respecte strictement le seuil WCAG 2.2 AA (≥ 4.5:1 en texte standard, ≥ 14:1 en texte primaire).
2. **CONTENT BEFORE CHROME** : Le produit met en valeur le travail de l'utilisateur (conversations, code, documents, graphes agentiques VIE) plutôt que des décorations d'interface envahissantes.
3. **SEPARATION DU VERRE ET DU CONTENU** : Le contenu repose sur des surfaces solides et stables. Le verre liquide (*Liquid Glass*) est réservé exclusivement à la couche fonctionnelle flottante (Sidebar, Composer, Command Palette, Barres d'outils).
4. **OPTICAL ALIGNMENT BEFORE MATHEMATICAL DOGMA** : La géométrie pure est corrigée optiquement (centrage des icônes, baselines typographiques, alignement des chevrons).
5. **CAUSALITY BEFORE MOTION** : Les animations n'existent pas pour décorer mais pour expliquer la causalité backend (spawning d'agents, mise à jour du WorkGraph, exécution d'outils).

---

## 2. ARCHITECTURE MATÉRIELLE SÉMANTIQUE (4 NIVEAUX)

```text
─────────────────────────────────────────────────────────────
LEVEL 0 · CANVAS
Fond profond, silencieux, non-texturé.
Dark : #05060A  |  Light : #FBFBF9
Token : --material-canvas
─────────────────────────────────────────────────────────────
LEVEL 1 · CONTENT LAYER (Surfaces Solides)
Chat, Artefacts VIE, Code, Documents, Tableaux, Paramètres.
Dark : #0D0F17 (Raised : #131622)  |  Light : #FFFFFF
Tokens : --material-content, --material-content-raised
─────────────────────────────────────────────────────────────
LEVEL 2 · FUNCTIONAL GLASS LAYER (Verre Liquide Régulier)
Sidebar, Zone de saisie (Composer), Command Palette (⌘K), Toolbars.
Translucidité + Flou 20-32px + Saturation 180% + Reflet spéculaire 1px
Tokens : --material-glass-regular, --material-glass-elevated, --material-glass-floating
─────────────────────────────────────────────────────────────
LEVEL 3 · TRANSIENT GLASS LAYER (Surfaces Éphémères)
Popovers contextuels, Menus déroulants, Modales, Scrims d'arrière-plan.
Tokens : --material-glass-clear, --material-overlay, --material-scrim
─────────────────────────────────────────────────────────────
```

---

## 3. ÉCHELLE TYPOGRAPHIQUE GEIST

* **Police UI Principale** : `Geist Sans`
* **Police Code & Technique** : `Geist Mono`
* **Fallbacks Mondiaux** : Arabe (RTL), CJK, Devanagari, Extensions Latines Africaines.

| Rôle Sémantique | Taille (px) | Line Height | Tracking | Poids | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`text-display`** | 42px | 1.10 | -0.035em | SemiBold (600) | Titres majeurs de bienvenue |
| **`text-4xl`** | 34px | 1.20 | -0.025em | SemiBold (600) | Titres de section |
| **`text-2xl`** | 24px | 1.35 | -0.015em | SemiBold (600) | Titres de panneaux |
| **`text-base`** | 16px | 1.50 | 0 | Regular (400) / Medium (500) | Corps de texte principal / Chat |
| **`text-body`** | 15px | 1.50 | 0 | Regular (400) | Formulaires & paramètres |
| **`text-sm`** | 14px | 1.50 | 0 | Medium (500) | Boutons, Navigation Sidebar |
| **`text-caption`** | 13px | 1.35 | 0.010em | Medium (500) | Sous-titres, Explications |
| **`text-micro`** | 12px | 1.35 | 0.015em | Regular (400) / Mono | Horodatages, Badges, Statuts |

---

## 4. PALETTE DE COULEURS & CONTRASTES WCAG 2.2 AA

### 4.1 Mode Sombre (Black Panther — Black-Led OLED)
* **Toile de fond (`--material-canvas`)** : `#05060A`
* **Texte Primaire (`--text-primary`)** : `#FFFFFF` (Ratio 18.5:1)
* **Texte Secondaire (`--text-secondary`)** : `#B4BAC8` (Ratio 8.2:1)
* **Texte Métadonnées (`--text-tertiary`)** : `#7E889B` (Ratio 4.8:1)
* **Or Souverain (`--brand-gold`)** : `#D5AE57` (Signature rare de prestige)
* **Bordures Subpixel (`--border`)** : `rgba(255, 255, 255, 0.08)`

### 4.2 Mode Clair (Apple Paper & Soft Glass)
* **Toile de fond (`--material-canvas`)** : `#FBFBF9`
* **Texte Primaire (`--text-primary`)** : `#090A0E` (Ratio 19.1:1)
* **Texte Secondaire (`--text-secondary`)** : `#474E5D` (Ratio 8.0:1)
* **Texte Métadonnées (`--text-tertiary`)** : `#6E7687` (Ratio 4.6:1)

---

## 5. CONCENTRICITÉ DES RAYONS (NESTED RADII)

Formule stricte appliquée :  
$$R_{\text{inner}} = R_{\text{outer}} - \text{inset}$$

* `--radius-control-sm` : 6px (Boutons compacts, tags)
* `--radius-control` : 8px (Champs de saisie, items de menu)
* `--radius-panel` : 12px (Conteneurs de cartes internes)
* `--radius-floating` : 16px (Barres d'outils flottantes)
* `--radius-modal` : 20px (Command Palette, Fenêtres modales)
* `--radius-composer` : 22px (Zone de saisie principale)
* `--radius-hero` : 26px (Grandes vitrines immersives)

---

## 6. SYSTÈME D'OMBRES MULTI-COUCHES

Pour un réalisme spatial Apple :
* `--shadow-ambient` : `0 8px 32px rgba(0, 0, 0, 0.55)` (Diffusion douce de l'environnement)
* `--shadow-key` : `0 2px 6px rgba(0, 0, 0, 0.40)` (Ombre de contact directe nette)
* `--shadow-floating` : Combinaison Ambient + Key pour objets en lévitation.
* `--shadow-modal` : `0 24px 72px rgba(0, 0, 0, 0.85)` pour immersion totale.

---

## 7. INTERACTIONS & COURBES PHYSIQUES (MOTION)

* Courbe Apple déterministe : `cubic-bezier(0.16, 1, 0.3, 1)`
* Ressort tactile : `cubic-bezier(0.175, 0.885, 0.32, 1.1)`
* Tokens temporels : Instantané 90ms, Rapide 150ms, Standard 220ms, Contexte 320ms.
* Règle absolue : ZÉRO `transition: all`. Déclaration explicite des propriétés animées (`opacity`, `transform`, `background-color`).
* Respect strict de `prefers-reduced-motion`.
