import React from "react";

/**
 * Robust wrapper for React.lazy that handles dynamic import failures.
 * Retries fetch up to maxAttempts times and performs a single page reload if chunks are stale/invalidated.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T } | T>,
  keyName?: string
): React.LazyExoticComponent<T> {
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
        if (module && typeof module === "object" && "default" in module) {
          return module as { default: T };
        } else if (module) {
          return { default: module as T };
        }
        throw new Error("Module not found");
      } catch (error: unknown) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : "";

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
