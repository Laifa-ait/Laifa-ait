import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import request from "supertest";
import { app } from "../../app";
import { WebhookService } from "../domains/payment/services/WebhookService";

interface MockDocRecord {
  [key: string]: unknown;
}

// Mock Firebase Admin
vi.mock("../config/firebase-admin", () => {
  const escrowStore = new Map<string, MockDocRecord>();
  const orderStore = new Map<string, MockDocRecord>();
  const logStore = new Map<string, MockDocRecord>();
  const walletStore = new Map<string, MockDocRecord>();

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
            else if (colName === "payment_webhooks_log") data = logStore.get(id);
            else if (colName === "seller_wallets") data = walletStore.get(id);
            return {
              exists: !!data,
              data: () => data,
            };
          }),
          set: vi.fn(async (data: MockDocRecord) => {
            if (colName === "escrow_accounts") escrowStore.set(id, data);
            else if (colName === "orders") orderStore.set(id, data);
            else if (colName === "payment_webhooks_log") logStore.set(id, data);
            else if (colName === "seller_wallets") walletStore.set(id, data);
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

describe("Payment Webhook Security & Signature Validation", () => {
  const testSecret = "test_chargily_secret_key_1234567890_32bytes_long";

  beforeEach(() => {
    process.env.NODE_ENV = "production";
    process.env.CHARGILY_WEBHOOK_SECRET = testSecret;
    process.env.BARIDIMOB_WEBHOOK_SECRET = testSecret;
  });

  it("verifyChargilySignature validates valid HMAC SHA256 signature correctly", () => {
    const payload = JSON.stringify({ event: "checkout.paid", id: "evt_001" });
    const signature = crypto.createHmac("sha256", testSecret).update(payload).digest("hex");

    const isValid = WebhookService.verifyChargilySignature(payload, signature);
    expect(isValid).toBe(true);
  });

  it("verifyChargilySignature rejects invalid signature", () => {
    const payload = JSON.stringify({ event: "checkout.paid", id: "evt_001" });
    const invalidSignature = "invalid_signature_12345678901234567890123456789012";

    const isValid = WebhookService.verifyChargilySignature(payload, invalidSignature);
    expect(isValid).toBe(false);
  });

  it("POST /api/v1/payment/webhook/chargily rejects request with missing signature", async () => {
    const res = await request(app)
      .post("/api/v1/payment/webhook/chargily")
      .send({ id: "evt_100", type: "checkout.paid" });

    expect([401, 403]).toContain(res.status);
    expect(JSON.stringify(res.body)).toMatch(/signature|CSRF/i);
  });

  it("POST /api/v1/payment/webhook/chargily accepts request with valid HMAC signature", async () => {
    const payloadObj = {
      id: "evt_chargily_200",
      type: "checkout.paid",
      data: {
        id: "chk_999",
        status: "paid",
        amount: 5000,
        metadata: {
          orderId: "ord_1001",
          buyerId: "buyer_1",
          sellerId: "seller_1",
        },
      },
    };
    const rawBody = JSON.stringify(payloadObj);
    const signature = crypto.createHmac("sha256", testSecret).update(rawBody).digest("hex");

    const res = await request(app)
      .post("/api/v1/payment/webhook/chargily")
      .set("x-chargily-signature", signature)
      .set("Content-Type", "application/json")
      .send(rawBody);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("POST /api/v1/payment/webhook/baridimob accepts request with valid HMAC signature", async () => {
    const payloadObj = {
      transactionId: "baridimob_tx_555",
      orderId: "ord_1002",
      buyerId: "buyer_2",
      sellerId: "seller_2",
      amountDZD: 12000,
      status: "SUCCESS",
    };
    const rawBody = JSON.stringify(payloadObj);
    const signature = crypto.createHmac("sha256", testSecret).update(rawBody).digest("hex");

    const res = await request(app)
      .post("/api/v1/payment/webhook/baridimob")
      .set("x-baridimob-signature", signature)
      .set("Content-Type", "application/json")
      .send(rawBody);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
