import "dotenv/config";
import * as Sentry from "@sentry/node";
import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import { apiLimiter, debugLimiter, webhookLimiter, strictLimiter } from "./src/middlewares/rateLimiters";
import { helmetMiddleware, corsMiddleware, preventDirectCloudRunAccess, nonceMiddleware } from "./src/middlewares/security";
import { handleCspReport } from "./src/middlewares/cspReporter";
import { csrfProtection, getCsrfTokenHandler } from "./src/middlewares/csrf";
import { deprecationMiddleware } from "./src/middlewares/deprecation";
import { generateOpenApiSpec } from "./src/swagger/openapi";
import { safeLogger } from "./src/utils/logger";

import healthRouter from "./src/routes/health";
import authRouter from "./src/routes/auth";
import aiRouter from "./src/routes/ai";
import ordersRouter from "./src/routes/orders";
import adminRouter from "./src/routes/admin";
import coreRouter from "./src/routes/core";
import productsRouter from "./src/routes/products";
import reviewsRouter from "./src/routes/reviews";
import workspaceRouter from "./src/routes/workspace";
import disputesRouter from "./src/domains/dispute/controllers/DisputeController";
import shippingRouter from "./src/domains/shipping/routes";
import { olmaUniversRouter } from "./src/routes/olmaUnivers";
import { bricolageRouter } from "./src/routes/bricolage";
import { realEstateRouter } from "./src/routes/realEstate";
import messagingRouter from "./src/routes/messaging";

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
  });
}

export const app = express();

// Express running behind Cloud Run / Nginx reverse proxy (1 hop).
// Setting trust proxy to 1 trusts the immediate fronting proxy, allowing Express to:
// 1. Correctly populate `req.ip` from the rightmost client IP in `X-Forwarded-For` (preventing IP spoofing).
// 2. Derive `req.protocol` from `X-Forwarded-Proto` (for accurate HTTPS detection).
// 3. Ensure rate-limiting middleware operates on real client IPs rather than proxy IPs.
app.set("trust proxy", 1);

// Security & Parsing Middlewares
app.use(preventDirectCloudRunAccess);
app.use("/api/v1/webhooks", webhookLimiter);
app.use("/webhooks", webhookLimiter);
app.use("/api/v1/admin", strictLimiter);
app.use("/admin", strictLimiter);
if (process.env.NODE_ENV !== "development" && process.env.SKIP_RATE_LIMITS !== "true") {
  app.use("/api/v1", apiLimiter);
}
app.use(nonceMiddleware);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.post(
  "/api/v1/csp-report",
  debugLimiter,
  express.json({ type: ["application/csp-report", "application/json"] }),
  handleCspReport
);
app.use(compression() as unknown as express.RequestHandler);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));

// CSRF & Versioning Deprecation Tracking
app.use(deprecationMiddleware);
app.get("/api/v1/csrf-token", getCsrfTokenHandler);
app.use("/api", csrfProtection);

// Health & Swagger Documentation
app.use(healthRouter);
const openApiDoc = generateOpenApiSpec();
app.use(
  "/api-docs",
  ...(swaggerUi.serve as unknown as express.RequestHandler[]),
  swaggerUi.setup(openApiDoc) as unknown as express.RequestHandler
);

// -----------------------------------------------------------------------------
// OLMART API GATEWAY ROUTER PIPELINE
// -----------------------------------------------------------------------------
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/workspace", workspaceRouter);
app.use("/api/v1/shipping", shippingRouter);
app.use("/api/v1/disputes", disputesRouter);
app.use("/api/v1", aiRouter);
app.use("/api/v1", ordersRouter);
app.use("/api/v1", adminRouter);
app.use("/api/v1", olmaUniversRouter);
app.use("/api/v1", bricolageRouter);
app.use("/api/v1/real-estate", realEstateRouter);
app.use("/api/v1/messaging", messagingRouter);

// Domain catalog & core gateways
app.use("/", productsRouter);
app.use("/", coreRouter);

// Catch-all 404 handler for any unhandled /api requests to prevent falling through to SPA HTML serving
app.use("/api/*", (req: Request, res: Response) => {
  return res.status(404).json({ error: `Endpoint API introuvable: ${req.method} ${req.originalUrl}` });
});

if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const isError = err instanceof Error;
  const message = isError ? err.message : String(err);
  const stack = isError ? err.stack : undefined;
  safeLogger.error(`[Global Error Handler] ❌ Request to ${req.method} ${req.path} failed`, { message, stack: stack || "" });
  res.status(500).json({ error: "Une erreur interne du serveur est survenue." });
});

export default app;

