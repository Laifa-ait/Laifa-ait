import { Router } from "express";
import { admin, db } from "../../../config/firebase-admin";
import { Product, HomepageSection, Banner } from "../product.types";
import NodeCache from "node-cache";
import { safeLogger } from "../../../utils/logger";

const cache = new NodeCache({ stdTTL: 300, maxKeys: 1000, useClones: false });

export const productStoreRouter = Router();

productStoreRouter.get("/api/v1/stores/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    if (!sellerId) return res.status(400).json({ error: "Missing sellerId" });

    const decodedId = decodeURIComponent(sellerId);
    let storeData: Record<string, unknown> | null = null;

    const [pubSnap, userSnap] = await Promise.all([
      db.collection("publicProfiles").doc(sellerId).get().catch(() => null),
      db.collection("users").doc(sellerId).get().catch(() => null)
    ]);

    if ((pubSnap && pubSnap.exists) || (userSnap && userSnap.exists)) {
      const pubData = pubSnap && pubSnap.exists ? pubSnap.data() || {} : {};
      const userData = userSnap && userSnap.exists ? userSnap.data() || {} : {};
      const merged = { ...userData, ...pubData };

      const logoUrl = pubData?.logoUrl || pubData?.photoURL || pubData?.avatarUrl ||
                      userData?.logoUrl || userData?.photoURL || userData?.avatarUrl || userData?.photoUrl || "";

      const bannerUrl = pubData?.bannerUrl || pubData?.coverUrl || pubData?.coverImage ||
                        userData?.bannerUrl || userData?.coverUrl || userData?.coverImage || userData?.bannerImage || "";

      storeData = {
        id: sellerId,
        sellerId: sellerId,
        shopName: merged.shopName || merged.storeName || merged.displayName || "Boutique Vendeur",
        shopDescription: merged.shopDescription || merged.storeDescription || merged.description || "",
        wilaya: merged.wilaya || "16 - Alger",
        status: merged.status || "ACTIVE",
        ...merged,
        logoUrl,
        bannerUrl
      };
    }

    if (!storeData) {
      const slugQuery = await db.collection("users").where("shopSlug", "==", sellerId).limit(1).get().catch(() => null);
      if (slugQuery && !slugQuery.empty) {
        const docSnap = slugQuery.docs[0];
        storeData = { id: docSnap.id, sellerId: docSnap.id, ...docSnap.data() };
      }
    }

    if (!storeData) {
      const nameQuery = await db.collection("users").where("shopName", "==", decodedId).limit(1).get().catch(() => null);
      if (nameQuery && !nameQuery.empty) {
        const docSnap = nameQuery.docs[0];
        storeData = { id: docSnap.id, sellerId: docSnap.id, ...docSnap.data() };
      }
    }

    let products: Product[] = [];
    if (storeData) {
      const targetIds = [storeData.id, storeData.sellerId, storeData.uid, sellerId].filter(Boolean) as string[];
      const prodPromises = targetIds.map(async (tid) => {
        try {
          return await db.collection("products").where("sellerId", "==", tid).limit(50).get();
        } catch {
          return { docs: [] as admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>[] };
        }
      });
      const results = await Promise.all(prodPromises);
      const prodMap = new Map<string, Product>();
      results.forEach(snap => {
        snap.docs.forEach((d) => {
          prodMap.set(d.id, { id: d.id, ...d.data() } as Product);
        });
      });
      products = Array.from(prodMap.values());
    } else {
      let prodSnap = null;
      try {
        prodSnap = await db.collection("products").where("sellerId", "==", sellerId).limit(50).get();
      } catch {
        // Ignored
      }
      if (prodSnap && !prodSnap.empty) {
        const sample = prodSnap.docs[0].data();
        storeData = {
          id: sellerId,
          sellerId: sellerId,
          shopName: sample?.sellerName || sample?.storeName || sample?.brand || decodedId || "Boutique Vendeur",
          shopDescription: "Boutique partenaire sur Olmart.",
          logoUrl: sample?.sellerLogo || sample?.storeLogo || "",
          wilaya: sample?.wilaya || "16 - Alger",
          status: "ACTIVE"
        };
        products = prodSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      }
    }

    if (!storeData) {
      return res.status(404).json({ error: "Store not found" });
    }

    return res.json({
      success: true,
      shop: storeData,
      ...storeData,
      products
    });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

productStoreRouter.get("/api/v1/banners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `banner_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const docRef = db.collection("banners").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Banner not found" });
    }
    const bannerData = { id: snap.id, ...snap.data() } as { id: string; linkedProductIds?: string[]; products?: Product[]; [key: string]: unknown };
    if (bannerData.linkedProductIds && bannerData.linkedProductIds.length > 0) {
      const productPromises = bannerData.linkedProductIds.map(async (pid: string) => {
        const d = await db.collection("products").doc(pid).get();
        return d.exists ? ({ id: d.id, ...d.data() } as Product) : null;
      });
      const productDocs = await Promise.all(productPromises);
      bannerData.products = productDocs.filter((p): p is Product => p !== null);
    } else {
      bannerData.products = [];
    }
    cache.set(cacheKey, bannerData, 900);
    return res.json(bannerData);
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

productStoreRouter.get("/api/v1/collections/:collectionId", async (req, res) => {
  try {
    const { collectionId } = req.params;
    const decodedName = decodeURIComponent(collectionId);
    const cacheKey = `collection_${collectionId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const normalizeStr = (str: string) => {
      if (!str) return "";
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
    };

    const normalizedDecoded = normalizeStr(decodedName);
    const normalizedCollection = normalizeStr(collectionId);

    const sectionsSnap = await db.collection("homepage_sections").limit(50).get();
    let matchingSection: HomepageSection | null = null;
    
    for (const doc of sectionsSnap.docs) {
      const data = doc.data();
      const docIdNorm = normalizeStr(doc.id);
      const titleNorm = normalizeStr(data.title || "");
      const nameNorm = normalizeStr(data.name || "");

      if (
        doc.id === collectionId || 
        doc.id === decodedName || 
        docIdNorm === normalizedCollection ||
        docIdNorm === normalizedDecoded ||
        titleNorm === normalizedDecoded ||
        titleNorm === normalizedCollection ||
        nameNorm === normalizedDecoded ||
        nameNorm === normalizedCollection
      ) {
        matchingSection = { id: doc.id, ...data } as HomepageSection;
        break;
      }
    }

    const bannersSnap = await db.collection("banners").limit(30).get();
    let matchingBanner: Banner | null = null;

    for (const doc of bannersSnap.docs) {
      const data = doc.data();
      const docIdNorm = normalizeStr(doc.id);
      const titleNorm = normalizeStr(data.title || "");
      const nameNorm = normalizeStr(data.name || "");

      if (
        doc.id === collectionId || 
        doc.id === decodedName || 
        docIdNorm === normalizedCollection ||
        docIdNorm === normalizedDecoded ||
        titleNorm === normalizedDecoded ||
        titleNorm === normalizedCollection ||
        nameNorm === normalizedDecoded ||
        nameNorm === normalizedCollection
      ) {
        matchingBanner = { id: doc.id, ...data } as Banner;
        break;
      }
    }

    let title = decodedName;
    let bannerImage = "/images/placeholders/product.svg";

    if (matchingSection) {
      title = matchingSection.title || matchingSection.name || decodedName;
      if (matchingSection.themeImage) {
        bannerImage = matchingSection.themeImage;
      } else if (matchingSection.theme && matchingSection.theme !== "none") {
        try {
          const tDoc = await db.collection("seasonal_themes").doc(matchingSection.theme).get();
          if (tDoc.exists) {
            const themeData = tDoc.data();
            if (themeData && themeData.imageUrl) {
              bannerImage = themeData.imageUrl;
            }
          }
        } catch (themeErr) {
          safeLogger.error("Error loading seasonal theme", { err: themeErr instanceof Error ? themeErr.message : String(themeErr) });
        }
      }
      if (!bannerImage || bannerImage === "/images/placeholders/product.svg") {
        bannerImage = matchingSection.imageUrl || matchingSection.bannerImage || "/images/placeholders/product.svg";
      }
    } else if (matchingBanner) {
      title = matchingBanner.title || matchingBanner.name || decodedName;
      bannerImage = matchingBanner.imageUrl || matchingBanner.mobileImageUrl || "/images/placeholders/product.svg";
    }

    interface MappedProduct {
      id: string;
      name?: string;
      description?: string;
      price?: number;
      image?: string;
      category?: string;
      stock?: number;
      sellerId?: string;
      wilaya?: string;
      status?: string;
      tags?: string[];
      [key: string]: unknown;
    }

    const mapDocToMappedProduct = (docId: string, data: admin.firestore.DocumentData): MappedProduct => {
      const p: MappedProduct = {
        id: docId,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        category: data.category ? String(data.category) : undefined,
        status: data.status ? String(data.status) : undefined,
        ...data
      };
      return p;
    };

    let curatedProducts: MappedProduct[] = [];
    const sectionTag = matchingSection?.tag || null;
    const sectionCategory = matchingSection?.category || null;

    if (matchingSection?.manualProducts && matchingSection.manualProducts.length > 0) {
      const idList = matchingSection.manualProducts;
      const productPromises = idList.map(async (pid: string) => {
        const d = await db.collection("products").doc(pid).get();
        if (d.exists) {
          const data = d.data();
          if (data) {
            return mapDocToMappedProduct(d.id, data);
          }
        }
        return null;
      });
      const productDocs = await Promise.all(productPromises);
      curatedProducts = productDocs.filter((p): p is MappedProduct => p !== null);
    }

    if (curatedProducts.length === 0) {
      if (sectionCategory) {
        const catSnap = await db.collection("products").where("category", "==", sectionCategory).limit(24).get();
        curatedProducts = catSnap.docs.map(doc => mapDocToMappedProduct(doc.id, doc.data()));
      } else if (sectionTag) {
        const tagSnap = await db.collection("products").where("tags", "array-contains", sectionTag).limit(24).get();
        curatedProducts = tagSnap.docs.map(doc => mapDocToMappedProduct(doc.id, doc.data()));
      }
    }

    const targetTags = new Set<string>();
    if (sectionTag) {
      targetTags.add(sectionTag);
    }
    curatedProducts.forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(t => targetTags.add(t));
      }
    });

    const allProductsSnap = await db.collection("products").limit(100).get();
    const allProducts = allProductsSnap.docs
      .map(doc => mapDocToMappedProduct(doc.id, doc.data()))
      .filter((p: MappedProduct) => p.status !== "deleted" && p.status !== "archived" && p.status !== "pending_deletion");

    const curatedIds = new Set(curatedProducts.map(p => p.id));
    const sameTagProducts = allProducts.filter(p => {
      if (curatedIds.has(p.id)) return false;
      const pTags = p.tags || [];
      const sharesTag = pTags.some((t: string) => targetTags.has(t));
      const sharesCategory = sectionCategory && p.category === sectionCategory;
      return sharesTag || sharesCategory;
    });

    const remainderProducts = allProducts.filter(p => {
      return !curatedIds.has(p.id) && !sameTagProducts.some(st => st.id === p.id);
    });

    const combined = [...curatedProducts, ...sameTagProducts, ...remainderProducts];
    const seenIds = new Set<string>();
    const products: MappedProduct[] = [];
    combined.forEach(p => {
      if (p && p.id && !seenIds.has(p.id)) {
        seenIds.add(p.id);
        products.push(p);
      }
    });

    const responseData = { title, bannerImage, products };
    cache.set(cacheKey, responseData, 600);
    return res.json(responseData);
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

productStoreRouter.get("/api/v1/settings/shipping", async (_req, res) => {
  try {
    const cacheKey = `settings_shipping`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const docRef = db.collection("settings").doc("shipping");
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Shipping settings not found" });
    }
    const shippingData = { id: snap.id, ...snap.data() };
    cache.set(cacheKey, shippingData, 1800);
    return res.json(shippingData);
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});
