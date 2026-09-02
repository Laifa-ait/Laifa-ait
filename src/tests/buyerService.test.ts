import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mockCollection,
  mockGet,
  mockSet,
  mockDelete,
  resetFirebaseMocks,
} from "./firebaseMockHelper";

vi.mock("../config/firebase-admin", () => {
  return {
    db: {
      collection: mockCollection,
    },
  };
});

import { BuyerService } from "../domains/buyer/services/buyer.service";

describe("BuyerService", () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  it("should retrieve returns successfully", async () => {
    mockGet.mockResolvedValueOnce({
      docs: [
        { id: "ord-1", data: () => ({ userId: "user-1", returnRequest: { reason: "Damaged" } }) },
      ],
    });

    const results = await BuyerService.getReturns("user-1");
    expect(mockCollection).toHaveBeenCalledWith("orders");
    expect(results).toEqual([
      { id: "ord-1", userId: "user-1", returnRequest: { reason: "Damaged" } },
    ]);
  });

  it("should retrieve orders without pagination successfully", async () => {
    mockGet.mockResolvedValueOnce({
      docs: [
        { id: "ord-1", data: () => ({ userId: "user-1", amount: 4500 }) },
      ],
    });

    const { orders, lastVisible } = await BuyerService.getOrders("user-1");
    expect(orders).toEqual([
      { id: "ord-1", userId: "user-1", amount: 4500 },
    ]);
    expect(lastVisible).toBe("ord-1");
  });

  it("should retrieve orders with pagination startAfter", async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
    });
    mockGet.mockResolvedValueOnce({
      docs: [],
    });

    const { orders, lastVisible } = await BuyerService.getOrders("user-1", "ord-prev", 10);
    expect(orders).toEqual([]);
    expect(lastVisible).toBeNull();
  });

  it("should retrieve followed stores", async () => {
    mockGet.mockResolvedValueOnce({
      docs: [
        { id: "seller-1", data: () => ({ name: "Artisanal Shop" }) },
      ],
    });

    const result = await BuyerService.getFollowedStores("user-1");
    expect(result).toEqual([
      { id: "seller-1", name: "Artisanal Shop" },
    ]);
  });

  it("should follow a store", async () => {
    mockSet.mockResolvedValueOnce(undefined);
    await BuyerService.followStore("user-1", "seller-1", { notified: true });
    expect(mockSet).toHaveBeenCalledWith({ notified: true });
  });

  it("should unfollow a store", async () => {
    mockDelete.mockResolvedValueOnce(undefined);
    await BuyerService.unfollowStore("user-1", "seller-1");
    expect(mockDelete).toHaveBeenCalled();
  });
});
