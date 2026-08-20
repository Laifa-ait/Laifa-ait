# ⚡ CHARTE D'ARCHITECTURE & CYCLE DE VIE DU CODE — OLMART

> [CONFIDENTIEL] Ce document régit l'intégralité des développements de la plateforme Olmart. Chaque ingénieur, interne ou externe, doit s'y conformer sans aucune déviation. La rigueur technique est la signature de notre excellence opérationnelle.

---

## 🎯 1. CYCLE DE VIE D'UNE NOUVELLE FONCTIONNALITÉ (END-TO-END)

Pour implémenter une nouvelle fonctionnalité (ex: "Sponsorship System"), suivez la méthodologie par "Slices" verticaux :

```
[Spécification] ➔ [Typage Strict] ➔ [Service / Transactions Server] ➔ [Routeurs API v1] ➔ [Hooks & Composants UI]
```

### Étape 1 : Conception & Typage Strict (Zéro mock, Zéro `any`)
1. Tout modèle de données ou requête doit avoir une interface TypeScript documentée dans `/src/types/`.
2. Interdiction d'utiliser le type `any`. Utilisez des types génériques, des unions complexes ou `unknown` si nécessaire, mais sécurisez-les avec des guards de type.

### Étape 2 : Implémentation du Service Serveur
1. Développez la logique métier dans `src/services/` (ou au sein d'un domaine dédié dans `src/domains/`).
2. S'il y a écriture ou modification de données sensibles (stocks, paniers, portefeuilles), utilisez **systématiquement** une transaction Firestore :
   ```typescript
   await db.runTransaction(async (transaction) => {
     // 1. Lecture des données requises
     // 2. Validation stricte de cohérence (ex: stock suffisant)
     // 3. Écritures atomiques
   });
   ```

### Étape 3 : Création et Enregistrement des Routes API v1
1. Toutes les routes doivent être préfixées par `/api/v1/`.
2. Structurez la réponse de manière consistante :
   - Succès : `{ success: true, data: T }`
   - Échec : `{ success: false, error: string }` (Statut HTTP approprié, ex: 400, 401, 403, 500).

### Étape 4 : Hooks d'Accès Client (SWR ou React Query)
1. Ne faites jamais de requêtes `fetch` brutes directement dans vos composants.
2. Créez des hooks réutilisables dans `/src/hooks/` utilisant `useQuery` (`@tanstack/react-query`) ou `useSWR` pour bénéficier du cache, du rafraîchissement automatique et de la gestion d'état de chargement native.

### Étape 5 : Intégration Visuelle & Composants UI
1. Développez l'interface utilisateur en utilisant exclusivement Tailwind CSS.
2. Intégrez des animations de transition fluides grâce à `motion` importé de `motion/react`.

---

## 📁 2. DIRECTORY STRUCTURE & LOCALISATION DES COMPOSANTS

La base de code est strictement segmentée pour éviter le couplage fort et faciliter la maintenance.

```
/src
  ├── components/          # Composants globaux partagés (< 250 lignes)
  │     ├── ui/            # Atomes bas niveau (boutons, inputs, loaders)
  │     ├── Product/       # Éléments partagés autour du produit (cartes, lightbox)
  │     └── ...
  ├── context/             # Contextes d'état globaux (Auth, Cart, MegaMenu)
  ├── domains/             # Domaines fonctionnels complexes du serveur (Backend)
  ├── hooks/               # Hooks personnalisés et requêtes (SWR/React Query)
  ├── pages/               # Vues majeures de l'application (Pages entières)
  │     ├── Admin/         # Espace d'administration Olmart
  │     ├── Seller/        # Espace vendeurs
  │     └── Public/        # Espace acheteur et vitrine publique
  ├── routes/              # Routeurs d'API Express du serveur
  ├── types/               # Déclarations de types & interfaces TypeScript
  └── utils/               # Utilitaires légers d'aide (formatage, analytics)
```

### Règle d'or des Composants React
- **Limite physique de 250 lignes** : Si un composant dépasse 250 lignes, vous devez **obligatoirement** extraire la logique ou les sous-éléments graphiques dans des fichiers dédiés à l'intérieur de `/src/components/` ou dans un sous-dossier de la page concernée.
- **Isolation de la logique** : Gardez les composants de présentation aussi purs que possible. Déportez les traitements complexes ou les requêtes asynchrones dans des hooks personnalisés (`/src/hooks/`).

---

## ⚙️ 3. LOCALISATION DES SERVICES ET ROUTAGE BACKEND

Les services sont les seuls responsables des accès aux bases de données externes, aux microservices ou aux fonctionnalités de plateforme du SDK Firebase Admin.

### Serveur Express
- Les fichiers de route se trouvent dans `/src/routes/` ou `/src/domains/*/`.
- Les services d'exécution métier serveur se situent dans `/src/services/`.

### Flux d'Authentification & Sessions Iframe
Puisque l'application Olmart s'exécute au sein d'une Iframe, les cookies de session tiers sont fréquemment rejetés par les navigateurs.
- **Règle absolue** : Les requêtes authentifiées envoyées par le client React doivent **toujours** inclure le jeton Firebase de manière explicite dans le header d'autorisation :
  ```http
  Authorization: Bearer <ID_TOKEN>
  ```
- Le serveur Express décode ce token à l'aide de l'Admin SDK, et applique une validation de rôle stricte et transparente via l'endpoint `/api/v1/auth/heal-admin`.

---

## 🏷️ 4. NORMES DE NOMMAGE STRICTES (CASING)

Le respect de la casse et de la structure des noms de fichiers est crucial pour éviter les bugs de build sur les systèmes de fichiers sensibles à la casse (Linux des conteneurs Cloud Run vs Windows/macOS de développement).

| Élément | Format | Exemple |
| :--- | :--- | :--- |
| **Composants React (`.tsx`)** | PascalCase | `ProductCard.tsx`, `SidebarLayout.tsx` |
| **Pages React (`.tsx`)** | PascalCase | `ProductDetails.tsx`, `Finances.tsx` |
| **Hooks React (`.ts`)** | camelCase (commence par `use`) | `useOrders.ts`, `useCategories.ts` |
| **Fichiers Utilitaires & Scripts (`.ts`)** | camelCase | `imageUtils.ts`, `analyticsEngine.ts` |
| **Routeurs & Fichiers Serveur (`.ts`)** | Kebab-case ou camelCase | `product.routes.ts`, `workspace.ts` |
| **Interfaces & Types (`.ts`)** | camelCase / PascalCase | `types/product.ts` (contenant `interface ProductItem`) |
| **Dossiers** | camelCase ou PascalCase selon contexte | `/src/components/Product/`, `/src/hooks/` |

---

## 🚫 5. SÉCURITÉ & RÈGLES D'IMPORTATION CRITIQUES

### A. Interdiction Absolue des Imports Croisés Firebase (Crucial)
Le mélange des SDK Firebase Client et Server détruit instantanément les builds ou provoque des failles majeures de sécurité.

1. **SDK Client (`firebase/app`, `firebase/firestore`, `firebase/auth`)** :
   - **AUTORISÉ UNIQUEMENT** dans le frontend React (fichiers `/src/**/*.tsx`, `/src/context/**/*.tsx`).
   - **INTERDIT STRICTEMENT** dans le backend Express (`/app.ts`, `/src/routes/**/*.ts`, `/src/services/**/*.ts`).
2. **SDK Admin (`firebase-admin`)** :
   - **AUTORISÉ UNIQUEMENT** dans le backend Express.
   - **INTERDIT STRICTEMENT** dans le code frontend. Sa présence dans un fichier `.tsx` fait échouer le compilateur Vite instantanément.

### B. Imports de Types et Valeurs
- Utilisez toujours des imports nommés propres. Évitez les destructurations d'objets globaux volumineux au moment de l'utilisation si vous pouvez importer directement la fonction ou la constante requise.
- N'utilisez pas `import type` pour importer des valeurs réelles comme des `enum` de TypeScript, car le compilateur a besoin du code généré au runtime pour ces derniers.

### C. Contrôle de Sécurité IDOR Strict (Insecure Direct Object Reference)
À chaque fois qu'un utilisateur effectue une action de modification, de lecture ou de suppression sur une ressource (profil, commande, boutique, portefeuille) :
1. Extrayez l'UID de l'utilisateur authentifié depuis le token d'accès décodé (`req.user.uid`).
2. Récupérez la ressource depuis Firestore.
3. Validez systématiquement la correspondance de propriété :
   ```typescript
   if (req.user.uid !== resource.ownerId && !req.user.isAdmin) {
     return res.status(403).json({ error: "Accès non autorisé à cette ressource" });
   }
   ```

---

## 🟢 6. EXIGENCE DE JOURNALISATION D'ENTREPRISE (LOGGING)

Pour garantir une lisibilité optimale lors du démarrage du serveur et des exécutions de tâches de fond, tous vos `console.log` et `console.error` doivent adopter le format standard unifié suivant :

* 🟢 `[Olmart Gateway] 🚀 Booting Express HTTP Server...`
* 🟢 `[Firebase Admin] 🔐 Admin SDK Initialized for Project: [ID]`
* 🟢 `[Firestore Core] 🟢 Connected and mapped Named Database: [ID]`
* ⚙️ `[Olmart Workers] ⚡ Product Publisher Worker active.`
* ⚠️ `[Deprecation Warning] ⚠️ Legacy endpoint accessed: [URL]. Migrate to /api/v1`
* ❌ `[Module Name] ❌ Error description`

Tout log qui dévie de ce format standardisé sera rejeté lors de la revue de code.
