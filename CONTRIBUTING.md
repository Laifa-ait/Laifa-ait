# Guide de Contribution — OLMART Marketplace

Bienvenue sur le projet **OLMART Marketplace**. Ce guide rassemble les standards de développement, le modèle de gouvernance et les exigences de qualité imposées pour toute contribution.

---

## 🏛️ 1. Modèle de Branches & Flux Git

- **`main` :** Branche de production protégée. Les commits directs y sont **interdits**. Tout ajout doit passer par une Pull Request validée par la CI.
- **`dev` :** Branche d'intégration active.
- **Branches de fonctionnalités / correctifs :**
  - `feat/nom-fonctionnalite`
  - `fix/nom-bug`
  - `sec/correctif-securite`
  - `refactor/nom-refactoring`

---

## 🚦 2. Standards de Code & Exigences TypeScript

Tout code soumis doit respecter les **Règles Permanentes R4.6.16** :

1. **Typage strict sans contournement :**
   - L'usage de `any` ou `as any` est formellement interdit.
   - Les directives `@ts-ignore` et `@ts-expect-error` sont proscrites.
   - Utiliser des types discriminés et des interfaces précises dans `/src/types/`.
2. **Endpoints API v1 uniquement :**
   - Toutes les routes serveur doivent suivre le préfixe `/api/v1/` et retourner un schéma `{ success: true, data: T }` ou `{ error: string }`.
3. **Sécurité et Contrôle d'Accès :**
   - Toutes les opérations sensibles doivent intégrer `authenticateToken` et les middlewares RBAC appropriés (`authorizeAdmin`, `isSeller`, etc.).
   - Contrôles IDOR stricts : valider `req.user.uid` contre les propriétaires des ressources.
4. **Transactions Firestore ACID :**
   - Utilisation obligatoire de `db.runTransaction()` pour la gestion des stocks, des commandes et des paiements.

---

## 🛠️ 3. Workflow de Validation Locale

Avant de soumettre une Pull Request, exécutez l'ensemble des validations ci-dessous dans votre environnement :

```bash
# 1. Vérification du formatage et du style de code
npm run lint

# 2. Vérification statique des types TypeScript
npm run typecheck

# 3. Exécution de la suite de tests avec émulateurs Firebase
npm test

# 4. Compilation et vérification des builds (SPA + Server)
npm run build
```

---

## 📝 4. Conventions de Commits

Nous suivons la convention [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat(scope): ajout d'une fonctionnalité`
- `fix(scope): correction d'un bug`
- `sec(scope): durcissement ou correctif de sécurité`
- `test(scope): ajout ou mise à jour de tests unitaires/intégration`
- `refactor(scope): refactoring de code sans impact fonctionnel`
- `docs(scope): mise à jour de la documentation`
- `chore(scope): maintenance de l'infrastructure ou des dépendances`

---

## 🔍 5. Processus de Pull Request

1. Remplir le template de PR (`.github/PULL_REQUEST_TEMPLATE.md`).
2. S'assurer que le pipeline GitHub Actions (`Olmart CI`) passe au vert (100% succès).
3. Aucune régression sur les tests de sécurité ou le build ne sera acceptée.
