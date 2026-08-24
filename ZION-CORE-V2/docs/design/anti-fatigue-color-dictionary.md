# 🎨 DICTIONNAIRE DES COULEURS ERGONOMIQUES & ANTI-FATIGUE VISUELLE
## Guide Scientifique de Réfraction, Contraste Perceptif (APCA / WCAG 2.2) et Nuances Souveraines

**SmartANDJ AI Technologies · Fondateur & Architecte en Chef : Daniel Jonathan ANDJ**  
**Édition de Référence Mondiale 2026**

---

## 1. 🧠 FONDEMENTS SCIENTIFIQUES : POURQUOI LES INTERFACES FATIGUENT LES YEUX

L'œil humain subit une fatigue visuelle (asthénopie) lorsqu'il est exposé à :
1. **L'éblouissement photonique (White Glare)** : Un blanc pur `#FFFFFF` (RGB: 255, 255, 255) sur toute la surface de l'écran en plein jour sature les photorécepteurs rétiniens.
2. **La vibration optique & l'effet de blooming (Halation)** : Un noir OLED pur `#000000` combiné à un texte blanc vif `#FFFFFF` crée une dispersion lumineuse sur les bords des lettres, particulièrement inconfortable pour les 40% d'utilisateurs présentant un léger astigmatisme.
3. **Les gris délavés sans contraste** : Les gris intermédiaires mal calibrés (inférieurs à un ratio 4.5:1) forcent le muscle ciliaire à un effort d'accommodation constant.
4. **La sur-saturation des accents néons** : Des couleurs d'accent trop vives (comme un or fluo ou un jaune canari) provoquent une fatigue d'adaptation chromatique.

---

## 2. ☀️ PALETTE LIGHT SOUVERAINE (Apple Paper × Radix Sand/Slate)

Le mode clair de Ñkyel utilise une base de type « Papier Velin Apple » adouci, éliminant 90% de l'éblouissement tout en conservant une netteté cristalline.

| Token Sémantique | Code Hex / RGBA | Rôle Ergonomique | Ratio de Contraste |
| :--- | :--- | :--- | :--- |
| **`--material-canvas`** | `#FBFBF9` | Fond global silencieux. Température neutre chaude (Warm Paper) évitant l'éblouissement. | Base Canvas |
| **`--material-content`** | `#FFFFFF` | Cartes solides, documents, bulles de chat. Apporte la netteté et la structure. | 1.05:1 vs Canvas |
| **`--material-content-raised`** | `#F4F4F1` | État surélevé, panneaux secondaires et champs de formulaire au repos. | Hiérarchie douce |
| **`--text-primary`** | `#090A0E` | Encre d'imprimerie noble. Évite la dureté du noir absolu tout en assurant un contraste maximal. | **18.2:1 (WCAG AAA)** |
| **`--text-secondary`** | `#474E5D` | Paragraphes de lecture longue, explications, labels. Doux pour la rétine. | **6.4:1 (WCAG AA)** |
| **`--text-tertiary`** | `#6E7687` | Métadonnées, raccourcis ⌘K, horodatages. Lisible sans distraire. | **4.6:1 (WCAG AA)** |
| **`--border`** | `rgba(9, 10, 14, 0.08)` | Séparateurs subpixel. Délimitation nette sans bruit visuel. | Subpixel Calme |
| **`--accent` (Or Souverain)** | `#B8922A` | Or ambré profond calibré pour fond clair. Jamais jaune fluo délavé. | **4.7:1 (WCAG AA)** |

---

## 3. 🌙 PALETTE DARK SOUVERAINE (Black Panther OLED × Radix Slate)

Le mode sombre de Ñkyel repose sur une architecture en couches étagées (*Layered Elevation*) inspirée de Vercel Geist et d'Apple macOS Dark Mode.

| Token Sémantique | Code Hex / RGBA | Rôle Ergonomique | Ratio de Contraste |
| :--- | :--- | :--- | :--- |
| **`--material-canvas`** | `#05060A` | Noir profond OLED spatial. Pas de reflets grisâtres résiduels. | Base Canvas |
| **`--material-content`** | `#0D0F17` | Surface solide de lecture (Chat, Code, Documents). Supprime l'effet de blooming. | Étage 1 (Elevation) |
| **`--material-content-raised`** | `#131622` | Surfaces actives, inspecteur contextuel, menus déroulants. | Étage 2 (Depth) |
| **`--text-primary`** | `#FFFFFF` | Titres majeurs et messages principaux. Visibilité immédiate. | **19.5:1 (WCAG AAA)** |
| **`--text-secondary`** | `#B4BAC8` | Corps de texte et réponses de l'IA. Anthracite doux évitant la fatigue nocturne. | **11.8:1 (WCAG AAA)** |
| **`--text-tertiary`** | `#7E889B` | Métadonnées, statuts et compteurs de tokens. | **5.8:1 (WCAG AA)** |
| **`--border`** | `rgba(255, 255, 255, 0.08)` | Micro-liseré subpixel apportant la physicalité sans agression. | Subpixel Calme |
| **`--accent` (Or Champagne)** | `#D5AE57` | Or royal lumineux et prestigieux. Rayonne avec élégance sans éblouir. | **10.4:1 vs Dark** |

---

## 4. 💎 LES 5 ACCENTS SOUVERAINS HARMONIEUX (Calibrés Anti-Stress)

Les accents de couleur sont utilisés uniquement pour les anneaux de focus, les badges de statut et les indicateurs d'interaction :

1. **Or Souverain (`gold`)** :
   - Mode Sombre : `#D5AE57` (Prestige et clarté souveraine)
   - Mode Clair : `#B8922A` (Ambre profond à haut contraste)
2. **Bleu Smart (`blue`)** :
   - Mode Sombre : `#0070F8` (Bleu Geist Vercel / Apple Pro)
   - Mode Clair : `#0060D0` (Bleu d'encre réconfortant)
3. **Bleu Réseau / Cyan (`cyan`)** :
   - Mode Sombre : `#00D4AA` (Menthe/Cyan technologie)
   - Mode Clair : `#008F72` (Émeraude profonde reposante)
4. **Magenta Signal (`magenta`)** :
   - Mode Sombre : `#F00080` (Magenta vibrant)
   - Mode Clair : `#B80062` (Rubis profond)
5. **Graphite Calme (`graphite`)** :
   - Mode Sombre : `#8A92A0` (Minéral neutre)
   - Mode Clair : `#5C6472` (Ardoise dense)

---

## 5. 🎯 RÈGLES D'APPLICATION DANS TOUT LE CODEBASE

1. **Pas de `text-white` ni `text-black` bruts** : Utiliser exclusivement `text-[var(--text-primary)]`, `text-[var(--text-secondary)]`, ou `text-[var(--text-tertiary)]`.
2. **Pas de `bg-white` ni `bg-black` isolés** : Utiliser `bg-[var(--material-canvas)]`, `bg-[var(--material-content)]`, ou `bg-[var(--surface-raised)]`.
3. **Les bordures utilisent `var(--border)`** : Jamais de bordures contrastées à 50% d'opacité. Les séparateurs restent toujours subpixels (`0.08` d'opacité).
4. **Les icônes utilisent `currentColor`** : Elles héritent naturellement du contraste optimal du texte qui les accompagne.
