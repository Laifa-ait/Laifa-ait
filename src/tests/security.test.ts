import { describe, it, expect, afterEach } from "vitest";
import { corsOptions, preventDirectCloudRunAccess } from "../middlewares/security";
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

    it("allows Cloud Run origins (*.run.app)", () => {
      const originFn = corsOptions.origin as CorsOriginFn;
      originFn("https://laifa-ait-git-mslz.europe-west1.run.app", (err: Error | null, allow?: boolean) => {
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
});
