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

## 🛡️ Charte Stricte : Sécurité & Configuration de l'Environnement Local

À la suite des derniers audits de sécurité et du durcissement de notre infrastructure (Shift-Left Security), de nouvelles barrières restrictives ont été mises en place pour protéger l'application dès la phase de développement.
**Chaque contributeur DOIT respecter impérativement cette procédure d'initialisation.**

### 1. Prérequis d'Environnement Stricts
L'infrastructure CI et les environnements de production exigent des versions exactes pour prévenir les dérives (lockfile drift) :
* **Node.js** : `v22.23.2` obligatoire.
* **npm** : `10.9.4` obligatoire.
* N'utilisez **JAMAIS** `npm install` lors du premier setup ou sur le serveur CI. Utilisez toujours :
  ```bash
  npm ci
  ```

### 2. Le Secret CSRF (Blocage Explicite - Pas de solution de repli)
Le mécanisme de protection CSRF ne tolère **plus aucun mot de passe de repli codé en dur** (ex: `olmart_dev_csrf_...`). Si le secret est manquant ou faible (< 32 caractères, ou contenu dans une blacklist de mots courants), **le serveur crashera (Exit 1) immédiatement au démarrage, même en développement local.**

**Action requise :** Générez une clé robuste à 64 caractères et ajoutez-la à votre fichier `.env.local` ou `.env` :
```bash
# Génération d'une clé hexadécimale sécurisée sous Linux/Mac :
openssl rand -hex 32

# Ajoutez la valeur générée dans votre .env :
CSRF_SECRET=votre_clef_generee_ici_...
```

### 3. Git Hooks & Validation Continue (Husky)
Les hooks locaux ont été réactivés et verrouillés (`.husky/pre-commit`). 
Toute tentative de commit déclenchera automatiquement `lint-staged` pour formater (Prettier) et vérifier (ESLint) vos fichiers modifiés.
* **Ne forcez jamais un commit avec `--no-verify`.**
* Si les hooks ne s'installent pas automatiquement après le `npm ci`, forcez l'installation locale :
  ```bash
  npm run prepare
  chmod +x .husky/pre-commit
  ```

### 4. Environnement Conteneurisé & Pipeline CI/CD
* **Image Docker (Production) :** L'image Docker finale s'exécute désormais sous un utilisateur non-root (`USER node`) et exclut toutes les dépendances de compilation (Vite, TypeScript, ESBuild). Assurez-vous de n'ajouter que des librairies de runtime dans la section `"dependencies"` du `package.json`.
* **CI GitHub Actions :** Toute Pull Request fera l'objet d'un pipeline restrictif :
  * Audit de sécurité `npm audit --audit-level=high`
  * Typecheck strict & Linting
  * Tests E2E complets
  * Génération de **SBOM** et analyse de vulnérabilités **Trivy** (OS & Librairies).
  * Les tags d'actions sont épinglés par leurs empreintes SHA-1 immuables.

---

## ⚙️ Configuration & Variables d'Environnement

Le serveur Express écoute sur le port spécifié par la variable d'environnement `PORT` (injectée dynamiquement par Cloud Run, ex: `8080`) avec un fallback sur le port `3000` et l'adresse `0.0.0.0`.

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
