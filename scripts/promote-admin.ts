import { admin, db } from "../src/config/firebase-admin";

/**
 * Secure Admin Role Management CLI
 * 
 * Usage:
 *   npx tsx scripts/promote-admin.ts --uid=<USER_UID> --role=<admin|superadmin|buyer|seller>
 * 
 * Rules:
 * - Requires explicit UID parameter.
 * - Does NOT accept email as an automatic authorization trigger.
 * - Synchronizes both Firestore `users/{uid}.role` and Firebase Auth Custom Claims.
 */

async function run() {
  const args = process.argv.slice(2);
  let targetUid = "";
  let targetRole = "admin";

  for (const arg of args) {
    if (arg.startsWith("--uid=")) {
      targetUid = arg.replace("--uid=", "").trim();
    } else if (arg.startsWith("--role=")) {
      targetRole = arg.replace("--role=", "").trim();
    }
  }

  if (!targetUid) {
    console.error("❌ ERROR: Missing required parameter --uid=<USER_UID>");
    console.error("Usage: npx tsx scripts/promote-admin.ts --uid=<USER_UID> [--role=admin|superadmin|buyer|seller]");
    process.exit(1);
  }

  const validRoles = ["admin", "superadmin", "buyer", "seller"];
  if (!validRoles.includes(targetRole)) {
    console.error(`❌ ERROR: Invalid role '${targetRole}'. Allowed roles: ${validRoles.join(", ")}`);
    process.exit(1);
  }

  console.log(`[Admin CLI] 🔐 Managing role for target UID: [${targetUid}]`);
  console.log(`[Admin CLI] Target Role: [${targetRole}]`);

  try {
    // 1. Verify user exists in Firebase Auth
    const userRecord = await admin.auth().getUser(targetUid);
    console.log(`[Admin CLI] 👤 Found Firebase Auth user: ${userRecord.email || "No Email"} (UID: ${userRecord.uid})`);

    // 2. Set Custom User Claims in Firebase Auth
    const currentClaims = userRecord.customClaims || {};
    const newClaims = {
      ...currentClaims,
      role: targetRole,
      isAdmin: targetRole === "admin" || targetRole === "superadmin"
    };

    await admin.auth().setCustomUserClaims(targetUid, newClaims);
    console.log(`[Admin CLI] ✅ Firebase Auth Custom Claims updated:`, newClaims);

    // 3. Update Firestore users collection
    const userRef = db.collection("users").doc(targetUid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({
        role: targetRole,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`[Admin CLI] ✅ Firestore document users/${targetUid} updated with role: '${targetRole}'`);
    } else {
      await userRef.set({
        uid: targetUid,
        email: userRecord.email || "",
        displayName: userRecord.displayName || "Admin User",
        role: targetRole,
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`[Admin CLI] ✅ Created Firestore document users/${targetUid} with role: '${targetRole}'`);
    }

    console.log(`[Admin CLI] 🚀 SUCCESS: User [${targetUid}] successfully configured with role '${targetRole}'.`);
    process.exit(0);
  } catch (error: any) {
    console.error(`❌ ERROR while managing admin role:`, error.message);
    process.exit(1);
  }
}

run();
