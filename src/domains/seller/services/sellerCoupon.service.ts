import { db, admin } from "../../../config/firebase-admin";

export interface CreateSellerCouponParams {
  sellerId: string;
  code: string;
  discountType: string;
  discountValue: number;
  expiryDate: string;
  minOrderAmount?: number;
  maxUses?: number;
}

export class SellerCouponService {
  static getDocMillis(docData: Record<string, unknown>): number {
    const val = docData.createdAt;
    if (!val) return 0;
    if (typeof val === "object" && val !== null) {
      if ("toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
        return (val as { toDate: () => Date }).toDate().getTime();
      }
      if ("seconds" in val && typeof (val as { seconds: number }).seconds === "number") {
        return (val as { seconds: number }).seconds * 1000;
      }
      if (val instanceof Date) {
        return val.getTime();
      }
    }
    if (typeof val === "string" || typeof val === "number") {
      const d = new Date(val);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    }
    return 0;
  }

  static async createCoupon(params: CreateSellerCouponParams): Promise<Record<string, unknown>> {
    const { sellerId, code, discountType, discountValue, expiryDate, minOrderAmount, maxUses } = params;

    const upperCode = String(code).trim().toUpperCase();
    const parsedExpiry = new Date(expiryDate);
    const minOrder = Number(minOrderAmount) || 0;
    const parsedMaxUses = maxUses ? Number(maxUses) : null;

    const codeLockRef = db.collection("coupon_codes").doc(upperCode);
    const newCouponRef = db.collection("coupons").doc();

    const createdCoupon = await db.runTransaction(async (transaction) => {
      const lockDoc = await transaction.get(codeLockRef);
      if (lockDoc.exists) {
        throw new Error("Ce code promo existe déjà. Veuillez choisir un autre code.");
      }

      const existingQuery = await transaction.get(
        db.collection("coupons").where("code", "==", upperCode).limit(1)
      );
      if (!existingQuery.empty) {
        throw new Error("Ce code promo existe déjà. Veuillez choisir un autre code.");
      }

      const couponData = {
        code: upperCode,
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: minOrder,
        minOrderAmount: minOrder,
        maxDiscountAmount: null,
        maxDiscount: null,
        startAt: admin.firestore.FieldValue.serverTimestamp(),
        startsAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(parsedExpiry),
        expiryDate: admin.firestore.Timestamp.fromDate(parsedExpiry),
        usageLimit: parsedMaxUses,
        maxUses: parsedMaxUses,
        maxUsesPerUser: null,
        singleUsePerClient: false,
        limitedToCategories: [],
        limitedToSellers: [sellerId],
        sellerId: sellerId,
        usageCount: 0,
        usedCount: 0,
        usedBy: [],
        userUsages: {},
        isActive: true,
        createdBy: sellerId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      transaction.set(codeLockRef, {
        couponId: newCouponRef.id,
        code: upperCode,
        sellerId: sellerId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      transaction.set(newCouponRef, couponData);

      return { id: newCouponRef.id, ...couponData };
    });

    return createdCoupon;
  }
}
