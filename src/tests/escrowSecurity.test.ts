import { describe, it, expect, vi, beforeEach } from "vitest";
import { EscrowService } from "../domains/payment/services/EscrowService";

interface MockDocRecord {
  [key: string]: unknown;
}

const escrowStore = new Map<string, MockDocRecord>();
const orderStore = new Map<string, MockDocRecord>();
const walletStore = new Map<string, MockDocRecord>();
const txStore = new Map<string, MockDocRecord>();

vi.mock("../config/firebase-admin", () => {
  const mockDb = {
    collection: (colName: string) => ({
      doc: (docId?: string) => {
        const id = docId || `generated-${Math.random().toString(36).substring(2, 9)}`;
        return {
          id,
          get: vi.fn(async () => {
            let data: MockDocRecord | undefined;
            if (colName === "escrow_accounts") data = escrowStore.get(id);
            else if (colName === "orders") data = orderStore.get(id);
            else if (colName === "seller_wallets") data = walletStore.get(id);
            else if (colName === "seller_wallet_transactions") data = txStore.get(id);
            return {
              exists: !!data,
              data: () => data,
            };
          }),
          set: vi.fn(async (data: MockDocRecord) => {
            if (colName === "escrow_accounts") escrowStore.set(id, data);
            else if (colName === "orders") orderStore.set(id, data);
            else if (colName === "seller_wallets") walletStore.set(id, data);
            else if (colName === "seller_wallet_transactions") txStore.set(id, data);
          }),
          update: vi.fn(async (data: Partial<MockDocRecord>) => {
            let existing: MockDocRecord | undefined;
            if (colName === "escrow_accounts") existing = escrowStore.get(id);
            else if (colName === "orders") existing = orderStore.get(id);
            else if (colName === "seller_wallets") existing = walletStore.get(id);
            const updated = { ...(existing || {}), ...data };
            if (colName === "escrow_accounts") escrowStore.set(id, updated);
            else if (colName === "orders") orderStore.set(id, updated);
            else if (colName === "seller_wallets") walletStore.set(id, updated);
          }),
        };
      },
    }),
    runTransaction: vi.fn(async <T>(updateFunction: (transaction: {
      get: (ref: { get: () => Promise<unknown> }) => Promise<unknown>;
      set: (ref: { set: (d: MockDocRecord) => Promise<void> }, d: MockDocRecord) => Promise<void>;
      update: (ref: { update: (d: Partial<MockDocRecord>) => Promise<void> }, d: Partial<MockDocRecord>) => Promise<void>;
    }) => Promise<T>) => {
      const mockTransaction = {
        get: vi.fn(async (ref: { get: () => Promise<unknown> }) => ref.get()),
        set: vi.fn(async (ref: { set: (d: MockDocRecord) => Promise<void> }, data: MockDocRecord) => ref.set(data)),
        update: vi.fn(async (ref: { update: (d: Partial<MockDocRecord>) => Promise<void> }, data: Partial<MockDocRecord>) => ref.update(data)),
      };
      return updateFunction(mockTransaction);
    }),
  };

  return {
    db: mockDb,
    admin: { apps: [1] },
    isFirebaseReady: () => true,
    getFirebaseInitState: () => "READY",
    getFirebaseInitError: () => null,
    FirebaseInitState: { READY: "READY", FAILED: "FAILED" },
  };
});

describe("EscrowService Security & Reconciliation", () => {
  beforeEach(() => {
    escrowStore.clear();
    orderStore.clear();
    walletStore.clear();
    txStore.clear();
  });

  it("holdEscrow rejects non-existent orders", async () => {
    await expect(
      EscrowService.holdEscrow({
        orderId: "ord_non_existent",
        callerUid: "buyer_123",
      })
    ).rejects.toThrow("ORDER_NOT_FOUND");
  });

  it("holdEscrow rejects callers who are not the buyer or admin", async () => {
    orderStore.set("ord_legit_1", {
      id: "ord_legit_1",
      userId: "legit_buyer_1",
      sellerIds: ["seller_abc"],
      total: 15000,
      paymentStatus: "PAID",
      status: "CONFIRMED",
    });

    await expect(
      EscrowService.holdEscrow({
        orderId: "ord_legit_1",
        callerUid: "malicious_caller_2",
      })
    ).rejects.toThrow("FORBIDDEN_ORDER_ACCESS");
  });

  it("holdEscrow successfully derives amount and seller from server-side order", async () => {
    orderStore.set("ord_legit_2", {
      id: "ord_legit_2",
      userId: "buyer_valid",
      sellerIds: ["seller_trusted"],
      total: 20000,
      paymentStatus: "PAID",
      status: "CONFIRMED",
      paymentMethod: "CIB_EDAHABIA",
    });

    const escrow = await EscrowService.holdEscrow({
      orderId: "ord_legit_2",
      callerUid: "buyer_valid",
    });

    expect(escrow.totalAmountDZD).toBe(20000);
    expect(escrow.sellerId).toBe("seller_trusted");
    expect(escrow.platformFeeDZD).toBe(1000); // 5%
    expect(escrow.sellerPayoutAmountDZD).toBe(19000);
    expect(escrow.status).toBe("HELD");

    const wallet = walletStore.get("seller_trusted");
    expect(wallet?.pendingEscrowBalanceDZD).toBe(19000);
  });

  it("releaseEscrow rejects release when order is not yet delivered", async () => {
    orderStore.set("ord_in_transit", {
      id: "ord_in_transit",
      userId: "buyer_valid",
      sellerIds: ["seller_trusted"],
      total: 10000,
      paymentStatus: "PAID",
      status: "PROCESSING", // Not delivered yet
    });

    escrowStore.set("ord_in_transit", {
      id: "ord_in_transit",
      orderId: "ord_in_transit",
      buyerId: "buyer_valid",
      sellerId: "seller_trusted",
      totalAmountDZD: 10000,
      platformFeeRatePercent: 5,
      platformFeeDZD: 500,
      sellerPayoutAmountDZD: 9500,
      status: "HELD",
      paymentMethod: "CIB_EDAHABIA",
      heldAt: new Date().toISOString(),
    });

    await expect(
      EscrowService.releaseEscrow("ord_in_transit", "buyer_valid")
    ).rejects.toThrow("ORDER_NOT_DELIVERED");
  });

  it("releaseEscrow allows release when order is confirmed delivered", async () => {
    orderStore.set("ord_delivered", {
      id: "ord_delivered",
      userId: "buyer_valid",
      sellerIds: ["seller_trusted"],
      total: 10000,
      paymentStatus: "PAID",
      status: "DELIVERED",
    });

    escrowStore.set("ord_delivered", {
      id: "ord_delivered",
      orderId: "ord_delivered",
      buyerId: "buyer_valid",
      sellerId: "seller_trusted",
      totalAmountDZD: 10000,
      platformFeeRatePercent: 5,
      platformFeeDZD: 500,
      sellerPayoutAmountDZD: 9500,
      status: "HELD",
      paymentMethod: "CIB_EDAHABIA",
      heldAt: new Date().toISOString(),
    });

    walletStore.set("seller_trusted", {
      sellerId: "seller_trusted",
      availableBalanceDZD: 0,
      pendingEscrowBalanceDZD: 9500,
      totalEarningsDZD: 0,
      totalWithdrawnDZD: 0,
      currency: "DZD",
      updatedAt: new Date().toISOString(),
    });

    const released = await EscrowService.releaseEscrow("ord_delivered", "buyer_valid");
    expect(released.status).toBe("RELEASED");

    const updatedWallet = walletStore.get("seller_trusted");
    expect(updatedWallet?.availableBalanceDZD).toBe(9500);
    expect(updatedWallet?.pendingEscrowBalanceDZD).toBe(0);
    expect(updatedWallet?.totalEarningsDZD).toBe(9500);
  });
});
