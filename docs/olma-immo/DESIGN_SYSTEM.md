# OLMART — Olma Immo Design System & Visual Foundation

Ce document définit les règles de la charte visuelle et les tokens de design de l'univers **Olma Immo & Location**.

---

## 1. Principes & Direction Visuelle

L'identité d'Olma Immo est pensée pour évoquer le calme, la durabilité et l'hospitalité méditerranéenne et algérienne :
- **Forest / Petrol** : Profondeur institutionnelle, sérénité et confiance.
- **Warm Ivory & Warm Beige** : Chaleur architecturale, textures minérales, douceur oculaire.
- **Terracotta & Warm Highlight** : Accents vibrants évoquant l'argile, le soleil couchant et la terre.
- **Typographie éditoriale** : Contraste équilibré entre *Playfair Display* (titres éditoriaux) et *Inter / Cairo* (lisibilité UI fonctionnelle).

---

## 2. Scoping & Isolation

Tous les tokens spécifiques à Olma Immo sont isolés sous la classe racine :
```css
.olma-immo-scope {
  /* Variables CSS Olma */
}
```
Cette isolation garantit que **le Marketplace Olmart** (avec ses styles ambre et zinc) reste strictement inchangé.

---

## 3. Tokens de Couleurs

### Brand
- `--olma-brand-primary`: `#1A3831` (Vert forêt principal)
- `--olma-brand-primary-dark`: `#0D281E` (Vert forêt sombre pour contrastes et fonds sombres)
- `--olma-brand-primary-light`: `#2A4D45` (Vert forêt clair / hover)
- `--olma-brand-accent`: `#C97A40` (Terracotta chaud)
- `--olma-brand-accent-soft`: `#E8A87C` (Terracotta clair / hover)
- `--olma-brand-highlight`: `#EBDCB8` (Sable doré / badges)
- `--olma-brand-highlight-light`: `#F4ECD8` (Ivoire doré)

### Backgrounds & Surfaces
- `--olma-bg-base`: `#FAF8F5` (Fond de page principal)
- `--olma-bg-subtle`: `#F7F4ED` (Fond secondaire subtil)
- `--olma-bg-muted`: `#F2EEE5` (Fond tertiaire / contrastes légers)
- `--olma-bg-dark`: `#0D281E` (Fonds sombres / Hero / Cartes foncées)
- `--olma-surface-default`: `#FFFFFF` (Cartes standard)
- `--olma-surface-subtle`: `#FAF8F5` (Surfaces douces)
- `--olma-surface-raised`: `#FFFFFF` (Surfaces avec élévation)
- `--olma-surface-muted`: `#F7F4ED` (Surfaces neutres secondaires)
- `--olma-surface-dark`: `#1A3831` (Surfaces de contraste)

### Bordures & Lignes
- `--olma-border-subtle`: `#F2EEE5`
- `--olma-border-default`: `#E8E2D4`
- `--olma-border-strong`: `#D8D2C4`
- `--olma-border-focus`: `#1A3831`
- `--olma-border-accent`: `#EBDCB8`

### Textes
- `--olma-text-primary`: `#1C211E`
- `--olma-text-secondary`: `#4A5550`
- `--olma-text-muted`: `#738079`
- `--olma-text-subtle`: `#9CA8A1`
- `--olma-text-inverse`: `#FAF8F5`
- `--olma-text-highlight`: `#EBDCB8`
- `--olma-text-accent`: `#C97A40`

---

## 4. Typographie

- **Display** : `--olma-font-display: "Playfair Display", Georgia, serif`
- **Functional UI** : `--olma-font-sans: "Inter", "Cairo", system-ui, sans-serif`

### Échelle :
- Hero : `clamp(2rem, 5vw, 3.25rem)`
- Display : `clamp(1.75rem, 4vw, 2.5rem)`
- H1 : `1.875rem` (30px)
- H2 : `1.5rem` (24px)
- H3 : `1.25rem` (20px)
- H4 : `1.125rem` (18px)
- Body Lead : `1.0625rem` (17px)
- Body : `0.9375rem` (15px)
- Body Small : `0.8125rem` (13px)
- Caption : `0.6875rem` (11px)

---

## 5. Rayons de Courbure (Radius)

- `sm` : `0.375rem` (6px)
- `md` : `0.5rem` (8px)
- `lg` : `0.75rem` (12px)
- `xl` : `1rem` (16px - Standard pour les cartes Olma)
- `2xl` : `1.25rem` (20px - Grands conteneurs)
- `3xl` : `1.5rem` (24px - Shells & Modales)
- `full` : `9999px` (Pills, badges, filtres)

---

## 6. Élévations & Ombres (Shadows)

Les ombres Olma Immo se distinguent par leur nuance chaude et subtile, inspirée du vert forêt et de la lumière naturelle :
- `subtle`: `0 1px 2px rgba(26, 56, 49, 0.04), 0 2px 6px rgba(26, 56, 49, 0.02)`
- `card`: `0 4px 16px -2px rgba(26, 56, 49, 0.05), 0 1px 3px rgba(26, 56, 49, 0.03)`
- `floating`: `0 12px 32px -4px rgba(26, 56, 49, 0.12), 0 4px 12px rgba(26, 56, 49, 0.06)`

---

## 7. Primitives UI Olma Immo

### A. `OlmaSurface` & `OlmaSection` (Phase 1.2)
- Conteneurs de base avec gestion des élévations et arrière-plans thématiques.

### B. `OlmaCard` & `OlmaPill` (Phase 1.3)
- Cartes immobilières et badges d'état (statut de bien, labels légaux, tags de réservation).

### C. `OlmaButton` (Phase 1.4)
- **Rôle** : Élément d'action tactile premium et universel pour l'écosystème Olma Immo.
- **Variantes** :
  - `primary` : Action principale (vert forêt `var(--olma-brand-primary)` + accent doré).
  - `secondary` : Action secondaire neutre (surface claire + bordure douce).
  - `outline` : Action légère contourée (bordure vert forêt).
  - `ghost` : Boutons sans fond (actions contextuelles, icônes discrètes).
  - `accent` : Action forte/mise en avant (terracotta ambré `var(--olma-brand-accent)`).
  - `dark` : Vert forêt très profond (`var(--olma-brand-primary-dark)`).
  - `danger` : Actions destructives ou d'annulation (fond rose doux + texte rouge sémantique).
- **Tailles** : `sm` (36px min), `md` (42px min), `lg` (48px min), `icon` (format carré 40x40px).
- **Fonctionnalités** :
  - Polymorphisme natif via prop `as` (`as="button"`, `as="a"`, `as={Link}`).
  - Support du chargement avec indicateur accessible (`loading`, `loadingText`, `aria-busy`).
  - Slots d'icônes `leftIcon` et `rightIcon` préservant l'espacement.
  - Sécurité contre les doubles clics en mode chargement / désactivé.

### D. `OlmaInput` & `OlmaSelect` (Phase 1.5)
- **Rôle** : Fondations de saisie de données et de sélection pour tous les formulaires immobiliers (recherche, filtres, demandes de visites, dépôts d'annonces, réservations).
- **Caractéristiques clés** :
  - Respect strict des tokens Olma Immo (`var(--olma-surface-default)`, `var(--olma-border-default)`, `var(--olma-brand-primary)` pour le focus, `var(--olma-semantic-danger)` pour l'erreur).
  - Accessibilité WCAG AA intégrée : labels associés via `htmlFor`/`id` avec identifiant stable généré par `React.useId()`, alertes d'erreur reliées via `aria-describedby` et `aria-invalid`.
  - Tailles cohérentes : `sm` (36px min), `md` (42px min), `lg` (48px min).
  - Rayons : `md`, `lg`, `xl` (défaut), `2xl`, `full`.
  - Contrôle de largeur : `fullWidth` explicite (false par défaut).
  - `OlmaInput` : support de tous les types HTML5 (`text`, `number`, `tel`, `date`, `search`, etc.), slots `leftIcon` et `rightIcon` avec calcul dynamique des marges intérieures.
  - `OlmaSelect` : utilisation du `<select>` natif pour une compatibilité mobile et accessibilité irréprochables, avec chevron stylisé `ChevronDown` et option `placeholder` désactivée.
  - ForwardRef complet pour `HTMLInputElement` et `HTMLSelectElement`.

---

## 8. Préparation des prochaines phases

1. Phase 2.0+ : Shell, Navigation et Pages dédiées Olma Immo

