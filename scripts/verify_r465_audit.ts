import { admin } from "../src/config/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

async function runAudit() {
  console.log("================================================================================");
  console.log("             🟢 R4.6.5 MARKETPLACE FIRESTORE SECURITY AUDIT SUITE               ");
  console.log("================================================================================");

  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "ai-studio-217f6d79-c758-4e14-845d-737228cd3915";
  const databaseId = "(default)";
  const restBaseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;

  // 1. Prepare Test Identities
  const buyer1Uid = "audit-buyer-r465-1";
  const buyer2Uid = "audit-buyer-r465-2";
  const sellerAUid = "audit-seller-r465-A";
  const sellerBUid = "audit-seller-r465-B";

  // Create Custom Tokens & Fetch ID Tokens
  async function getIdToken(uid: string, claims: Record<string, string | number | boolean>): Promise<string> {
    const customToken = await admin.auth().createCustomToken(uid, claims);
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    });
    const data = await res.json();
    return data.idToken;
  }

  const buyer1Token = await getIdToken(buyer1Uid, { role: "buyer" });
  const sellerAToken = await getIdToken(sellerAUid, { role: "seller" });

  console.log("Tokens generated successfully for test identities.");

  // Seed baseline test documents via Admin SDK on (default) database
  const db = getFirestore(admin.app(), "(default)");

  // User docs in Firestore
  await db.collection("users").doc(buyer1Uid).set({
    uid: buyer1Uid,
    email: "buyer1@olmart.dz",
    role: "buyer",
    status: "active",
    isVerified: false,
    trustScore: 50,
  });

  await db.collection("users").doc(buyer2Uid).set({
    uid: buyer2Uid,
    email: "buyer2@olmart.dz",
    role: "buyer",
    status: "active",
    isVerified: false,
    trustScore: 50,
  });

  await db.collection("users").doc(sellerAUid).set({
    uid: sellerAUid,
    email: "sellerA@olmart.dz",
    role: "seller",
    status: "active",
    isVerified: true,
    trustScore: 90,
    commissionRate: 10,
    shopName: "Boutique Seller A",
  });

  await db.collection("users").doc(sellerBUid).set({
    uid: sellerBUid,
    email: "sellerB@olmart.dz",
    role: "seller",
    status: "active",
    isVerified: true,
    trustScore: 85,
    commissionRate: 12,
    shopName: "Boutique Seller B",
  });

  // Seed Product A (owned by sellerA) and Product B (owned by sellerB)
  const productAId = "PROD-AUDIT-R465-A";
  const productBId = "PROD-AUDIT-R465-B";

  await db.collection("products").doc(productAId).set({
    id: productAId,
    sellerId: sellerAUid,
    sellerName: "Boutique Seller A",
    name: "Produit A Test Security",
    price: 5000,
    status: "approved",
    rating: 4.8,
    reviewsCount: 10,
    salesCount: 50,
    sellerTrustScore: 90,
    isSponsored: false,
  });

  await db.collection("products").doc(productBId).set({
    id: productBId,
    sellerId: sellerBUid,
    sellerName: "Boutique Seller B",
    name: "Produit B Test Security",
    price: 12000,
    status: "approved",
    rating: 4.5,
    reviewsCount: 5,
    salesCount: 20,
    sellerTrustScore: 85,
    isSponsored: false,
  });

  // Seed Order A (buyer1 + sellerA) and Order B (buyer2 + sellerB)
  const orderAId = "ORDER-AUDIT-R465-A";
  const orderBId = "ORDER-AUDIT-R465-B";

  await db.collection("orders").doc(orderAId).set({
    id: orderAId,
    userId: buyer1Uid,
    buyerId: buyer1Uid,
    buyerName: "Buyer One",
    buyerPhone: "0550112233",
    sellerIds: [sellerAUid],
    items: [{ productId: productAId, name: "Produit A", price: 5000, quantity: 1 }],
    totalAmount: 5000,
    status: "PAID",
    createdAt: new Date().toISOString(),
  });

  await db.collection("orders").doc(orderBId).set({
    id: orderBId,
    userId: buyer2Uid,
    buyerId: buyer2Uid,
    buyerName: "Buyer Two",
    buyerPhone: "0550445566",
    sellerIds: [sellerBUid],
    items: [{ productId: productBId, name: "Produit B", price: 12000, quantity: 1 }],
    totalAmount: 12000,
    status: "PAID",
    createdAt: new Date().toISOString(),
  });

  console.log("Baseline documents seeded via Admin SDK for testing.");

  // HTTP Helper
  async function restCall(
    method: string,
    path: string,
    token: string | null,
    body?: unknown
  ): Promise<{ status: number; data: Record<string, unknown> }> {
    const url = `${restBaseUrl}${path}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: res.status, data };
  }

  const results: Array<{ id: string; name: string; method: string; identity: string; doc: string; status: number; result: string; proof: string; verdict: "PASS" | "FAIL" | "BLOCKED" }> = [];

  function logResult(
    id: string,
    name: string,
    method: string,
    identity: string,
    doc: string,
    status: number,
    expectedBehavior: "ALLOW" | "DENY",
    proof: string
  ) {
    let verdict: "PASS" | "FAIL" | "BLOCKED" = "FAIL";
    if (expectedBehavior === "ALLOW" && (status >= 200 && status < 300)) {
      verdict = "PASS";
    } else if (expectedBehavior === "DENY" && (status === 403 || status === 400 || status === 401)) {
      verdict = "PASS";
    }

    const resStr = status >= 200 && status < 300 ? `ALLOWED (${status})` : `DENIED (${status})`;
    results.push({ id, name, method, identity, doc, status, result: resStr, proof, verdict });
    console.log(`[${verdict}] ${id} — ${name} | Status: ${status} | Result: ${resStr}`);
  }

  console.log("\n=================== SECTION 2: AUDIT PRODUCTS ===================");

  // TEST-P01: Visiteur anonyme -> lecture produit
  const p01 = await restCall("GET", `/products/${productAId}`, null);
  logResult("TEST-P01", "Visiteur anonyme -> lecture produit", "GET", "Anonymous", `/products/${productAId}`, p01.status, "ALLOW", `Doc name: ${p01.data?.fields?.name?.stringValue || "N/A"}`);

  // TEST-P02: Client authentifié -> lecture produit public
  const p02 = await restCall("GET", `/products/${productAId}`, buyer1Token);
  logResult("TEST-P02", "Client authentifié -> lecture produit public", "GET", "Buyer1", `/products/${productAId}`, p02.status, "ALLOW", `Doc price: ${p02.data?.fields?.price?.integerValue || "N/A"}`);

  // TEST-P03: Vendeur A -> modification produit vendeur B
  const p03 = await restCall("PATCH", `/products/${productBId}?updateMask.fieldPaths=name`, sellerAToken, {
    fields: { name: { stringValue: "Hacked by Seller A" } }
  });
  logResult("TEST-P03", "Vendeur A -> modification produit vendeur B", "PATCH", "SellerA", `/products/${productBId}`, p03.status, "DENY", p03.data?.error?.message || "Denied");

  // TEST-P04: Vendeur A -> suppression produit vendeur B
  const p04 = await restCall("DELETE", `/products/${productBId}`, sellerAToken);
  logResult("TEST-P04", "Vendeur A -> suppression produit vendeur B", "DELETE", "SellerA", `/products/${productBId}`, p04.status, "DENY", p04.data?.error?.message || "Denied");

  // TEST-P05: Vendeur A -> modification de son propre produit (status reset required if modifying name)
  const p05 = await restCall("PATCH", `/products/${productAId}?updateMask.fieldPaths=name&updateMask.fieldPaths=status`, sellerAToken, {
    fields: {
      sellerId: { stringValue: sellerAUid },
      name: { stringValue: "Produit A Modifié Par Seller A" },
      price: { integerValue: 5000 },
      status: { stringValue: "pending" },
      rating: { doubleValue: 4.8 },
      reviewsCount: { integerValue: 10 },
      salesCount: { integerValue: 50 },
      sellerTrustScore: { integerValue: 90 },
      isSponsored: { booleanValue: false }
    }
  });
  logResult("TEST-P05", "Vendeur A -> modification de son propre produit", "PATCH", "SellerA", `/products/${productAId}`, p05.status, "ALLOW", "Updated successfully with status pending");

  // TEST-P06: Vendeur A -> création d'un produit avec sellerId appartenant à vendeur B
  const p06 = await restCall("POST", `/products?documentId=PROD-SPOOF-B`, sellerAToken, {
    fields: {
      sellerId: { stringValue: sellerBUid },
      name: { stringValue: "Produit Spoofed" },
      price: { integerValue: 1000 },
      status: { stringValue: "pending" }
    }
  });
  logResult("TEST-P06", "Vendeur A -> création produit avec sellerId de Vendeur B", "POST", "SellerA", "/products", p06.status, "DENY", p06.data?.error?.message || "Denied");

  // TEST-P07: Vendeur A -> modification forcée du sellerId de son propre produit
  const p07 = await restCall("PATCH", `/products/${productAId}?updateMask.fieldPaths=sellerId`, sellerAToken, {
    fields: {
      sellerId: { stringValue: sellerBUid },
      name: { stringValue: "Produit A" },
      price: { integerValue: 5000 },
      status: { stringValue: "pending" }
    }
  });
  logResult("TEST-P07", "Vendeur A -> modification forcée du sellerId de son produit", "PATCH", "SellerA", `/products/${productAId}`, p07.status, "DENY", p07.data?.error?.message || "Denied");

  // TEST-P08: Vendeur -> modification forcée de champs sensibles (rating, salesCount, isSponsored)
  const p08 = await restCall("PATCH", `/products/${productAId}?updateMask.fieldPaths=rating&updateMask.fieldPaths=isSponsored`, sellerAToken, {
    fields: {
      sellerId: { stringValue: sellerAUid },
      name: { stringValue: "Produit A" },
      price: { integerValue: 5000 },
      status: { stringValue: "pending" },
      rating: { doubleValue: 5.0 },
      isSponsored: { booleanValue: true }
    }
  });
  logResult("TEST-P08", "Vendeur -> modification forcée rating / isSponsored", "PATCH", "SellerA", `/products/${productAId}`, p08.status, "DENY", p08.data?.error?.message || "Denied");


  console.log("\n=================== SECTION 3: AUDIT ORDERS ===================");

  // TEST-O01: Client A -> lecture commande client B
  const o01 = await restCall("GET", `/orders/${orderBId}`, buyer1Token);
  logResult("TEST-O01", "Client A -> lecture commande client B", "GET", "Buyer1", `/orders/${orderBId}`, o01.status, "DENY", o01.data?.error?.message || "Denied");

  // TEST-O02: Client A -> modification commande client B
  const o02 = await restCall("PATCH", `/orders/${orderBId}?updateMask.fieldPaths=status`, buyer1Token, {
    fields: { status: { stringValue: "cancelled_by_client" } }
  });
  logResult("TEST-O02", "Client A -> modification commande client B", "PATCH", "Buyer1", `/orders/${orderBId}`, o02.status, "DENY", o02.data?.error?.message || "Denied");

  // TEST-O03: Client A -> modification du buyerId/userId de sa propre commande
  const o03 = await restCall("PATCH", `/orders/${orderAId}?updateMask.fieldPaths=userId`, buyer1Token, {
    fields: { userId: { stringValue: buyer2Uid } }
  });
  logResult("TEST-O03", "Client A -> modification userId de sa propre commande", "PATCH", "Buyer1", `/orders/${orderAId}`, o03.status, "DENY", o03.data?.error?.message || "Denied");

  // TEST-O04: Client -> modification du prix de sa propre commande
  const o04 = await restCall("PATCH", `/orders/${orderAId}?updateMask.fieldPaths=totalAmount`, buyer1Token, {
    fields: { totalAmount: { integerValue: 0 } }
  });
  logResult("TEST-O04", "Client -> modification du prix de la commande", "PATCH", "Buyer1", `/orders/${orderAId}`, o04.status, "DENY", o04.data?.error?.message || "Denied");

  // TEST-O05: Client -> modification du sellerId
  const o05 = await restCall("PATCH", `/orders/${orderAId}?updateMask.fieldPaths=sellerIds`, buyer1Token, {
    fields: { sellerIds: { arrayValue: { values: [{ stringValue: sellerBUid }] } } }
  });
  logResult("TEST-O05", "Client -> modification du sellerId de la commande", "PATCH", "Buyer1", `/orders/${orderAId}`, o05.status, "DENY", o05.data?.error?.message || "Denied");

  // TEST-O06: Client -> modification du statut de commande non autorisée (ex: status = "DELIVERED")
  const o06 = await restCall("PATCH", `/orders/${orderAId}?updateMask.fieldPaths=status`, buyer1Token, {
    fields: { status: { stringValue: "DELIVERED" } }
  });
  logResult("TEST-O06", "Client -> modification du statut vers DELIVERED", "PATCH", "Buyer1", `/orders/${orderAId}`, o06.status, "DENY", o06.data?.error?.message || "Denied");

  // TEST-O07: Vendeur A -> lecture commande appartenant uniquement au vendeur B
  const o07 = await restCall("GET", `/orders/${orderBId}`, sellerAToken);
  logResult("TEST-O07", "Vendeur A -> lecture commande du vendeur B", "GET", "SellerA", `/orders/${orderBId}`, o07.status, "DENY", o07.data?.error?.message || "Denied");

  // TEST-O08: Vendeur A -> modification d'une commande du vendeur B
  const o08 = await restCall("PATCH", `/orders/${orderBId}?updateMask.fieldPaths=trackingNumber`, sellerAToken, {
    fields: { trackingNumber: { stringValue: "TRACK-HACK" } }
  });
  logResult("TEST-O08", "Vendeur A -> modification commande du vendeur B", "PATCH", "SellerA", `/orders/${orderBId}`, o08.status, "DENY", o08.data?.error?.message || "Denied");

  // TEST-O09: Vendeur -> modification du montant total / commission sur sa propre commande
  const o09 = await restCall("PATCH", `/orders/${orderAId}?updateMask.fieldPaths=totalAmount`, sellerAToken, {
    fields: { totalAmount: { integerValue: 0 } }
  });
  logResult("TEST-O09", "Vendeur -> modification du montant total de la commande", "PATCH", "SellerA", `/orders/${orderAId}`, o09.status, "DENY", o09.data?.error?.message || "Denied");

  // TEST-O10: Utilisateur non autorisé -> suppression d'une commande
  const o10 = await restCall("DELETE", `/orders/${orderAId}`, buyer1Token);
  logResult("TEST-O10", "Utilisateur non-admin -> suppression d'une commande", "DELETE", "Buyer1", `/orders/${orderAId}`, o10.status, "DENY", o10.data?.error?.message || "Denied");


  console.log("\n=================== SECTION 4: AUDIT SELLERS ===================");

  // TEST-S01: Vendeur A -> modification du profil vendeur B (collection users)
  const s01 = await restCall("PATCH", `/users/${sellerBUid}?updateMask.fieldPaths=shopName`, sellerAToken, {
    fields: { shopName: { stringValue: "Defaced Shop B" } }
  });
  logResult("TEST-S01", "Vendeur A -> modification du profil vendeur B (/users)", "PATCH", "SellerA", `/users/${sellerBUid}`, s01.status, "DENY", s01.data?.error?.message || "Denied");

  // TEST-S02: Vendeur -> modification de son verificationStatus / isVerified
  const s02 = await restCall("PATCH", `/users/${sellerAUid}?updateMask.fieldPaths=isVerified`, sellerAToken, {
    fields: { isVerified: { booleanValue: true } }
  });
  logResult("TEST-S02", "Vendeur -> modification directe de son statut isVerified", "PATCH", "SellerA", `/users/${sellerAUid}`, s02.status, "DENY", s02.data?.error?.message || "Denied");

  // TEST-S03: Vendeur -> modification de son rôle
  const s03 = await restCall("PATCH", `/users/${sellerAUid}?updateMask.fieldPaths=role`, sellerAToken, {
    fields: { role: { stringValue: "admin" } }
  });
  logResult("TEST-S03", "Vendeur -> modification de son propre rôle vers admin", "PATCH", "SellerA", `/users/${sellerAUid}`, s03.status, "DENY", s03.data?.error?.message || "Denied");

  // TEST-S04: Vendeur -> modification de son owner/user UID
  const s04 = await restCall("PATCH", `/users/${sellerAUid}?updateMask.fieldPaths=uid`, sellerAToken, {
    fields: { uid: { stringValue: "hacked-uid" } }
  });
  logResult("TEST-S04", "Vendeur -> modification de son UID dans users", "PATCH", "SellerA", `/users/${sellerAUid}`, s04.status, "DENY", s04.data?.error?.message || "Denied");

  // TEST-S05: Vendeur -> modification de sa commissionRate
  const s05 = await restCall("PATCH", `/users/${sellerAUid}?updateMask.fieldPaths=commissionRate`, sellerAToken, {
    fields: { commissionRate: { integerValue: 0 } }
  });
  logResult("TEST-S05", "Vendeur -> modification de sa commissionRate", "PATCH", "SellerA", `/users/${sellerAUid}`, s05.status, "DENY", s05.data?.error?.message || "Denied");

  // TEST-S06: Client -> modification d'un document seller dans /sellers/{sellerId} ou /users/{sellerId}
  const s06a = await restCall("PATCH", `/sellers/${sellerAUid}?updateMask.fieldPaths=shopName`, buyer1Token, {
    fields: { shopName: { stringValue: "Buyer Defaced" } }
  });
  logResult("TEST-S06a", "Client -> modification d'un profil vendeur (/sellers)", "PATCH", "Buyer1", `/sellers/${sellerAUid}`, s06a.status, "DENY", String((s06a.data?.error as Record<string, unknown>)?.message || "Denied"));
  const s06b = await restCall("PATCH", `/users/${sellerAUid}?updateMask.fieldPaths=shopName`, buyer1Token, {
    fields: { shopName: { stringValue: "Buyer Defaced" } }
  });
  logResult("TEST-S06b", "Client -> modification d'un profil vendeur (/users)", "PATCH", "Buyer1", `/users/${sellerAUid}`, s06b.status, "DENY", String((s06b.data?.error as Record<string, unknown>)?.message || "Denied"));


  console.log("\n=================== SECTION 5: AUDIT USERS ===================");

  // TEST-U01: Utilisateur -> modification de son propre rôle vers admin via Client SDK / REST
  const u01 = await restCall("PATCH", `/users/${buyer1Uid}?updateMask.fieldPaths=role`, buyer1Token, {
    fields: { role: { stringValue: "admin" } }
  });
  logResult("TEST-U01", "Utilisateur -> élévation de rôle vers admin (/users/update)", "PATCH", "Buyer1", `/users/${buyer1Uid}`, u01.status, "DENY", u01.data?.error?.message || "Denied");

  // TEST-U02: Utilisateur -> modification non autorisée de son commissionRate
  const u02 = await restCall("PATCH", `/users/${buyer1Uid}?updateMask.fieldPaths=commissionRate`, buyer1Token, {
    fields: { commissionRate: { integerValue: 0 } }
  });
  logResult("TEST-U02", "Utilisateur -> modification directe du commissionRate", "PATCH", "Buyer1", `/users/${buyer1Uid}`, u02.status, "DENY", String((u02.data?.error as Record<string, unknown>)?.message || "Denied"));

  // TEST-U03: Utilisateur -> modification de isVerified / trustScore
  const u03 = await restCall("PATCH", `/users/${buyer1Uid}?updateMask.fieldPaths=trustScore`, buyer1Token, {
    fields: { trustScore: { integerValue: 100 } }
  });
  logResult("TEST-U03", "Utilisateur -> modification directe du trustScore", "PATCH", "Buyer1", `/users/${buyer1Uid}`, u03.status, "DENY", u03.data?.error?.message || "Denied");

  // TEST-U04: Utilisateur A -> lecture du document /users/{userB_uid}
  const u04 = await restCall("GET", `/users/${buyer2Uid}`, buyer1Token);
  logResult("TEST-U04", "Utilisateur A -> lecture du profil privé /users/{buyer2Uid}", "GET", "Buyer1", `/users/${buyer2Uid}`, u04.status, "DENY", u04.data?.error?.message || "Denied");

  // TEST-U05: Utilisateur -> création directe d'un compte /users/{uid} avec role = admin
  const spoofAdminUid = "audit-spoof-admin-uid";
  const spoofAdminToken = await getIdToken(spoofAdminUid, { role: "buyer" });
  const u05 = await restCall("POST", `/users?documentId=${spoofAdminUid}`, spoofAdminToken, {
    fields: {
      uid: { stringValue: spoofAdminUid },
      email: { stringValue: "spoofadmin@olmart.dz" },
      role: { stringValue: "admin" },
      status: { stringValue: "active" }
    }
  });
  logResult("TEST-U05", "Utilisateur -> création directe d'un compte avec role = admin", "POST", "BuyerSpoof", `/users/${spoofAdminUid}`, u05.status, "DENY", u05.data?.error?.message || "Denied");

  console.log("\n================================================================================");
  console.log("                           AUDIT SUMMARY TABLE                                 ");
  console.log("================================================================================");
  console.table(results.map(r => ({
    ID: r.id,
    Name: r.name,
    Method: r.method,
    Identity: r.identity,
    Status: r.status,
    Result: r.result,
    Verdict: r.verdict
  })));

  const passCount = results.filter(r => r.verdict === "PASS").length;
  const failCount = results.filter(r => r.verdict === "FAIL").length;
  const blockedCount = results.filter(r => r.verdict === "BLOCKED").length;

  console.log(`\nTOTAL TESTS: ${results.length}`);
  console.log(`PASS: ${passCount}`);
  console.log(`FAIL: ${failCount}`);
  console.log(`BLOCKED: ${blockedCount}`);
  console.log(`FINAL VERDICT: ${failCount === 0 && blockedCount === 0 ? "GO" : "NO-GO"}`);
}

runAudit().catch(console.error);
