import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateCsrfToken, verifyCsrfToken, csrfProtection } from "../middlewares/csrf";
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
    expect(verifyCsrfToken(token)).toBe(true);
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

  it("throws a fatal error in production when CSRF_SECRET is missing", () => {
    process.env.NODE_ENV = "production";
    delete process.env.CSRF_SECRET;

    expect(() => generateCsrfToken("user_123")).toThrowError(/CSRF_SECRET environment variable must be explicitly defined/);
  });

  it("works reliably in production when CSRF_SECRET is provided", () => {
    process.env.NODE_ENV = "production";
    process.env.CSRF_SECRET = "production_super_secure_random_key_64_characters_long_abcdef123456";

    const token = generateCsrfToken("prod_user_456");
    expect(token).toBeDefined();
    expect(verifyCsrfToken(token)).toBe(true);
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

  it("allows requests with valid Authorization Bearer header", () => {
    process.env.NODE_ENV = "production";
    process.env.CSRF_SECRET = "test_prod_key";

    let nextCalled = false;
    const req = {
      method: "POST",
      headers: {
        authorization: "Bearer firebase_id_token_xyz",
      },
      originalUrl: "/api/v1/orders/create",
    } as unknown as Request;

    const res = {} as Response;
    csrfProtection(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
  });

  it("allows requests with custom X-Requested-With header", () => {
    process.env.NODE_ENV = "production";
    process.env.CSRF_SECRET = "test_prod_key";

    let nextCalled = false;
    const req = {
      method: "POST",
      headers: {
        "x-requested-with": "XMLHttpRequest",
      },
      originalUrl: "/api/v1/user/profile",
    } as unknown as Request;

    const res = {} as Response;
    csrfProtection(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
  });

  it("allows requests with valid X-CSRF-Token header", () => {
    process.env.NODE_ENV = "production";
    process.env.CSRF_SECRET = "test_prod_key";

    const token = generateCsrfToken("user_789");
    let nextCalled = false;
    const req = {
      method: "POST",
      headers: {
        "x-csrf-token": token,
      },
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
    process.env.CSRF_SECRET = "test_prod_key";

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
});
