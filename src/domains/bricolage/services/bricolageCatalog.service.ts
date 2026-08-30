import { db } from "../../../config/firebase-admin";
import { BRICOLAGE_CATEGORIES } from "../../../data/bricolageData";

export class BricolageCatalogService {
  static async getCategories(): Promise<Array<Record<string, unknown>>> {
    if (!db) {
      return BRICOLAGE_CATEGORIES as unknown as Array<Record<string, unknown>>;
    }
    const snapshot = await db.collection("bricolage_categories").get();
    if (snapshot.empty) {
      return BRICOLAGE_CATEGORIES as unknown as Array<Record<string, unknown>>;
    }
    const categories: Array<Record<string, unknown>> = [];
    snapshot.forEach((doc) => categories.push(doc.data()));
    return categories;
  }

  static async getArtisans(wilaya?: string, specialty?: string): Promise<Array<Record<string, unknown>>> {
    if (!db) {
      return [];
    }
    let query: FirebaseFirestore.Query = db.collection("bricolage_artisans");
    if (wilaya) {
      query = query.where("wilaya", "==", wilaya);
    }
    const snapshot = await query.get();
    if (snapshot.empty) {
      return [];
    }
    const list: Array<Record<string, unknown>> = [];
    snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
    if (specialty && specialty !== "all") {
      return list.filter((a) => String(a.specialty || "").toLowerCase().includes(specialty.toLowerCase()));
    }
    return list;
  }

  static async getReviews(): Promise<Array<Record<string, unknown>>> {
    if (!db) return [];
    const snapshot = await db.collection("bricolage_reviews").get();
    if (snapshot.empty) return [];

    const list: Array<Record<string, unknown>> = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
    return list;
  }
}
