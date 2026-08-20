# 📙 REGISTRE DES DÉCISIONS D'ARCHITECTURE (ADR) - OLMART

Ce document consigne les choix structurants d'architecture logicielle de la plateforme Olmart, leurs justifications technologiques et leurs conséquences opérationnelles.

---

## 📌 ADR 001 : CHOIX DE LA BASE DE DONNÉES FIRESTORE ET D'EXPRESS NODE.JS

### Statut
**Accepté & Validé**

### Contexte
La marketplace Olmart cible un déploiement national en Algérie avec des contraintes d'infrastructure de réseau variables et la nécessité d'absorber des pics d'affluence soudains (ventes flash promotionnelles) sans surcoût d'exploitation massif.

### Décisions
1.  **Usage de Google Cloud Firestore (Mode Natif) :** Base de données NoSQL serverless offrant une scalabilité horizontale automatique et une synchronisation en temps réel native pour les notifications de commandes et de litiges.
2.  **Usage d'Express.js (Node.js/TypeScript) :** Serveur d'API v1 robuste faisant office de passerelle d'accès sécurisée (Gateway), de gestion de la logique métier critique (transactions ACID), et de masquage des clés privées et secrets (Firebase Admin SDK, Gemini API).

### Justifications Techniques
*   **Résilience Iframe :** En centralisant les requêtes sur Express via JWT explicite (`Authorization: Bearer <token>`), on contourne le blocage des cookies tiers propre aux navigateurs modernes dans les contextes d'iframe.
*   **Garantie ACID :** Firestore propose des fonctions de transactions ACID atomiques d'une grande simplicité permettant de verrouiller les inventaires de stocks physiques et les soldes de portefeuilles, éliminant les risques de fraudes financières et de doubles dépenses.

### Conséquences
*   Le client React ne communique jamais directement avec Firestore pour les opérations d'écritures, déléguant cette responsabilité à l'API Express v1.
*   Nécessite d'isoler strictement les SDK : `firebase-admin` réside exclusivement côté serveur, tandis que `firebase/app` et `firebase/auth` résident exclusivement côté client React.

---

## 📌 ADR 002 : ADOPTION DE REACT, VITE ET TAILWIND CSS POUR LE RENDU FRONTEND

### Statut
**Accepté & Validé**

### Contexte
L'interface utilisateur de la marketplace doit s'afficher de manière extrêmement véloce, y compris sur les réseaux mobiles 3G/4G algériens, tout en offrant une expérience interactive, fluide, et entièrement bilingue.

### Décisions
1.  **React 18+ (Vite) :** Framework de composants déclaratifs offrant un temps de chargement initial minimal et une modularité élevée des composants graphiques (limités à 250 lignes par fichier).
2.  **Tailwind CSS :** Moteur de style utilitaire pour un design sur mesure et performant, éliminant les lenteurs associées aux lourdes bibliothèques de composants externes pré-conçues.

### Justifications Techniques
*   **Performance Réseau :** Vite assemble l'application en modules légers avec élimination des codes morts (Tree-shaking). Tailwind CSS génère un fichier de styles minifié extrêmement compact (souvent < 50 Ko en production).
*   **Bilinguisme Intuitif :** La nature de Tailwind CSS permet de permuter dynamiquement la direction du texte (`dir="rtl"` ou `dir="ltr"`) et d'adapter les marges et alignements en fonction de la langue choisie (Français ou Arabe).

### Conséquences
*   Interdiction d'insérer des styles inline ou d'utiliser d'anciennes feuilles de styles CSS classiques. Tout le style doit s'écrire sous forme de classes utilitaires Tailwind CSS.
*   Usage de `motion/react` pour les micro-animations fluides de transitions de pages d'achat et de tableaux de bord.

---

## 📌 ADR 003 : INTÉGRATION DE GEMINI-3.5-FLASH POUR L'ASSISTANCE À L'ARBITRAGE DES LITIGES ET LA MODÉRATION

### Statut
**Accepté & Validé**

### Contexte
La gestion des litiges entre acheteurs et vendeurs (non-conformité, défauts) génère un volume d'interactions textuelles et d'éléments de preuve photographiques qu'un opérateur humain peine à traiter instantanément, créant des goulots d'étranglement opérationnels.

### Décisions
1.  **Utilisation de l'API Gemini (Modèle 3.5-flash) côté serveur :** Analyse sémantique des réclamations et des images jointes pour générer une synthèse objective et impartiale d'aide à la décision.
2.  **Rapport d'Arbitrage Invisible (Strict Confidentiality) :** Consignation du rapport généré par l'IA exclusivement sous l'attribut `aiSummary` de Firestore, visible uniquement de la console d'administration d'Olmart.

### Justifications Techniques
*   **Rapidité d'Analyse (Low Latency) :** Le modèle Gemini-3.5-flash offre un excellent compromis entre temps de latence d'inférence (généralement < 2s) et précision d'interprétation contextuelle de dossiers complexes.
*   **Sécurisation contre le social engineering :** En masquant l'analyse de l'IA aux parties impliquées (acheteur et vendeur), on neutralise tout risque de chantage ou de contournement des règles de la plateforme par des marchands ou acheteurs malveillants.

### Conséquences
*   Nécessité de transiter par une route proxy Express `/api/v1/disputes` pour interroger l'IA afin de masquer de manière absolue la clé d'API `GEMINI_API_KEY` aux navigateurs clients.
*   Conformité réglementaire : Le verdict final d'arbitrage financier reste du ressort exclusif d'un modérateur humain (l'IA ne fait que conseiller), garantissant une surveillance humaine adéquate (Human-in-the-loop).

---

## 📌 ADR 004 : AUTHENTIFICATION BASÉE SUR L'OTP SMS ET MÉCANISME DE CONTOURNEMENT DES RESTRICTIONS DE COOKIES TIERS EN IFRAME (HEAL-SESSION)

### Statut
**Accepté & Validé**

### Contexte
La plateforme Olmart s'exécute dans une iframe de prévisualisation au sein d'AI Studio, un environnement de bac à sable hautement sécurisé où la quasi-totalité des navigateurs modernes (Safari, Chrome, Firefox) rejette par défaut l'écriture et la lecture de cookies tiers, empêchant l'authentification classique par session cookie ou localStorage standard.

### Décisions
1.  **Usage exclusif de numéros de téléphone + OTP SMS** comme mécanisme d'enrôlement et d'accès des acheteurs et marchands en Algérie.
2.  **Mécanisme Heal-Session :** Le serveur d'API génère des jetons JWT à validité courte transmis dans le corps de réponse JSON, tandis que l'application React utilise un intercepteur réseau global pour injecter dynamiquement le jeton reçu dans l'en-tête `Authorization: Bearer <Token>` de chaque requête HTTP.

### Justifications Techniques
*   **Contournement absolu des restrictions d'iframe :** En s'affranchissant totalement des cookies et du stockage persistant inter-domaines pour les requêtes HTTP, le protocole Bearer Token garantit un état d'authentification immuable et fonctionnel dans n'importe quel conteneur de prévisualisation.
*   **Adéquation avec les usages locaux :** En Algérie, le taux d'équipement en smartphone et l'usage des cartes SIM (Mobilis, Djezzy, Ooredoo) surpassent largement l'usage des adresses e-mail pour le grand public.

### Conséquences
*   Nécessité de mettre en œuvre un intercepteur Axios/Fetch côté client React pour intercepter les codes `401 Unauthorized` et déclencher la régénération transparente du jeton sans forcer l'utilisateur à ressaisir un OTP.
*   Protection renforcée côté serveur contre les attaques de force brute sur l'API d'envoi d'OTP (SMS Flooding Rate-Limiter à 3 tentatives par numéro et par heure).

---

## 📌 ADR 005 : MODÈLE FINANCIER PAR SÉQUESTRE DE SÉCURITÉ (ESCROW) ET COMMISSIONNEMENT DYNAMIQUE À DOUBLE PALIER

### Statut
**Accepté & Validé**

### Contexte
La confiance des acheteurs dans les transactions en ligne est un frein historique majeur en Algérie. Les fraudes de livraison (colis vides ou non conformes) imposent d'apporter des garanties absolues aux consommateurs tout en préservant le fonds de roulement des marchands de confiance.

### Décisions
1.  **Mécanisme de Séquestre Transitoire (Escrow) :** Les fonds de chaque commande validée sont conservés en séquestre sur le compte d'Olmart pendant un délai de garde incompressible de **72 heures** (ou jusqu'à confirmation expresse de conformité par l'acheteur).
2.  **Double Balance du Vendeur :** Distinction stricte au niveau du document Firestore `/users/{uid}` entre la "Balance Séquestrée" (fonds en transit) et la "Balance Disponible" (fonds débloqués transférables par CCP).
3.  **Algorithme de Commission à Double Palier :** Le prélèvement de la commission de service interroge en priorité si le vendeur dispose d'un taux préférentiel contractuel spécifique (attribut `commissionRate` dans `/users/{vendeur_uid}`). En l'absence de dérogation, le taux standard global de 10% s'applique par défaut.

### Justifications Techniques
*   **Protection contre le vol de colis :** La libération conditionnelle des fonds neutralise immédiatement l'intérêt pour un vendeur malveillant d'expédier un produit contrefait ou défectueux.
*   **Flexibilité commerciale :** Le double palier de commissionnement permet à l'administration d'ajuster ses marges dynamiquement pour fidéliser de gros volumes d'expédition ou attirer des marques nationales sans modifier le code applicatif.

### Conséquences
*   Toute écriture de virement de balance (transfert de Balance Séquestrée vers Balance Disponible) doit être enveloppée dans une transaction ACID Firestore sécurisée.
*   En cas de litige déclaré avant l'expiration du délai de 72 heures, le compte à rebours est suspendu de manière atomique (la commande passe à l'état `DISPUTED`), gelant les fonds en séquestre jusqu'au verdict d'arbitrage rendu par l'administrateur.

---
