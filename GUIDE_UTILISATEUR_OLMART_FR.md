# 📘 DOCUMENTATION GLOBALE D'EXPLOITATION ET MANUELS DE RÉFÉRENCE - OLMART

**Version de référence :** 4.1 (Édition Intégrale de Niveau Industriel)  
**Date d'édition :** 17 Juillet 2026  
**Auteurs :** Direction de l'Ingénierie, Direction des Opérations & Produit Olmart  
**Portée territoriale :** République Algérienne Démocratique et Populaire (58 Wilayas)  
**Classification :** Document Officiel de Curation, d'Exploitation et de Spécifications Techniques

---

## 📌 TABLE DES MATIÈRES

1. [PARTIE I : CARTOGRAPHIE FONCTIONNELLE & DIAGRAMMES D'ARCHITECTURE](#partie-i--cartographie-fonctionnelle--diagrammes-darchitecture)
   - [1.1 Schéma de l'Architecture Générale & Flux Applicatifs](#11-schema-de-larchitecture-generale--flux-applicatifs)
   - [1.2 Matrice de Permissions & Flux des Rôles (RBAC)](#12-matrice-de-permissions--flux-des-roles-rbac)
   - [1.3 Machine d'État de Commande & Invariants d'Expédition](#13-machine-detat-de-commande--invariants-dexpedition)
   - [1.4 Cycle de Retour (Logistique Inverse) & Arbitrage des Litiges par IA](#14-cycle-de-retour-logistique-inverse--arbitrage-des-litiges-par-ia)
2. [PARTIE II : MANUEL DE L'ACHETEUR (GUIDE UTILISATEUR)](#partie-ii--manuel-de-lacheteur-guide-utilisateur)
   - [2.1 Authentification par OTP SMS & Résilience de Session](#21-authentification-par-otp-sms--resilience-de-session)
   - [2.2 Recherche Facettée, Filtrage par Wilaya et Comparateur](#22-recherche-facettee-filtrage-par-wilaya-et-comparateur)
   - [2.3 Ventes Flash, Tunnel d'Achat & Imputation d'Avoirs](#23-ventes-flash-tunnel-dachat--imputation-davoirs)
3. [PARTIE III : MANUEL DU VENDEUR & CYCLES DE VIE MARCHANDS](#partie-iii--manuel-du-vendeur--cycles-de-vie-marchands)
   - [3.1 Cycle de Vie d'un Compte Vendeur (Onboarding à Retrait)](#31-cycle-de-vie-dun-compte-vendeur-onboarding-a-retrait)
   - [3.2 Cycle de Vie Technique d'un Produit du Catalogue](#32-cycle-de-vie-technique-dun-produit-du-catalogue)
   - [3.3 Configuration de Vitrine, Gestion Logistique & Retraits CCP](#33-configuration-de-vitrine-gestion-logistique--retraits-ccp)
4. [PARTIE IV : MANUEL DE L'ADMINISTRATEUR (CONSOLE DE CONTRÔLE)](#partie-iv--manuel-de-ladministrateur-console-de-controle)
   - [4.1 Instruction KYC, Homepage Builder & Diffusion par Lots](#41-instruction-kyc-homepage-builder--diffusion-par-lots)
   - [4.2 Arbitrage Invisible assisté par IA (Gemini-3.5-flash)](#42-arbitrage-invisible-assiste-par-ia-gemini-35-flash)
   - [4.3 Configuration des Commissions & Traduction Bilingue](#43-configuration-des-commissions--traduction-bilingue)
5. [PARTIE V : SPÉCIFICATIONS TECHNIQUES, BASE FIRESTORE & APIS](#partie-v--specifications-techniques-base-firestore--apis)
   - [5.1 Intégrité Financière : Transactions ACID Firestore](#51-integrite-financiere--transactions-acid-firestore)
   - [5.2 Résumé du Schéma de la Base NoSQL Firestore](#52-resume-du-schema-de-la-base-nosql-firestore)
   - [5.3 Inventaire Condensé des Routes d'API v1](#53-inventaire-condense-des-routes-dapi-v1)
6. [PARTIE VI : PLAN DE SAUVEGARDE, RGPD ALGÉRIE & MONITORING](#partie-vi--plan-de-sauvegarde-rgpd-algerie--monitoring)
   - [6.1 Plan de Sauvegarde de la Base NoSQL & PRA d'Urgence](#61-plan-de-sauvegarde-de-la-base-nosql--pra-durgence)
   - [6.2 Conformité Juridique Algérienne (Loi n° 18-07)](#62-conformite-juridique-algerienne-loi-n-18-07)
   - [6.3 Monitoring Technique, Logs Unifiés & Runbook d'Incidents](#63-monitoring-technique-logs-unifies--runbook-dincidents)
7. [PARTIE VII : ROADMAP TECHNIQUE & INDEX DOCUMENTAIRE](#partie-vii--roadmap-technique--index-documentaire)
   - [7.1 Registre abrégé des Décisions d'Architecture (ADR)](#71-registre-abrege-des-decisions-darchitecture-adr)
   - [7.2 Plan de Route d'Évolution Technique d'Olmart (Roadmap)](#72-plan-de-route-devolution-technique-dolmart-roadmap)
   - [7.3 Index d'Orientation de la Suite Documentaire d'Olmart](#73-index-dorientation-de-la-suite-documentaire-dolmart)

---

## PARTIE I : CARTOGRAPHIE FONCTIONNELLE & DIAGRAMMES D'ARCHITECTURE

### 1.1 Schéma de l'Architecture Générale & Flux Applicatifs

L'architecture logicielle d'Olmart est conçue selon un modèle full-stack robuste, découplant le rendu bilingue client de la logique métier sécurisée côté serveur pour empêcher toute vulnérabilité liée au contexte d'encapsulation de l'iframe de prévisualisation :

```
                  ┌─────────────────────────────────────┐
                  │          NAVIGATEUR CLIENT          │
                  │   (React 18 / Vite / Tailwind CSS)  │
                  └──────────────────┬──────────────────┘
                                     │
                     HTTPS v1 Appels │ (Authorization: Bearer <JWT_Token>)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │          INGRESS NGINX PROXY        │
                  │  (SSL Termination & Route Routing)  │
                  └──────────────────┬──────────────────┘
                                     │
                        Reverse Proxy│ (Port interne : 3000)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │       EXPRESS NODE.JS SERVER        │
                  │      (Gateway & Route Handlers)     │
                  └──────┬───────────┬───────────┬──────┘
                         │           │           │
     Firebase Admin SDK  │           │           │ API Intégration
                         ▼           │           ▼
  ┌───────────────────────────┐      │     ┌───────────────────────────┐
  │      FIRESTORE DATABASE   │      │     │    GEMINI INTERACTIONS    │
  │     (Transactions ACID)   │      │     │    (Modèle 3.5-flash)     │
  └───────────────────────────┘      │     └───────────────────────────┘
                                     ▼
                       ┌───────────────────────────┐
                       │     FIREBASE STORAGE      │
                       │     (KYC, Images, S3)     │
                       └───────────────────────────┘
```

---

### 1.2 Matrice de Permissions & Flux des Rôles (RBAC)

L'octroi des permissions et droits d'accès au sein du système respecte un modèle de privilège minimum hiérarchique :

```
       [ VISITEUR ANONYME ] 
                │
                ├─► Consultation du catalogue, Wilayas et prix
                ├─► Comparaison technique de fiches articles
                └─► Inscription & Envoi OTP SMS
                        │
                        ▼
       [ ACHETEUR ('buyer') ] ──► (IDOR Guard : req.user.uid === resource.buyerId)
                │
                ├─► Achat sécurisé de panier (Escrow)
                ├─► Imputation d'avoirs de remboursement
                └─► Réclamations, retours et litiges
                        │
                        ▼
       [ VENDEUR ('vendor') ] ──► (Vérification du dossier KYC Marchand approuvé)
                │
                ├─► Gestion de vitrine et thèmes visuels
                ├─► Publication d'articles et de stocks physiques
                └─► Retrait des gains (CCP/RIB) et réponses aux avis
                        │
                        ▼
     [ ADMINISTRATEUR ('admin') ] ──► (Attribué par Custom Claims Firebase d'urgence)
                │
                ├─► Audit & Approbation des KYC Marchands
                ├─► Homepage Builder & Éditeur d'Accueil
                ├─► Configuration financière globale (Commissions)
                ├─► Consultation des journaux d'audit de sécurité
                └─► Arbitrage confidentiel des dossiers de litige
```

---

### 1.3 Machine d'État de Commande & Invariants d'Expédition

Le cycle de traitement d'une commande obéit à un flux d'états strict (DAG). Aucune régression n'est permise côté serveur :

```
      [ PENDING_PAYMENT ] 
               │
               ▼ (Paiement validé / Escrow)
        [ PAID_ESCROW ] 
               │
               ▼ (Marchand imprime le bordereau & emballe)
         [ PREPARING ] 
               │
               ▼ (Colis remis au transporteur national d'Algérie)
          [ SHIPPED ] 
               │
               ▼ (Colis scanné livré à destination)
         [ DELIVERED ] ──────────────────────┐
               │                             │
               │ (Conforme / 72h expirées)   │ (Non conforme / Litige)
               ▼                             ▼
         [ COMPLETED ]               [ RETURN_REQUESTED ]
     (Fonds libérés au vendeur,              │
      Loyalty points crédités)               ▼ (Vendeur valide)
                                        [ RETURNED ]
                                     (Acheteur remboursé)
```

---

### 1.4 Cycle de Retour (Logistique Inverse) & Arbitrage des Litiges par IA

En cas de contestation lors de la phase `DELIVERED`, le système engage la procédure sécurisée de retour et d'analyse impartiale par l'IA d'Olmart :

```
     [ ACHETEUR ]                       [ SYSTÈME OLMART ]                     [ VENDEUR ]
          │                                      │                                  │
          │─── 1. Demande de retour ────────────►│                                  │
          │    (Délai strict de 72 heures)       │                                  │
          │                                      │─── 2. Notification de litige ───►│
          │                                      │    (Fonds bloqués en Escrow)     │
          │                                      │                                  │
          │                                      │◄── 3. Justificatif vendeur ──────│
          │                                      │                                  │
          │                                      ├─┐                                │
          │                                      │ 4. Analyse confidentielle par    │
          │                                      │   l'IA d'Olmart (Gemini 3.5)     │
          │                                      │   (Rapport invisible aux tiers)  │
          │                                      │◄┘                                │
          │                                      │                                  │
          │◄── 5. Verdict d'Arbitrage Humain ────┼─── 5. Verdict d'Arbitrage Humain ─►│
          │    (Remboursement en avoirs)         │    (Fonds libérés ou partagés)   │
```

---

## PARTIE II : MANUEL DE L'ACHETEUR (GUIDE UTILISATEUR)

### 2.1 Authentification par OTP SMS & Résilience de Session
L'accès acheteur s'appuie sur le numéro de téléphone mobile en tant qu'identifiant unique algérien (Mobilis, Djezzy, Ooredoo). 
*   **Fonctionnement :** La saisie des informations d'identité et du numéro génère un code OTP unique à 6 chiffres, haché en SHA-256 avec grain de sel en base de données, envoyé par SMS.
*   **Résilience de session (Heal-Session) :** Pour contrecarrer les restrictions de cookies des iframes, un intercepteur d'API client injecte dynamiquement le jeton d'authentification rafraîchi dans l'en-tête `Authorization: Bearer <Token>` à chaque appel réseau.
*   **Résolutions d'erreurs récurrentes :**
    *   *Code SMS non reçu :* Limité à 3 envois par heure par numéro pour contrer le harcèlement de requêtes SMS (SMS Flooding). Patientez 15 minutes avant de réitérer.

### 2.2 Recherche Facettée, Filtrage par Wilaya et Comparateur
L'acheteur filtre les produits par catégorie, plage de prix (DZD), note d'évaluation et Wilaya d'expédition du marchand.
*   **Comparateur Multi-Critères :** Permet la mise en parallèle de 4 articles d'une même catégorie. L'interface compare de manière synchrone le prix unitaire, le poids d'emballage, le délai d'expédition moyen et la Wilaya de provenance pour assurer une décision d'achat rationnelle.

### 2.3 Ventes Flash, Tunnel d'Achat & Paiement à la Livraison (COD)
*   **Ventes Flash :** L'acheteur profite de tarifs réduits limités dans le temps. L'horloge du serveur Express d'Olmart valide de manière absolue l'expiration des offres pour contrer toute manipulation de l'horloge système côté client.
*   **Calcul d'Expédition Dynamique :** Lors du passage au panier, le moteur logistique d'Olmart croise la Wilaya d'origine de la boutique et la Wilaya de destination de l'acheteur pour émettre la facturation de transport réelle.
*   **Paiement Intégral à la Livraison (Cash on Delivery - COD) :** L'acheteur règle la commande directement en espèces au livreur lors de la remise du colis à domicile ou en point relais.

### 2.4 Matrice Logistique des Wilayas (Calcul de Livraison par Zone)
Afin d'automatiser et de sécuriser la facturation du fret terrestre, l'API d'Olmart classifie les 58 Wilayas algériennes en 4 grandes zones logistiques distinctes, croisées avec le poids d'emballage de l'article :
1.  **Zone I (Métropoles & Proximité - Alger, Blida, Tipaza, Boumerdès) :** Tarif de base de 400 DZD (à domicile) / 250 DZD (point relais). Délai : 24 à 48 heures.
2.  **Zone II (Nord & Hauts-Plateaux - ex: Oran, Constantine, Sétif, Tlemcen, Chlef) :** Tarif de base de 650 DZD (à domicile) / 450 DZD (point relais). Délai : 48 à 72 heures.
3.  **Zone III (Sud Proche & Portes du Désert - ex: Biskra, Laghouat, Ghardaïa, El Oued) :** Tarif de base de 900 DZD (à domicile) / 700 DZD (point relais). Délai : 3 à 5 jours.
4.  **Zone IV (Grand Sud & Frontières - ex: Tamanrasset, Adrar, Illizi, Tindouf, Djanet) :** Tarif de base de 1500 DZD (à domicile) / 1100 DZD (point relais). Délai : 5 à 7 jours.

*Surcharge de Poids :* Au-delà du premier kilogramme, un incrément forfaitaire de 100 DZD par kg supplémentaire est automatiquement calculé par le serveur Express pour refléter les conditions tarifaires réelles de nos transporteurs partenaires (Yalidine, Kazitour, etc.).

---

## PARTIE III : MANUEL DU VENDEUR & CYCLES DE VIE MARCHANDS

### 3.1 Cycle de Vie d'un Compte Vendeur (Onboarding à Retrait)

Le cycle d'intégration d'un marchand sur Olmart est balisé par des étapes réglementaires strictes pour garantir la légitimité des commerçants :

```
  [ INSCRIPTION ] ──► [ SOUMISSION KYC ] ──► [ AUDIT ADMIN ] ──► [ ACTIVATION DE BOUTIQUE ]
                             ▲                      │
                             │ (Correction pièces)  ▼ (Rejet / Pièce invalide)
                             └───────────────── [ SUSPENSION ]
                                                    │
                                                    ▼ (Fractions / Fraudes répétées)
                                               [ BANNISSEMENT ]
```

1.  **Inscription :** Création du profil d'accès de base.
2.  **Soumission KYC :** Téléversement obligatoire de la Carte Nationale d'Identité (CNI), du Registre de Commerce (RC), et du Numéro d'Identifiant Fiscal (NIF). Le compte est marqué `pending_verification`.
3.  **Audit Administratif :** Analyse humaine de la validité des justificatifs.
4.  **Activation :** Le statut passe à `approved`. La boutique devient publique, autorisant l'ajout de fiches articles.
5.  **Opérations Nominal :** Publication d'articles, traitement des ventes, et accumulation des gains disponibles sur le solde.
6.  **Retrait :** Formulaire de payout CCP/RIB débitant le solde disponible pour exécution du virement par l'administration d'Olmart.
7.  **Modération :** Suspension provisoire ou définitive en cas de litiges répétés ou de non-conformité avérée des produits expédiés.

---

### 3.2 Cycle de Vie Technique d'un Produit du Catalogue

Chaque article soumis au catalogue d'Olmart traverse des états successifs gérés rigoureusement par notre inventaire centralisé :

```
 [ CRÉATION ] ──► [ BROUILLON ] ──► [ ACTIVATION PUBLIQUE ] ──► [ DISPONIBLE EN VENTE ]
                                              │                         │
            (Fin de l'événement promotionnel) ▼                         ▼ (Achat ACID d'un client)
                                      [ VENTE FLASH ]           [ STOCK DÉCRÉMENTÉ ]
                                              │                         │
                                              ▼                         ▼ (Quantité physique = 0)
                                      [ ARCHIVAGE ] ◄─────────── [ RUPTURE DE STOCK ]
                                              │
                                              ▼
                                         [ SUPPRIMÉ ]
```

*   **Brouillon :** Fiche en cours d'édition, invisible pour les internautes.
*   **Publié :** Article indexé dans le moteur de recherche d'Olmart et disponible à l'achat.
*   **Vente Flash :** État temporaire où la tarification de l'article est substituée par le prix promotionnel avec compte à rebours dynamique.
*   **Rupture de Stock :** L'article reste visible au catalogue mais l'ajout au panier est strictement bloqué par le serveur.
*   **Archivé :** Retrait de l'indexation publique, conserve l'intégrité référentielle pour les commandes passées.

---

### 3.3 Configuration de Vitrine, Gestion Logistique & Retraits CCP
*   **Configuration de Vitrine :** Le marchand personnalise son identité publique en choisissant parmi 4 thèmes graphiques : *Classic Minimal* (tons de gris neutres), *Saharian Warm* (tons d'argile chauds), *Tech Modern* (teintes de bleu électrique) et *Deep Slate* (teintes sombres et élégantes).
*   **Poids de l'Emballage Obligatoire :** Pour chaque produit, le vendeur doit renseigner le poids d'emballage exact en kilogrammes. Cette métrique logistique sert à facturer l'acheteur au plus juste selon les barèmes de transport nationaux d'Olmart.
*   **Double Balance Financière :** Le portefeuille distingue la balance séquestrée (gains des colis en transit ou sous garantie de 72 heures) de la balance disponible (gains confirmés et retirables).
*   **Formulaire de Payout CCP/RIB :** Permet la soumission d'une demande de retrait réelle. Le solde disponible est immédiatement débité de manière transitoire pour éviter la double dépense de fonds, dans l'attente du téléversement du reçu de virement réel par l'administrateur d'Olmart.

### 3.4 Protocole de Réconciliation du Cash on Delivery (COD)
Le Paiement à la Livraison (COD) représentant plus de 95% des flux transactionnels en Algérie, Olmart a structuré un processus d'alignement physique-numérique rigoureux :
1.  **Enregistrement de la commande :** La commande est créée sous l'état `PENDING_PAYMENT` (si paiement par avoir) ou directement `PAID_ESCROW` (marquée pour collecte physique COD).
2.  **Collecte et Livraison :** Le transporteur livre le colis et encaisse la somme physique en DZD à la porte de l'acheteur. 
3.  **Webhook de Confirmation :** Dès encaissement, le livreur valide la transaction sur son terminal, déclenchant un webhook sécurisé vers `/api/v1/orders/webhook-delivery`. La commande passe à l'état `DELIVERED`.
4.  **Période de Séquestre de 72h :** L'argent collecté par le transporteur est reversé sur le compte séquestre de la plateforme Olmart, tandis que le montant correspondant (déduit de la commission) est affiché sous "Balance Séquestrée" sur le profil du vendeur.
5.  **Libération des Fonds :** À l'expiration du délai légal de 72h sans réclamation, le montant est transféré de manière transactionnelle vers la "Balance Disponible" du vendeur, devenant ainsi retirable par virement CCP.
6.  **Refus de Colis au pas de la porte (Refus COD) :** En cas de refus de réception par l'acheteur, le colis est renvoyé au vendeur (Retour Logistique NPAI). Le statut passe à `RETURNED` dans Firestore, annulant la dette logistique sans impact financier pour le vendeur autre que les frais d'expédition de retour selon les conditions de sa charte.

---

## PARTIE IV : MANUEL DE L'ADMINISTRATEUR (CONSOLE DE CONTRÔLE)

### 4.1 Instruction KYC, Homepage Builder & Diffusion par Lots
*   **Instruction KYC :** L'administrateur inspecte visuellement les pièces justificatives téléversées et valide ou rejette le dossier marchand d'un clic en fournissant un motif de rejet traçable.
*   **Homepage Builder :** Éditeur d'arborescence par blocs JSON permettant de masquer, d'activer, ou de réordonner les bandeaux d'accueil, les ventes flash ou les sélections thématiques régionaux sans aucune recompilation applicative.
*   **Newsletter par Lots (Anti-Spam) :** Les envois d'infolettres de masse aux abonnés sont découpés asynchrones par lots de 50 destinataires par minute (Batching) pour préserver la réputation d'expédition SMTP et éviter tout rejet par les serveurs de messagerie tiers.

### 4.2 Arbitrage Invisible assisté par IA (Gemini-3.5-flash)
Lorsqu'un litige est déclaré par un acheteur, l'écosystème d'IA d'Olmart analyse l'historique textuel et visuel pour formuler une aide à la décision.
*   **Rapport d'Arbitrage Confidentiel :** Ce rapport est consigné sous l'attribut `aiSummary` de la collection `disputes`. Pour préserver l'impartialité des arbitrages et de la communication, cet encadré analytique rédigé par l'IA est strictement confidentiel : **il est invisible sur les comptes de l'acheteur et du vendeur**, réservé exclusivement à l'instruction humaine de l'administrateur de la plateforme.
*   **Verdicts d'Arbitrage :** L'administrateur valide le dossier en sélectionnant l'un des trois boutons d'arbitrage financier d'Olmart : rembourser intégralement l'acheteur, libérer les fonds au vendeur, ou scinder la somme à parts égales (50/50).

### 4.3 Configuration des Commissions & Traduction Bilingue
*   **Configuration Dynamique des Commissions (Take Rate) :** L'administrateur définit un pourcentage de commission global par défaut (ex: 10%), mais dispose de la liberté d'attribuer un taux préférentiel spécifique (ex: 5%) au profil individuel d'un marchand partenaire. Le serveur Express interroge en priorité la commission spécifique du marchand avant d'appliquer la règle générale.
*   **Dictionnaire Linguistique Dynamique :** Permet d'éditer en direct les labels, textes de boutons et messages d'interface dans les 3 langues d'Olmart, sans interruption de service.

---

## PARTIE V : SPÉCIFICATIONS TECHNIQUES, BASE FIRESTORE & APIS

### 5.1 Intégrité Financière : Transactions ACID Firestore

Afin de proscrire tout risque de survente de produits lors de pics de trafic ou d'exploitation frauduleuse des balances d'avoirs de portefeuille, le serveur d'API v1 d'Olmart encapsule obligatoirement toutes les écritures comptables dans un bloc transactionnel Firestore ACID (`db.runTransaction()`).

#### Séquence d'Exécution Transactionnelle :
```ts
// Tout enregistrement de commande s'exécute dans une transaction isolée
await db.runTransaction(async (transaction) => {
  const productRef = db.collection("products").doc(productId);
  const buyerRef = db.collection("users").doc(buyerId);

  const productSnap = await transaction.get(productRef);
  const buyerSnap = await transaction.get(buyerRef);

  if (!productSnap.exists || !buyerSnap.exists) {
    throw new Error("RESOURCE_NOT_FOUND");
  }

  // 1. Contrôle strict de la disponibilité physique du stock
  const currentStock = Number(productSnap.data()!.stock);
  if (currentStock < qty) {
    throw new Error("INSUFFICIENT_STOCK");
  }

  // 2. Décrémentation physique atomique
  transaction.update(productRef, { stock: currentStock - qty });
});
```

---

### 5.2 Résumé du Schéma de la Base NoSQL Firestore

L'architecture NoSQL d'Olmart s'appuie sur un référentiel de collections unifié :

*   **`users`** : Profils d'identité (Acheteurs, Vendeurs, Administrateurs), adresses de livraison, et données de dossiers KYC.
*   **`shops`** : Configurations de bannières, thèmes visuels actifs, notes d'évaluation moyennes, et volumes de ventes des marchands.
*   **`products`** : Fiches descriptives des articles, prix publics, tarifs de ventes flash, minuteurs d'expiration, stocks physiques, et poids logistique d'emballage.
*   **`orders`** : Registre immuable de facturation d'achat COD, suivi logistique national, frais de transport par Wilaya, commissions prélevées et statuts de livraison.
*   **`disputes`** : Dossiers de réclamation d'arbitrage tripartite, photos des anomalies, journal de messages, et rapport analytique d'aide à la décision confidentiel de l'IA.
*   **`payouts`** : Queue d'ordonnancement des virements financiers CCP/RIB des vendeurs, états de traitement et reçu de virement administratifs associés.
*   **`audit_logs`** : Journaux de traçabilité immuables des opérations de modération, d'approbation financière et d'administration système.

*La spécification structurelle complète des collections et types de données TypeScript associés est archivée sous `/docs/architecture/FIRESTORE_SCHEMA.md`.*

---

### 5.3 Inventaire Condensé des Routes d'API v1

Tous les appels d'interfaces s'effectuent sous le préfixe unifié `/api/v1/` :

*   **Authentification (`/api/v1/auth`) :**
    *   `POST /api/v1/auth/request-otp` : Initie l'inscription logistique et l'envoi d'OTP par SMS.
    *   `POST /api/v1/auth/verify-otp` : Vérifie l'OTP saisi et authentifie l'utilisateur.
    *   `POST /api/v1/auth/heal-admin` : Mise à niveau de session et attribution des privilèges d'administration après vérification d'habilitation sécurisée côté serveur.
*   **Catalogue Articles (`/api/v1/products`) :**
    *   `GET /api/v1/products` : Consultation facettée avec filtres Wilayas et budgets.
    *   `POST /api/v1/products` : Publication de fiches produits avec poids d'expédition obligatoire.
*   **Transactions & Ventes (`/api/v1/orders`) :**
    *   `POST /api/v1/orders/checkout` : Validation de panier sous transaction ACID et séquestre financier.
    *   `POST /api/v1/orders/:orderId/returns` : Enregistrement de procédure de retour conforme de marchandises.
*   **Médiation & Litiges (`/api/v1/disputes`) :**
    *   `POST /api/v1/disputes` : Ouverture de dossier et verrouillage des fonds financiers associés.
    *   `POST /api/v1/admin/disputes/:disputeId/arbitrate` : Clôture financière du dossier selon verdict de l'administrateur.
*   **Versements CCP/RIB (`/api/v1/payouts`) :**
    *   `POST /api/v1/payouts` : Formulation de demande de retrait sur solde disponible de revenus.

*La documentation exhaustive des paramètres de requêtes, structures de réponses et codes d'erreurs est archivée sous `/docs/api/API_REFERENCE.md`.*

---

## PARTIE VI : PLAN DE SAUVEGARDE, RGPD ALGÉRIE & MONITORING

### 6.1 Plan de Sauvegarde de la Base NoSQL & PRA d'Urgence
*   **Politique de Sauvegarde (DRP) :** Export complet quotidien à 02h00 GMT+1 de la base NoSQL Firestore vers un bucket Google Cloud Storage redondant multizone. Les instantanés (Snapshots) sont conservés pendant une durée immuable de 30 jours.
*   **Garanties de Reprise d'Activité :**
    *   *Perte de Données Maximale Admissible (RPO) :* 24 heures maximum d'activité.
    *   *Temps de Restauration Optimal (RTO) :* Reprise d'activité nominale établie en moins de 30 minutes via commande d'import asynchrone Firestore.

### 6.2 Conformité Juridique Algérienne (Lois n° 18-07 et n° 18-05)
Olmart s'engage dans un respect rigoureux et absolu du cadre législatif régissant le commerce numérique et la protection des citoyens en République Algérienne :

#### 6.2.1 Protection des Données à Caractère Personnel (Loi n° 18-07)
*   **Consentement Explicite & Finalité :** Lors de l'inscription par OTP, l'utilisateur consent expressément au traitement de ses données pour le traitement des commandes. Aucune revente de données n'est tolérée.
*   **Droit d'Oubli & Anonymisation :** Les acheteurs inactifs de plus de 3 ans voient leurs informations d'identité purgées de nos bases de données actives. Les données de facturation d'achat sont archivées de manière isolée pendant 10 ans pour se conformer aux prescriptions du Code de commerce algérien.
*   **Instruction de Sécurité :** Toutes les données de dossiers KYC des marchands (CNI, RC, NIF) sont cryptées au repos (AES-256) sur des compartiments de stockage privés sécurisés et inaccessibles au public, puis détruites un an après la cessation d'activité.

#### 6.2.2 Réglementation du Commerce Électronique (Loi n° 18-05)
Afin de se conformer aux directives de la Loi n° 18-05, Olmart applique les protocoles techniques et opérationnels suivants :
*   **Droit de Rétractation Algérien :** L'acheteur dispose d'un délai légal de quatre (4) jours ouvrables pour retourner tout produit non conforme ou défectueux, à compter de la date de livraison. Le séquestre de 72h d'Olmart s'aligne de manière optimale avec cette protection légale.
*   **Génération Obligatoire de Factures Électroniques :** Le serveur Express d'Olmart génère à chaque validation de commande un reçu immuable contenant l'identification complète du vendeur (NIF/RC), la désignation du produit, et le taux de TVA appliqué, assurant la traçabilité fiscale requise par l'administration algérienne.
*   **Restrictions du Catalogue de Vente :** Le catalogue filtre et bloque de manière stricte toute tentative de publication de produits interdits au commerce en ligne (médicaments, tabac, services financiers ou produits non homologués par les ministères compétents).
*   **Hébergement & Souveraineté :** Les serveurs et sauvegardes répliqués sur Google Cloud respectent les contraintes de localisation grâce à une liaison chiffrée de bout en bout et un archivage local chez notre partenaire d'infrastructure national.

### 6.3 Monitoring Technique, Logs Unifiés & Runbook d'Incidents
*   **Standard de Logging d'Entreprise Olmart :** Pour faciliter le traitement automatisé des métadonnées, toutes les sorties de console serveur Express doivent respecter rigoureusement le formatage unifié suivant :
    *   🟢 `[Olmart Gateway] 🚀 Booting HTTP Server...` (Port 3000)
    *   🟢 `[Firebase Admin] 🔐 Admin SDK Initialized for Project: [ID]`
    *   🟢 `[Firestore Core] 🟢 Connected and mapped Named Database: [ID]`
    *   ⚙️ `[Olmart Workers] ⚡ Product Publisher Worker active.`
    *   ⚠️ `[Deprecation Warning] ⚠️ Legacy endpoint accessed: [URL]. Migrate to /api/v1`
    *   ❌ `[Nom du Module] ❌ Error description`
*   **Seuils Critiques d'Alerte :** Un incident de classe 1 (Notification d'urgence aux d'astreintes par Webhook et e-mail) est émis si :
    1. Le ratio d'erreurs HTTP 5xx dépasse **1%** sur 5 minutes glissantes.
    2. La latence moyenne d'appel réseau des API v1 excède **200ms**.
    3. Le taux d'échec d'acheminement SMS OTP d'Algérie s'élève au-delà de **15%**.

*Le runbook d'intervention, le dictionnaire détaillé des données collectées, et le dictionnaire d'incidents d'exploitation sont archivés sous `/docs/operation/OPERATIONS.md`.*

---

## PARTIE VII : ROADMAP TECHNIQUE & INDEX DOCUMENTAIRE

### 7.1 Registre abrégé des Décisions d'Architecture (ADR)
Pour assurer la maintenabilité à long terme de la plateforme, l'architecture logicielle d'Olmart repose sur des choix technologiques éprouvés, documentés et figés :
1.  **Usage de Firestore & Express.js (ADR 001) :** Répond de manière native à l'iframe de prévisualisation (en éliminant le blocage des cookies tiers grâce à l'authentification par en-tête d'API JWT explicite) et garantit la cohérence des finances par transactions ACID.
2.  **Rendu avec React, Vite & Tailwind CSS (ADR 002) :** Garantit une excellente vélocité de rendu de l'interface bilingue (Français/Arabe) sur les réseaux de télécommunication mobiles algériens grâce au Tree-shaking de Vite et au style hautement minifié de Tailwind CSS.

*Le registre historique et les justifications scientifiques des choix technologiques sont consultables sous `/docs/adr/ADR_INDEX.md`.*

---

### 7.2 Plan de Route d'Évolution Technique d'Olmart (Roadmap)

L'évolution d'Olmart s'articule autour de trois phases de déploiement technologique majeures d'ici à 2028 :

```
      [ V1.0 - PROTOTYPE INDUSTRIEL ] (Présent)
                    │
                    ▼
     [ V2.0 - INTÉGRATION BANCAIRE NATIONALE ] (Q1 2027)
                    │
                    ├─► Intégration de la passerelle de paiement d'Algérie (CIB / Edahabia)
                    ├─► Raccordement des API logistiques de livraison (Yassir Logistique, Yalidine)
                    └─► Remplacement de l'OTP SMS par authentification biométrique d'application
                    │
                    ▼
      [ V3.0 - ECOSYSTEME TOTAL & INTERNATIONAL ] (2028)
                    │
                    ├─► Traduction intégrale en Tamazight (Tifinagh) du dictionnaire d'interface
                    ├─► Migration de la passerelle d'API monolithique Express vers des Microservices
                    └─► Déploiement d'applications mobiles natives (iOS / Android Flutter)
```

---

### 7.3 Index d'Orientation de la Suite Documentaire d'Olmart

Pour guider les ingénieurs d'exploitation, les développeurs, et le personnel de support d'Olmart dans la consultation du corpus documentaire, utilisez l'index d'orientation suivant :

1.  **Pour toute recherche de spécification de base de données (NoSQL, types TypeScript, index) :**  
    👉 Consultez le document de référence : `/docs/architecture/FIRESTORE_SCHEMA.md`
2.  **Pour toute recherche sur la conception, les paramètres ou les exemples de réponses d'API v1 :**  
    👉 Consultez le document de référence : `/docs/api/API_REFERENCE.md`
3.  **Pour l'intervention en cas d'incident de production, le PRA ou l'audit RGPD algérien (Loi 18-07) :**  
    👉 Consultez le document de référence : `/docs/operation/OPERATIONS.md`
4.  **Pour comprendre ou justifier l'usage d'une brique technologique d'infrastructure (React, Firebase, etc.) :**  
    👉 Consultez le registre de décision : `/docs/adr/ADR_INDEX.md`
5.  **Pour l'aide à l'utilisation courante des comptes (Acheteurs, Vendeurs, Administrateurs) :**  
    👉 Utilisez le présent document comme Manuel Maître : `/GUIDE_UTILISATEUR_OLMART_FR.md`
