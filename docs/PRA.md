# Plan de Reprise d'Activité (PRA) - Olmart

## 1. Objectifs
- **RTO (Recovery Time Objective)** : 4 heures (temps maximum d'interruption toléré)
- **RPO (Recovery Point Objective)** : 24 heures (perte de données maximum tolérée)

## 2. Sauvegardes
- **Base de données (Firestore)** : Des exports automatiques quotidiens sont configurés via Cloud Scheduler (`gcloud scheduler jobs create http firestore-backup ...`) et Cloud Functions, stockés dans Cloud Storage (classe Nearline).
- **Fichiers (Cloud Storage)** : Versioning activé sur les buckets principaux pour récupérer les fichiers écrasés ou supprimés.
- **Rétention** : Les sauvegardes Firestore sont conservées pendant 30 jours.

## 3. Procédure de Restauration
En cas de perte de données ou de corruption majeure :
1. Identifier la dernière sauvegarde saine dans le bucket Cloud Storage dédié aux backups.
2. Utiliser la commande d'import Firestore :
   ```bash
   gcloud firestore import gs://[BUCKET_NAME]/[BACKUP_PREFIX]
   ```
3. Vérifier l'intégrité des données restaurées via le dashboard admin (Health Check).
4. Informer les utilisateurs si le RPO de 24h a entraîné des pertes de commandes.

## 4. Tests et Drills
- Un exercice de restauration (drill) doit être effectué **tous les mois** sur un environnement de staging dédié.
- La date et le résultat du drill doivent être consignés dans le registre de sécurité.
