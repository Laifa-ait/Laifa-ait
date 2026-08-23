import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

// Load Firebase Config
export let firebaseConfig: Record<string, string | number | boolean> = {};

const logDev = process.env.NODE_ENV !== "production" ? console.log : function () {};

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
  console.error("[Firebase Config] ❌ Unable to parse firebase-applet-config.json:", message);
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
      console.warn(
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
        console.error("[Firebase Admin] ❌ FIREBASE_SERVICE_ACCOUNT_KEY contains invalid JSON:", message);
      }

      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: runtimeProjectId,
        });
      } else {
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
  console.error("[Firebase Admin] ❌ Initialization failed:", message);
}

export let db: admin.firestore.Firestore;
const setupFirestore = () => {
  try {
    const adminApp = admin.app();
    const configDatabaseId =
      process.env.FIREBASE_DATABASE_ID ||
      process.env.VITE_FIREBASE_DATABASE_ID ||
      (typeof firebaseConfig.firestoreDatabaseId === "string" ? firebaseConfig.firestoreDatabaseId : undefined);

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
        console.error("[Firestore Core] ❌ Named DB mapping failed, falling back to default:", dbMsg);
        db = adminApp.firestore();
      }
    } else {
      db = adminApp.firestore();
      logDev("[Firestore Core] 🟢 Mapped default database instance.");
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Firestore Core] ❌ Critical mapping failure:", message);
  }
};

export const verifyAndFixDb = async () => {
  if (!db) {
    throw new Error("Firestore Admin SDK DB instance is not initialized.");
  }
  // Try a tiny read to check permissions
  await db.collection("products").limit(1).get();
  (process.env.NODE_ENV === "development" ? console.log : function () {})("Firestore: Connection verified.");

  // Category Migration: "TV & Home Cinéma" from "Électronique" to "Électroménager"
  try {
    interface MigrationDocData {
      tv_cinema_migration_done?: boolean;
    }
    interface CategorySettingsDocData {
      hierarchy?: Record<string, Record<string, string[]>>;
      updatedAt?: string;
    }
    interface HomepageCategoryDocData {
      id?: string;
      subCategoryImages?: Record<string, string>;
      updatedAt?: string;
    }

    const migrationsDocRef = db.collection("settings").doc("migrations");
    const migrationsSnap = await migrationsDocRef.get();
    const migrationsData = (migrationsSnap.exists ? migrationsSnap.data() : {}) as MigrationDocData;

    if (migrationsData.tv_cinema_migration_done) {
      (process.env.NODE_ENV === "development" ? console.log : function () {})(
        "Migration 'TV & Home Cinéma' already completed in previous runs. Skipping."
      );
      return;
    }

    (process.env.NODE_ENV === "development" ? console.log : function () {})("Starting 'TV & Home Cinéma' migration in Firestore...");

    // 1. Migrate settings/categories hierarchy
    const categoriesDocRef = db.collection("settings").doc("categories");
    const categoriesSnap = await categoriesDocRef.get();
    if (categoriesSnap.exists) {
      const data = (categoriesSnap.data() || {}) as CategorySettingsDocData;
      const hierarchy: Record<string, Record<string, string[]>> = data.hierarchy || {};
      
      let modified = false;

      // Ensure "Électroménager" is initialized in hierarchy
      if (!hierarchy["Électroménager"]) {
        hierarchy["Électroménager"] = {};
      }

      // Check "Électronique" for "TV & Home Cinéma"
      if (hierarchy["Électronique"] && hierarchy["Électronique"]["TV & Home Cinéma"]) {
        const tvCinemaSubSubs = hierarchy["Électronique"]["TV & Home Cinéma"];
        
        // Move to "Électroménager"
        hierarchy["Électroménager"]["TV & Home Cinéma"] = tvCinemaSubSubs;
        
        // Remove from "Électronique"
        delete hierarchy["Électronique"]["TV & Home Cinéma"];
        modified = true;
        (process.env.NODE_ENV === "development" ? console.log : function () {})("Migrated 'TV & Home Cinéma' subcategory array to 'Électroménager' in settings/categories.");
      } else if (!hierarchy["Électroménager"]["TV & Home Cinéma"]) {
        // Fallback: if not in Électronique but also missing in Électroménager, let's seed it from constants
        hierarchy["Électroménager"]["TV & Home Cinéma"] = [
          "Téléviseurs Smart TV",
          "Barres de son",
          "Vidéoprojecteurs",
          "Supports muraux TV",
          "Box Android TV & Apple TV",
          "Câbles HDMI & Antennes"
        ];
        modified = true;
        (process.env.NODE_ENV === "development" ? console.log : function () {})("Seeded 'TV & Home Cinéma' to 'Électroménager' in settings/categories.");
      }

      if (modified) {
        await categoriesDocRef.set({ hierarchy, updatedAt: new Date().toISOString() }, { merge: true });
        (process.env.NODE_ENV === "development" ? console.log : function () {})("Updated settings/categories document successfully.");
      }
    }

    // 2. Migrate homepage_categories_v2 visual config
    const elDocRef = db.collection("homepage_categories_v2").doc("Électronique");
    const emDocRef = db.collection("homepage_categories_v2").doc("Électroménager");

    const [elSnap, emSnap] = await Promise.all([elDocRef.get(), emDocRef.get()]);
    
    let elSubImages: Record<string, string> = {};
    let emSubImages: Record<string, string> = {};
    let imageToMigrate = "";

    if (elSnap.exists) {
      const elData = elSnap.data() as HomepageCategoryDocData | undefined;
      elSubImages = elData?.subCategoryImages || {};
      if (elSubImages["TV & Home Cinéma"]) {
        imageToMigrate = elSubImages["TV & Home Cinéma"];
        delete elSubImages["TV & Home Cinéma"];
        await elDocRef.set({ subCategoryImages: elSubImages, updatedAt: new Date().toISOString() }, { merge: true });
        (process.env.NODE_ENV === "development" ? console.log : function () {})("Removed 'TV & Home Cinéma' image config from Électronique custom config.");
      }
    }

    if (emSnap.exists || imageToMigrate) {
      if (emSnap.exists) {
        const emData = emSnap.data() as HomepageCategoryDocData | undefined;
        emSubImages = emData?.subCategoryImages || {};
      }
      // If we found an image to migrate, or if we want to ensure "TV & Home Cinéma" has an elegant default image
      if (imageToMigrate) {
        emSubImages["TV & Home Cinéma"] = imageToMigrate;
      } else if (!emSubImages["TV & Home Cinéma"]) {
        emSubImages["TV & Home Cinéma"] = "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600";
      }

      await emDocRef.set({ 
        id: "Électroménager",
        subCategoryImages: emSubImages, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      (process.env.NODE_ENV === "development" ? console.log : function () {})("Added 'TV & Home Cinéma' image config to Électroménager custom config.");
    }

    // 3. Migrate Products in 'products' collection
    const productsQuery = await db.collection("products")
      .where("category", "==", "Électronique")
      .where("subcategory", "==", "TV & Home Cinéma")
      .get();

    if (!productsQuery.empty) {
      (process.env.NODE_ENV === "development" ? console.log : function () {})(`Found ${productsQuery.size} products to migrate from Électronique to Électroménager.`);
      const batch = db.batch();
      productsQuery.docs.forEach((doc) => {
        batch.update(doc.ref, { 
          category: "Électroménager",
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
      (process.env.NODE_ENV === "development" ? console.log : function () {})("Successfully migrated all matching products to Électroménager.");
    } else {
      (process.env.NODE_ENV === "development" ? console.log : function () {})("No products found in 'Électronique' with subcategory 'TV & Home Cinéma'.");
    }

    // Mark as completed in migrations collection
    await migrationsDocRef.set({ tv_cinema_migration_done: true }, { merge: true });
    (process.env.NODE_ENV === "development" ? console.log : function () {})("Migration of 'TV & Home Cinéma' completed successfully.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error migrating 'TV & Home Cinéma' in Firestore:", message);
  }
};

setupFirestore();
logDev("================================================================================");

export { admin };
