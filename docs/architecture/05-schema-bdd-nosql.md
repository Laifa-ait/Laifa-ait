# Schéma de Base de Données (Firestore NoSQL)

Ce document présente la modélisation des données d'Olmart. Dans un environnement NoSQL orienté documents comme Firebase Firestore, les relations ne se font pas via des JOINs SQL stricts, mais plutôt via des références de clés étrangères (UID/ID) ou des sous-collections selon la volumétrie.

## Diagramme d'Entité-Relation (ERD Conceptuel)

Bien que Firestore soit NoSQL, ce diagramme ER permet de visualiser les liens conceptuels entre les principales collections racine.

```mermaid
erDiagram
    USERS ||--o{ PRODUCTS : "creates (si seller)"
    USERS ||--o{ ORDERS : "places (buyer)"
    USERS ||--o{ ORDERS : "receives (seller)"
    USERS ||--o{ REVIEWS : "writes"
    PRODUCTS ||--o{ REVIEWS : "has"
    PRODUCTS ||--o{ ORDERS : "included in"

    USERS {
        string uid PK "Clé primaire (Firebase Auth ID)"
        string email
        string role "buyer | vendor | admin"
        string displayName
        string status "active | pending | suspended"
        boolean isBanned "Statut de suspension pour non-conformité"
        string bannedReason "Motif de bannissement"
        boolean isVerified
        map address "Coordonnées de livraison par défaut"
    }

    PRODUCTS {
        string id PK "Auto-généré"
        string sellerId FK "Réf. vers USERS(uid)"
        string wilayaOriginCode "Code Wilaya d'expédition (01 à 58)"
        string name
        number price
        number stock
        string category
        string status "active | draft | out_of_stock | pending"
        boolean isSponsored
        array images
        timestamp createdAt
    }

    ORDERS {
        string id PK "Auto-généré"
        string buyerId FK "Réf. vers USERS(uid)"
        string sellerId FK "Réf. vers USERS(uid)"
        string status "PENDING_PAYMENT | PAID_ESCROW | PREPARING | SHIPPED | DELIVERED | RETURN_REQUESTED | RETURNED | DISPUTED | COMPLETED"
        string paymentMethod "COD"
        number totalPricePaid
        number escrowNetSellerAmount
        number escrowPlatformCommission
        array items "Objets contenant productId, quantity, priceAtPurchase"
        map shippingAddress
        timestamp createdAt
    }

    REVIEWS {
        string id PK "Auto-généré"
        string productId FK "Réf. vers PRODUCTS(id)"
        string authorId FK "Réf. vers USERS(uid)"
        number rating "1 à 5"
        string comment
        timestamp createdAt
    }
```

## Stratégie de Modélisation NoSQL (Olmart)

1. **Collections Racine Favorites (Root Collections) :**
   - `users`, `products`, `orders`, `reviews`.
   - L'utilisation de collections racine avec des clés étrangères (`sellerId`, `buyerId`) est privilégiée par rapport aux sous-collections volumineuses, car cela permet une requête globale via des **Index Composites** (ex: récupérer tous les produits de la plateforme filtrés par catégorie, indépendamment du vendeur).

2. **Dénormalisation vs Référence :**
   - **Historique immuable (Commandes) :** Lorsqu'une commande est passée, les détails essentiels du produit (nom, prix au moment de l'achat) sont *dénormalisés* (copiés) dans le document de la commande (array `items`). Si le vendeur modifie le prix de son produit le lendemain, la facture de la commande précédente reste intacte.
   - **Synchronisation :** Les profils utilisateurs maintiennent leur statut de rôle (`buyer`, `seller`, `admin`), vérifié conjointement avec les Custom Claims de Firebase Auth pour une sécurité maximale.

3. **Transactions ACID :**
   - La mutation des stocks dans la collection `products` et la création du document dans `orders` sont toujours encapsulées dans une transaction Firestore (`db.runTransaction()`) pour éviter les états de course (race conditions) et la sur-vente.
