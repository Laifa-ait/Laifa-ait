import express from "express";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, vi, MockInstance } from "vitest";
import { admin, db } from "../config/firebase-admin";
import router from "../domains/order/controllers/OrderStatusController";
import { ProductVariant } from "../domains/product/product.types";

const app = express();
app.use(express.json());
app.use(router);

describe("OrderStatusController Restock Real Integration Suite", () => {
  const sellerUid = "test_integration_seller_999";
  const buyerUid = "test_integration_buyer_999";
  const otherSellerUid = "test_integration_other_seller_111";

  const simpleProdId = "test_integration_prod_simple";
  const multiProdId1 = "test_integration_prod_multi_1";
  const multiProdId2 = "test_integration_prod_multi_2";
  const variantProdId = "test_integration_prod_variant";
  const zeroStockProdId = "test_integration_prod_zero";

  let verifyTokenSpy: MockInstance;

  beforeAll(async () => {
    // 1. Seed base commission settings to prevent warnings
    await db.collection("settings").doc("commission").set({
      globalRate: 15,
    });

    // 2. Seed mock users
    await db.collection("users").doc(sellerUid).set({
      role: "seller",
      email: "seller@olmart.dz",
      commissionRate: 10,
    });

    await db.collection("users").doc(buyerUid).set({
      role: "buyer",
      email: "buyer@olmart.dz",
    });

    // 3. Spy on decode token middleware
    verifyTokenSpy = vi.spyOn(admin.auth(), "verifyIdToken");
  });

  afterAll(async () => {
    // Clean up all seeded test documents to leave Firestore pristine
    const documentsToClean = [
      `users/${sellerUid}`,
      `users/${buyerUid}`,
      `settings/commission`,
      `products/${simpleProdId}`,
      `products/${multiProdId1}`,
      `products/${multiProdId2}`,
      `products/${variantProdId}`,
      `products/${zeroStockProdId}`,
    ];

    for (const docPath of documentsToClean) {
      try {
        await db.doc(docPath).delete();
      } catch {
        // Suppress clean up errors
      }
    }

    // Clean any generated orders
    const ordersSnap = await db.collection("orders").get();
    for (const doc of ordersSnap.docs) {
      if (doc.id.startsWith("test_integration_order_")) {
        await doc.ref.delete();
      }
    }

    vi.restoreAllMocks();
  });

  it("TEST 1: Restores stock for simple products through the real controller (returned status)", async () => {
    // Set up real product in Firestore
    await db.collection("products").doc(simpleProdId).set({
      id: simpleProdId,
      name: "Integration Simple Product",
      stock: 12,
    });

    // Set up real order starting at "shipped" to allow valid "returned" transition
    const orderId = "test_integration_order_simple";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "shipped",
      items: [{ id: simpleProdId, quantity: 4 }],
      restocked: false,
    });

    // Mock authenticated seller session
    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    // Call actual production route
    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "returned" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify stock is restored on the real Firestore document
    const updatedProd = await db.collection("products").doc(simpleProdId).get();
    expect(updatedProd.data()?.stock).toBe(16); // 12 + 4

    // Verify order flag is locked
    const updatedOrder = await db.collection("orders").doc(orderId).get();
    expect(updatedOrder.data()?.restocked).toBe(true);
    expect(updatedOrder.data()?.status).toBe("returned");
  });

  it("TEST 2: Restores stock across multiple distinct products inside the same order", async () => {
    await db.collection("products").doc(multiProdId1).set({
      id: multiProdId1,
      name: "Integration Multi 1",
      stock: 5,
    });
    await db.collection("products").doc(multiProdId2).set({
      id: multiProdId2,
      name: "Integration Multi 2",
      stock: 10,
    });

    const orderId = "test_integration_order_multi";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "shipped",
      items: [
        { id: multiProdId1, quantity: 5 },
        { id: multiProdId2, quantity: 3 },
      ],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "returned" });

    expect(res.status).toBe(200);

    const updated1 = await db.collection("products").doc(multiProdId1).get();
    const updated2 = await db.collection("products").doc(multiProdId2).get();

    expect(updated1.data()?.stock).toBe(10); // 5 + 5
    expect(updated2.data()?.stock).toBe(13); // 10 + 3
  });

  it("TEST 3: Aggregates duplicate item lines correctly without double-loading or dropping quantities", async () => {
    // Set stock to 8
    await db.collection("products").doc(simpleProdId).set({
      id: simpleProdId,
      name: "Integration Simple Product",
      stock: 8,
    });

    const orderId = "test_integration_order_duplicate";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "shipped",
      items: [
        { id: simpleProdId, quantity: 2 },
        { id: simpleProdId, quantity: 3 }, // duplicate product reference line
      ],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "returned" });

    expect(res.status).toBe(200);

    const updatedProd = await db.collection("products").doc(simpleProdId).get();
    expect(updatedProd.data()?.stock).toBe(13); // 8 + 2 + 3
  });

  it("TEST 4: Restores variant stock, sums total stock, and recalcs hasOutOfStockVariants on the true controller", async () => {
    await db.collection("products").doc(variantProdId).set({
      id: variantProdId,
      name: "Integration Variant Product",
      stock: 10,
      variants: [
        { name: "Vert", stock: 3 },
        { name: "Jaune", stock: 7 },
      ],
      hasOutOfStockVariants: false,
    });

    const orderId = "test_integration_order_variants";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "shipped",
      items: [
        { id: variantProdId, quantity: 2, selectedVariant: "Vert" },
        { id: variantProdId, quantity: 1, selectedVariant: "Jaune" },
      ],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "returned" });

    expect(res.status).toBe(200);

    const updatedProd = await db.collection("products").doc(variantProdId).get();
    const data = updatedProd.data();
    expect(data?.variants?.find((v: ProductVariant) => v.name === "Vert")?.stock).toBe(5); // 3 + 2
    expect(data?.variants?.find((v: ProductVariant) => v.name === "Jaune")?.stock).toBe(8); // 7 + 1
    expect(data?.stock).toBe(13); // 5 + 8
  });

  it("TEST 5: Safely skips restoration if a product does not exist in Firestore", async () => {
    const orderId = "test_integration_order_inexistent";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "shipped",
      items: [{ id: "test_integration_prod_does_not_exist", quantity: 10 }],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "returned" });

    // The route must complete with success, bypassing the missing product document safely
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("TEST 6: Handles restoration correctly starting from an initial stock of zero", async () => {
    await db.collection("products").doc(zeroStockProdId).set({
      id: zeroStockProdId,
      name: "Integration Zero Stock",
      stock: 0,
    });

    const orderId = "test_integration_order_zero_stock";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "shipped",
      items: [{ id: zeroStockProdId, quantity: 15 }],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "returned" });

    expect(res.status).toBe(200);

    const updatedProd = await db.collection("products").doc(zeroStockProdId).get();
    expect(updatedProd.data()?.stock).toBe(15);
  });

  it("TEST 7: Correctly recalculates out-of-stock variants flag on variant restock", async () => {
    await db.collection("products").doc(variantProdId).set({
      id: variantProdId,
      name: "Integration Variant Product",
      stock: 0,
      variants: [
        { name: "Vert", stock: 0 },
        { name: "Jaune", stock: 0 },
      ],
      hasOutOfStockVariants: true,
    });

    const orderId = "test_integration_order_has_out";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "shipped",
      items: [
        { id: variantProdId, quantity: 5, selectedVariant: "Vert" },
        { id: variantProdId, quantity: 8, selectedVariant: "Jaune" },
      ],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "returned" });

    expect(res.status).toBe(200);

    const updatedProd = await db.collection("products").doc(variantProdId).get();
    // Since both variants are now positive (> 0), hasOutOfStockVariants must be false
    expect(updatedProd.data()?.hasOutOfStockVariants).toBe(false);
  });

  it("TEST 8: Bypasses stock restoration if order is already marked as restocked (idempotency block)", async () => {
    await db.collection("products").doc(simpleProdId).set({
      id: simpleProdId,
      name: "Integration Simple Product",
      stock: 20,
    });

    const orderId = "test_integration_order_idempotent";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "returned",
      items: [{ id: simpleProdId, quantity: 5 }],
      restocked: true, // Already restocked flag
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "returned" });

    expect(res.status).toBe(200);

    const updatedProd = await db.collection("products").doc(simpleProdId).get();
    // Stock must remain 20, NOT 25 because restoration was skipped
    expect(updatedProd.data()?.stock).toBe(20);
  });

  it("TEST 9: Guarantees complete isolation and fails if seller is unauthorized (multi-vendor defense)", async () => {
    await db.collection("products").doc(simpleProdId).set({
      id: simpleProdId,
      stock: 10,
    });

    const orderId = "test_integration_order_isolation";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: otherSellerUid, // Belongs to another seller
      sellerIds: [otherSellerUid],
      status: "shipped",
      items: [{ id: simpleProdId, quantity: 3 }],
      restocked: false,
    });

    // Requesting seller is sellerUid
    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "returned" });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Accès non autorisé");

    // Verify stock was not modified
    const updatedProd = await db.collection("products").doc(simpleProdId).get();
    expect(updatedProd.data()?.stock).toBe(10);
  });

  it("TEST 10: Restores stock successfully during client cancellation path (/buyer/orders/cancel)", async () => {
    await db.collection("products").doc(simpleProdId).set({
      id: simpleProdId,
      name: "Integration Simple Product",
      stock: 5,
    });

    const orderId = "test_integration_order_buyer_cancel";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid, // Must match authenticated user
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "pending", // Must be pending to allow cancel
      items: [{ id: simpleProdId, quantity: 3 }],
      restocked: false,
    });

    // Mock buyer authenticated session
    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/buyer/orders/cancel")
      .set("Authorization", "Bearer mock-buyer-token")
      .send({ orderId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedProd = await db.collection("products").doc(simpleProdId).get();
    expect(updatedProd.data()?.stock).toBe(8); // 5 + 3

    const updatedOrder = await db.collection("orders").doc(orderId).get();
    expect(updatedOrder.data()?.status).toBe("cancelled_by_client");
  });

  it("TEST 11: Restores stock successfully during canceled status transition from seller side", async () => {
    await db.collection("products").doc(simpleProdId).set({
      id: simpleProdId,
      name: "Integration Simple Product",
      stock: 10,
    });

    const orderId = "test_integration_order_seller_cancel";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "processing", // "processing" to "canceled" is a valid transition
      items: [{ id: simpleProdId, quantity: 5 }],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "canceled" });

    expect(res.status).toBe(200);

    const updatedProd = await db.collection("products").doc(simpleProdId).get();
    expect(updatedProd.data()?.stock).toBe(15); // 10 + 5
  });

  it("TEST 12: Real Firestore Transaction Concurrency and Collision Retry Verification", async () => {
    // 1. Set up product
    await db.collection("products").doc(simpleProdId).set({
      id: simpleProdId,
      name: "Integration Concurrency Product",
      stock: 100,
    });

    // 2. Set up order
    const orderId = "test_integration_order_concurrency";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "shipped",
      items: [{ id: simpleProdId, quantity: 15 }],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    // 3. Dispatch two concurrent status updates to the same order to trigger a collision retry in Firestore
    const req1 = request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "returned" });

    const req2 = request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "returned" });

    const [res1, res2] = await Promise.all([req1, req2]);

    // 4. Verify both requests succeed (the loser of the race retries and completes successfully with idempotency bypass)
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    // 5. Verify the stock is restored exactly ONCE (115) and NOT twice (130)
    const updatedProd = await db.collection("products").doc(simpleProdId).get();
    expect(updatedProd.data()?.stock).toBe(115);

    // 6. Verify order restocked flag is locked
    const updatedOrder = await db.collection("orders").doc(orderId).get();
    expect(updatedOrder.data()?.restocked).toBe(true);
    expect(updatedOrder.data()?.status).toBe("returned");
  });

  it("TEST 13: Fails when transition is invalid (state machine protection)", async () => {
    const orderId = "test_integration_order_invalid_transition";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "delivered", // From delivered, transitioning to processing is invalid
      items: [{ id: simpleProdId, quantity: 1 }],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "processing" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Transition de statut invalide");
  });

  it("TEST 14: Fails when a normal seller tries to update to an unauthorized status", async () => {
    const orderId = "test_integration_order_unauthorized_status";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "new",
      items: [{ id: simpleProdId, quantity: 1 }],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "dispute_resolved" }); // not in seller allowed list

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Statut non autorisé");
  });

  it("TEST 15: Fails buyer cancellation when the order does not exist (404)", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/buyer/orders/cancel")
      .set("Authorization", "Bearer mock-buyer-token")
      .send({ orderId: "test_integration_order_ghost_does_not_exist" });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Commande introuvable");
  });

  it("TEST 16: Fails buyer cancellation when the order is not in pending status (400)", async () => {
    const orderId = "test_integration_order_buyer_cancel_non_pending";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "processing", // not pending
      items: [{ id: simpleProdId, quantity: 1 }],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/buyer/orders/cancel")
      .set("Authorization", "Bearer mock-buyer-token")
      .send({ orderId });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Seules les commandes en attente peuvent être annulées");
  });

  it("TEST 17: Fails buyer cancellation when the user is not the owner (403)", async () => {
    const orderId = "test_integration_order_buyer_cancel_wrong_owner";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: "some_other_buyer_uid", // not buyerUid
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "pending",
      items: [{ id: simpleProdId, quantity: 1 }],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: buyerUid,
      email: "buyer@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/buyer/orders/cancel")
      .set("Authorization", "Bearer mock-buyer-token")
      .send({ orderId });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Accès non autorisé");
  });

  it("TEST 18: Fails delivery confirmation when deliveryPin is absent in order", async () => {
    const orderId = "test_integration_order_no_pin";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "shipped",
      items: [{ id: simpleProdId, quantity: 1 }],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "delivered", deliveryPin: "123456" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("La commande ne possède pas de code PIN de livraison valide");
  });

  it("TEST 19: Fails delivery confirmation with invalid PIN (no fallback '123456' allowed)", async () => {
    const orderId = "test_integration_order_valid_pin_needed";
    await db.collection("orders").doc(orderId).set({
      id: orderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "shipped",
      items: [{ id: simpleProdId, quantity: 1 }],
      restocked: false,
      deliveryPin: "789012",
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res1 = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "delivered", deliveryPin: "123456" });

    expect(res1.status).toBe(400);
    expect(res1.body.error).toContain("La confirmation de livraison requiert soit le code PIN");

    const res2 = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [orderId], status: "delivered", deliveryPin: "789012" });

    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);
  });

  it("TEST 20: Fails batch update and rolls back entirely if any order in batch is unauthorized or missing", async () => {
    const validOrderId = "test_integration_order_batch_valid";
    const unauthorizedOrderId = "test_integration_order_batch_unauthorized";

    await db.collection("products").doc(simpleProdId).set({
      id: simpleProdId,
      stock: 50,
    });

    await db.collection("orders").doc(validOrderId).set({
      id: validOrderId,
      userId: buyerUid,
      sellerId: sellerUid,
      sellerIds: [sellerUid],
      status: "shipped",
      items: [{ id: simpleProdId, quantity: 10 }],
      restocked: false,
    });

    await db.collection("orders").doc(unauthorizedOrderId).set({
      id: unauthorizedOrderId,
      userId: buyerUid,
      sellerId: otherSellerUid,
      sellerIds: [otherSellerUid],
      status: "shipped",
      items: [{ id: simpleProdId, quantity: 20 }],
      restocked: false,
    });

    verifyTokenSpy.mockResolvedValue({
      uid: sellerUid,
      email: "seller@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/seller/orders/status")
      .set("Authorization", "Bearer mock-seller-token")
      .send({ orderIds: [validOrderId, unauthorizedOrderId], status: "returned" });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Accès non autorisé");

    const order1 = await db.collection("orders").doc(validOrderId).get();
    expect(order1.data()?.status).toBe("shipped");
    expect(order1.data()?.restocked).toBe(false);

    const prod = await db.collection("products").doc(simpleProdId).get();
    expect(prod.data()?.stock).toBe(50);
  });
});
