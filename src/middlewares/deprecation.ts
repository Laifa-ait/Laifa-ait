import { Request, Response, NextFunction } from "express";

const loggedDeprecations = new Set<string>();

export const deprecationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const url = req.originalUrl || "";
  // Only track API requests starting with /api/
  if (!url.startsWith("/api/")) {
    return next();
  }

  if (
    url.includes("/v1/") ||
    url.includes("/api/public/") ||
    url.includes("/api/products") ||
    url.includes("/api/search") ||
    url.includes("/api/auth/2fa/") ||
    url.includes("/api/messages/") ||
    url.includes("/api/proxy-video")
  ) {
    return next();
  }
  res.setHeader("X-API-Version", "v1");
  
  // Clean up dynamic IDs in the URL for deduplication (e.g. replace numbers or Firestore-like IDs)
  const normalizedUrl = url.replace(/\/[a-zA-Z0-9_-]{15,}/g, "/:id").split("?")[0];
  
  if (!loggedDeprecations.has(normalizedUrl)) {
    loggedDeprecations.add(normalizedUrl);
    console.warn(`[Deprecation Warning] ⚠️ Legacy endpoint accessed: "${normalizedUrl}". Please migrate the client-side call to the secure "/api/v1" prefix. (Warning logged once)`);
  }
  next();
};
