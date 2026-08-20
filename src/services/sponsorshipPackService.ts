import { db } from "../config/firebase-admin";
import { SponsorshipPackConfig, SponsorshipTier, DEFAULT_SPONSORSHIP_PACKS } from "../domains/seller/sponsorship.types";

export class SponsorshipPackService {
  static async getPacks(): Promise<Record<SponsorshipTier, SponsorshipPackConfig>> {
    try {
      const docSnap = await db.collection("app_config").doc("sponsorship_packs").get();
      if (docSnap.exists && docSnap.data()?.packs) {
        return docSnap.data()?.packs as Record<SponsorshipTier, SponsorshipPackConfig>;
      }
    } catch (error) {
      console.warn("🟢 [Firestore Core] Unable to load custom sponsorship packs, falling back to defaults", error);
    }
    return DEFAULT_SPONSORSHIP_PACKS;
  }

  static async updatePacks(packs: Record<SponsorshipTier, SponsorshipPackConfig>): Promise<void> {
    await db.collection("app_config").doc("sponsorship_packs").set({
      packs,
      updatedAt: new Date()
    }, { merge: true });
    console.log("🟢 [Firestore Core] 🟢 Sponsorship packs updated dynamically in app_config.");
  }
}
