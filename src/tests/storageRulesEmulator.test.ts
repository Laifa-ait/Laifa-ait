import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

const hasEmulator = Boolean(
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ||
  process.env.FIREBASE_EMULATOR_HUB ||
  process.env.FIRESTORE_EMULATOR_HOST
);

describe.skipIf(!hasEmulator)('Firebase Storage Security Rules - Real Emulator Suite', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: process.env.FIREBASE_PROJECT_ID || 'ai-studio-217f6d79-c758-4e14-845d-737228cd3915',
      storage: {
        rules: fs.readFileSync(path.resolve(process.cwd(), 'storage.rules'), 'utf8'),
        host: '127.0.0.1',
        port: 9199,
      },
      firestore: {
        rules: fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8'),
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
    await testEnv.clearFirestore();
    await testEnv.clearStorage();

    // Seed Firestore documents for cross-service authorization lookups
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      // Admin user
      await db.collection('users').doc('admin_user').set({
        role: 'admin',
        email: 'admin@olmart.dz'
      });

      // Regular User A (Buyer)
      await db.collection('users').doc('user_A').set({
        role: 'buyer',
        email: 'userA@olmart.dz'
      });

      // Regular User B (Buyer)
      await db.collection('users').doc('user_B').set({
        role: 'buyer',
        email: 'userB@olmart.dz'
      });

      // Seller S
      await db.collection('users').doc('seller_S').set({
        role: 'seller',
        email: 'sellerS@olmart.dz'
      });

      // Support ticket owned by User A
      await db.collection('supportTickets').doc('ticket_A').set({
        userId: 'user_A',
        subject: 'Ticket by User A'
      });

      // Support ticket owned by User B
      await db.collection('supportTickets').doc('ticket_B').set({
        userId: 'user_B',
        subject: 'Ticket by User B'
      });

      // Order involving User A (buyer) and Seller S
      await db.collection('orders').doc('order_A').set({
        userId: 'user_A',
        buyerId: 'user_A',
        sellerId: 'seller_S',
        sellerIds: ['seller_S']
      });

      // Order involving User B (buyer) and Seller S
      await db.collection('orders').doc('order_B').set({
        userId: 'user_B',
        buyerId: 'user_B',
        sellerId: 'seller_S',
        sellerIds: ['seller_S']
      });

      // Dispute involving User A (buyer) and Seller S
      await db.collection('disputes').doc('dispute_A').set({
        buyerId: 'user_A',
        userId: 'user_A',
        sellerId: 'seller_S'
      });

      // Dispute involving User B (buyer) and Seller S
      await db.collection('disputes').doc('dispute_B').set({
        buyerId: 'user_B',
        userId: 'user_B',
        sellerId: 'seller_S'
      });
    });
  });

  const dummyImageBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
  const imageMetadata = { contentType: 'image/jpeg' };
  const upload = (task: PromiseLike<unknown>): Promise<unknown> => Promise.resolve(task);

  describe('SCENARIO A: Utilisateur A -> Ressource A (EXPECTED: ALLOW)', () => {
    it('allows User A to upload and read attachment in their own support ticket', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('support/ticket_A/document.jpg');
      await assertSucceeds(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertSucceeds(ref.getDownloadURL());
    });

    it('allows User A (buyer) to upload and read attachment in their own dispute', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('disputes/dispute_A/proof.jpg');
      await assertSucceeds(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertSucceeds(ref.getDownloadURL());
    });

    it('allows User A (buyer) to upload and read return attachment in their own order', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('returns/order_A/damaged.jpg');
      await assertSucceeds(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertSucceeds(ref.getDownloadURL());
    });

    it('allows User A (buyer) to upload and read chat images in their own order', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('chat_images/order_A/msg_photo.jpg');
      await assertSucceeds(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertSucceeds(ref.getDownloadURL());
    });
  });

  describe('SCENARIO B: Utilisateur A -> Ressource B (EXPECTED: DENY)', () => {
    it('denies User A from writing to User B support ticket', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('support/ticket_B/evil.jpg');
      await assertFails(upload(ref.put(dummyImageBytes, imageMetadata)));
    });

    it('denies User A from reading User B support ticket attachment', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('support/ticket_B/secret.jpg');
      await assertFails(ref.getDownloadURL());
    });

    it('denies User A from writing to User B dispute', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('disputes/dispute_B/intruder.jpg');
      await assertFails(upload(ref.put(dummyImageBytes, imageMetadata)));
    });

    it('denies User A from writing to User B return request', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('returns/order_B/fake_return.jpg');
      await assertFails(upload(ref.put(dummyImageBytes, imageMetadata)));
    });

    it('denies User A from reading or writing User B chat images', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('chat_images/order_B/spy.jpg');
      await assertFails(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertFails(ref.getDownloadURL());
    });
  });

  describe('SCENARIO C: Utilisateur A -> Ressource B avec filename commençant par UID_A (EXPECTED: DENY)', () => {
    it('denies IDOR bypass attempt in support/ with user_A_ prefixed filename', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('support/ticket_B/user_A_exploit.jpg');
      await assertFails(upload(ref.put(dummyImageBytes, imageMetadata)));
    });

    it('denies IDOR bypass attempt in disputes/ with user_A_ prefixed filename', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('disputes/dispute_B/user_A_exploit.jpg');
      await assertFails(upload(ref.put(dummyImageBytes, imageMetadata)));
    });

    it('denies IDOR bypass attempt in returns/ with user_A_ prefixed filename', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('returns/order_B/user_A_exploit.jpg');
      await assertFails(upload(ref.put(dummyImageBytes, imageMetadata)));
    });

    it('denies IDOR bypass attempt in chat_images/ with user_A_ prefixed filename', async () => {
      const userAStorage = testEnv.authenticatedContext('user_A').storage();
      const ref = userAStorage.ref('chat_images/order_B/user_A_exploit.jpg');
      await assertFails(upload(ref.put(dummyImageBytes, imageMetadata)));
    });
  });

  describe('SCENARIO D: Utilisateur non authentifié -> Ressource privée (EXPECTED: DENY)', () => {
    it('denies unauthenticated read/write to support/', async () => {
      const unauthStorage = testEnv.unauthenticatedContext().storage();
      const ref = unauthStorage.ref('support/ticket_A/unauth.jpg');
      await assertFails(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertFails(ref.getDownloadURL());
    });

    it('denies unauthenticated read/write to disputes/', async () => {
      const unauthStorage = testEnv.unauthenticatedContext().storage();
      const ref = unauthStorage.ref('disputes/dispute_A/unauth.jpg');
      await assertFails(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertFails(ref.getDownloadURL());
    });

    it('denies unauthenticated read/write to returns/', async () => {
      const unauthStorage = testEnv.unauthenticatedContext().storage();
      const ref = unauthStorage.ref('returns/order_A/unauth.jpg');
      await assertFails(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertFails(ref.getDownloadURL());
    });

    it('denies unauthenticated read/write to chat_images/', async () => {
      const unauthStorage = testEnv.unauthenticatedContext().storage();
      const ref = unauthStorage.ref('chat_images/order_A/unauth.jpg');
      await assertFails(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertFails(ref.getDownloadURL());
    });

    it('denies unauthenticated read/write to kyc/', async () => {
      const unauthStorage = testEnv.unauthenticatedContext().storage();
      const ref = unauthStorage.ref('kyc/user_A/id_card.pdf');
      await assertFails(upload(ref.put(dummyImageBytes, { contentType: 'application/pdf' })));
      await assertFails(ref.getDownloadURL());
    });
  });

  describe('SCENARIO E: Participant légitime -> Ressource correspondante (EXPECTED: ALLOW)', () => {
    it('allows legitimate Seller S to read and upload chat image in order_A', async () => {
      const sellerStorage = testEnv.authenticatedContext('seller_S').storage();
      const ref = sellerStorage.ref('chat_images/order_A/shipping_proof.jpg');
      await assertSucceeds(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertSucceeds(ref.getDownloadURL());
    });

    it('allows legitimate Seller S to read and upload dispute evidence in dispute_A', async () => {
      const sellerStorage = testEnv.authenticatedContext('seller_S').storage();
      const ref = sellerStorage.ref('disputes/dispute_A/defense_proof.jpg');
      await assertSucceeds(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertSucceeds(ref.getDownloadURL());
    });

    it('allows legitimate Seller S to view return details for order_A', async () => {
      const sellerStorage = testEnv.authenticatedContext('seller_S').storage();
      const ref = sellerStorage.ref('returns/order_A/seller_check.jpg');
      await assertSucceeds(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertSucceeds(ref.getDownloadURL());
    });
  });

  describe('SCENARIO F: Administrateur légitime (EXPECTED: ALLOW)', () => {
    it('allows Admin to read and write in any support ticket', async () => {
      const adminStorage = testEnv.authenticatedContext('admin_user', { admin: true, role: 'admin' }).storage();
      const ref = adminStorage.ref('support/ticket_B/admin_reply.jpg');
      await assertSucceeds(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertSucceeds(ref.getDownloadURL());
    });

    it('allows Admin to read and write in any dispute', async () => {
      const adminStorage = testEnv.authenticatedContext('admin_user', { admin: true, role: 'admin' }).storage();
      const ref = adminStorage.ref('disputes/dispute_B/admin_verdict.jpg');
      await assertSucceeds(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertSucceeds(ref.getDownloadURL());
    });

    it('allows Admin to read and write in any return request', async () => {
      const adminStorage = testEnv.authenticatedContext('admin_user', { admin: true, role: 'admin' }).storage();
      const ref = adminStorage.ref('returns/order_B/admin_decision.jpg');
      await assertSucceeds(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertSucceeds(ref.getDownloadURL());
    });

    it('allows Admin to read and write in any chat_images/', async () => {
      const adminStorage = testEnv.authenticatedContext('admin_user', { admin: true, role: 'admin' }).storage();
      const ref = adminStorage.ref('chat_images/order_B/admin_moderation.jpg');
      await assertSucceeds(upload(ref.put(dummyImageBytes, imageMetadata)));
      await assertSucceeds(ref.getDownloadURL());
    });
  });
});
