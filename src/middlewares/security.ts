import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import crypto from "crypto";
import { safeLogger } from "../utils/logger";

/**
 * Parses and returns the list of exact allowed origins for production CORS.
 */
function getParsedAllowedOrigins(): string[] {
  const list = [
    "https://olmart.dz",
    "https://www.olmart.dz",
    // Dev App URL
    "https://ais-dev-j3a4gyjlonu6y4k6skaqai-412943438773.europe-west2.run.app",
    // Shared App URL
    "https://ais-pre-j3a4gyjlonu6y4k6skaqai-412943438773.europe-west2.run.app",
    // User Cloud Run Deployments
    "https://laifa-ait-git-76420360525.europe-west1.run.app",
    "https://gemini-visionary-76420360525.europe-west1.run.app",
  ];

  const canonicalDomain = process.env.CANONICAL_DOMAIN;
  if (canonicalDomain) {
    const clean = canonicalDomain.replace(/^https?:\/\//, "").trim();
    if (clean) {
      list.push(`https://${clean}`);
      list.push(`https://www.${clean}`);
    }
  }

  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    envOrigins.split(",").forEach((item) => {
      const trimmed = item.trim();
      if (trimmed) {
        list.push(trimmed);
      }
    });
  }
  return list;
}

/**
 * Validates if the origin is a trusted Google AI Studio preview, localhost, or standard Google domain.
 * This is restricted to non-production only to ensure no wildcard patterns leak into production.
 */
function isAllowedPreviewOrigin(origin: string): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();

    const isGoogleStudio =
      hostname === "ai.studio" ||
      hostname === "aistudio.google.com" ||
      hostname.endsWith(".ai.studio") ||
      hostname.endsWith(".aistudio.google.com");

    const isGoogle =
      hostname === "google.com" ||
      hostname.endsWith(".google.com") ||
      hostname === "googleusercontent.com" ||
      hostname.endsWith(".googleusercontent.com");

    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1";

    return (isGoogleStudio || isGoogle || isLocal) && (url.protocol === "https:" || url.protocol === "http:");
  } catch {
    return false;
  }
}

export const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = getParsedAllowedOrigins();
    const isAllowedExact = allowedOrigins.includes(origin);
    const isAllowedPreview = isAllowedPreviewOrigin(origin);
    const isNonProd = process.env.NODE_ENV !== "production";
    const isCloudRunDevOrigin = isNonProd && (origin.endsWith(".run.app") || origin.endsWith(".googleusercontent.com"));

    if (isAllowedExact || isAllowedPreview || isCloudRunDevOrigin) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
    "X-XSRF-Token",
    "csrf-token",
  ],
};

export const corsMiddleware = cors(corsOptions);

/**
 * Optional canonical domain redirect middleware.
 * ONLY redirects if process.env.ENFORCE_CANONICAL_DOMAIN === "true" AND process.env.CANONICAL_DOMAIN is explicitly set.
 * By default (ENFORCE_CANONICAL_DOMAIN !== "true"), Cloud Run URLs (*.run.app) and all hostnames are directly accepted.
 */
export function preventDirectCloudRunAccess(req: Request, res: Response, next: NextFunction) {
  const enforceCanonical = process.env.ENFORCE_CANONICAL_DOMAIN === "true";
  const canonicalDomain = process.env.CANONICAL_DOMAIN;

  if (enforceCanonical && canonicalDomain) {
    // Always allow container health probes and readiness checks
    if (
      req.path === "/health" ||
      req.path.startsWith("/health/") ||
      req.path.startsWith("/api/health") ||
      req.path.startsWith("/api/v1/health")
    ) {
      return next();
    }

    const host = (req.headers.host || "").toLowerCase();
    const cleanCanonical = canonicalDomain.replace(/^https?:\/\//, "").trim().toLowerCase();

    // Do not redirect if already on canonical domain or www
    const isCanonicalHost = host === cleanCanonical || host === `www.${cleanCanonical}`;

    if (!isCanonicalHost) {
      safeLogger.warn("[Olmart Security] ⚠️ Redirecting non-canonical host to canonical domain", {
        host,
        canonicalDomain: cleanCanonical,
      });

      if (req.method === "GET" && !req.path.startsWith("/api/")) {
        return res.redirect(301, `https://${cleanCanonical}${req.originalUrl}`);
      }

      return res.status(403).json({
        success: false,
        error: `L'accès direct via ${host} n'est pas autorisé. Veuillez utiliser https://${cleanCanonical}`,
      });
    }
  }

  next();
}

/**
 * Middleware to generate a cryptographically secure nonce on every request.
 */
export function nonceMiddleware(req: Request, res: Response, next: NextFunction) {
  res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
  next();
}

/**
 * Dynamically injects the generated nonce into all <script> elements and placeholder tokens.
 */
export function injectNonceToHtml(html: string, nonce: string): string {
  if (!nonce) return html;
  return html
    .replace(/%%CSP_NONCE%%/g, nonce)
    .replace(/<script\b([^>]*)>/gi, (match, attrs) => {
      if (attrs.includes("nonce=")) {
        return match;
      }
      return `<script nonce="${nonce}"${attrs}>`;
    });
}

// -----------------------------------------------------------------------------
// DUAL CONTENT SECURITY POLICY DEFINITIONS
// -----------------------------------------------------------------------------

function getFrameAncestorsProd(): string[] {
  const exactOrigins = getParsedAllowedOrigins();
  return Array.from(
    new Set([
      "'self'",
      "https://olmart.dz",
      "https://www.olmart.dz",
      "https://aistudio.google.com",
      "https://ai.studio",
      "https://*.aistudio.google.com",
      "https://*.ai.studio",
      ...exactOrigins,
    ])
  );
}

const scriptSrcProd: (string | ((req: Request, res: Response) => string))[] = [
  "'self'",
  (req: Request, res: Response) => `'nonce-${String((res.locals as Record<string, unknown>).cspNonce || "")}'`,
  "https://apis.google.com",
  "https://maps.googleapis.com",
  "https://www.googletagmanager.com",
  "https://cdn.jsdelivr.net",
];

const connectSrcProd = [
  "'self'",
  "https://firestore.googleapis.com",
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://olmart.dz",
  "https://www.olmart.dz",
  "https://*.run.app",
  "https://region1-active-directory.googleapis.com",
  "https://www.google-analytics.com",
  "wss:", // Allowed for secure real-time syncing only (never plain ws:)
];

const styleSrcProd = ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"];
const fontSrcProd = ["'self'", "https://fonts.gstatic.com", "data:", "https://cdn.jsdelivr.net"];

const imgSrcProd = [
  "'self'",
  "data:",
  "blob:",
  "https://olmart.dz",
  "https://*.olmart.dz",
  "https://*.run.app",
  "https://firebasestorage.googleapis.com",
  "https://lh3.googleusercontent.com",
  "https://images.unsplash.com",
  "https://api.qrserver.com",
  "https://www.transparenttextures.com",
  "https://www.gstatic.com",
  "https://*.gstatic.com",
];

const helmetProd = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    reportOnly: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: scriptSrcProd as unknown as string[],
      scriptSrcElem: scriptSrcProd as unknown as string[],
      workerSrc: ["'self'", "blob:"],
      styleSrc: styleSrcProd,
      fontSrc: fontSrcProd,
      imgSrc: imgSrcProd,
      connectSrc: connectSrcProd,
      frameSrc: [
        "'self'",
        "https://*.firebaseapp.com",
        "https://*.google.com",
        "https://apis.google.com",
        "https://*.googleusercontent.com",
      ],
      frameAncestors: getFrameAncestorsProd(),
      objectSrc: ["'none'"],
      reportUri: "/api/v1/csp-report",
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "same-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  xFrameOptions: false,
  noSniff: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
});

const frameAncestorsDev = [
  "'self'",
  "https://*.google.com",
  "https://*.googleusercontent.com",
  "https://*.aistudio.google.com",
  "https://aistudio.google.com",
  "https://*.ai.studio",
  "https://ai.studio",
  "https://*.run.app",
  "http://localhost:*",
  "http://127.0.0.1:*",
];

const scriptSrcDev = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  "blob:",
  "https://apis.google.com",
  "https://maps.googleapis.com",
  "https://*.googleapis.com",
  "https://www.gstatic.com",
  "https://*.gstatic.com",
  "https://www.googletagmanager.com",
  "https://*.googletagmanager.com",
  "https://cdn.jsdelivr.net",
];

const helmetDev = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    reportOnly: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: scriptSrcDev,
      scriptSrcElem: scriptSrcDev,
      workerSrc: ["'self'", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:", "https://cdn.jsdelivr.net"],
      imgSrc: ["*", "data:", "blob:"],
      connectSrc: [
        "'self'",
        "https://*.googleapis.com",
        "https://*.firebaseio.com",
        "https://*.firebase.com",
        "https://*.googleusercontent.com",
        "https://*.run.app",
        "https://*.ai.studio",
        "https://*.google.com",
        "https://*.clients6.google.com",
        "https://*.google-analytics.com",
        "wss:",
        "ws:", // Vite WebSocket dev reload client is allowed in non-production
      ],
      frameSrc: [
        "'self'",
        "https://*.firebaseapp.com",
        "https://*.google.com",
        "https://apis.google.com",
        "https://*.googleusercontent.com",
      ],
      frameAncestors: frameAncestorsDev,
      objectSrc: ["'none'"],
      reportUri: "/api/v1/csp-report",
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "same-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  xFrameOptions: false,
  noSniff: true,
});

/**
 * Dynamic Content Security Policy switcher.
 */
export function helmetMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === "production") {
    return helmetProd(req, res, next);
  } else {
    return helmetDev(req, res, next);
  }
}
