import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mockCollection,
  mockRunTransaction,
  mockAdmin,
  resetFirebaseMocks,
} from "./firebaseMockHelper";

vi.mock("../config/firebase-admin", () => {
  return {
    db: {
      collection: mockCollection,
      runTransaction: mockRunTransaction,
    },
    admin: mockAdmin,
  };
});

import { BusinessError, OrderStatusService } from "../domains/order/services/orderStatus.service";

describe("OrderStatusService", () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  describe("BusinessError", () => {
    it("should instantiate correctly with status code and message", () => {
      const err = new BusinessError(400, "Bad Request");
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe("Bad Request");
    });
  });

  describe("OrderStatusUpdate flow using transactions", () => {
    it("should run the status update in a transaction block", async () => {
      mockRunTransaction.mockImplementationOnce(async (callback) => {
        let callCount = 0;
        const mockTx = {
          get: vi.fn(async () => {
            callCount++;
            if (callCount === 1) {
              return {
                exists: true,
                data: () => ({ globalRate: 10 }),
              };
            } else {
              return {
                exists: true,
                data: () => ({
                  status: "NEW",
                  sellerId: "seller-1",
                  sellerIds: ["seller-1"],
                }),
              };
            }
          }),
          update: vi.fn(),
          set: vi.fn(),
        };
        return callback(mockTx);
      });

      await expect(
        OrderStatusService.updateOrderStatus({
          orderIds: ["order-1"],
          status: "processing",
          sellerId: "seller-1",
          isUserAdmin: true,
          authUid: "admin-1",
        })
      ).resolves.not.toThrow();

      expect(mockRunTransaction).toHaveBeenCalled();
    });
  });
});
