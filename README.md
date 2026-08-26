# OLMART — Marketplace E-Commerce Multi-Vendeurs

[![Olmart CI](https://github.com/Laifa-ait/Laifa-ait/actions/workflows/ci.yml/badge.svg)](https://github.com/Laifa-ait/Laifa-ait/actions/workflows/ci.yml)
![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)
![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)
![Tests: Vitest](https://img.shields.io/badge/tests-vitest-44a833.svg)
![License: Proprietary](https://img.shields.io/badge/license-Proprietary-red.svg)

Plateforme e-commerce et marketplace destinée au marché algérien, couvrant l'ensemble des 58 wilayas avec gestion multi-vendeurs, transactions sécurisées, messagerie chiffrée, scoring de confiance et module immobilier Olma Immo.

---

## 🏛️ Gouvernance & Sécurité

- 🔒 **Politique de Sécurité :** voir [`SECURITY.md`](./SECURITY.md) pour la divulgation responsable et les standards d'autorisation serveur.
- 🤝 **Guide de Contribution :** voir [`CONTRIBUTING.md`](./CONTRIBUTING.md) pour les règles de typage strict et le workflow Git.
- 📜 **Licence Propriétaire :** voir [`LICENSE`](./LICENSE).

---

## 🛠️ Stack Technique

- **Frontend :** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend :** Express.js + Firebase Admin SDK (Auth, Firestore, Storage)
- **AI :** Gemini 1.5 Flash (@google/genai)
- **i18n :** Français, Arabe (RTL), Anglais

---

## 📋 Prérequis

- **Node.js :** v22.x (aligné sur `.nvmrc`)
- **npm :** 10+
- **Java :** 17+ (requis pour les émulateurs locaux Firebase en phase de test)

---

## 🚀 Installation & Démarrage

```bash
# Installation propre des dépendances
npm ci

# Configuration des variables d'environnement
cp .env.example .env

# Lancement en mode développement (Port 3000)
npm run dev
```

---

## 🧪 Scripts & Validation Qualité

| Commande | Description |
|---|---|
| `npm run dev` | Démarrer l'application complète (Serveur Express + Vite) |
| `npm run build` | Compiler le frontend SPA et bundle le serveur Node.js CJS |
| `npm start` | Lancer le bundle de production (`dist/server.cjs`) |
| `npm test` | Exécuter la suite complète de tests unitaires et d'intégration |
| `npm run lint` | Analyse statique ESLint |
| `npm run typecheck` | Contrôle strict des types TypeScript |
| `npm run format` | Formatage du code avec Prettier |

---

## ⚠️ Dépendances Serveur

`firebase-admin` est présent dans les `dependencies` de production car il est requis par le backend Express. **Il ne doit jamais être importé dans le code client React** sous peine d'altérer la compilation du bundle frontend.

---

## 🔒 Sécurité & Intégrité des Données

- **RBAC Server-Side :** Vérification stricte des rôles (Admin / Vendeur / Acheteur) au niveau backend.
- **Transactions ACID :** Gestion des stocks, paniers et commandes via `db.runTransaction()`.
- **Contrôles IDOR :** Validation systématique du propriétaire sur chaque ressource ciblée.
- **Sanitization :** DOMPurify sur les entrées riches et CSP configuré.

---

## 📜 Licence

Ce projet est la propriété exclusive d'**OLMART**. Tous droits réservés.
Consultez le fichier [`LICENSE`](./LICENSE) pour plus de détails.
