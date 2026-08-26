## 🎯 Description du Changement
Description concise des modifications apportées et du problème ou ticket résolu (ex: `Fixes #123`).

## 🧱 Type de Modification
- [ ] 🐛 Correction de bug (`fix`)
- [ ] 🚀 Nouvelle fonctionnalité (`feat`)
- [ ] 🛡️ Durcissement de sécurité (`sec`)
- [ ] ♻️ Refactoring sans impact fonctionnel (`refactor`)
- [ ] 🧪 Ajout ou mise à jour de tests (`test`)
- [ ] 📝 Documentation (`docs`)

---

## 📋 Checklist Qualité & Règles de Sécurité (Mandat OLMART R4.6.16)

- [ ] **Typage Strict :** Aucun `any`, `as any`, `@ts-ignore` ou `@ts-expect-error` utilisé.
- [ ] **Sécurité Serveur (RBAC & IDOR) :** Validation des permissions (`authenticateToken`, `authorizeAdmin`, etc.) côté backend et non basée sur le frontend.
- [ ] **Transactions ACID :** Utilisation de `db.runTransaction()` pour toute mutation de stock/panier/commande.
- [ ] **Endpoints v1 :** Routes API exposées sous le préfixe unifié `/api/v1/`.
- [ ] **Validation Locale Réussie :**
  - [ ] `npm run lint` (0 erreur)
  - [ ] `npm run typecheck` (0 erreur)
  - [ ] `npm test` (100% tests passés)
  - [ ] `npm run build` (succès frontend + backend)
