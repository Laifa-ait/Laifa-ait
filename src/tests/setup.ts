// Set default Firebase environment variables for tests before any other module imports firebase-admin
process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "ai-studio-217f6d79-c758-4e14-845d-737228cd3915";
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || "ai-studio-217f6d79-c758-4e14-845d-737228cd3915";
process.env.GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || "ai-studio-217f6d79-c758-4e14-845d-737228cd3915";
process.env.FIREBASE_DATABASE_ID = process.env.FIREBASE_DATABASE_ID || "ai-studio-217f6d79-c758-4e14-845d-737228cd3915";

// Force local emulator connections during test runs to guarantee zero production connections
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085";
process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || "127.0.0.1:9199";
