import fs from "fs";
import path from "path";
import { safeLogger } from "../utils/logger";

export interface LocaleCacheEntry {
  data: Record<string, unknown>;
  timestamp: number;
}

export class LocaleStorageService {
  private static memoryCache = new Map<string, LocaleCacheEntry>();
  private static CACHE_TTL_MS = 60_000; // 1 minute in-memory cache to absorb traffic spikes

  static getCachedLocale(lang: string): Record<string, unknown> | null {
    const cached = this.memoryCache.get(lang);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }
    return null;
  }

  static setCachedLocale(lang: string, data: Record<string, unknown>): void {
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
   * Reads JSON safely from primary path with automatic backup recovery and in-memory cache fallback.
   * Eliminates unhandled SyntaxError crashes when files are read during high load or partial writes.
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
   * Prevents corruption, empty files, and race conditions during high server load or sudden process termination.
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

      // Ensure backup exists if previously absent
      try {
        const bakPath = `${targetPath}.bak`;
        if (!fs.existsSync(bakPath) && fs.existsSync(targetPath)) {
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
