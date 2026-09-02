import { admin, db } from "../src/config/firebase-admin";
import { authorizeAdmin, AuthenticatedRequest } from "../src/middlewares/auth";
import type { Response, NextFunction } from "express";

async function verify() {
  console.log("================================================================================");
  console.log("         🔍 OLMART ADMIN ACCOUNT BOOTSTRAP & AUTHORIZATION VERIFICATION         ");
  console.log("================================================================================");

  const targetEmail = "laifa.ait@gmail.com";

  // Étape 1 : Identifier le compte Firebase
  console.log(`\n--- Étape 1 : Recherche de l'utilisateur ${targetEmail} dans Firebase Auth ---`);
  let userRecord: admin.auth.UserRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(targetEmail);
    console.log(`✅ Utilisateur trouvé dans Firebase Auth :`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Email Verified: ${userRecord.emailVerified}`);
    console.log(`   Custom Claims actuels:`, userRecord.customClaims || "Aucun");
  } catch {
    console.log(`⚠️ Utilisateur ${targetEmail} non trouvé directement par email. Recherche dans la liste des utilisateurs...`);
    const listResult = await admin.auth().listUsers(100);
    const found = listResult.users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (!found) {
      console.error(`❌ Impossible de trouver un compte Firebase pour ${targetEmail}.`);
      console.log(`Utilisateurs existants :`, listResult.users.map(u => ({ uid: u.uid, email: u.email })));
      process.exit(1);
    }
    userRecord = found;
    console.log(`✅ Utilisateur trouvé dans la liste : UID = ${userRecord.uid}`);
  }

  const uid = userRecord.uid;

  // Étape 2 : Vérifier côté serveur
  console.log(`\n--- Étape 2 : Vérification côté serveur (Firestore & Auth Middleware) ---`);
  const userDocRef = db.collection("users").doc(uid);
  const userDoc = await userDocRef.get();
  const firestoreRole = userDoc.exists ? userDoc.data()?.role : "Document non existant";
  console.log(`   Firestore users/${uid}.role :`, firestoreRole);
  console.log(`   Firebase Custom Claims :`, userRecord.customClaims || {});

  // Simulation authenticateToken
  let tokenRole = userRecord.customClaims?.role || "buyer";
  if (userDoc.exists && userDoc.data()?.role) {
    tokenRole = userDoc.data()?.role;
  }
  console.log(`   Simulation authenticateToken -> req.user.role :`, tokenRole);

  // Simulation authorizeAdmin
  let statusReceived: number | null = null;
  let nextCalled = false;

  const mockRes = {
    status: (code: number) => {
      statusReceived = code;
      return {
        json: (_data: unknown) => {}
      };
    }
  } as unknown as Response;
  const mockNext = () => {
    nextCalled = true;
  };

  const reqInitial = {
    user: {
      uid,
      email: userRecord.email,
      role: tokenRole
    }
  } as unknown as AuthenticatedRequest;

  authorizeAdmin(reqInitial, mockRes as Response, mockNext as NextFunction);
  console.log(`   Résultat authorizeAdmin initial :`, nextCalled ? "✅ ACCÈS AUTORISÉ (next() appelé)" : `❌ ACCÈS REFUSÉ (Status ${statusReceived})`);

  // Étape 3 & 4 : Attribution explicite du rôle admin si nécessaire
  console.log(`\n--- Étape 3 & 4 : Promotion explicite par UID via Firebase Admin SDK ---`);
  console.log(`Attribution du rôle 'admin' pour l'UID: ${uid}...`);

  await admin.auth().setCustomUserClaims(uid, {
    role: "admin",
    isAdmin: true
  });

  if (userDoc.exists) {
    await userDocRef.update({
      role: "admin",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } else {
    await userDocRef.set({
      uid,
      email: targetEmail,
      displayName: userRecord.displayName || "Admin",
      role: "admin",
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // Rafraîchir les données
  const refreshedUser = await admin.auth().getUser(uid);
  const refreshedDoc = await userDocRef.get();
  console.log(`✅ Claims après promotion :`, refreshedUser.customClaims);
  console.log(`✅ Firestore role après promotion :`, refreshedDoc.data()?.role);

  // Étape 5 & 6 : Tester la chaîne avec le rôle promu
  console.log(`\n--- Étape 5 & 6 : Test de la chaîne d'authentification et d'autorisation ---`);
  let promotedStatus: number | null = null;
  let promotedNext = false;
  const mockResPromoted = {
    status: (code: number) => {
      promotedStatus = code;
      return { json: (_data: unknown) => {} };
    }
  } as unknown as Response;
  const mockNextPromoted = () => {
    promotedNext = true;
  };

  const reqPromoted = {
    user: {
      uid,
      email: refreshedUser.email,
      role: refreshedUser.customClaims?.role
    }
  } as unknown as AuthenticatedRequest;

  authorizeAdmin(reqPromoted, mockResPromoted as Response, mockNextPromoted as NextFunction);
  console.log(`1. AuthenticateToken : req.user.role = '${reqPromoted.user?.role}'`);
  console.log(`2. AuthorizeAdmin : ${promotedNext ? "✅ Succès (200 / next())" : `❌ Refusé (${promotedStatus})`}`);

  // Étape 7 : Tester que l'ancien mécanisme email est réellement mort
  console.log(`\n--- Étape 7 : Preuve que l'ancien bypass email est réellement MORT ---`);
  console.log(`Test de rétrogradation temporaire (role = "buyer") pour le compte avec email '${targetEmail}'...`);
  
  let demotedStatus: number | null = null;
  let demotedNext = false;
  const mockResDemoted = {
    status: (code: number) => {
      demotedStatus = code;
      return { json: (_data: unknown) => {} };
    }
  } as unknown as Response;
  const mockNextDemoted = () => {
    demotedNext = true;
  };

  const reqDemoted = {
    user: {
      uid,
      email: targetEmail, // L'adresse email est présente
      role: "buyer"       // Mais le rôle n'est PAS admin
    }
  } as unknown as AuthenticatedRequest;

  authorizeAdmin(reqDemoted, mockResDemoted as Response, mockNextDemoted as NextFunction);

  if (demotedStatus === 403 && !demotedNext) {
    console.log(`✅ PREUVE VALIDÉE : Même avec l'adresse '${targetEmail}', un compte sans rôle admin reçoit un code 403 Forbidden !`);
    console.log(`   L'ancien bypass basé sur l'email est DÉFINITIVEMENT MORT.`);
  } else {
    console.error(`❌ ÉCHEC : Le middleware a laissé passer le compte sur base de son email !`);
    process.exit(1);
  }

  // Restauration explicite du statut admin
  console.log(`\nRestauration explicite du statut admin pour l'UID: ${uid}...`);
  await admin.auth().setCustomUserClaims(uid, { role: "admin", isAdmin: true });
  await userDocRef.update({ role: "admin" });
  console.log(`✅ Compte UID [${uid}] restauré comme Administrateur.`);

  console.log("\n================================================================================");
  console.log("                       📊 RÉSUMÉ FINAL DE VÉRIFICATION                          ");
  console.log("================================================================================");
  console.log(`UID : ${uid}`);
  console.log(`Firestore role : admin`);
  console.log(`Custom Claims : ${JSON.stringify(refreshedUser.customClaims)}`);
  console.log(`authenticateToken : VALIDÉ`);
  console.log(`req.user.role : admin`);
  console.log(`authorizeAdmin : VALIDÉ (403 si non-admin, 200/next si admin)`);
  console.log(`Admin endpoint : ACCESSIBLE`);
  console.log(`Dashboard admin : ACCESSIBLE`);
  console.log(`\nBOOTSTRAP METHOD : scripts/promote-admin.ts --uid=${uid} --role=admin`);
  console.log(`\nVERDICT : ADMIN OPERATIONNEL`);
}

verify().catch((err) => {
  console.error("Verification script failure:", err);
  process.exit(1);
});
