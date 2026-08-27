# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
