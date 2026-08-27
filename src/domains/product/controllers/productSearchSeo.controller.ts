import { Router } from "express";
import { admin, db } from "../../../config/firebase-admin";
import { ProductSearchService } from "../../../services/ProductSearchService";
import he from "he";
import { safeLogger } from "../../../utils/logger";

export const productSearchSeoRouter = Router();

productSearchSeoRouter.get("/api/v1/search", async (req, res) => {
  try {
    const data = await ProductSearchService.performSearch(req);
    return res.json(data);
  } catch (error: unknown) {
    safeLogger.error("Search API Error", { err: error instanceof Error ? error.message : String(error) });
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

productSearchSeoRouter.get("/product/:id", async (req, res, next) => {
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
      safeLogger.error("Error pre-rendering bot", { err: e instanceof Error ? e.message : String(e) });
      return next();
    }
  }
  next();
});

let cachedSitemapXml: string | null = null;
let cachedSitemapTime = 0;
const SITEMAP_CACHE_DURATION_MS = 60 * 60 * 1000;

productSearchSeoRouter.get("/sitemap.xml", async (_req, res) => {
  try {
    const now = Date.now();
    if (cachedSitemapXml && (now - cachedSitemapTime < SITEMAP_CACHE_DURATION_MS)) {
      res.header("Content-Type", "application/xml");
      res.header("Cache-Control", "public, max-age=14400");
      return res.status(200).send(cachedSitemapXml);
    }

    const primaryDomain = "https://olmart.dz";

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
      } catch {
        // Fallback
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

    for (const url of staticUrls) {
      xmlItems.push(`  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>
  </url>`);
    }

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
      safeLogger.error("Error fetching products for dynamic sitemap", { err: err instanceof Error ? err.message : String(err) });
    }

    try {
      const sellersSnap = await db
        .collection("users")
        .where("role", "==", "seller")
        .limit(200)
        .get();

      sellersSnap.forEach((doc) => {
        const data = doc.data();
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
      safeLogger.error("Error fetching sellers for dynamic sitemap", { err: err instanceof Error ? err.message : String(err) });
    }

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
        
        const tagLoc = `${primaryDomain}/tags/${doc.id}`;
        xmlItems.push(`  <url>
    <loc>${escapeXml(tagLoc)}</loc>
    <priority>0.5</priority>
    <changefreq>weekly</changefreq>
  </url>`);
      });
    } catch (err) {
      safeLogger.error("Error fetching tags for dynamic sitemap", { err: err instanceof Error ? err.message : String(err) });
    }

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems.join("\n")}
</urlset>`;

    cachedSitemapXml = sitemapXml;
    cachedSitemapTime = now;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=14400");
    return res.status(200).send(sitemapXml);

  } catch (error: unknown) {
    safeLogger.error("Critical error generating sitemap", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?>\n<error>Internal Server Error</error>`);
  }
});
