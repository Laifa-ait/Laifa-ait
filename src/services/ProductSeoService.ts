import { db } from "../config/firebase-admin";

export interface ProductSeoTimestamp {
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
}

export interface ProductSeoData {
  id: string;
  name?: string;
  description?: string;
  images?: string[];
  image?: string;
  price?: number;
  updatedAt?: ProductSeoTimestamp | Date | string | number | null;
  updated_at?: ProductSeoTimestamp | Date | string | number | null;
  created_at?: ProductSeoTimestamp | Date | string | number | null;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * True LRU Evicting Map implementation for Product SEO metadata caching.
 * Re-accessing a key moves it to the end (most recently used).
 */
export class TrueLRUMap<K, V> extends Map<K, V> {
  constructor(private maxKeys = 1000) {
    super();
  }

  get(key: K): V | undefined {
    if (!super.has(key)) return undefined;
    const value = super.get(key)!;
    // Re-insert to mark as recently used
    super.delete(key);
    super.set(key, value);
    return value;
  }

  set(key: K, value: V): this {
    if (super.has(key)) {
      super.delete(key);
    } else if (this.size >= this.maxKeys) {
      const oldestKey = this.keys().next().value;
      if (oldestKey !== undefined) {
        this.delete(oldestKey);
      }
    }
    return super.set(key, value);
  }
}

const productCache = new TrueLRUMap<string, CacheEntry<ProductSeoData>>(1000);
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cleanupInterval: NodeJS.Timeout | null = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of productCache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      productCache.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function stopProductCacheCleanupTimer() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

/**
 * Robust HTML escaping for safe SSR metadata injection
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function getProductSeoData(productId: string): Promise<ProductSeoData | null> {
  const cached = productCache.get(productId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (!db) return null;

  try {
    const snap = await db.collection("products").doc(productId).get();
    if (snap.exists) {
      const data = { id: snap.id, ...snap.data() } as ProductSeoData;
      productCache.set(productId, { data, timestamp: Date.now() });
      return data;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[ProductSeoService] Error fetching product ${productId}:`, message);
  }

  return null;
}

export function injectProductSeo(htmlTemplate: string, product: ProductSeoData): string {
  if (!htmlTemplate) return "";

  const title = escapeHtml(product.name || "Olmart Marketplace");
  const description = escapeHtml(
    (product.description || "Découvrez ce produit sur Olmart Marketplace.").substring(0, 160)
  );
  const images = product.images || [];
  const rawImage = images.length > 0 ? images[0] : product.image || "";
  const image = escapeHtml(rawImage);

  let lastmod = "";
  const rawDate = product.updatedAt || product.updated_at || product.created_at;
  if (rawDate) {
    try {
      if (typeof rawDate === "object" && rawDate !== null && "toDate" in rawDate && typeof rawDate.toDate === "function") {
        lastmod = rawDate.toDate().toISOString();
      } else if (rawDate instanceof Date) {
        lastmod = rawDate.toISOString();
      } else if (typeof rawDate === "string" || typeof rawDate === "number") {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          lastmod = d.toISOString();
        }
      }
    } catch {
      // Safe fallback
    }
  }

  const html = htmlTemplate.replace(/<title>.*?<\/title>/i, `<title>${title} | Olmart</title>`);

  let metaTags = `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />`;

  if (lastmod) {
    metaTags += `
    <meta name="last-modified" content="${lastmod}" />
    <meta property="og:updated_time" content="${lastmod}" />
    <meta property="product:modified_time" content="${lastmod}" />`;
  }

  metaTags += `\n</head>`;
  return html.replace("</head>", metaTags);
}
