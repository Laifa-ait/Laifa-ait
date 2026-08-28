# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-08-27

### ♿ Accessibilité (A11y) & Expérience Utilisateur (UX)
- **Résolution de Collision d'UI Mobile** : Amélioration ergonomique majeure masquant la barre globale de navigation mobile (`MobileBottomNav`) lors de l'activation de la barre d'achat collante (`ProductBuyBox`), évitant ainsi tout blocage de l'entonnoir d'achat.
- **Support iOS Safe-Area** : Prise en charge universelle du CSS `calc(env(safe-area-inset-bottom) + 12px)` sur la barre d'achat collante pour un calage automatique sur les écrans d'iPhones récents.
- **Sémantique Mobile Accessible** : Enrichissement de l'arbre d'accessibilité de la navigation mobile avec l'ajout des attributs `aria-label`, `aria-current="page"`, et d'une vocalisation dynamique du nombre d'articles du panier/favoris pour les lecteurs d'écrans.
- **Surcouche Dialogue Accessible (Search Overlay)** : Refonte de la recherche globale en véritable fenêtre modale accessible (`role="dialog"`, `aria-modal="true"`, interception clavier et piège de focus (Focus Trap), restauration du focus au bouton déclencheur, et annonces en temps réel `aria-live="polite"` pour les résultats de recherche).
- **Réduction de Mouvement Universelle** : Ajout de la règle média `@media (prefers-reduced-motion: reduce)` dans les styles de base pour désactiver les transitions, défilements fluides et boucles d'animation pour les utilisateurs souffrant de troubles vestibulaires.

### 🎨 Rendu Programmatique d'Assets
- **Régénération Autonome locale d'Images** : Implémentation d'un algorithme de tracé pixellaire en mémoire (`pngjs`/`jpeg-js`) à la racine du projet pour générer l'ensemble des 6 visuels enrichis (Bannières d'en-tête, arrière-plans de Zellige répétables et captures d'écrans) selon la charte d'Olmart, sans dépendance externe à Vertex AI.

### 📦 Déploiement & DevOps
- **Fiabilisation de l'initialisation Cloud Run** : Migration du package `firebase-admin` vers la section `dependencies` pour assurer l'installation lors de la phase de build Docker multi-stage, résolvant un crash fatal au lancement du serveur de production.

## [1.1.0] - 2026-08-27

### 🔒 Sécurité (Security Hardening & Zero-Trust)
- **Vérification Révocation des Jetons JWT (`checkRevoked = true`)** : Migration de l'authentification Firebase Admin SDK vers `verifyIdToken(idToken, true)` dans les middlewares `authenticateToken` et `optionalAuthenticateToken`.
- **Architecture Fail-Closed pour les Privilèges Administrateurs** : Refonte de la validation de rôle ; en cas d'indisponibilité, de timeout ou d'erreur réseau de Firestore, tout jeton avec des privilèges d'administration est rétrogradé en `suspended` (`adminValidated = false`) afin de garantir un refus `403 Forbidden` systématique.
- **Invalidation Immédiate des Refresh Tokens (`revokeRefreshTokens`)** : Révocation instantanée des sessions utilisateur et vendeur lors des suspensions (`PUT /admin/users/:id/status`, `AdminSellerService.suspendSeller`), des blocages en masse (`POST /admin/users/bulk-status`), des suppressions (`DELETE /admin/users/:id`), et des modifications de rôle (`PUT /admin/users/:id/role`).
- **Protection Anti-IDOR & Traçabilité Audit Logs** : Contrôle systématique des propriétaires de ressources et journalisation immuable dans la collection `audit_logs` pour toutes les actions d'administration et de modération.
- **Suite de Tests de Non-Régression** : Ajout de tests automatisés couvrant les scénarios de jeton révoqué (401), d'administrateur suspendu avec base de données indisponible (Fail-Closed 403), et de révocation des refresh tokens dans `src/tests/authPrivilegeEscalation.test.ts`.

## [1.0.0] - 2026-08-20

### 🚀 Fonctionnalités Majeures (Core Marketplace Release)
- **Plateforme Multi-Rôles E-commerce Algérienne** : Support unifié des Acheteurs, Vendeurs (Sellers), Artisans (Bricolage) et Administrateurs couvrant les 58 Wilayas.
- **Transactions ACID Firestore** : Sécurisation de la réservation des stocks et de la validation des commandes via `db.runTransaction()`.
- **API REST v1 Unifiée** : Déploiement des routes Express standardisées sous `/api/v1/*`.
- **Système de Résolution de Litiges & Forensics** : Module complet d'arbitrage des commandes avec analyse de motifs et journalisation d'audit.
- **Module Immobilier (Olma Immo)** : Recherche géospatiale par Geohash et Wilaya avec indexation composite NoSQL.
- **Design System Slate + Orange** : Typographie et tokens Tailwind CSS unifiés et accessibles (WCAG AA).

## [0.1.0] - 2026-08-10

### 🛠️ Initialisation & Infrastructure
- Endpoints de santé `/api/v1/health` et `/api/v1/health/live`.
- Configuration de Swagger UI pour la documentation interactive de l'API (`/api-docs`).
- Rate limiting anti-abus sur les points d'entrée sensibles.
- Intégration de Firebase Admin SDK et des schémas d'indexation Firestore.
