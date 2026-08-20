import { describe, it, expect, afterEach } from "vitest";
import { corsOptions } from "../middlewares/security";

type CorsOriginCallback = (err: Error | null, allow?: boolean) => void;
type CorsOriginFn = (origin: string | undefined, callback: CorsOriginCallback) => void;

describe("Security Middleware Configuration", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
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

    it("disallows aistudio.google.com in production", () => {
      process.env.NODE_ENV = "production";
      const originFn = corsOptions.origin as CorsOriginFn;
      originFn("https://aistudio.google.com", (err: Error | null, allow?: boolean) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
      });
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
