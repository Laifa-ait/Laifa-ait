import { admin, db } from "../config/firebase-admin";
import { CouponService } from "../domains/marketing/coupon.service";

interface FirestoreDocSnapshot {
  id: string;
  data: () => Record<string, unknown>;
}

interface BannerDoc {
  id: string;
  is_active?: boolean;
  isActive?: boolean;
  sort_order?: number;
  orderIndex?: number;
  [key: string]: unknown;
}

interface ProductDocItem {
  id: string;
  stock?: number;
  sellerTrustScore?: number;
  [key: string]: unknown;
}

export interface LogErrorBody {
  message?: string;
  stack?: string;
  componentStack?: string;
  type?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  [key: string]: unknown;
}

export class CoreService {
  static async getHomeData() {
    const startTime = Date.now();
    try {
      const [categoriesSnap, sectionsSnap, bannersSnap, tagsSnap, productsSnap, sellersSnap] = await Promise.all([
        db.collection("homepage_categories_v2").limit(100).get().catch(() => ({ docs: [] })),
        db.collection("homepage_sections").orderBy("orderIndex", "asc").limit(50).get().catch(() => ({ docs: [] })),
        db.collection("banners").limit(30).get().catch(() => ({ docs: [] })),
        db.collection("tags").limit(100).get().catch(() => ({ docs: [] })),
        db.collection("products").where("status", "==", "active").orderBy("createdAt", "desc").limit(24).get().catch(async () => {
          return db.collection("products").where("status", "==", "active").orderBy("created_at", "desc").limit(24).get().catch(() => ({ docs: [] }));
        }),
        db.collection("publicProfiles").limit(20).get().catch(() => ({ docs: [] }))
      ]);
      const categories = categoriesSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() }));
      const sections = sectionsSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() }));
          
      const banners = (bannersSnap.docs
        .map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() })) as BannerDoc[])
        .filter((b) => b.is_active !== false && b.isActive !== false)
        .sort((a, b) => (a.sort_order ?? a.orderIndex ?? 0) - (b.sort_order ?? b.orderIndex ?? 0));
      const tags = tagsSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() }));
      let productsLoaded = (productsSnap.docs
        .map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() })) as ProductDocItem[])
        .filter((d) => d && (d.stock === undefined || d.stock > 0));
      productsLoaded = productsLoaded.sort((a, b) => {
        const scoreA = a.sellerTrustScore ?? 50;
        const scoreB = b.sellerTrustScore ?? 50;
        return scoreB - scoreA;
      });
      const topTier = productsLoaded.filter((p) => (p.sellerTrustScore ?? 100) >= 75).slice(0, 8);
      const featuredProducts = topTier.length >= 4 ? topTier : productsLoaded.slice(0, 8);
      const sellers = sellersSnap.docs.map((doc: FirestoreDocSnapshot) => ({ id: doc.id, ...doc.data() }));
      const duration = Date.now() - startTime;
      console.log(`[Olmart Gateway] 🚀 /api/v1/public/home-data processed in ${duration}ms | Firestore Parallel Velocity: OK`);
      return {
        categories,
        sections,
        banners,
        tags,
        featuredProducts,
        sellers
      };
    } catch (err: unknown) {
      const duration = Date.now() - startTime;
      console.log(`[Olmart Gateway] ❌ /api/v1/public/home-data failed in ${duration}ms`);
      console.error("Error in /api/public/home-data:", err);
      throw new Error("Failed to load homepage data", { cause: err });
    }
  }

  static async getPublicSettings() {
    const docSnap = await db.collection("settings").doc("global").get();
    return docSnap.exists ? (docSnap.data() || {}) : {};
  }

  static async logError(body: LogErrorBody) {
    const { message, stack, componentStack, type, url, userAgent, userId } = body;
    await db.collection("site_errors").add({
      message: message || "Unknown",
      stack: stack || "",
      componentStack: componentStack || "",
      type: type || "window_error",
      url: url || "",
      userAgent: userAgent || "",
      userId: userId || null,
      timestamp: new Date().toISOString(),
      resolved: false,
    });
    return true;
  }

  static async getPublicProfiles(ids: string[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return {};
    
    const profiles: Record<string, Record<string, unknown>> = {};
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 10) {
      chunks.push(ids.slice(i, i + 10));
    }
        
    const fetchPromises = chunks.map(async (chunk) => {
      const snap = await db.collection("publicProfiles").where(admin.firestore.FieldPath.documentId(), "in", chunk).get();
      snap.docs.forEach((doc) => {
        profiles[doc.id] = { id: doc.id, ...doc.data() };
      });
    });
    await Promise.all(fetchPromises);
    return profiles;
  }

  static async validateCoupon(code: string, userId: string | undefined, items: unknown) {
    if (!code || typeof code !== "string" || !code.trim()) throw new Error("Code requis");
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Panier requis pour valider ce code promo.");
    }

    const reconstructed = await CouponService.reconstructVerifiedCartFromFirestore(items, db);
    if (!reconstructed.valid) {
      throw new Error(reconstructed.error || "Panier invalide pour ce code promo.");
    }

    const upperCode = code.trim().toUpperCase();
    const qSnap = await db.collection("coupons").where("code", "==", upperCode).get();
    
    const resolveResult = CouponService.resolveActiveCouponFromDocs(qSnap.docs);
    if (!resolveResult.couponDoc) {
      throw new Error(resolveResult.error || "Coupon not found");
    }
        
    const couponDoc = resolveResult.couponDoc;
    const couponData = couponDoc.data() as Record<string, unknown>;

    const validation = CouponService.validateCoupon({
      couponDocId: couponDoc.id,
      couponData,
      subtotal: reconstructed.serverSubtotal,
      userId,
      isGuest: !userId || userId.startsWith("guest_"),
      items: reconstructed.verifiedItems,
    });

    if (!validation.valid) {
      throw new Error(validation.error || "Coupon invalide");
    }

    return validation.coupon;
  }
}

