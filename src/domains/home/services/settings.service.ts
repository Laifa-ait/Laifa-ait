import { db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";

const settingsCache = new Map<string, { data: unknown; expiry: number }>();

export class SettingsService {
  static clearCache(): void {
    settingsCache.clear();
  }

  static async getCachedOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs = 300000 // 5 minute cache
  ): Promise<T | null> {
    const cached = settingsCache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T;
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const data = await fetcher();
        if (data !== undefined && data !== null) {
          settingsCache.set(key, { data, expiry: Date.now() + ttlMs });
        }
        return data;
      } catch (err: unknown) {
        const errorObj = err as { message?: string; code?: string };
        const isRateLimit =
          errorObj?.message?.includes("Rate exceeded") ||
          errorObj?.message?.includes("RESOURCE_EXHAUSTED") ||
          errorObj?.message?.includes("rate limit") ||
          errorObj?.code === "resource-exhausted" ||
          errorObj?.code === "unavailable";

        if (attempt < 2 && isRateLimit) {
          const delay = 350 * Math.pow(2, attempt) + Math.floor(Math.random() * 150);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        // Return stale cache if available when backend/Firestore is rate limited
        if (cached?.data) {
          return cached.data as T;
        }

        safeLogger.warn("[Olmart Gateway] Settings fetch error", {
          settingKey: key,
          err: errorObj?.message || String(err),
        });
        return null;
      }
    }
    return cached?.data ? (cached.data as T) : null;
  }

  static async getHomepageCategories(): Promise<Record<string, unknown>[]> {
    const data = await this.getCachedOrFetch("homepage-categories", async () => {
      const snap = await db.collection("homepage_categories_v2").limit(100).get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
    return data || [];
  }

  static async getSettingById(id: string): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch(`setting_${id}`, async () => {
      const docSnap = await db.collection("settings").doc(id).get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) || {} : {};
    });
    return data || {};
  }

  static async saveSettingById(id: string, data: Record<string, unknown>): Promise<void> {
    await db.collection("settings").doc(id).set(data, { merge: true });
    this.clearCache();
  }

  static async subscribeNewsletter(email: string): Promise<{ success: boolean; error?: string }> {
    const normEmail = email.trim();
    const existingSnap = await db.collection("newsletterEmails").where("email", "==", normEmail).get();
    if (!existingSnap.empty) {
      return { success: false, error: "ALREADY_SUBSCRIBED" };
    }
    await db.collection("newsletterEmails").add({
      email: normEmail,
      subscribedAt: new Date().toISOString(),
    });
    return { success: true };
  }

  static async getMetadataById(id: string): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch(`metadata_${id}`, async () => {
      const docSnap = await db.collection("metadata").doc(id).get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) || {} : {};
    });
    return data || {};
  }

  static async getSeasonalThemeById(id: string): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch(`theme_${id}`, async () => {
      const docSnap = await db.collection("seasonal_themes").doc(id).get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) || {} : {};
    });
    return data || {};
  }

  static async getUiElementById(id: string): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch(`ui_${id}`, async () => {
      const docSnap = await db.collection("ui_elements").doc(id).get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) || {} : { products: [] };
    });
    return data || { products: [] };
  }

  static async getHomepageCategoriesV2ById(id: string): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch(`hp_cat_${id}`, async () => {
      const docSnap = await db.collection("homepage_categories_v2").doc(id).get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) || {} : {};
    });
    return data || {};
  }

  static async getPlatformStatsById(id: string): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch(`stats_${id}`, async () => {
      const docSnap = await db.collection("platform_stats").doc(id).get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) || {} : {};
    });
    return data || {};
  }

  static async getMonthlyUpdates(): Promise<Record<string, unknown>[]> {
    const updates = await this.getCachedOrFetch("monthly-updates", async () => {
      const snap = await db.collection("site_content_monthly").limit(20).get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
    return updates || [];
  }

  static async getCategoriesHierarchy(): Promise<Record<string, unknown>> {
    const data = await this.getCachedOrFetch("categories-hierarchy", async () => {
      const docSnap = await db.collection("settings").doc("categories").get();
      return docSnap.exists ? (docSnap.data() as Record<string, unknown>) : {};
    });
    return data || {};
  }

  static async getTags(): Promise<Record<string, unknown>[]> {
    const tags = await this.getCachedOrFetch("tags", async () => {
      const snap = await db.collection("tags").get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
    return tags || [];
  }
}
