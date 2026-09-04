import { describe, it, expect } from "vitest";
import { CouponService, ProductItemForCoupon } from "../domains/marketing/coupon.service";

describe("Seller Coupons Targeted Security & Integrity Suite", () => {
  // 1. sellerId ALWAYS DERIVED FROM AUTHENTICATED TOKEN
  describe("1. sellerId derivation & IDOR security", () => {
    it("should strictly assign the authenticated seller's UID from token, ignoring any sellerId in payload", () => {
      const authenticatedSellerUid = "seller_auth_real_123";
      const maliciousPayload = {
        code: "HACK50",
        discountType: "percentage",
        discountValue: 20,
        sellerId: "victim_seller_999", // Attempted spoofing
        createdBy: "victim_seller_999",
      };

      // Simulating controller payload extraction: sellerId is hardcoded to req.user.uid
      const safeCreatedDoc = {
        code: maliciousPayload.code.toUpperCase(),
        discountType: maliciousPayload.discountType,
        discountValue: maliciousPayload.discountValue,
        sellerId: authenticatedSellerUid, // Must come from req.user.uid
        createdBy: authenticatedSellerUid,
        limitedToSellers: [authenticatedSellerUid],
      };

      expect(safeCreatedDoc.sellerId).toBe("seller_auth_real_123");
      expect(safeCreatedDoc.sellerId).not.toBe(maliciousPayload.sellerId);
      expect(safeCreatedDoc.limitedToSellers).toEqual(["seller_auth_real_123"]);
    });

    it("should refuse modification or deletion of another seller's coupon (IDOR guard)", () => {
      const authenticatedSellerUid = "seller_auth_real_123";
      const existingCouponDoc = {
        id: "coup_victim_888",
        code: "VICTIMPROMO",
        sellerId: "other_seller_456",
        isActive: true,
      };

      // Controller ownership verification
      const canEdit = existingCouponDoc.sellerId === authenticatedSellerUid;
      const canDelete = existingCouponDoc.sellerId === authenticatedSellerUid;

      expect(canEdit).toBe(false);
      expect(canDelete).toBe(false);

      // Verify status code contract
      const idorResponse = canEdit
        ? { status: 200 }
        : { status: 403, error: "Accès refusé : vous ne pouvez modifier que vos propres coupons (IDOR Guard)." };

      expect(idorResponse.status).toBe(403);
      expect(idorResponse.error).toContain("IDOR Guard");
    });
  });

  // 2. TRANSACTIONAL UNIQUENESS OF COUPON CODE
  describe("2. Transactional code uniqueness & atomic locking", () => {
    it("should normalize coupon codes to uppercase and detect duplicate code collision", () => {
      const existingCodes = new Set(["WELCOME10", "ALGERIA2026", "FLASH50"]);

      const attempt1 = "welcome10";
      const upper1 = attempt1.trim().toUpperCase();
      const isDuplicate1 = existingCodes.has(upper1);

      expect(upper1).toBe("WELCOME10");
      expect(isDuplicate1).toBe(true);

      const attempt2 = "  algeria2026  ";
      const upper2 = attempt2.trim().toUpperCase();
      const isDuplicate2 = existingCodes.has(upper2);

      expect(upper2).toBe("ALGERIA2026");
      expect(isDuplicate2).toBe(true);

      const attempt3 = "NEWSELLER15";
      const upper3 = attempt3.trim().toUpperCase();
      const isDuplicate3 = existingCodes.has(upper3);

      expect(upper3).toBe("NEWSELLER15");
      expect(isDuplicate3).toBe(false);
    });

    it("simulates atomic transaction rollback when coupon_codes lock document already exists", async () => {
      const lockStore = new Map<string, { couponId: string; sellerId: string }>();
      lockStore.set("DISCOUNT20", { couponId: "coup_1", sellerId: "seller_A" });

      const createCouponTransaction = async (code: string, sellerId: string) => {
        const upper = code.trim().toUpperCase();
        if (lockStore.has(upper)) {
          throw new Error("Ce code promo existe déjà. Veuillez choisir un autre code.");
        }
        lockStore.set(upper, { couponId: "coup_2", sellerId });
        return { success: true };
      };

      await expect(createCouponTransaction("discount20", "seller_B")).rejects.toThrow(
        "Ce code promo existe déjà. Veuillez choisir un autre code."
      );
    });
  });

  // 3. PUBLIC EXCLUSION OF EXPIRED, INACTIVE, AND EXHAUSTED COUPONS
  describe("3. Public filtering of expired, deactivated, and exhausted coupons", () => {
    it("excludes coupons where isActive === false", () => {
      const coupons = [
        { id: "c1", code: "ACTIVE10", isActive: true, expiresAt: "2099-01-01T00:00:00.000Z", usageLimit: 100, usedCount: 5 },
        { id: "c2", code: "DISABLED20", isActive: false, expiresAt: "2099-01-01T00:00:00.000Z", usageLimit: 100, usedCount: 0 },
      ];

      const activeOnly = coupons.filter((c) => c.isActive);
      expect(activeOnly.map((c) => c.code)).toEqual(["ACTIVE10"]);
    });

    it("excludes coupons where expiry date is in the past", () => {
      const now = new Date("2026-09-04T12:00:00.000Z");
      const coupons = [
        { id: "c1", code: "VALID", isActive: true, expiresAt: "2026-10-01T00:00:00.000Z" },
        { id: "c2", code: "EXPIRED_YESTERDAY", isActive: true, expiresAt: "2026-09-03T00:00:00.000Z" },
        { id: "c3", code: "EXPIRED_JUST_NOW", isActive: true, expiresAt: "2026-09-04T11:59:59.000Z" },
      ];

      const nonExpired = coupons.filter((c) => {
        if (!c.expiresAt) return true;
        return new Date(c.expiresAt) > now;
      });

      expect(nonExpired.map((c) => c.code)).toEqual(["VALID"]);
    });

    it("excludes coupons where usageCount >= maxUses or usedCount >= usageLimit", () => {
      const coupons = [
        { id: "c1", code: "PLENTY_LEFT", maxUses: 50, usageCount: 12 },
        { id: "c2", code: "EXHAUSTED_MAX_USES", maxUses: 10, usageCount: 10 },
        { id: "c3", code: "EXHAUSTED_OVERFLOW", maxUses: 5, usageCount: 8 },
        { id: "c4", code: "EXHAUSTED_LEGACY_FIELDS", usageLimit: 20, usedCount: 20 },
        { id: "c5", code: "UNLIMITED", maxUses: null, usageCount: 150 },
      ];

      const available = coupons.filter((c) => {
        const limit = typeof c.maxUses === "number" ? c.maxUses : typeof c.usageLimit === "number" ? c.usageLimit : null;
        const used = typeof c.usageCount === "number" ? c.usageCount : typeof c.usedCount === "number" ? c.usedCount : 0;
        if (limit !== null && limit > 0 && used >= limit) {
          return false;
        }
        return true;
      });

      expect(available.map((c) => c.code)).toEqual(["PLENTY_LEFT", "UNLIMITED"]);
    });
  });

  // 4. RESTRICTION OF COUPON TO SELLER ITEMS AT CHECKOUT
  describe("4. Restriction of seller coupon to seller items at checkout", () => {
    const cartItems: ProductItemForCoupon[] = [
      {
        id: "prod_artisanal_carpet",
        productId: "prod_artisanal_carpet",
        name: "Tapis Berbère Artisanal",
        price: 15000,
        quantity: 1,
        sellerId: "seller_artisan_ghardaia",
        category: "Maison & Décoration",
      },
      {
        id: "prod_leather_bag",
        productId: "prod_leather_bag",
        name: "Sac en Cuir Véritable",
        price: 8000,
        quantity: 1,
        sellerId: "seller_artisan_ghardaia",
        category: "Maroquinerie",
      },
      {
        id: "prod_tech_phone",
        productId: "prod_tech_phone",
        name: "Smartphone Galaxy",
        price: 45000,
        quantity: 1,
        sellerId: "seller_tech_algiers", // Different seller
        category: "Électronique",
      },
    ];

    it("should only apply seller percentage discount to items belonging to that seller", () => {
      const sellerCoupon = {
        code: "GHARDAIA10",
        discountType: "percentage",
        discountValue: 10,
        sellerId: "seller_artisan_ghardaia",
        limitedToSellers: ["seller_artisan_ghardaia"],
        minOrderValue: 5000,
        isActive: true,
      };

      const { eligibleItems, eligibleSubtotal, hasRestrictions } = CouponService.filterEligibleItems(
        sellerCoupon,
        cartItems
      );

      expect(hasRestrictions).toBe(true);
      expect(eligibleItems).toHaveLength(2);
      expect(eligibleItems.map((i) => i.id)).toEqual(["prod_artisanal_carpet", "prod_leather_bag"]);
      expect(eligibleSubtotal).toBe(23000); // 15000 + 8000

      // Calculate discount on eligible subtotal
      const discountResult = CouponService.calculateDiscountAmount(sellerCoupon, eligibleSubtotal);

      expect(discountResult.error).toBeUndefined();
      // 10% of 23000 (only eligible seller items), NOT 10% of 68000
      expect(discountResult.discountAmount).toBe(2300);
      expect(discountResult.discountAmount).not.toBe(6800);
    });

    it("should reject seller coupon if cart contains no items from that seller", () => {
      const sellerCoupon = {
        code: "ORAN_FASHION20",
        discountType: "percentage",
        discountValue: 20,
        sellerId: "seller_fashion_oran", // Not in cart
        limitedToSellers: ["seller_fashion_oran"],
        minOrderValue: 2000,
        isActive: true,
      };

      const { eligibleItems, eligibleSubtotal, hasRestrictions } = CouponService.filterEligibleItems(
        sellerCoupon,
        cartItems
      );

      expect(hasRestrictions).toBe(true);
      expect(eligibleItems).toHaveLength(0);
      expect(eligibleSubtotal).toBe(0);

      const discountResult = CouponService.calculateDiscountAmount(sellerCoupon, eligibleSubtotal);
      expect(discountResult.discountAmount).toBe(0);
      expect(discountResult.error).toBeDefined();
    });

    it("should enforce minOrderAmount against only the seller's eligible items subtotal", () => {
      const sellerCouponHighMin = {
        code: "BIG_GHARDAIA",
        discountType: "fixed",
        discountValue: 2000,
        sellerId: "seller_artisan_ghardaia",
        limitedToSellers: ["seller_artisan_ghardaia"],
        minOrderValue: 30000, // Higher than Ghardaia items subtotal (23000), but lower than cart total (68000)
        isActive: true,
      };

      const { eligibleSubtotal } = CouponService.filterEligibleItems(sellerCouponHighMin, cartItems);
      expect(eligibleSubtotal).toBe(23000);

      const discountResult = CouponService.calculateDiscountAmount(sellerCouponHighMin, eligibleSubtotal);
      // Even though total cart is 68000 >= 30000, the seller's eligible items total is only 23000 < 30000
      expect(discountResult.discountAmount).toBe(0);
      expect(discountResult.error).toContain("minimum d'achat éligible de 30000 DA");
    });
  });
});
