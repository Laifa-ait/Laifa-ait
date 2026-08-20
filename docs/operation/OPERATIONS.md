# 📙 DOCUMENTATION DES OPÉRATIONS, DU MONITORING ET DE LA GOUVERNANCE RGPD - OLMART

**Version de référence :** 4.1.0  
**Classification :** Manuel d'Exploitation et de Conformité Juridique  
**Territoire d'application :** Algérie (58 Wilayas)

---

## 📌 1. PLAN DE SAUVEGARDE ET DE CONTINUITÉ D'ACTIVITÉ (PRA / DRP)

Pour parer à toute défaillance matérielle, sinistre d'infrastructure ou erreur de manipulation, la plateforme Olmart déploie une stratégie de résilience à chaud sur Google Cloud Platform (GCP).

### 1.1 Politique de Sauvegarde de la Base NoSQL Firestore
*   **Fréquence de Backup :** Un instantané (Snapshot) complet et cohérent de l'ensemble de la base de données Firestore est exporté de façon automatisée toutes les **24 heures** (à 02h00, heure d'Alger, GMT+1).
*   **Mécanisme de Sauvegarde :** Les backups utilisent l'API Cloud Firestore Export déclenchée par un script Cron serverless dans Google Cloud Scheduler vers un bucket de stockage Cloud Storage sécurisé multizone.
*   **Temps de Rétention :** Les snapshots quotidiens sont conservés de manière immuable pendant **30 jours**. À l'expiration du délai, la politique de cycle de vie Cloud Storage procède à l'effacement définitif pour rationaliser les volumes de stockage.
*   **Durée d'Indisponibilité Maximale Tolérée (RTO) :** En cas de corruption totale de la base de données, la restauration du système vers une nouvelle instance Firestore est garantie en moins de **30 minutes**.
*   **Perte de Données Maximale Tolérée (RPO) :** En cas de sinistre physique, la perte de données est strictement bornée à un maximum de **24 heures** d'activité.

### 1.2 Protocole de Restauration d'Urgence
En cas d'incident critique, l'ingénieur d'exploitation exécute la commande de restauration de l'instantané $T_{-1}$ via la console d'administration ou l'outil gcloud CLI :
```bash
gcloud firestore import gs://olmart-backups-prod/2026-07-17T02:00:00/
```

---

## 📌 2. SÉCURISATION DES PROCESSUS ET RÉSILIENCE DES INCIDENTS (RUNBOOK)

Le tableau d'intervention ci-dessous prescrit de manière stricte les mesures correctives à déployer lors d'incidents critiques en production :

| Type d'Incident | Niveau | Cause Racinaire Probable | Action Immédiate de l'Ingénieur / Système |
| :--- | :---: | :--- | :--- |
| **Échec Virement Financier (Payout)** | 🔴 Critique | Solde disponible insuffisant / RIB incorrect | Blocage transactionnel de la demande, reversement des fonds sur le portefeuille disponible, notification d'échec par e-mail. |
| **Panne Connexion Firestore** | 🔴 Critique | Incident d'authentification ou quota dépassé | Déclenchement automatique du **Circuit Breaker** applicatif, redirection des requêtes vers le cache local et affichage d'une page de maintenance gracieuse. |
| **Rupture Passerelle SMS OTP** | 🟡 Majeur | Indisponibilité du service tiers ou blocage opérateur | Activation de la passerelle de secours secondaire ou proposition de validation par courrier électronique de secours (Heal-Session). |
| **Panne Arbitrage IA (Gemini API)** | 🟡 Majeur | Quota d'appels ou timeout sur le modèle | Mise en file d'attente de la demande, traitement différé par tâche planifiée (Retry) et notification de reprise à l'administration d'Olmart. |
| **Tentative d'Attaque IDOR** | 🔴 Critique | Altération d'UID dans les paramètres d'URL client | Interception immédiate par le middleware de sécurité, génération d'un log d'infraction de classe `SECURITY_BREACH`, et blocage du compte. |
| **Blocage Serveur SMTP (Newsletter)** | 🟡 Majeur | Envoi de courriels en masse sans découpage (Spam limit) | Suspension immédiate de la file, activation du régulateur par lots (Batching de 50 mails/min), et notification de réconciliation. |

---

## 📌 3. PROTECTION DES DONNÉES ET CONFORMITÉ JURIDIQUE ALGÉRIENNE (LOIS N° 18-07 ET N° 18-05)

Bien que calquée sur les standards du RGPD européen, la plateforme Olmart est strictement auditée et conforme à la **Loi algérienne n° 18-07 relative à la protection des personnes physiques dans le traitement des données à caractère personnel**, ainsi qu'à la **Loi algérienne n° 18-05 relative au commerce électronique**.

### 3.1 Dictionnaire des Données Stockées
La plateforme collecte et restreint l'usage des données suivantes :
1.  **Données d'Identité :** Nom, prénom, courrier électronique, numéro de téléphone mobile.
2.  **Données Logistiques :** Adresses physiques d'expédition, coordonnées géographiques des Wilayas de livraison.
3.  **Données Financières :** Relevés de RIB et de comptes postaux CCP des marchands enregistrés.
4.  **Données de Connexion :** Historiques des adresses IP de connexion pour la détection des fraudes.

### 3.2 Durée et Politique de Conservation des Données
*   **Données des Acheteurs :** Les profils inactifs sont automatiquement anonymisés ou supprimés au bout de **3 ans** d'inactivité totale.
*   **Données des Transactions (Facturation) :** Conservées de manière légale pendant **10 ans** conformément au Code de commerce algérien.
*   **Justificatifs KYC Marchands (Identité, RC, NIF) :** Conservés pendant toute la durée d'activité de la boutique et détruits **1 an** après la clôture définitive de celle-ci.

### 3.3 Droits d'Accès et d'Effacement (Droit à l'Oubli)
Chaque utilisateur de la plateforme peut formuler une demande de consultation ou d'effacement de ses données personnelles depuis son espace profil ou en adressant un e-mail à `privacy@olmart.dz`. L'effacement s'effectue sous 48 heures de manière atomique sur toutes nos collections.

### 3.4 Dispositions opérationnelles relatives au commerce électronique (Loi n° 18-05)
Afin de préserver la légalité des échanges commerciaux en Algérie, Olmart applique strictement les mesures suivantes :
*   **Droit de rétractation de 4 jours :** L'acheteur dispose d'un droit de retour de quatre (4) jours ouvrables en cas de non-conformité. Le séquestre de 72h mis en œuvre par Olmart garantit la sécurité financière de cette procédure (fonds de séquestre bloqués).
*   **Archivage des transactions électroniques :** Toutes les commandes validées génèrent une facture scellée numériquement, téléchargeable et archivée de façon immuable pour servir de preuve légale.
*   **Restriction d'exposition :** Algorithmes automatisés de filtrage de mots-clés interdisant la mise en vente de produits exclus du commerce en ligne par la loi algérienne.

---

## 📌 4. MONITORING, MÉTRIQUES CLÉS ET OBSERVABILITÉ EN DIRECT

Afin de garantir une haute disponibilité (SLA > 99.95%), Olmart déploie des outils de monitoring en continu.

### 4.1 Métriques Techniques sous Surveillance
*   **Erreurs HTTP (Ratio 5xx / 4xx) :** Une alerte critique est émise si le taux d'erreurs dépasse **1%** sur une période de 5 minutes consécutives.
*   **Temps de Réponse API (Latency) :** Le temps moyen de réponse sur `/api/v1/*` doit rester inférieur à **200ms**. Les anomalies de temps de traitement supérieures à **1500ms** (Percentile p99) sont tracées dans le gestionnaire d'exceptions.
*   **Taux d'Échec de l'Authentification OTP :** Un taux d'échec supérieur à **15%** déclenche une vérification de la qualité d'acheminement des SMS des opérateurs d'Algérie (Mobilis, Djezzy, Ooredoo).

### 4.2 Canaux de Notification d'Incidents
Dès le franchissement d'un seuil critique, la plateforme notifie automatiquement les équipes d'astreinte technique d'Olmart par les canaux unifiés suivants :
1.  **Alerting Email :** Notification immédiate avec détails de la trace et volumétrie d'erreur.
2.  **Webhook de Messagerie d'Équipe :** Message structuré sur le canal d'administration `#olmart-ops-alerts` avec diagnostic d'incident.

### 4.3 Standard de Logging d'Entreprise Olmart (Formatage Unifié)
Pour faciliter la centralisation, le filtrage et le traitement automatique des métadonnées de diagnostic (via Google Cloud Logging ou des outils d'observabilité tiers), toutes les sorties console émises par le serveur Express d'Olmart obéissent strictement à un formatage prédéterminé :

*   🟢 **Boot HTTP :** `[Olmart Gateway] 🚀 Booting HTTP Server...` (Liaison au port 3000)
*   🟢 **Initialisation Admin SDK :** `[Firebase Admin] 🔐 Admin SDK Initialized for Project: [ID]`
*   🟢 **Connexion Firestore :** `[Firestore Core] 🟢 Connected and mapped Named Database: [ID]`
*   ⚙️ **Tâches en Arrière-Plan :** `[Olmart Workers] ⚡ Product Publisher Worker active.`
*   ⚠️ **Alerte Dépréciation :** `[Deprecation Warning] ⚠️ Legacy endpoint accessed: [URL]. Migrate to /api/v1`
*   ❌ **Erreur d'Exécution :** `[Nom du Module] ❌ Error description`

*Les scripts d'exploitation s'appuient sur ces préfixes constants pour remonter des indicateurs d'anomalies de manière asynchrone.*
