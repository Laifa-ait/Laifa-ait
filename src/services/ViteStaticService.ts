import express, { Express, Response } from "express";
import path from "path";
import { promises as fsPromises, existsSync } from "fs";
import { createServer as createViteServer } from "vite";
import { getProductSeoData, injectProductSeo } from "./ProductSeoService";

let cachedHtmlTemplate = "";
let isStaticBuildValid = false;

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
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
      esbuild: {
        target: "es2022",
        supported: {
          destructuring: true,
        },
      },
      optimizeDeps: {
        esbuildOptions: {
          target: "es2022",
          supported: {
            destructuring: true,
          },
        },
      },
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
        res.status(200).setHeader("Content-Type", "text/html; charset=utf-8").send(template);
      } catch (e: unknown) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
    return;
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
        cachedHtmlTemplate = content;
        isStaticBuildValid = true;
      } else {
        console.error("[CRITICAL BUILD ERROR] ❌ dist/index.html is empty or invalid.");
        isStaticBuildValid = false;
      }
    } else {
      console.error("[CRITICAL BUILD ERROR] ❌ dist/index.html does not exist in production build.");
      isStaticBuildValid = false;
    }
  } catch (e: unknown) {
    console.error("[CRITICAL BUILD ERROR] ❌ index.html loading failed from distPath:", e);
    isStaticBuildValid = false;
  }

  const sendOptimizedHtml = async (res: Response, htmlContent: string) => {
    let content = htmlContent;
    if (!content || content.trim() === "") {
      if (isStaticBuildValid) {
        content = cachedHtmlTemplate;
      }
    }

    if (!content || content.trim() === "" || !isStaticBuildValid) {
      console.error("[CRITICAL ALERT] Serving HTTP 500 because frontend static assets are missing or corrupted.");
      res.status(500).setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(
        '<!doctype html><html lang="fr"><head><meta charset="UTF-8"><title>500 - Service Indisponible</title></head><body><div style="font-family:sans-serif;text-align:center;padding:50px;"><h1>500 - Service Indisponible</h1><p>Les ressources de la plateforme sont indisponibles. Veuillez réessayer ultérieurement.</p></div></body></html>'
      );
      return;
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
      console.error("Erreur SSR Produit:", err);
      await sendOptimizedHtml(res, cachedHtmlTemplate);
    }
  });

  app.get("*", (req, res) => sendOptimizedHtml(res, cachedHtmlTemplate));
}
