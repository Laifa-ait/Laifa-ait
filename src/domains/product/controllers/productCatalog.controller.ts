import { Router } from "express";
import { admin, db } from "../../../config/firebase-admin";
import { Product } from "../product.types";
import NodeCache from "node-cache";
import { safeLogger } from "../../../utils/logger";

const cache = new NodeCache({ stdTTL: 300, maxKeys: 1000, useClones: false });

export const productCatalogRouter = Router();

productCatalogRouter.get("/api/v1/public/home-endless-grid", async (req, res) => {
  const queryLimit = req.query.limit ? parseInt(String(req.query.limit), 10) : 12;
  const queryOffset = req.query.offset ? parseInt(String(req.query.offset), 10) : 0;
  
  try {
    let products: Product[] = [];
    try {
      const q = db.collection("products")
        .where("status", "in", ["active", "approved"])
        .orderBy("createdAt", "desc");
      
      let finalQ = q;
      if (queryOffset > 0) {
        finalQ = finalQ.offset(queryOffset);
      }
      finalQ = finalQ.limit(queryLimit);
      
      const snap = await finalQ.get();
      products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
    } catch {
      safeLogger.warn("Index not found or failed for home-endless-grid. Falling back to in-memory query.");
      const snap = await db.collection("products").limit(200).get();
      products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
      products = products.filter((p) => !p.status || p.status === "active" || p.status === "approved");
      products.sort((a, b) => {
        const timeA = typeof a.createdAt === "object" && a.createdAt && "seconds" in a.createdAt 
          ? (a.createdAt as { seconds: number }).seconds * 1000 
          : new Date(String(a.createdAt || 0)).getTime();
        const timeB = typeof b.createdAt === "object" && b.createdAt && "seconds" in b.createdAt 
          ? (b.createdAt as { seconds: number }).seconds * 1000 
          : new Date(String(b.createdAt || 0)).getTime();
        return timeB - timeA;
      });
      products = products.slice(queryOffset, queryOffset + queryLimit);
    }
    
    return res.json({ products });
  } catch (error: unknown) {
    safeLogger.error("Error in home-endless-grid", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

productCatalogRouter.get("/api/v1/products", async (req, res) => {
  const { ids, tag, category, limit: queryLimit, featured, flash, premium, offset: queryOffset } = req.query;
  const parsedLimit = queryLimit ? parseInt(String(queryLimit), 10) : 50;
  const parsedOffset = queryOffset ? parseInt(String(queryOffset), 10) : 0;
  
  if (ids) {
    try {
      const idList = String(ids).split(",").map(i => i.trim()).filter(Boolean);
      if (idList.length === 0) {
        return res.json({ products: [] });
      }
      
      const chunks: string[][] = [];
      for (let i = 0; i < idList.length; i += 10) {
        chunks.push(idList.slice(i, i + 10));
      }
      
      const fetchedPromises = chunks.map(async (chunk) => {
        const snap = await db.collection("products").where(admin.firestore.FieldPath.documentId(), "in", chunk).get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
      
      const results = await Promise.all(fetchedPromises);
      const unsortedProducts = results.flat();
      
      const prodMap = new Map(unsortedProducts.map(p => [p.id, p]));
      const products = idList.map(id => prodMap.get(id)).filter(Boolean);
      
      return res.json({ products });
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  }

  const isFeatured = featured === "true";
  const isPremium = premium === "true";
  const isFlash = flash === "true" || req.query.flashSaleActive === "true";

  const cacheKey = tag 
    ? `products_tag_${tag}_o${parsedOffset}` 
    : category 
      ? `products_cat_${category}_${parsedLimit}_o${parsedOffset}` 
      : isFeatured
        ? `products_featured_${parsedLimit}_o${parsedOffset}`
        : isPremium
          ? `products_premium_${parsedLimit}_o${parsedOffset}`
          : isFlash
            ? `products_flash_${parsedLimit}_o${parsedOffset}`
            : `products_all_${parsedLimit}_o${parsedOffset}`;

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const applyLimitOffset = (queryRef: admin.firestore.Query<admin.firestore.DocumentData>) => {
    let q = queryRef;
    if (parsedOffset > 0) {
      q = q.offset(parsedOffset);
    }
    return q.limit(parsedLimit);
  };

  if (tag) {
    try {
      const tagSnap = await db
        .collection("tags")
        .where("slug", "==", String(tag).toLowerCase().trim())
        .get();
      if (tagSnap.empty) {
        const prodSnap = await applyLimitOffset(db.collection("products").where("tags", "array-contains", tag)).get();
        const products = prodSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
        const responseData = { products };
        cache.set(cacheKey, responseData, 300);
        return res.json(responseData);
      }
      const tagId = tagSnap.docs[0].id;
      const tagData = tagSnap.docs[0].data();

      const prodSnap1 = await applyLimitOffset(db.collection("products").where("tag_id", "==", tagId)).get();
      const prodSnap2 = await applyLimitOffset(db.collection("products").where("tags", "array-contains", tagId)).get();
      const prodSnap3 = await applyLimitOffset(db.collection("products").where("tags", "array-contains", tagData.name)).get();

      const productsMap = new Map<string, Product>();
      [...prodSnap1.docs, ...prodSnap2.docs, ...prodSnap3.docs].forEach((doc) => {
        productsMap.set(doc.id, { id: doc.id, ...doc.data() } as Product);
      });

      const responseData = { products: Array.from(productsMap.values()) };
      cache.set(cacheKey, responseData, 900);
      return res.json(responseData);
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  } else if (category) {
    try {
      const q = db.collection("products").where("category", "==", String(category));
      const snap = await applyLimitOffset(q).get();
      const products = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      const responseData = { products };
      cache.set(cacheKey, responseData, 600);
      return res.json(responseData);
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  } else if (isFeatured) {
    try {
      let products: Product[] = [];
      try {
        const q = db.collection("products")
          .where("status", "==", "approved")
          .orderBy("salesCount", "desc");
        const snap = await applyLimitOffset(q).get();
        products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
      } catch {
        safeLogger.warn("Index not found or failed for featured query. Falling back to in-memory sorting.");
        const snap = await db.collection("products")
          .where("status", "==", "approved")
          .limit(200)
          .get();
        products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
        products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        products = products.slice(parsedOffset, parsedOffset + parsedLimit);
      }
      const responseData = { products };
      cache.set(cacheKey, responseData, 300);
      return res.json(responseData);
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  } else if (isPremium) {
    try {
      let products: Product[] = [];
      try {
        const q = db.collection("products")
          .where("status", "==", "approved")
          .where("isPremium", "==", true);
        const snap = await applyLimitOffset(q).get();
        products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
      } catch {
        safeLogger.warn("Index not found or failed for premium query. Falling back to in-memory filtering.");
        const snap = await db.collection("products")
          .where("status", "==", "approved")
          .limit(200)
          .get();
        products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
        products = products.filter(p => (p as Product & { isPremium?: boolean }).isPremium === true).slice(parsedOffset, parsedOffset + parsedLimit);
      }
      const responseData = { products };
      cache.set(cacheKey, responseData, 300);
      return res.json(responseData);
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  } else if (isFlash) {
    try {
      let products: Product[] = [];
      try {
        const q = db.collection("products")
          .where("status", "==", "approved")
          .where("flashSaleActive", "==", true);
        const snap = await applyLimitOffset(q).get();
        products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
      } catch {
        safeLogger.warn("Index not found or failed for flash query. Falling back to in-memory filtering.");
        const snap = await db.collection("products")
          .where("status", "==", "approved")
          .limit(200)
          .get();
        products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
        products = products.filter(p => p.flashSaleActive === true).slice(parsedOffset, parsedOffset + parsedLimit);
      }
      const responseData = { products };
      cache.set(cacheKey, responseData, 120);
      return res.json(responseData);
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  } else {
    try {
      let products: Product[] = [];
      try {
        const q = db.collection("products").orderBy("created_at", "desc");
        const snap = await applyLimitOffset(q).get();
        products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
      } catch {
        try {
          const q = db.collection("products").orderBy("createdAt", "desc");
          const snap = await applyLimitOffset(q).get();
          products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
        } catch {
          const snap = await db.collection("products").limit(200).get();
          products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
          products.sort((a, b) => {
            const timeA = typeof a.createdAt === "object" && a.createdAt && "seconds" in a.createdAt 
              ? (a.createdAt as { seconds: number }).seconds * 1000 
              : new Date(String(a.createdAt || 0)).getTime();
            const timeB = typeof b.createdAt === "object" && b.createdAt && "seconds" in b.createdAt 
              ? (b.createdAt as { seconds: number }).seconds * 1000 
              : new Date(String(b.createdAt || 0)).getTime();
            return timeB - timeA;
          });
          products = products.slice(parsedOffset, parsedOffset + parsedLimit);
        }
      }
      const responseData = { products };
      cache.set(cacheKey, responseData, 600);
      return res.json(responseData);
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  }
});

productCatalogRouter.get("/api/v1/products/shop", async (req, res) => {
  try {
    const { category, subcategory, subsubcategory, wilaya, tag, limit: queryLimit, offset: queryOffset } = req.query;
    const parsedLimit = queryLimit ? parseInt(String(queryLimit), 10) : 24;
    const parsedOffset = queryOffset ? parseInt(String(queryOffset), 10) : 0;

    let queryRef: admin.firestore.Query<admin.firestore.DocumentData> = db.collection("products");
    queryRef = queryRef.where("status", "in", ["active", "approved"]);

    if (category && category !== "Tous") {
      queryRef = queryRef.where("category", "==", String(category));
    }
    if (subcategory) {
      queryRef = queryRef.where("subcategory", "==", String(subcategory));
    }
    if (subsubcategory) {
      queryRef = queryRef.where("subsubcategory", "==", String(subsubcategory));
    }
    if (wilaya && wilaya !== "Tous") {
      queryRef = queryRef.where("wilaya", "==", String(wilaya));
    }

    const snap = await queryRef.get();
    let products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));

    if (tag) {
      const tagStr = String(tag).toLowerCase().trim();
      products = products.filter((p) => 
        (Array.isArray(p.tags) && p.tags.some((t) => String(t).toLowerCase() === tagStr)) ||
        ((p as Product & { tag_id?: string }).tag_id && String((p as Product & { tag_id?: string }).tag_id).toLowerCase() === tagStr)
      );
    }

    products.sort((a, b) => {
      const dateA = new Date(String(a.createdAt || 0)).getTime();
      const dateB = new Date(String(b.createdAt || 0)).getTime();
      return dateB - dateA;
    });

    const paginatedProducts = products.slice(parsedOffset, parsedOffset + parsedLimit);

    return res.json({
      products: paginatedProducts,
      hasMore: products.length > parsedOffset + parsedLimit,
      totalCount: products.length
    });
  } catch (error: unknown) {
    safeLogger.error("Shop endpoint error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

productCatalogRouter.post("/api/v1/products/batch", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "ids must be an array of product IDs" });
    }
    if (ids.length === 0) {
      return res.json({ products: [] });
    }

    const products: Product[] = [];
    const chunks: string[][] = [];
    const chunkSize = 30;
    for (let i = 0; i < ids.length; i += chunkSize) {
      chunks.push(ids.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      const snap = await db.collection("products")
        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
        .get();
      snap.docs.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
    }

    return res.json({ products });
  } catch (error: unknown) {
    safeLogger.error("Batch products fetch error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

productCatalogRouter.get("/api/v1/products/cross-sell", async (req, res) => {
  try {
    const { sellerId, category, currentProductId, limit: qLimit } = req.query;
    if (!sellerId) {
      return res.status(400).json({ error: "sellerId is required" });
    }
    const parsedLimit = qLimit ? parseInt(String(qLimit), 10) : 4;

    if (category) {
      const snap1 = await db.collection("products")
        .where("sellerId", "==", String(sellerId))
        .where("category", "==", String(category))
        .where("status", "==", "approved")
        .limit(parsedLimit)
        .get();
      if (!snap1.empty) {
        const products = snap1.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        return res.json({ products });
      }
    }

    const snap2 = await db.collection("products")
      .where("sellerId", "==", String(sellerId))
      .where("status", "==", "approved")
      .limit(parsedLimit + 1)
      .get();
    
    let products = snap2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    if (currentProductId) {
      products = products.filter(p => p.id !== String(currentProductId));
    }
    products = products.slice(0, parsedLimit);

    return res.json({ products });
  } catch (error: unknown) {
    safeLogger.error("Cross-sell error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

productCatalogRouter.get("/api/v1/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("products").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json({ id: snap.id, ...snap.data() });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

productCatalogRouter.get("/api/v1/products-by-tag", async (req, res) => {
  try {
    const { tag } = req.query;
    if (!tag) {
      return res.status(400).json({ error: "Le slug du tag est requis" });
    }

    const cacheKey = `products_tag_obj_${tag}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      safeLogger.debug("[Cache Hit] Serving from memory", { cacheKey });
      return res.json(cachedData);
    }

    const tagSnap = await db
      .collection("tags")
      .where("slug", "==", String(tag).toLowerCase().trim())
      .get();
    if (tagSnap.empty) {
      return res.json({ products: [], tag: { name: tag, slug: tag } });
    }
    const tagId = tagSnap.docs[0].id;
    const tagData = tagSnap.docs[0].data();

    const prodSnap1 = await db
      .collection("products")
      .where("tag_id", "==", tagId)
      .limit(50)
      .get();
    const prodSnap2 = await db
      .collection("products")
      .where("tags", "array-contains", tagId)
      .limit(50)
      .get();
    const prodSnap3 = await db
      .collection("products")
      .where("tags", "array-contains", tagData.name)
      .limit(50)
      .get();

    const productsMap = new Map<string, Product>();
    [...prodSnap1.docs, ...prodSnap2.docs, ...prodSnap3.docs].forEach(
      (doc) => {
        productsMap.set(doc.id, { id: doc.id, ...doc.data() } as Product);
      },
    );

    const responseData = {
      products: Array.from(productsMap.values()),
      tag: { id: tagId, name: tagData.name, slug: tag },
    };
    cache.set(cacheKey, responseData, 900);
    res.json(responseData);
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

productCatalogRouter.get("/api/v1/products-by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docSnap = await db.collection("products").doc(id).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Product not found" });
    }
    const product = { id: docSnap.id, ...docSnap.data() } as { id: string; sellerId?: string; shopId?: string; [key: string]: unknown };
    
    let shop = null;
    const sellerId = product.sellerId || product.shopId;
    if (sellerId) {
      const sellerSnap = await db.collection("sellers").doc(sellerId).get();
      if (sellerSnap.exists) {
        shop = { id: sellerSnap.id, ...sellerSnap.data() };
      } else {
        const shopSnap = await db.collection("shops").doc(sellerId).get();
        if (shopSnap.exists) {
          shop = { id: shopSnap.id, ...shopSnap.data() };
        }
      }
    }
    
    return res.json({ product, shop });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

productCatalogRouter.get("/api/v1/products-by-id/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    
    interface FirestoreReview {
      id: string;
      createdAt?: string | admin.firestore.Timestamp | { toDate(): Date };
      [key: string]: unknown;
    }

    const reviewsSnap = await db.collection("reviews").where("productId", "==", id).limit(100).get();
    const loadedReviews: FirestoreReview[] = reviewsSnap.docs.map(doc => {
      const data = doc.data();
      const review: FirestoreReview = {
        id: doc.id,
        createdAt: data.createdAt,
        ...data
      };
      return review;
    });
    
    loadedReviews.sort((a: FirestoreReview, b: FirestoreReview) => {
      const getTimestamp = (val: FirestoreReview["createdAt"]) => {
        if (!val) return 0;
        if (val instanceof admin.firestore.Timestamp) {
          return val.toDate().getTime();
        }
        if (typeof val === "object" && "toDate" in val) {
          const hasToDate = val as { toDate(): { getTime(): number } };
          if (typeof hasToDate.toDate === "function") {
            return hasToDate.toDate().getTime();
          }
        }
        return new Date(String(val)).getTime();
      };
      const ta = getTimestamp(a.createdAt);
      const tb = getTimestamp(b.createdAt);
      return tb - ta;
    });
    
    return res.json({ reviews: loadedReviews });
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});
