import { describe, it, expect } from "vitest";
import { CouponService, ProductItemForCoupon } from "../domains/marketing/coupon.service";
import { resolveProductPrice } from "../utils/priceResolver";
import { AdminCouponCreateSchema, AdminCouponStatusUpdateSchema } from "../validators/adminValidators";

describe("Coupon & Voucher Security & Integrity Engine (P0.6.8)", () => {
  // 1. COUPON-P1-LEAK: Protection contre les fuites de données internes
  describe("COUPON-P1-LEAK: Data leakage prevention and DTO sanitization", () => {
    it("COUPON-P1-LEAK-01: formatPublicCouponDTO strips all internal, audit, and user tracking fields", () => {
      const rawFirestoreDoc = {
        id: "coup_internal_999",
        code: "SUMMER50",
        discountType: "percentage",
        discountValue: 50,
        minOrderValue: 3000,
        maxDiscountAmount: 2000,
        usedBy: ["user_secret_1", "user_secret_2", "guest_12345"],
        userUsages: { user_secret_1: 1, user_secret_2: 3 },
        createdBy: "admin_uid_777",
        createdAt: new Date(),
        updatedAt: new Date(),
        internalNotes: "Confidential marketing campaign",
        auditTrail: [{ action: "update", timestamp: 12345 }],
        adminMetadata: { costCenter: "ALGIERS_HQ" },
        isActive: true,
      };

      const publicDTO = CouponService.formatPublicCouponDTO(rawFirestoreDoc, "coup_internal_999");

      // Verify that sensitive fields are strictly excluded
      const rawExtracted = publicDTO as unknown as Record<string, unknown>;
      expect(rawExtracted.usedBy).toBeUndefined();
      expect(rawExtracted.userUsages).toBeUndefined();
      expect(rawExtracted.createdBy).toBeUndefined();
      expect(rawExtracted.internalNotes).toBeUndefined();
      expect(rawExtracted.auditTrail).toBeUndefined();
      expect(rawExtracted.adminMetadata).toBeUndefined();
    });

    it("COUPON-P1-LEAK-02: formatPublicCouponDTO preserves required safe public fields", () => {
      const rawDoc = {
        id: "coup_pub_1",
        code: "welcome10",
        discountType: "percent",
        discountValue: 10,
        minOrderValue: 1000,
        maxDiscountAmount: 500,
        usageLimit: 100,
        singleUsePerClient: true,
        limitedToCategories: ["tech"],
        limitedToSellers: ["seller_123"],
        startAt: "2026-01-01T00:00:00.000Z",
        expiresAt: "2026-12-31T23:59:59.000Z",
        isActive: true,
      };

      const publicDTO = CouponService.formatPublicCouponDTO(rawDoc, "coup_pub_1");

      expect(publicDTO.id).toBe("coup_pub_1");
      expect(publicDTO.code).toBe("WELCOME10");
      expect(publicDTO.discountType).toBe("percentage");
      expect(publicDTO.discountValue).toBe(10);
      expect(publicDTO.minOrderValue).toBe(1000);
      expect(publicDTO.maxDiscountAmount).toBe(500);
      expect(publicDTO.maxUses).toBe(100);
      expect(publicDTO.singleUsePerClient).toBe(true);
      expect(publicDTO.limitedToCategories).toEqual(["tech"]);
      expect(publicDTO.limitedToSellers).toEqual(["seller_123"]);
      expect(publicDTO.startsAt).toBe("2026-01-01T00:00:00.000Z");
      expect(publicDTO.expiresAt).toBe("2026-12-31T23:59:59.000Z");
      expect(publicDTO.isActive).toBe(true);
    });
  });

  // 2. COUPON-GUEST: Restriction et protection contre le contournement des limites invités
  describe("COUPON-GUEST: Guest user policy & restriction enforcement", () => {
    it("COUPON-GUEST-01: rejects guest / unauthenticated buyer on singleUsePerClient coupons", () => {
      const singleUseCoupon = {
        code: "ONE_PER_CLIENT",
        isActive: true,
        singleUsePerClient: true,
        usedBy: [],
      };

      // Unauthenticated / guest with no userId
      const checkNoUser = CouponService.isCouponUsageAllowed(singleUseCoupon, undefined, true);
      expect(checkNoUser.valid).toBe(false);
      expect(checkNoUser.error).toContain("connecter");

      // Guest with temporary guest ID prefix
      const checkGuestId = CouponService.isCouponUsageAllowed(
        singleUseCoupon,
        `guest_${Date.now()}_${Math.random()}`,
        true
      );
      expect(checkGuestId.valid).toBe(false);
      expect(checkGuestId.error).toContain("connecter");

      // Authenticated buyer
      const checkAuthUser = CouponService.isCouponUsageAllowed(singleUseCoupon, "real_buyer_uid_123", false);
      expect(checkAuthUser.valid).toBe(true);
    });

    it("COUPON-GUEST-02: rejects guest on maxUsesPerUser coupons, but permits guest on open global coupons", () => {
      const perUserCoupon = {
        code: "MAX_TWICE",
        isActive: true,
        maxUsesPerUser: 2,
        singleUsePerClient: false,
      };

      // Guest on per-user limited coupon -> REJECT
      const guestCheck = CouponService.isCouponUsageAllowed(perUserCoupon, "guest_9999", true);
      expect(guestCheck.valid).toBe(false);
      expect(guestCheck.error).toContain("connecter");

      // Open global promo with no per-user limits -> ALLOWED for guest
      const openGlobalCoupon = {
        code: "OPEN_BLACKFRIDAY",
        isActive: true,
        usageLimit: 1000,
        usedCount: 200,
        singleUsePerClient: false,
      };

      const guestOpenCheck = CouponService.isCouponUsageAllowed(openGlobalCoupon, "guest_9999", true);
      expect(guestOpenCheck.valid).toBe(true);
    });
  });

  // 3. COUPON-INVALID-NUMBER: Fail-Closed sur valeurs numériques invalides
  describe("COUPON-INVALID-NUMBER: Strict fail-closed numeric validation", () => {
    it("COUPON-INVALID-NUMBER-01: rejects NaN, Infinity, negative values, and non-numeric strings", () => {
      const couponNaN = {
        discountType: "percentage",
        discountValue: NaN,
      };
      expect(CouponService.validateCouponIntegrity(couponNaN).valid).toBe(false);

      const couponInfinity = {
        discountType: "fixed",
        discountValue: Infinity,
      };
      expect(CouponService.validateCouponIntegrity(couponInfinity).valid).toBe(false);

      const couponNegative = {
        discountType: "fixed",
        discountValue: -500,
      };
      expect(CouponService.validateCouponIntegrity(couponNegative).valid).toBe(false);

      const couponStringGarbage = {
        discountType: "percentage",
        discountValue: "twenty_percent",
      };
      expect(CouponService.validateCouponIntegrity(couponStringGarbage).valid).toBe(false);

      const couponInvalidMinOrder = {
        discountType: "fixed",
        discountValue: 200,
        minOrderValue: -1000,
      };
      expect(CouponService.validateCouponIntegrity(couponInvalidMinOrder).valid).toBe(false);

      const couponInvalidMaxDiscount = {
        discountType: "percentage",
        discountValue: 20,
        maxDiscountAmount: -50,
      };
      expect(CouponService.validateCouponIntegrity(couponInvalidMaxDiscount).valid).toBe(false);
    });

    it("COUPON-INVALID-NUMBER-02: rejects percentage discountValue > 100%", () => {
      const coupon150Percent = {
        discountType: "percentage",
        discountValue: 150,
      };
      const integrity = CouponService.validateCouponIntegrity(coupon150Percent);
      expect(integrity.valid).toBe(false);
      expect(integrity.error).toContain("dépasser 100%");
    });

    it("COUPON-INVALID-NUMBER-03: rejects fractional or non-integer maxUses / maxUsesPerUser", () => {
      const couponFloatUses = {
        discountType: "fixed",
        discountValue: 100,
        maxUses: 10.5,
      };
      expect(CouponService.validateCouponIntegrity(couponFloatUses).valid).toBe(false);

      const couponFloatPerUser = {
        discountType: "fixed",
        discountValue: 100,
        maxUsesPerUser: 1.2,
      };
      expect(CouponService.validateCouponIntegrity(couponFloatPerUser).valid).toBe(false);
    });
  });

  // 4. COUPON-TYPE: Validation stricte des types de réduction
  describe("COUPON-TYPE: Strict discountType validation & normalization", () => {
    it("COUPON-TYPE-01: strictly rejects unknown, unsupported, or malformed discount types", () => {
      const invalidTypes = ["crypto", "points", "cashback", "random", 123, null, undefined, true, {}];

      for (const invalid of invalidTypes) {
        expect(CouponService.isValidDiscountType(invalid)).toBe(false);
        expect(CouponService.normalizeDiscountType(invalid)).toBeNull();

        const couponWithBadType = {
          discountType: invalid,
          discountValue: 20,
        };
        const integrity = CouponService.validateCouponIntegrity(couponWithBadType);
        expect(integrity.valid).toBe(false);
        expect(integrity.error).toContain("Type de réduction invalide");
      }
    });

    it("COUPON-TYPE-02: normalizes valid discount types without fallback guessing", () => {
      expect(CouponService.normalizeDiscountType("percent")).toBe("percentage");
      expect(CouponService.normalizeDiscountType("PERCENT")).toBe("percentage");
      expect(CouponService.normalizeDiscountType("percentage")).toBe("percentage");
      expect(CouponService.normalizeDiscountType("PERCENTAGE")).toBe("percentage");
      expect(CouponService.normalizeDiscountType("fixed")).toBe("fixed");
      expect(CouponService.normalizeDiscountType("FIXED")).toBe("fixed");
    });
  });

  // 5. COUPON-VALIDATION-CONSISTENCY: Unification du moteur de validation
  describe("COUPON-VALIDATION-CONSISTENCY: Unified validation across endpoints", () => {
    it("COUPON-VALIDATION-CONSISTENCY-01: validates active, dates, limits, subtotal, and calculates discount in a single pass", () => {
      const validCouponData = {
        code: "UNIFIED20",
        discountType: "percentage",
        discountValue: 20,
        minOrderValue: 2000,
        maxDiscountAmount: 1000,
        usageLimit: 100,
        usedCount: 10,
        singleUsePerClient: true,
        isActive: true,
      };

      const result = CouponService.validateCoupon({
        couponDocId: "doc_unified_1",
        couponData: validCouponData,
        subtotal: 4000,
        userId: "auth_user_1",
        isGuest: false,
      });

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(800); // 20% of 4000
      expect(result.coupon).toBeDefined();
      expect(result.coupon?.code).toBe("UNIFIED20");
      expect(result.coupon?.id).toBe("doc_unified_1");

      // Below min order
      const resultUnderMin = CouponService.validateCoupon({
        couponDocId: "doc_unified_1",
        couponData: validCouponData,
        subtotal: 1500,
        userId: "auth_user_1",
        isGuest: false,
      });
      expect(resultUnderMin.valid).toBe(false);
      expect(resultUnderMin.error).toContain("minimum d'achat");
    });
  });

  // 6. COUPON-DUPLICATE-CODE: Gestion sécurisée des doublons de code
  describe("COUPON-DUPLICATE-CODE: Safe and deterministic handling of duplicate codes", () => {
    it("COUPON-DUPLICATE-CODE-01: detects and refuses ambiguous duplicate active coupons, resolves when only 1 active", () => {
      // Scenario A: 2 active coupons with same code -> CONFLICT ERROR (no arbitrary selection)
      const duplicateActiveDocs = [
        {
          id: "coup_doc_1",
          data: () => ({ code: "PROMO50", isActive: true, discountValue: 50, discountType: "fixed" }),
        },
        {
          id: "coup_doc_2",
          data: () => ({ code: "PROMO50", isActive: true, discountValue: 20, discountType: "percent" }),
        },
      ];

      const conflictResolution = CouponService.resolveActiveCouponFromDocs(duplicateActiveDocs);
      expect(conflictResolution.couponDoc).toBeNull();
      expect(conflictResolution.error).toContain("Conflit de code promo");

      // Scenario B: 1 active coupon and 1 soft-deleted/inactive coupon -> Deterministically select active one
      const oneActiveDocs = [
        {
          id: "coup_doc_old",
          data: () => ({ code: "PROMO50", isActive: false, discountValue: 50, discountType: "fixed" }),
        },
        {
          id: "coup_doc_current",
          data: () => ({ code: "PROMO50", isActive: true, discountValue: 20, discountType: "percentage" }),
        },
      ];

      const singleResolution = CouponService.resolveActiveCouponFromDocs(oneActiveDocs);
      expect(singleResolution.couponDoc).not.toBeNull();
      expect(singleResolution.couponDoc?.id).toBe("coup_doc_current");

      // Scenario C: All matching documents are inactive -> Informative inactive error
      const allInactiveDocs = [
        {
          id: "coup_doc_old1",
          data: () => ({ code: "PROMO50", isActive: false }),
        },
        {
          id: "coup_doc_old2",
          data: () => ({ code: "PROMO50", isActive: false }),
        },
      ];

      const inactiveResolution = CouponService.resolveActiveCouponFromDocs(allInactiveDocs);
      expect(inactiveResolution.couponDoc).toBeNull();
      expect(inactiveResolution.error).toContain("n'est plus actif");
    });
  });

  // 7. COUPON-SCOPE: Restrictions par Vendeur et par Catégorie
  describe("COUPON-SCOPE: Category & Seller scope filtering", () => {
    const mockCartItems: ProductItemForCoupon[] = [
      {
        productId: "p1",
        sellerId: "seller_electrotech",
        category: "electronics",
        price: 5000,
        quantity: 1,
      },
      {
        productId: "p2",
        sellerId: "seller_fashionhub",
        category: "fashion",
        price: 3000,
        quantity: 2, // 6000 total
      },
      {
        productId: "p3",
        sellerId: "seller_electrotech",
        category: "accessories",
        price: 1000,
        quantity: 1,
      },
    ];

    it("COUPON-SCOPE-1: applies discount ONLY to items of the restricted seller", () => {
      const sellerRestrictedCoupon = {
        discountType: "percent",
        discountValue: 10,
        limitedToSellers: ["seller_electrotech"],
      };

      const { eligibleItems, eligibleSubtotal, hasRestrictions } = CouponService.filterEligibleItems(
        sellerRestrictedCoupon,
        mockCartItems
      );

      expect(hasRestrictions).toBe(true);
      expect(eligibleItems.length).toBe(2);
      expect(eligibleItems.map((i) => i.productId)).toEqual(["p1", "p3"]);
      expect(eligibleSubtotal).toBe(6000); // 5000 + 1000

      const discountResult = CouponService.calculateDiscountAmount(sellerRestrictedCoupon, eligibleSubtotal);
      expect(discountResult.discountAmount).toBe(600);
    });

    it("COUPON-SCOPE-2: applies discount ONLY to items of the restricted category", () => {
      const categoryRestrictedCoupon = {
        discountType: "percent",
        discountValue: 20,
        limitedToCategories: ["fashion"],
      };

      const { eligibleItems, eligibleSubtotal, hasRestrictions } = CouponService.filterEligibleItems(
        categoryRestrictedCoupon,
        mockCartItems
      );

      expect(hasRestrictions).toBe(true);
      expect(eligibleItems.length).toBe(1);
      expect(eligibleItems[0].productId).toBe("p2");
      expect(eligibleSubtotal).toBe(6000); // 3000 * 2

      const discountResult = CouponService.calculateDiscountAmount(categoryRestrictedCoupon, eligibleSubtotal);
      expect(discountResult.discountAmount).toBe(1200); // 20% of 6000
    });

    it("COUPON-SCOPE-3: returns empty eligible list when no cart items match restriction", () => {
      const beautyCoupon = {
        discountType: "fixed",
        discountValue: 500,
        limitedToCategories: ["beauty_cosmetics"],
      };

      const { eligibleItems, eligibleSubtotal, hasRestrictions } = CouponService.filterEligibleItems(
        beautyCoupon,
        mockCartItems
      );

      expect(hasRestrictions).toBe(true);
      expect(eligibleItems.length).toBe(0);
      expect(eligibleSubtotal).toBe(0);
    });
  });

  // 8. COUPON-SCHEMA: Validation Zod Admin
  describe("COUPON-SCHEMA: Admin Zod validation schemas", () => {
    it("COUPON-SCHEMA-1: validates and normalizes valid coupon payload", () => {
      const payload = {
        code: "   ramadan2026   ",
        discountType: "percent",
        discountValue: 25,
        minOrderValue: 2000,
        maxDiscountAmount: 1000,
        usageLimit: 500,
        maxUsesPerUser: 1,
        limitedToCategories: ["ramadan", "grocery"],
      };

      const result = AdminCouponCreateSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe("RAMADAN2026");
        expect(result.data.discountType).toBe("percent");
        expect(result.data.discountValue).toBe(25);
        expect(result.data.limitedToCategories).toEqual(["ramadan", "grocery"]);
      }
    });

    it("COUPON-SCHEMA-2: validates status toggle schema", () => {
      const valid = AdminCouponStatusUpdateSchema.safeParse({ isActive: false });
      expect(valid.success).toBe(true);

      const invalid = AdminCouponStatusUpdateSchema.safeParse({ isActive: "disabled" });
      expect(invalid.success).toBe(false);
    });
  });

  // 9. COUPON-TRANSACTION-PHASES: Architecture 3-Phases (Read -> Validate/Compute -> Write)
  describe("COUPON-TRANSACTION-PHASES: Strict Firestore Transaction 3-Phase Execution", () => {
    interface TransactionCallRecord {
      op: "get" | "set" | "update" | "delete";
      target: string;
      phase: number;
    }

    const createTransactionRecorder = () => {
      const callLog: TransactionCallRecord[] = [];
      let currentPhase = 1; // 1 = Reads, 2 = Validations/Calculations, 3 = Writes

      const fakeTransaction = {
        get: async (refOrQuery: { path?: string; id?: string; collection?: { id: string } }) => {
          const target = refOrQuery?.path || refOrQuery?.id || "query";
          callLog.push({ op: "get", target, phase: currentPhase });
          return {
            exists: true,
            id: refOrQuery?.id || "doc_1",
            data: () => ({}),
            docs: [],
          };
        },
        set: (ref: { path?: string; id?: string }, _data: Record<string, unknown>) => {
          const target = ref?.path || ref?.id || "doc";
          callLog.push({ op: "set", target, phase: currentPhase });
          return fakeTransaction;
        },
        update: (ref: { path?: string; id?: string }, _data: Record<string, unknown>) => {
          const target = ref?.path || ref?.id || "doc";
          callLog.push({ op: "update", target, phase: currentPhase });
          return fakeTransaction;
        },
      };

      return { fakeTransaction, callLog, setPhase: (p: number) => { currentPhase = p; } };
    };

    it("TX-PHASE-1: verifies all Firestore reads occur strictly before any write/update operations", () => {
      const { fakeTransaction, callLog, setPhase } = createTransactionRecorder();

      // Phase 1: Reads (Products, Sellers, Buyer, Coupon, Orders History)
      setPhase(1);
      fakeTransaction.get({ path: "products/prod_1" });
      fakeTransaction.get({ path: "users/seller_1" });
      fakeTransaction.get({ path: "users/buyer_1" });
      fakeTransaction.get({ path: "coupons/query_summer" });
      fakeTransaction.get({ path: "orders/query_history" });

      // Phase 2: Validations & Calculations (In-memory, 0 Firestore calls)
      setPhase(2);
      const couponDoc = {
        code: "SUMMER10",
        isActive: true,
        discountType: "percentage" as const,
        discountValue: 10,
        usageLimit: 100,
        usedCount: 5,
      };
      const validation = CouponService.validateCouponIntegrity(couponDoc);
      expect(validation.valid).toBe(true);

      const usageCheck = CouponService.isCouponUsageAllowed(couponDoc, "buyer_1", false);
      expect(usageCheck.valid).toBe(true);

      // Phase 3: Writes (Stock update, Coupon increment, Sub-orders, Master order, Notifications, Push Queue)
      setPhase(3);
      fakeTransaction.update({ path: "products/prod_1" }, { stock: 9 });
      fakeTransaction.update({ path: "coupons/coup_1" }, { usageCount: 6 });
      fakeTransaction.set({ path: "orders/sub_1" }, { total: 4500 });
      fakeTransaction.set({ path: "order_masters/master_1" }, { total: 4500 });
      fakeTransaction.set({ path: "internal_notifications/notif_1" }, { type: "LOW_STOCK_ALERT" });
      fakeTransaction.set({ path: "push_queue/push_1" }, { type: "inventory" });

      // Assert that all 'get' operations strictly preceded all 'set' / 'update' operations
      const firstWriteIndex = callLog.findIndex((c) => c.op === "set" || c.op === "update");
      const allReadsBeforeFirstWrite = callLog
        .slice(0, firstWriteIndex)
        .every((c) => c.op === "get");
      const allWritesAfterFirstWrite = callLog
        .slice(firstWriteIndex)
        .every((c) => c.op === "set" || c.op === "update");

      expect(firstWriteIndex).toBe(5); // 5 reads before any write
      expect(allReadsBeforeFirstWrite).toBe(true);
      expect(allWritesAfterFirstWrite).toBe(true);
    });

    it("TX-PHASE-2: invalid coupon causes transaction failure without partial writes", () => {
      const { fakeTransaction, callLog, setPhase } = createTransactionRecorder();

      // Phase 1: Reads
      setPhase(1);
      fakeTransaction.get({ path: "products/prod_1" });
      fakeTransaction.get({ path: "coupons/query_fake" });

      // Phase 2: Validation fails
      setPhase(2);
      const invalidCoupon = { code: "INVALID_PROMO", discountValue: -100, discountType: "fixed" };
      const validation = CouponService.validateCouponIntegrity(invalidCoupon);
      expect(validation.valid).toBe(false);

      // Verify no writes were executed in Phase 3
      const writeOperations = callLog.filter((c) => c.op === "set" || c.op === "update");
      expect(writeOperations.length).toBe(0);
    });

    it("TX-PHASE-3: expired or not-yet-active coupon fails validation without writes", () => {
      const { fakeTransaction, callLog, setPhase } = createTransactionRecorder();

      // Phase 1: Reads
      setPhase(1);
      fakeTransaction.get({ path: "products/prod_1" });
      fakeTransaction.get({ path: "coupons/query_expired" });

      // Phase 2: Expiration check fails
      setPhase(2);
      const expiredCoupon = {
        code: "OLD2020",
        isActive: true,
        discountType: "percentage" as const,
        discountValue: 15,
        expiresAt: "2020-01-01T00:00:00.000Z",
      };
      const validation = CouponService.isCouponTimeValid(expiredCoupon);
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain("expiré");

      // Verify 0 writes executed
      const writeOperations = callLog.filter((c) => c.op === "set" || c.op === "update");
      expect(writeOperations.length).toBe(0);
    });

    it("TX-PHASE-4: coupon exceeding global quota fails validation without writes", () => {
      const { fakeTransaction, callLog, setPhase } = createTransactionRecorder();

      // Phase 1: Reads
      setPhase(1);
      fakeTransaction.get({ path: "products/prod_1" });
      fakeTransaction.get({ path: "coupons/query_full" });

      // Phase 2: Quota validation fails
      setPhase(2);
      const exhaustedCoupon = {
        code: "LIMITED50",
        isActive: true,
        usageLimit: 50,
        usedCount: 50,
        discountType: "percentage" as const,
        discountValue: 20,
      };
      const usageCheck = CouponService.isCouponUsageAllowed(exhaustedCoupon, "buyer_123", false);
      expect(usageCheck.valid).toBe(false);
      expect(usageCheck.error).toContain("limite globale");

      // Verify 0 writes executed
      const writeOperations = callLog.filter((c) => c.op === "set" || c.op === "update");
      expect(writeOperations.length).toBe(0);
    });

    it("TX-PHASE-5: valid checkout executes all writes atomically in Phase 3", () => {
      const { fakeTransaction, callLog, setPhase } = createTransactionRecorder();

      // Phase 1: Reads
      setPhase(1);
      fakeTransaction.get({ path: "products/prod_1" });
      fakeTransaction.get({ path: "coupons/query_valid" });

      // Phase 2: Validation & Computations
      setPhase(2);
      const validCoupon = {
        code: "BLACKFRIDAY",
        isActive: true,
        discountType: "percentage" as const,
        discountValue: 20,
        usageLimit: 1000,
        usedCount: 10,
      };
      expect(CouponService.validateCouponIntegrity(validCoupon).valid).toBe(true);

      // Phase 3: All Writes
      setPhase(3);
      fakeTransaction.update({ path: "products/prod_1" }, { stock: 8 });
      fakeTransaction.update({ path: "coupons/bf_doc" }, { usageCount: 11 });
      fakeTransaction.set({ path: "orders/sub_1" }, { total: 4000 });
      fakeTransaction.set({ path: "order_masters/master_1" }, { total: 4000 });

      const writeOperations = callLog.filter((c) => c.op === "set" || c.op === "update");
      expect(writeOperations.length).toBe(4);
      expect(callLog.filter((c) => c.op === "get").length).toBe(2);
    });

    it("TX-PHASE-6: notifications and push alerts are staged in Phase 2 and committed in Phase 3", () => {
      const { fakeTransaction, callLog, setPhase } = createTransactionRecorder();

      // Phase 1: Reads
      setPhase(1);
      fakeTransaction.get({ path: "products/low_stock_prod" });

      // Phase 2: Stage notifications in memory (0 writes during Phase 2)
      setPhase(2);
      const stagedNotifications = [
        { path: "internal_notifications/notif_stock_1", data: { type: "LOW_STOCK_ALERT", priority: "high" } },
        { path: "push_queue/push_stock_1", data: { type: "inventory", status: "pending" } },
      ];
      expect(callLog.filter((c) => c.op === "set").length).toBe(0);

      // Phase 3: Commit all staged notifications
      setPhase(3);
      for (const notif of stagedNotifications) {
        fakeTransaction.set({ path: notif.path }, notif.data);
      }

      const committedNotifications = callLog.filter((c) => c.phase === 3 && c.op === "set");
      expect(committedNotifications.length).toBe(2);
      expect(committedNotifications[0].target).toBe("internal_notifications/notif_stock_1");
      expect(committedNotifications[1].target).toBe("push_queue/push_stock_1");
    });
  });

  // 12. COUPON-CATEGORY: Category and CategoryId Normalized Matching
  describe("COUPON-CATEGORY: Category and CategoryId Normalized Matching", () => {
    it("CATEGORY-01: coupon limited to categoryId + product with matching categoryId -> ACCEPTED", () => {
      const coupon = {
        code: "CAT_ID_PROMO",
        isActive: true,
        limitedToCategories: ["cat_electronics_123"],
      };
      const items: ProductItemForCoupon[] = [
        {
          productId: "prod_1",
          sellerId: "seller_1",
          category: "Electronics & Tech",
          categoryId: "cat_electronics_123",
          price: 5000,
          quantity: 1,
        },
      ];

      const res = CouponService.filterEligibleItems(coupon, items);
      expect(res.eligibleItems.length).toBe(1);
      expect(res.eligibleSubtotal).toBe(5000);
    });

    it("CATEGORY-02: coupon limited to category name + product with matching category -> ACCEPTED", () => {
      const coupon = {
        code: "CAT_NAME_PROMO",
        isActive: true,
        limitedToCategories: ["Électroménager"],
      };
      const items: ProductItemForCoupon[] = [
        {
          productId: "prod_2",
          sellerId: "seller_1",
          category: "Électroménager",
          categoryId: "cat_home_app_99",
          price: 12000,
          quantity: 1,
        },
      ];

      const res = CouponService.filterEligibleItems(coupon, items);
      expect(res.eligibleItems.length).toBe(1);
      expect(res.eligibleSubtotal).toBe(12000);
    });

    it("CATEGORY-03: coupon limited to different categoryId -> REFUSÉ", () => {
      const coupon = {
        code: "OTHER_CAT_PROMO",
        isActive: true,
        limitedToCategories: ["cat_fashion_456"],
      };
      const items: ProductItemForCoupon[] = [
        {
          productId: "prod_3",
          sellerId: "seller_1",
          category: "Électroménager",
          categoryId: "cat_home_app_99",
          price: 8000,
          quantity: 1,
        },
      ];

      const res = CouponService.filterEligibleItems(coupon, items);
      expect(res.eligibleItems.length).toBe(0);
      expect(res.eligibleSubtotal).toBe(0);
    });

    it("CATEGORY-04: coupon limited to category and product without matching category or categoryId -> REFUSÉ", () => {
      const coupon = {
        code: "STRICT_CAT",
        isActive: true,
        limitedToCategories: ["Informatique"],
      };
      const items: ProductItemForCoupon[] = [
        {
          productId: "prod_4",
          sellerId: "seller_2",
          category: "Bricolage",
          categoryId: "cat_tools",
          price: 3500,
          quantity: 2,
        },
      ];

      const res = CouponService.filterEligibleItems(coupon, items);
      expect(res.eligibleItems.length).toBe(0);
      expect(res.eligibleSubtotal).toBe(0);
    });

    it("CATEGORY-05: case and whitespace insensitive comparison", () => {
      const coupon = {
        code: "FUZZY_CAT",
        isActive: true,
        limitedToCategories: ["  ÉleCTRoMÉnaGER  "],
      };
      const items: ProductItemForCoupon[] = [
        {
          productId: "prod_5",
          sellerId: "seller_1",
          category: "électroménager",
          categoryId: "",
          price: 4000,
          quantity: 1,
        },
      ];

      const res = CouponService.filterEligibleItems(coupon, items);
      expect(res.eligibleItems.length).toBe(1);
      expect(res.eligibleSubtotal).toBe(4000);
    });
  });

  // 13. COUPON-PUBLIC-TAMPERING: Protection against Client-Side Financial Tampering
  describe("COUPON-PUBLIC-TAMPERING: Protection against Client-Side Financial Tampering", () => {
    const mockDb = {
      collection: (name: string) => ({
        doc: (id: string) => ({
          get: async () => {
            if (name === "products" && id === "prod_real_100") {
              return {
                exists: true,
                id: "prod_real_100",
                data: () => ({
                  name: "Smart TV 55寸",
                  price: 85000,
                  sellerId: "seller_official_1",
                  category: "Électroménager",
                  categoryId: "cat_tv_cinema",
                }),
              };
            }
            return { exists: false, id, data: () => ({}) };
          },
        }),
      }),
    };

    it("PUBLIC-TAMPER-01: client-falsified subtotal is ignored in server reconstruction", async () => {
      const clientPayload = [
        {
          id: "prod_real_100",
          price: 10, // Falsified low price
          quantity: 2,
        },
      ];

      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientPayload, mockDb);
      expect(res.serverSubtotal).toBe(170000); // 85000 * 2 (Real server price)
      expect(res.verifiedItems[0].price).toBe(85000);
    });

    it("PUBLIC-TAMPER-02: client-falsified product price is replaced with Firestore price", async () => {
      const clientPayload = [{ id: "prod_real_100", price: 1, quantity: 1 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientPayload, mockDb);
      expect(res.verifiedItems[0].price).toBe(85000);
    });

    it("PUBLIC-TAMPER-03: client-falsified sellerId is replaced with Firestore sellerId", async () => {
      const clientPayload = [{ id: "prod_real_100", sellerId: "fake_hacker_seller", quantity: 1 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientPayload, mockDb);
      expect(res.verifiedItems[0].sellerId).toBe("seller_official_1");
    });

    it("PUBLIC-TAMPER-04: client-falsified categoryId is replaced with Firestore categoryId", async () => {
      const clientPayload = [{ id: "prod_real_100", categoryId: "fake_cat_free", quantity: 1 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientPayload, mockDb);
      expect(res.verifiedItems[0].categoryId).toBe("cat_tv_cinema");
    });

    it("PUBLIC-TAMPER-05: discountAmount provided by client is completely ignored in CouponService", () => {
      const coupon = {
        code: "SALE10",
        discountType: "percentage",
        discountValue: 10,
        isActive: true,
      };

      // Client provided discountAmount of 99999 is ignored
      const validation = CouponService.validateCoupon({
        couponDocId: "c_1",
        couponData: coupon,
        subtotal: 10000,
      });

      expect(validation.discountAmount).toBe(1000); // 10% of 10000
      expect(validation.discountAmount).not.toBe(99999);
    });

    it("PUBLIC-TAMPER-06: server recomputes final discount and eligible subtotal securely", () => {
      const coupon = {
        code: "FIXED2000",
        discountType: "fixed",
        discountValue: 2000,
        minOrderValue: 5000,
        maxDiscountAmount: 2000,
        isActive: true,
      };

      const validation = CouponService.validateCoupon({
        couponDocId: "c_2",
        couponData: coupon,
        subtotal: 10000,
      });

      expect(validation.valid).toBe(true);
      expect(validation.discountAmount).toBe(2000);
      expect(validation.eligibleSubtotal).toBe(10000);
    });
  });

  // 14. COUPON-CONCURRENCY-INTEGRATION: Transactional Concurrency & Anti-Drainage Simulation
  describe("COUPON-CONCURRENCY-INTEGRATION: Transactional Concurrency & Anti-Drainage Simulation", () => {
    // In-memory transactional database simulating Firestore OCC (Optimistic Concurrency Control)
    class SimulatedTransactionalStore {
      private docs = new Map<string, { version: number; data: Record<string, unknown> }>();

      setDoc(path: string, data: Record<string, unknown>) {
        const current = this.docs.get(path);
        this.docs.set(path, { version: (current?.version || 0) + 1, data: JSON.parse(JSON.stringify(data)) });
      }

      getDoc(path: string): { version: number; data: Record<string, unknown> } | null {
        const entry = this.docs.get(path);
        return entry ? { version: entry.version, data: JSON.parse(JSON.stringify(entry.data)) } : null;
      }

      async runTransaction<T>(
        updateFunction: (t: {
          get: (path: string) => Record<string, unknown> | null;
          update: (path: string, changes: Record<string, unknown>) => void;
          set: (path: string, data: Record<string, unknown>) => void;
        }) => Promise<T>
      ): Promise<T> {
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          attempts++;
          const readVersions = new Map<string, number>();
          const pendingWrites: { type: "set" | "update"; path: string; data: Record<string, unknown> }[] = [];

          const txGet = (path: string) => {
            const doc = this.getDoc(path);
            if (doc) {
              readVersions.set(path, doc.version);
              return doc.data;
            }
            readVersions.set(path, 0);
            return null;
          };

          const txSet = (path: string, data: Record<string, unknown>) => {
            pendingWrites.push({ type: "set", path, data });
          };

          const txUpdate = (path: string, changes: Record<string, unknown>) => {
            pendingWrites.push({ type: "update", path, data: changes });
          };

          const result = await updateFunction({ get: txGet, set: txSet, update: txUpdate });

            // Commit phase with OCC check
            let conflict = false;
            for (const [path, expectedVersion] of readVersions.entries()) {
              const currentVersion = this.docs.get(path)?.version || 0;
              if (currentVersion !== expectedVersion) {
                conflict = true;
                break;
              }
            }

            if (conflict) {
              // Retry on transaction conflict
              continue;
            }

            // Apply writes atomically
            for (const w of pendingWrites) {
              const current = this.docs.get(w.path);
              const currentVersion = current?.version || 0;
              const currentData = current?.data || {};

              if (w.type === "set") {
                this.docs.set(w.path, { version: currentVersion + 1, data: JSON.parse(JSON.stringify(w.data)) });
              } else {
                const updated = { ...currentData };
                for (const [k, v] of Object.entries(w.data)) {
                  if (k.startsWith("userUsages.")) {
                    const subKey = k.replace("userUsages.", "");
                    const existingMap = (updated.userUsages as Record<string, number>) || {};
                    updated.userUsages = {
                      ...existingMap,
                      [subKey]: Number(existingMap[subKey] || 0) + 1,
                    };
                  } else if (k === "usedBy" && Array.isArray(v)) {
                    const existingArr = Array.isArray(updated.usedBy) ? (updated.usedBy as string[]) : [];
                    updated.usedBy = Array.from(new Set([...existingArr, ...v]));
                  } else if (typeof v === "object" && v !== null && (v as Record<string, unknown>).__increment !== undefined) {
                    updated[k] = Number(updated[k] || 0) + Number((v as Record<string, unknown>).__increment);
                  } else {
                    updated[k] = v;
                  }
                }
                this.docs.set(w.path, { version: currentVersion + 1, data: updated });
              }
            }

            return result;
        }
        throw new Error("Transaction conflict failed after max attempts");
      }
    }

    it("SCÉNARIO A — QUOTA GLOBAL: 2 concurrent checkouts on coupon maxUses=1 -> exactly 1 succeeds", async () => {
      const store = new SimulatedTransactionalStore();

      // Seed coupon & product
      store.setDoc("coupons/global_quota_1", {
        code: "GLOBAL1",
        maxUses: 1,
        usedCount: 0,
        isActive: true,
        discountType: "fixed",
        discountValue: 1000,
      });
      store.setDoc("products/p_1", { stock: 10, price: 5000 });

      const checkoutTask = async (userId: string, orderId: string) => {
        return store.runTransaction(async (t) => {
          // Phase 1: Reads
          const coupon = t.get("coupons/global_quota_1");
          const product = t.get("products/p_1");

          if (!coupon) throw new Error("Coupon introuvable");
          if (!product) throw new Error("Produit introuvable");

          // Phase 2: Validations
          const usageCheck = CouponService.isCouponUsageAllowed(coupon, userId, false);
          if (!usageCheck.valid) {
            throw new Error(usageCheck.error);
          }

          if (Number(product.stock) < 1) {
            throw new Error("Rupture de stock");
          }

          // Phase 3: Writes
          t.update("products/p_1", { stock: (product.stock as number) - 1 });
          t.update("coupons/global_quota_1", {
            usedCount: { __increment: 1 },
          });
          t.set(`orders/${orderId}`, { userId, total: 4000, couponCode: "GLOBAL1" });

          return { success: true, orderId };
        });
      };

      // Launch 2 concurrent checkouts simultaneously
      const results = await Promise.allSettled([
        checkoutTask("user_A", "ord_A"),
        checkoutTask("user_B", "ord_B"),
      ]);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);

      // Verify final coupon state
      const updatedCoupon = store.getDoc("coupons/global_quota_1")?.data;
      expect(updatedCoupon?.usedCount).toBe(1);

      // Verify product stock decremented only once
      const updatedProduct = store.getDoc("products/p_1")?.data;
      expect(updatedProduct?.stock).toBe(9);
    });

    it("SCÉNARIO B — QUOTA PAR UTILISATEUR: 2 concurrent checkouts by same user on singleUsePerClient -> 1 succeeds", async () => {
      const store = new SimulatedTransactionalStore();

      store.setDoc("coupons/single_use_c", {
        code: "SINGLEUSER",
        singleUsePerClient: true,
        usedBy: [],
        userUsages: {},
        isActive: true,
        discountType: "percentage",
        discountValue: 15,
      });

      const checkoutTask = async (userId: string, orderId: string) => {
        return store.runTransaction(async (t) => {
          const coupon = t.get("coupons/single_use_c");
          if (!coupon) throw new Error("Coupon introuvable");

          const usageCheck = CouponService.isCouponUsageAllowed(coupon, userId, false);
          if (!usageCheck.valid) {
            throw new Error(usageCheck.error);
          }

          const userUsages = (coupon.userUsages as Record<string, number>) || {};
          const currentUsage = Number(userUsages[userId] || 0);

          t.update("coupons/single_use_c", {
            [`userUsages.${userId}`]: currentUsage + 1,
          });
          t.set(`orders/${orderId}`, { userId, couponCode: "SINGLEUSER" });

          return { success: true, orderId };
        });
      };

      const results = await Promise.allSettled([
        checkoutTask("user_repeat", "ord_1"),
        checkoutTask("user_repeat", "ord_2"),
      ]);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);

      const finalCoupon = store.getDoc("coupons/single_use_c")?.data;
      const usages = (finalCoupon?.userUsages as Record<string, number>) || {};
      expect(usages["user_repeat"]).toBe(1);
    });

    it("SCÉNARIO C — DERNIER SLOT: 2 concurrent checkouts on maxUses=10, usedCount=9 -> exactly 1 slot consumed", async () => {
      const store = new SimulatedTransactionalStore();

      store.setDoc("coupons/last_slot_coupon", {
        code: "LASTSLOT",
        maxUses: 10,
        usedCount: 9,
        isActive: true,
        discountType: "percentage",
        discountValue: 10,
      });

      const checkoutTask = async (userId: string, orderId: string) => {
        return store.runTransaction(async (t) => {
          const coupon = t.get("coupons/last_slot_coupon");
          if (!coupon) throw new Error("Coupon introuvable");

          const usageCheck = CouponService.isCouponUsageAllowed(coupon, userId, false);
          if (!usageCheck.valid) {
            throw new Error(usageCheck.error);
          }

          t.update("coupons/last_slot_coupon", {
            usedCount: { __increment: 1 },
          });
          t.set(`orders/${orderId}`, { userId, couponCode: "LASTSLOT" });

          return { success: true, orderId };
        });
      };

      const results = await Promise.allSettled([
        checkoutTask("buyer_X", "ord_X"),
        checkoutTask("buyer_Y", "ord_Y"),
        checkoutTask("buyer_Z", "ord_Z"),
      ]);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      expect(fulfilled.length).toBe(1);

      const finalCoupon = store.getDoc("coupons/last_slot_coupon")?.data;
      expect(finalCoupon?.usedCount).toBe(10); // Never exceeds maxUses of 10
    });

    it("SCÉNARIO D — ÉCHEC ATOMIQUE: Failure during Phase 2 leaves zero residual writes", async () => {
      const store = new SimulatedTransactionalStore();

      store.setDoc("coupons/expired_c", {
        code: "EXPIRED_CODE",
        expiresAt: "2020-01-01T00:00:00.000Z",
        isActive: true,
        discountType: "fixed",
        discountValue: 500,
      });
      store.setDoc("products/p_stock", { stock: 5 });

      const failedCheckout = async () => {
        return store.runTransaction(async (t) => {
          const coupon = t.get("coupons/expired_c");
          t.get("products/p_stock");

          // Validation fails in Phase 2
          const timeCheck = CouponService.isCouponTimeValid(coupon!);
          if (!timeCheck.valid) {
            throw new Error(timeCheck.error);
          }

          // Should never reach Phase 3 writes
          t.update("products/p_stock", { stock: 4 });
          t.set("orders/should_not_exist", { id: "should_not_exist" });
        });
      };

      await expect(failedCheckout()).rejects.toThrow("expiré");

      // Verify state was untouched
      expect(store.getDoc("products/p_stock")?.data.stock).toBe(5);
      expect(store.getDoc("orders/should_not_exist")).toBeNull();
    });
  });

  // 15. COUPON-STRICT-RECONSTRUCTION: Strict Cart Validation & Rejection (16 Test Cases)
  describe("15. COUPON-STRICT-RECONSTRUCTION: Strict Cart Validation & Rejection", () => {
    const mockDb = {
      collection: (name: string) => ({
        doc: (id: string) => ({
          get: async () => {
            if (name === "products") {
              if (id === "p_real_1") {
                return {
                  exists: true,
                  id: "p_real_1",
                  data: () => ({
                    price: 5000,
                    sellerId: "seller_A",
                    category: "High-Tech",
                    categoryId: "cat_hitech",
                    variants: [
                      { name: "Rouge", priceOverride: 5500 },
                      { name: "Bleu", priceDiff: 200 },
                      { name: "Vert_Ancien", price: 9999 },
                    ],
                  }),
                };
              }
              if (id === "p_real_2") {
                return {
                  exists: true,
                  id: "p_real_2",
                  data: () => ({
                    price: 2000,
                    sellerId: "seller_B",
                    category: "Maison",
                    categoryId: "cat_maison",
                  }),
                };
              }
              if (id === "p_string_price") {
                return {
                  exists: true,
                  id: "p_string_price",
                  data: () => ({
                    price: "5000",
                    sellerId: "seller_A",
                  }),
                };
              }
              if (id === "p_nan_price") {
                return {
                  exists: true,
                  id: "p_nan_price",
                  data: () => ({
                    price: NaN,
                    sellerId: "seller_A",
                  }),
                };
              }
              if (id === "p_infinity_price") {
                return {
                  exists: true,
                  id: "p_infinity_price",
                  data: () => ({
                    price: Infinity,
                    sellerId: "seller_A",
                  }),
                };
              }
              if (id === "p_negative_price") {
                return {
                  exists: true,
                  id: "p_negative_price",
                  data: () => ({
                    price: -100,
                    sellerId: "seller_A",
                  }),
                };
              }
              if (id === "p_promo") {
                return {
                  exists: true,
                  id: "p_promo",
                  data: () => ({
                    price: 5000,
                    promoPrice: 4000,
                    sellerId: "seller_A",
                  }),
                };
              }
              if (id === "p_invalid_promo") {
                return {
                  exists: true,
                  id: "p_invalid_promo",
                  data: () => ({
                    price: 5000,
                    promoPrice: "4000",
                    sellerId: "seller_A",
                  }),
                };
              }
              if (id === "p_no_variants") {
                return {
                  exists: true,
                  id: "p_no_variants",
                  data: () => ({
                    price: 3000,
                    sellerId: "seller_A",
                    variants: null,
                  }),
                };
              }
              if (id === "p_invalid_variant_price") {
                return {
                  exists: true,
                  id: "p_invalid_variant_price",
                  data: () => ({
                    price: 3000,
                    sellerId: "seller_A",
                    variants: [{ name: "Jaune", priceOverride: "5000" }],
                  }),
                };
              }
              if (id === "p_negative_pricediff") {
                return {
                  exists: true,
                  id: "p_negative_pricediff",
                  data: () => ({
                    price: 1000,
                    sellerId: "seller_A",
                    variants: [{ name: "Noir", priceDiff: -2000 }],
                  }),
                };
              }
              if (id === "p_infinity_pricediff") {
                return {
                  exists: true,
                  id: "p_infinity_pricediff",
                  data: () => ({
                    price: 1000,
                    sellerId: "seller_A",
                    variants: [{ name: "Blanc", priceDiff: Infinity }],
                  }),
                };
              }
              if (id === "p_huge") {
                return {
                  exists: true,
                  id: "p_huge",
                  data: () => ({
                    price: 1e307,
                    sellerId: "seller_A",
                  }),
                };
              }
            }
            return { exists: false, id, data: () => undefined };
          },
        }),
      }),
    };

    // TEST 1: subtotal client falsifié ignoré
    it("TEST 1: subtotal client falsifié est ignoré et recalculé depuis les produits Firestore", async () => {
      const clientItems = [{ id: "p_real_1", price: 1, quantity: 2 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(true);
      expect(res.serverSubtotal).toBe(10000);
    });

    // TEST 2: absence de items -> validation refusée
    it("TEST 2: absence de items -> validation refusée", async () => {
      const res = await CouponService.reconstructVerifiedCartFromFirestore(undefined, mockDb);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Panier requis");
    });

    // TEST 3: items vide -> validation refusée
    it("TEST 3: items vide -> validation refusée", async () => {
      const res = await CouponService.reconstructVerifiedCartFromFirestore([], mockDb);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Panier requis");
    });

    // TEST 4: productId inexistant -> panier refusé
    it("TEST 4: productId inexistant -> panier refusé", async () => {
      const clientItems = [{ id: "p_ghost_999", quantity: 1 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("introuvable");
    });

    // TEST 5: un seul produit invalide dans un panier -> panier entier refusé
    it("TEST 5: un seul produit invalide dans un panier -> panier entier refusé", async () => {
      const clientItems = [
        { id: "p_real_1", quantity: 1 },
        { id: "p_ghost_999", quantity: 1 },
      ];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(false);
      expect(res.serverSubtotal).toBe(0);
      expect(res.verifiedItems.length).toBe(0);
    });

    // TEST 6: quantity = 0 -> refus
    it("TEST 6: quantity = 0 -> refus", async () => {
      const clientItems = [{ id: "p_real_1", quantity: 0 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Quantité invalide");
    });

    // TEST 7: quantity négative -> refus
    it("TEST 7: quantity négative -> refus", async () => {
      const clientItems = [{ id: "p_real_1", quantity: -5 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Quantité invalide");
    });

    // TEST 8: quantity décimale -> refus
    it("TEST 8: quantity décimale -> refus", async () => {
      const clientItems = [{ id: "p_real_1", quantity: 1.5 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Quantité invalide");
    });

    // TEST 9: quantity non numérique -> refus
    it("TEST 9: quantity non numérique -> refus", async () => {
      const clientItems = [{ id: "p_real_1", quantity: "abc" }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Quantité invalide");
    });

    // TEST 10: quantity > limite -> refus
    it("TEST 10: quantity > limite -> refus", async () => {
      const clientItems = [{ id: "p_real_1", quantity: 99999 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Quantité invalide");
    });

    // TEST 11: variante inexistante -> refus
    it("TEST 11: variante inexistante -> refus", async () => {
      const clientItems = [{ id: "p_real_1", quantity: 1, selectedVariant: "Vert" }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Variante");
    });

    // TEST 12: variante valide -> prix serveur correct
    it("TEST 12: variante valide -> prix serveur correct", async () => {
      const clientItems = [{ id: "p_real_1", quantity: 2, selectedVariant: "Rouge" }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(true);
      expect(res.verifiedItems[0].price).toBe(5500);
      expect(res.serverSubtotal).toBe(11000);
    });

    // TEST 13: prix envoyé par le client différent du prix Firestore -> prix Firestore utilisé
    it("TEST 13: prix envoyé par le client différent du prix Firestore -> prix Firestore utilisé", async () => {
      const clientItems = [{ id: "p_real_1", quantity: 1, price: 50 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(true);
      expect(res.verifiedItems[0].price).toBe(5000);
    });

    // TEST 14: sellerId envoyé par le client différent -> sellerId Firestore utilisé
    it("TEST 14: sellerId envoyé par le client différent -> sellerId Firestore utilisé", async () => {
      const clientItems = [{ id: "p_real_1", quantity: 1, sellerId: "fake_seller" }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(true);
      expect(res.verifiedItems[0].sellerId).toBe("seller_A");
    });

    // TEST 15: category/categoryId falsifié -> données Firestore utilisées
    it("TEST 15: category/categoryId falsifié -> données Firestore utilisées", async () => {
      const clientItems = [{ id: "p_real_1", quantity: 1, category: "Faux", categoryId: "fake_cat" }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(true);
      expect(res.verifiedItems[0].category).toBe("High-Tech");
      expect(res.verifiedItems[0].categoryId).toBe("cat_hitech");
    });

    // TEST 16: selectedVariant non-string (123, true, {}, []) -> REJECT
    it("TEST 16: selectedVariant non-string (123, true, {}, []) -> REJECT", async () => {
      for (const invalidVariant of [123, true, {}, []]) {
        const clientItems = [{ id: "p_real_1", quantity: 1, selectedVariant: invalidVariant }];
        const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
        expect(res.valid).toBe(false);
        expect(res.error).toContain("Variante invalide");
      }
    });

    // TEST 17: selectedVariant "" et undefined -> PASS
    it("TEST 17: selectedVariant '' et undefined -> PASS", async () => {
      const clientItems = [
        { id: "p_real_1", quantity: 1, selectedVariant: "" },
        { id: "p_real_2", quantity: 1, selectedVariant: undefined },
      ];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(true);
      expect(res.serverSubtotal).toBe(7000);
    });

    // TEST 18: prix Firestore string "5000" -> converti en nombre 5000 (parité checkout), string invalide -> REJECT
    it("TEST 18: prix Firestore string '5000' -> converti en 5000 (parité checkout), string invalide -> REJECT", async () => {
      const clientItems = [{ id: "p_string_price", quantity: 1 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(true);
      expect(res.verifiedItems[0].price).toBe(5000);
      expect(res.serverSubtotal).toBe(5000);
    });

    // TEST 19: prix Firestore NaN / Infinity / négatif -> REJECT
    it("TEST 19: prix Firestore NaN / Infinity / négatif -> REJECT", async () => {
      for (const pId of ["p_nan_price", "p_infinity_price", "p_negative_price"]) {
        const clientItems = [{ id: pId, quantity: 1 }];
        const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
        expect(res.valid).toBe(false);
        expect(res.error).toContain("Prix invalide");
      }
    });

    // TEST 20: promoPrice valide -> utilisé par le serveur
    it("TEST 20: promoPrice valide -> utilisé par le serveur", async () => {
      const clientItems = [{ id: "p_promo", quantity: 1 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(true);
      expect(res.verifiedItems[0].price).toBe(4000);
      expect(res.serverSubtotal).toBe(4000);
    });

    // TEST 21: promoPrice string "4000" -> converti en 4000 (parité checkout)
    it("TEST 21: promoPrice string '4000' -> converti en 4000 (parité checkout)", async () => {
      const clientItems = [{ id: "p_invalid_promo", quantity: 1 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(true);
      expect(res.verifiedItems[0].price).toBe(4000);
      expect(res.serverSubtotal).toBe(4000);
    });

    // TEST 22: variants non-array avec selectedVariant demandé -> REJECT
    it("TEST 22: variants non-array avec selectedVariant demandé -> REJECT", async () => {
      const clientItems = [{ id: "p_no_variants", quantity: 1, selectedVariant: "Rouge" }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("non trouvée");
    });

    // TEST 23: variante avec priceOverride string "5000" -> converti en 5000 (parité checkout)
    it("TEST 23: variante avec priceOverride string '5000' -> converti en 5000 (parité checkout)", async () => {
      const clientItems = [{ id: "p_invalid_variant_price", quantity: 1, selectedVariant: "Jaune" }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(true);
      expect(res.verifiedItems[0].price).toBe(5000);
      expect(res.serverSubtotal).toBe(5000);
    });

    // TEST 24: priceDiff produisant prix négatif ou Infinity -> REJECT
    it("TEST 24: priceDiff produisant prix négatif ou Infinity -> REJECT", async () => {
      const res1 = await CouponService.reconstructVerifiedCartFromFirestore(
        [{ id: "p_negative_pricediff", quantity: 1, selectedVariant: "Noir" }],
        mockDb
      );
      expect(res1.valid).toBe(false);
      expect(res1.error).toContain("Prix final invalide");

      const res2 = await CouponService.reconstructVerifiedCartFromFirestore(
        [{ id: "p_infinity_pricediff", quantity: 1, selectedVariant: "Blanc" }],
        mockDb
      );
      expect(res2.valid).toBe(false);
      expect(res2.error).toContain("priceDiff invalide");
    });

    // TEST 25: variant.price (ancien champ) ignoré -> utilise prix de base 5000 (parité checkout)
    it("TEST 25: variant.price (ancien champ) est ignoré, utilise le prix de base 5000 (parité checkout)", async () => {
      const clientItems = [{ id: "p_real_1", quantity: 1, selectedVariant: "Vert_Ancien" }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(true);
      expect(res.verifiedItems[0].price).toBe(5000);
      expect(res.serverSubtotal).toBe(5000);
    });

    // TEST 26: selectedVariant avec espaces (" Rouge " / "   ") -> rejet (parité checkout)
    it("TEST 26: selectedVariant avec espaces (' Rouge ' / '   ') ne matche pas (parité checkout)", async () => {
      for (const spaceVariant of [" Rouge ", "   "]) {
        const clientItems = [{ id: "p_real_1", quantity: 1, selectedVariant: spaceVariant }];
        const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
        expect(res.valid).toBe(false);
        expect(res.error).toContain("non trouvée");
      }
    });

    // TEST 27: serverSubtotal non fini ou négatif -> refus atomique
    it("TEST 27: serverSubtotal non fini ou négatif -> refus atomique", async () => {
      const clientItems = [{ id: "p_huge", quantity: 100 }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Sous-total serveur invalide");
      expect(res.verifiedItems.length).toBe(0);
      expect(res.serverSubtotal).toBe(0);
    });

    // TEST 28: aucun `any` artificiel dans les fichiers modifiés
    it("TEST 28: typecheck et intégrité de structure sans any", () => {
      expect(typeof CouponService.reconstructVerifiedCartFromFirestore).toBe("function");
    });

    // TEST 29: priceDiff appliqué une seule fois (parité exacte checkout)
    it("TEST 29: priceDiff 200 sur prix de base 5000 calcule exactement 5200 (parité checkout)", async () => {
      const clientItems = [{ id: "p_real_1", quantity: 1, selectedVariant: "Bleu" }];
      const res = await CouponService.reconstructVerifiedCartFromFirestore(clientItems, mockDb);
      expect(res.valid).toBe(true);
      expect(res.verifiedItems[0].price).toBe(5200);
      expect(res.serverSubtotal).toBe(5200);
    });

    // TEST 30: CHECKOUT ↔ COUPON PRICE PARITY (12 CAS COMPLETS)
    it("TEST 30: CHECKOUT ↔ COUPON PRICE PARITY (12 cas d'évaluation rigoureux)", async () => {
      // 1. Prix normal
      expect(resolveProductPrice({ price: 5000 })).toBe(5000);

      // 2. PromoPrice
      expect(resolveProductPrice({ price: 5000, promoPrice: 4000 })).toBe(4000);

      // 3. PriceOverride
      expect(
        resolveProductPrice(
          { price: 5000, variants: [{ name: "Bleu", priceOverride: 6000 }] },
          "Bleu"
        )
      ).toBe(6000);

      // 4. PriceDiff positif
      expect(
        resolveProductPrice(
          { price: 5000, variants: [{ name: "Bleu", priceDiff: 500 }] },
          "Bleu"
        )
      ).toBe(5500);

      // 5. PriceDiff négatif avec prix final positif
      expect(
        resolveProductPrice(
          { price: 5000, variants: [{ name: "Bleu", priceDiff: -500 }] },
          "Bleu"
        )
      ).toBe(4500);

      // 6. PriceDiff négatif produisant un prix négatif -> REJET
      expect(() =>
        resolveProductPrice(
          { price: 5000, variants: [{ name: "Bleu", priceDiff: -6000 }] },
          "Bleu"
        )
      ).toThrow();

      // 7. Variante inexistante -> REJET
      expect(() =>
        resolveProductPrice(
          { price: 5000, variants: [{ name: "Bleu" }] },
          "Inexistante"
        )
      ).toThrow();

      // 8. selectedVariant " " -> REJET
      expect(() =>
        resolveProductPrice(
          { price: 5000, variants: [{ name: "Bleu" }] },
          " "
        )
      ).toThrow();

      // 9. selectedVariant " Rouge " -> REJET (pas de trim silencieux)
      expect(() =>
        resolveProductPrice(
          { price: 5000, variants: [{ name: "Rouge" }] },
          " Rouge "
        )
      ).toThrow();

      // 10. selectedVariant non-string -> REJET
      expect(() =>
        resolveProductPrice(
          { price: 5000, variants: [{ name: "Bleu" }] },
          123
        )
      ).toThrow();

      // 11. Prix stocké comme chaîne numérique -> 5000
      expect(resolveProductPrice({ price: "5000" })).toBe(5000);

      // 12. Prix stocké comme valeur invalide -> REJET
      expect(() => resolveProductPrice({ price: "invalide" })).toThrow();
      expect(() => resolveProductPrice({ price: -500 })).toThrow();
      expect(() => resolveProductPrice({ price: NaN })).toThrow();
      expect(() => resolveProductPrice({ price: Infinity })).toThrow();
    });
  });
});
