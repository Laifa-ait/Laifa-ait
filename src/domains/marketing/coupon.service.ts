export type { PublicCouponDTO, ProductItemForCoupon, ReconstructedCartResult } from "./coupon.types";
import type { PublicCouponDTO, ProductItemForCoupon, ReconstructedCartResult } from "./coupon.types";
import { resolveProductPrice } from "../../utils/priceResolver";

export type NormalizedDiscountType = "percentage" | "fixed";

export interface CouponValidationParams {
  couponDocId: string;
  couponData: Record<string, unknown>;
  subtotal?: number;
  userId?: string;
  isGuest?: boolean;
  items?: ProductItemForCoupon[];
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: PublicCouponDTO;
  discountAmount?: number;
  eligibleSubtotal?: number;
}

export interface CouponDocumentLike {
  id: string;
  data: () => Record<string, unknown>;
}

export class CouponService {
  /**
   * Check if discount type is strictly valid ("percent", "percentage", "fixed")
   */
  static isValidDiscountType(type: unknown): boolean {
    if (typeof type !== "string") return false;
    const lower = type.trim().toLowerCase();
    return lower === "percent" || lower === "percentage" || lower === "fixed";
  }

  /**
   * Normalize discount type from various legacy/modern representations
   * Rejects unknown discount types (returns null)
   */
  static normalizeDiscountType(type: unknown): NormalizedDiscountType | null {
    if (typeof type === "string") {
      const lower = type.trim().toLowerCase();
      if (lower === "percent" || lower === "percentage") {
        return "percentage";
      }
      if (lower === "fixed") {
        return "fixed";
      }
    }
    return null;
  }

  /**
   * Safely parse a date from Firestore Timestamp, Date object, ISO string or number
   */
  static parseCouponDate(dateVal: unknown): Date | null {
    if (!dateVal) return null;
    if (dateVal instanceof Date) {
      return isNaN(dateVal.getTime()) ? null : dateVal;
    }
    if (typeof dateVal === "object" && dateVal !== null) {
      const obj = dateVal as {
        toDate?: () => Date;
        _seconds?: number;
        seconds?: number;
      };
      if (typeof obj.toDate === "function") {
        try {
          const d = obj.toDate();
          return isNaN(d.getTime()) ? null : d;
        } catch {
          return null;
        }
      }
      if (typeof obj._seconds === "number") {
        return new Date(obj._seconds * 1000);
      }
      if (typeof obj.seconds === "number") {
        return new Date(obj.seconds * 1000);
      }
    }
    if (typeof dateVal === "string" || typeof dateVal === "number") {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  /**
   * Fail-closed numeric and structural integrity check
   */
  static validateCouponIntegrity(coupon: Record<string, unknown>): {
    valid: boolean;
    error?: string;
  } {
    if (!coupon || typeof coupon !== "object") {
      return { valid: false, error: "Données de coupon invalides." };
    }

    // 1. Strict discount type check
    const normalizedType = this.normalizeDiscountType(coupon.discountType);
    if (!normalizedType) {
      return {
        valid: false,
        error: "Type de réduction invalide ou non reconnu.",
      };
    }

    // 2. Strict discount value check
    const rawVal = coupon.discountValue ?? coupon.percent ?? coupon.percentage;
    if (rawVal === undefined || rawVal === null || rawVal === "") {
      return { valid: false, error: "Valeur de réduction manquante." };
    }
    if (typeof rawVal !== "number" && typeof rawVal !== "string") {
      return { valid: false, error: "Valeur de réduction invalide." };
    }
    const numVal = Number(rawVal);
    if (isNaN(numVal) || !isFinite(numVal) || numVal <= 0) {
      return {
        valid: false,
        error: "Valeur de réduction invalide ou non positive.",
      };
    }
    if (normalizedType === "percentage" && numVal > 100) {
      return {
        valid: false,
        error: "Le pourcentage de réduction ne peut pas dépasser 100%.",
      };
    }

    // 3. Minimum order amount check (if specified)
    const rawMin = coupon.minOrderValue ?? coupon.minOrderAmount;
    if (rawMin !== undefined && rawMin !== null && rawMin !== "") {
      if (typeof rawMin !== "number" && typeof rawMin !== "string") {
        return { valid: false, error: "Montant minimum d'achat invalide." };
      }
      const numMin = Number(rawMin);
      if (isNaN(numMin) || !isFinite(numMin) || numMin < 0) {
        return { valid: false, error: "Montant minimum d'achat invalide." };
      }
    }

    // 4. Maximum discount cap check (if specified)
    const rawMaxDisc = coupon.maxDiscountAmount ?? coupon.maxDiscount;
    if (rawMaxDisc !== undefined && rawMaxDisc !== null && rawMaxDisc !== "") {
      if (typeof rawMaxDisc !== "number" && typeof rawMaxDisc !== "string") {
        return { valid: false, error: "Plafond de réduction invalide." };
      }
      const numMaxDisc = Number(rawMaxDisc);
      if (isNaN(numMaxDisc) || !isFinite(numMaxDisc) || numMaxDisc <= 0) {
        return { valid: false, error: "Plafond de réduction invalide." };
      }
    }

    // 5. Global usage limit check (if specified)
    const rawMaxUses = coupon.maxUses ?? coupon.usageLimit;
    if (rawMaxUses !== undefined && rawMaxUses !== null && rawMaxUses !== "") {
      if (typeof rawMaxUses !== "number" && typeof rawMaxUses !== "string") {
        return { valid: false, error: "Limite globale d'utilisation invalide." };
      }
      const numMaxUses = Number(rawMaxUses);
      if (
        isNaN(numMaxUses) ||
        !isFinite(numMaxUses) ||
        numMaxUses <= 0 ||
        !Number.isInteger(numMaxUses)
      ) {
        return { valid: false, error: "Limite globale d'utilisation invalide." };
      }
    }

    // 6. Per-user usage limit check (if specified)
    const rawUserLimit = coupon.maxUsesPerUser;
    if (rawUserLimit !== undefined && rawUserLimit !== null && rawUserLimit !== "") {
      if (typeof rawUserLimit !== "number" && typeof rawUserLimit !== "string") {
        return {
          valid: false,
          error: "Limite d'utilisation par utilisateur invalide.",
        };
      }
      const numUserLimit = Number(rawUserLimit);
      if (
        isNaN(numUserLimit) ||
        !isFinite(numUserLimit) ||
        numUserLimit <= 0 ||
        !Number.isInteger(numUserLimit)
      ) {
        return {
          valid: false,
          error: "Limite d'utilisation par utilisateur invalide.",
        };
      }
    }

    // 7. Usage count sanity check
    const rawUsed = coupon.usedCount ?? coupon.usageCount;
    if (rawUsed !== undefined && rawUsed !== null && rawUsed !== "") {
      const numUsed = Number(rawUsed);
      if (isNaN(numUsed) || !isFinite(numUsed) || numUsed < 0) {
        return { valid: false, error: "Compteur d'utilisation corrompu." };
      }
    }

    return { valid: true };
  }

  /**
   * Check if coupon is currently valid based on start date and expiry date
   */
  static isCouponTimeValid(
    coupon: Record<string, unknown>,
    now: Date = new Date()
  ): { valid: boolean; error?: string } {
    const rawStart = coupon.startAt || coupon.startsAt;
    const startDate = this.parseCouponDate(rawStart);
    if (startDate && startDate > now) {
      return { valid: false, error: "Ce code promo n'est pas encore actif." };
    }

    const rawExpiry = coupon.expiresAt || coupon.expiryDate;
    const expiryDate = this.parseCouponDate(rawExpiry);
    if (expiryDate && expiryDate <= now) {
      return { valid: false, error: "Ce code promo a expiré." };
    }

    return { valid: true };
  }

  /**
   * Check if coupon is active
   */
  static isCouponActive(coupon: Record<string, unknown>): boolean {
    return coupon.isActive !== false;
  }

  /**
   * Check global and per-user usage limits
   * Securely prevents guests from bypassing singleUsePerClient and maxUsesPerUser
   */
  static isCouponUsageAllowed(
    coupon: Record<string, unknown>,
    userId?: string,
    isGuest: boolean = false
  ): { valid: boolean; error?: string } {
    // 1. Global usage limit
    const currentUses = Number(coupon.usedCount ?? coupon.usageCount ?? 0);
    const rawMax = coupon.maxUses ?? coupon.usageLimit;
    const maxUsesLimit =
      rawMax !== undefined && rawMax !== null && rawMax !== ""
        ? Number(rawMax)
        : 0;
    if (maxUsesLimit > 0 && currentUses >= maxUsesLimit) {
      return {
        valid: false,
        error: "Ce code promo a atteint sa limite globale d'utilisation.",
      };
    }

    // 2. Per-user usage limit & single-use policy
    const singleUsePerClient = Boolean(coupon.singleUsePerClient);
    const rawPerUser = coupon.maxUsesPerUser;
    const maxUsesPerUser =
      rawPerUser !== undefined && rawPerUser !== null && rawPerUser !== ""
        ? Number(rawPerUser)
        : singleUsePerClient
        ? 1
        : 0;

    const requiresRegisteredUser = singleUsePerClient || maxUsesPerUser > 0;

    if (requiresRegisteredUser) {
      // Guest / unauthenticated check
      const isUnauthenticated =
        isGuest ||
        !userId ||
        userId.startsWith("guest_") ||
        userId.trim() === "";

      if (isUnauthenticated) {
        return {
          valid: false,
          error:
            "Veuillez vous connecter pour utiliser ce code promo (réservé aux utilisateurs enregistrés).",
        };
      }

      const usedByArray = Array.isArray(coupon.usedBy)
        ? (coupon.usedBy as string[])
        : [];
      const userUsagesMap =
        (coupon.userUsages as Record<string, number>) || {};

      const countInArray = usedByArray.filter((id) => id === userId).length;
      const countInMap = Number(userUsagesMap[userId] || 0);
      const userUsageCount = Math.max(countInArray, countInMap);

      if (singleUsePerClient && userUsageCount >= 1) {
        return {
          valid: false,
          error: "Vous avez déjà utilisé ce code promo.",
        };
      }

      if (maxUsesPerUser > 0 && userUsageCount >= maxUsesPerUser) {
        return {
          valid: false,
          error:
            "Vous avez atteint la limite d'utilisation autorisée pour ce code promo.",
        };
      }
    }

    return { valid: true };
  }

  /**
   * Filter cart items to those matching coupon scope (seller/category restrictions)
   */
  static filterEligibleItems(
    coupon: Record<string, unknown>,
    items: ProductItemForCoupon[]
  ): {
    eligibleItems: ProductItemForCoupon[];
    eligibleSubtotal: number;
    hasRestrictions: boolean;
  } {
    const limitedToSellers = Array.isArray(coupon.limitedToSellers)
      ? (coupon.limitedToSellers as string[]).filter(Boolean)
      : [];
    const couponSellerId =
      typeof coupon.sellerId === "string" && coupon.sellerId
        ? coupon.sellerId
        : null;

    const allowedSellers = new Set<string>(limitedToSellers);
    if (couponSellerId) {
      allowedSellers.add(couponSellerId);
    }

    const limitedToCategories = Array.isArray(coupon.limitedToCategories)
      ? (coupon.limitedToCategories as string[]).filter(Boolean)
      : [];

    const hasSellerRestriction = allowedSellers.size > 0;
    const hasCategoryRestriction = limitedToCategories.length > 0;
    const hasRestrictions = hasSellerRestriction || hasCategoryRestriction;

    const eligibleItems = items.filter((item) => {
      if (hasSellerRestriction && !allowedSellers.has(item.sellerId)) {
        return false;
      }
      if (hasCategoryRestriction) {
        const itemCategory = String(item.category ?? "").trim().toLowerCase();
        const itemCategoryId = String(item.categoryId ?? "").trim().toLowerCase();

        const matchesCategory = limitedToCategories.some((value) => {
          const target = String(value).trim().toLowerCase();
          if (!target) return false;
          return (
            (itemCategory !== "" && target === itemCategory) ||
            (itemCategoryId !== "" && target === itemCategoryId)
          );
        });

        if (!matchesCategory) {
          return false;
        }
      }
      return true;
    });

    const eligibleSubtotal = eligibleItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      eligibleItems,
      eligibleSubtotal,
      hasRestrictions,
    };
  }

  /**
   * Calculate precise, server-recomputed discount amount
   */
  static calculateDiscountAmount(
    coupon: Record<string, unknown>,
    eligibleSubtotal: number
  ): { discountAmount: number; error?: string } {
    const integrity = this.validateCouponIntegrity(coupon);
    if (!integrity.valid) {
      return { discountAmount: 0, error: integrity.error };
    }

    if (eligibleSubtotal <= 0) {
      return { discountAmount: 0, error: "Le montant éligible est nul." };
    }

    const minOrder = Number(coupon.minOrderValue ?? coupon.minOrderAmount ?? 0);
    if (eligibleSubtotal < minOrder) {
      return {
        discountAmount: 0,
        error: `Un minimum d'achat éligible de ${minOrder} DA est requis pour ce code promo.`,
      };
    }

    const discountType = this.normalizeDiscountType(coupon.discountType)!;
    const rawVal = coupon.discountValue ?? coupon.percent ?? coupon.percentage ?? 0;
    const discountValue = Number(rawVal);

    let discount = 0;
    if (discountType === "percentage") {
      const percentage = Math.min(100, discountValue);
      discount = (eligibleSubtotal * percentage) / 100;
    } else {
      discount = Math.min(discountValue, eligibleSubtotal);
    }

    const maxDiscountRaw = coupon.maxDiscountAmount ?? coupon.maxDiscount;
    if (
      maxDiscountRaw !== undefined &&
      maxDiscountRaw !== null &&
      maxDiscountRaw !== "" &&
      !isNaN(Number(maxDiscountRaw)) &&
      Number(maxDiscountRaw) > 0 &&
      isFinite(Number(maxDiscountRaw))
    ) {
      discount = Math.min(discount, Number(maxDiscountRaw));
    }

    discount = Math.max(0, Math.min(discount, eligibleSubtotal));
    if (isNaN(discount) || !isFinite(discount)) {
      return { discountAmount: 0, error: "Calcul de remise invalide." };
    }

    return { discountAmount: Math.round(discount * 100) / 100 };
  }

  /**
   * Resolve a single active coupon safely from matching documents
   * Detects and refuses ambiguous duplicates
   */
  static resolveActiveCouponFromDocs<T extends CouponDocumentLike>(
    docs: T[]
  ): { couponDoc: T | null; error?: string } {
    if (!docs || docs.length === 0) {
      return { couponDoc: null, error: "Code promo ou coupon invalide." };
    }

    const activeDocs = docs.filter((doc) => {
      const data = doc.data();
      return this.isCouponActive(data);
    });

    if (activeDocs.length > 1) {
      return {
        couponDoc: null,
        error:
          "Conflit de code promo : plusieurs coupons actifs ont été détectés avec le même code.",
      };
    }

    if (activeDocs.length === 0) {
      return {
        couponDoc: null,
        error: "Ce code promo n'est plus actif.",
      };
    }

    return { couponDoc: activeDocs[0] };
  }

  /**
   * Unified, comprehensive coupon validator shared across checkout and validation endpoints
   */
  static validateCoupon(params: CouponValidationParams): CouponValidationResult {
    const { couponDocId, couponData, subtotal, userId, isGuest, items } = params;

    // 1. Check integrity (types and numeric sanity)
    const integrity = this.validateCouponIntegrity(couponData);
    if (!integrity.valid) {
      return { valid: false, error: integrity.error };
    }

    // 2. Check if active
    if (!this.isCouponActive(couponData)) {
      return { valid: false, error: "Ce code promo n'est plus actif." };
    }

    // 3. Check time validity (start date & expiration)
    const timeCheck = this.isCouponTimeValid(couponData);
    if (!timeCheck.valid) {
      return { valid: false, error: timeCheck.error };
    }

    // 4. Check global & per-user usage limits (including guest enforcement)
    const usageCheck = this.isCouponUsageAllowed(couponData, userId, isGuest);
    if (!usageCheck.valid) {
      return { valid: false, error: usageCheck.error };
    }

    let effectiveSubtotal = subtotal;
    let eligibleSubtotal = subtotal;

    // 5. If items provided, filter eligible items for seller/category restrictions
    if (items && items.length > 0) {
      const filterResult = this.filterEligibleItems(couponData, items);
      if (filterResult.hasRestrictions && filterResult.eligibleItems.length === 0) {
        return {
          valid: false,
          error: "Aucun article de votre panier n'est éligible à ce code promo.",
        };
      }
      eligibleSubtotal = filterResult.eligibleSubtotal;
      effectiveSubtotal = eligibleSubtotal;
    }

    // 6. If subtotal / eligibleSubtotal is provided, check minimum order & calculate discount
    let discountAmount = 0;
    if (
      effectiveSubtotal !== undefined &&
      typeof effectiveSubtotal === "number" &&
      !isNaN(effectiveSubtotal)
    ) {
      const minReq = Number(couponData.minOrderValue ?? couponData.minOrderAmount ?? 0);
      if (effectiveSubtotal < minReq) {
        return {
          valid: false,
          error: `Un minimum d'achat éligible de ${minReq} DA est requis pour ce code promo.`,
        };
      }
      const calcResult = this.calculateDiscountAmount(couponData, effectiveSubtotal);
      if (calcResult.error) {
        return { valid: false, error: calcResult.error };
      }
      discountAmount = calcResult.discountAmount;
    }

    // 7. Format sanitized public DTO
    const safeCoupon = this.formatPublicCouponDTO(couponData, couponDocId);

    return {
      valid: true,
      coupon: safeCoupon,
      discountAmount,
      eligibleSubtotal,
    };
  }

  /**
   * Format a safe, sanitized public DTO for client consumption (prevents leaking usedBy/userUsages/audit data)
   */
  static formatPublicCouponDTO(
    coupon: Record<string, unknown>,
    docId?: string
  ): PublicCouponDTO {
    const rawStart = coupon.startAt || coupon.startsAt;
    const startDate = this.parseCouponDate(rawStart);

    const rawExpiry = coupon.expiresAt || coupon.expiryDate;
    const expiryDate = this.parseCouponDate(rawExpiry);

    const minVal = Number(coupon.minOrderValue ?? coupon.minOrderAmount ?? 0);
    const maxDisc = coupon.maxDiscountAmount ?? coupon.maxDiscount;
    const discVal = Number(
      coupon.discountValue ?? coupon.percent ?? coupon.percentage ?? 0
    );
    const maxUsesVal = coupon.usageLimit ?? coupon.maxUses ?? null;
    const normalizedType = this.normalizeDiscountType(coupon.discountType) || "percentage";

    return {
      id: String(docId || coupon.id || ""),
      code: String(coupon.code || "").toUpperCase().trim(),
      discountType: normalizedType,
      discountValue: discVal,
      minOrderValue: minVal,
      minOrderAmount: minVal,
      maxDiscountAmount:
        maxDisc !== undefined &&
        maxDisc !== null &&
        maxDisc !== "" &&
        !isNaN(Number(maxDisc))
          ? Number(maxDisc)
          : null,
      maxUses:
        maxUsesVal !== undefined &&
        maxUsesVal !== null &&
        maxUsesVal !== "" &&
        !isNaN(Number(maxUsesVal))
          ? Number(maxUsesVal)
          : null,
      expiresAt: expiryDate ? expiryDate.toISOString() : null,
      startsAt: startDate ? startDate.toISOString() : null,
      startAt: startDate ? startDate.toISOString() : null,
      limitedToCategories: Array.isArray(coupon.limitedToCategories)
        ? (coupon.limitedToCategories as string[])
        : [],
      limitedToSellers: Array.isArray(coupon.limitedToSellers)
        ? (coupon.limitedToSellers as string[])
        : [],
      singleUsePerClient: Boolean(coupon.singleUsePerClient),
      isActive: coupon.isActive !== false,
    };
  }

  /**
   * Reconstruct cart items and subtotal from server Firestore data,
   * discarding any client-falsified prices, sellerIds, categories, or subtotals.
   * Strictly rejects cart if products are missing, quantities are invalid, or variants are invalid.
   */
  static async reconstructVerifiedCartFromFirestore(
    rawItems: unknown,
    firestoreDb: {
      collection: (name: string) => {
        doc: (id: string) => {
          get: () => Promise<{
            exists: boolean;
            id: string;
            data: () => Record<string, unknown> | undefined;
          }>;
        };
      };
    }
  ): Promise<ReconstructedCartResult> {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return {
        valid: false,
        error: "Panier requis pour valider ce code promo.",
        verifiedItems: [],
        serverSubtotal: 0,
      };
    }

    const requestedProductIds: string[] = [];

    for (const rawItem of rawItems) {
      if (typeof rawItem !== "object" || rawItem === null) {
        return {
          valid: false,
          error: "Élément du panier invalide.",
          verifiedItems: [],
          serverSubtotal: 0,
        };
      }

      const itemObj = rawItem as Record<string, unknown>;
      const pId = String(itemObj.productId || itemObj.id || "").trim();
      if (!pId) {
        return {
          valid: false,
          error: "Identifiant de produit manquant dans le panier.",
          verifiedItems: [],
          serverSubtotal: 0,
        };
      }

      // Quantity validation: must be a finite integer > 0 and <= 1000
      const rawQty = itemObj.quantity;
      if (
        typeof rawQty !== "number" ||
        !Number.isFinite(rawQty) ||
        !Number.isInteger(rawQty) ||
        rawQty <= 0 ||
        rawQty > 1000
      ) {
        return {
          valid: false,
          error: `Quantité invalide (${String(rawQty)}) pour le produit ${pId}.`,
          verifiedItems: [],
          serverSubtotal: 0,
        };
      }

      // Variant type validation: must be string if provided
      const rawSelectedVariant = itemObj.selectedVariant;
      if (
        rawSelectedVariant !== undefined &&
        typeof rawSelectedVariant !== "string"
      ) {
        return {
          valid: false,
          error: `Variante invalide.`,
          verifiedItems: [],
          serverSubtotal: 0,
        };
      }

      requestedProductIds.push(pId);
    }

    const uniqueProductIds = Array.from(new Set(requestedProductIds));

    const productSnaps = await Promise.all(
      uniqueProductIds.map((pId) => firestoreDb.collection("products").doc(pId).get())
    );

    const productMap = new Map<string, Record<string, unknown>>();
    for (let i = 0; i < uniqueProductIds.length; i++) {
      const pId = uniqueProductIds[i];
      const snap = productSnaps[i];
      if (!snap || !snap.exists) {
        return {
          valid: false,
          error: `Produit introuvable : ${pId}`,
          verifiedItems: [],
          serverSubtotal: 0,
        };
      }
      const data = snap.data();
      if (!data || typeof data !== "object") {
        return {
          valid: false,
          error: `Données produit invalides pour le produit ${pId}`,
          verifiedItems: [],
          serverSubtotal: 0,
        };
      }
      productMap.set(pId, data);
    }

    const verifiedItems: ProductItemForCoupon[] = [];
    let serverSubtotal = 0;

    for (const rawItem of rawItems) {
      const itemObj = rawItem as Record<string, unknown>;
      const pId = String(itemObj.productId || itemObj.id || "").trim();
      const quantity = itemObj.quantity as number;

      const pData = productMap.get(pId);
      if (!pData) {
        return {
          valid: false,
          error: `Produit introuvable : ${pId}`,
          verifiedItems: [],
          serverSubtotal: 0,
        };
      }

      let unitPrice: number;
      try {
        unitPrice = resolveProductPrice(pData, itemObj.selectedVariant);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : `Prix invalide pour le produit ${pId}`;
        return {
          valid: false,
          error: errorMsg,
          verifiedItems: [],
          serverSubtotal: 0,
        };
      }

      const sellerId = typeof pData.sellerId === "string" ? pData.sellerId.trim() : "";
      if (!sellerId) {
        return {
          valid: false,
          error: `sellerId invalide pour le produit ${pId}`,
          verifiedItems: [],
          serverSubtotal: 0,
        };
      }
      const category = typeof pData.category === "string" ? pData.category : "";
      const categoryId = typeof pData.categoryId === "string" ? pData.categoryId : category;

      const variantStr = typeof itemObj.selectedVariant === "string" ? itemObj.selectedVariant : undefined;

      verifiedItems.push({
        productId: pId,
        sellerId,
        category,
        categoryId,
        price: unitPrice,
        quantity,
        selectedVariant: variantStr || undefined,
      });

      serverSubtotal += unitPrice * quantity;
    }

    if (!Number.isFinite(serverSubtotal) || serverSubtotal < 0) {
      return {
        valid: false,
        error: "Sous-total serveur invalide.",
        verifiedItems: [],
        serverSubtotal: 0,
      };
    }

    return {
      valid: true,
      verifiedItems,
      serverSubtotal,
    };
  }
}
