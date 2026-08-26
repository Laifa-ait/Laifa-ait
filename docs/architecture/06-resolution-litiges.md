# Flux du Système de Résolution de Litiges

Ce diagramme illustre le processus de gestion des litiges entre acheteurs et vendeurs, avec l'intervention de l'administrateur en tant qu'arbitre.

```mermaid
sequenceDiagram
    participant Buyer as Acheteur
    participant Front as Frontend (React)
    participant API as API Express (/api/v1/disputes)
    participant DB as Firestore
    participant Admin as Administrateur

    Buyer->>Front: Signale un problème sur une commande
    Front->>API: POST /api/v1/disputes (orderId, motif)
    
    API->>API: Vérification IDOR (req.user.uid === order.buyerId)
    
    API->>DB: db.runTransaction()
    activate DB
    DB->>DB: Vérifier l'état de la commande (ex: 'delivered')
    DB->>DB: Créer le document Litige (status: 'open')
    DB->>DB: Mettre à jour la Commande (hasDispute: true)
    DB-->>API: Commit de la transaction
    deactivate DB
    
    API-->>Front: { success: true, disputeId: "123" }

    note over Buyer,Admin: Phase de Médiation & Arbitrage Assisté par IA (Gemini)

    %% Évaluation asynchrone invisible de l'IA
    API->>API: Déclenche l'évaluation confidentielle
    API->>API: Analyse des pièces & photos de preuve par Gemini-3.5-flash (SDK @google/genai)
    API->>DB: Sauvegarde discrète de l'évaluation dans 'disputes/{id}' (champ: aiSummary)
    
    note over Buyer,API: L'évaluation IA (aiSummary) est invisible pour le vendeur et l'acheteur

    Admin->>Front: Ouvre le dossier d'arbitrage
    Front->>API: GET /api/v1/admin/disputes/123
    API->>API: Vérification RBAC (Claims 'admin')
    DB-->>API: Détails du litige + aiSummary confidentiel
    API-->>Front: { success: true, dispute: [..., aiSummary: "Synthèse IA..."] }
    
    Front->>Admin: Affiche les pièces du dossier + recommandation IA de verdict

    Admin->>Front: Rend sa décision d'arbitrage souveraine (Remboursement/Rejet)
    Front->>API: POST /api/v1/admin/disputes/123/resolve { decision: "refund_buyer" | "pay_seller" }
    
    API->>DB: db.runTransaction()
    activate DB
    DB->>DB: Changer le statut du litige à 'resolved'
    DB->>DB: Changer le statut de la commande à 'refunded'
    DB->>DB: (Optionnel) Ajuster le solde du vendeur
    DB-->>API: Commit de la transaction
    deactivate DB

    API-->>Front: { success: true }
```

## Note sur l'Architecture Financière (Virements & Reversements)

**Optimisation & Flux de Clôture :**
Le diagramme modélise l'ajustement du statut de la commande lors de la résolution du litige. Pour les reversements marchands et les indemnisations éventuelles, la comptabilisation s'effectue directement sur le grand-livre de facturation de la commande sans dépendance à un solde électronique intermédiaire.

**Évolution recommandée :**
Les événements financiers de clôture de litige émettent des notifications administratives permettant le traitement des flux de régularisation bancaire/CCP en toute conformité.
