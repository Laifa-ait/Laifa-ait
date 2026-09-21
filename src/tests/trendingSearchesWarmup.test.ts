import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mockCollection,
  mockWhere,
  mockOrderBy,
  mockLimit,
  mockGet,
  resetFirebaseMocks,
} from "./firebaseMockHelper";

vi.mock("../config/firebase-admin", () => ({
  db: {
    collection: mockCollection,
  },
}));

import { TrendingSearchesService } from "../services/TrendingSearchesService";

describe("TrendingSearchesService - Asynchronous Cache Warm-up & Trends Engine", () => {
  beforeEach(() => {
    resetFirebaseMocks();
    TrendingSearchesService.resetCacheForTesting();

    mockCollection.mockReturnValue({
      where: mockWhere.mockReturnValue({
        orderBy: mockOrderBy.mockReturnValue({
          limit: mockLimit.mockReturnValue({
            get: mockGet,
          }),
        }),
        limit: mockLimit.mockReturnValue({
          get: mockGet,
        }),
      }),
    });
  });

  it("should successfully execute warmupTrendingSearches and populate in-memory cache", async () => {
    mockGet.mockResolvedValueOnce({
      docs: [
        {
          data: () => ({
            name: "Galaxy S24 Ultra",
            category: "Smartphones",
            subcategory: "Accessoires",
            salesCount: 45,
            rating: 5,
          }),
        },
        {
          data: () => ({
            name: "Sneakers Air Max",
            category: "Chaussures",
            subcategory: "Baskets",
            salesCount: 30,
            rating: 4.8,
          }),
        },
      ],
    });

    await TrendingSearchesService.warmupTrendingSearches();

    // Secondary call should serve directly from RAM cache with 0 additional Firestore calls
    const cachedTrends = await TrendingSearchesService.getTrendingSearches();
    expect(cachedTrends).toBeDefined();
    expect(Array.isArray(cachedTrends)).toBe(true);
    expect(cachedTrends.length).toBeGreaterThanOrEqual(2);
    expect(cachedTrends).toContain("Smartphones");

    // Verify Firestore get was only invoked once during warmup
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it("should incorporate real-time purchases and search weights during calculation", async () => {
    mockGet.mockResolvedValueOnce({ docs: [] });

    TrendingSearchesService.recordSearch("cafetiere espresso");
    TrendingSearchesService.recordPurchase([
      {
        name: "Cafetiere Espresso Italienne",
        category: "Petit Électroménager",
        quantity: 3,
      },
    ]);

    await TrendingSearchesService.warmupTrendingSearches();

    const trends = await TrendingSearchesService.getTrendingSearches();
    expect(trends.length).toBeGreaterThan(0);
    expect(trends.some((t) => t.toLowerCase().includes("petit") || t.toLowerCase().includes("cafetiere"))).toBe(true);
  });

  it("should be resilient and non-fatal when Firestore encounters an error during boot warmup", async () => {
    mockGet.mockRejectedValueOnce(new Error("Firestore transient network unreachable"));

    // warmup should never throw or crash the process
    await expect(TrendingSearchesService.warmupTrendingSearches()).resolves.not.toThrow();

    // Trends should gracefully fallback to platform defaults
    const fallbackTrends = await TrendingSearchesService.getTrendingSearches();
    expect(fallbackTrends.length).toBe(8);
    expect(fallbackTrends).toContain("Smartphones Accessoires");
  });
});
