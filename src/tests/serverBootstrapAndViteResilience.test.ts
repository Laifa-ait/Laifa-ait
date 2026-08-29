import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { isFrontendReady, setStaticStateForTesting } from "../services/ViteStaticService";

describe("Adversarial Verification — Server Bootstrap, Vite Resilience & Failure State Isolation", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    setStaticStateForTesting(false, "");
  });

  describe("1. Express App Isolation (No Port Binding on Module Import)", () => {
    it("exports app instance without triggering server.listen or port conflicts", () => {
      expect(app).toBeDefined();
      expect(typeof app.use).toBe("function");
      expect(typeof app.listen).toBe("function");
    });
  });

  describe("2. Liveness & Readiness Probes Under Failure States", () => {
    it("Liveness probe (/api/v1/health/live) always returns HTTP 200 alive regardless of static build state", async () => {
      process.env.NODE_ENV = "production";
      setStaticStateForTesting(false, ""); // Broken/missing frontend build

      const res = await request(app).get("/api/v1/health/live");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("alive");
    });

    it("Readiness probe (/api/v1/health/ready) returns HTTP 503 degraded in production when dist/index.html is missing", async () => {
      process.env.NODE_ENV = "production";
      setStaticStateForTesting(false, ""); // Broken/missing frontend build

      const res = await request(app).get("/api/v1/health/ready");
      expect(res.status).toBe(503);
      expect(res.body.status).toBe("degraded");
      expect(res.body.frontend).toBe("unavailable");
      expect(isFrontendReady()).toBe(false);
    });

    it("Readiness probe (/api/v1/health/ready) returns HTTP 200 ready in production when dist/index.html is valid", async () => {
      process.env.NODE_ENV = "production";
      setStaticStateForTesting(true, '<!doctype html><html><head></head><body><div id="root">Valid Template Content For Olmart Marketplace Platform</div></body></html>');

      expect(isFrontendReady()).toBe(true);
      const res = await request(app).get("/api/v1/health/ready");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ready");
      expect(res.body.frontend).toBe("ok");
    });

    it("Development mode always considers frontend ready for live DX", () => {
      process.env.NODE_ENV = "development";
      setStaticStateForTesting(false, "");
      expect(isFrontendReady()).toBe(true);
    });
  });

  describe("3. API Gateway Catch-All Isolation (Anti-Fallback Pollution)", () => {
    it("never falls through to HTML serving on unhandled /api/* endpoints", async () => {
      const res = await request(app).get("/api/v1/unhandled-random-endpoint");
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.body.error).toContain("Endpoint API introuvable");
    });

    it("returns JSON 404 for unhandled POST /api/v1/* requests", async () => {
      const res = await request(app)
        .post("/api/v1/non-existent-subsystem")
        .send({ dummy: true });
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.body.error).toContain("Endpoint API introuvable");
    });
  });

  describe("4. Security Headers & Proxy Configuration", () => {
    it("has trust proxy configured to 1 for Cloud Run single-hop ingress", () => {
      expect(app.get("trust proxy")).toBe(1);
    });

    it("CSRF token endpoint (/api/v1/csrf-token) returns valid token without HTML fallback", async () => {
      const res = await request(app).get("/api/v1/csrf-token");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("csrfToken");
      expect(typeof res.body.csrfToken).toBe("string");
    });
  });
});
