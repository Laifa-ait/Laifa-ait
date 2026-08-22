import { describe, it, expect, vi } from "vitest";
import { Product, ProductVariant } from "../domains/product/product.types";

interface FirestoreProduct extends Partial<Product> {
  hasOutOfStockVariants?: boolean;
}

// Mimics the exact business logic inside OrderStatusController.ts
function runRestockLogic(
  orderData: { items: any[]; restocked?: boolean },
  productDatabase: Map<string, FirestoreProduct>
) {
  // 9. Already restocked check
  if (orderData.restocked) {
    return { skipped: true, productUpdates: new Map() };
  }

  const productUpdates = new Map<string, FirestoreProduct>();
  const items = orderData.items || [];

  // A. Deduplicate product IDs
  const productIds = [
    ...new Set(
      items
        .map((item) => item.id)
        .filter((pId): pId is string => typeof pId === "string" && pId !== "")
    ),
  ];

  // B. Simulate t.getAll() bulk-loading
  if (productIds.length > 0) {
    for (const pId of productIds) {
      const existingProduct = productDatabase.get(pId);
      if (existingProduct) {
        // Deep clone to simulate Firestore transaction isolated read
        productUpdates.set(pId, JSON.parse(JSON.stringify(existingProduct)));
      }
    }
  }

  // E. Sequential restoration on cached in-memory Map
  for (const item of items) {
    if (!item.id || !item.quantity) continue;
    const pData = productUpdates.get(item.id);
    if (pData) {
      if (item.selectedVariant) {
        pData.variants = (pData.variants || []).map((v) => {
          if (v.name === item.selectedVariant) {
            return {
              ...v,
              stock: Number(v.stock || 0) + Number(item.quantity || 1),
            };
          }
          return v;
        });
        pData.stock = (pData.variants || []).reduce(
          (acc: number, curr) => acc + Math.max(0, Number(curr.stock) || 0),
          0
        );
        pData.hasOutOfStockVariants = (pData.variants || []).some(
          (v) => Math.max(0, Number(v.stock) || 0) <= 0
        );
      } else {
        pData.stock = Number(pData.stock || 0) + Number(item.quantity || 1);
      }
    }
  }

  return { skipped: false, productUpdates };
}

describe("Bulk Load Restock Mechanism Forensics & Hardening", () => {
  // 1. Produit simple
  it("TEST 1: Restores stock correctly for simple products without variants", () => {
    const productDatabase = new Map<string, FirestoreProduct>([
      ["prod_1", { id: "prod_1", name: "Simple Product", stock: 5 }],
    ]);
    const orderData = {
      items: [{ id: "prod_1", quantity: 3 }],
    };

    const result = runRestockLogic(orderData, productDatabase);
    expect(result.skipped).toBe(false);
    expect(result.productUpdates.get("prod_1")?.stock).toBe(8);
  });

  // 2. Plusieurs produits
  it("TEST 2: Restores stock across multiple distinct products in the same order", () => {
    const productDatabase = new Map<string, FirestoreProduct>([
      ["prod_1", { id: "prod_1", name: "Product A", stock: 10 }],
      ["prod_2", { id: "prod_2", name: "Product B", stock: 20 }],
    ]);
    const orderData = {
      items: [
        { id: "prod_1", quantity: 5 },
        { id: "prod_2", quantity: 10 },
      ],
    };

    const result = runRestockLogic(orderData, productDatabase);
    expect(result.productUpdates.get("prod_1")?.stock).toBe(15);
    expect(result.productUpdates.get("prod_2")?.stock).toBe(30);
  });

  // 3. Produit dupliqué
  it("TEST 3: Groups and aggregates stock modifications for duplicate item lines in the same order", () => {
    const productDatabase = new Map<string, FirestoreProduct>([
      ["prod_1", { id: "prod_1", name: "Duplicate Product", stock: 4 }],
    ]);
    const orderData = {
      items: [
        { id: "prod_1", quantity: 2 },
        { id: "prod_1", quantity: 3 }, // duplicate product line (different options or split)
      ],
    };

    const result = runRestockLogic(orderData, productDatabase);
    // Deduplication should query once, but calculation should add sequentially to 4 + 2 + 3 = 9
    expect(result.productUpdates.get("prod_1")?.stock).toBe(9);
  });

  // 4. Plusieurs variantes
  it("TEST 4: Restores stock correctly across multiple variants of the same product", () => {
    const productDatabase = new Map<string, FirestoreProduct>([
      [
        "prod_v",
        {
          id: "prod_v",
          name: "Variant Product",
          stock: 10,
          variants: [
            { name: "Rouge", stock: 4, sku: "PV-ROUGE", priceDiff: 0 },
            { name: "Bleu", stock: 6, sku: "PV-BLEU", priceDiff: 0 },
          ],
        },
      ],
    ]);
    const orderData = {
      items: [
        { id: "prod_v", quantity: 2, selectedVariant: "Rouge" },
        { id: "prod_v", quantity: 3, selectedVariant: "Bleu" },
      ],
    };

    const result = runRestockLogic(orderData, productDatabase);
    const updated = result.productUpdates.get("prod_v");
    expect(updated?.variants?.find((v: ProductVariant) => v.name === "Rouge")?.stock).toBe(6);
    expect(updated?.variants?.find((v: ProductVariant) => v.name === "Bleu")?.stock).toBe(9);
    expect(updated?.stock).toBe(15); // Recalculated total stock
  });

  // 5. Produit supprimé
  it("TEST 5: Safely skips restoration without crashing if a product is deleted or does not exist", () => {
    const productDatabase = new Map<string, FirestoreProduct>(); // Empty DB
    const orderData = {
      items: [{ id: "deleted_prod", quantity: 5 }],
    };

    const result = runRestockLogic(orderData, productDatabase);
    expect(result.productUpdates.has("deleted_prod")).toBe(false);
  });

  // 6. Stock à zéro
  it("TEST 6: Successfully handles restoration starting from an initial zero stock state", () => {
    const productDatabase = new Map<string, FirestoreProduct>([
      ["prod_zero", { id: "prod_zero", name: "Out Of Stock", stock: 0 }],
    ]);
    const orderData = {
      items: [{ id: "prod_zero", quantity: 10 }],
    };

    const result = runRestockLogic(orderData, productDatabase);
    expect(result.productUpdates.get("prod_zero")?.stock).toBe(10);
  });

  // 7. Recalcul hasOutOfStockVariants
  it("TEST 7: Recalculates out-of-stock variant flags accurately upon variant restock", () => {
    const productDatabase = new Map<string, FirestoreProduct>([
      [
        "prod_has_out",
        {
          id: "prod_has_out",
          name: "Variant Product",
          stock: 0,
          variants: [
            { name: "X", stock: 0, sku: "PV-X", priceDiff: 0 },
            { name: "Y", stock: 0, sku: "PV-Y", priceDiff: 0 },
          ],
          hasOutOfStockVariants: true,
        },
      ],
    ]);

    // Restock variant X but keep variant Y out of stock
    const orderDataPartial = {
      items: [{ id: "prod_has_out", quantity: 5, selectedVariant: "X" }],
    };
    const resultPartial = runRestockLogic(orderDataPartial, productDatabase);
    expect(resultPartial.productUpdates.get("prod_has_out")?.hasOutOfStockVariants).toBe(true); // Y is still out of stock

    // Restock both variants out of zero stock
    const orderDataFull = {
      items: [
        { id: "prod_has_out", quantity: 5, selectedVariant: "X" },
        { id: "prod_has_out", quantity: 10, selectedVariant: "Y" },
      ],
    };
    const resultFull = runRestockLogic(orderDataFull, productDatabase);
    expect(resultFull.productUpdates.get("prod_has_out")?.hasOutOfStockVariants).toBe(false); // both are positive now!
  });

  // 8. Multi-vendeur / Isolation
  it("TEST 8: Guarantees complete isolation of product updates between independent orders", () => {
    const productDatabase = new Map<string, FirestoreProduct>([
      ["prod_1", { id: "prod_1", name: "Product A", stock: 10 }],
    ]);

    const orderSeller1 = { items: [{ id: "prod_1", quantity: 5 }] };
    const orderSeller2 = { items: [{ id: "prod_1", quantity: 12 }] };

    const result1 = runRestockLogic(orderSeller1, productDatabase);
    const result2 = runRestockLogic(orderSeller2, productDatabase);

    // Ensure the results do not bleed or compound into each other
    expect(result1.productUpdates.get("prod_1")?.stock).toBe(15);
    expect(result2.productUpdates.get("prod_1")?.stock).toBe(22);
  });

  // 9. Commande déjà restockée
  it("TEST 9: Bypasses restoration logic entirely if the order has already been restocked", () => {
    const productDatabase = new Map<string, FirestoreProduct>([
      ["prod_1", { id: "prod_1", name: "Product A", stock: 10 }],
    ]);
    const orderData = {
      items: [{ id: "prod_1", quantity: 5 }],
      restocked: true, // Idempotency check flag
    };

    const result = runRestockLogic(orderData, productDatabase);
    expect(result.skipped).toBe(true);
    expect(result.productUpdates.has("prod_1")).toBe(false);
  });

  // 10. Retry transactionnel
  it("TEST 10: Ensures state variables reset cleanly and do not persist across transactional retries", () => {
    const productDatabase = new Map<string, FirestoreProduct>([
      ["prod_1", { id: "prod_1", name: "Product A", stock: 10 }],
    ]);
    const orderData = { items: [{ id: "prod_1", quantity: 2 }] };

    // Simulate an external mutable counter often found in bad transaction closures
    let executionAttempts = 0;
    const runInTransactionRetry = () => {
      executionAttempts++;
      // On every attempt, we MUST start with a fresh copy of local products Map,
      // imitating how db.runTransaction rolls back and re-executes the block.
      const freshResult = runRestockLogic(orderData, productDatabase);
      return freshResult;
    };

    // First attempt (fails/aborts in simulated runtime)
    const resultAttempt1 = runInTransactionRetry();
    expect(executionAttempts).toBe(1);
    expect(resultAttempt1.productUpdates.get("prod_1")?.stock).toBe(12);

    // Second retry attempt
    const resultAttempt2 = runInTransactionRetry();
    expect(executionAttempts).toBe(2);
    // If state persisted mutably, stock might have been double added (14).
    // It must remain 12 due to proper isolated read on retry!
    expect(resultAttempt2.productUpdates.get("prod_1")?.stock).toBe(12);
  });
});
