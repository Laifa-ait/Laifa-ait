#!/bin/bash
# Setup Firestore Scheduled Backup
# Requiert gcloud CLI configuré

PROJECT_ID="votre-project-id"
BUCKET_NAME="${PROJECT_ID}-firestore-backups"

# 1. Créer le bucket (Nearline, rétention 30 jours)
gcloud storage buckets create gs://${BUCKET_NAME} --project=${PROJECT_ID} --default-storage-class=NEARLINE --location=europe-west1
gcloud storage buckets update gs://${BUCKET_NAME} --lifecycle-file=lifecycle-30-days.json

# lifecycle-30-days.json:
# {
#   "rule": [
#     {
#       "action": {"type": "Delete"},
#       "condition": {"age": 30}
#     }
#   ]
# }

# 2. Configurer Cloud Scheduler (tous les jours à 2h du matin)
gcloud scheduler jobs create http firestore-backup \
  --schedule="0 2 * * *" \
  --uri="https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default):exportDocuments" \
  --message-body="{\"outputUriPrefix\": \"gs://${BUCKET_NAME}\"}" \
  --oauth-service-account-email="votre-service-account@${PROJECT_ID}.iam.gserviceaccount.com" \
  --headers="Content-Type=application/json" \
  --project=${PROJECT_ID}
