import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// In-memory Firestore store for tests
const mockUsersDb = new Map<string, Record<string, unknown>>();
const mockPublicProfilesDb = new Map<string, Record<string, unknown>>();
let firestoreShouldThrow = false;

vi.mock("../config/firebase-admin", () => {
  const dbMock = {
    collection: (colName: string) => {
      return {
        doc: (docId: string) => ({
          get: async () => {
            if (firestoreShouldThrow) {
              throw new Error("Firestore connection failure");
            }
            if (colName === "users") {
              const data = mockUsersDb.get(docId);
              return {
                id: docId,
                exists: Boolean(data),
                data: () => data,
              };
            }
            if (colName === "publicProfiles") {
              const data = mockPublicProfilesDb.get(docId);
              return {
                id: docId,
                exists: Boolean(data),
                data: () => data,
              };
            }
            return {
              id: docId,
              exists: false,
              data: () => undefined,
            };
          },
        }),
      };
    },
  };

  return {
    db: dbMock,
    admin: {
      firestore: {
        FieldValue: {
          serverTimestamp: () => new Date(),
        },
      },
    },
  };
});

// Import the router under test
import shopPublicRouter from "../domains/seller/shopPublic.routes";

const app = express();
app.use(express.json());
app.use(shopPublicRouter);

describe("GET /api/v1/public/shops/:sellerId - Public Shop Security and Whitelist DTO", () => {
  beforeEach(() => {
    mockUsersDb.clear();
    mockPublicProfilesDb.clear();
    firestoreShouldThrow = false;
  });

  // 1. VENDEUR PUBLIABLE : Réponse 200 avec les champs publics attendus
  it("Scenario 1: returns 200 with standard public shop fields for an active eligible seller", async () => {
    const sellerId = "seller_active_001";
    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Artisanale Alger",
      displayName: "Karim Artisan",
      wilaya: "16 - Alger",
      commune: "Bab El Oued",
      isVerified: true,
      rating: 4.8,
      reviewsCount: 42,
      sellerTrustScore: 95,
      productsCount: 15,
      legalStatus: "Artisan Enregistré",
      avgPreparationTime: "24h",
      returnPolicy: "Retours sous 7 jours",
      supportPhone: "0555123456",
    });

    mockPublicProfilesDb.set(sellerId, {
      shopName: "Boutique Artisanale Alger",
      slogan: "L'artisanat authentique algérien",
      description: "Des créations uniques faites à la main.",
      logoUrl: "https://storage.olmart.dz/shops/logo1.jpg",
      bannerUrl: "https://storage.olmart.dz/shops/banner1.jpg",
      category: "Artisanat",
      categories: ["Artisanat", "Décoration"],
      status: "ACTIVE",
      followersCount: 120,
    });

    const res = await request(app).get(`/api/v1/public/shops/${sellerId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.shop).toBeDefined();
    expect(res.body.shop.id).toBe(sellerId);
    expect(res.body.shop.sellerId).toBe(sellerId);
    expect(res.body.shop.shopName).toBe("Boutique Artisanale Alger");
    expect(res.body.shop.slogan).toBe("L'artisanat authentique algérien");
    expect(res.body.shop.description).toBe("Des créations uniques faites à la main.");
    expect(res.body.shop.logoUrl).toBe("https://storage.olmart.dz/shops/logo1.jpg");
    expect(res.body.shop.bannerUrl).toBe("https://storage.olmart.dz/shops/banner1.jpg");
    expect(res.body.shop.wilaya).toBe("16 - Alger");
    expect(res.body.shop.category).toBe("Artisanat");
    expect(res.body.shop.categories).toEqual(["Artisanat", "Décoration"]);
    expect(res.body.shop.isVerified).toBe(true);
    expect(res.body.shop.rating).toBe(4.8);
    expect(res.body.shop.reviewsCount).toBe(42);
    expect(res.body.shop.sellerTrustScore).toBe(95);
    expect(res.body.shop.productsCount).toBe(15);
    expect(res.body.shop.followersCount).toBe(120);
    expect(res.body.shop.supportPhone).toBe("0555123456");
  });

  // 2. DONNÉES PRIVÉES DANS USERS : Placer des valeurs canaris et vérifier l'étanchéité
  it("Scenario 2: strictly excludes all private canary fields present in users document", async () => {
    const sellerId = "seller_with_canaries";
    const canaryEmail = "canary.private.email@olmart-secret.dz";
    const canaryPhone = "0699999999_CANARY_PHONE";
    const canaryRib = "00799999000123456789_CANARY_RIB";
    const canaryNif = "123456789012345_CANARY_NIF";
    const canaryRc = "16/00-1234567B20_CANARY_RC";
    const canaryHash = "$2b$12$CANARY_HASH_PASSWORD_SECRET";
    const canaryNotes = "CANARY_INTERNAL_ADMIN_NOTE_DO_NOT_EXPOSE";
    const canaryCommission = 0.15;
    const canarySecretField = "CANARY_SECRET_TOP_SECRET_VALUE_98765";

    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Sécurisée",
      wilaya: "31 - Oran",
      email: canaryEmail,
      phone: canaryPhone,
      phoneNumber: canaryPhone,
      personalPhone: canaryPhone,
      rib: canaryRib,
      nifNumber: canaryNif,
      rcNumber: canaryRc,
      passwordHash: canaryHash,
      internalNotes: canaryNotes,
      commissionRate: canaryCommission,
      customSecretField: canarySecretField,
      documents: {
        rcDocument: "https://storage.private/doc_rc.pdf",
        idDocument: "https://storage.private/doc_id.pdf",
        ribDocument: "https://storage.private/doc_rib.pdf",
      },
      verification: {
        reviewedBy: "admin_123",
        notes: "Strictly confidential verification dossier",
      },
      capabilities: ["seller_dashboard", "payout_access"],
      fcmTokens: ["fcm_canary_token_secret_123"],
      cart: [{ productId: "prod_1", qty: 2 }],
      billingAddress: {
        street: "123 Rue Secrète",
        building: "Résidence Privée",
      },
    });

    const res = await request(app).get(`/api/v1/public/shops/${sellerId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const serializedResponse = JSON.stringify(res.body);

    // Verify none of the canary values exist anywhere in the payload
    expect(serializedResponse).not.toContain(canaryEmail);
    expect(serializedResponse).not.toContain(canaryPhone);
    expect(serializedResponse).not.toContain(canaryRib);
    expect(serializedResponse).not.toContain(canaryNif);
    expect(serializedResponse).not.toContain(canaryRc);
    expect(serializedResponse).not.toContain(canaryHash);
    expect(serializedResponse).not.toContain(canaryNotes);
    expect(serializedResponse).not.toContain(canarySecretField);
    expect(serializedResponse).not.toContain("https://storage.private/doc_rc.pdf");
    expect(serializedResponse).not.toContain("Strictly confidential");
    expect(serializedResponse).not.toContain("fcm_canary_token_secret_123");
    expect(serializedResponse).not.toContain("123 Rue Secrète");

    // Ensure private keys are not present in shop object
    const shop = res.body.shop;
    expect(shop.email).toBeUndefined();
    expect(shop.phone).toBeUndefined();
    expect(shop.phoneNumber).toBeUndefined();
    expect(shop.rib).toBeUndefined();
    expect(shop.nifNumber).toBeUndefined();
    expect(shop.rcNumber).toBeUndefined();
    expect(shop.documents).toBeUndefined();
    expect(shop.verification).toBeUndefined();
    expect(shop.capabilities).toBeUndefined();
    expect(shop.passwordHash).toBeUndefined();
    expect(shop.internalNotes).toBeUndefined();
    expect(shop.commissionRate).toBeUndefined();
    expect(shop.billingAddress).toBeUndefined();
  });

  // 3. DONNÉES PRIVÉES DANS PUBLICPROFILES : Pollution par des champs inattendus
  it("Scenario 3: strictly filters out unexpected private fields injected into publicProfiles document", async () => {
    const sellerId = "seller_polluted_pub";
    const pubCanarySecret = "CANARY_PUB_SECRET_77777";
    const pubCanaryAudit = "CANARY_AUDIT_NOTE_88888";
    const pubCanaryAdminComment = "CANARY_ADMIN_MODERATION_COMMENT_99999";

    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Pub Clean",
      wilaya: "16 - Alger",
    });

    mockPublicProfilesDb.set(sellerId, {
      shopName: "Boutique Pub Clean",
      description: "Description publique légitime",
      canaryPubSecret: pubCanarySecret,
      secretAuditNote: pubCanaryAudit,
      adminComments: pubCanaryAdminComment,
      arbitraryOwnerToken: "SECRET_OWNER_TOKEN_000",
    });

    const res = await request(app).get(`/api/v1/public/shops/${sellerId}`);

    expect(res.status).toBe(200);
    const serializedResponse = JSON.stringify(res.body);
    expect(serializedResponse).not.toContain(pubCanarySecret);
    expect(serializedResponse).not.toContain(pubCanaryAudit);
    expect(serializedResponse).not.toContain(pubCanaryAdminComment);
    expect(serializedResponse).not.toContain("SECRET_OWNER_TOKEN_000");

    expect(res.body.shop.canaryPubSecret).toBeUndefined();
    expect(res.body.shop.secretAuditNote).toBeUndefined();
    expect(res.body.shop.adminComments).toBeUndefined();
    expect(res.body.shop.arbitraryOwnerToken).toBeUndefined();
  });

  // 4. OBJETS IMBRIQUÉS : Champs inattendus dans des objets
  it("Scenario 4: prevents leakage through raw nested object structures", async () => {
    const sellerId = "seller_nested_injection";
    const nestedCanaryToken = "CANARY_NESTED_TOKEN_ABCD123";

    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Test Imbrique",
      wilaya: "25 - Constantine",
      location: {
        lat: 36.365,
        lng: 6.614,
        secretInternalCoordinatesNote: nestedCanaryToken,
      },
      customObject: {
        token: nestedCanaryToken,
      },
    });

    mockPublicProfilesDb.set(sellerId, {
      shopName: "Boutique Test Imbrique",
      nestedLeakObject: {
        key: nestedCanaryToken,
      },
    });

    const res = await request(app).get(`/api/v1/public/shops/${sellerId}`);

    expect(res.status).toBe(200);
    const serializedResponse = JSON.stringify(res.body);
    expect(serializedResponse).not.toContain(nestedCanaryToken);
    expect(res.body.shop.location).toBeUndefined();
    expect(res.body.shop.customObject).toBeUndefined();
    expect(res.body.shop.nestedLeakObject).toBeUndefined();
  });

  // 5. FAUSSE CERTIFICATION : publicProfiles prétend isVerified: true mais users a isVerified: false ou pending
  it("Scenario 5: rejects false certification claim when users document is not verified by admin", async () => {
    const sellerId = "seller_unverified_claiming_true";

    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Non Certifiée",
      wilaya: "06 - Béjaïa",
      isVerified: false, // Authoritative verification is FALSE
    });

    mockPublicProfilesDb.set(sellerId, {
      shopName: "Boutique Non Certifiée",
      isVerified: true, // Forged claim in publicProfiles
      badge: "Vendeur Officiel Faux",
    });

    const res = await request(app).get(`/api/v1/public/shops/${sellerId}`);

    expect(res.status).toBe(200);
    expect(res.body.shop.isVerified).toBe(false);
    expect(res.body.shop.badge).toBe(""); // Badge suppressed when not verified
  });

  // 6. UID D’UN ACHETEUR : Si role === "customer" ou non-seller, aucun profil n'est exposé (404)
  it("Scenario 6: returns 404 and exposes no data if requested UID belongs to a customer/buyer account", async () => {
    const buyerId = "buyer_user_123";
    mockUsersDb.set(buyerId, {
      role: "customer",
      displayName: "Acheteur Particulier",
      email: "buyer@gmail.com",
      phone: "0770001122",
      status: "active",
    });

    const res = await request(app).get(`/api/v1/public/shops/${buyerId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Boutique non disponible");
    expect(res.body.shop).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain("buyer@gmail.com");
  });

  // 7. UID INEXISTANT : Réponse 404 sans fabriquer de fausse boutique
  it("Scenario 7: returns 404 without fabricating a fake shop for nonexistent UID", async () => {
    const res = await request(app).get("/api/v1/public/shops/nonexistent_seller_9999");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Boutique introuvable");
    expect(res.body.shop).toBeUndefined();
  });

  // 8. ERREUR FIRESTORE : Erreur contrôlée 500 sans faux succès ni détails internes
  it("Scenario 8: returns controlled 500 without leaking stack traces when Firestore fails", async () => {
    firestoreShouldThrow = true;

    const res = await request(app).get("/api/v1/public/shops/some_seller_id");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Erreur lors de la récupération de la boutique");
    expect(res.body.shop).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain("Firestore connection failure");
  });

  // 9. COMPATIBILITÉ FRONTEND : Vérifier les types et champs requis par l'UI
  it("Scenario 9: provides full compatibility with frontend components consuming PublicShopDTO", async () => {
    const sellerId = "seller_fe_compat";
    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      isVerified: true,
      shopName: "Olmart Mode & Style",
      wilaya: "16 - Alger",
      commune: "Hydra",
    });

    mockPublicProfilesDb.set(sellerId, {
      shopName: "Olmart Mode & Style",
      shopDescription: "Prêt-à-porter haut de gamme",
      logoUrl: "https://cdn.olmart.dz/logo.png",
      bannerUrl: "https://cdn.olmart.dz/banner.png",
      category: "Mode",
      categories: ["Mode", "Accessoires"],
    });

    const res = await request(app).get(`/api/v1/public/shops/${sellerId}`);

    expect(res.status).toBe(200);
    const shop = res.body.shop;

    // Verify all keys expected by StoreProfileHeader, StoreAboutView, useStoreProfile, ShopsDirectory
    expect(typeof shop.id).toBe("string");
    expect(typeof shop.sellerId).toBe("string");
    expect(typeof shop.shopName).toBe("string");
    expect(typeof shop.description).toBe("string");
    expect(typeof shop.shopDescription).toBe("string");
    expect(typeof shop.logoUrl).toBe("string");
    expect(typeof shop.bannerUrl).toBe("string");
    expect(typeof shop.wilaya).toBe("string");
    expect(typeof shop.commune).toBe("string");
    expect(typeof shop.category).toBe("string");
    expect(Array.isArray(shop.categories)).toBe(true);
    expect(typeof shop.isVerified).toBe("boolean");
    expect(typeof shop.status).toBe("string");
    expect(typeof shop.avgPreparationTime).toBe("string");
    expect(typeof shop.returnPolicy).toBe("string");
    expect(typeof shop.legalStatus).toBe("string");
    expect(typeof shop.followersCount).toBe("number");
    expect(typeof shop.reviewsCount).toBe("number");
    expect(typeof shop.productsCount).toBe("number");
  });
});
