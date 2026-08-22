import React from "react";

/**
 * Robust wrapper for React.lazy that handles dynamic import failures.
 * Retries fetch up to maxAttempts times and performs a single page reload if chunks are stale/invalidated.
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<any>,
  keyName?: string
) {
  return React.lazy(async () => {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const module = await componentImport();
        if (keyName) {
          try {
            window.sessionStorage.removeItem(`lazy_reload_${keyName}`);
          } catch {
            /* ignore storage errors */
          }
        }
        if (module && module.default) {
          return module;
        } else if (module) {
          return { default: module };
        }
        return module;
      } catch (error: any) {
        const errorMsg =
          error?.message ||
          (typeof error === "string" ? error : "") ||
          "";

        const isDynamicImportError =
          errorMsg.includes("Failed to fetch dynamically imported module") ||
          errorMsg.includes("Importing a module script failed") ||
          errorMsg.includes("error loading dynamically imported module") ||
          errorMsg.includes("dynamically imported module");

        if (!isDynamicImportError || attempts >= maxAttempts) {
          if (isDynamicImportError && keyName) {
            try {
              const reloadKey = `lazy_reload_${keyName}`;
              const reloaded = window.sessionStorage.getItem(reloadKey);
              if (!reloaded) {
                window.sessionStorage.setItem(reloadKey, "true");
                window.location.reload();
                return new Promise<{ default: T }>(() => {});
              }
            } catch {
              /* ignore storage errors */
            }
          }
          throw error;
        }

        // Wait 300ms before retrying
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    throw new Error(`Failed to load component after ${maxAttempts} attempts`);
  });
}
