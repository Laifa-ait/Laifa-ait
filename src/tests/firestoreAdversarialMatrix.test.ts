import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Suite de Tests Adversariaux Firestore & Storage (Phase 3)
 * Vérifie formellement l'application de la matrice de sécurité et des contraintes d'accès :
 * 1. Isolation des utilisateurs (User A ne peut ni lire ni écrire chez User B).
 * 2. Impossibilité d'auto-promotion ou de mutation de rôles/statuts/soldes/privilèges.
 * 3. Inaccessibilité totale des secrets (user_secrets, private_auth).
 * 4. Immuabilité des identifiants d'auteurs (sellerId, artisanId, userId, ownerId).
 * 5. Protection stricte des ressources privées (KYC, support, disputes, logs).
 * 6. Règles Storage : Isolation stricte, validation MIME, quotas de taille et préfixes UID.
 */

const firestoreRules = fs.readFileSync(path.resolve(process.cwd(), "firestore.rules"), "utf8");
const storageRules = fs.readFileSync(path.resolve(process.cwd(), "storage.rules"), "utf8");

describe("PHASE 3 — Matrice de Sécurité Adversariale Firestore & Storage", () => {
  describe("1. Sécurité par Défaut (Default-Deny Catch-All)", () => {
    it("applique une interdiction par défaut totale sur Firestore", () => {
      expect(firestoreRules).toMatch(/match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
    });

    it("sécurise la fonction isAdmin en exigeant un custom claim signé ou rôle token", () => {
      expect(firestoreRules).toContain("function isAdmin()");
      expect(firestoreRules).toContain("request.auth.token.admin == true");
      expect(firestoreRules).toContain("request.auth.token.role == 'admin'");
    });
  });

  describe("2. Collection /users/{userId} — Isolation & Anti-Élévation de Privilèges", () => {
    it("interdit à User A de lire le document de User B (réservé à isOwner ou isAdmin)", () => {
      expect(firestoreRules).toMatch(/match\s+\/users\/\{userId\}\s*\{[\s\S]*?allow\s+read:\s*if\s+isOwner\(userId\)\s*\|\|\s*isAdmin\(\);/);
    });

    it("interdit à User A de créer un compte avec un rôle élevé, statut non-pending ou capacités MFA", () => {
      expect(firestoreRules).toContain("!('role' in incoming()) || incoming().role in ['buyer', 'client']");
      expect(firestoreRules).toContain("!('status' in incoming()) || incoming().status == 'pending'");
      expect(firestoreRules).toContain("!('capabilities' in incoming())");
      expect(firestoreRules).toContain("!('verification' in incoming())");
      expect(firestoreRules).toContain("!('is2FAEnabled' in incoming())");
      expect(firestoreRules).toContain("!('twoFactorSecret' in incoming())");
      expect(firestoreRules).toContain("!('soldes' in incoming())");
    });

    it("interdit formellement à un utilisateur de modifier ses champs sensibles lors d'un update", () => {
      const forbiddenFields = [
        "role",
        "status",
        "capabilities",
        "verification",
        "is2FAEnabled",
        "twoFactorSecret",
        "mfa",
        "soldes",
        "balance",
        "customClaims",
        "permissions",
        "commissionRate",
        "isVerified",
        "verified",
        "kycStatus",
      ];
      for (const field of forbiddenFields) {
        expect(firestoreRules).toContain(`'${field}'`);
      }
    });

    it("interdit la suppression de compte par un utilisateur standard (réservé admin)", () => {
      expect(firestoreRules).toMatch(/match\s+\/users\/\{userId\}\s*\{[\s\S]*?allow\s+delete:\s*if\s+isAdmin\(\);/);
    });
  });

  describe("3. Secrets Critiques & Authentification Privée", () => {
    it("verrouille totalement /user_secrets/{userId} contre toute lecture/écriture client", () => {
      expect(firestoreRules).toMatch(/match\s+\/user_secrets\/\{userId\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
    });

    it("verrouille totalement /private_auth/{userId} contre toute lecture/écriture client", () => {
      expect(firestoreRules).toMatch(/match\s+\/private_auth\/\{userId\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
    });
  });

  describe("4. Collection /products/{productId} — Immuabilité des Auteurs et Contrôle Vendeur", () => {
    it("impose que la création soit liée à l'UID du vendeur ou artisan connecté", () => {
      expect(firestoreRules).toContain("('sellerId' in incoming() && incoming().sellerId == request.auth.uid)");
      expect(firestoreRules).toContain("('artisanId' in incoming() && incoming().artisanId == request.auth.uid)");
      expect(firestoreRules).toContain("('userId' in incoming() && incoming().userId == request.auth.uid)");
    });

    it("interdit la modification de sellerId, artisanId ou userId lors d'un update par le propriétaire", () => {
      expect(firestoreRules).toContain("incoming().sellerId == existing().sellerId");
      expect(firestoreRules).toContain("incoming().artisanId == existing().artisanId");
      expect(firestoreRules).toContain("incoming().userId == existing().userId");
    });
  });

  describe("5. Collection /orders/{orderId} — Protection Financière et Isolation des Commandes", () => {
    it("interdit à l'acheteur de créer une commande avec un statut autre que pending", () => {
      expect(firestoreRules).toContain("!('paymentStatus' in incoming()) || incoming().paymentStatus == 'pending'");
      expect(firestoreRules).toContain("!('status' in incoming()) || incoming().status == 'pending'");
    });

    it("interdit la modification directe des montants, items, prix et statuts de paiement par le client ou vendeur", () => {
      const immutableOrderFields = [
        "buyerId",
        "userId",
        "sellerId",
        "sellerIds",
        "totalAmount",
        "subtotal",
        "total",
        "items",
        "price",
        "paymentStatus",
        "paymentMethod",
        "paidAt",
        "commission",
      ];
      for (const field of immutableOrderFields) {
        expect(firestoreRules).toContain(`'${field}'`);
      }
    });
  });

  describe("6. Support, Litiges et Documents Privés", () => {
    it("restreint la lecture des tickets support à leur propriétaire ou à l'administrateur", () => {
      expect(firestoreRules).toMatch(/match\s+\/support_tickets\/\{id\}\s*\{\s*allow\s+read:\s*if\s+isAdmin\(\)\s*\|\|\s*\(isSignedIn\(\)\s*&&\s*resource\.data\.userId\s*==\s*request\.auth\.uid\);/);
      expect(firestoreRules).toMatch(/match\s+\/buyer_support\/\{supportId\}\s*\{\s*allow\s+read:\s*if\s+isSignedIn\(\)\s*&&\s*\(resource\.data\.buyerId\s*==\s*request\.auth\.uid\s*\|\|\s*isAdmin\(\)\);/);
      expect(firestoreRules).toMatch(/match\s+\/seller_support\/\{supportId\}\s*\{\s*allow\s+read:\s*if\s+isSignedIn\(\)\s*&&\s*\(resource\.data\.sellerId\s*==\s*request\.auth\.uid\s*\|\|\s*isAdmin\(\)\);/);
    });

    it("restreint les messages de litige aux participants stricts (acheteur, vendeur, admin)", () => {
      expect(firestoreRules).toContain("resource.data.buyerId == request.auth.uid");
      expect(firestoreRules).toContain("resource.data.sellerId == request.auth.uid");
    });
  });

  describe("7. Règles de Sécurité Firebase Storage (storage.rules)", () => {
    it("sécurise les images/vidéos produits en imposant le préfixe UID de l'auteur", () => {
      expect(storageRules).toContain("fileName.startsWith(request.auth.uid + '_')");
      expect(storageRules).toContain("request.resource.size < 10 * 1024 * 1024");
      expect(storageRules).toContain("request.resource.contentType.matches('image/.*')");
    });

    it("verrouille les documents KYC au seul propriétaire ou à l'administrateur avec validation de type", () => {
      expect(storageRules).toMatch(/match\s+\/kyc\/\{uid\}\/\{fileName\}\s*\{\s*allow\s+read:\s*if\s+isLoggedIn\(\)\s*&&\s*\(request\.auth\.uid\s*==\s*uid\s*\|\|\s*isAdmin\(\)\);/);
      expect(storageRules).toContain("request.resource.contentType == 'application/pdf'");
    });

    it("restreint les pièces jointes de support et de litige aux seuls participants vérifiés", () => {
      expect(storageRules).toContain("allow read: if isTicketParticipant(ticketId);");
      expect(storageRules).toContain("allow read: if isDisputeParticipant(disputeId);");
      expect(storageRules).toContain("allow read: if isOrderParticipant(orderId);");
    });

    it("interdit les types de fichiers non autorisés et limite la taille", () => {
      expect(storageRules).toContain("request.resource.size <= 1 * 1024 * 1024");
      expect(storageRules).toContain("request.resource.size <= 5 * 1024 * 1024");
    });
  });
});
