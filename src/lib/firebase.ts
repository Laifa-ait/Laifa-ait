import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
} from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFirestore, Firestore } from "firebase/firestore";
import { safeLogger } from "../utils/logger";

const isTestEnv =
  (typeof process !== "undefined" && process.env?.NODE_ENV === "test") ||
  (typeof import.meta !== "undefined" && import.meta.env?.MODE === "test");

const clientConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || (isTestEnv ? "fake-test-key" : ""),
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || (isTestEnv ? "localhost" : ""),
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || (isTestEnv ? "test-project" : ""),
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || (isTestEnv ? "test-project.appspot.com" : ""),
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || (isTestEnv ? "1234567890" : ""),
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || (isTestEnv ? "1:1234567890:web:abcdef" : ""),
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredVars = ["VITE_FIREBASE_API_KEY", "VITE_FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_PROJECT_ID"];
if (!isTestEnv) {
  for (const key of requiredVars) {
    if (!import.meta.env?.[key]) {
      safeLogger.warn("[Firebase Client] ⚠️ Variable d'environnement manquante", { key });
    }
  }
}

let app: FirebaseApp;
let auth: Auth;
let storage: FirebaseStorage;
let db: Firestore;

try {
  app = getApps().length === 0 ? initializeApp(clientConfig) : getApp();
  auth = getAuth(app);
  storage = getStorage(app);
  const customDbId = import.meta.env?.VITE_FIREBASE_DATABASE_ID;
  db = customDbId && customDbId !== "(default)" ? getFirestore(app, customDbId) : getFirestore(app);
} catch (err: unknown) {
  const errorObj = err as { code?: string; message?: string };
  if (errorObj?.code === "app/duplicate-app") {
    app = getApp();
    auth = getAuth(app);
    storage = getStorage(app);
    const customDbId = import.meta.env?.VITE_FIREBASE_DATABASE_ID;
    db = customDbId && customDbId !== "(default)" ? getFirestore(app, customDbId) : getFirestore(app);
  } else if (isTestEnv) {
    safeLogger.warn("[Firebase Client] ⚠️ Initialisation Firebase en mode test tolérée avec fallback", { err: String(err) });
    app = (getApps()[0] || {}) as FirebaseApp;
    auth = {} as Auth;
    storage = {} as FirebaseStorage;
    db = {} as Firestore;
  } else {
    const errorMsg = errorObj?.message || String(err);
    safeLogger.error("[Firebase Client] ❌ Échec critique de l'initialisation Firebase", { err: errorMsg });
    throw new Error(`[Firebase Client] Échec d'initialisation : ${errorMsg}`);
  }
}

export { app, auth, storage, db };

// FINOPS FIX: Emulators disabled for AI Studio preview environment
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Auth helpers

// Firestore Error Handler
export const OperationType = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LIST: "list",
  GET: "get",
  WRITE: "write",
} as const;
export type OperationType = (typeof OperationType)[keyof typeof OperationType];

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  safeLogger.error("Firestore Error", { errInfo: JSON.stringify(errInfo) });
  throw new Error(JSON.stringify(errInfo));
}

// Timeout helper to avoid indefinite hanging on slow connection
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 15000,
  errorMsg = "La requête de base de données a expiré. Veuillez vérifier votre connexion."
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMsg));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

