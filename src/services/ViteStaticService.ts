import express, { Express, Response } from "express";
import path from "path";
import { promises as fsPromises, existsSync } from "fs";
import { getProductSeoData, injectProductSeo } from "./ProductSeoService";
import { injectNonceToHtml } from "../middlewares/security";
import { safeLogger } from "../utils/logger";

let cachedHtmlTemplate = "";
let isStaticBuildValid = false;

/**
 * Resets or overrides static state for testing purposes only.
 */
export function setStaticStateForTesting(valid: boolean, template: string): void {
  isStaticBuildValid = valid;
  cachedHtmlTemplate = template;
}

/**
 * Returns true if the frontend static build is ready in production,
 * or if running in development mode.
 */
export function isFrontendReady(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return isStaticBuildValid && cachedHtmlTemplate.length > 50 && cachedHtmlTemplate.includes('id="root"');
}

/**
 * Validates production HTML template structure and ensures all referenced JavaScript asset chunks exist on disk.
 */
export function validateProductionHtmlTemplate(content: string, distPath: string): boolean {
  if (!content || content.trim().length <= 50 || !content.includes('id="root"')) {
    return false;
  }

  // Deep verification: Extract ALL referenced /assets/*.js script chunks and ensure each exists on disk
  const scriptMatches = content.matchAll(/src=["'](\/assets\/[^"']+\.js)["']/gi);
  for (const match of scriptMatches) {
    if (match[1]) {
      const referencedJsPath = path.join(distPath, match[1].replace(/^\//, ""));
      if (!existsSync(referencedJsPath)) {
        safeLogger.error("[CRITICAL BUILD ERROR] Referenced JS asset chunk does not exist on disk", { referencedJsPath });
        return false;
      }
    }
  }

  return true;
}

export async function setupViteAndStaticServing(app: Express): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false, ws: false },
        appType: "spa",
      });
      app.use(vite.middlewares);

      app.get("*", async (req, res, next) => {
        if (req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/api-docs")) {
          return next();
        }
        try {
          const indexHtmlPath = path.resolve(process.cwd(), "index.html");
          let template = await fsPromises.readFile(indexHtmlPath, "utf-8");
          template = await vite.transformIndexHtml(req.originalUrl, template);
          
          const nonce = res.locals.cspNonce || "";
          if (nonce) {
            template = injectNonceToHtml(template, nonce);
          }
          
          res.status(200).setHeader("Content-Type", "text/html; charset=utf-8").send(template);
        } catch (e: unknown) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
      return;
    } catch (err: unknown) {
      safeLogger.error("[Olmart Vite] ❌ Vite dev middleware failed to initialize, falling back to static file serving", { err: err instanceof Error ? err.message : String(err) });
    }
  }

  const distPath = path.join(process.cwd(), "dist");
  const indexHtmlPath = path.join(distPath, "index.html");

  app.use("/locales", express.static(path.join(distPath, "locales"), { maxAge: "1h", immutable: false, setHeaders: (res) => { res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate"); } }));
  app.use(
    express.static(distPath, {
      index: false,
      maxAge: 0,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else if (filePath.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.includes("/locales/")) {
          res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
        } else {
          res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
        }
      },
    })
  );

  try {
    if (existsSync(indexHtmlPath)) {
      const content = await fsPromises.readFile(indexHtmlPath, "utf-8");
      if (validateProductionHtmlTemplate(content, distPath)) {
        cachedHtmlTemplate = content;
        isStaticBuildValid = true;
      } else {
        safeLogger.error("[CRITICAL BUILD ERROR] dist/index.html failed production structural/asset verification");
        isStaticBuildValid = false;
      }
    } else {
      safeLogger.error("[CRITICAL BUILD ERROR] dist/index.html does not exist in production build");
      isStaticBuildValid = false;
    }
  } catch (e: unknown) {
    safeLogger.error("[CRITICAL BUILD ERROR] index.html loading failed from distPath", { err: e instanceof Error ? e.message : String(e) });
    isStaticBuildValid = false;
  }

  const sendOptimizedHtml = async (res: Response, htmlContent: string) => {
    let content = htmlContent;
    if (!content || content.trim() === "") {
      if (isStaticBuildValid) {
        content = cachedHtmlTemplate;
      }
    }

    const nonce = res.locals.cspNonce || "";

    if (!content || content.trim() === "" || !isStaticBuildValid) {
      safeLogger.error("[CRITICAL ALERT] Serving HTTP 500 because frontend static assets are missing or corrupted");
      res.status(500).setHeader("Content-Type", "text/html; charset=utf-8");
      let errorPage = '<!doctype html><html lang="fr"><head><meta charset="UTF-8"><title>500 - Service Indisponible</title></head><body><div style="font-family:sans-serif;text-align:center;padding:50px;"><h1>500 - Service Indisponible</h1><p>Les ressources de la plateforme sont indisponibles. Veuillez réessayer ultérieurement.</p></div></body></html>';
      if (nonce) {
        errorPage = injectNonceToHtml(errorPage, nonce);
      }
      res.send(errorPage);
      return;
    }

    if (nonce) {
      content = injectNonceToHtml(content, nonce);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(content);
  };

  app.get("/", async (req, res) => {
    await sendOptimizedHtml(res, cachedHtmlTemplate);
  });

  app.get("/product/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await getProductSeoData(productId);
      let html = cachedHtmlTemplate || "";

      if (product) {
        html = injectProductSeo(html, product);
        res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
      }
      await sendOptimizedHtml(res, html);
    } catch (err: unknown) {
      safeLogger.error("Erreur SSR Produit", { err: err instanceof Error ? err.message : String(err) });
      await sendOptimizedHtml(res, cachedHtmlTemplate);
    }
  });

  app.get("*", (req, res) => sendOptimizedHtml(res, cachedHtmlTemplate));
}
