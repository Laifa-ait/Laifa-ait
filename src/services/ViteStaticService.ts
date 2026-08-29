import express, { Express, Response } from "express";
import path from "path";
import { promises as fsPromises, existsSync } from "fs";
import { createServer as createViteServer } from "vite";
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
  return isStaticBuildValid && cachedHtmlTemplate.length > 50;
}

export async function setupViteAndStaticServing(app: Express): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    try {
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

  app.use("/locales", express.static(path.join(distPath, "locales"), { maxAge: "1y", immutable: true }));
  app.use(
    express.static(distPath, {
      index: false,
      maxAge: "1y",
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else if (filePath.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  try {
    if (existsSync(indexHtmlPath)) {
      const content = await fsPromises.readFile(indexHtmlPath, "utf-8");
      if (content && content.trim().length > 50 && content.includes('id="root"')) {
        // Deep verification: Check referenced JS entry script/asset exists
        const scriptMatch = content.match(/src=["'](\/assets\/[^"']+\.js)["']/i);
        let assetsValid = true;
        if (scriptMatch && scriptMatch[1]) {
          const referencedJsPath = path.join(distPath, scriptMatch[1].replace(/^\//, ""));
          if (!existsSync(referencedJsPath)) {
            safeLogger.error("[CRITICAL BUILD ERROR] Referenced main JS chunk does not exist on disk", { referencedJsPath });
            assetsValid = false;
          }
        }

        if (assetsValid) {
          cachedHtmlTemplate = content;
          isStaticBuildValid = true;
        } else {
          isStaticBuildValid = false;
        }
      } else {
        safeLogger.error("[CRITICAL BUILD ERROR] dist/index.html is empty or invalid (missing root container)");
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
