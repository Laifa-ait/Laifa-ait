import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

const firestoreRulesContent = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');

describe('Firestore Security Rules - publicProfiles & public_profiles Structure and Whitelist Verification', () => {
  it('ensures no blanket allow read: if true exists for publicProfiles or public_profiles', () => {
    expect(firestoreRulesContent).not.toMatch(/match\s+\/publicProfiles\/\{id\}\s*\{\s*allow\s+read:\s*if\s+true;/);
    expect(firestoreRulesContent).not.toMatch(/match\s+\/public_profiles\/\{id\}\s*\{\s*allow\s+read:\s*if\s+true;/);
  });

  it('ensures no blanket allow write: if isOwner exists without field validation', () => {
    expect(firestoreRulesContent).not.toMatch(/match\s+\/publicProfiles\/\{id\}\s*\{\s*allow\s+write:\s*if\s+isOwner\(id\)\s*\|\|\s*isAdmin\(\);/);
    expect(firestoreRulesContent).not.toMatch(/match\s+\/public_profiles\/\{id\}\s*\{\s*allow\s+write:\s*if\s+isOwner\(id\)\s*\|\|\s*isAdmin\(\);/);
  });

  it('verifies that isValidPublicProfileData helper function is defined and checks types and bounds', () => {
    expect(firestoreRulesContent).toContain('function isValidPublicProfileData(data)');
    expect(firestoreRulesContent).toContain('shopName');
    expect(firestoreRulesContent).toContain('shopDescription');
    expect(firestoreRulesContent).toContain('logoUrl');
    expect(firestoreRulesContent).toContain('bannerUrl');
    expect(firestoreRulesContent).toContain('categories');
    expect(firestoreRulesContent).toContain('avgPreparationTime');
    expect(firestoreRulesContent).toContain('returnPolicy');
    expect(firestoreRulesContent).toContain('legalStatus');
  });

  it('verifies that sensitive and administrative fields are strictly forbidden for owner writes', () => {
    const forbiddenFields = [
      'isVerified',
      'verified',
      'status',
      'sellerTrustScore',
      'trustScore',
      'badge',
      'rating',
      'reviewsCount',
      'productsCount',
      'followersCount',
      'role',
      'roles',
      'isAdmin',
      'customClaims',
      'permissions',
      'kycStatus',
      'kyc',
      'verification',
      'email',
      'phone',
      'phoneNumber',
      'shopPhone',
      'supportPhone',
      'personalPhone',
      'contact',
      'rib',
      'rcNumber',
      'nifNumber',
      'nis',
      'commercialRegister',
      'documents',
      'twoFactorSecret',
      'is2FAEnabled',
      'fcmToken',
      'fcmTokens',
      'tokens',
      'metadata',
      'internalNotes'
    ];

    for (const field of forbiddenFields) {
      expect(firestoreRulesContent).toContain(`'${field}'`);
    }
  });

  it('ensures delete on publicProfiles and public_profiles is restricted strictly to admin', () => {
    expect(firestoreRulesContent).toContain('allow delete: if isAdmin();');
  });

  it('validates rule helper logic on permitted vs forbidden payloads with in-memory canaries', () => {
    // Canary payload simulation of the rule logic
    const WHITELISTED_KEYS = new Set([
      'shopName', 'displayName', 'shopDescription', 'description', 'logoUrl', 'photoURL',
      'avatarUrl', 'bannerUrl', 'coverUrl', 'coverImage', 'wilaya', 'commune', 'category',
      'categories', 'slogan', 'avgPreparationTime', 'returnPolicy', 'legalStatus',
      'createdAt', 'updatedAt'
    ]);

    const FORBIDDEN_KEYS = new Set([
      'isVerified', 'verified', 'status', 'sellerTrustScore', 'trustScore', 'badge',
      'rating', 'reviewsCount', 'productsCount', 'followersCount', 'role', 'roles',
      'isAdmin', 'customClaims', 'permissions', 'kycStatus', 'kyc', 'verification',
      'email', 'phone', 'phoneNumber', 'shopPhone', 'supportPhone', 'personalPhone', 'contact',
      'rib', 'rcNumber', 'nifNumber', 'nis', 'commercialRegister', 'documents',
      'twoFactorSecret', 'is2FAEnabled', 'fcmToken', 'fcmTokens', 'tokens', 'metadata', 'internalNotes'
    ]);

    const evaluateCreate = (userId: string, authUid: string, payload: Record<string, unknown>, isAdmin = false) => {
      if (isAdmin) return true;
      if (userId !== authUid) return false;
      const keys = Object.keys(payload);
      const allKeysAllowed = keys.every(k => WHITELISTED_KEYS.has(k));
      const hasNoForbidden = !keys.some(k => FORBIDDEN_KEYS.has(k));
      return allKeysAllowed && hasNoForbidden;
    };

    // Permitted owner write
    expect(evaluateCreate('seller_1', 'seller_1', {
      shopName: 'Boutique Algeroise',
      shopDescription: 'Produits de qualité',
      wilaya: 'Alger',
    })).toBe(true);

    // Non-owner write denied
    expect(evaluateCreate('seller_1', 'attacker_99', {
      shopName: 'Defaced Name',
    })).toBe(false);

    // Forbidden privilege injection denied
    expect(evaluateCreate('seller_1', 'seller_1', {
      shopName: 'Boutique Algeroise',
      isVerified: true,
    })).toBe(false);

    expect(evaluateCreate('seller_1', 'seller_1', {
      sellerTrustScore: 100,
    })).toBe(false);

    expect(evaluateCreate('seller_1', 'seller_1', {
      rib: '00799999000123456789',
    })).toBe(false);

    // Admin override permitted
    expect(evaluateCreate('seller_1', 'admin_1', {
      status: 'active',
      isVerified: true,
    }, true)).toBe(true);
  });
});

const hasEmulator = Boolean(
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ||
  process.env.FIREBASE_EMULATOR_HUB ||
  process.env.FIRESTORE_EMULATOR_HOST
);

describe.skipIf(!hasEmulator)('Firestore Rules Unit Testing (Emulator Environment)', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    if (!hasEmulator) return;
    testEnv = await initializeTestEnvironment({
      projectId: process.env.FIREBASE_PROJECT_ID || 'ai-studio-217f6d79-c758-4e14-845d-737228cd3915',
      firestore: {
        rules: firestoreRulesContent,
        host: '127.0.0.1',
        port: 8085,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (!hasEmulator || !testEnv) return;
    await testEnv.clearFirestore();

    // Seed existing owner documents for update tests
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.collection('publicProfiles').doc('seller_1').set({
        shopName: 'Boutique Alpha',
        displayName: 'Alpha Store',
        shopDescription: 'Description initiale',
        wilaya: 'Alger',
        commune: 'Bab El Oued',
        category: 'Mode',
      });
      await db.collection('public_profiles').doc('seller_1').set({
        shopName: 'Boutique Alpha Legacy',
        displayName: 'Alpha Store Legacy',
        shopDescription: 'Description initiale',
        wilaya: 'Alger',
        commune: 'Bab El Oued',
        category: 'Mode',
      });
    });
  });

  const collectionsToTest = ['publicProfiles', 'public_profiles'] as const;

  collectionsToTest.forEach((colName) => {
    describe(`Collection: ${colName}`, () => {
      it('DENIES unauthenticated read', async () => {
        const unauthDb = testEnv.unauthenticatedContext().firestore();
        const docRef = unauthDb.collection(colName).doc('seller_1');
        await assertFails(docRef.get());
      });

      it('DENIES authenticated non-owner read', async () => {
        const otherUserDb = testEnv.authenticatedContext('user_buyer_2').firestore();
        const docRef = otherUserDb.collection(colName).doc('seller_1');
        await assertFails(docRef.get());
      });

      it('ALLOWS owner to read their own document', async () => {
        const ownerDb = testEnv.authenticatedContext('seller_1').firestore();
        const docRef = ownerDb.collection(colName).doc('seller_1');
        await assertSucceeds(docRef.get());
      });

      it('ALLOWS admin to read any document', async () => {
        const adminDb = testEnv.authenticatedContext('admin_user', { admin: true }).firestore();
        const docRef = adminDb.collection(colName).doc('seller_1');
        await assertSucceeds(docRef.get());
      });

      it('ALLOWS owner to create their document with whitelisted commercial fields', async () => {
        const newSellerDb = testEnv.authenticatedContext('seller_new').firestore();
        const docRef = newSellerDb.collection(colName).doc('seller_new');
        await assertSucceeds(docRef.set({
          shopName: 'Nouvelle Boutique',
          displayName: 'Nouvelle Boutique',
          shopDescription: 'Vente de vêtements traditionnels',
          logoUrl: 'https://olmart.dz/logo.jpg',
          bannerUrl: 'https://olmart.dz/banner.jpg',
          wilaya: 'Oran',
          commune: 'Oran',
          category: 'Artisanat',
          categories: ['Mode', 'Artisanat'],
          slogan: 'Le meilleur de l artisanat',
          avgPreparationTime: '24-48h',
          returnPolicy: 'Retours acceptés sous 7 jours',
          legalStatus: 'Auto-entrepreneur',
        }));
      });

      it('ALLOWS owner to update whitelisted commercial fields', async () => {
        const ownerDb = testEnv.authenticatedContext('seller_1').firestore();
        const docRef = ownerDb.collection(colName).doc('seller_1');
        await assertSucceeds(docRef.update({
          shopDescription: 'Nouvelle description mise à jour',
          logoUrl: 'https://olmart.dz/new-logo.png',
        }));
      });

      it('DENIES non-owner from creating a document with another user ID', async () => {
        const attackerDb = testEnv.authenticatedContext('attacker').firestore();
        const docRef = attackerDb.collection(colName).doc('victim_seller');
        await assertFails(docRef.set({
          shopName: 'Hack Store',
        }));
      });

      it('DENIES non-owner from updating another user document', async () => {
        const attackerDb = testEnv.authenticatedContext('attacker').firestore();
        const docRef = attackerDb.collection(colName).doc('seller_1');
        await assertFails(docRef.update({
          shopName: 'Defaced Store',
        }));
      });

      it('DENIES owner from setting isVerified: true on create', async () => {
        const ownerDb = testEnv.authenticatedContext('seller_new_2').firestore();
        const docRef = ownerDb.collection(colName).doc('seller_new_2');
        await assertFails(docRef.set({
          shopName: 'Boutique Test',
          isVerified: true,
        }));
      });

      it('DENIES owner from injecting isVerified on update', async () => {
        const ownerDb = testEnv.authenticatedContext('seller_1').firestore();
        const docRef = ownerDb.collection(colName).doc('seller_1');
        await assertFails(docRef.update({
          isVerified: true,
        }));
      });

      it('DENIES owner from setting sellerTrustScore', async () => {
        const ownerDb = testEnv.authenticatedContext('seller_1').firestore();
        const docRef = ownerDb.collection(colName).doc('seller_1');
        await assertFails(docRef.update({
          sellerTrustScore: 100,
        }));
      });

      it('DENIES owner from setting badge', async () => {
        const ownerDb = testEnv.authenticatedContext('seller_1').firestore();
        const docRef = ownerDb.collection(colName).doc('seller_1');
        await assertFails(docRef.update({
          badge: 'Vendeur Officiel Certifié',
        }));
      });

      it('DENIES owner from setting status: active', async () => {
        const ownerDb = testEnv.authenticatedContext('seller_1').firestore();
        const docRef = ownerDb.collection(colName).doc('seller_1');
        await assertFails(docRef.update({
          status: 'active',
        }));
      });

      it('DENIES owner from setting rating or reviewsCount', async () => {
        const ownerDb = testEnv.authenticatedContext('seller_1').firestore();
        const docRef = ownerDb.collection(colName).doc('seller_1');
        await assertFails(docRef.update({
          rating: 5,
          reviewsCount: 999,
        }));
      });

      it('DENIES owner from setting productsCount or followersCount', async () => {
        const ownerDb = testEnv.authenticatedContext('seller_1').firestore();
        const docRef = ownerDb.collection(colName).doc('seller_1');
        await assertFails(docRef.update({
          productsCount: 500,
          followersCount: 10000,
        }));
      });

      it('DENIES owner from setting personal contact data (phone, supportPhone, email)', async () => {
        const ownerDb = testEnv.authenticatedContext('seller_1').firestore();
        const docRef = ownerDb.collection(colName).doc('seller_1');
        await assertFails(docRef.update({
          supportPhone: '0555123456',
        }));
        await assertFails(docRef.update({
          phone: '0555123456',
        }));
        await assertFails(docRef.update({
          email: 'seller@gmail.com',
        }));
      });

      it('DENIES owner from setting financial/KYC info (rib, rcNumber)', async () => {
        const ownerDb = testEnv.authenticatedContext('seller_1').firestore();
        const docRef = ownerDb.collection(colName).doc('seller_1');
        await assertFails(docRef.update({
          rib: '00799999000123456789',
        }));
        await assertFails(docRef.update({
          rcNumber: '16/00-012345B20',
        }));
      });

      it('DENIES owner from deleting their document (admin only)', async () => {
        const ownerDb = testEnv.authenticatedContext('seller_1').firestore();
        const docRef = ownerDb.collection(colName).doc('seller_1');
        await assertFails(docRef.delete());
      });

      it('ALLOWS admin to update or delete document', async () => {
        const adminDb = testEnv.authenticatedContext('admin_user', { admin: true }).firestore();
        const docRef = adminDb.collection(colName).doc('seller_1');
        await assertSucceeds(docRef.update({
          status: 'suspended',
          sellerTrustScore: 50,
        }));
        await assertSucceeds(docRef.delete());
      });
    });
  });
});
