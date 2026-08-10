# Gaboma AI — Design System V3 (Fusion Claude × Gemini)

Ce document est la source de vérité unique pour le design system de Gaboma AI (web Next.js 15, Kotlin Android, Swift iOS).

## 1. Typographie

- Échelle : Major Third 1.25 (base 16px), hiérarchie claire sans rupture agressive.
- Niveaux principaux (web) :
  - Caption : 12px / lh 16 / Sora Regular 400
  - Small / Meta : 13px / lh 18 / Sora Medium 500 / +0.02em
  - Body : 16px / lh 24 / Sora Medium 500 (texte de chat)
  - Body Large : 18px / lh 28 / Sora Regular 400
  - Label / H4 : 20px / lh 26 / Outfit SemiBold 600 / -0.01em
  - H3 : 25px / lh 32 / Outfit SemiBold 600 / -0.015em
  - H2 : 32px / lh 40 / Outfit SemiBold 600 / -0.02em
  - H1 : 40px / lh 48 / Outfit SemiBold 600 / -0.025em
  - Code inline : 13px / lh 20 / JetBrains Mono
  - Code block : 14px / lh 22 / JetBrains Mono

- Letter-spacing :
  - Labels/eyebrows en CAPS (RADAR LOXO, AURATA, ONYX) : +0.06 à +0.08em.
  - Boutons : +0.01em.
  - Métadonnées : +0.02em.

- Multi-plateforme :
  - Android : tailles en sp, mapping direct (16px → 16sp). Respect du scaling système.
  - iOS : Dynamic Type text styles (body, title3, title1, largeTitle…), pas de valeurs pt fixes.

## 2. Texte IA / texte utilisateur (sans bulles)

- Texte IA (AURATA/SONAR/ONYX/BP) :
  - Aligné à gauche, pleine largeur (max ~720px).
  - Sora Medium 500.
  - Zéro fond, uniquement la couleur de texte.

- Texte utilisateur (prompt) :
  - Aligné à droite, largeur max 70–75 %.
  - Sora SemiBold 600.
  - Fond glass très léger (rappel de l'input) et possibilité d'une fine bordure gauche 2px accent sur certaines vues.
  - Pas de labels "Vous / GabomaAI" : position + poids suffisent.

## 3. Thèmes & couleurs

### Thèmes principaux

- black-panther (défaut)
  - bg : #020304
  - texte IA : #EDEAE3 (blanc chaud)
  - texte secondaire : #8A8378 (gris-or désaturé)
  - accent : #C5A059 (or sablé)

- obsidian
  - bg : #050810
  - texte IA : #E4E7EC
  - texte secondaire : #6B7280
  - accent par défaut : turquoise #00D4AA (pour différencier clairement du thème black-panther or).

Les autres thèmes (bleu-nuit, vert-forêt, noir-oled, blanc-émeraude) suivent la même logique : texte principal très lisible, texte secondaire désaturé, accent adapté.

### Palette gabonaise sémantique

Palette commune, ajustée selon le thème :

- Succès : #1F9D6B (vert forêt / okoumé).
- Erreur : #E0584B (latérite).
- Avertissement : #D98E3B (ocre raphia).
- Info : #5B8DEF (acier).

Neutres pour black-panther :

#020304 → #14130F → #28251E → #3D392E → #5C5648 → #8A8378 → #C9C3B5 → #EDEAE3.

Interpolation en OKLCH pour conserver une progression perceptuelle propre.

## 4. Blocs de code

- Conteneur :
  - Rayon 10px.
  - Bordure 1px à ~8 % d'opacité de l'accent du thème.
  - Fond = neutre N800 (un cran plus clair que le bg général). Jamais glass.

- Header :
  - Hauteur 36–40px.
  - Langage à gauche (JetBrains 12px).
  - Bouton "Copier" à droite.

- Bouton Copier :
  - Icône Phosphor `copy` thin.
  - Hover : fond 8 % accent, icône full opacity.
  - Clic : icône `check`, couleur succès pendant ~1.6–2 s, et toast discret ("Copié" / "Tolibangado").

- Corps :
  - JetBrains Mono 14px (desktop), 13px (mobile).
  - Scroll horizontal (jamais de wrap forcé).
  - Mobile : fade gradient à droite pour indiquer qu'il reste du contenu.

- Coloration :
  - Palette dérivée des couleurs Gabon (latérite/okoumé/raphia/forêt), désaturée.
  - Pas de couleurs "VS Code" criardes.

## 5. Composants interactifs

- Dropdowns (Vecteur de Force, menus) :
  - Fond glass léger ou fond solide selon contexte, border 1px subtile.
  - Hover : fond ~6 % accent.
  - Sélectionné : fond ~10 % accent + icône check à droite.
  - Navigation clavier complète + anneau de focus accent 2px.

- Tabs :
  - Onglet actif marqué par un trait souligné animé (position + largeur).
  - Pas de fond plein sur l'onglet actif.

- Accordéons :
  - Chevron Phosphor thin, rotation 180° en ~200–300ms.
  - Hauteur animée via Framer Motion (mesure de hauteur), pas display:none.

- Switches / toggles :
  - Piste fine, thumb avec ombre douce.
  - Pas d'icône dans le thumb.

- Skeletons :
  - Shimmer/pulse léger (opacité max ~0.1, durée ~1.4–2s).

- Toasts :
  - Bas à droite desktop, pleine largeur bas mobile.
  - Glass cohérent, icône de sévérité + barre accent 3px à gauche.
  - 4s (succès/info), persistant jusqu'au dismiss (erreur).

## 6. Agent ONYX / BLACK PANTHER

### Layout

- Desktop :
  - Colonne chat ~40 %.
  - Colonne Le Rendu ~60 % (doit dominer visuellement).

- Mobile :
  - Tabs en haut (Chat / Le Rendu / Workspace), plutôt qu'un stack vertical infini.

### AgentTimeline

- Liste verticale : pastilles (pending, active, done, error) reliées par une ligne à ~15 % d'opacité.
- Pastille active : anneau animé (stroke accent qui tourne).
- Done : check vert succès.
- Erreur : croix latérite.
- Ligne qui peut se remplir progressivement au fil des étapes.

### AgentTerminal

- Fond : neutre très sombre du thème (éviter #000 pur partout).
- JetBrains Mono 13px.
- Mapping ANSI sur palette : vert = succès forêt, rouge = latérite, jaune = raphia, bleu = info.
- Curseur terminal clignotant couleur accent à la fin du streaming.

### AgentComputer

- Cadre avec bordure 1px accent à ~20 % opacité.
- Header : URL + badge LIVE (point 6px pulsant vert).
- Coupure : overlay glass avec icône wifi-slash + message de reconnexion.

### AgentFileTree

- Arborescence type VS Code avec icônes Phosphor (file, code, image, pdf…).
- Hover : fond ~6 % accent.
- Clic : preview dans Le Rendu (panneau), pas nouvel onglet brut.

## 7. Iconographie

- Famille unique : Phosphor Icons, style thin, stroke 1.5px, grille 24×24, coins légèrement arrondis, stroke-linecap="round".
- Pas de Lucide/Tabler en prod. Si icône manquante → icône custom dans la grille Phosphor.

Icônes custom à créer :

- IbogaAiIcon.
- LeRenduIcon.
- RadarLoxoIcon.
- VecteurDeForceIcon.
- AlimenterLaMeuteIcon.

## 8. Design tokens & cross-plateforme

- Source unique : fichier JSON (ou YAML) versionné dans zion-core.
- Contenu : theme, color, typography, radius, spacing…

Usage :

- Web : conversion en variables CSS consommées par Tailwind v4.
- Android : script build → ColorScheme + Typography Compose.
- iOS : Color Assets + struct Swift DesignTokens + mapping Dynamic Type.

Pixel-identique exigé (Web / WebView Android / WebView iOS) pour :

- AgentTimeline.
- AgentTerminal.
- AgentComputer.
- AgentFileTree.
- Le Rendu.

Différences natives autorisées (navigation, transitions, haptique) ailleurs.

## 9. Responsive

- < 640px (mobile) :
  - Sidebar (L'Antre) = drawer.
  - Input bar full width, Vecteur de Force en bottom-sheet.

- 640–1024px (tablette) :
  - Sidebar rétractable (icône).
  - Input bar ~90 % largeur.

- > 1024px (desktop) :
  - Sidebar fixe ~260–280px.
  - Colonne de chat cappée à ~720–760px pour la lisibilité.

- Admin :
  - Desktop : toutes colonnes visibles.
  - Mobile : 2–3 colonnes max + détail en accordéon (pas de scroll horizontal de tableau).

## 10. Motion & accessibilité

- Durées :
  - Hover/click : 120–150 ms.
  - Dropdowns/menus : ~180 ms.
  - Modales : ~200 ms.
  - Changement de thème : ~240 ms, easeInOut.

- Streaming texte IA :
  - Pas d'animation par caractère.
  - Fade du paragraphe entier à l'arrivée du premier token, puis texte qui pousse naturellement.

- Réseau faible :
  - Détecter navigator.connection et désactiver blur/effets lourds en 2G/3G.

- prefers-reduced-motion :
  - Désactiver shimmer, pulses "live", transitions de thème animées.

- Focus visible :
  - Anneau 2px accent très net, pas un simple changement de fond.

- ARIA streaming :
  - Région aria-live="polite" mise à jour une seule fois à la fin de la réponse.

---

Ce document est la base unique à respecter sur tout le stack Gaboma AI (web, Android, iOS). Toute nouvelle couleur ou taille doit être vérifiée au contraste (WCAG 2.2) avant merge.
