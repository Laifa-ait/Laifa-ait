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
import { optionalAuthenticateToken } from "./src/middlewares/auth";
import { deprecationMiddleware } from "./src/middlewares/deprecation";
import { generateOpenApiSpec } from "./src/swagger/openapi";
import { safeLogger } from "./src/utils/logger";

import healthRouter from "./src/domains/health/health.routes";
import authRouter from "./src/domains/auth/auth.routes";
import aiRouter from "./src/domains/ai/ai.routes";
import ordersRouter from "./src/domains/order/order.routes";
import adminRouter from "./src/domains/admin/admin.routes";
import coreRouter from "./src/domains/core.routes";
import productsRouter from "./src/domains/product/product.routes";
import reviewsRouter from "./src/domains/review/review.routes";
import workspaceRouter from "./src/domains/workspace/workspace.routes";
import disputesRouter from "./src/domains/dispute/controllers/DisputeController";
import shippingRouter from "./src/domains/shipping/routes";
import { olmaUniversRouter } from "./src/domains/olmaUnivers/olmaUnivers.routes";
import { artisanRouter } from "./src/domains/artisan/artisan.routes";
import { realEstateRouter } from "./src/domains/realEstate/realEstate.routes";
import messagingRouter from "./src/domains/messaging/messaging.routes";
import paymentRouter from "./src/domains/payment/payment.routes";
import bootstrapRouter from "./src/domains/bootstrap/bootstrap.routes";

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

// Security & Rate Limiting Middlewares (Active by default across all environments)
// SKIP_RATE_LIMITS is strictly ignored in production and development to ensure fail-safe operation.
app.use(preventDirectCloudRunAccess);
app.use("/api/v1/webhooks", webhookLimiter);
app.use("/webhooks", webhookLimiter);
app.use("/api/v1/admin", strictLimiter);
app.use("/admin", strictLimiter);

const isRateLimitBypassedInTest = process.env.NODE_ENV === "test" && process.env.SKIP_RATE_LIMITS === "true";
if (!isRateLimitBypassedInTest) {
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
app.use(optionalAuthenticateToken);
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
app.use("/api/v1", artisanRouter);
app.use("/api/v1/real-estate", realEstateRouter);
app.use("/api/v1/messaging", messagingRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1", bootstrapRouter);

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

