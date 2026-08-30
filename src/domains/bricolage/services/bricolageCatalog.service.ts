import { db } from "../../../config/firebase-admin";
import { BRICOLAGE_CATEGORIES, TOP_VERIFIED_ARTISANS } from "../../../data/bricolageData";

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
      let filtered = TOP_VERIFIED_ARTISANS;
      if (wilaya) {
        filtered = filtered.filter(a => a.wilaya.toLowerCase().includes(String(wilaya).toLowerCase()));
      }
      if (specialty && specialty !== "all") {
        filtered = filtered.filter(a => a.specialty.toLowerCase().includes(String(specialty).toLowerCase()));
      }
      return filtered as unknown as Array<Record<string, unknown>>;
    }
    let query: FirebaseFirestore.Query = db.collection("bricolage_artisans");
    if (wilaya) {
      query = query.where("wilaya", "==", wilaya);
    }
    const snapshot = await query.get();
    if (snapshot.empty) {
      return TOP_VERIFIED_ARTISANS as unknown as Array<Record<string, unknown>>;
    }
    const list: Array<Record<string, unknown>> = [];
    snapshot.forEach((doc) => list.push(doc.data()));
    return list;
  }

  static async getReviews(): Promise<Array<Record<string, unknown>>> {
    const SAMPLE_REVIEWS = [
      {
        id: "rev-01",
        artisanName: "Mourad Benali",
        clientName: "Karim M.",
        wilaya: "Alger (Hydra)",
        serviceName: "Chauffe-eau & Chaudière",
        rating: 5,
        comment: "Intervention très rapide pour une fuite de gaz sur la chaudière. Travail propre, professionnel et prix très raisonnable !",
        date: "Hier"
      },
      {
        id: "rev-02",
        artisanName: "Kamel Bricolage",
        clientName: "Yassine B.",
        wilaya: "Blida",
        serviceName: "Dépannage Court-circuit",
        rating: 5,
        comment: "Panne électrique générale résolue à 22h un vendredi soir. Électricien courtois et équipé.",
        date: "Il y a 3 jours"
      },
      {
        id: "rev-03",
        artisanName: "Atelier Hamza Alumi",
        clientName: "Amina S.",
        wilaya: "Oran",
        serviceName: "Fenêtres PVC & Aluminium",
        rating: 4.9,
        comment: "Installation de 4 fenêtres double vitrage aluminium. Finitions impeccables et respect des délais.",
        date: "Il y a 5 jours"
      }
    ];

    if (!db) return SAMPLE_REVIEWS;
    const snapshot = await db.collection("bricolage_reviews").get();
    if (snapshot.empty) return SAMPLE_REVIEWS;

    const list: Array<Record<string, unknown>> = [];
    snapshot.forEach(doc => list.push(doc.data()));
    return list;
  }
}
