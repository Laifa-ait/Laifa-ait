import express from "express";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, vi, MockInstance } from "vitest";
import { admin, db } from "../config/firebase-admin";
import workspaceRouter from "../routes/workspace";
import adminWorkspaceRouter from "../routes/adminWorkspace";

// 1. MOCK GOOGLE WORKSPACE APIS (Zero External Network Calls)
const { mockSpreadsheetCreate, mockValuesUpdate, mockBatchUpdate } = vi.hoisted(() => {
  return {
    mockSpreadsheetCreate: vi.fn().mockResolvedValue({
      data: {
        spreadsheetId: "sheet_id_mock_12345",
        spreadsheetUrl: "https://docs.google.com/spreadsheets/d/sheet_id_mock_12345/edit",
        sheets: [{ properties: { sheetId: 0 } }],
      },
    }),
    mockValuesUpdate: vi.fn().mockResolvedValue({}),
    mockBatchUpdate: vi.fn().mockResolvedValue({}),
  };
});

vi.mock("@googleapis/sheets", () => {
  return {
    sheets: vi.fn().mockReturnValue({
      spreadsheets: {
        create: mockSpreadsheetCreate,
        values: {
          update: mockValuesUpdate,
        },
        batchUpdate: mockBatchUpdate,
      },
    }),
    auth: {
      OAuth2: function (this: unknown) {
        return {
          setCredentials: vi.fn(),
        };
      },
    },
  };
});

vi.mock("@googleapis/drive", () => ({
  drive: vi.fn().mockReturnValue({
    files: {
      create: vi.fn().mockResolvedValue({ data: { id: "mock-drive-id" } }),
    },
  }),
}));

vi.mock("@googleapis/calendar", () => ({
  calendar: vi.fn().mockReturnValue({
    events: {
      insert: vi.fn().mockResolvedValue({ data: { id: "mock-calendar-id" } }),
    },
  }),
}));

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use("/api/v1/workspace", workspaceRouter);
app.use(adminWorkspaceRouter);

describe("Workspace Google Sheets Export Premium Adversarial BOLA/IDOR Security Suite (P2-02)", () => {
  const sellerAUid = "seller_a_sheets_uid_101";
  const sellerBUid = "seller_b_sheets_uid_202";
  const adminUid = "admin_sheets_uid_999";

  let verifyTokenSpy: MockInstance;

  beforeAll(async () => {
    // Seed users in Firestore so auth & role checks succeed
    if (db) {
      await db.collection("users").doc(sellerAUid).set({
        role: "seller",
        email: "sellerA@olmart.dz",
        shopName: "Boutique Seller A",
      });
      await db.collection("users").doc(sellerBUid).set({
        role: "seller",
        email: "sellerB@olmart.dz",
        shopName: "Boutique Seller B",
      });
      await db.collection("users").doc(adminUid).set({
        role: "admin",
        email: "admin@olmart.dz",
      });

      // Seed order for seller B in orders collection
      await db.collection("orders").doc("order_seller_b_100").set({
        sellerId: sellerBUid,
        sellerIds: [sellerBUid],
        total: 25000,
        status: "DELIVERED",
        createdAt: new Date().toISOString(),
      });
    }

    verifyTokenSpy = vi.spyOn(admin.auth(), "verifyIdToken");
  });

  afterAll(async () => {
    if (db) {
      await db.collection("users").doc(sellerAUid).delete();
      await db.collection("users").doc(sellerBUid).delete();
      await db.collection("users").doc(adminUid).delete();
      await db.collection("orders").doc("order_seller_b_100").delete();
    }
    vi.restoreAllMocks();
  });

  // A. ATTAQUE INTER-VENDEURS (BOLA / IDOR)
  it("A. ADVERSARIAL BOLA ATTACK: sellerA attempts to query sellerB's workspace orders -> HTTP 403 Forbidden", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: sellerAUid,
      email: "sellerA@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .get("/api/v1/admin/workspace/orders")
      .query({ targetSeller: sellerBUid })
      .set("Authorization", "Bearer token-seller-a")
      .set("x-google-token", "valid-google-token-seller-a");

    expect(res.status).toBe(403);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain("Privilèges Administrateur requis");
    expect(mockSpreadsheetCreate).not.toHaveBeenCalled();
  });

  // B. PROPRETÉ D'OWNERSHIP (Legitimate Seller Export)
  it("B. LEGITIMATE SELLER EXPORT: sellerA exports their own report -> HTTP 200 OK & Data Masking applied", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: sellerAUid,
      email: "sellerA@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    mockSpreadsheetCreate.mockClear();
    mockValuesUpdate.mockClear();

    const payload = {
      title: "RAPPORT_VENTES_SELLER_A",
      headers: ["Date", "Order ID", "Client Email", "Client Phone", "Total DZD"],
      rows: [
        ["2026-08-21", "ORD-101", "client.secret@gmail.com", "0550123456", 15000],
      ],
      metadata: [
        ["RAPPORT DE VENTES", "ID Vendeur", sellerAUid, "Période", "30 jours"],
      ],
      totals: [["TOTAL", "", "", "", 15000]],
      theme: { headerColor: { red: 0.1, green: 0.6, blue: 0.4 }, isRtl: false },
    };

    const res = await request(app)
      .post("/api/v1/workspace/sheets/export-premium")
      .set("Authorization", "Bearer token-seller-a")
      .set("x-google-token", "mock-google-token-seller-a")
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.spreadsheetId).toBe("sheet_id_mock_12345");
    expect(res.body.spreadsheetUrl).toBeDefined();

    // Verify Google Sheets mock was called once
    expect(mockSpreadsheetCreate).toHaveBeenCalledTimes(1);
    expect(mockValuesUpdate).toHaveBeenCalledTimes(1);

    // Verify server-side email and phone masking was performed on rows
    const updateCall = mockValuesUpdate.mock.calls[0][0];
    const writtenValues = updateCall.requestBody.values;
    // Row 2 is values row: ["2026-08-21", "ORD-101", "cli***@gmail.com", "05***56", 15000]
    const maskedRow = writtenValues.find((row: unknown[]) => Array.isArray(row) && row[1] === "ORD-101");
    expect(maskedRow).toBeDefined();
    expect(maskedRow[2]).toBe("cli***@gmail.com");
    expect(maskedRow[3]).toBe("05***56");
  });

  // C. ADMIN LÉGITIME (Admin Exception)
  it("C. LEGITIMATE ADMIN EXPORT: admin fetches sellerB workspace data & exports -> HTTP 200 OK", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: adminUid,
      email: "admin@olmart.dz",
      role: "admin",
    } as unknown as admin.auth.DecodedIdToken);

    mockSpreadsheetCreate.mockClear();

    // 1. Admin queries workspace orders for target sellerB
    const getRes = await request(app)
      .get("/api/v1/admin/workspace/orders")
      .query({ targetSeller: sellerBUid })
      .set("Authorization", "Bearer token-admin");

    expect(getRes.status).toBe(200);
    expect(getRes.body.rawOrders).toBeDefined();

    // 2. Admin exports report to Google Sheets
    const exportRes = await request(app)
      .post("/api/v1/workspace/sheets/export-premium")
      .set("Authorization", "Bearer token-admin")
      .set("x-google-token", "mock-google-token-admin")
      .send({
        title: "ADMIN_EXPORT_SELLER_B",
        headers: ["Date", "Order ID", "Total DZD"],
        rows: [["2026-08-21", "order_seller_b_100", 25000]],
        metadata: [["RAPPORT ADMIN", "Target Seller", sellerBUid]],
      });

    expect(exportRes.status).toBe(200);
    expect(exportRes.body.success).toBe(true);
    expect(mockSpreadsheetCreate).toHaveBeenCalledTimes(1);
  });

  // D. AUTHENTIFICATION (Unauthenticated or Missing Google Token)
  it("D1. AUTHENTICATION REJECTION: call without Bearer token -> HTTP 401 Unauthorized", async () => {
    const res = await request(app)
      .post("/api/v1/workspace/sheets/export-premium")
      .set("x-google-token", "some-google-token")
      .send({ title: "TEST" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it("D2. GOOGLE TOKEN REJECTION: call with Bearer token but missing x-google-token -> HTTP 401 Unauthorized", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: sellerAUid,
      email: "sellerA@olmart.dz",
      role: "seller",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/api/v1/workspace/sheets/export-premium")
      .set("Authorization", "Bearer token-seller-a")
      .send({ title: "TEST" });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("Google access token manquant");
  });
});
