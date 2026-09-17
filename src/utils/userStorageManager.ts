import { StorageQuotaEstimate } from "../types/documents";

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Ko";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Octets", "Ko", "Mo", "Go", "To"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeIndex = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, safeIndex)).toFixed(dm))} ${sizes[safeIndex]}`;
}

export function calculateLocalStorageSize(): number {
  if (typeof window === "undefined" || !window.localStorage) {
    return 0;
  }
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || "";
        total += (key.length + val.length) * 2; // UTF-16 characters = 2 bytes
      }
    }
  } catch (err) {
    console.warn("[UserStorageManager] Impossible d'estimer le localStorage:", err);
  }
  return total;
}

export async function getStorageQuotaEstimate(): Promise<StorageQuotaEstimate> {
  let usage = 0;
  let quota = 0;

  if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      usage = estimate.usage || 0;
      quota = estimate.quota || 0;
    } catch (e) {
      console.warn("[UserStorageManager] Quota API non disponible:", e);
    }
  }

  const localStorageBytes = calculateLocalStorageSize();
  const effectiveUsage = Math.max(usage, localStorageBytes);
  const effectiveQuota = quota > 0 ? quota : 50 * 1024 * 1024; // 50MB fallback estimate
  const percentUsed = effectiveQuota > 0 ? (effectiveUsage / effectiveQuota) * 100 : 0;

  return {
    usageBytes: effectiveUsage,
    quotaBytes: effectiveQuota,
    percentUsed: Math.min(100, Math.round(percentUsed * 10) / 10),
    localStorageBytes,
    humanUsage: formatBytes(effectiveUsage),
    humanQuota: formatBytes(effectiveQuota),
  };
}

export function clearNonEssentialBrowserStorage(): { clearedKeys: number; clearedBytes: number } {
  if (typeof window === "undefined" || !window.localStorage) {
    return { clearedKeys: 0, clearedBytes: 0 };
  }

  const preservedPrefixes = ["firebase:", "olmart_consent_"];
  let clearedKeys = 0;
  let clearedBytes = 0;

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const shouldPreserve = preservedPrefixes.some((p) => key.startsWith(p));
      if (!shouldPreserve) {
        const val = localStorage.getItem(key) || "";
        clearedBytes += (key.length + val.length) * 2;
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
    clearedKeys++;
  });

  if ("caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (!name.includes("firebase")) {
          caches.delete(name);
        }
      });
    });
  }

  return { clearedKeys, clearedBytes };
}
