import { admin, db } from "../../../config/firebase-admin";

export interface ModerationResult {
  cleanText: string;
  violationDetected: boolean;
  violationReasons: string[];
}

export class MessageModerationService {
  private static readonly PHONE_REGEX = /(0[5672349][0-9]{8}|(\+213|00213)[5672349][0-9]{8})/g;
  private static readonly SOCIAL_REGEX = /(whatsapp|viber|telegram|instagram|insta|facebook|fb|appel[e]?\s*moi)/gi;
  private static readonly URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

  /**
   * Scans and sanitizes message text against platform DLP rules.
   */
  public static moderateText(rawText: string): ModerationResult {
    let cleanText = rawText || "";
    const violationReasons: string[] = [];

    // 1. Phone number filter
    if (this.PHONE_REGEX.test(cleanText)) {
      violationReasons.push("PHONE_NUMBER_DETECTED");
      cleanText = cleanText.replace(this.PHONE_REGEX, "[NUMÉRO MASQUÉ]");
    }

    // 2. External social media filter
    if (this.SOCIAL_REGEX.test(cleanText)) {
      violationReasons.push("SOCIAL_MEDIA_KEYWORD");
      cleanText = cleanText.replace(this.SOCIAL_REGEX, "[MOT INTERDIT]");
    }

    // 3. External URLs filter
    if (this.URL_REGEX.test(cleanText)) {
      violationReasons.push("EXTERNAL_URL_DETECTED");
      cleanText = cleanText.replace(this.URL_REGEX, "[LIEN INTERDIT]");
    }

    const violationDetected = violationReasons.length > 0;

    return {
      cleanText,
      violationDetected,
      violationReasons
    };
  }

  /**
   * Persists an audit alert in admin_alerts if DLP violation was detected.
   */
  public static async recordDlpAlert(
    senderId: string,
    conversationId: string,
    originalText: string,
    violationReasons: string[]
  ): Promise<void> {
    try {
      if (!db) return;

      await db.collection("admin_alerts").add({
        type: "DLP_VIOLATION",
        module: "MESSAGING_OLM_04",
        userId: senderId,
        conversationId,
        originalText,
        reasons: violationReasons,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        resolved: false
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[MessageModerationService] ❌ Failed to record DLP alert:", errorMsg);
    }
  }
}
