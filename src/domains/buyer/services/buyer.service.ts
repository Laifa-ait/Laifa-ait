import { db } from "../../../config/firebase-admin";
import type { BuyerReturnRecord, BuyerOrderRecord } from "../types/buyer.types";

export class BuyerService {
  static async getReturns(userId: string): Promise<BuyerReturnRecord[]> {
    const snap = await db.collection("orders")
      .where("userId", "==", userId)
      .where("returnRequest", "!=", null)
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuyerReturnRecord));
  }

  static async getOrders(
    userId: string,
    startAfterParam?: string,
    limitParam?: number
  ): Promise<{ orders: BuyerOrderRecord[]; lastVisible: string | null }> {
    let queryRef = db.collection("orders")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc");
      
    if (startAfterParam) {
      const docSnap = await db.collection("orders").doc(startAfterParam).get();
      if (docSnap.exists) {
        queryRef = queryRef.startAfter(docSnap);
      }
    }
    
    queryRef = queryRef.limit(limitParam || 20);
    
    const snap = await queryRef.get();
    const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuyerOrderRecord));
    return {
      orders,
      lastVisible: snap.docs[snap.docs.length - 1]?.id || null
    };
  }

  static async getFollowedStores(userId: string): Promise<Record<string, unknown>[]> {
    const snap = await db.collection("users").doc(userId).collection("following").limit(100).get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async followStore(userId: string, sellerId: string, payload: Record<string, unknown>): Promise<void> {
    await db.collection("users").doc(userId).collection("following").doc(sellerId).set(payload);
  }

  static async unfollowStore(userId: string, sellerId: string): Promise<void> {
    await db.collection("users").doc(userId).collection("following").doc(sellerId).delete();
  }
}
