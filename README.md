# OLMART — Marketplace E-Commerce Multi-Vendeurs

[![Olmart CI](https://github.com/Laifa-ait/Laifa-ait/actions/workflows/ci.yml/badge.svg)](https://github.com/Laifa-ait/Laifa-ait/actions/workflows/ci.yml)
![Vite 8](https://img.shields.io/badge/Vite-8.2-646CFF.svg)
![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg)
![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict_5.8-3178C6.svg)
![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)
![Tests: Vitest](https://img.shields.io/badge/tests-vitest_4.1-44a833.svg)
![License: Proprietary](https://img.shields.io/badge/license-Proprietary-red.svg)

Plateforme e-commerce et marketplace de niveau industriel dédiée au marché algérien, couvrant l'ensemble des 58 wilayas. Ce système intègre une gestion multi-vendeurs robuste, des transactions ACID sécurisées, une messagerie chiffrée, un scoring de confiance algorithmique et le module d'annonces immobilières **Olma Immo**.

---

## 🏛️ Architecture & Gouvernance

L'application est structurée selon une approche modulaire guidée par le domaine (Domain-Driven Design simplifié) :

```text
/
├── app.ts                  # Définition des middlewares globaux Express & Sécurité (Helmet, CORS, Rate-limiting)
├── server.ts               # Point d'entrée serveur (Configuration du serveur Express & Vite Middleware)
├── vite.config.ts          # Configuration de production Vite 8 (Compilateurs Oxc et Rolldown en Rust)
├── vitest.config.ts        # Configuration du framework de test unitaire & d'intégration
├── src/
│   ├── components/         # Composants UI partagés, hautement optimisés pour React 19
│   ├── domains/            # Logique métier et contrôleurs isolés par domaine (notifications, orders, tickets, etc.)
│   ├── hooks/              # Custom hooks partagés pour la gestion des états réactifs
│   ├── lib/                # Connecteurs Firebase (SDK Client sécurisé, helpers de transactions)
│   ├── tests/              # Suites de tests automatisées (Vitest / Playwright)
│   └── types/              # Déclarations strictes des modèles et interfaces métiers TypeScript
```

---

## 🔒 Sécurité & Intégrité (Olmart Core Mandate)

* **Transactions Firestore ACID** : Toute opération modifiant des stocks, des paniers ou des soldes financiers utilise obligatoirement un bloc transactionnel sérialisé `db.runTransaction()` côté serveur.
* **Server-Controlled Authorization** : L'accès aux privilèges d'administration est vérifié exclusivement côté serveur via des custom claims d'authentification. Aucune liste d'autorisations (allowlist) n'est stockée côté client.
* **Herméticité aux IDOR** : Chaque requête d'accès ou d'écriture de document fait l'objet d'un contrôle d'ownership serveur strict en validant `req.user.uid === resource.ownerId`.
* **Sanitization active** : Utilisation systématique d'isomorphic-dompurify pour assainir les entrées utilisateur et configuration CSP restrictive au niveau réseau.

---

## 🛠️ Stack Technique & Compilateurs

* **Frontend** : React 19.0 (Architecture réactive sans side-effects dans les cycles d'effets) + Tailwind CSS 4.0.
* **Compilateurs de production** : 
  - **Oxc & Rolldown** (Rust) pour le bundle frontend (performance décuplée).
  - **Esbuild** (Go) pour la compilation du serveur Express en format CommonJS (`dist/server.cjs`).
* **Backend** : Node.js (Express v4 + Firebase Admin SDK v13).
* **AI Engine** : Intégration du SDK `@google/genai` pour les appels Gemini 1.5 Flash exécutés exclusivement côté serveur.

---

## 📋 Prérequis

* **Node.js** : `v22.x` (géré via `.nvmrc`)
* **npm** : `10.x` ou supérieur
* **Java Runtime (JRE)** : `17+` (obligatoire pour démarrer l'émulateur local Firestore/Storage lors des tests)

---

## ⚙️ Configuration & Variables d'Environnement

Le serveur Express est strictement configuré pour écouter sur le port `3000` et l'adresse `0.0.0.0` (requis pour le routage Ingress sur les conteneurs Cloud Run).

Créez un fichier `.env` à la racine à partir du modèle :
```bash
cp .env.example .env
```

### Variables Firebase indispensables (Client & Admin) :
* `VITE_FIREBASE_API_KEY` : Clé d'API du client Web.
* `VITE_FIREBASE_AUTH_DOMAIN` : Domaine d'authentification client.
* `VITE_FIREBASE_PROJECT_ID` : ID du projet Firebase.
* `FIREBASE_PROJECT_ID` : ID du projet (Backend Admin SDK).
* `FIREBASE_SERVICE_ACCOUNT_KEY` : Jeton de compte de service JSON pour l'authentification Admin SDK.

---

## 🚀 Installation & Démarrage

```bash
# 1. Installation propre et déterministe des dépendances
npm ci

# 2. Démarrage du serveur en mode développement (Port 3000, Proxy actif)
npm run dev
```

---

## 🧪 Scripts & Commandes de Qualité

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur Express et monte l'instance de développement Vite 8 |
| `npm run build` | Compile l'application frontend et bundle le serveur dans `dist/server.cjs` |
| `npm start` | Démarre l'application de production compilée (depuis `dist/server.cjs`) |
| `npm test` | Exécute la suite complète de tests unitaires et d'intégration via Vitest |
| `npm run lint` | Exécute ESLint sur l'ensemble de la codebase |
| `npm run typecheck` | Lance une analyse stricte de conformité des types TypeScript (`tsc --noEmit`) |
| `npm run format` | Applique le formatage Prettier sur les fichiers sources |

---

## 🩺 Endpoints de Supervision (Healthchecks)

Pour vérifier l'état et l'intégrité de l'application en cours d'exécution :
* **Liveness Probe** : `GET /api/v1/health/live` ➔ Renvoie `{ status: "alive" }` (HTTP 200) si le serveur est réactif.
* **Readiness/Health Probe** : `GET /api/v1/health` ➔ Analyse la mémoire système et certifie l'état de la connexion Firebase Admin (`{ firebase: "ok" }`).

---

## 📜 Licence

Ce projet est la propriété exclusive d'**OLMART**. Tous droits réservés.
Consultez le fichier [`LICENSE`](./LICENSE) pour plus de détails.
