# 📙 SPÉCIFICATIONS TECHNIQUES DES INTERFACES D'API V1 - OLMART

**Version de l'API :** 1.0.0 (v1 Production)  
**Classification :** Spécification Technique d'Ingénierie  
**Port d'Écoute Ingress :** 3000

---

## 📌 1. NORMES DE COMMUNICATION & SÉCURITÉ

### 1.1 Protocole d'Authentification (Anti-Desync Iframe)
Toutes les requêtes adressées au préfixe `/api/v1/*` doivent impérativement inclure le jeton d'authentification JWT Firebase dans les en-têtes HTTP de la requête :
```http
Authorization: Bearer <Firebase_ID_Token>
```
*Les cookies tiers étant bloqués dans l'environnement d'encapsulation de l'iframe, aucune session basée sur les cookies de session ou l'en-tête Cookie n'est tolérée côté serveur.*

### 1.2 Structure Standard des Réponses JSON (Uniform Response)
Le serveur Express d'Olmart renvoie systématiquement un payload structuré selon les modèles génériques ci-dessous.

#### En cas de succès (HTTP 200/201) :
```json
{
  "success": true,
  "data": { ... }
}
```

#### En cas d'échec (HTTP 4xx/5xx) :
```json
{
  "success": false,
  "error": "ERROR_CODE_STRING",
  "message": "Description explicite en français de l'anomalie rencontrée."
}
```

### 1.3 Middlewares de Validation de Schéma & Normalisation des Wilayas (01-58)
Pour se prémunir des injections de données et garantir l'intégrité logistique, toutes les requêtes entrantes avec payload sont validées via un middleware Express basé sur un schéma strict :
*   **Validation du Code Wilaya :** Le paramètre `wilayaCode` doit correspondre à une chaîne à deux caractères comprise de manière stricte entre `"01"` (Adrar) et `"58"` (In Guezzam). Les anciens codes à un chiffre (ex: `"9"`) sont automatiquement normalisés avec zéro de remplissage (`"09"` - Blida).
*   **Nettoyage des Numéros Mobiles :** Les numéros de téléphone sont nettoyés pour n'accepter que les formats algériens valides commençant par `05`, `06`, `07`, ou avec l'indicatif international `+213` ou `00213`.
*   **Contrôle de Type strict :** Les prix, poids, et quantités sont systématiquement transtypés côté serveur pour interdire les valeurs négatives ou nulles (`price > 0`, `weight > 0`, `quantity > 0`).

---

## 📌 2. INVENTAIRE COMPLET DES ENDPOINTS V1

### 2.1 Authentification & Sessions (`/api/v1/auth`)

#### `POST /api/v1/auth/request-otp`
*   **Description :** Génère un code OTP de validation et l'achemine par SMS au numéro d'identification logistique de l'acheteur.
*   **Permissions :** Publique (Visiteur).
*   **Payload (JSON) :**
    ```json
    {
      "phoneNumber": "0555123456",
      "email": "amine.benali@gmail.com",
      "firstName": "Amine",
      "lastName": "Benali",
      "wilayaCode": "16"
    }
    ```
*   **Réponse de succès (200 OK) :**
    ```json
    {
      "success": true,
      "data": {
        "requestId": "otp_req_10293847",
        "expiresInSeconds": 300
      }
    }
    ```
*   **Codes d'erreurs récurrents :**
    *   `INVALID_PHONE_NUMBER_FORMAT` (HTTP 400)
    *   `SMS_FLOODING_LIMIT_REACHED` (HTTP 429)

#### `POST /api/v1/auth/verify-otp`
*   **Description :** Compare le hachage SHA-256 du code saisi avec celui en mémoire Firestore et initialise le compte d'acheteur en cas de succès.
*   **Permissions :** Publique (Visiteur).
*   **Payload (JSON) :**
    ```json
    {
      "phoneNumber": "0555123456",
      "otpCode": "882194"
    }
    ```
*   **Réponse de succès (200 OK) :**
    ```json
    {
      "success": true,
      "data": {
        "uid": "usr_buyer_9921",
        "role": "buyer",
        "token": "eyJhbGciOiJSUzI1NiIs..."
      }
    }
    ```
*   **Codes d'erreurs récurrents :**
    *   `INVALID_OTP_CODE` (HTTP 401)
    *   `OTP_CODE_EXPIRED` (HTTP 410)

#### `POST /api/v1/auth/heal-admin`
*   **Description :** Met à niveau de manière transparente les rôles de l'utilisateur en administrateur système (Custom Claims Firebase) si son e-mail figure sur la liste blanche d'urgence.
*   **Permissions :** Utilisateur authentifié.
*   **Payload (JSON) :** Aucun (lecture de l'email via le décodeur JWT).
*   **Réponse de succès (200 OK) :**
    ```json
    {
      "success": true,
      "data": {
        "status": "ADMIN_PRIVILEGES_GRANTED",
        "email": "laifa.ait@gmail.com"
      }
    }
    ```

---

### 2.2 Catalogue & Produits (`/api/v1/products`)

#### `GET /api/v1/products`
*   **Description :** Retourne le catalogue d'articles filtré et facetté.
*   **Permissions :** Libre.
*   **Paramètres Query :** `category`, `minPrice`, `maxPrice`, `wilayaCode`, `rating`, `searchQuery`.
*   **Réponse de succès (200 OK) :**
    ```json
    {
      "success": true,
      "data": [
        {
          "productId": "prod_high_8832",
          "name": "Machine à Café Express",
          "price": 14500,
          "stock": 12,
          "ownerId": "usr_vendor_3012",
          "rating": 4.6,
          "weight": 1.8
        }
      ]
    }
    ```

#### `POST /api/v1/products`
*   **Description :** Publie une nouvelle fiche article dans la boutique du vendeur connecté.
*   **Permissions :** Vendeur accrédité (`role === "vendor"` et KYC `approved`).
*   **Payload (JSON) :**
    ```json
    {
      "name": "Machine à Café Express",
      "description": "Cafetière haut de gamme à haute pression.",
      "price": 14500,
      "category": "Électroménager",
      "stock": 12,
      "weight": 1.8,
      "photos": ["https://storage.googleapis.com/.../img.jpg"]
    }
    ```
*   **Réponse de succès (201 Created) :**
    ```json
    {
      "success": true,
      "data": {
        "productId": "prod_high_8832",
        "createdAt": "2026-07-17T11:00:00Z"
      }
    }
    ```
*   **Codes d'erreurs récurrents :**
    *   `KYC_PENDING_VERIFICATION` (HTTP 403)
    *   `MISSING_LOGISTIC_WEIGHT` (HTTP 400)

---

### 2.3 Commandes & Logistique (`/api/v1/orders`)

#### `POST /api/v1/orders/checkout`
*   **Description :** Initie une transaction ACID pour valider les stocks physiques et enregistrer la commande Cash-on-Delivery (COD).
*   **Permissions :** Acheteur connecté (`role === "buyer"`).
*   **Payload (JSON) :**
    ```json
    {
      "productId": "prod_high_8832",
      "quantity": 1,
      "shippingAddress": {
        "streetAddress": "34 Rue des Lions",
        "commune": "Oran",
        "wilayaCode": "31"
      }
    }
    ```
*   **Réponse de succès (200 OK) :**
    ```json
    {
      "success": true,
      "data": {
        "orderId": "ord_2026_9817",
        "totalAmountCOD": 15300,
        "status": "PAID_ESCROW"
      }
    }
    ```
*   **Codes d'erreurs récurrents :**
    *   `INSUFFICIENT_STOCK` (HTTP 409)

#### `POST /api/v1/orders/:orderId/returns`
*   **Description :** Demande de retour (logistique inverse) pour non-conformité constatée.
*   **Permissions :** Acheteur propriétaire de la commande (`IDOR Guard`).
*   **Payload (JSON) :**
    ```json
    {
      "reason": "L'appareil ne s'allume pas.",
      "photos": ["https://storage.googleapis.com/.../defect.jpg"]
    }
    ```
*   **Réponse de succès (200 OK) :**
    ```json
    {
      "success": true,
      "data": {
        "returnId": "ret_99218",
        "status": "RETURN_REQUESTED"
      }
    }
    ```

#### `POST /api/v1/orders/webhook-delivery`
*   **Description :** Webhook sécurisé et signé de réconciliation physique-numérique appelé par le système d'information du transporteur (ex: Yalidine) lors de l'encaissement du COD à la porte de l'acheteur.
*   **Permissions :** Signature cryptographique HMAC-SHA256 requise dans l'en-tête `X-Olmart-Signature`.
*   **Payload (JSON) :**
    ```json
    {
      "orderId": "ord_2026_9817",
      "carrierStatusCode": "DELIVERED_COD",
      "amountCollectedDZD": 13300,
      "timestamp": "2026-07-17T14:30:00Z"
    }
    ```
*   **Réponse de succès (200 OK) :**
    ```json
    {
      "success": true,
      "data": {
        "transition": "PAID_ESCROW_TO_DELIVERED",
        "escrowLockedDZD": 13300
      }
    }
    ```
*   **Codes d'erreurs récurrents :**
    *   `INVALID_WEBHOOK_SIGNATURE` (HTTP 401)
    *   `ORDER_ALREADY_DELIVERED` (HTTP 409)

---

### 2.4 Litiges & Arbitrage (`/api/v1/disputes`)

#### `POST /api/v1/disputes`
*   **Description :** Ouvre une procédure d'arbitrage de litige en gelant de manière asynchrone les fonds marchands.
*   **Permissions :** Acheteur connecté.
*   **Payload (JSON) :**
    ```json
    {
      "orderId": "ord_2026_9817",
      "reason": "Vendeur refuse le retour malgré les preuves de panne.",
      "evidencePhotos": ["https://storage.googleapis.com/.../proof.jpg"]
    }
    ```
*   **Réponse de succès (201 Created) :**
    ```json
    {
      "success": true,
      "data": {
        "disputeId": "dis_10293",
        "aiAnalysisStatus": "TRIGGERED"
      }
    }
    ```

#### `POST /api/v1/admin/disputes/:disputeId/arbitrate`
*   **Description :** Clôture financièrement le litige selon le verdict rendu par l'administrateur.
*   **Permissions :** Administrateur uniquement (`role === "admin"`).
*   **Payload (JSON) :**
    ```json
    {
      "verdict": "REFUND_BUYER" 
    }
    ```
    *Options acceptées de verdict : `REFUND_BUYER` (100% acheteur), `RELEASE_VENDOR` (100% vendeur), `SPLIT_HALF` (50/50).*
*   **Réponse de succès (200 OK) :**
    ```json
    {
      "success": true,
      "data": {
        "status": "CLOSED",
        "buyerRefundedAmount": 14500,
        "vendorReleasedAmount": 0
      }
    }
    ```

---

### 2.5 Finances & Versements (`/api/v1/payouts`)

#### `POST /api/v1/payouts`
*   **Description :** Soumet une demande de versement CCP/RIB prélevée sur la balance de revenus disponibles du vendeur.
*   **Permissions :** Vendeur connecté.
*   **Payload (JSON) :**
    ```json
    {
      "amount": 25000,
      "paymentMethod": "CCP",
      "ccpAccount": "001299831 clé 12"
    }
    ```
*   **Réponse de succès (201 Created) :**
    ```json
    {
      "success": true,
      "data": {
        "payoutId": "pay_98217",
        "status": "PENDING"
      }
    }
    ```

---

### 2.6 Administration & Configurations Systèmes (`/api/v1/admin`)

#### `POST /api/v1/admin/shops/:shopId/kyc`
*   **Description :** Approuve ou rejette un dossier de vérification KYC marchand de manière auditable.
*   **Permissions :** Administrateur uniquement (`role === "admin"`).
*   **Payload (JSON) :**
    ```json
    {
      "status": "approved",
      "rejectionReason": ""
    }
    ```
    *Note : Si le statut est `rejected`, le paramètre `rejectionReason` devient obligatoire et sera notifié par e-mail au vendeur.*
*   **Réponse de succès (200 OK) :**
    ```json
    {
      "success": true,
      "data": {
        "shopId": "shp_electronics_31",
        "status": "approved",
        "auditedAt": "2026-07-17T15:00:00Z"
      }
    }
    ```

#### `PUT /api/v1/admin/config/commissions`
*   **Description :** Configure le taux de commission globale ou attribue un taux de commission préférentiel dérogatoire à un marchand spécifique.
*   **Permissions :** Administrateur uniquement (`role === "admin"`).
*   **Payload (JSON) :**
    ```json
    {
      "globalRate": 10,
      "merchantOverrides": {
        "usr_vendor_3012": 5
      }
    }
    ```
*   **Réponse de succès (200 OK) :**
    ```json
    {
      "success": true,
      "data": {
        "updatedConfig": {
          "globalRate": 10,
          "merchantOverridesCount": 1
        }
      }
    }
    ```

---
