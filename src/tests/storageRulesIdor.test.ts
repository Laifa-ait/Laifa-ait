import { describe, it, expect } from 'vitest';

/**
 * Storage Rules Evaluation Engine (Simulates Firebase Storage Rules AST semantics)
 */
interface AuthContext {
  uid?: string;
  token?: {
    role?: string;
    admin?: boolean;
  };
}

interface RequestContext {
  auth: AuthContext | null;
  resource?: {
    size: number;
    contentType: string;
  };
}

interface FirestoreState {
  users: Record<string, { role: string }>;
  supportTickets: Record<string, { userId: string }>;
  orders: Record<string, { buyerId?: string; userId?: string; sellerId?: string; sellerIds?: string[] }>;
  disputes: Record<string, { buyerId?: string; sellerId?: string; userId?: string; openedBy?: string }>;
}

class StorageSecurityEvaluator {
  private db: FirestoreState;

  constructor(db: FirestoreState) {
    this.db = db;
  }

  isLoggedIn(request: RequestContext): boolean {
    return request.auth !== null && typeof request.auth.uid === 'string' && request.auth.uid.length > 0;
  }

  isAdmin(request: RequestContext): boolean {
    if (!this.isLoggedIn(request)) return false;
    const uid = request.auth!.uid!;
    const tokenRole = request.auth!.token?.role;
    const tokenAdmin = request.auth!.token?.admin;
    if (tokenRole === 'admin' || tokenRole === 'superadmin' || tokenAdmin === true) {
      return true;
    }
    const userDoc = this.db.users[uid];
    return userDoc?.role === 'admin' || userDoc?.role === 'superadmin';
  }

  isTicketParticipant(ticketId: string, request: RequestContext): boolean {
    if (!this.isLoggedIn(request)) return false;
    if (this.isAdmin(request)) return true;
    const uid = request.auth!.uid!;
    const ticket = this.db.supportTickets[ticketId];
    return ticket?.userId === uid;
  }

  isOrderParticipant(orderId: string, request: RequestContext): boolean {
    if (!this.isLoggedIn(request)) return false;
    if (this.isAdmin(request)) return true;
    const uid = request.auth!.uid!;
    const order = this.db.orders[orderId];
    if (!order) return false;
    return (
      order.buyerId === uid ||
      order.userId === uid ||
      order.sellerId === uid ||
      (Array.isArray(order.sellerIds) && order.sellerIds.includes(uid))
    );
  }

  isDisputeParticipant(disputeId: string, request: RequestContext): boolean {
    if (!this.isLoggedIn(request)) return false;
    if (this.isAdmin(request)) return true;
    const uid = request.auth!.uid!;
    const dispute = this.db.disputes[disputeId];
    if (dispute) {
      if (
        dispute.buyerId === uid ||
        dispute.userId === uid ||
        dispute.openedBy === uid ||
        dispute.sellerId === uid
      ) {
        return true;
      }
    }
    return this.isOrderParticipant(disputeId, request);
  }

  // --- Rule Match Evaluators ---

  canAccessSupportAttachment(ticketId: string, _fileName: string, request: RequestContext, operation: 'read' | 'write'): boolean {
    if (!this.isTicketParticipant(ticketId, request)) return false;
    if (operation === 'write') {
      if (!request.resource) return false;
      const validSize = request.resource.size < 10 * 1024 * 1024;
      const validMime = request.resource.contentType.startsWith('image/') || request.resource.contentType === 'application/pdf';
      return validSize && validMime;
    }
    return true;
  }

  canAccessDisputeAttachment(disputeId: string, _fileName: string, request: RequestContext, operation: 'read' | 'write'): boolean {
    if (!this.isDisputeParticipant(disputeId, request)) return false;
    if (operation === 'write') {
      if (!request.resource) return false;
      const validSize = request.resource.size < 10 * 1024 * 1024;
      const validMime = request.resource.contentType.startsWith('image/') || request.resource.contentType === 'application/pdf';
      return validSize && validMime;
    }
    return true;
  }

  canAccessChatImage(orderId: string, _fileName: string, request: RequestContext, operation: 'read' | 'write'): boolean {
    if (!this.isOrderParticipant(orderId, request)) return false;
    if (operation === 'write') {
      if (!request.resource) return false;
      const validSize = request.resource.size < 10 * 1024 * 1024;
      const validMime = request.resource.contentType.startsWith('image/');
      return validSize && validMime;
    }
    return true;
  }

  canAccessKyc(targetUid: string, _fileName: string, request: RequestContext, operation: 'read' | 'write'): boolean {
    if (!this.isLoggedIn(request)) return false;
    const uid = request.auth!.uid!;
    if (operation === 'read') {
      return uid === targetUid || this.isAdmin(request);
    }
    if (operation === 'write') {
      if (uid !== targetUid) return false;
      if (!request.resource) return false;
      const validSize = request.resource.size < 10 * 1024 * 1024;
      const validMime = request.resource.contentType.startsWith('image/') || request.resource.contentType === 'application/pdf';
      return validSize && validMime;
    }
    return false;
  }
}

describe('Storage Rules IDOR Vulnerability & Authorization Hardening', () => {
  const mockDb: FirestoreState = {
    users: {
      'user_alice': { role: 'buyer' },
      'user_bob': { role: 'buyer' },
      'seller_charlie': { role: 'seller' },
      'admin_super': { role: 'admin' }
    },
    supportTickets: {
      'ticket_alice_123': { userId: 'user_alice' },
      'ticket_bob_456': { userId: 'user_bob' }
    },
    orders: {
      'order_789': { buyerId: 'user_alice', sellerId: 'seller_charlie' }
    },
    disputes: {
      'dispute_555': { buyerId: 'user_alice', sellerId: 'seller_charlie', openedBy: 'user_alice' }
    }
  };

  const evaluator = new StorageSecurityEvaluator(mockDb);

  const authAlice: RequestContext = {
    auth: { uid: 'user_alice', token: { role: 'buyer' } },
    resource: { size: 1024 * 500, contentType: 'image/jpeg' }
  };

  const authBob: RequestContext = {
    auth: { uid: 'user_bob', token: { role: 'buyer' } },
    resource: { size: 1024 * 500, contentType: 'application/pdf' }
  };

  const authCharlie: RequestContext = {
    auth: { uid: 'seller_charlie', token: { role: 'seller' } },
    resource: { size: 1024 * 500, contentType: 'image/png' }
  };

  const authAdmin: RequestContext = {
    auth: { uid: 'admin_super', token: { role: 'admin' } },
    resource: { size: 1024 * 500, contentType: 'image/png' }
  };

  const authUnauthenticated: RequestContext = {
    auth: null,
    resource: { size: 1024 * 500, contentType: 'image/png' }
  };

  describe('Support Ticket Attachments (/support/{ticketId}/{fileName})', () => {
    it('allows owner User A to read and write to their own ticket', () => {
      expect(evaluator.canAccessSupportAttachment('ticket_alice_123', 'screenshot.png', authAlice, 'read')).toBe(true);
      expect(evaluator.canAccessSupportAttachment('ticket_alice_123', 'screenshot.png', authAlice, 'write')).toBe(true);
    });

    it('DENIES User B from reading or writing to User A ticket', () => {
      expect(evaluator.canAccessSupportAttachment('ticket_alice_123', 'screenshot.png', authBob, 'read')).toBe(false);
      expect(evaluator.canAccessSupportAttachment('ticket_alice_123', 'screenshot.png', authBob, 'write')).toBe(false);
    });

    it('DENIES User B IDOR bypass attempt when using filename starting with their own UID (user_bob_malicious.pdf)', () => {
      const evilFileName = 'user_bob_malicious.pdf';
      expect(evaluator.canAccessSupportAttachment('ticket_alice_123', evilFileName, authBob, 'read')).toBe(false);
      expect(evaluator.canAccessSupportAttachment('ticket_alice_123', evilFileName, authBob, 'write')).toBe(false);
    });

    it('DENIES unauthenticated user from reading or writing support attachments', () => {
      expect(evaluator.canAccessSupportAttachment('ticket_alice_123', 'screenshot.png', authUnauthenticated, 'read')).toBe(false);
      expect(evaluator.canAccessSupportAttachment('ticket_alice_123', 'screenshot.png', authUnauthenticated, 'write')).toBe(false);
    });

    it('ALLOWS legitimate admin to read and write support attachments', () => {
      expect(evaluator.canAccessSupportAttachment('ticket_alice_123', 'reply.pdf', authAdmin, 'read')).toBe(true);
      expect(evaluator.canAccessSupportAttachment('ticket_alice_123', 'reply.pdf', authAdmin, 'write')).toBe(true);
    });
  });

  describe('Dispute Attachments (/disputes/{disputeId}/{fileName})', () => {
    it('allows legitimate dispute participants (buyer & seller) to read and write', () => {
      expect(evaluator.canAccessDisputeAttachment('dispute_555', 'evidence.jpg', authAlice, 'read')).toBe(true);
      expect(evaluator.canAccessDisputeAttachment('dispute_555', 'evidence.jpg', authAlice, 'write')).toBe(true);
      expect(evaluator.canAccessDisputeAttachment('dispute_555', 'counter_evidence.png', authCharlie, 'read')).toBe(true);
      expect(evaluator.canAccessDisputeAttachment('dispute_555', 'counter_evidence.png', authCharlie, 'write')).toBe(true);
    });

    it('DENIES non-participant User B from reading or writing dispute attachments', () => {
      expect(evaluator.canAccessDisputeAttachment('dispute_555', 'evidence.jpg', authBob, 'read')).toBe(false);
      expect(evaluator.canAccessDisputeAttachment('dispute_555', 'evidence.jpg', authBob, 'write')).toBe(false);
    });

    it('DENIES User B IDOR bypass attempt with UID-prefixed filename in dispute', () => {
      const evilFileName = 'user_bob_fake_invoice.pdf';
      expect(evaluator.canAccessDisputeAttachment('dispute_555', evilFileName, authBob, 'read')).toBe(false);
      expect(evaluator.canAccessDisputeAttachment('dispute_555', evilFileName, authBob, 'write')).toBe(false);
    });

    it('ALLOWS admin to read and write dispute attachments for arbitration', () => {
      expect(evaluator.canAccessDisputeAttachment('dispute_555', 'decision.pdf', authAdmin, 'read')).toBe(true);
      expect(evaluator.canAccessDisputeAttachment('dispute_555', 'decision.pdf', authAdmin, 'write')).toBe(true);
    });
  });

  describe('Live Chat Images (/chat_images/{orderId}/{fileName})', () => {
    it('allows buyer Alice and seller Charlie of order_789 to share images', () => {
      expect(evaluator.canAccessChatImage('order_789', 'product.jpg', authAlice, 'write')).toBe(true);
      expect(evaluator.canAccessChatImage('order_789', 'product.jpg', authCharlie, 'read')).toBe(true);
    });

    it('DENIES non-participant Bob from snooping on order chat images even with UID filename', () => {
      expect(evaluator.canAccessChatImage('order_789', 'user_bob_image.jpg', authBob, 'read')).toBe(false);
      expect(evaluator.canAccessChatImage('order_789', 'user_bob_image.jpg', authBob, 'write')).toBe(false);
    });
  });

  describe('Seller KYC Documents (/kyc/{uid}/{fileName})', () => {
    it('allows User Alice to upload and read her own KYC document', () => {
      expect(evaluator.canAccessKyc('user_alice', 'passport.pdf', authAlice, 'write')).toBe(true);
      expect(evaluator.canAccessKyc('user_alice', 'passport.pdf', authAlice, 'read')).toBe(true);
    });

    it('DENIES User Bob from reading or tampering with Alice KYC', () => {
      expect(evaluator.canAccessKyc('user_alice', 'passport.pdf', authBob, 'read')).toBe(false);
      expect(evaluator.canAccessKyc('user_alice', 'passport.pdf', authBob, 'write')).toBe(false);
    });

    it('ALLOWS Admin to read Alice KYC but restricts direct client write', () => {
      expect(evaluator.canAccessKyc('user_alice', 'passport.pdf', authAdmin, 'read')).toBe(true);
      expect(evaluator.canAccessKyc('user_alice', 'passport.pdf', authAdmin, 'write')).toBe(false);
    });
  });
});
