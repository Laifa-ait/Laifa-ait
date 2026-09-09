import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { db } from "../config/firebase-admin";
import { getTestAuthHeader } from "./helpers/firebaseAuthHelper";

const hasEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST);

describe.skipIf(!hasEmulator)("Olmart Aman - Escrow & Seller Wallet Tests", () => {
  let buyerHeader: string;
  let sellerHeader: string;
  let adminHeader: string;

  beforeAll(async () => {
    buyerHeader = await getTestAuthHeader({
      uid: "buyer-789",
      email: "buyer789@olmart.dz",
      role: "buyer",
    });

    sellerHeader = await getTestAuthHeader({
      uid: "seller-456",
      email: "seller456@olmart.dz",
      role: "seller",
    });

    adminHeader = await getTestAuthHeader({
      uid: "admin-123",
      email: "admin123@olmart.dz",
      role: "admin",
    });

    // Seed user accounts in Firestore Emulator
    await db.collection("users").doc("buyer-789").set({
      role: "buyer",
      email: "buyer789@olmart.dz",
    });

    await db.collection("users").doc("seller-456").set({
      role: "seller",
      email: "seller456@olmart.dz",
    });

    await db.collection("users").doc("admin-123").set({
      role: "admin",
      email: "admin123@olmart.dz",
    });
  });

  beforeEach(async () => {
    // Reset order, escrow and wallet documents in Firestore Emulator
    await db.collection("orders").doc("order-test-001").set({
      id: "order-test-001",
      userId: "buyer-789",
      sellerIds: ["seller-456"],
      total: 10000,
      paymentStatus: "PAID",
      status: "CONFIRMED",
      paymentMethod: "CIB_EDAHABIA",
    });

    await db.collection("escrow_accounts").doc("order-test-001").delete().catch(() => null);
    await db.collection("seller_wallets").doc("seller-456").delete().catch(() => null);
  });

  afterAll(async () => {
    // Clean up test documents
    await db.collection("orders").doc("order-test-001").delete().catch(() => null);
    await db.collection("escrow_accounts").doc("order-test-001").delete().catch(() => null);
    await db.collection("seller_wallets").doc("seller-456").delete().catch(() => null);
    await db.collection("users").doc("buyer-789").delete().catch(() => null);
    await db.collection("users").doc("seller-456").delete().catch(() => null);
    await db.collection("users").doc("admin-123").delete().catch(() => null);
  });

  it("POST /api/v1/payment/escrow/hold - should hold funds in escrow and increase seller pending balance", async () => {
    const res = await request(app)
      .post("/api/v1/payment/escrow/hold")
      .set("Authorization", buyerHeader)
      .send({
        orderId: "order-test-001",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.platformFeeDZD).toBe(500);
    expect(res.body.data.sellerPayoutAmountDZD).toBe(9500);
    expect(res.body.data.status).toBe("HELD");
  });

  it("POST /api/v1/payment/escrow/release/:orderId - should release escrow to seller available wallet balance", async () => {
    // Create hold first
    await request(app)
      .post("/api/v1/payment/escrow/hold")
      .set("Authorization", buyerHeader)
      .send({
        orderId: "order-test-001",
      });

    // Update order status to DELIVERED
    await db.collection("orders").doc("order-test-001").update({
      status: "DELIVERED",
    });

    const res = await request(app)
      .post("/api/v1/payment/escrow/release/order-test-001")
      .set("Authorization", buyerHeader)
      .send({
        rating: 5,
        comment: "Excellent service et produit conforme !",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("RELEASED");
  });

  it("GET /api/v1/payment/wallet/me - should return seller wallet with available balance", async () => {
    // Hold & release escrow first to build balance
    await request(app)
      .post("/api/v1/payment/escrow/hold")
      .set("Authorization", buyerHeader)
      .send({
        orderId: "order-test-001",
      });

    await db.collection("orders").doc("order-test-001").update({
      status: "DELIVERED",
    });

    await request(app)
      .post("/api/v1/payment/escrow/release/order-test-001")
      .set("Authorization", buyerHeader)
      .send({
        rating: 5,
        comment: "Excellent !",
      });

    const res = await request(app)
      .get("/api/v1/payment/wallet/me")
      .set("Authorization", sellerHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sellerId).toBe("seller-456");
    expect(res.body.data.availableBalanceDZD).toBe(9500);
  });

  it("POST /api/v1/payment/wallet/withdraw - should permit payout request with sufficient balance", async () => {
    // Build wallet balance first
    await db.collection("seller_wallets").doc("seller-456").set({
      sellerId: "seller-456",
      availableBalanceDZD: 10000,
      pendingEscrowBalanceDZD: 0,
      totalEarningsDZD: 10000,
      currency: "DZD",
    });

    const res = await request(app)
      .post("/api/v1/payment/wallet/withdraw")
      .set("Authorization", sellerHeader)
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
      .set("Authorization", adminHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

