# 🔍 RAPPORT D'ANALYSE ROOT CAUSE — TYPOGRAPHIE & RÉGLAGE DE TAILLE
## Échelle Adaptative & Propagation Proportionnelle

**SmartANDJ AI Technologies · Fondateur & Architecte en Chef : Daniel Jonathan ANDJ**  
**Édition de Référence Production 2026**

---

## 1. POURQUOI LA TAILLE DU TEXTE NE SE PROPAGAIT PAS

1. **Utilisation de Valeurs Pixel Statiques** : De nombreux composants utilisaient des classes directes `text-[12px]`, `text-[14px]`, `text-[16px]` isolées de la variable d'échelle racinaire.
2. **Absence de Facteur de Multiplicateur Universel** : Le sélecteur `fontSize` modifiait une valeur locale dans le store sans piloter dynamiquement `--app-text-scale` au niveau de `:root`.
3. **Confusion entre Zoom Navigateur et Échelle Typographique** : L'utilisation de `zoom` ou `transform: scale()` était à proscrire car elle dégradait le rendu sous-pixel et les cibles tactiles.

---

## 2. SOLUTION ARCHITECTURALE DÉPLOYÉE

Dans `tokens.css`, l'ensemble de l'échelle typographique Geist est désormais calculé dynamiquement :

```css
:root {
  --app-text-scale: 1;
  --text-micro:    calc(12px * var(--app-text-scale, 1));
  --text-caption:  calc(13px * var(--app-text-scale, 1));
  --text-sm:       calc(14px * var(--app-text-scale, 1));
  --text-body:     calc(15px * var(--app-text-scale, 1));
  --text-base:     calc(16px * var(--app-text-scale, 1));
  --text-lg:       calc(18px * var(--app-text-scale, 1));
  --text-xl:       calc(20px * var(--app-text-scale, 1));
  --text-2xl:      calc(24px * var(--app-text-scale, 1));
  --text-3xl:      calc(28px * var(--app-text-scale, 1));
  --text-4xl:      calc(34px * var(--app-text-scale, 1));
  --text-display:  calc(42px * var(--app-text-scale, 1));
}

[data-text-size="small"] {
  --app-text-scale: 0.88;
}

[data-text-size="default"],
[data-text-size="normal"] {
  --app-text-scale: 1.0;
}

[data-text-size="large"] {
  --app-text-scale: 1.14;
}
```

* **Résultat** : Un changement de taille de texte dans les Paramètres ajuste instantanément la totalité des titres, paragraphes, barres d'outils et bulles de conversation sans briser la mise en page.
