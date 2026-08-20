# Flux d'une Commande (Transactions ACID & Séquestre Escrow)

Ce document détaille la cinématique technique complète du cycle de vie d'une commande sur Olmart, de la vérification concurrentielle des stocks physiques jusqu'au dénouement financier sous séquestre réglementaire.

---

## 📦 1. CINÉMATIQUE COMPLÈTE DE LA TRANSACTION

```mermaid
sequenceDiagram
    participant Buyer as 📱 Acheteur
    participant Front as 💻 Frontend (React UI)
    participant Gateway as 🟢 Olmart Gateway (Express v1)
    participant DB as 🟢 Firestore Core (Transactions)
    participant Carrier as 🚚 Système Logistique (ex: Yalidine)

    %% Étape 1: Création
    Buyer->>Front: Valide son panier (Checkout)
    Front->>Gateway: POST /api/v1/orders { items, shippingAddress, paymentMethod: "COD" | "WALLET" }
    
    %% Étape 2: Validation et Transaction ACID
    Gateway->>Gateway: Valide la conformité Wilaya (01-58) et nettoie le mobile (+213)
    
    Gateway->>DB: db.runTransaction()
    activate DB
    DB->>DB: Lit le stock actuel de chaque produit (getProduct)
    
    alt Un produit est en rupture de stock
        DB-->>Gateway: Lève une exception d'annulation (Stock épuisé)
        Gateway-->>Front: HTTP 409 { error: "Stock insuffisant pour le produit X" }
    else Stocks disponibles
        DB->>DB: Décrémente le stock de manière atomique (update)
        DB->>DB: Calcule le taux de commission (Palier dynamique : spécifique vendeur vs global 10%)
        DB->>DB: Enregistre la commande { status: "PAID_ESCROW", escrowLockedDZD }
        DB-->>Gateway: Succès (Commit ACID de la transaction)
    end
    deactivate DB
    
    Gateway-->>Front: HTTP 200 { success: true, orderId: "ord_2026_9817" }
    Front->>Buyer: Affiche la confirmation et le reçu imprimable (Loi n° 18-05)

    %% Étape 3: Logistique
    note over Gateway,Carrier: Phase Logistique (Expédition physique)
    Gateway->>Carrier: Crée le bordereau d'expédition électronique
    Carrier->>Buyer: Livre le colis et collecte le COD (Cash on Delivery)
    Carrier->>Gateway: Webhook POST /api/v1/orders/webhook-delivery (Signature HMAC-SHA256)
    
    %% Étape 4: Séquestre 72h
    Gateway->>DB: Enregistre le paiement & démarre le séquestre de 72 heures
    DB-->>Gateway: Commande passe à 'DELIVERED'
    
    note over Buyer,DB: Délai de conformité de 72h actif (Loi n° 18-05)

    alt Pas de litige levé sous 72h
        DB->>DB: Transaction ACID : Libère Balance Séquestrée -> Balance Disponible vendeur
        DB->>DB: Prélève la commission de plateforme correspondante
    else Litige déclaré par l'acheteur
        DB->>DB: Gèle la transition, passe l'état à 'DISPUTED' (Fonds sécurisés)
    end
```

---

## 🔒 2. SÉCURITÉ & ROBUSTESSE DU CYCLE TRANSITIONNEL

### 2.1 Verrou ACID de Stock (Zéro Survente)
La décrémentation est encadrée dans un bloc transactionnel Firestore `runTransaction` interdisant les lectures sales. Si deux acheteurs achètent simultanément le dernier exemplaire d'un produit, Firestore invalide automatiquement la deuxième écriture conflictuelle et force une tentative de réévaluation du stock avant de retourner une erreur d'indisponibilité.

### 2.2 Détermination Dynamique de la Commission (Double Palier)
Lors de l'enregistrement de la commande, le moteur de calcul interroge le document `/users/{vendeur_uid}` :
$$\text{Commission} = \text{totalPrice} \times \begin{cases} 
\text{commissionRateOverride} & \text{si renseigné} \\
10\% & \text{sinon (taux global)}
\end{cases}$$

### 2.3 Réconciliation par Webhook Signé
Les retours logistiques et encaissements physiques (COD) proviennent de l'API du transporteur par webhook. Pour se prémunir des falsifications de solde, la passerelle Olmart exige une signature cryptographique `HMAC-SHA256` générée avec la clé secrète du transporteur et transmise dans l'en-tête `X-Olmart-Signature`.

---

## 📝 3. MATRICE DE TRANSITION DES ÉTATS DE COMMANDE

```text
[PENDING_PAYMENT] ──(Paiement validé)──► [PAID_ESCROW] ──(Vendeur emballe)──► [PREPARING]
                                                                                │
[COMPLETED] ◄──(72h écoulées sans litige)── [DELIVERED] ◄──(Colis remis)─── [SHIPPED]
    │                                            │
    ▼                                            ▼
[REVENUE_RELEASED]                         [DISPUTED] (Fonds gelés pour enquête)
```

