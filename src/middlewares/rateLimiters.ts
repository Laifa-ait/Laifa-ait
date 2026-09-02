import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";
import { safeLogger } from "../utils/logger";

let redisClient: Redis | null = null;

/**
 * Creates a distributed RedisStore if REDIS_URL is configured in environment.
 * Enables fail-safe rate limiting across multi-instance Cloud Run containers.
 * Gracefully falls back to standard memory store if REDIS_URL is unconfigured or Redis fails.
 */
function createStore(prefix: string) {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return undefined; // Default memory store
  }

  try {
    if (!redisClient) {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 2,
        enableOfflineQueue: false,
        lazyConnect: false,
      });

      redisClient.on("error", (err) => {
        safeLogger.warn("[Olmart RateLimiter] ⚠️ Redis connection error, falling back to memory store", {
          err: err.message,
        });
      });

      redisClient.on("connect", () => {
        safeLogger.info("[Olmart RateLimiter] 🟢 Connected to Redis for multi-instance rate limiting");
      });
    }

    return new RedisStore({
      // @ts-expect-error rate-limit-redis sendCommand interface for ioredis
      sendCommand: async (...args: string[]) => {
        if (!redisClient || redisClient.status !== "ready") {
          throw new Error("Redis client not ready");
        }
        return redisClient.call(args[0], ...args.slice(1));
      },
      prefix: `olmart_rl:${prefix}:`,
    });
  } catch (err: unknown) {
    safeLogger.warn("[Olmart RateLimiter] ⚠️ Failed to initialize Redis store, falling back to memory store", {
      err: err instanceof Error ? err.message : String(err),
    });
    return undefined;
  }
}

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // General rate limit for API routes
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("api"),
  handler: (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ success: false, error: "Trop de requêtes, veuillez réessayer dans une minute." });
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Max 30 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("login"),
  handler: (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ success: false, error: "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes." });
  },
});

export const pinLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // Max 15 2FA/PIN attempts per 5 min
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("pin"),
  handler: (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ success: false, error: "Trop de tentatives de vérification, veuillez réessayer dans 5 minutes." });
  },
});

export const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Strict limit for sensitive endpoints (payments, exports, admin, sensitive real estate)
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("strict"),
  handler: (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ success: false, error: "Trop de requêtes sur cette opération sensible, veuillez réessayer dans une minute." });
  },
});

export const debugLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  store: createStore("debug"),
  handler: (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ success: false, error: "Trop de requêtes debug." });
  },
});

export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Max 60 webhook requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("webhook"),
  handler: (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ success: false, error: "Trop de requêtes webhook, limite de fréquence dépassée." });
  },
});


