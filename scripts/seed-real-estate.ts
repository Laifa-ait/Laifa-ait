import { db } from "../src/config/firebase-admin";
import { ensureInitialSeedProperties } from "../src/domains/realEstate/data/realEstateSeed";

async function run() {
  console.log("[Seeder] Starting real estate initial seed process...");
  if (!db) {
    console.error("[Seeder] ❌ Error: Firestore Database unavailable.");
    process.exit(1);
  }
  try {
    await ensureInitialSeedProperties(db);
    console.log("[Seeder] ✅ Finished seed check.");
    process.exit(0);
  } catch (err) {
    console.error("[Seeder] ❌ Error during seeding:", err);
    process.exit(1);
  }
}

run();
