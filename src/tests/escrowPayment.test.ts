import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../app";

interface MockDocRecord {
  [key: string]: unknown;
}

// Mock Firebase Admin
vi.mock("../config/firebase-admin", () => {
  const escrowStore = new Map<string, MockDocRecord>();
  const walletStore = new Map<string, MockDocRecord>();
  const payoutStore = new Map<string, MockDocRecord>();
  const txStore = new Map<string, MockDocRecord>();

  const mockDb = {
    collection: (colName: string) => ({
      doc: (docId?: string) => {
        const id = docId || `generated-${Math.random().toString(36).substring(2, 9)}`;
        return {
          id,
          get: vi.fn(async () => {
            let data: MockDocRecord | undefined;
            if (colName === "escrow_accounts") data = escrowStore.get(id);
            else if (colName === "seller_wallets") data = walletStore.get(id);
            else if (colName === "payout_requests") data = payoutStore.get(id);
            return {
              exists: !!data,
              data: () => data,
            };
          }),
          set: vi.fn(async (data: MockDocRecord) => {
            if (colName === "escrow_accounts") escrowStore.set(id, data);
            else if (colName === "seller_wallets") walletStore.set(id, data);
            else if (colName === "payout_requests") payoutStore.set(id, data);
            else if (colName === "seller_wallet_transactions") txStore.set(id, data);
          }),
          update: vi.fn(async (data: Partial<MockDocRecord>) => {
            let existing: MockDocRecord | undefined;
            if (colName === "escrow_accounts") existing = escrowStore.get(id);
            else if (colName === "seller_wallets") existing = walletStore.get(id);
            else if (colName === "payout_requests") existing = payoutStore.get(id);
            const updated = { ...(existing || {}), ...data };
            if (colName === "escrow_accounts") escrowStore.set(id, updated);
            else if (colName === "seller_wallets") walletStore.set(id, updated);
            else if (colName === "payout_requests") payoutStore.set(id, updated);
          }),
        };
      },
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      get: vi.fn(async () => {
        let items: MockDocRecord[] = [];
        if (colName === "payout_requests") items = Array.from(payoutStore.values());
        if (colName === "seller_wallet_transactions") items = Array.from(txStore.values());
        return {
          docs: items.map((item) => ({ data: () => item })),
        };
      }),
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

// Mock Auth Middleware
vi.mock("../middlewares/auth", () => ({
  authenticateToken: (req: { headers: Record<string, string>; user?: { uid: string; role: string } }, _res: unknown, next: () => void) => {
    req.user = req.headers["x-test-role"] === "admin"
      ? { uid: "admin-123", role: "admin" }
      : req.headers["x-test-role"] === "seller"
      ? { uid: "seller-456", role: "seller" }
      : { uid: "buyer-789", role: "buyer" };
    next();
  },
  authorizeAdmin: (req: { user?: { role: string } }, res: { status: (code: number) => { json: (body: unknown) => void } }, next: () => void) => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Action réservée aux administrateurs." });
    }
    next();
  },
  authorizeSeller: (_req: unknown, _res: unknown, next: () => void) => next(),
  authorizePropertyOwner: (_req: unknown, _res: unknown, next: () => void) => next(),
  require2FA: (_req: unknown, _res: unknown, next: () => void) => next(),
  authenticateUserOptional: (_req: unknown, _res: unknown, next: () => void) => next(),
  optionalAuthenticateToken: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

describe("Olmart Aman - Escrow & Seller Wallet Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/v1/payment/escrow/hold - should hold funds in escrow and increase seller pending balance", async () => {
    const res = await request(app)
      .post("/api/v1/payment/escrow/hold")
      .send({
        orderId: "order-test-001",
        buyerId: "buyer-789",
        sellerId: "seller-456",
        totalAmountDZD: 10000,
        paymentMethod: "CIB_EDAHABIA",
        platformFeeRatePercent: 5,
        autoReleaseDays: 3,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.platformFeeDZD).toBe(500);
    expect(res.body.data.sellerPayoutAmountDZD).toBe(9500);
    expect(res.body.data.status).toBe("HELD");
  });

  it("POST /api/v1/payment/escrow/release/:orderId - should release escrow to seller available wallet balance", async () => {
    const res = await request(app)
      .post("/api/v1/payment/escrow/release/order-test-001")
      .send({
        rating: 5,
        comment: "Excellent service et produit conforme !",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("RELEASED");
  });

  it("GET /api/v1/payment/wallet/me - should return seller wallet with available balance", async () => {
    const res = await request(app)
      .get("/api/v1/payment/wallet/me")
      .set("x-test-role", "seller");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sellerId).toBe("seller-456");
    expect(res.body.data.availableBalanceDZD).toBe(9500);
  });

  it("POST /api/v1/payment/wallet/withdraw - should permit payout request with sufficient balance", async () => {
    const res = await request(app)
      .post("/api/v1/payment/wallet/withdraw")
      .set("x-test-role", "seller")
      .send({
        amountDZD: 5000,
        method: "CCP_BARIDIMOB",
        accountDetails: "00799999002233445566",
        accountHolderName: "Ahmed Benali",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amountDZD).toBe(5000);
    expect(res.body.data.status).toBe("PENDING");
  });

  it("GET /api/v1/payment/admin/withdrawals - should allow admin to view pending payouts", async () => {
    const res = await request(app)
      .get("/api/v1/payment/admin/withdrawals")
      .set("x-test-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
