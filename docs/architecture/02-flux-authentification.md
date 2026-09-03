# Flux d'Authentification & RBAC (Anti-Desync Iframe)

Ce document détaille le processus d'enrôlement et d'accès sécurisé par OTP SMS (One-Time Password) et le mécanisme de réconciliation/maintien de session (Heal-Session) conçu pour contourner les restrictions d'iframe tierces.

---

## 🔐 1. DIAGRAMME DE SÉQUENCE DE L'AUTHENTIFICATION PAR OTP SMS

```mermaid
sequenceDiagram
    participant User as 📱 Acheteur/Vendeur
    participant Front as 💻 Frontend (React UI)
    participant Auth as 🔐 Firebase Auth (SMS SDK)
    participant Gateway as 🟢 Olmart Gateway (Express v1)
    participant DB as 🟢 Firestore Core (NoSQL)

    %% Phase 1: Demande d'OTP
    User->>Front: Saisit son numéro de mobile algérien (+213 / 05/06/07)
    Front->>Gateway: POST /api/v1/auth/request-otp { phoneNumber }
    Gateway->>Gateway: Applique le Rate-Limiter SMS Flood (max 3/heure)
    Gateway-->>Front: { success: true, challengeId: "sms_chn_9012" }
    
    %% Phase 2: Saisie de l'OTP
    User->>Front: Reçoit le SMS & saisit le code à 6 chiffres
    Front->>Auth: signInWithPhoneNumber(code)
    Auth-->>Front: Session validée (IdToken JWT émis)

    %% Phase 3: Réconciliation de la Session (Heal-Session)
    Front->>Gateway: POST /api/v1/auth/heal-admin (Header: Bearer {IdToken})
    
    Gateway->>Auth: admin.auth().verifyIdToken(token)
    Auth-->>Gateway: Jeton valide (UID, Phone)
    
    Gateway->>DB: Récupère/Crée le profil utilisateur (UID)
    alt Utilisateur inexistant
        Gateway->>DB: Transaction ACID : Crée profil (role: "buyer", status: "active")
    end
    
    alt Privilèges d'administration vérifiés côté serveur (Custom Claims / Rôle validé)
        Gateway->>Auth: Mettre à niveau / Vérifier les Custom Claims { role: "admin" }
        Gateway->>DB: Met à jour le statut en base ("admin")
    end

    DB-->>Gateway: Profil utilisateur consolidé
    Gateway-->>Front: { success: true, profile: { uid, role, phone }, token: "Short-lived JWT" }
    Front->>Front: Enregistre le JWT en mémoire (React State)
    Front->>User: Redirection dynamique selon le rôle (/dashboard/admin, /dashboard/seller, /shop)
```

---

## 🔒 2. INTERCEPTEUR DE RÉCONCILIATION RÉSEAU (ANTI-DESYNC COOKIES)

Puisque Olmart s'exécute dans une iframe AI Studio, l'usage des cookies de session traditionnels est désactivé. L'authentification est maintenue grâce à l'injection dynamique :

1.  **En-tête d'autorisation :** Le client React intercepte chaque requête sortante de l'API Axios/Fetch pour injecter l'en-tête `Authorization: Bearer <JWT>`.
2.  **Restauration (Heal-Session) :** En cas d'erreur `HTTP 401 Unauthorized` reçue de la gateway, le client sollicite en tâche de fond le service `heal-session` pour régénérer un jeton via le SDK Firebase Web local en transmettant le refresh token natif de Firebase, résolvant de manière transparente la déconnexion intempestive.

---

## 🛡️ 3. RÔLES ET PRIVILÈGES DU SYSTÈME (RBAC MATRICE)

| Rôle | Portée d'accès | Droits d'écriture critiques |
| :--- | :--- | :--- |
| **Acheteur (`buyer`)** | Catalogue public, commandes personnelles, profil, litiges personnels | Création de commande, ouverture de litige, annulation |
| **Vendeur (`vendor`)** | Boutique propre, gestion des produits, commandes reçues, retrait balance | Ajout/édition de produit (fichiers KYC), validation expédition |
| **Administrateur (`admin`)**| Console d'administration globale, arbitrage des litiges, modération marchands, configuration des commissions | Approbation/rejet de boutique (KYC), résolution souveraine de litige, configuration globale des commissions |

