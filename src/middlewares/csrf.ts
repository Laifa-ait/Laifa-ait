import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || "olmart_secure_csrf_secret_key_2026";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a signed CSRF token
 */
export function generateCsrfToken(userIdOrSession?: string): string {
  const timestamp = Date.now().toString();
  const salt = crypto.randomBytes(16).toString("hex");
  const payload = `${userIdOrSession || "guest"}:${timestamp}:${salt}`;
  const hmac = crypto.createHmac("sha256", CSRF_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64");
}

/**
 * Verify a signed CSRF token
 */
export function verifyCsrfToken(token: string): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return false;

    const [userOrSession, timestampStr, salt, providedHmac] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_TTL_MS) {
      return false; // Expired
    }

    const payload = `${userOrSession}:${timestampStr}:${salt}`;
    const expectedHmac = crypto.createHmac("sha256", CSRF_SECRET).update(payload).digest("hex");

    const providedBuffer = Buffer.from(providedHmac, "hex");
    const expectedBuffer = Buffer.from(expectedHmac, "hex");

    if (providedBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Express Middleware for CSRF Protection across state-changing API routes (POST, PUT, DELETE, PATCH)
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // 1. Safe HTTP methods bypass CSRF check
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  // 2. Dev environment & AI Studio iframe sandbox exemption
  const origin = (req.headers.origin || req.headers.referer || "").toLowerCase();
  const host = (req.headers.host || "").toLowerCase();
  if (
    process.env.NODE_ENV !== "production" ||
    origin.includes("ai.studio") ||
    origin.includes("aistudio.google.com") ||
    host.includes("run.app") ||
    host.includes("localhost")
  ) {
    return next();
  }

  // 2. Exempt paths (webhooks with HMAC signatures, CSP reports, telemetry/analytics)
  const path = req.originalUrl || req.url || "";
  if (
    path.includes("/webhooks/") ||
    path.includes("/csp-report") ||
    path.includes("/cron/") ||
    path.includes("/logs/error") ||
    path.includes("/analytics/track")
  ) {
    return next();
  }

  // 3. Extract CSRF token from headers or body
  const token =
    (req.headers["x-csrf-token"] as string) ||
    (req.headers["x-xsrf-token"] as string) ||
    (req.headers["csrf-token"] as string) ||
    req.body?._csrf;

  // 4. Validate Token
  if (token && verifyCsrfToken(token)) {
    return next();
  }

  // 5. Fallback for SPA API requests: Custom header check + Bearer Auth Token
  // Cross-site HTML forms / simple cross-origin requests cannot set custom headers like X-Requested-With
  const customHeader = req.headers["x-requested-with"];
  const authHeader = req.headers["authorization"];

  if (customHeader === "XMLHttpRequest" || (authHeader && authHeader.startsWith("Bearer "))) {
    return next();
  }

  // 6. Block untrusted request
  console.warn(`[Olmart Security] ⚠️ CSRF attack prevented on ${req.method} ${path}`);
  return res.status(403).json({
    success: false,
    error: "Jeton CSRF invalide ou manquant. Veuillez rafraîchir la page et réessayer.",
  });
}

/**
 * Controller endpoint to deliver a fresh CSRF token to frontend clients
 */
export function getCsrfTokenHandler(req: Request, res: Response) {
  const userReq = req as Request & { user?: { uid?: string } };
  const token = generateCsrfToken(userReq.user?.uid);
  return res.json({
    success: true,
    csrfToken: token,
  });
}
