# ADR 001: Unification du Design System

## Statut
Accepté

## Contexte
L'application utilisait historiquement des tokens CSS personnalisés (ex: `.font-kinder`) en parallèle d'un design system Tailwind standard (Slate / Orange). Cette dualité créait une dette visuelle et rendait la maintenance UI complexe, comme souligné dans l'audit (PROBLEME-025).

## Décision
1. Nous consolidons le design system autour d'une palette unique "Slate + Orange" (slate pour les neutres, orange pour la marque).
2. La typographie est standardisée via Tailwind (`font-sans`, `font-display`) au lieu de classes legacy comme `.font-kinder`.
3. Les couleurs codées en dur (ex: `#3C2B22`, `#FF5C00`, `#ea580c`) doivent être remplacées progressivement par les tokens de la charte (ex: `text-slate-900`, `text-orange-600`).

## Conséquences
- **Positif** : Homogénéité du produit. Codebase CSS plus légère. Facilité de création du Dark Mode.
- **Négatif** : Nécessite une passe de refactoring sur les anciens composants (BuyerDashboard, SellerSponsorships) pour migrer les anciennes classes.
