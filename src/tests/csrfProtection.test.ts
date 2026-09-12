import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateCsrfToken, verifyCsrfToken, csrfProtection, getCsrfSecret, validateCsrfConfiguration } from "../middlewares/csrf";
import { Request, Response } from "express";

describe("CSRF Protection Suite (P1-01 Verification)", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.CSRF_SECRET;

  beforeEach(() => {
    process.env.NODE_ENV = "test";
    delete process.env.CSRF_SECRET;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.CSRF_SECRET = originalSecret;
  });

  it("generates and verifies a valid CSRF token in test/dev environment", () => {
    const token = generateCsrfToken("user_123");
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(verifyCsrfToken(token, "user_123")).toBe(true);
  });

  it("rejects tampered or forged CSRF tokens", () => {
    const validToken = generateCsrfToken("user_123");
    const tampered = validToken.slice(0, -4) + "AAAA";
    expect(verifyCsrfToken(tampered)).toBe(false);
  });

  it("rejects invalid format strings or empty tokens", () => {
    expect(verifyCsrfToken("")).toBe(false);
    expect(verifyCsrfToken("not:a:valid:token:at:all")).toBe(false);
    expect(verifyCsrfToken("invalid_base64")).toBe(false);
  });

  it("fails closed in production when CSRF_SECRET is missing or too short", () => {
    process.env.NODE_ENV = "production";
    delete process.env.CSRF_SECRET;

    expect(() => getCsrfSecret()).toThrowError("CSRF_SECRET is required and must be at least 32 characters in production");
    expect(() => validateCsrfConfiguration()).toThrowError("CSRF_SECRET is required and must be at least 32 characters in production");
    expect(() => generateCsrfToken("user_123")).toThrowError("CSRF_SECRET is required and must be at least 32 characters in production");
  });

  it("fails closed in production when CSRF_SECRET is a known weak secret", () => {
    process.env.NODE_ENV = "production";
    process.env.CSRF_SECRET = "changeit";

    expect(() => getCsrfSecret()).toThrowError("CSRF_SECRET is required and must be at least 32 characters in production");
  });

  it("works reliably in production when CSRF_SECRET is provided", () => {
    process.env.NODE_ENV = "production";
    process.env.CSRF_SECRET = "production_super_secure_random_key_64_characters_long_abcdef123456";

    expect(() => validateCsrfConfiguration()).not.toThrow();
    const token = generateCsrfToken("prod_user_456");
    expect(token).toBeDefined();
    expect(verifyCsrfToken(token, "prod_user_456")).toBe(true);
  });

  it("allows safe HTTP methods (GET, HEAD, OPTIONS) without checking token", () => {
    let nextCalled = false;
    const req = {
      method: "GET",
      headers: {},
    } as unknown as Request;

    const res = {} as Response;
    csrfProtection(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
  });

  it("rejects requests relying solely on Authorization Bearer header or X-Requested-With without CSRF token", () => {
    process.env.NODE_ENV = "production";
    process.env.CSRF_SECRET = "production_super_secure_random_key_64_characters_long_abcdef123456";

    let nextCalled = false;
    let statusCode = 0;
    const req = {
      method: "POST",
      headers: {
        authorization: "Bearer firebase_id_token_xyz",
        "x-requested-with": "XMLHttpRequest",
      },
      originalUrl: "/api/v1/orders/create",
    } as unknown as Request;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json() {
        return this;
      },
    } as unknown as Response;

    csrfProtection(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(403);
  });

  it("allows requests with valid X-CSRF-Token header bound to authenticated user", () => {
    process.env.NODE_ENV = "production";
    process.env.CSRF_SECRET = "production_super_secure_random_key_64_characters_long_abcdef123456";

    const token = generateCsrfToken("user_789");
    let nextCalled = false;
    const req = {
      method: "POST",
      headers: {
        "x-csrf-token": token,
      },
      user: { uid: "user_789" },
      originalUrl: "/api/v1/user/profile",
    } as unknown as Request;

    const res = {} as Response;
    csrfProtection(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
  });

  it("blocks untrusted POST requests without token or credentials", () => {
    process.env.NODE_ENV = "production";
    process.env.CSRF_SECRET = "production_super_secure_random_key_64_characters_long_abcdef123456";

    let nextCalled = false;
    let statusCode = 0;
    let responseJson: unknown = null;

    const req = {
      method: "POST",
      headers: {},
      originalUrl: "/api/v1/orders/cancel",
    } as unknown as Request;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: unknown) {
        responseJson = data;
        return this;
      },
    } as unknown as Response;

    csrfProtection(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(403);
    expect(responseJson).toHaveProperty("error");
  });

  describe("Non-trusted .run.app domain rejection (Strict Origin/Referer & no fallback bypass)", () => {
    const environments = ["development", "production"] as const;

    environments.forEach((env) => {
      describe(`Environment: ${env}`, () => {
        it(`rejects Origin https://untrusted-preview.run.app without token (HTTP 403, next() not called)`, () => {
          process.env.NODE_ENV = env;

          let nextCalled = false;
          let statusCode = 0;
          let responseJson: unknown = null;

          const req = {
            method: "POST",
            headers: {
              host: "api.olmart.dz",
              origin: "https://untrusted-preview.run.app",
            },
            path: "/api/v1/orders/create",
            originalUrl: "/api/v1/orders/create",
          } as unknown as Request;

          const res = {
            status(code: number) {
              statusCode = code;
              return this;
            },
            json(data: unknown) {
              responseJson = data;
              return this;
            },
          } as unknown as Response;

          csrfProtection(req, res, () => {
            nextCalled = true;
          });

          expect(nextCalled).toBe(false);
          expect(statusCode).toBe(403);
          expect(responseJson).toHaveProperty("error");
        });

        it(`rejects Referer https://untrusted-preview.run.app/page without Origin and without token`, () => {
          process.env.NODE_ENV = env;

          let nextCalled = false;
          let statusCode = 0;
          let responseJson: unknown = null;

          const req = {
            method: "POST",
            headers: {
              host: "api.olmart.dz",
              referer: "https://untrusted-preview.run.app/page",
            },
            path: "/api/v1/orders/create",
            originalUrl: "/api/v1/orders/create",
          } as unknown as Request;

          const res = {
            status(code: number) {
              statusCode = code;
              return this;
            },
            json(data: unknown) {
              responseJson = data;
              return this;
            },
          } as unknown as Response;

          csrfProtection(req, res, () => {
            nextCalled = true;
          });

          expect(nextCalled).toBe(false);
          expect(statusCode).toBe(403);
          expect(responseJson).toHaveProperty("error");
        });

        it(`rejects raw hostname untrusted-preview.run.app preventing bypass via fallback catch`, () => {
          process.env.NODE_ENV = env;

          let nextCalled = false;
          let statusCode = 0;
          let responseJson: unknown = null;

          const req = {
            method: "POST",
            headers: {
              host: "api.olmart.dz",
              origin: "untrusted-preview.run.app",
            },
            path: "/api/v1/orders/create",
            originalUrl: "/api/v1/orders/create",
          } as unknown as Request;

          const res = {
            status(code: number) {
              statusCode = code;
              return this;
            },
            json(data: unknown) {
              responseJson = data;
              return this;
            },
          } as unknown as Response;

          csrfProtection(req, res, () => {
            nextCalled = true;
          });

          expect(nextCalled).toBe(false);
          expect(statusCode).toBe(403);
          expect(responseJson).toHaveProperty("error");
        });
      });
    });

    it("allows POST request with valid CSRF token according to existing contract", () => {
      process.env.NODE_ENV = "development";
      const token = generateCsrfToken("guest");

      let nextCalled = false;
      const req = {
        method: "POST",
        headers: {
          host: "api.olmart.dz",
          origin: "https://untrusted-preview.run.app",
          "x-csrf-token": token,
        },
        path: "/api/v1/orders/create",
        originalUrl: "/api/v1/orders/create",
      } as unknown as Request;

      const res = {} as Response;

      csrfProtection(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });

    it("explicitly authorized OLMART origins (https://olmart.dz) retain their current allowed behavior", () => {
      const environmentsToTest = ["development", "production"] as const;

      environmentsToTest.forEach((env) => {
        process.env.NODE_ENV = env;

        let nextCalled = false;
        const req = {
          method: "POST",
          headers: {
            host: "api.olmart.dz",
            origin: "https://olmart.dz",
          },
          path: "/api/v1/orders/create",
          originalUrl: "/api/v1/orders/create",
        } as unknown as Request;

        const res = {} as Response;

        csrfProtection(req, res, () => {
          nextCalled = true;
        });

        expect(nextCalled).toBe(true);
      });
    });

    it("explicitly authorized OLMART origins (https://www.olmart.dz) retain their current allowed behavior", () => {
      const environmentsToTest = ["development", "production"] as const;

      environmentsToTest.forEach((env) => {
        process.env.NODE_ENV = env;

        let nextCalled = false;
        const req = {
          method: "POST",
          headers: {
            host: "api.olmart.dz",
            origin: "https://www.olmart.dz",
          },
          path: "/api/v1/orders/create",
          originalUrl: "/api/v1/orders/create",
        } as unknown as Request;

        const res = {} as Response;

        csrfProtection(req, res, () => {
          nextCalled = true;
        });

        expect(nextCalled).toBe(true);
      });
    });
  });
});
