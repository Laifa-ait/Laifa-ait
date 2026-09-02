import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import crypto from "crypto";

function must<T>(value: T | null | undefined, label: string): T {
  if (value === null || value === undefined) {
    throw new Error(`Test setup failed: ${label} is missing`);
  }
  return value;
}

interface MockUserDoc {
  uid?: string;
  displayName?: string;
  email?: string;
  role?: string;
  onboardingCompleted?: boolean;
  customClaims?: { role?: string; isAdmin?: boolean };
  [key: string]: unknown;
}

interface MockProductDoc {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  stock: number;
  sellerId: string;
  status: string;
  category: string;
  wilaya: string;
  [key: string]: unknown;
}

interface MockOrderDoc {
  id?: string;
  orderId?: string;
  buyerId?: string;
  sellerId?: string;
  subtotal?: number;
  shippingFee?: number;
  shippingTotal?: number;
  total?: number;
  status?: string;
  paymentStatus?: string;
  [key: string]: unknown;
}

interface MockWebhookLogDoc {
  id?: string;
  processed?: boolean;
  [key: string]: unknown;
}

interface MockEscrowDoc {
  id?: string;
  orderId?: string;
  buyerId?: string;
  sellerId?: string;
  totalAmountDZD?: number;
  sellerPayoutAmountDZD?: number;
  status?: string;
  [key: string]: unknown;
}

interface MockWalletDoc {
  sellerId?: string;
  availableBalanceDZD: number;
  pendingEscrowBalanceDZD?: number;
  totalEarningsDZD?: number;
  currency?: string;
  [key: string]: unknown;
}

// Define Mock DB storage pools
const userStore = new Map<string, MockUserDoc>();
const productStore = new Map<string, MockProductDoc>();
const orderStore = new Map<string, MockOrderDoc>();
const couponStore = new Map<string, Record<string, unknown>>();
const webhookLogStore = new Map<string, MockWebhookLogDoc>();
const escrowStore = new Map<string, MockEscrowDoc>();
const walletStore = new Map<string, MockWalletDoc>();
const idempotencyKeyStore = new Map<string, Record<string, unknown>>();

// Helper to reset stores for clean isolation between tests
function resetStores() {
  userStore.clear();
  productStore.clear();
  orderStore.clear();
  couponStore.clear();
  webhookLogStore.clear();
  escrowStore.clear();
  walletStore.clear();
  idempotencyKeyStore.clear();

  // Populate mock products
  productStore.set("prod_asus", {
    id: "prod_asus",
    name: "Laptop Asus Zenbook",
    price: 150000,
    stock: 5,
    sellerId: "seller_test_1",
    status: "active",
    category: "Informatique",
    wilaya: "16 Alger"
  });

  productStore.set("prod_iphone", {
    id: "prod_iphone",
    name: "iPhone 15 Pro Max",
    price: 250000,
    promoPrice: 240000,
    stock: 10,
    sellerId: "seller_test_1",
    status: "active",
    category: "Téléphones",
    wilaya: "31 Oran"
  });

  productStore.set("prod_arabic_kaftan", {
    id: "prod_arabic_kaftan",
    name: "Kaftan Traditionnel Algérien ة",
    price: 35000,
    stock: 3,
    sellerId: "seller_test_2",
    status: "active",
    category: "Vêtements",
    wilaya: "13 Tlemcen"
  });
}

type GenericDoc = Record<string, unknown> & { id?: string; code?: string; status?: string; idempotencyKey?: string; userId?: string };

interface MockDocSnapshot<T = GenericDoc> {
  id: string;
  exists: boolean;
  data: () => T | undefined;
  ref?: { id: string };
}

interface MockQuerySnapshot<T = GenericDoc> {
  docs: MockDocSnapshot<T>[];
  empty: boolean;
}

interface MockQuery<T = GenericDoc> {
  docs: MockDocSnapshot<T>[];
  empty: boolean;
  get: () => Promise<MockQuerySnapshot<T>>;
  where: (field: string, op: string, value: unknown) => MockQuery<T>;
  orderBy: (_field: string, _direction?: string) => MockQuery<T>;
  limit: (num: number) => MockQuery<T>;
}

// -----------------------------------------------------------------------------
// CRYPTOGRAPHIC HOISTED MOCKS SETUP FOR FIREBASE-ADMIN
// -----------------------------------------------------------------------------
vi.mock("../config/firebase-admin", () => {
  const mockFieldValue = {
    serverTimestamp: () => new Date().toISOString(),
    increment: (val: number) => ({ val, type: "increment" }),
  };

  const createQueryObj = <T extends GenericDoc>(_colName: string, items: T[]): MockQuery<T> => {
    const query: MockQuery<T> = {
      docs: items.map(item => ({
        id: (item.id as string) || "gen_id",
        exists: true,
        data: () => item
      })),
      empty: items.length === 0,
      get: async () => ({
        docs: items.map(item => ({
          id: (item.id as string) || "gen_id",
          exists: true,
          data: () => item
        })),
        empty: items.length === 0
      }),
      where: (field: string, _op: string, value: unknown) => {
        let filtered = items;
        if (field === "code" && typeof value === "string") {
          filtered = items.filter(i => (String(i.code || "")).toUpperCase() === value.toUpperCase());
        } else if (field === "status") {
          filtered = items.filter(i => i.status === value);
        } else if (field === "idempotencyKey") {
          filtered = items.filter(i => i.idempotencyKey === value);
        } else if (field === "userId") {
          filtered = items.filter(i => i.userId === value);
        }
        return createQueryObj(_colName, filtered);
      },
      orderBy: (_field: string, _direction?: string) => {
        return query;
      },
      limit: (num: number) => {
        return createQueryObj(_colName, items.slice(0, num));
      }
    };
    return query;
  };

  const mockDb = {
    collection: (colName: string) => {
      let store: Map<string, GenericDoc>;
      if (colName === "users") store = userStore as unknown as Map<string, GenericDoc>;
      else if (colName === "products") store = productStore as unknown as Map<string, GenericDoc>;
      else if (colName === "orders") store = orderStore as unknown as Map<string, GenericDoc>;
      else if (colName === "coupons") store = couponStore as unknown as Map<string, GenericDoc>;
      else if (colName === "payment_webhooks_log") store = webhookLogStore as unknown as Map<string, GenericDoc>;
      else if (colName === "escrow_accounts") store = escrowStore as unknown as Map<string, GenericDoc>;
      else if (colName === "seller_wallets") store = walletStore as unknown as Map<string, GenericDoc>;
      else if (colName === "idempotency_keys") store = idempotencyKeyStore as unknown as Map<string, GenericDoc>;
      else store = new Map<string, GenericDoc>();

      return {
        doc: (docId?: string) => {
          const actualId = docId || `generated_${crypto.randomBytes(8).toString("hex")}`;
          const getDocObj = () => {
            const data = store.get(actualId);
            return {
              id: actualId,
              exists: store.has(actualId),
              data: () => data,
              ref: { id: actualId }
            };
          };

          return {
            id: actualId,
            get: async () => getDocObj(),
            set: async (data: Record<string, unknown>, options?: { merge?: boolean }) => {
              if (options?.merge && store.has(actualId)) {
                store.set(actualId, { ...store.get(actualId), ...data });
              } else {
                store.set(actualId, { id: actualId, ...data });
              }
            },
            update: async (data: Record<string, unknown>) => {
              const existing = store.get(actualId) || {};
              store.set(actualId, { ...existing, ...data });
            },
            delete: async () => {
              store.delete(actualId);
            },
            collection: (subColName: string) => {
              return mockDb.collection(`${colName}_${actualId}_${subColName}`);
            }
          };
        },
        where: (field: string, _op: string, value: unknown) => {
          const arr = Array.from(store.values());
          let filtered = arr;
          if (field === "status") {
            filtered = arr.filter(item => item.status === value);
          } else if (field === "code" && typeof value === "string") {
            filtered = arr.filter(item => (String(item.code || "")).toUpperCase() === value.toUpperCase());
          }
          return createQueryObj(colName, filtered);
        },
        orderBy: (_field: string, _direction?: string) => {
          const arr = Array.from(store.values());
          return createQueryObj(colName, arr);
        },
        limit: (num: number) => {
          const arr = Array.from(store.values());
          return createQueryObj(colName, arr.slice(0, num));
        },
        get: async () => {
          const arr = Array.from(store.values());
          return {
            docs: arr.map(item => ({
              id: (item.id as string) || "gen_id",
              exists: true,
              data: () => item
            })),
            empty: arr.length === 0
          };
        },
        add: async (data: Record<string, unknown>) => {
          const id = `generated_${crypto.randomBytes(8).toString("hex")}`;
          store.set(id, { id, ...data });
          return { id, get: async () => ({ id, exists: true, data: () => store.get(id) }) };
        }
      };
    },

    getAll: async (...refs: Array<{ get: () => Promise<unknown> }>) => {
      return Promise.all(refs.map(ref => ref.get()));
    },

    batch: () => {
      const operations: Array<() => Promise<void>> = [];
      return {
        set: (ref: { set: (d: Record<string, unknown>, o?: { merge?: boolean }) => Promise<void> }, data: Record<string, unknown>, options?: { merge?: boolean }) => {
          operations.push(() => ref.set(data, options));
        },
        update: (ref: { update: (d: Record<string, unknown>) => Promise<void> }, data: Record<string, unknown>) => {
          operations.push(() => ref.update(data));
        },
        delete: (ref: { delete: () => Promise<void> }) => {
          operations.push(() => ref.delete());
        },
        commit: async () => {
          await Promise.all(operations.map(op => op()));
        }
      };
    },

    runTransaction: async <T>(updateFunction: (transaction: {
      get: (refOrQuery: { get: () => Promise<unknown> }) => Promise<unknown>;
      getAll: (...refs: Array<{ get: () => Promise<unknown> }>) => Promise<unknown[]>;
      set: (ref: { set: (d: Record<string, unknown>, o?: { merge?: boolean }) => Promise<void> }, data: Record<string, unknown>, options?: { merge?: boolean }) => Promise<void>;
      update: (ref: { update: (d: Record<string, unknown>) => Promise<void> }, data: Record<string, unknown>) => Promise<void>;
      delete: (ref: { delete: () => Promise<void> }) => Promise<void>;
    }) => Promise<T>) => {
      const mockTransaction = {
        get: async (refOrQuery: { get: () => Promise<unknown> }) => {
          if (typeof refOrQuery.get === "function") {
            return refOrQuery.get();
          }
          return refOrQuery;
        },
        getAll: async (...refs: Array<{ get: () => Promise<unknown> }>) => {
          return Promise.all(refs.map(ref => ref.get()));
        },
        set: async (ref: { set: (d: Record<string, unknown>, o?: { merge?: boolean }) => Promise<void> }, data: Record<string, unknown>, options?: { merge?: boolean }) => {
          await ref.set(data, options);
        },
        update: async (ref: { update: (d: Record<string, unknown>) => Promise<void> }, data: Record<string, unknown>) => {
          await ref.update(data);
        },
        delete: async (ref: { delete: () => Promise<void> }) => {
          await ref.delete();
        }
      };
      return updateFunction(mockTransaction);
    }
  };

  const firestoreFn = Object.assign(() => mockDb, {
    FieldValue: mockFieldValue
  });

  return {
    db: mockDb,
    admin: {
      apps: [1],
      firestore: firestoreFn,
      auth: () => ({
        verifyIdToken: async (token: string) => {
          if (token === "valid-buyer-token") {
            return { uid: "buyer_test_user_1", email: "buyer1@olmart.dz", role: "buyer" };
          }
          if (token === "valid-seller-token") {
            return { uid: "seller_test_user_1", email: "seller1@olmart.dz", role: "seller" };
          }
          if (token === "valid-admin-token") {
            return { uid: "admin_test_user_1", email: "admin1@olmart.dz", role: "admin" };
          }
          throw new Error("Token de vérification invalide ou expiré");
        },
        setCustomUserClaims: async (uid: string, claims: { role?: string; isAdmin?: boolean }) => {
          const existing = userStore.get(uid) || {};
          userStore.set(uid, { ...existing, customClaims: claims });
        }
      })
    },
    isFirebaseReady: () => true,
    getFirebaseInitState: () => "READY",
    getFirebaseInitError: () => null,
    FirebaseInitState: { READY: "READY", FAILED: "FAILED" },
  };
});

// Import real app instance now that firebase-admin mock is hoisted
import { app } from "../../app";

describe("OLMART Premier Marketplace — E2E Core Integration Flows", () => {
  const CHARGILY_TEST_SECRET = "test_chargily_webhook_secret_key_654321_32bytes";
  const BARIDIMOB_TEST_SECRET = "test_baridimob_webhook_secret_key_654321_32bytes";

  beforeEach(() => {
    resetStores();
    process.env.NODE_ENV = "test";
    process.env.SKIP_RATE_LIMITS = "true";
    process.env.CHARGILY_WEBHOOK_SECRET = CHARGILY_TEST_SECRET;
    process.env.BARIDIMOB_WEBHOOK_SECRET = BARIDIMOB_TEST_SECRET;

    // Spy on global fetch to completely decouple product search from container backend
    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/api/v1/products")) {
        return new Response(JSON.stringify({ products: Array.from(productStore.values()) }), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });
  });

  // ===========================================================================
  // 1. AUTHENTICATION & ONBOARDING FLOW
  // ===========================================================================
  describe("A. Authentication & Onboarding Integration Flow", () => {
    it("fails with 401 Unauthorized if auth header is missing or invalid", async () => {
      const res = await request(app)
        .post("/api/v1/auth/onboard")
        .send({
          name: "Mohamed Belkacem",
          phone: "0550123456",
          wilaya: "16 Alger",
          address: "12 Rue Didouche Mourad",
          role: "buyer"
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain("Authentification requise");
    });

    it("fails with 400 Bad Request if mandatory onboarding fields are missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/onboard")
        .set("Authorization", "Bearer valid-buyer-token")
        .send({
          name: "Mohamed Belkacem"
          // Missing phone, wilaya, address, role
        });

      expect(res.status).toBe(400);
    });

    it("successfully onboards buyer, updates claims & stores profile in DB", async () => {
      const res = await request(app)
        .post("/api/v1/auth/onboard")
        .set("Authorization", "Bearer valid-buyer-token")
        .send({
          name: "Mohamed Belkacem",
          phone: "0550123456",
          wilaya: "16 Alger",
          address: "12 Rue Didouche Mourad",
          role: "buyer"
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Onboarding completed successfully");

      const savedUser = must(userStore.get("buyer_test_user_1"), "savedUser");
      expect(savedUser.displayName).toBe("Mohamed Belkacem");
      expect(savedUser.role).toBe("buyer");
      expect(savedUser.onboardingCompleted).toBe(true);
    });

    it("fails and fail-closes client-driven privilege escalation attempt to Admin", async () => {
      // Setup current database state as standard user
      userStore.set("buyer_test_user_1", {
        uid: "buyer_test_user_1",
        email: "buyer1@olmart.dz",
        role: "buyer"
      });

      const res = await request(app)
        .post("/api/v1/auth/onboard")
        .set("Authorization", "Bearer valid-buyer-token")
        .send({
          name: "Mohamed Belkacem",
          phone: "0550123456",
          wilaya: "16 Alger",
          address: "12 Rue Didouche Mourad",
          role: "admin" // Escalation attempt!
        });

      expect(res.status).toBe(200); // Standard route succeeds but sanitizes roles!
      
      const savedUser = must(userStore.get("buyer_test_user_1"), "savedUser");
      expect(savedUser.role).toBe("buyer"); // Kept buyer
      const customClaims = savedUser.customClaims as Record<string, unknown> | undefined;
      expect(customClaims?.role).toBe("buyer"); // Claims restricted to buyer
      expect(customClaims?.isAdmin).toBe(false); // Restricts admin privileges
    });
  });

  // ===========================================================================
  // 2. PRODUCT SEARCH & TEXT NORMALIZATION FLOW
  // ===========================================================================
  describe("B. Product Search & Text Normalization Flow", () => {
    it("returns correctly filtered search result for simple matching query", async () => {
      const res = await request(app)
        .get("/api/v1/search?q=Asus")
        .set("host", "localhost"); // CSRF exemption

      expect(res.status).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].name).toContain("Asus Zenbook");
    });

    it("performs robust text normalization and transliteration matches", async () => {
      // "Kaftan Traditionnel Algérien ة" has Teh Marbuta "ة" and accent
      // We will search with "kaftan" and check that it matches
      const res = await request(app)
        .get("/api/v1/search?q=kaftan")
        .set("host", "localhost");

      expect(res.status).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].id).toBe("prod_arabic_kaftan");
    });

    it("correctly filters products by price boundaries and categories", async () => {
      // Filter Asus Zenbook (price: 150000) with price boundaries [100000, 200000]
      const res = await request(app)
        .get("/api/v1/search?minPrice=100000&maxPrice=200000")
        .set("host", "localhost");

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].id).toBe("prod_asus");
    });
  });

  // ===========================================================================
  // 3. CHECKOUT & ATOMIC ORDER PLACEMENT
  // ===========================================================================
  describe("C. Checkout & Atomic Order Placement Flow", () => {
    it("rejects order placement with empty cart (400)", async () => {
      const res = await request(app)
        .post("/api/v1/place-order")
        .set("host", "localhost")
        .set("Authorization", "Bearer valid-buyer-token")
        .send({
          cart: [],
          shippingAddress: {
            fullName: "Mohamed Belkacem",
            phone: "0550123456",
            wilaya: "16 Alger",
            commune: "Sidi M'Hamed",
            address: "12 Rue Didouche Mourad"
          },
          deliveryMethod: "domicile"
        });

      expect(res.status).toBe(400);
    });

    it("rejects order placement with insufficient stock and produces descriptive error", async () => {
      const res = await request(app)
        .post("/api/v1/place-order")
        .set("host", "localhost")
        .set("Authorization", "Bearer valid-buyer-token")
        .send({
          cart: [
            { id: "prod_asus", sellerId: "seller_test_1", quantity: 10 } // Only 5 in stock!
          ],
          shippingAddress: {
            fullName: "Mohamed Belkacem",
            phone: "0550123456",
            wilaya: "16 Alger",
            commune: "Sidi M'Hamed",
            address: "12 Rue Didouche Mourad"
          },
          deliveryMethod: "domicile"
        });

      expect(res.status).toBe(400); // Standard business logic error mapped to 400
      expect(res.body.error).toContain("Stock insuffisant");
    });

    it("successfully checks out valid cart, decrements stock, and validates calculated pricing structures", async () => {
      // Real shipping rate for 16 Alger is 500 DA, subtotal for 2 Asus Zenbooks is 300000 DA.
      const res = await request(app)
        .post("/api/v1/place-order")
        .set("host", "localhost")
        .set("Authorization", "Bearer valid-buyer-token")
        .send({
          cart: [
            { id: "prod_asus", sellerId: "seller_test_1", quantity: 2 }
          ],
          shippingAddress: {
            fullName: "Mohamed Belkacem",
            phone: "0550123456",
            wilaya: "16 Alger",
            commune: "Sidi M'Hamed",
            address: "12 Rue Didouche Mourad"
          },
          deliveryMethod: "domicile"
        });

      expect(res.status).toBe(200);
      expect(res.body.orderId).toBeDefined();

      // Confirm stock was decremented correctly from 5 to 3
      const asusInDb = must(productStore.get("prod_asus"), "asusInDb");
      expect(asusInDb.stock).toBe(3);

      // Confirm order document was recorded with precise status and totals
      const savedOrder = must(orderStore.get(res.body.orderId), "savedOrder");
      expect(savedOrder.status?.toUpperCase()).toBe("PENDING");
      expect(savedOrder.subtotal).toBe(300000);
      expect(savedOrder.shippingTotal).toBe(600); // exact from ALGERIA_SHIPPING_DATA for "16 Alger"
      expect(savedOrder.total).toBe(300600);
    });
  });

  // ===========================================================================
  // 4. PAYMENTS & ESCROW MUTATIONS
  // ===========================================================================
  describe("D. Webhook Payments & Escrow Integration Flow", () => {
    let orderIdForPayment: string;

    beforeEach(async () => {
      // Prep order in database to be paid
      orderIdForPayment = "ord_to_pay_1234";
      orderStore.set(orderIdForPayment, {
        id: orderIdForPayment,
        buyerId: "buyer_test_user_1",
        sellerId: "seller_test_1",
        subtotal: 150000,
        shippingFee: 500,
        total: 150500,
        status: "PENDING",
        paymentStatus: "PENDING"
      });
    });

    it("rejects webhook request with invalid HMAC signature header (401)", async () => {
      const payloadObj = {
        id: "evt_fraud_999",
        type: "checkout.paid",
        data: {
          id: "chk_fraud",
          status: "paid",
          amount: 150500,
          metadata: { orderId: orderIdForPayment }
        }
      };

      const res = await request(app)
        .post("/api/v1/payment/webhook/chargily")
        .set("x-chargily-signature", "invalid_signature_hex_code_123456")
        .set("Content-Type", "application/json")
        .send(payloadObj);

      expect(res.status).toBe(401);
      expect(res.body.error).toContain("Signature de webhook invalide");
    });

    it("processes authentic signature, transitions order to PROCESSING / PAID, logs webhook, and holds escrow hold", async () => {
      const payloadObj = {
        id: "evt_chargily_valid_777",
        type: "checkout.paid",
        data: {
          id: "chk_chargily_777",
          status: "paid",
          amount: 150500,
          metadata: {
            orderId: orderIdForPayment,
            buyerId: "buyer_test_user_1",
            sellerId: "seller_test_1"
          }
        }
      };

      const rawBody = JSON.stringify(payloadObj);
      const signature = crypto.createHmac("sha256", CHARGILY_TEST_SECRET).update(rawBody).digest("hex");

      const res = await request(app)
        .post("/api/v1/payment/webhook/chargily")
        .set("x-chargily-signature", signature)
        .set("Content-Type", "application/json")
        .send(rawBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify Order updated state atomically
      const updatedOrder = must(orderStore.get(orderIdForPayment), "updatedOrder");
      expect(updatedOrder.status).toBe("PROCESSING");
      expect(updatedOrder.paymentStatus).toBe("PAID");

      // Verify Idempotency Log is recorded to prevent replay attack
      const webhookLog = must(webhookLogStore.get("evt_chargily_valid_777"), "webhookLog");
      expect(webhookLog.processed).toBe(true);

      // Verify Escrow Hold is created successfully
      const escrowRecord = must(escrowStore.get(orderIdForPayment), "escrowRecord");
      expect(escrowRecord.status).toBe("HELD");
      expect(escrowRecord.totalAmountDZD).toBe(150500);
    });

    it("successfully releases held escrow funds to seller's wallet upon delivery confirmation", async () => {
      // Establish an escrow holding record in DB
      escrowStore.set(orderIdForPayment, {
        id: orderIdForPayment,
        orderId: orderIdForPayment,
        buyerId: "buyer_test_user_1",
        sellerId: "seller_test_1",
        totalAmountDZD: 150500,
        sellerPayoutAmountDZD: 142975, // Total minus 5% fee
        status: "HELD"
      });

      // Establish wallet for seller
      walletStore.set("seller_test_1", {
        sellerId: "seller_test_1",
        availableBalanceDZD: 1000,
        pendingEscrowBalanceDZD: 0,
        totalEarningsDZD: 0,
        currency: "DZD"
      });

      const res = await request(app)
        .post(`/api/v1/payment/escrow/release/${orderIdForPayment}`)
        .set("host", "localhost")
        .set("Authorization", "Bearer valid-buyer-token") // Verified buyer trigger
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Confirm escrow status transitions to RELEASED
      const escrowObj = must(escrowStore.get(orderIdForPayment), "escrowObj");
      expect(escrowObj.status).toBe("RELEASED");

      // Confirm seller's wallet is credited
      const walletObj = must(walletStore.get("seller_test_1"), "walletObj");
      expect(walletObj.availableBalanceDZD).toBeGreaterThan(1000);
    });
  });
});
