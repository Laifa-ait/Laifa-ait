import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateOrderCommission, Order } from '../utils/orderCalculations';
import { BusinessError, OrderStatusService } from '../domains/order/services/orderStatus.service';

const { mockCollection, mockRunTransaction, mockAdmin, mockDoc, mockGet } = vi.hoisted(() => {
  const mCollection = vi.fn();
  const mRunTransaction = vi.fn();
  const mDoc = vi.fn();
  const mGet = vi.fn();
  const mAdmin = {
    firestore: {
      FieldValue: {
        serverTimestamp: vi.fn(() => "mock-timestamp"),
        increment: vi.fn((val) => ({ val, type: "increment" })),
      },
    },
  };
  return {
    mockCollection: mCollection,
    mockRunTransaction: mRunTransaction,
    mockAdmin: mAdmin,
    mockDoc: mDoc,
    mockGet: mGet,
  };
});

vi.mock("../config/firebase-admin", () => {
  return {
    db: {
      collection: mockCollection,
      runTransaction: mockRunTransaction,
    },
    admin: mockAdmin,
  };
});

describe('Production Order Calculations & Transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCollection.mockImplementation(() => ({
      doc: mockDoc,
    }));
    mockDoc.mockImplementation(() => ({
      get: mockGet,
      collection: vi.fn(() => ({
        doc: vi.fn(() => "mock-doc"),
      })),
    }));
  });

  describe('Commission Calculations (utils/orderCalculations)', () => {
    it('calculates commission and payout accurately with items', () => {
      const mockOrder: Order = {
        total: 1000,
        items: [
          { sellerId: 'seller-a', price: 100, quantity: 2 }, // total = 200
          { sellerId: 'seller-b', price: 400, quantity: 2 }  // total = 800
        ]
      };

      const sellerRates = {
        'seller-a': 10, // 10% on 200 = 20
        'seller-b': 15  // 15% on 800 = 120
      };

      const globalRate = 12; // fallback

      const result = calculateOrderCommission(mockOrder, sellerRates, globalRate);
      
      expect(result.orderCommission).toBe(140);
      expect(result.netPayout).toBe(860);
    });

    it('calculates commission based on subtotal fallback when items are empty', () => {
      const mockOrder: Order = {
        total: 5000,
        subtotal: 5000,
        sellerId: 'seller-c'
      };

      const sellerRates = { 'seller-c': 8 };
      const globalRate = 10;

      const result = calculateOrderCommission(mockOrder, sellerRates, globalRate);
      expect(result.orderCommission).toBe(400);
      expect(result.netPayout).toBe(4600);
    });
  });

  describe('Order Status Transitions (domains/order/services)', () => {
    it('allows valid status transitions within the state machine', async () => {
      mockRunTransaction.mockImplementationOnce(async (callback) => {
        let callCount = 0;
        const mockTx = {
          get: vi.fn(async () => {
            callCount++;
            if (callCount === 1) {
              return { exists: true, data: () => ({ globalRate: 10 }) };
            } else {
              return {
                exists: true,
                data: () => ({
                  status: "new",
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

      // "new" to "processing" is valid
      await expect(
        OrderStatusService.updateOrderStatus({
          orderIds: ["order-1"],
          status: "processing",
          sellerId: "seller-1",
          isUserAdmin: true,
          authUid: "admin-1",
        })
      ).resolves.not.toThrow();
    });

    it('rejects invalid status transitions with BusinessError', async () => {
      mockRunTransaction.mockImplementationOnce(async (callback) => {
        let callCount = 0;
        const mockTx = {
          get: vi.fn(async () => {
            callCount++;
            if (callCount === 1) {
              return { exists: true, data: () => ({ globalRate: 10 }) };
            } else {
              return {
                exists: true,
                data: () => ({
                  status: "canceled", // Canceled state has no outgoing transitions
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

      // "canceled" to "processing" is invalid
      await expect(
        OrderStatusService.updateOrderStatus({
          orderIds: ["order-1"],
          status: "processing",
          sellerId: "seller-1",
          isUserAdmin: true,
          authUid: "admin-1",
        })
      ).rejects.toThrow(BusinessError);
    });
  });
});
