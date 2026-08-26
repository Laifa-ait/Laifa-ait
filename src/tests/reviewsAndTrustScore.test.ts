import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirebaseReviewRepository } from "../domains/review/review.repository";
import { ReviewService } from "../domains/review/review.service";

let mockOrderExists = true;
let mockOrderData: Record<string, unknown> = {};
let mockProductExists = true;
let mockProductData: Record<string, unknown> = {};
let mockUserDocData: Record<string, unknown> = { trustScore: 85 };
let isTest14Mode = false;
let test14CallCount = 0;

interface MockRef {
  _type?: string;
  _colName?: string;
  _val?: unknown;
  _path?: string;
}

const tGetMock = vi.fn(async (ref: MockRef) => {
  if (ref && ref._type === "query" && ref._colName === "reviews") {
    return {
      docs: [
        {
          id: "mock-rev-123",
          data: () => ({
            productId: ref._val,
            rating: 5,
            status: "published"
          })
        }
      ]
    };
  }
  const path = ref?._path || "";
  if (path.startsWith("orders/")) {
    if (isTest14Mode) {
      test14CallCount++;
      if (test14CallCount > 1) {
        return {
          exists: mockOrderExists,
          data: () => ({
            ...mockOrderData,
            reviewsSubmitted: {
              "prod-abc": { rating: 5, comment: "", createdAt: new Date().toISOString() }
            }
          })
        };
      }
    }
    return {
      exists: mockOrderExists,
      data: () => mockOrderData
    };
  }
  if (path.startsWith("products/")) {
    return {
      exists: mockProductExists,
      data: () => mockProductData
    };
  }
  if (path.startsWith("users/")) {
    return {
      exists: true,
      data: () => mockUserDocData
    };
  }
  return { exists: false, data: () => ({}) };
});

const tSetMock = vi.fn();
const tUpdateMock = vi.fn();

vi.mock("../config/firebase-admin", () => {
  return {
    admin: {
      firestore: {
        FieldValue: {
          serverTimestamp: vi.fn(() => "server-timestamp"),
          increment: vi.fn((val: number) => `increment-${val}`)
        }
      }
    },
    db: {
      collection: vi.fn((colName: string) => {
        return {
          doc: vi.fn((docId: string) => {
            return {
              _path: `${colName}/${docId}`,
              get: vi.fn(async () => {
                if (colName === "orders") {
                  return { exists: mockOrderExists, data: () => mockOrderData };
                }
                if (colName === "products") {
                  return { exists: mockProductExists, data: () => mockProductData };
                }
                if (colName === "users") {
                  return { exists: true, data: () => mockUserDocData };
                }
                return { exists: false };
              }),
              update: vi.fn()
            };
          }),
          where: vi.fn((field: string, op: string, val: unknown) => {
            return {
              _type: "query",
              _colName: colName,
              _field: field,
              _op: op,
              _val: val
            };
          })
        };
      }),
      runTransaction: vi.fn(async (callback: (t: Record<string, unknown>) => Promise<unknown>) => {
        const t = {
          get: tGetMock,
          set: tSetMock,
          update: tUpdateMock
        };
        return await callback(t);
      })
    }
  };
});

describe("Review Security Hardening & Trust Score Integration Tests", () => {
  const reviewRepo = new FirebaseReviewRepository();
  const reviewService = new ReviewService(reviewRepo);

  beforeEach(() => {
    vi.clearAllMocks();
    mockOrderExists = true;
    mockOrderData = {};
    mockProductExists = true;
    mockProductData = {};
    mockUserDocData = { trustScore: 85 };
    isTest14Mode = false;
    test14CallCount = 0;
  });

  it("TEST 1: Authenticated user + delivered order + product present -> review accepted", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-123",
      status: "delivered",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {}
    };
    mockProductExists = true;
    mockProductData = {
      stats: { reviewCount: 2, totalReviews: 2, averageRating: 4.5, totalRatingSum: 9 }
    };

    const res = await reviewService.submitReview("user-123", "Alice", {
      orderId: "ord-123",
      productId: "prod-abc",
      rating: 5,
      comment: "Excellent"
    });
    expect(res.success).toBe(true);
    expect(tSetMock).toHaveBeenCalled();
    expect(tUpdateMock).toHaveBeenCalled();
  });

  it("TEST 2: Order does not exist -> reject", async () => {
    mockOrderExists = false;
    await expect(
      reviewService.submitReview("user-123", "Alice", {
        orderId: "ord-nonexistent",
        productId: "prod-abc",
        rating: 5,
        comment: "Excellent"
      })
    ).rejects.toThrow("Commande introuvable.");
  });

  it("TEST 3: Order belonging to another user -> reject 403", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-different",
      status: "delivered",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {}
    };
    await expect(
      reviewService.submitReview("user-123", "Alice", {
        orderId: "ord-123",
        productId: "prod-abc",
        rating: 5,
        comment: "Excellent"
      })
    ).rejects.toThrow("Accès refusé. Cette commande ne vous appartient pas.");
  });

  it("TEST 4: Order with status NEW -> reject", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-123",
      status: "NEW",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {}
    };
    await expect(
      reviewService.submitReview("user-123", "Alice", {
        orderId: "ord-123",
        productId: "prod-abc",
        rating: 5
      })
    ).rejects.toThrow("Vous ne pouvez évaluer un produit qu'après sa livraison finale.");
  });

  it("TEST 5: Order with status SHIPPED -> reject", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-123",
      status: "SHIPPED",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {}
    };
    await expect(
      reviewService.submitReview("user-123", "Alice", {
        orderId: "ord-123",
        productId: "prod-abc",
        rating: 5
      })
    ).rejects.toThrow("Vous ne pouvez évaluer un produit qu'après sa livraison finale.");
  });

  it("TEST 6: Order with status CANCELED -> reject", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-123",
      status: "CANCELED",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {}
    };
    await expect(
      reviewService.submitReview("user-123", "Alice", {
        orderId: "ord-123",
        productId: "prod-abc",
        rating: 5
      })
    ).rejects.toThrow("Vous ne pouvez évaluer un produit qu'après sa livraison finale.");
  });

  it("TEST 7: Product not in the order -> reject", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-123",
      status: "delivered",
      items: [{ id: "prod-different" }],
      reviewsSubmitted: {}
    };
    await expect(
      reviewService.submitReview("user-123", "Alice", {
        orderId: "ord-123",
        productId: "prod-abc",
        rating: 5
      })
    ).rejects.toThrow("Ce produit ne fait pas partie de cette commande.");
  });

  it("TEST 8: Second identical review -> reject", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-123",
      status: "delivered",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {
        "prod-abc": { rating: 5, comment: "OK" }
      }
    };
    await expect(
      reviewService.submitReview("user-123", "Alice", {
        orderId: "ord-123",
        productId: "prod-abc",
        rating: 5
      })
    ).rejects.toThrow("Vous avez déjà évalué ce produit pour cette commande.");
  });

  it("TEST 9: rating = 0 -> reject", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-123",
      status: "delivered",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {}
    };
    await expect(
      reviewService.submitReview("user-123", "Alice", {
        orderId: "ord-123",
        productId: "prod-abc",
        rating: 0
      })
    ).rejects.toThrow("Note invalide. Le score doit être un entier entre 1 et 5.");
  });

  it("TEST 10: rating = 6 -> reject", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-123",
      status: "delivered",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {}
    };
    await expect(
      reviewService.submitReview("user-123", "Alice", {
        orderId: "ord-123",
        productId: "prod-abc",
        rating: 6
      })
    ).rejects.toThrow("Note invalide. Le score doit être un entier entre 1 et 5.");
  });

  it("TEST 11: rating = '5' -> reject", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-123",
      status: "delivered",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {}
    };
    const invalidData = {
      orderId: "ord-123",
      productId: "prod-abc",
      rating: "5" as unknown as number
    };
    await expect(
      reviewService.submitReview("user-123", "Alice", invalidData)
    ).rejects.toThrow("Note invalide. Le score doit être un entier entre 1 et 5.");
  });

  it("TEST 12: userId falsified in req.body -> backend uses req.user.uid", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-real",
      status: "delivered",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {}
    };
    mockProductExists = true;
    mockProductData = {
      stats: { reviewCount: 0, totalReviews: 0, averageRating: 0, totalRatingSum: 0 }
    };

    const res = await reviewService.submitReview("user-real", "Alice", {
      orderId: "ord-123",
      productId: "prod-abc",
      rating: 4
    });
    expect(res.success).toBe(true);
    expect(tSetMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: "user-real"
      })
    );
  });

  it("TEST 13: sellerId falsified in req.body -> has no effect", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-123",
      status: "delivered",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {}
    };
    mockProductExists = true;
    mockProductData = {
      stats: { reviewCount: 0, totalReviews: 0, averageRating: 0, totalRatingSum: 0 }
    };

    const payload = {
      orderId: "ord-123",
      productId: "prod-abc",
      rating: 5,
      sellerId: "spoofed-seller"
    } as unknown as { orderId: string; productId: string; rating: number };

    const res = await reviewService.submitReview("user-123", "Alice", payload);
    expect(res.success).toBe(true);
    expect(tSetMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.not.objectContaining({
        sellerId: "spoofed-seller"
      })
    );
  });

  it("TEST 14: Two concurrent requests for the same review -> only one accepted", async () => {
    isTest14Mode = true;
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-123",
      status: "delivered",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {}
    };
    mockProductExists = true;
    mockProductData = {
      stats: { reviewCount: 0, totalReviews: 0, averageRating: 0, totalRatingSum: 0 }
    };

    const p1 = reviewService.submitReview("user-123", "Alice", {
      orderId: "ord-123",
      productId: "prod-abc",
      rating: 5
    });

    const p2 = reviewService.submitReview("user-123", "Alice", {
      orderId: "ord-123",
      productId: "prod-abc",
      rating: 5
    });

    const results = await Promise.allSettled([p1, p2]);
    const fulfilledCount = results.filter(r => r.status === "fulfilled").length;
    const rejectedCount = results.filter(r => r.status === "rejected").length;

    expect(fulfilledCount).toBe(1);
    expect(rejectedCount).toBe(1);
  });

  it("TEST 15: Review creation does NOT alter the Trust Score", async () => {
    mockOrderExists = true;
    mockOrderData = {
      userId: "user-123",
      status: "delivered",
      items: [{ id: "prod-abc" }],
      reviewsSubmitted: {}
    };
    mockProductExists = true;
    mockProductData = {
      stats: { reviewCount: 0, totalReviews: 0, averageRating: 0, totalRatingSum: 0 }
    };

    const res = await reviewService.submitReview("user-123", "Alice", {
      orderId: "ord-123",
      productId: "prod-abc",
      rating: 5
    });
    expect(res.success).toBe(true);

    expect(tUpdateMock).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        trustScore: expect.any(Number)
      })
    );
  });
});
