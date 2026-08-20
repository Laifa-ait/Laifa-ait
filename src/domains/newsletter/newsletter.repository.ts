import { db } from "../../config/firebase-admin";

export interface INewsletterRepository {
  addCampaign(data: Record<string, unknown>): Promise<string>;
  updateCampaign(id: string, data: Record<string, unknown>): Promise<void>;
  getCampaigns(limitVal?: number): Promise<unknown[]>;
  getSubscribersCount(status: string): Promise<number>;
  getSubscribers(limitVal?: number): Promise<unknown[]>;
  addSubscriber(data: Record<string, unknown>): Promise<string>;
  getSettings(): Promise<Record<string, unknown> | null>;
  updateSettings(settings: Record<string, unknown>): Promise<void>;
}

export class FirebaseNewsletterRepository implements INewsletterRepository {
  async addCampaign(data: Record<string, unknown>): Promise<string> {
    const docRef = await db.collection("newsletter_campaigns").add(data);
    return docRef.id;
  }

  async updateCampaign(id: string, data: Record<string, unknown>): Promise<void> {
    await db.collection("newsletter_campaigns").doc(id).update(data);
  }

  async getCampaigns(limitVal = 100): Promise<unknown[]> {
    const snap = await db.collection("newsletter_campaigns").orderBy("createdAt", "desc").limit(limitVal).get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getSubscribersCount(status: string): Promise<number> {
    const countQuery = await db.collection("newsletter_subscribers").where("status", "==", status).count().get();
    return countQuery.data().count;
  }

  async getSubscribers(limitVal = 500): Promise<unknown[]> {
    const snap = await db.collection("newsletter_subscribers").orderBy("createdAt", "desc").limit(limitVal).get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addSubscriber(data: Record<string, unknown>): Promise<string> {
    const docRef = await db.collection("newsletter_subscribers").add(data);
    return docRef.id;
  }

  async getSettings(): Promise<Record<string, unknown> | null> {
    const docRef = await db.collection("global_settings").doc("newsletter").get();
    return docRef.exists ? (docRef.data() as Record<string, unknown>) : null;
  }

  async updateSettings(settings: Record<string, unknown>): Promise<void> {
    await db.collection("global_settings").doc("newsletter").set(settings, { merge: true });
  }
}
