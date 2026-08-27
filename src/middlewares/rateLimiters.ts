import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // General rate limit for API routes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ error: "Trop de requêtes, veuillez réessayer dans une minute." });
  }
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Max 30 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ error: "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes." });
  }
});

export const pinLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // Max 15 2FA/PIN attempts per 5 min
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ error: "Trop de tentatives de vérification, veuillez réessayer dans 5 minutes." });
  }
});

export const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Strict limit for sensitive endpoints (payments, exports, admin, sensitive real estate)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ error: "Trop de requêtes sur cette opération sensible, veuillez réessayer dans une minute." });
  }
});

export const debugLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  handler: (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ error: "Trop de requêtes debug." });
  }
});

export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Max 60 webhook requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ error: "Trop de requêtes webhook, limite de fréquence dépassée." });
  }
});

