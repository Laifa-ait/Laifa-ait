import { db, admin } from "../config/firebase-admin";
import { safeLogger } from "../utils/logger";
import { UserAffinityDigest } from "./UserAffinityAccumulator";

export type AffinityDigestPayload = Partial<UserAffinityDigest>;

export class PersonalizedFeedService {
  /**
   * Saves or merges daily affinity digest in Firestore (Limited to 1 write per user/day).
   */
  public static async saveUserDailyDigest(userId: string, digest: AffinityDigestPayload): Promise<void> {
    if (!userId || !digest) return;

    try {
      const userHabitsRef = db.collection("user_affinities").doc(userId);
      await userHabitsRef.set(
        {
          ...digest,
          userId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastSyncDate: new Date().toISOString().split("T")[0],
        },
        { merge: true }
      );

      safeLogger.info("[PersonalizedFeed] 💾 Daily user affinity digest saved", {
        userId,
        interactions: digest.totalInteractions,
      });
    } catch (err: unknown) {
      safeLogger.error("[PersonalizedFeed] ❌ Failed to save user affinity digest", {
        userId,
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
