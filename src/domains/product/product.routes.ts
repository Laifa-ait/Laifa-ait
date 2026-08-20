import { ProductSearchService } from "../../services/ProductSearchService";
import { Router } from "express";
import { admin, db } from "../../config/firebase-admin";
import { HomepageSection, Banner } from "../home/homepage.types";
import { Product } from "./product.types";
import Fuse from "fuse.js";
import he from "he";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300, maxKeys: 1000, useClones: false });

const router = Router();

router.get("/api/v1/public/home-endless-grid", async (req, res) => {
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
    } catch (idxError) {
      console.warn("Index not found or failed for home-endless-grid. Falling back to in-memory query.");
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
    console.error("Error in home-endless-grid:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.get("/api/v1/products", async (req, res, next) => {
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

  const cacheKey = tag 
    ? `products_tag_${tag}_o${parsedOffset}` 
    : category 
      ? `products_cat_${category}_${parsedLimit}_o${parsedOffset}` 
      : isFeatured
        ? `products_featured_${parsedLimit}_o${parsedOffset}`
        : isPremium
          ? `products_premium_${parsedLimit}_o${parsedOffset}`
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
      } catch (idxError) {
        console.warn("Index not found or failed for featured query. Falling back to in-memory sorting.");
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
      } catch (idxError) {
        console.warn("Index not found or failed for premium query. Falling back to in-memory filtering.");
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
  } else {
    try {
      let products: Product[] = [];
      try {
        const q = db.collection("products").orderBy("created_at", "desc");
        const snap = await applyLimitOffset(q).get();
        products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
      } catch (e1) {
        try {
          const q = db.collection("products").orderBy("createdAt", "desc");
          const snap = await applyLimitOffset(q).get();
          products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
        } catch (e2) {
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

router.get("/api/v1/products/shop", async (req, res) => {
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
    console.error("Shop endpoint error:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.post("/api/v1/products/batch", async (req, res) => {
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
    console.error("Batch products fetch error:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.get("/api/v1/products/cross-sell", async (req, res) => {
  try {
    const { sellerId, category, currentProductId, limit: qLimit } = req.query;
    if (!sellerId) {
      return res.status(400).json({ error: "sellerId is required" });
    }
    const parsedLimit = qLimit ? parseInt(String(qLimit), 10) : 4;

    // Step 1: Query same seller, but target category
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

    // Step 2: Fallback - Just other products from the same seller
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
    console.error("Cross-sell error:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.get("/api/v1/products/:id", async (req, res) => {
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



router.get("/api/v1/products-by-tag", async (req, res) => {
  try {
    const { tag } = req.query;
    if (!tag) {
      return res.status(400).json({ error: "Le slug du tag est requis" });
    }

    const cacheKey = `products_tag_obj_${tag}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      (process.env.NODE_ENV === 'development' ? console.log : function(){})(`[Cache Hit] Serving ${cacheKey} from memory`);
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

    // Query products
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
    cache.set(cacheKey, responseData, 900); // 15 mins cache
    res.json(responseData);
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

// PUBLIC: Advanced Search using Fuse.js (Memory Cached with pagination, synonyms, and logs)
router.get("/api/v1/search", async (req, res, next) => {
  try {
    const data = await ProductSearchService.performSearch(req);
    return res.json(data);
  } catch (error: unknown) {
    console.error("Search API Error:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

const isBot = (userAgent: string) => {
  const bots = [
    "googlebot",
    "bingbot",
    "yandexbot",
    "duckduckbot",
    "slurp",
    "twitterbot",
    "facebookexternalhit",
    "linkedinbot",
    "embedly",
    "baiduspider",
    "pinterest",
    "slackbot",
    "vkshare",
    "facebot",
    "outbrain",
    "whatsapp",
    "telegrambot",
  ];
  const userAgentLower = userAgent.toLowerCase();
  return bots.some((bot) => userAgentLower.includes(bot));
};

router.get("/product/:id", async (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  if (isBot(userAgent)) {
    try {
      const productSnap = await db
        .collection("products")
        .doc(req.params.id)
        .get();
      if (!productSnap.exists) {
        return next();
      }
      const p = productSnap.data();
      const shopSnap = p?.sellerId
        ? await db.collection("publicProfiles").doc(p.sellerId).get()
        : null;
      const shopName = shopSnap?.exists
        ? shopSnap.data()?.name || "Boutique"
        : "Boutique";
      const image =
        p?.image || (p?.images && p?.images.length > 0 ? p.images[0] : "");

      const html = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;">
          <title>${he.encode(p?.name || "Produit")} - ${he.encode(shopName)}</title>
          <meta name="description" content="${he.encode((p?.description || "").substring(0, 160))}">
          <meta property="og:title" content="${he.encode(p?.name || "Produit")}">
          <meta property="og:description" content="${he.encode((p?.description || "").substring(0, 160))}">
          <meta property="og:image" content="${he.encode(image || "")}">
          <meta property="product:price:amount" content="${he.encode(String(p?.promoPrice || p?.price || 0))}">
          <meta property="product:price:currency" content="DZD">
          <meta name="twitter:card" content="summary_large_image">
        </head>
        <body>
          <h1>${he.encode(p?.name || "")}</h1>
          <img src="${he.encode(image || "")}" alt="${he.encode(p?.name || "")}">
          <p>${he.encode(p?.description || "")}</p>
          <p>Prix: ${he.encode(String(p?.promoPrice || p?.price || 0))} DA</p>
          <p>Vendu par: ${he.encode(shopName)}</p>
        </body>
        </html>
      `;
      return res.send(html);
    } catch (e) {
      console.error("Error pre-rendering bot", e);
      return next();
    }
  }
  next();
});

// In-memory cache variables for sitemap to reduce Firestore reads (R50)
let cachedSitemapXml: string | null = null;
let cachedSitemapTime = 0;
const SITEMAP_CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// GET /sitemap.xml - Dynamic Sitemap Generation for SEO (R50)
router.get("/sitemap.xml", async (req, res) => {
  try {
    const now = Date.now();
    if (cachedSitemapXml && (now - cachedSitemapTime < SITEMAP_CACHE_DURATION_MS)) {
      res.header("Content-Type", "application/xml");
      res.header("Cache-Control", "public, max-age=14400"); // Cache for 4 hours on client/CDN
      return res.status(200).send(cachedSitemapXml);
    }

    const primaryDomain = "https://olmart.dz";

    // Start with static URLs
    const staticUrls = [
      { loc: `${primaryDomain}/`, priority: "1.0", changefreq: "daily" },
      { loc: `${primaryDomain}/shop`, priority: "0.9", changefreq: "daily" },
      { loc: `${primaryDomain}/auth`, priority: "0.5", changefreq: "monthly" },
      { loc: `${primaryDomain}/privacy-policy`, priority: "0.3", changefreq: "yearly" },
      { loc: `${primaryDomain}/refund-policy`, priority: "0.3", changefreq: "yearly" },
      { loc: `${primaryDomain}/support`, priority: "0.5", changefreq: "monthly" },
      { loc: `${primaryDomain}/categories`, priority: "0.6", changefreq: "weekly" },
      { loc: `${primaryDomain}/premium-collection`, priority: "0.8", changefreq: "weekly" },
      { loc: `${primaryDomain}/featured`, priority: "0.8", changefreq: "daily" },
      { loc: `${primaryDomain}/compare`, priority: "0.5", changefreq: "monthly" },
      { loc: `${primaryDomain}/shipping-calculator`, priority: "0.5", changefreq: "monthly" },
      { loc: `${primaryDomain}/shops`, priority: "0.8", changefreq: "daily" }
    ];

    const xmlItems: string[] = [];

    // Helper to format dates safely to ISO-8601
    const formatDate = (rawDate: unknown): string => {
      if (!rawDate) return "";
      try {
        if (rawDate instanceof admin.firestore.Timestamp) {
          return rawDate.toDate().toISOString();
        } else if (rawDate instanceof Date) {
          return rawDate.toISOString();
        } else if (typeof rawDate === "object" && rawDate && "toDate" in rawDate && typeof (rawDate as { toDate: () => Date }).toDate === "function") {
          return (rawDate as { toDate: () => Date }).toDate().toISOString();
        } else if (typeof rawDate === "string" || typeof rawDate === "number") {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            return d.toISOString();
          }
        }
      } catch (err) {
        // Fallback to empty
      }
      return "";
    };

    const escapeXml = (unsafe: string): string => {
      return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
          default: return c;
        }
      });
    };

    // 1. Add Static Pages
    for (const url of staticUrls) {
      xmlItems.push(`  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>
  </url>`);
    }

    // 2. Fetch Active Products (limit to 1000 to keep generation fast and memory-safe)
    try {
      const productsSnap = await db
        .collection("products")
        .where("status", "==", "active")
        .limit(1000)
        .get();

      productsSnap.forEach((doc) => {
        const data = doc.data();
        const loc = `${primaryDomain}/product/${doc.id}`;
        const lastmod = formatDate(data.updatedAt || data.updated_at || data.created_at);
        
        let urlBlock = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <priority>0.8</priority>\n    <changefreq>weekly</changefreq>`;
        if (lastmod) {
          urlBlock += `\n    <lastmod>${lastmod}</lastmod>`;
        }
        urlBlock += `\n  </url>`;
        xmlItems.push(urlBlock);
      });
    } catch (err) {
      console.error("Error fetching products for dynamic sitemap:", err);
    }

    // 3. Fetch Public/Approved Sellers
    try {
      const sellersSnap = await db
        .collection("users")
        .where("role", "==", "seller")
        .limit(200)
        .get();

      sellersSnap.forEach((doc) => {
        const data = doc.data();
        // Only include completed/active seller store profiles
        if (data.onboardingCompleted !== false && (data.shopName || data.displayName)) {
          const loc = `${primaryDomain}/store/${doc.id}`;
          const lastmod = formatDate(data.updatedAt || data.updated_at || data.createdAt);
          let urlBlock = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <priority>0.7</priority>\n    <changefreq>weekly</changefreq>`;
          if (lastmod) {
            urlBlock += `\n    <lastmod>${lastmod}</lastmod>`;
          }
          urlBlock += `\n  </url>`;
          xmlItems.push(urlBlock);
        }
      });
    } catch (err) {
      console.error("Error fetching sellers for dynamic sitemap:", err);
    }

    // 4. Fetch Public Tags
    try {
      const tagsSnap = await db
        .collection("tags")
        .limit(100)
        .get();

      tagsSnap.forEach((doc) => {
        const data = doc.data();
        if (data.slug) {
          const catalogueLoc = `${primaryDomain}/catalogue/${data.slug}`;
          xmlItems.push(`  <url>
    <loc>${escapeXml(catalogueLoc)}</loc>
    <priority>0.6</priority>
    <changefreq>weekly</changefreq>
  </url>`);
        }
        
        // Also tag landing pages
        const tagLoc = `${primaryDomain}/tags/${doc.id}`;
        xmlItems.push(`  <url>
    <loc>${escapeXml(tagLoc)}</loc>
    <priority>0.5</priority>
    <changefreq>weekly</changefreq>
  </url>`);
      });
    } catch (err) {
      console.error("Error fetching tags for dynamic sitemap:", err);
    }

    // Generate XML content
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems.join("\n")}
</urlset>`;

    // Save to server-side memory cache
    cachedSitemapXml = sitemapXml;
    cachedSitemapTime = now;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=14400"); // Cache for 4 hours
    return res.status(200).send(sitemapXml);

  } catch (error: unknown) {
    console.error("Critical error generating sitemap:", error);
    return res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?>\n<error>Internal Server Error</error>`);
  }
});

router.get("/api/v1/stores/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    if (!sellerId) return res.status(400).json({ error: "Missing sellerId" });

    const decodedId = decodeURIComponent(sellerId);
    let storeData: Record<string, unknown> | null = null;

    // 1. Check publicProfiles and users collections in parallel
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

    // 2. Query users collection by shopSlug, shopName, displayName if needed
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

    // 4. Fetch store products
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
      // Check products by sellerId or sellerName
      let prodSnap = null;
      try {
        prodSnap = await db.collection("products").where("sellerId", "==", sellerId).limit(50).get();
      } catch (err) {
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

router.get("/api/v1/banners/:id", async (req, res) => {
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
    cache.set(cacheKey, bannerData, 900); // 15 minutes cache
    return res.json(bannerData);
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.get("/api/v1/collections/:collectionId", async (req, res) => {
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

    // 1. Fetch active homepage sections to find matching one
    const sectionsSnap = await db.collection("homepage_sections").limit(50).get();
    let matchingSection: HomepageSection | any = null;
    
    sectionsSnap.forEach((doc) => {
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
      }
    });

    // 2. Fetch banners
    const bannersSnap = await db.collection("banners").limit(30).get();
    let matchingBanner: Banner | any = null;

    bannersSnap.forEach((doc) => {
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
      }
    });

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
          console.error("Error loading seasonal theme:", themeErr);
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
    cache.set(cacheKey, responseData, 600); // 10 mins cache
    return res.json(responseData);
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.get("/api/v1/settings/shipping", async (req, res) => {
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
    cache.set(cacheKey, shippingData, 1800); // 30 minutes cache
    return res.json(shippingData);
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
  }
});

router.get("/api/v1/products-by-id/:id", async (req, res) => {
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

router.get("/api/v1/products-by-id/:id/reviews", async (req, res) => {
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

export default router;
