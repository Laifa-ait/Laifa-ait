import { describe, it, expect } from "vitest";
import {
  buyerProfileSchema,
  vendorProfileSchema,
  adminProfileSchema,
  profileUpdateSchema,
} from "../domains/user/user.schema";

describe("User Schema Validation", () => {
  describe("buyerProfileSchema", () => {
    it("should validate a correct buyer profile", () => {
      const validBuyer = {
        uid: "buyer123",
        email: "buyer@olmart.dz",
        displayName: "Buyer One",
        role: "buyer",
        interests: ["Artisanat", "Fashion"],
        onboardingCompleted: true,
      };

      const result = buyerProfileSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it("should reject buyer profile with missing fields", () => {
      const invalidBuyer = {
        email: "not-an-email",
        displayName: "",
        role: "buyer",
      };

      const result = buyerProfileSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });
  });

  describe("vendorProfileSchema", () => {
    it("should validate a correct vendor profile", () => {
      const validVendor = {
        uid: "vendor123",
        email: "vendor@olmart.dz",
        displayName: "Vendor One",
        role: "seller",
        shopName: "My Shop",
        shopDescription: "Algérie artisans",
        sellerType: "individual" as const,
        verificationStatus: "pending" as const,
        salesCount: 0,
        rating: 4.5,
        ratingCount: 10,
      };

      const result = vendorProfileSchema.safeParse(validVendor);
      expect(result.success).toBe(true);
    });

    it("should reject vendor profile with invalid shop name or status", () => {
      const invalidVendor = {
        uid: "vendor123",
        email: "vendor@olmart.dz",
        displayName: "Vendor One",
        role: "seller",
        shopName: "", // Too short
        verificationStatus: "invalid-status",
      };

      const result = vendorProfileSchema.safeParse(invalidVendor);
      expect(result.success).toBe(false);
    });
  });

  describe("adminProfileSchema", () => {
    it("should validate a correct admin profile", () => {
      const validAdmin = {
        uid: "admin123",
        email: "admin@olmart.dz",
        displayName: "Admin One",
        role: "admin" as const,
      };

      const result = adminProfileSchema.safeParse(validAdmin);
      expect(result.success).toBe(true);
    });

    it("should reject if role is not of admin types", () => {
      const invalidAdmin = {
        uid: "admin123",
        email: "admin@olmart.dz",
        displayName: "Admin One",
        role: "buyer" as "admin",
      };

      const result = adminProfileSchema.safeParse(invalidAdmin);
      expect(result.success).toBe(false);
    });
  });

  describe("profileUpdateSchema (Strict checks for Mass Assignment Protection)", () => {
    it("should allow safe user-editable fields", () => {
      const safeUpdate = {
        displayName: "New Display Name",
        phone: "0555123456",
        address: "12 Route de Chéraga",
        wilaya: "Alger",
        preferences: { darkMode: true },
      };

      const result = profileUpdateSchema.safeParse(safeUpdate);
      expect(result.success).toBe(true);
    });

    it("should strictly reject any unlisted/privileged fields", () => {
      const privilegedUpdate = {
        displayName: "Hacker Display Name",
        role: "admin", // Privileged/unlisted
        verificationStatus: "approved", // Privileged/unlisted
      };

      const result = profileUpdateSchema.safeParse(privilegedUpdate);
      expect(result.success).toBe(false);
    });
  });
});
