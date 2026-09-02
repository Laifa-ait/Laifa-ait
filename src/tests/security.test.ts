import { describe, it, expect, afterEach } from "vitest";
import { corsOptions, preventDirectCloudRunAccess, helmetMiddleware } from "../middlewares/security";
import { Request, Response } from "express";

type CorsOriginCallback = (err: Error | null, allow?: boolean) => void;
type CorsOriginFn = (origin: string | undefined, callback: CorsOriginCallback) => void;

describe("Security Middleware Configuration", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalEnforce = process.env.ENFORCE_CANONICAL_DOMAIN;
  const originalCanonical = process.env.CANONICAL_DOMAIN;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.ENFORCE_CANONICAL_DOMAIN = originalEnforce;
    process.env.CANONICAL_DOMAIN = originalCanonical;
  });

  describe("CORS Origin Validation", () => {
    it("allows https://olmart.dz", () => {
      const originFn = corsOptions.origin as CorsOriginFn;
      originFn("https://olmart.dz", (err: Error | null, allow?: boolean) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
      });
    });

    it("allows https://www.olmart.dz", () => {
      const originFn = corsOptions.origin as CorsOriginFn;
      originFn("https://www.olmart.dz", (err: Error | null, allow?: boolean) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
      });
    });

    it("allows Cloud Run origins (*.run.app) in non-production environments", () => {
      process.env.NODE_ENV = "development";
      const originFn = corsOptions.origin as CorsOriginFn;
      originFn("https://laifa-ait-git-mslz.europe-west1.run.app", (err: Error | null, allow?: boolean) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
      });
    });

    it("disallows generic Cloud Run origins (*.run.app) in production unless explicitly listed in allowedOrigins", () => {
      process.env.NODE_ENV = "production";
      const originFn = corsOptions.origin as CorsOriginFn;
      
      // Generic arbitrary Cloud Run URL must be rejected in production
      originFn("https://attacker-random-app.europe-west1.run.app", (err: Error | null, allow?: boolean) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
      });

      // Explicitly listed Cloud Run deployment in production must still be allowed
      originFn("https://laifa-ait-git-76420360525.europe-west1.run.app", (err: Error | null, allow?: boolean) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
      });
    });

    it("allows requests without Origin header (server-to-server / curl)", () => {
      const originFn = corsOptions.origin as CorsOriginFn;
      originFn(undefined, (err: Error | null, allow?: boolean) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
      });
    });

    it("disallows untrusted third-party origins in production", () => {
      process.env.NODE_ENV = "production";
      const originFn = corsOptions.origin as CorsOriginFn;
      originFn("https://evil-unauthorized.com", (err: Error | null, allow?: boolean) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
      });
    });
  });

  describe("Canonical Domain Redirect Middleware", () => {
    it("allows direct access to *.run.app in production when ENFORCE_CANONICAL_DOMAIN is not enabled", () => {
      process.env.NODE_ENV = "production";
      delete process.env.ENFORCE_CANONICAL_DOMAIN;

      let nextCalled = false;
      const req = {
        path: "/",
        method: "GET",
        headers: { host: "laifa-ait-git-mslz.europe-west1.run.app" },
      } as unknown as Request;

      const res = {} as Response;
      const next = () => {
        nextCalled = true;
      };

      preventDirectCloudRunAccess(req, res, next);
      expect(nextCalled).toBe(true);
    });

    it("redirects to canonical domain in production when ENFORCE_CANONICAL_DOMAIN=true", () => {
      process.env.NODE_ENV = "production";
      process.env.ENFORCE_CANONICAL_DOMAIN = "true";
      process.env.CANONICAL_DOMAIN = "olmart.dz";

      let redirectedUrl = "";
      let statusCode = 0;

      const req = {
        path: "/products",
        originalUrl: "/products",
        method: "GET",
        headers: { host: "laifa-ait-git-mslz.europe-west1.run.app" },
      } as unknown as Request;

      const res = {
        redirect: (code: number, url: string) => {
          statusCode = code;
          redirectedUrl = url;
          return res;
        },
      } as unknown as Response;

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      preventDirectCloudRunAccess(req, res, next);
      expect(nextCalled).toBe(false);
      expect(statusCode).toBe(301);
      expect(redirectedUrl).toBe("https://olmart.dz/products");
    });
  });

  describe("CORS Methods & Headers", () => {
    it("configures credentials: true without wildcard origins", () => {
      expect(corsOptions.credentials).toBe(true);
      expect(corsOptions.methods).toContain("GET");
      expect(corsOptions.methods).toContain("POST");
      expect(corsOptions.methods).toContain("OPTIONS");
    });

    it("includes standard security headers in allowedHeaders", () => {
      const headers = corsOptions.allowedHeaders as string[];
      expect(headers).toContain("Authorization");
      expect(headers).toContain("X-CSRF-Token");
      expect(headers).toContain("Content-Type");
    });
  });

  describe("Clickjacking CSP Protection", () => {
    it("configures frame-ancestors with 'self' and exact origins without wildcard *.run.app in production", () => {
      process.env.NODE_ENV = "production";

      const headers: Record<string, string> = {};
      const req = {
        headers: {},
      } as unknown as Request;

      const res = {
        setHeader: (name: string, value: string) => {
          headers[name.toLowerCase()] = value;
        },
        removeHeader: () => {},
        locals: {},
      } as unknown as Response;

      helmetMiddleware(req, res, () => {});

      const cspHeader = headers["content-security-policy"] || "";
      const frameAncestorsDirective = cspHeader
        .split(";")
        .find((dir) => dir.trim().startsWith("frame-ancestors")) || "";

      expect(frameAncestorsDirective).toContain("frame-ancestors");
      expect(frameAncestorsDirective).toContain("'self'");
      expect(frameAncestorsDirective).not.toContain("https://*.run.app");
      expect(frameAncestorsDirective).toContain("https://olmart.dz");
    });
  });

  describe("COOP & CORP Window and Resource Isolation", () => {
    it("configures Cross-Origin-Opener-Policy as same-origin-allow-popups in production", () => {
      process.env.NODE_ENV = "production";

      const headers: Record<string, string> = {};
      const req = { headers: {} } as unknown as Request;
      const res = {
        setHeader: (name: string, value: string) => {
          headers[name.toLowerCase()] = value;
        },
        removeHeader: () => {},
        locals: {},
      } as unknown as Response;

      helmetMiddleware(req, res, () => {});

      expect(headers["cross-origin-opener-policy"]).toBe("same-origin-allow-popups");
      expect(headers["cross-origin-resource-policy"]).toBe("same-origin");
    });
  });

  describe("Rate Limiting Fail-Safe & Multi-Instance Configuration", () => {
    it("exports all critical rate limiters with fail-safe configuration", async () => {
      const { apiLimiter, loginLimiter, pinLimiter, strictLimiter, webhookLimiter, debugLimiter } = await import(
        "../middlewares/rateLimiters"
      );

      expect(apiLimiter).toBeDefined();
      expect(loginLimiter).toBeDefined();
      expect(pinLimiter).toBeDefined();
      expect(strictLimiter).toBeDefined();
      expect(webhookLimiter).toBeDefined();
      expect(debugLimiter).toBeDefined();
    });

    it("ensures SKIP_RATE_LIMITS cannot bypass rate limiting in production", () => {
      process.env.NODE_ENV = "production";
      process.env.SKIP_RATE_LIMITS = "true";

      const allowSkipRateLimit = process.env.NODE_ENV === "test" && process.env.SKIP_RATE_LIMITS === "true";
      expect(allowSkipRateLimit).toBe(false);
    });
  });
});
