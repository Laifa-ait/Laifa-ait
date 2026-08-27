import { Request, Response, NextFunction } from "express";

const loggedDeprecations = new Set<string>();

export const deprecationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const url = req.originalUrl || "";
  // Only track API requests starting with /api/
  if (!url.startsWith("/api/")) {
    return next();
  }

  // Explicitly log routes that match deprecated signatures (e.g., "/v0/", "/legacy/", "/old/")
  const isDeprecated =
    url.includes("/v0/") ||
    url.includes("/legacy/") ||
    url.includes("/old/");

  if (isDeprecated) {
    res.setHeader("X-API-Version", "v1");
    
    // Clean up dynamic IDs in the URL for deduplication (e.g. replace numbers or Firestore-like IDs)
    const normalizedUrl = url.replace(/\/[a-zA-Z0-9_-]{15,}/g, "/:id").split("?")[0];
    
    if (!loggedDeprecations.has(normalizedUrl)) {
      loggedDeprecations.add(normalizedUrl);
      console.warn(`[Deprecation Warning] ⚠️ Legacy endpoint accessed: "${normalizedUrl}". Please migrate the client-side call to the secure "/api/v1" prefix. (Warning logged once)`);
    }
  }

  next();
};
