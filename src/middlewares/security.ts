import helmet from "helmet";
import cors from "cors";

export const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);

    const isProduction = process.env.NODE_ENV === "production";

    const isOlmartDomain =
      origin === "https://olmart.dz" ||
      origin === "https://www.olmart.dz" ||
      /^https:\/\/.*\.olmart\.dz$/.test(origin) ||
      /^https:\/\/.*\.run\.app$/.test(origin);

    const isPreviewDomain =
      !isProduction &&
      (/^https:\/\/.*\.ai\.studio$/.test(origin) ||
        /^https:\/\/.*\.aistudio\.google\.com$/.test(origin) ||
        origin === "https://aistudio.google.com" ||
        origin === "https://ai.studio" ||
        /^https:\/\/.*\.google\.com$/.test(origin) ||
        /^https:\/\/.*\.googleusercontent\.com$/.test(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin));

    const isAllowed = isOlmartDomain || isPreviewDomain;

    callback(null, Boolean(isAllowed));
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

const frameAncestorsList = [
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

const scriptSrcDirectives = [
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

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    reportOnly: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: scriptSrcDirectives,
      scriptSrcElem: scriptSrcDirectives,
      workerSrc: ["'self'", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:", "https://cdn.jsdelivr.net"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://firebasestorage.googleapis.com",
        "https://lh3.googleusercontent.com",
        "https://images.unsplash.com",
        "https://api.qrserver.com",
        "https://*.transparenttextures.com",
        "https://www.transparenttextures.com",
        "https://*.google.com",
        "https://*.gstatic.com",
        "https://*.googleapis.com",
      ],
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
        "ws:",
      ],
      frameSrc: [
        "'self'",
        "https://*.firebaseapp.com",
        "https://*.google.com",
        "https://apis.google.com",
        "https://*.googleusercontent.com",
      ],
      frameAncestors: frameAncestorsList,
      objectSrc: ["'none'"],
      reportUri: "/api/v1/csp-report",
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  xFrameOptions: false,
  noSniff: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
});
