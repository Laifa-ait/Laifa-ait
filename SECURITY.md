# Politique de Sécurité — OLMART Marketplace

Chez OLMART, la sécurité des données de nos utilisateurs, des commerçants et des transactions est une priorité absolue. Ce document définit notre politique de gestion des vulnérabilités, de signalement et les standards de sécurité appliqués sur le projet.

---

## 🛡️ 1. Versions Prises en Charge

| Version | Prise en charge |
| :--- | :--- |
| `1.0.x` (Branche `main`) |  Prise en charge active (correctifs de sécurité immédiats) |
| `< 1.0.0` | ❌ Obsolète |

---

## 🚨 2. Signalement d'une Vulnérabilité de Sécurité

Si vous découvrez une faille de sécurité ou une vulnérabilité potentielle dans OLMART, **ne créez pas d'issue publique sur GitHub**. 

Veuillez suivre la procédure de divulgation responsable :

1. **Contact confidentiel :** Envoyez un e-mail détaillé à l'adresse de l'équipe d'ingénierie et de sécurité :
   - 📧 **`laifa.ait@gmail.com`**
   - Objet : `[SECURITY] Vulnérabilité OLMART - <Brève description>`
2. **Détails à fournir :**
   - Description précise de la vulnérabilité identifiée.
   - Étapes claires pour reproduire le problème (Proof of Concept / PoC).
   - Impact potentiel (ex: élévation de privilèges, contournement RBAC, injection XSS, fuite de données).
   - Suggestions de remédiation le cas échéant.
3. **Engagement de réponse :**
   - **Accusé de réception :** sous 24 à 48 heures ouvrées.
   - **Évaluation et plan de remédiation :** sous 5 jours ouvrés.
   - **Déploiement du correctif :** prioritaire selon le niveau de sévérité (CVSS).

---

## 🔒 3. Principes de Sécurité Obligatoires (Architecture OLMART)

Tout développement sur la plateforme doit se conformer aux piliers de sécurité suivants :

### A. Autorisation Serveur Strict (Zero-Trust)
- Le frontend n'est **JAMAIS** une preuve d'autorité.
- Les privilèges administratifs et vendeurs sont impérativement validés côté serveur via Firebase Custom Claims ou vérification directe dans Firestore (`authenticateToken`, `authorizeAdmin`, `isSeller`).
- Contrôle IDOR systématique : `req.user.uid === resource.ownerId` pour toute lecture/écriture sur des données utilisateur ou commerçant.

### B. Intégrité des Transactions (ACID)
- Toute opération financière, décrémentation de stock produit ou validation de commande s'exécute impérativement au sein d'une transaction Firestore `db.runTransaction()`.

### C. Protection des Secrets & Clés API
- Aucune clé secrète (ex: `FIREBASE_SERVICE_ACCOUNT_KEY`, `GEMINI_API_KEY`, webhook secrets) ne doit être committée dans le dépôt de code.
- Les variables d'environnement exposées au client (`VITE_*`) ne doivent contenir aucun secret ou droit sensible.
- GitHub Secret Scanning et Push Protection doivent rester actifs sur le dépôt.

### D. Isolation des SDKs
- Le SDK client (`firebase/firestore`, `firebase/auth`) ne doit jamais être exécuté côté serveur Node.js.
- Le SDK d'administration (`firebase-admin`) ne doit jamais être inclus dans le bundle frontend.

---

## 📋 4. Règles de Détection et d'Analyse Automatisée

Le pipeline CI exécute à chaque commit et pull request :
- Linter strict ESLint & TypeScript sans contournement (`any` interdit).
- Tests d'intégration de sécurité Vitest sur les émulateurs locaux Firebase.
- Analyse automatisée des dépendances et recherche de fuite de secrets.
