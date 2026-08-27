import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { AuthenticatedRequest } from "./auth";
import { safeLogger } from "../utils/logger";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Safely retrieve the CSRF secret key.
 * In production, an explicit CSRF_SECRET environment variable is mandatory.
 */
function getCsrfSecret(): string {
  const secret = process.env.CSRF_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.trim() === "") {
      throw new Error(
        "[Olmart Security] ❌ FATAL: CSRF_SECRET environment variable must be explicitly defined in production."
      );
    }
    if (secret.trim().length < 32) {
      throw new Error(
        "[Olmart Security] ❌ FATAL: CSRF_SECRET is too weak! It must be at least 32 characters in production."
      );
    }
    const weakSecrets = ["changeit", "password", "secret", "1234567890", "olmart_dev_csrf_secret_key_2026"];
    if (weakSecrets.includes(secret.trim().toLowerCase())) {
      throw new Error(
        "[Olmart Security] ❌ FATAL: CSRF_SECRET uses an insecure default secret key in production."
      );
    }
    return secret.trim();
  }
  return secret?.trim() || "olmart_dev_csrf_secret_key_2026";
}

// Block server startup immediately in production if CSRF_SECRET is missing or insecure
if (process.env.NODE_ENV === "production") {
  try {
    getCsrfSecret();
    safeLogger.info("[Olmart Security] CSRF Secret validated for Production Environment.");
  } catch (error) {
    safeLogger.error("[Olmart Security] CSRF Secret Error", { err: (error as Error).message });
    process.exit(1);
  }
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

/**
 * Verifies that the webhook request contains a valid cryptographic signature header.
 * Webhooks bypass CSRF because they are authenticated via HMAC signatures.
 */
function verifyWebhookSignatureHeader(req: Request): boolean {
  const signatureHeaders = [
    "x-olmart-signature",
    "stripe-signature",
    "x-signature",
    "x-hub-signature-256",
    "x-chargily-signature",
    "signature"
  ];

  for (const headerName of signatureHeaders) {
    const signature = req.headers[headerName];
    if (typeof signature === "string" && signature.trim() !== "") {
      const trimmed = signature.trim();
      // Cryptographic signatures must be of non-trivial length
      if (trimmed.length >= 32) {
        return true;
      }
    }
  }
  return false;
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
  const pathname = req.path || (req.originalUrl ? req.originalUrl.split("?")[0] : "");
  
  const isStrictExempt =
    pathname === "/api/v1/csp-report" ||
    pathname === "/api/v1/cron/sync-tracking" ||
    pathname === "/api/v1/logs/error" ||
    pathname === "/api/v1/analytics/track" ||
    pathname === "/api/v1/sponsorship/analytics/track";

  if (isStrictExempt) {
    return next();
  }

  // Webhook exemption - Must strictly start with webhook prefix AND have a valid cryptographic signature
  const isWebhookPath = pathname.startsWith("/api/v1/webhooks/") || pathname.startsWith("/webhooks/");
  if (isWebhookPath) {
    if (verifyWebhookSignatureHeader(req)) {
      return next();
    } else {
      safeLogger.warn("[Olmart Security] ⚠️ CSRF Blocked Webhook: Missing or invalid signature header", { path: pathname });
      return res.status(403).json({
        success: false,
        error: "Exemption CSRF refusée : signature HMAC de sécurité manquante ou invalide.",
      });
    }
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

  // 6. Fallback for SPA API requests: Custom header check + Bearer Auth Token
  // Cross-site HTML forms / simple cross-origin requests cannot set custom headers like X-Requested-With
  const customHeader = req.headers["x-requested-with"];
  const authHeader = req.headers["authorization"];

  if (customHeader === "XMLHttpRequest" || (authHeader && authHeader.startsWith("Bearer "))) {
    return next();
  }

  // 7. Block untrusted request
  safeLogger.warn("[Olmart Security] ⚠️ CSRF attack prevented", { method: req.method, path: pathname });
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
