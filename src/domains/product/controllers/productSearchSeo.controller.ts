import { Router } from "express";
import { db } from "../../../config/firebase-admin";
import { ProductSearchService } from "../../../services/ProductSearchService";
import he from "he";
import { safeLogger } from "../../../utils/logger";
import { sitemapRouter } from "./sitemap.controller";

export const productSearchSeoRouter = Router();

// Mount sitemap
productSearchSeoRouter.use(sitemapRouter);

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
