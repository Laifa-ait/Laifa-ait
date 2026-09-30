import { admin, db } from "../config/firebase-admin";
import { CouponService } from "../domains/marketing/coupon.service";
import { safeLogger } from "../utils/logger";

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
  static async ensureInitialProductsSeeded(): Promise<void> {
    try {
      const snap = await db.collection("products").limit(1).get();
      if (snap.empty) {
        safeLogger.info("[CoreService] 🚀 Empty products collection detected. Auto-seeding initial marketplace products...");
        const sampleProducts = [
          {
            name: "Canapé Modular 'Atlas'",
            price: 145000,
            promoPrice: 125000,
            category: "Maison & Déco",
            description: "Un canapé moderne inspiré par les paysages de l'Atlas. Tissu premium et confort absolu.",
            image: "/images/placeholders/product.svg",
            wilaya: "Alger",
            stock: 15,
            rating: 4.8,
            tags: ["Premium", "Salon", "Moderne"],
            sellerId: "admin_seed",
            sellerName: "Boutique Officielle Olmart",
            status: "active",
            media: [{ url: "/images/placeholders/product.svg", type: "image" }],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          {
            name: "Jus d'Orange Pressé Bio",
            price: 350,
            promoPrice: 280,
            category: "Supermarché",
            description: "Jus d'orange 100% naturel sans sucre ajouté.",
            image: "/images/placeholders/product.svg",
            wilaya: "Alger",
            stock: 120,
            rating: 4.9,
            tags: ["Supermarché", "Jus", "Boisson"],
            sellerId: "admin_seed",
            sellerName: "Boutique Officielle Olmart",
            status: "active",
            media: [{ url: "/images/placeholders/product.svg", type: "image" }],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          {
            name: "Lampe 'Sahara Glow'",
            price: 32000,
            flashPrice: 24900,
            category: "Luminaires",
            description: "Une lumière d'ambiance qui rappelle les couchers de soleil du Sahara.",
            image: "/images/placeholders/product.svg",
            wilaya: "Ghardaïa",
            stock: 8,
            rating: 4.7,
            tags: ["Lumière", "Ambiance", "Design"],
            sellerId: "admin_seed",
            sellerName: "Boutique Officielle Olmart",
            status: "active",
            media: [{ url: "/images/placeholders/product.svg", type: "image" }],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          {
            name: "Tapis Zindkh de Constantine",
            price: 85000,
            promoPrice: 69000,
            category: "Tapis",
            description: "Tapis tissé main selon la tradition séculaire de l'Est Algérien.",
            image: "/images/placeholders/product.svg",
            wilaya: "Constantine",
            stock: 5,
            rating: 5.0,
            tags: ["Tapis", "Handmade", "Constantine"],
            sellerId: "admin_seed",
            sellerName: "Boutique Officielle Olmart",
            status: "active",
            media: [{ url: "/images/placeholders/product.svg", type: "image" }],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          {
            name: "Machine à Café Espresso DZ Pro",
            price: 45000,
            flashPrice: 38000,
            category: "Électronique & Électroménager",
            description: "Performances professionnelles pour votre cuisine.",
            image: "/images/placeholders/product.svg",
            wilaya: "Oran",
            stock: 15,
            rating: 4.6,
            tags: ["Cuisine", "Tech", "Café"],
            sellerId: "admin_seed",
            sellerName: "Boutique Officielle Olmart",
            status: "active",
            media: [{ url: "/images/placeholders/product.svg", type: "image" }],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          {
            name: "Vase Artisanal d'Aït Yenni",
            price: 18000,
            promoPrice: 14500,
            category: "Artisanat",
            description: "Vase céramique fait main sculpté par des artisans de Kabylie.",
            image: "/images/placeholders/product.svg",
            wilaya: "Tizi Ouzou",
            stock: 10,
            rating: 4.9,
            tags: ["Artisanat", "Kabylie", "Céramique"],
            sellerId: "admin_seed",
            sellerName: "Boutique Officielle Olmart",
            status: "active",
            media: [{ url: "/images/placeholders/product.svg", type: "image" }],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }
        ];

        const batch = db.batch();
        for (const prod of sampleProducts) {
          const ref = db.collection("products").doc();
          batch.set(ref, prod);
        }
        await batch.commit();
        safeLogger.info("[CoreService] ✅ Initial catalog seeded successfully.");
      }
    } catch (err: unknown) {
      safeLogger.warn("[CoreService] Could not auto-seed initial products", { err: err instanceof Error ? err.message : String(err) });
    }
  }

  static async getHomeData() {
    const startTime = Date.now();
    try {
      await CoreService.ensureInitialProductsSeeded();

      let productsSnap = await db.collection("products").where("status", "in", ["active", "approved"]).limit(24).get().catch(async () => {
        return db.collection("products").limit(24).get().catch(() => ({ docs: [] }));
      });

      if (productsSnap.docs.length === 0) {
        productsSnap = await db.collection("products").limit(24).get().catch(() => ({ docs: [] }));
      }

      const [categoriesSnap, sectionsSnap, bannersSnap, tagsSnap, sellersSnap] = await Promise.all([
        db.collection("homepage_categories_v2").limit(100).get().catch(() => ({ docs: [] })),
        db.collection("homepage_sections").orderBy("orderIndex", "asc").limit(50).get().catch(() => ({ docs: [] })),
        db.collection("banners").limit(30).get().catch(() => ({ docs: [] })),
        db.collection("tags").limit(100).get().catch(() => ({ docs: [] })),
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
      safeLogger.info("/api/v1/public/home-data processed", { durationMs: duration });
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
      safeLogger.error("/api/v1/public/home-data failed", { durationMs: duration, err: err instanceof Error ? err.message : String(err) });
      throw new Error("Failed to load homepage data", { cause: err });
    }
  }

  static async getPublicSettings() {
    const docSnap = await db.collection("settings").doc("global").get();
    return docSnap.exists ? (docSnap.data() || {}) : {};
  }

  static async logError(body: LogErrorBody) {
    const { message, stack, componentStack, type, url, userAgent, userId } = body;
    const safeMessage = typeof message === "string" ? message.slice(0, 2000) : "Unknown error";
    // In production, strip deep internal stack paths and PII
    const isProd = process.env.NODE_ENV === "production";
    const safeStack = typeof stack === "string"
      ? (isProd ? stack.split("\n").slice(0, 5).map(l => l.trim()).join("\n").slice(0, 1000) : stack.slice(0, 2000))
      : "";

    await db.collection("site_errors").add({
      message: safeMessage,
      stack: safeStack,
      componentStack: typeof componentStack === "string" ? componentStack.slice(0, 1000) : "",
      type: typeof type === "string" ? type.slice(0, 100) : "window_error",
      url: typeof url === "string" ? url.slice(0, 500) : "",
      userAgent: typeof userAgent === "string" ? userAgent.slice(0, 300) : "",
      userId: typeof userId === "string" ? userId.slice(0, 128) : null,
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

