import { describe, it, expect, afterEach } from "vitest";
import { isFrontendReady } from "../services/ViteStaticService";

describe("Health & Static Service Verification", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe("Frontend Readiness in Development", () => {
    it("returns true in development mode", () => {
      process.env.NODE_ENV = "development";
      expect(isFrontendReady()).toBe(true);
    });
  });

  describe("Frontend Readiness in Production", () => {
    it("returns false if static build template was not successfully cached", () => {
      process.env.NODE_ENV = "production";
      expect(isFrontendReady()).toBe(false);
    });
  });
});
