import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";

export async function clearHomepageCache(): Promise<void> {
  try {
    await db.collection("public").doc("homepage_cache").delete();
    safeLogger.info("[Olmart Gateway] 🧹 Homepage cache invalidated successfully");
  } catch {
    // Ignore cache clear error if document did not exist
  }
}
