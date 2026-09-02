import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { AuthenticatedRequest } from "./auth";
import { safeLogger } from "../utils/logger";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Safely retrieve the CSRF secret key.
 * Requires CSRF_SECRET in production (>= 32 chars, provided via Secret Manager).
 * Fails fast at startup in production if missing or weak.
 */
function getCsrfSecret(): string {
  const isProd = process.env.NODE_ENV === "production";
  const secret = process.env.CSRF_SECRET;
  const weakSecrets = [
    "changeit",
    "password",
    "secret",
    "1234567890",
    "olmart_dev_csrf_secret_key_2026",
    "olmart_prod_csrf_secret_key_fallback_32bytes_min_2026",
  ];

  if (isProd) {
    if (!secret || secret.trim().length < 32 || weakSecrets.includes(secret.trim().toLowerCase())) {
      throw new Error(
        "[Olmart Security] ❌ Fatal: CSRF_SECRET environment variable must be explicitly defined with at least 32 characters in production (via Secret Manager)."
      );
    }
    return secret.trim();
  }

  // Safe fallback in test and development modes
  return secret?.trim() || "olmart_dev_csrf_secret_key_2026_test_fallback";
}

/**
 * Generate a signed CSRF token bound to the current user or guest session
 */
export function generateCsrfToken(userIdOrSession?: string): string {
  const secret = getCsrfSecret();
  const timestamp = Date.now().toString();
  const salt = crypto.randomBytes(16).toString("hex");
  const boundIdentity = userIdOrSession || "guest";
  const payload = `${boundIdentity}:${timestamp}:${salt}`;
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64");
}

/**
 * Verify a signed CSRF token and strictly check that it is bound to the expected user or guest session
 */
export function verifyCsrfToken(token: string, expectedUserId: string = "guest"): boolean {
  if (!token) return false;
  try {
    const secret = getCsrfSecret();
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return false;

    const [userOrSession, timestampStr, salt, providedHmac] = parts;

    // CSRF Token Session Binding: check if token belongs to the expected user ID
    if (userOrSession !== expectedUserId) {
      return false;
    }

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_TTL_MS) {
      return false; // Expired
    }

    const payload = `${userOrSession}:${timestampStr}:${salt}`;
    const expectedHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const providedBuffer = Buffer.from(providedHmac, "hex");
    const expectedBuffer = Buffer.from(expectedHmac, "hex");

    if (providedBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

const TRUSTED_ORIGINS = [
  "https://olmart.dz",
  "https://www.olmart.dz"
];

/**
 * Strict helper to validate trusted domains.
 * Completely avoids using insecure .includes() on host or origin headers.
 */
function isTrustedOrigin(originString: string): boolean {
  if (!originString) return false;
  
  const originClean = originString.trim();

  // 1. Check exact authorized production origins
  if (TRUSTED_ORIGINS.includes(originClean)) {
    return true;
  }

  // 2. Allow Google AI Studio iframe sandboxes in non-production only
  if (process.env.NODE_ENV !== "production") {
    try {
      const url = new URL(originClean);
      const hostname = url.hostname.toLowerCase();
      
      const isTrustedAIStudio =
        hostname === "ai.studio" ||
        hostname === "aistudio.google.com" ||
        hostname.endsWith(".ai.studio") ||
        hostname.endsWith(".aistudio.google.com");
      
      const isGoogleIframe =
        hostname === "google.com" ||
        hostname.endsWith(".google.com") ||
        hostname === "googleusercontent.com" ||
        hostname.endsWith(".googleusercontent.com");

      const isLocalHost =
        hostname === "localhost" ||
        hostname === "127.0.0.1";

      if ((isTrustedAIStudio || isGoogleIframe || isLocalHost) && (url.protocol === "https:" || url.protocol === "http:")) {
        return true;
      }
    } catch {
      // Fallback if originString is just a hostname
      const hostname = originClean.toLowerCase();
      return (
        hostname === "ai.studio" ||
        hostname === "aistudio.google.com" ||
        hostname.endsWith(".ai.studio") ||
        hostname.endsWith(".aistudio.google.com")
      );
    }
  }

  return false;
}

// Liste EXACTE des routes webhook dont le handler vérifie lui-même la signature HMAC.
const WEBHOOK_EXEMPT_PATHS = new Set([
  "/api/v1/payment/webhook/chargily",
  "/v1/payment/webhook/chargily",
  "/api/v1/payment/webhook/baridimob",
  "/v1/payment/webhook/baridimob",
]);

/**
 * Express Middleware for CSRF Protection across state-changing API routes (POST, PUT, DELETE, PATCH)
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // 1. Safe HTTP methods bypass CSRF check
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  // 2. Strict Exemptions for Local Dev & Trusted AI Studio Sandbox ONLY (using exact matches)
  const origin = (req.headers.origin as string || "").trim();
  const referer = (req.headers.referer as string || "").trim();
  const host = (req.headers.host || "").toLowerCase();

  // Local development exemption (never allowed in production)
  if (process.env.NODE_ENV !== "production") {
    const isLocalHost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      /^localhost:\d+$/.test(host) ||
      /^127\.0\.0\.1:\d+$/.test(host);

    if (isLocalHost) {
      return next();
    }
  }

  // Google AI Studio Workspace / Olmart official secure origin checks
  if (isTrustedOrigin(origin) || isTrustedOrigin(referer)) {
    return next();
  }

  // 3. Strict Exempt paths check using exact pathnames to prevent substring bypasses
  const fullPath = (req.baseUrl || "") + (req.path || "");
  const rawPath = req.path || "";
  const originalPath = req.originalUrl ? req.originalUrl.split("?")[0] : "";

  if (
    WEBHOOK_EXEMPT_PATHS.has(fullPath) ||
    WEBHOOK_EXEMPT_PATHS.has(rawPath) ||
    WEBHOOK_EXEMPT_PATHS.has(originalPath)
  ) {
    // Le handler de cette route est responsable de vérifier la signature HMAC.
    return next();
  }
  
  const isStrictExempt =
    fullPath === "/api/v1/csp-report" || rawPath === "/v1/csp-report" || originalPath === "/api/v1/csp-report" ||
    fullPath === "/api/v1/cron/sync-tracking" || rawPath === "/v1/cron/sync-tracking" || originalPath === "/api/v1/cron/sync-tracking" ||
    fullPath === "/api/v1/logs/error" || rawPath === "/v1/logs/error" || originalPath === "/api/v1/logs/error" ||
    fullPath === "/api/v1/analytics/track" || rawPath === "/v1/analytics/track" || originalPath === "/api/v1/analytics/track" ||
    fullPath === "/api/v1/sponsorship/analytics/track" || rawPath === "/v1/sponsorship/analytics/track" || originalPath === "/api/v1/sponsorship/analytics/track";

  if (isStrictExempt) {
    return next();
  }

  // 4. Extract CSRF token from headers or body
  const token =
    (req.headers["x-csrf-token"] as string) ||
    (req.headers["x-xsrf-token"] as string) ||
    (req.headers["csrf-token"] as string) ||
    req.body?._csrf;

  // 5. Validate Token & bind it strictly to current user session (UID or guest)
  const currentUserId = (req as AuthenticatedRequest).user?.uid || "guest";
  if (token && verifyCsrfToken(token, currentUserId)) {
    return next();
  }

  // 6. Block untrusted request
  const reportedPath = fullPath || originalPath || rawPath;
  safeLogger.warn("[Olmart Security] ⚠️ CSRF attack prevented", { method: req.method, path: reportedPath });
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
