import fs from "fs";
import path from "path";
import { safeLogger } from "../utils/logger";
import { db, admin } from "../config/firebase-admin";

export interface LocaleCacheEntry {
  data: Record<string, string>;
  timestamp: number;
}

export class LocaleStorageService {
  private static memoryCache = new Map<string, LocaleCacheEntry>();
  private static CACHE_TTL_MS = 60_000; // 1 minute in-memory cache

  static getCachedLocale(lang: string): Record<string, string> | null {
    const cached = this.memoryCache.get(lang);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }
    return null;
  }

  static setCachedLocale(lang: string, data: Record<string, string>): void {
    this.memoryCache.set(lang, { data, timestamp: Date.now() });
  }

  static clearCache(lang?: string): void {
    if (lang) {
      this.memoryCache.delete(lang);
    } else {
      this.memoryCache.clear();
    }
  }

  /**
   * Retrieves merged translations for the requested language.
   * Merges baseline static JSON (build-time bundle) with Firestore dynamic overrides (Cloud Run persistent truth).
   */
  static async getMergedLocale(lang: string): Promise<Record<string, string>> {
    if (!["fr", "ar", "en"].includes(lang)) {
      return {};
    }

    const cached = this.getCachedLocale(lang);
    if (cached) {
      return cached;
    }

    // 1. Read baseline from static files
    const distPath = path.join(process.cwd(), "dist", "locales", `${lang}.json`);
    const publicPath = path.join(process.cwd(), "public", "locales", `${lang}.json`);
    const staticPath = fs.existsSync(distPath) ? distPath : publicPath;
    const baseTranslations = (this.safeReadJson(staticPath, {}) || {}) as Record<string, string>;

    // 2. Fetch authoritative dynamic translations from Firestore
    let dynamicTranslations: Record<string, string> = {};
    try {
      if (db) {
        const docSnap = await db.collection("translations").doc(lang).get();
        if (docSnap.exists) {
          const rawData = docSnap.data() || {};
          const filtered: Record<string, string> = {};
          for (const [key, value] of Object.entries(rawData)) {
            if (typeof value === "string" && !["updatedAt", "updatedBy", "createdAt"].includes(key)) {
              filtered[key] = value;
            }
          }
          dynamicTranslations = filtered;
        }
      }
    } catch (err: unknown) {
      safeLogger.warn("[LocaleStorageService] ⚠️ Failed to fetch Firestore translations, falling back to static", {
        lang,
        err: err instanceof Error ? err.message : String(err),
      });
    }

    // 3. Merge: Firestore dynamic overrides baseline static
    const merged: Record<string, string> = {
      ...baseTranslations,
      ...dynamicTranslations,
    };

    this.setCachedLocale(lang, merged);
    return merged;
  }

  /**
   * Persists translation dictionary to Firestore (Cloud Run compliant) and invalidates in-memory cache.
   */
  static async saveBatchTranslations(
    lang: string,
    content: Record<string, string>,
    adminUid?: string
  ): Promise<boolean> {
    if (!["fr", "ar", "en"].includes(lang)) {
      safeLogger.error("[LocaleStorageService] ❌ Invalid language in saveBatchTranslations", { lang });
      return false;
    }

    const sanitized: Record<string, string> = {};
    for (const [key, val] of Object.entries(content)) {
      if (typeof val === "string" && !["updatedAt", "updatedBy", "createdAt"].includes(key)) {
        sanitized[key] = val;
      }
    }

    try {
      if (db) {
        await db.collection("translations").doc(lang).set(
          {
            ...sanitized,
            updatedAt: admin?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString(),
            updatedBy: adminUid || "admin",
          },
          { merge: true }
        );
      }

      // Invalidate memory cache for this lang
      this.clearCache(lang);

      // In dev environment or if filesystem is writable, update local files as best effort
      const publicPath = path.join(process.cwd(), "public", "locales", `${lang}.json`);
      const distPath = path.join(process.cwd(), "dist", "locales", `${lang}.json`);
      this.safeWriteJsonAtomic(publicPath, sanitized);
      if (fs.existsSync(path.join(process.cwd(), "dist", "locales"))) {
        this.safeWriteJsonAtomic(distPath, sanitized);
      }

      return true;
    } catch (err: unknown) {
      safeLogger.error("[LocaleStorageService] ❌ Failed to save translations to Firestore", {
        lang,
        err: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  }

  /**
   * Persists a single translation key across languages in Firestore.
   */
  static async saveTranslation(
    key: string,
    values: { fr?: string; ar?: string; en?: string },
    adminUid?: string
  ): Promise<boolean> {
    if (!key || typeof key !== "string") return false;

    const langs: Array<"fr" | "ar" | "en"> = ["fr", "ar", "en"];
    for (const lang of langs) {
      const val = values[lang];
      if (val !== undefined && typeof val === "string") {
        try {
          if (db) {
            await db.collection("translations").doc(lang).set(
              {
                [key]: val,
                updatedAt: admin?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString(),
                updatedBy: adminUid || "admin",
              },
              { merge: true }
            );
          }
          this.clearCache(lang);

          // Best effort sync for local dev
          const publicPath = path.join(process.cwd(), "public", "locales", `${lang}.json`);
          const existing = this.safeReadJson(publicPath, {}) as Record<string, string>;
          existing[key] = val;
          this.safeWriteJsonAtomic(publicPath, existing);
        } catch (err: unknown) {
          safeLogger.error("[LocaleStorageService] ❌ Failed to save single translation key", {
            lang,
            key,
            err: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
    return true;
  }

  /**
   * Reads JSON safely from primary path with automatic backup recovery and in-memory cache fallback.
   */
  static safeReadJson(filePath: string, fallback: Record<string, unknown> = {}): Record<string, unknown> {
    try {
      if (!fs.existsSync(filePath)) {
        const bakPath = `${filePath}.bak`;
        if (fs.existsSync(bakPath)) {
          const rawBak = fs.readFileSync(bakPath, "utf8");
          const parsed = JSON.parse(rawBak) as Record<string, unknown>;
          safeLogger.warn("[LocaleStorageService] ⚠️ Primary file missing, restored from backup", { filePath });
          return parsed;
        }
        return fallback;
      }
      const raw = fs.readFileSync(filePath, "utf8");
      return JSON.parse(raw) as Record<string, unknown>;
    } catch (err: unknown) {
      safeLogger.error("[LocaleStorageService] ❌ Failed to parse JSON, attempting .bak recovery", {
        filePath,
        err: err instanceof Error ? err.message : String(err),
      });
      try {
        const bakPath = `${filePath}.bak`;
        if (fs.existsSync(bakPath)) {
          const rawBak = fs.readFileSync(bakPath, "utf8");
          return JSON.parse(rawBak) as Record<string, unknown>;
        }
      } catch {
        // Safe fallback
      }
      return fallback;
    }
  }

  /**
   * Atomically writes JSON to disk using a temporary file and atomic rename.
   */
  static safeWriteJsonAtomic(targetPath: string, content: Record<string, unknown>): boolean {
    try {
      const serialized = JSON.stringify(content, null, 2);
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Step 1: Write to atomic temporary file
      const tempPath = `${targetPath}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;
      fs.writeFileSync(tempPath, serialized, "utf8");

      // Step 2: Keep backup copy of current valid file
      try {
        if (fs.existsSync(targetPath)) {
          fs.copyFileSync(targetPath, `${targetPath}.bak`);
        }
      } catch {
        // Non-fatal backup warning
      }

      // Step 3: Atomic rename replacing target
      try {
        if (typeof fs.renameSync === "function") {
          fs.renameSync(tempPath, targetPath);
        } else {
          fs.writeFileSync(targetPath, serialized, "utf8");
        }
      } catch {
        fs.writeFileSync(targetPath, serialized, "utf8");
        try {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        } catch {
          // Ignore temp cleanup error
        }
      }

      // Step 4: Ensure backup copy exists
      try {
        const bakPath = `${targetPath}.bak`;
        if (fs.existsSync(targetPath)) {
          fs.copyFileSync(targetPath, bakPath);
        }
      } catch {
        // Non-fatal backup copy
      }

      return true;
    } catch (err: unknown) {
      safeLogger.error("[LocaleStorageService] ❌ Atomic write failed", {
        targetPath,
        err: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  }
}
