# 📙 CARTOGRAPHIE DES SERVICES & SCHÉMA DE LA BASE FIRESTORE - OLMART

**Version de référence :** 4.1.0  
**Classification :** Spécifications des Modèles de Données NoSQL  
**SGBD :** Google Cloud Firestore (Mode Natif)

---

## 📌 1. CARTOGRAPHIE DES MODULES ET FLUX DE PERMISSIONS

Les sections de code et d'architecture d'Olmart sont modularisées pour assurer une isolation totale des contextes logiques (Separation of Concerns).

```
 ┌──────────────────────────────────────────────────────────────┐
 │                      APPLICATION REACT                       │
 └──────────────────────────────┬───────────────────────────────┘
                                │ (HTTPS v1 Bearer token JWT)
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                    EXPRESS HTTP GATEWAY                      │
 └──────────────┬───────────────┬───────────────┬───────────────┘
                │               │               │
  [Auth Guard]  ▼  [Acid Guard] ▼  [IA Engine]  ▼  [Logs Guard] ▼
 ┌──────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
 │ Users / Shop │ │   Orders    │ │  Disputes   │ │ Audit Logs  │
 └──────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 📌 2. SÉCURITÉ ET ARBORESCENCE D'OCTROI DES PERMISSIONS (RBAC)

Les habilitations d'accès de la plateforme sont contrôlées par un graphe de rôles hiérarchique étanche :

```
          [ VISITEUR (Anonyme) ]
                     │
         (S'enregistre avec OTP)
                     │
                     ▼
          [ ACHETEUR ('buyer') ]
                     │
      (Complète le dossier KYC Pro)
                     │
                     ▼
          [ VENDEUR ('vendor') ]
                     │
    (Vérification d'email urgence / list)
                     │
                     ▼
         [ ADMINISTRATEUR ('admin') ]
```

---

## 📌 3. CARTOGRAPHIE COMPLÈTE DE LA BASE FIRESTORE (MODÈLES NO-SQL)

Chaque collection Firestore est modélisée avec ses types de données TypeScript rigoureux. L'usage de `any` est proscrit.

### 3.1 Collection `users`
*   **Path du Document :** `/users/{uid}`
*   **Description :** Centralise les profils d'identité des acheteurs, marchands, et administrateurs d'Olmart.

```ts
export interface UserDocument {
  uid: string;                 // Identifiant unique Firebase Authentication
  firstName: string;           // Prénom de l'utilisateur
  lastName: string;            // Nom de famille
  email: string;               // Adresse de messagerie validée
  phoneNumber: string;         // Identifiant logistique unique algérien (ex: "0555123456")
  defaultWilayaCode: string;   // Code de Wilaya résidentiel (1 à 58)
  walletBalance: number;       // Balance d'avoirs de remboursement disponibles (en DZD)
  loyaltyPoints: number;       // Solde actuel du pool de points de fidélité accumulés
  role: "buyer" | "vendor" | "admin";
  createdAt: string;           // Horodatage ISO (ex: "2026-07-17T11:00:00Z")
  updatedAt?: string;
  isBanned?: boolean;          // Statut de suspension active du compte pour fraude ou non-conformité répétée
  bannedReason?: string;       // Motif explicite consigné par l'administration dans les logs d'audit
  kycStatus?: "not_submitted" | "pending_verification" | "approved" | "rejected";
  kycRejectReason?: string;    // Renseigné uniquement si kycStatus === "rejected"
  kycFiles?: {
    nationalIdUrl: string;     // Lien Firebase Storage vers la pièce d'identité
    businessRegisterUrl: string; // Lien vers le Registre de commerce (RC)
    taxIdUrl: string;          // Numéro d'Identifiant Fiscal (NIF)
  };
  commissionRate?: number;     // Taux préférentiel spécifique (ex: 0.05 pour 5%). Prioritaire sur le taux global.
}
```

### 3.2 Collection `shops`
*   **Path du Document :** `/shops/{shopId}` (où `shopId === uid` du vendeur)
*   **Description :** Contient la charte d'identité visuelle et les métadonnées de la vitrine marchande publique.

```ts
export interface ShopDocument {
  shopId: string;              // Identifiant unique égal à l'UID du vendeur
  shopName: string;            // Raison sociale ou nom d'enseigne
  description: string;         // Texte de présentation publique
  logoUrl?: string;            // Bannière ou visuel de profil
  activeTheme: "classic_minimal" | "saharian_warm" | "tech_modern" | "deep_slate";
  bannerColor?: string;        // Code Hexadécimal de thème (ex: "#D4AF37")
  ratingAverage: number;       // Moyenne pondérée des notes d'avis produits
  totalSalesCount: number;     // Nombre de transactions validées
  createdAt: string;
}
```

### 3.3 Collection `products`
*   **Path du Document :** `/products/{productId}`
*   **Description :** Liste les articles physiques en vente sur la plateforme Olmart.

```ts
export interface ProductDocument {
  productId: string;           // Identifiant unique auto-généré
  ownerId: string;             // Identifiant UID du marchand (Lien vers /shops)
  wilayaOriginCode: string;    // Dénormalisation de la Wilaya d'expédition du marchand (01 à 58) pour accélération des calculs logistiques ACID sans jointure NoSQL
  name: string;                // Désignation commerciale (Bilingue acceptée)
  description: string;         // Descriptif complet du produit
  category: string;            // Catégorie parente du Méga Menu
  price: number;               // Prix public standard d'achat (en DZD)
  stock: number;               // Quantité physique réellement disponible en dépôt
  weight: number;              // Poids d'expédition de l'emballage (en kg) pour le calcul logistique
  photos: string[];            // Tableau d'URLs d'images du produit
  createdAt: string;
  flashDiscountPrice?: number; // Prix temporaire remisé de vente flash
  flashEndsAt?: string;        // Date d'expiration de la vente flash au format ISO
}
```

### 3.4 Collection `orders`
*   **Path du Document :** `/orders/{orderId}`
*   **Description :** Consigne les commandes et régit la comptabilité logistique et le séquestre financier d'Olmart.

```ts
export interface OrderDocument {
  orderId: string;             // Référence de commande unique
  buyerId: string;             // UID de l'acheteur (Lien vers /users)
  sellerId: string;            // UID du marchand (Lien vers /shops)
  productId: string;           // Identifiant du produit commandé
  quantity: number;            // Quantité unitaire achetée
  itemPrice: number;           // Tarif unitaire fixé à la commande (DZD)
  shippingFee: number;         // Coût logistique d'expédition calculé dynamiquement
  loyaltyPointsRedeemed: number; // Quantité de points convertis en réduction immédiate
  totalPricePaid: number;      // Total net facturé à l'acheteur
  escrowNetSellerAmount: number; // Fonds nets séquestrés destinés au vendeur à la clôture
  escrowPlatformCommission: number; // Commission prélevée à la validation
  paymentMethod: "COD" | "WALLET" | "HYBRID"; // Mode de règlement (COD, Avoir portefeuille, ou Mixte)
  paymentStatus: "PAID_ESCROW" | "PARTIALLY_PAID_COD" | "REFUNDED" | "RELEASED";
  status: "PENDING_PAYMENT" | "PAID_ESCROW" | "PREPARING" | "SHIPPED" | "DELIVERED" | "RETURN_REQUESTED" | "RETURNED" | "DISPUTED" | "COMPLETED";
  shippingAddress: {
    streetAddress: string;     // Adresse physique d'acheminement
    commune: string;           // Ville / Commune de destination
    wilayaCode: string;        // Code Wilaya d'arrivée (1 à 58)
  };
  trackingCode: string;        // Référence nationale logistique unique
  createdAt: string;
  updatedAt: string;
}
```

### 3.5 Collection `disputes`
*   **Path du Document :** `/disputes/{disputeId}`
*   **Description :** Répertoire des réclamations d'arbitrage sous médiation humaine et intelligence artificielle (Gemini).

```ts
export interface DisputeDocument {
  disputeId: string;           // Identifiant unique du dossier de litige
  orderId: string;             // Référence de la commande gelée (Lien vers /orders)
  buyerId: string;             // UID de l'acheteur plaignant
  sellerId: string;            // UID du vendeur contesté
  reason: string;              // Motif principal exposé (ex: "Produit cassé")
  details: string;             // Compléments textuels explicatifs
  evidencePhotos: string[];    // Captures ou photos des dommages
  status: "OPEN" | "RESOLVED";
  aiSummary: string;           // Rapport d'analyse et recommandation impartiale généré par Gemini-3.5-flash (Exclusif Administrateur)
  verdictSelected?: "REFUND_BUYER" | "RELEASE_VENDOR" | "SPLIT_HALF";
  createdAt: string;
}
```

### 3.6 Collection `payouts`
*   **Path du Document :** `/payouts/{payoutId}`
*   **Description :** File de traitement des demandes de retrait CCP/RIB des marchands.

```ts
export interface PayoutDocument {
  payoutId: string;            // Identifiant unique de demande
  sellerId: string;            // UID du vendeur demandeur
  amountRequested: number;     // Volume financier demandé (DZD)
  paymentMethod: "CCP" | "RIB";
  ccpAccount?: string;         // Compte postal renseigné si paymentMethod === "CCP"
  ribAccount?: string;         // Coordonnées bancaires complètes si paymentMethod === "RIB"
  status: "PENDING" | "APPROVED" | "REJECTED";
  proofUrl?: string;           // URL du reçu d'ordre de virement téléversé par l'administrateur
  createdAt: string;
  updatedAt: string;
}
```

### 3.7 Collection `audit_logs`
*   **Path du Document :** `/audit_logs/{logId}`
*   **Description :** Journaux d'audit immuables enregistrant de façon traçable chaque action sensible de l'administration.

```ts
export interface AuditLogDocument {
  logId: string;               // Identifiant unique immuable
  adminUid: string;            // UID de l'administrateur ayant déclenché l'opération
  adminEmail: string;          // Courriel de l'opérateur
  action: "KYC_APPROVAL" | "KYC_REJECTION" | "USER_SUSPENSION" | "COMMISSION_UPDATE" | "PAYOUT_APPROVAL" | "PAYOUT_REJECTION";
  targetUserId: string;        // Identifiant de l'entité ou du compte cible modifié
  ipAddress: string;           // Adresse IP d'origine de la requête
  metadata: Record<string, any>; // Détails associés à l'action
  timestamp: string;           // Horodatage ISO d'écriture synchrone
}
```
