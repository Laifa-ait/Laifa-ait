import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { safeLogger } from "../utils/logger";

export enum FirebaseInitState {
  INITIALIZING = "INITIALIZING",
  READY = "READY",
  FAILED = "FAILED",
}

export let firebaseInitState: FirebaseInitState = FirebaseInitState.INITIALIZING;
export let firebaseInitError: string | null = null;

export const getFirebaseInitState = (): FirebaseInitState => firebaseInitState;
export const getFirebaseInitError = (): string | null => firebaseInitError;
export const isFirebaseReady = (): boolean => firebaseInitState === FirebaseInitState.READY && !!db;

/**
 * Test helper to simulate Firebase initialization states during unit & resilience tests.
 */
export const setFirebaseInitStateForTesting = (state: FirebaseInitState, error: string | null = null): void => {
  firebaseInitState = state;
  firebaseInitError = error;
};

// Load Firebase Config
export let firebaseConfig: Record<string, string | number | boolean> = {};

const logDev = (msg: string) => {
  if (process.env.NODE_ENV !== "production") {
    safeLogger.debug(msg);
  }
};

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } else {
    logDev(
      "[Firebase Config] ℹ️ firebase-applet-config.json is absent. Admin SDK initialization active."
    );
  }
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  safeLogger.error("[Firebase Config] ❌ Unable to parse firebase-applet-config.json", { err: message });
  firebaseInitState = FirebaseInitState.FAILED;
  firebaseInitError = `Invalid firebase-applet-config.json: ${message}`;
}

// Initialize Firebase Admin
logDev("================================================================================");
logDev("         🟢 INITIALIZING OLMART ENTERPRISE ENGINE (FIREBASE SERVICES)            ");
logDev("================================================================================");

// Prioritize Environment Project ID as it is guaranteed to match the runtime environment
const envProjectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT;
const configProjectId = typeof firebaseConfig.projectId === "string" ? firebaseConfig.projectId : undefined;
const targetProjectId = envProjectId || configProjectId;

logDev(`[Firebase Admin] Environment Project ID:  ${envProjectId || "None"}`);
logDev(`[Firebase Admin] Config Project ID:       ${configProjectId || "None"}`);
logDev(`[Firebase Admin] Effective Target ID:     ${targetProjectId || "None"}`);

try {
  if (admin.apps.length > 0) {
    const existingApp = admin.app();
    logDev(`[Firebase Admin] 🔄 Reusing existing active application: [${existingApp.name}]`);
  } else {
    const runtimeProjectId = targetProjectId;
    if (!runtimeProjectId) {
      safeLogger.warn(
        "[Firebase Admin] ⚠️ runtimeProjectId is undefined. Provide FIREBASE_PROJECT_ID in environment."
      );
    }
    logDev(`[Firebase Admin] ⚙️ Initializing Admin SDK for Project: [${runtimeProjectId || "undefined"}]`);

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      logDev("[Firebase Admin] 🔐 Initializing using explicit Service Account credentials.");
      let serviceAccount: admin.ServiceAccount | undefined;
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        safeLogger.error("[Firebase Admin] ❌ FIREBASE_SERVICE_ACCOUNT_KEY contains invalid JSON", { err: message });
        firebaseInitState = FirebaseInitState.FAILED;
        firebaseInitError = `Invalid FIREBASE_SERVICE_ACCOUNT_KEY: ${message}`;
      }

      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: runtimeProjectId,
        });
      } else if (firebaseInitState !== FirebaseInitState.FAILED) {
        admin.initializeApp({ projectId: runtimeProjectId });
      }
    } else {
      admin.initializeApp({
        projectId: runtimeProjectId,
      });
    }
  }
} catch (e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  safeLogger.error("[Firebase Admin] ❌ Initialization failed", { err: message });
  firebaseInitState = FirebaseInitState.FAILED;
  firebaseInitError = message;
}

export let db: admin.firestore.Firestore;
const setupFirestore = () => {
  if (firebaseInitState === FirebaseInitState.FAILED) {
    safeLogger.warn("[Firestore Core] ⚠️ Skipping Firestore setup because Firebase Admin SDK initialization failed.");
    return;
  }

  try {
    const adminApp = admin.app();
    const configDatabaseId =
      process.env.FIREBASE_DATABASE_ID ||
      process.env.VITE_FIREBASE_DATABASE_ID ||
      (typeof firebaseConfig.firestoreDatabaseId === "string" ? firebaseConfig.firestoreDatabaseId : "ai-studio-217f6d79-c758-4e14-845d-737228cd3915");

    logDev(`[Firestore Core] 📂 Mapping Firestore instance for Project: [${adminApp.options.projectId || targetProjectId}]`);

    // Attempt with named database if provided and not "(default)"
    if (configDatabaseId && configDatabaseId !== "(default)") {
      logDev(`[Firestore Core] 🔗 Database ID specified: [${configDatabaseId}]`);
      try {
        const testDb = getFirestore(adminApp, configDatabaseId);
        db = testDb;
        logDev(`[Firestore Core] 🟢 Connected and mapped Named Database: [${configDatabaseId}]`);
      } catch (dbErr: unknown) {
        const dbMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
        safeLogger.error("[Firestore Core] ❌ Named DB mapping failed, falling back to default", { err: dbMsg });
        db = adminApp.firestore();
      }
    } else {
      db = adminApp.firestore();
      logDev("[Firestore Core] 🟢 Mapped default database instance.");
    }

    firebaseInitState = FirebaseInitState.READY;
    firebaseInitError = null;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    safeLogger.error("[Firestore Core] ❌ Critical mapping failure", { err: message });
    firebaseInitState = FirebaseInitState.FAILED;
    firebaseInitError = message;
  }
};

/**
 * Verifies Firestore database connectivity with an application-level deadline safeguard.
 *
 * NOTE ON FIRESTORE SDK CANCELLATION LIMITATION:
 * The Firebase Admin Firestore SDK (@google-cloud/firestore) does not support per-query AbortSignal cancellation tokens.
 * This application-level timeout safeguard ensures the Node.js event loop and HTTP handlers never block indefinitely
 * when Firestore encounters network partitions or degraded backend latency.
 */
export const verifyAndFixDb = async (timeoutMs = 6000): Promise<void> => {
  if (!db || firebaseInitState !== FirebaseInitState.READY) {
    throw new Error(`Firestore Admin SDK DB is not ready (State: ${firebaseInitState}). Error: ${firebaseInitError || "none"}`);
  }
  
  // Try a tiny read to check connectivity with strict deadline protection
  let timer: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`[Firestore Core] Verification ping exceeded deadline of ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    const readPromise = db.collection("products").limit(1).get();
    await Promise.race([readPromise, timeoutPromise]);
    logDev("Firestore: Connection verified.");
  } finally {
    if (timer) clearTimeout(timer);
  }

  // Migrations: strictly decoupled from standard web startup
  if (process.env.RUN_MIGRATIONS === "true") {
    try {
      logDev("Triggering category migration dynamically...");
      const { migrateCategories } = await import("../../scripts/migrate-categories");
      await migrateCategories(db);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      safeLogger.error("Failed to run dynamic migration 'migrate-categories'", { err: message });
    }
  }
};

setupFirestore();
logDev("================================================================================");

export { admin };
