import { Router } from "express";
import { admin, db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";

export const sitemapRouter = Router();

let cachedSitemapXml: string | null = null;
let cachedSitemapTime = 0;
const SITEMAP_CACHE_DURATION_MS = 60 * 60 * 1000;

sitemapRouter.get("/sitemap.xml", async (_req, res) => {
  try {
    const now = Date.now();
    if (cachedSitemapXml && now - cachedSitemapTime < SITEMAP_CACHE_DURATION_MS) {
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
      { loc: `${primaryDomain}/shops`, priority: "0.8", changefreq: "daily" },
    ];

    const xmlItems: string[] = [];

    const formatDate = (rawDate: unknown): string => {
      if (!rawDate) return "";
      try {
        if (rawDate instanceof admin.firestore.Timestamp) {
          return rawDate.toDate().toISOString();
        } else if (rawDate instanceof Date) {
          return rawDate.toISOString();
        } else if (
          typeof rawDate === "object" &&
          rawDate &&
          "toDate" in rawDate &&
          typeof (rawDate as { toDate: () => Date }).toDate === "function"
        ) {
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
          case "<":
            return "&lt;";
          case ">":
            return "&gt;";
          case "&":
            return "&amp;";
          case "'":
            return "&apos;";
          case '"':
            return "&quot;";
          default:
            return c;
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
      safeLogger.error("Error fetching products for dynamic sitemap", {
        err: err instanceof Error ? err.message : String(err),
      });
    }

    try {
      const sellersSnap = await db
        .collection("users")
        .where("role", "==", "seller")
        .limit(200)
        .get();

      sellersSnap.forEach((doc) => {
        const loc = `${primaryDomain}/shop/${doc.id}`;
        xmlItems.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
    <priority>0.7</priority>
    <changefreq>daily</changefreq>
  </url>`);
      });
    } catch (err) {
      safeLogger.error("Error fetching sellers for dynamic sitemap", {
        err: err instanceof Error ? err.message : String(err),
      });
    }

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems.join("\n")}
</urlset>`;

    cachedSitemapXml = sitemapContent;
    cachedSitemapTime = now;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=14400");
    return res.status(200).send(sitemapContent);
  } catch (error: unknown) {
    safeLogger.error("Error generating sitemap.xml", {
      err: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).send("Erreur lors de la génération du sitemap.");
  }
});
