import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// In-memory Firestore store for tests
const mockUsersDb = new Map<string, Record<string, unknown>>();
const mockPublicProfilesDb = new Map<string, Record<string, unknown>>();
let firestoreShouldThrow = false;

vi.mock("../config/firebase-admin", () => {
  const getQueryDocs = (colName: string, roleFilter?: string, limitCount?: number) => {
    if (firestoreShouldThrow) {
      throw new Error("Firestore connection failure");
    }
    const store = colName === "users" ? mockUsersDb : mockPublicProfilesDb;
    let entries = Array.from(store.entries());
    if (roleFilter !== undefined) {
      entries = entries.filter(([, data]) => data.role === roleFilter);
    }
    if (typeof limitCount === "number") {
      entries = entries.slice(0, limitCount);
    }
    return {
      docs: entries.map(([id, data]) => ({
        id,
        exists: true,
        data: () => data,
      })),
    };
  };

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
        where: (field: string, op: string, val: unknown) => {
          const roleFilter = field === "role" && op === "==" && typeof val === "string" ? val : undefined;
          return {
            limit: (n: number) => ({
              get: async () => getQueryDocs(colName, roleFilter, n),
            }),
            get: async () => getQueryDocs(colName, roleFilter),
          };
        },
        limit: (n: number) => ({
          get: async () => getQueryDocs(colName, undefined, n),
        }),
        get: async () => getQueryDocs(colName),
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

describe("GET /api/v1/public/shops/:sellerId - Strict Eligibility, Authoritative State & Whitelist DTO", () => {
  beforeEach(() => {
    mockUsersDb.clear();
    mockPublicProfilesDb.clear();
    firestoreShouldThrow = false;
  });

  // 1. VENDEUR ACTIF APPROUVÉ : Réponse 200 avec les champs publics autorisés
  it("Scenario 1: returns 200 with public shop fields for an active approved seller", async () => {
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
    expect(res.body.shop.badge).toBe("Vendeur Vérifié"); // isVerified -> Vendeur Vérifié
    expect(res.body.shop.productsCount).toBe(15);
    expect(res.body.shop.followersCount).toBe(120);
    expect(res.body.shop.supportPhone).toBeUndefined();
  });

  // 2. USERS ABSENT MAIS PUBLICPROFILES PRÉSENT : Refus strict (404)
  it("Scenario 2: rejects request (404) when users document is absent, even if publicProfiles is active and claims verified", async () => {
    const sellerId = "seller_only_public_profile";
    mockPublicProfilesDb.set(sellerId, {
      shopName: "Boutique Fantome Sans Users",
      status: "ACTIVE",
      isVerified: true,
      sellerTrustScore: 99,
      badge: "Vendeur Certifié Faux",
    });

    const res = await request(app).get(`/api/v1/public/shops/${sellerId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Boutique introuvable");
    expect(res.body.shop).toBeUndefined();
  });

  // 3. RÔLE ABSENT OU VIDE : Refus strict (404)
  it("Scenario 3: rejects request (404) when user role is missing, empty, or not seller", async () => {
    const sellerMissingRole = "seller_missing_role";
    mockUsersDb.set(sellerMissingRole, {
      status: "active",
      shopName: "Boutique Sans Role",
      isVerified: true,
    });

    const res1 = await request(app).get(`/api/v1/public/shops/${sellerMissingRole}`);
    expect(res1.status).toBe(404);
    expect(res1.body.success).toBe(false);
    expect(res1.body.error).toBe("Boutique non disponible");

    const sellerEmptyRole = "seller_empty_role";
    mockUsersDb.set(sellerEmptyRole, {
      role: "   ",
      status: "active",
      shopName: "Boutique Role Espace",
    });

    const res2 = await request(app).get(`/api/v1/public/shops/${sellerEmptyRole}`);
    expect(res2.status).toBe(404);
    expect(res2.body.success).toBe(false);
    expect(res2.body.error).toBe("Boutique non disponible");
  });

  // 4. STATUT ABSENT OU VIDE : Refus strict (404)
  it("Scenario 4: rejects request (404) when user status is missing, empty, or not active/ACTIVE", async () => {
    const sellerMissingStatus = "seller_missing_status";
    mockUsersDb.set(sellerMissingStatus, {
      role: "seller",
      shopName: "Boutique Sans Statut",
      isVerified: true,
    });

    const res1 = await request(app).get(`/api/v1/public/shops/${sellerMissingStatus}`);
    expect(res1.status).toBe(404);
    expect(res1.body.success).toBe(false);
    expect(res1.body.error).toBe("Boutique non disponible");

    const sellerEmptyStatus = "seller_empty_status";
    mockUsersDb.set(sellerEmptyStatus, {
      role: "seller",
      status: "",
      shopName: "Boutique Statut Vide",
    });

    const res2 = await request(app).get(`/api/v1/public/shops/${sellerEmptyStatus}`);
    expect(res2.status).toBe(404);
    expect(res2.body.success).toBe(false);
    expect(res2.body.error).toBe("Boutique non disponible");
  });

  // 5. STATUT PENDING / SUSPENDED / REJECTED : Refus strict (404)
  it("Scenario 5: rejects request (404) when seller status is pending, suspended, or rejected", async () => {
    const pendingSeller = "seller_pending";
    mockUsersDb.set(pendingSeller, {
      role: "seller",
      status: "pending",
      shopName: "Boutique En Attente",
    });

    const resPending = await request(app).get(`/api/v1/public/shops/${pendingSeller}`);
    expect(resPending.status).toBe(404);
    expect(resPending.body.success).toBe(false);
    expect(resPending.body.error).toBe("Boutique non disponible");

    const suspendedSeller = "seller_suspended";
    mockUsersDb.set(suspendedSeller, {
      role: "seller",
      status: "suspended",
      shopName: "Boutique Suspendue",
    });

    const resSuspended = await request(app).get(`/api/v1/public/shops/${suspendedSeller}`);
    expect(resSuspended.status).toBe(404);
    expect(resSuspended.body.success).toBe(false);
    expect(resSuspended.body.error).toBe("Boutique non disponible");

    const rejectedSeller = "seller_rejected";
    mockUsersDb.set(rejectedSeller, {
      role: "seller",
      status: "rejected",
      shopName: "Boutique Rejetée",
    });

    const resRejected = await request(app).get(`/api/v1/public/shops/${rejectedSeller}`);
    expect(resRejected.status).toBe(404);
    expect(resRejected.body.success).toBe(false);
    expect(resRejected.body.error).toBe("Boutique non disponible");
  });

  // 6. PUBLICPROFILES AVEC SCORE OU BADGE FALSIFIÉS : Aucune substitution des valeurs administratives
  it("Scenario 6: strictly prevents publicProfiles from forging trust score, verified status, or badge label", async () => {
    const sellerId = "seller_forging_scores";

    // Authoritative state in users
    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Authentique",
      wilaya: "16 - Alger",
      isVerified: false, // Non vérifié par l'administration
      sellerTrustScore: 50, // Score réel à l'onboarding
    });

    // Falsified claims in client-writable publicProfiles
    mockPublicProfilesDb.set(sellerId, {
      shopName: "Boutique Authentique",
      isVerified: true, // FAUX
      sellerTrustScore: 100, // FAUX
      badge: "Vendeur Officiel Olmart VIP", // FAUX
    });

    const res = await request(app).get(`/api/v1/public/shops/${sellerId}`);

    expect(res.status).toBe(200);
    expect(res.body.shop.isVerified).toBe(false);
    expect(res.body.shop.sellerTrustScore).toBe(50); // Doit refléter le score authoritative de users
    expect(res.body.shop.badge).toBe(""); // Pas de badge si isVerified: false
  });

  // 7. DÉRIVATION DU BADGE CÔTÉ SERVEUR POUR VENDEUR VÉRIFIÉ AVEC TRUST SCORE < 90
  it("Scenario 7: correctly derives 'Vendeur Vérifié' badge when verified but trust score < 90", async () => {
    const sellerId = "seller_verified_standard";
    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Vérifiée Standard",
      isVerified: true,
      sellerTrustScore: 75,
    });

    const res = await request(app).get(`/api/v1/public/shops/${sellerId}`);

    expect(res.status).toBe(200);
    expect(res.body.shop.isVerified).toBe(true);
    expect(res.body.shop.sellerTrustScore).toBe(75);
    expect(res.body.shop.badge).toBe("Vendeur Vérifié");
  });

  // 8. ÉTANCHÉITÉ DES DONNÉES PRIVÉES DANS USERS (CANARIS)
  it("Scenario 8: strictly excludes all private canary fields present in users document", async () => {
    const sellerId = "seller_with_canaries";
    const canaryEmail = "canary.private.email@olmart-secret.dz";
    const canaryPhone = "0699999999_CANARY_PHONE";
    const canaryPhoneNumber = "0699887766_CANARY_PHONE_NUMBER";
    const canaryShopPhone = "0555112233_CANARY_SHOP_PHONE";
    const canarySupportPhone = "0555443322_CANARY_SUPPORT_PHONE";
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
      phoneNumber: canaryPhoneNumber,
      shopPhone: canaryShopPhone,
      supportPhone: canarySupportPhone,
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
    expect(serializedResponse).not.toContain(canaryPhoneNumber);
    expect(serializedResponse).not.toContain(canaryShopPhone);
    expect(serializedResponse).not.toContain(canarySupportPhone);
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
    expect(shop.shopPhone).toBeUndefined();
    expect(shop.supportPhone).toBeUndefined();
    expect(shop.personalPhone).toBeUndefined();
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

  // 9. ÉTANCHÉITÉ DES POLLUTIONS INJECTÉES DANS PUBLICPROFILES
  it("Scenario 9: strictly filters out unexpected private fields injected into publicProfiles document", async () => {
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

  // 10. TEST DE CONTRAT JSON : Vérifier la structure exacte du DTO PublicShopDTO
  it("Scenario 10: validates JSON DTO structure against PublicShopDTO interface contract", async () => {
    const sellerId = "seller_contract_check";
    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      isVerified: true,
      shopName: "Olmart Mode & Style",
      wilaya: "16 - Alger",
      commune: "Hydra",
      sellerTrustScore: 92,
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

    // Verify all keys expected by PublicShopDTO contract
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
    expect(typeof shop.badge).toBe("string");
    expect(shop.badge).toBe("Vendeur Vérifié");
  });

  // 11. GESTION DES ERREURS FIRESTORE (500 CONTRÔLÉ SANS FUITE)
  it("Scenario 11: returns controlled 500 without leaking stack traces or internal logs when Firestore fails", async () => {
    firestoreShouldThrow = true;

    const res = await request(app).get("/api/v1/public/shops/some_seller_id");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Erreur lors de la récupération de la boutique");
    expect(res.body.shop).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain("Firestore connection failure");
  });
});

describe("GET /api/v1/public/shops - Public Directory Strict Eligibility & Whitelist Projection", () => {
  beforeEach(() => {
    mockUsersDb.clear();
    mockPublicProfilesDb.clear();
    firestoreShouldThrow = false;
  });

  it("Scenario 1: returns 200 with list of active approved sellers, correctly projected without leaking private fields", async () => {
    const sellerId = "seller_directory_001";
    const canaryEmail = "canary.dir.email@secret.dz";
    const canaryPhone = "0555998877_CANARY_PHONE";
    const canaryPhoneNumber = "0555112233_CANARY_PHONE_NUMBER";
    const canaryShopPhone = "0555334455_CANARY_SHOP_PHONE";
    const canarySupportPhone = "0555778899_CANARY_SUPPORT_PHONE";
    const canaryRib = "00799999000123456789_CANARY_RIB";
    const canaryNif = "123456789012345_CANARY_NIF";
    const canaryRc = "16/00-1234567B20_CANARY_RC";

    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Alger Centre",
      displayName: "Artisan Alger",
      wilaya: "16 - Alger",
      commune: "Alger Centre",
      isVerified: true,
      sellerTrustScore: 92,
      email: canaryEmail,
      phone: canaryPhone,
      phoneNumber: canaryPhoneNumber,
      shopPhone: canaryShopPhone,
      supportPhone: canarySupportPhone,
      personalPhone: canaryPhone,
      rib: canaryRib,
      nifNumber: canaryNif,
      rcNumber: canaryRc,
    });

    mockPublicProfilesDb.set(sellerId, {
      shopName: "Boutique Alger Centre",
      slogan: "Excellence et tradition",
      description: "Produits artisanaux authentiques",
      logoUrl: "https://storage.olmart.dz/shops/logo_dir.jpg",
      bannerUrl: "https://storage.olmart.dz/shops/banner_dir.jpg",
      category: "Artisanat",
      categories: ["Artisanat"],
      rating: 4.9,
      reviewsCount: 50,
      followersCount: 300,
    });

    const res = await request(app).get("/api/v1/public/shops");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.shops)).toBe(true);
    expect(res.body.shops.length).toBe(1);

    const shop = res.body.shops[0];
    expect(shop.id).toBe(sellerId);
    expect(shop.sellerId).toBe(sellerId);
    expect(shop.shopName).toBe("Boutique Alger Centre");
    expect(shop.slogan).toBe("Excellence et tradition");
    expect(shop.isVerified).toBe(true);
    expect(shop.sellerTrustScore).toBe(92);
    expect(shop.badge).toBe("Vendeur Vérifié");
    expect(shop.rating).toBe(4.9);
    expect(shop.reviewsCount).toBe(50);
    expect(shop.followersCount).toBe(300);
    expect(shop.email).toBeUndefined();
    expect(shop.phone).toBeUndefined();
    expect(shop.phoneNumber).toBeUndefined();
    expect(shop.shopPhone).toBeUndefined();
    expect(shop.supportPhone).toBeUndefined();
    expect(shop.rib).toBeUndefined();

    const jsonStr = JSON.stringify(res.body);
    expect(jsonStr).not.toContain(canaryEmail);
    expect(jsonStr).not.toContain(canaryPhone);
    expect(jsonStr).not.toContain(canaryPhoneNumber);
    expect(jsonStr).not.toContain(canaryShopPhone);
    expect(jsonStr).not.toContain(canarySupportPhone);
    expect(jsonStr).not.toContain(canaryRib);
    expect(jsonStr).not.toContain(canaryNif);
    expect(jsonStr).not.toContain(canaryRc);
  });

  it("Scenario 2: excludes publicProfiles alone that do not have an active seller account in users", async () => {
    // 1. Ghost profile: exists only in publicProfiles
    mockPublicProfilesDb.set("ghost_seller_1", {
      shopName: "Boutique Sans Users",
      status: "ACTIVE",
      isVerified: true,
      sellerTrustScore: 100,
    });

    // 2. Buyer account: exists in users with role 'buyer'
    mockUsersDb.set("buyer_user_1", {
      role: "buyer",
      status: "active",
      displayName: "Client Acheteur",
    });
    mockPublicProfilesDb.set("buyer_user_1", {
      shopName: "Boutique Fausse Buyer",
      status: "ACTIVE",
    });

    // 3. Seller with non-active statuses
    mockUsersDb.set("seller_pending_1", {
      role: "seller",
      status: "pending",
      shopName: "Boutique En Attente",
    });
    mockUsersDb.set("seller_suspended_1", {
      role: "seller",
      status: "suspended",
      shopName: "Boutique Suspendue",
    });
    mockUsersDb.set("seller_rejected_1", {
      role: "seller",
      status: "rejected",
      shopName: "Boutique Rejetée",
    });
    mockUsersDb.set("seller_empty_role_1", {
      role: "",
      status: "active",
      shopName: "Boutique Role Vide",
    });

    const res = await request(app).get("/api/v1/public/shops");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.shops).toEqual([]);
  });

  it("Scenario 3: strictly prevents publicProfiles from forging isVerified, trust score, or badge in directory list", async () => {
    const sellerId = "seller_tamper_attempt";
    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Réelle",
      isVerified: false,
      sellerTrustScore: 45,
    });

    mockPublicProfilesDb.set(sellerId, {
      shopName: "Boutique Réelle",
      isVerified: true, // Attempted forgery
      sellerTrustScore: 100, // Attempted forgery
      badge: "Vendeur VIP Suprême", // Attempted forgery
    });

    const res = await request(app).get("/api/v1/public/shops");

    expect(res.status).toBe(200);
    expect(res.body.shops.length).toBe(1);
    const shop = res.body.shops[0];
    expect(shop.isVerified).toBe(false);
    expect(shop.sellerTrustScore).toBe(45);
    expect(shop.badge).toBe("");
  });

  it("Scenario 4: safely normalizes invalid or NaN rating and reviewsCount", async () => {
    const sellerId = "seller_invalid_metrics";
    mockUsersDb.set(sellerId, {
      role: "seller",
      status: "active",
      shopName: "Boutique Métriques Invalides",
    });

    mockPublicProfilesDb.set(sellerId, {
      shopName: "Boutique Métriques Invalides",
      rating: -10, // Invalid negative
      reviewsCount: NaN, // Invalid NaN
      productsCount: "50", // Invalid string type
      followersCount: -5, // Invalid negative
    });

    const res = await request(app).get("/api/v1/public/shops");

    expect(res.status).toBe(200);
    expect(res.body.shops.length).toBe(1);
    const shop = res.body.shops[0];
    expect(shop.rating).toBeNull();
    expect(shop.reviewsCount).toBe(0);
    expect(shop.productsCount).toBe(0);
    expect(shop.followersCount).toBe(0);
  });

  it("Scenario 5: returns controlled 500 when Firestore fails during directory query (never returns silent empty 200)", async () => {
    firestoreShouldThrow = true;

    const res = await request(app).get("/api/v1/public/shops");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Erreur lors de la récupération des boutiques");
    expect(res.body.shops).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain("Firestore connection failure");
  });
});

describe("GET /api/v1/explore/sellers - Explore Feed Strict Eligibility & Whitelist Projection", () => {
  beforeEach(() => {
    mockUsersDb.clear();
    mockPublicProfilesDb.clear();
    firestoreShouldThrow = false;
  });

  it("Scenario 1: returns 200 with whitelisted sellers array containing only active approved sellers", async () => {
    const validSeller = "seller_explore_001";
    const canaryEmail = "canary.explore.email@secret.dz";
    const canaryPhone = "0555998877_CANARY_PHONE";
    const canaryPhoneNumber = "0555112233_CANARY_PHONE_NUMBER";
    const canaryShopPhone = "0555334455_CANARY_SHOP_PHONE";
    const canarySupportPhone = "0555778899_CANARY_SUPPORT_PHONE";
    const canaryRib = "00799999000123456789_CANARY_RIB";

    mockUsersDb.set(validSeller, {
      role: "seller",
      status: "active",
      shopName: "Boutique Explore",
      wilaya: "31 - Oran",
      isVerified: true,
      email: canaryEmail,
      phone: canaryPhone,
      phoneNumber: canaryPhoneNumber,
      shopPhone: canaryShopPhone,
      supportPhone: canarySupportPhone,
      personalPhone: canaryPhone,
      rib: canaryRib,
    });

    mockPublicProfilesDb.set(validSeller, {
      shopName: "Boutique Explore",
      description: "Description publique",
      category: "Mode",
    });

    // Unapproved user
    mockUsersDb.set("buyer_explore_002", {
      role: "buyer",
      status: "active",
    });

    const res = await request(app).get("/api/v1/explore/sellers");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.sellers)).toBe(true);
    expect(res.body.sellers.length).toBe(1);
    expect(res.body.sellers[0].id).toBe(validSeller);
    expect(res.body.sellers[0].shopName).toBe("Boutique Explore");
    expect(res.body.sellers[0].isVerified).toBe(true);
    expect(res.body.sellers[0].email).toBeUndefined();
    expect(res.body.sellers[0].phone).toBeUndefined();
    expect(res.body.sellers[0].phoneNumber).toBeUndefined();
    expect(res.body.sellers[0].shopPhone).toBeUndefined();
    expect(res.body.sellers[0].supportPhone).toBeUndefined();
    expect(res.body.sellers[0].rib).toBeUndefined();

    const jsonStr = JSON.stringify(res.body);
    expect(jsonStr).not.toContain(canaryEmail);
    expect(jsonStr).not.toContain(canaryPhone);
    expect(jsonStr).not.toContain(canaryPhoneNumber);
    expect(jsonStr).not.toContain(canaryShopPhone);
    expect(jsonStr).not.toContain(canarySupportPhone);
    expect(jsonStr).not.toContain(canaryRib);
  });

  it("Scenario 2: returns controlled 500 when Firestore fails during explore query", async () => {
    firestoreShouldThrow = true;

    const res = await request(app).get("/api/v1/explore/sellers");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Erreur lors de la récupération des vendeurs");
    expect(res.body.sellers).toBeUndefined();
  });
});
