import { db } from "../src/config/firebase-admin";

async function cleanupFakeData() {
  console.log("================================================================================");
  console.log("             🧹 OLMART DATABASE CLEANUP — REMOVING FAKE DATA                    ");
  console.log("================================================================================");

  let deletedUsers = 0;
  let deletedPublicProfiles = 0;
  let deletedProducts = 0;

  // 1. Clean Users & PublicProfiles
  const usersSnap = await db.collection("users").get();
  console.log(`Analyzing ${usersSnap.docs.length} users...`);

  for (const doc of usersSnap.docs) {
    const data = doc.data() || {};
    const email = (data.email || "").toLowerCase();
    const name = (data.displayName || data.name || data.shopName || "").toLowerCase();
    const uid = doc.id;

    const isFake =
      name.includes("load test") ||
      name.includes("test merchant") ||
      name.includes("fake") ||
      name.includes("dummy") ||
      name.includes("mock") ||
      email.includes("loadtest") ||
      email.includes("testmerchant") ||
      email.includes("mock") ||
      email.includes("fake@");

    if (isFake) {
      console.log(`🗑️ Deleting fake user: [${uid}] ${name} (${email})`);
      await db.collection("users").doc(uid).delete();
      deletedUsers++;

      // Delete associated publicProfile if exists
      const pubDoc = await db.collection("publicProfiles").doc(uid).get();
      if (pubDoc.exists) {
        await db.collection("publicProfiles").doc(uid).delete();
        deletedPublicProfiles++;
      }

      // Delete products belonging to this fake seller
      const sellerProds = await db.collection("products").where("sellerId", "==", uid).get();
      for (const p of sellerProds.docs) {
        console.log(`   🗑️ Deleting fake seller product: [${p.id}] ${p.data()?.title}`);
        await db.collection("products").doc(p.id).delete();
        deletedProducts++;
      }
    }
  }

  // 2. Clean orphaned or fake publicProfiles
  const pubSnap = await db.collection("publicProfiles").get();
  for (const doc of pubSnap.docs) {
    const data = doc.data() || {};
    const name = (data.shopName || data.name || "").toLowerCase();
    if (name.includes("load test") || name.includes("test merchant") || name.includes("fake")) {
      console.log(`🗑️ Deleting fake publicProfile: [${doc.id}] ${name}`);
      await db.collection("publicProfiles").doc(doc.id).delete();
      deletedPublicProfiles++;
    }
  }

  // 3. Clean fake/test products
  const prodsSnap = await db.collection("products").get();
  console.log(`Analyzing ${prodsSnap.docs.length} products...`);

  for (const doc of prodsSnap.docs) {
    const data = doc.data() || {};
    const title = (data.title || data.name || "").toLowerCase();
    const description = (data.description || "").toLowerCase();

    const isFakeProduct =
      title.includes("test product") ||
      title.includes("load test") ||
      title.includes("fake") ||
      title.includes("dummy") ||
      description.includes("load test generated");

    if (isFakeProduct) {
      console.log(`🗑️ Deleting fake product: [${doc.id}] ${data.title}`);
      await db.collection("products").doc(doc.id).delete();
      deletedProducts++;
    }
  }

  console.log("================================================================================");
  console.log(`✅ CLEANUP COMPLETED:`);
  console.log(`   - Deleted Fake Users: ${deletedUsers}`);
  console.log(`   - Deleted Fake Public Profiles: ${deletedPublicProfiles}`);
  console.log(`   - Deleted Fake Products: ${deletedProducts}`);
  console.log("================================================================================");
}

cleanupFakeData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  });
