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

const isStringAndValid = (val: unknown): val is string => 
  typeof val === "string" && 
  val.trim().length > 0 && 
  val !== "undefined" && 
  val !== "null" && 
  !val.includes("YOUR_") && 
  !val.includes("your_");

const rawApiKey = import.meta.env?.VITE_FIREBASE_API_KEY;
const rawAuthDomain = import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN;
const rawProjectId = import.meta.env?.VITE_FIREBASE_PROJECT_ID;
const rawStorageBucket = import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET;
const rawMessagingSenderId = import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID;
const rawAppId = import.meta.env?.VITE_FIREBASE_APP_ID;

const apiKey = (isStringAndValid(rawApiKey) && rawApiKey.trim().startsWith("AIzaSy"))
  ? rawApiKey.trim()
  : "AIzaSyCsGYo1B0vavSQbKdFvu0-7jfzILFHvejA";

const authDomain = isStringAndValid(rawAuthDomain) ? rawAuthDomain.trim() : "original-micron-7sjh2.firebaseapp.com";
const projectId = isStringAndValid(rawProjectId) ? rawProjectId.trim() : "original-micron-7sjh2";
const storageBucket = isStringAndValid(rawStorageBucket) ? rawStorageBucket.trim() : "original-micron-7sjh2.firebasestorage.app";
const messagingSenderId = isStringAndValid(rawMessagingSenderId) ? rawMessagingSenderId.trim() : "76420360525";
const appId = (isStringAndValid(rawAppId) && rawAppId.includes(":")) ? rawAppId.trim() : "1:76420360525:web:d6781ea77ef0c2257aef04";

const clientConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredVars = ["VITE_FIREBASE_API_KEY", "VITE_FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_PROJECT_ID"];
if (!isTestEnv) {
  for (const key of requiredVars) {
    const val = import.meta.env?.[key];
    if (!isStringAndValid(val)) {
      safeLogger.warn("[Firebase Client] ⚠️ Variable d'environnement manquante ou invalide", { key });
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
  } else {
    const errorMsg = errorObj?.message || String(err);
    safeLogger.error("[Firebase Client] ❌ Échec critique de l'initialisation Firebase, fallback actif pour éviter l'écran blanc", { err: errorMsg });
    app = (getApps()[0] || {}) as FirebaseApp;
    auth = {} as Auth;
    storage = {} as FirebaseStorage;
    db = {} as Firestore;
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

