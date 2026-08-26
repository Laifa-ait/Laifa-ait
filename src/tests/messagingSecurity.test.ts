import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextFunction, Response } from "express";
import { AuthenticatedRequest, authenticateToken } from "../middlewares/auth";
import {
  CreateNegotiationSchema,
  InitiateConversationSchema,
  ResolveNegotiationSchema,
  SendMessageSchema
} from "../schemas/messaging";
import { MessageModerationService } from "../domains/messaging/services/MessageModerationService";
import { NegotiationService } from "../domains/messaging/services/NegotiationService";
import { MessagingService } from "../domains/messaging/services/MessagingService";
import { ConversationDocument } from "../types/messaging";
import type { CollectionReference, Transaction } from "firebase-admin/firestore";

// Mock Firebase Admin
vi.mock("../config/firebase-admin", () => {
  const mockTransaction = {
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  };

  const mockDb = {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    startAfter: vi.fn().mockReturnThis(),
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    add: vi.fn().mockResolvedValue({ id: "mock_doc_id" }),
    runTransaction: vi.fn(async (cb: (tx: typeof mockTransaction) => Promise<unknown>) => cb(mockTransaction))
  };

  const mockAuth = {
    verifyIdToken: vi.fn()
  };

  return {
    admin: {
      auth: vi.fn(() => mockAuth),
      firestore: {
        FieldValue: {
          serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
          increment: vi.fn((n: number) => n)
        }
      }
    },
    db: mockDb,
    auth: mockAuth
  };
});

describe("OLM-04.1 Unified Messaging & Negotiation Security Test Suite", () => {
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockJson = vi.fn();
    mockStatus = vi.fn().mockImplementation(() => mockRes as Response);
    mockRes = {
      status: mockStatus,
      json: mockJson
    };
    mockNext = vi.fn();
  });

  describe("1. Zod Validation & Schema Security", () => {
    it("1.1 InitiateConversationSchema validates valid payloads", () => {
      const valid = {
        type: "REAL_ESTATE_INQUIRY",
        recipientId: "owner_456",
        context: { propertyId: "prop_123" },
        initialMessage: "Bonjour, ce bien est-il toujours disponible ?"
      };
      const parsed = InitiateConversationSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("1.2 InitiateConversationSchema rejects empty messages or invalid types", () => {
      const invalid = {
        type: "INVALID_TYPE",
        recipientId: "owner_456",
        context: {},
        initialMessage: ""
      };
      const parsed = InitiateConversationSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("1.3 SendMessageSchema rejects empty messages or oversized attachments (> 5MB)", () => {
      const oversizedAttachment = {
        text: "Voici les documents",
        attachments: [
          {
            type: "pdf" as const,
            url: "https://olmart.dz/doc.pdf",
            fileName: "contract.pdf",
            fileSizeBytes: 10 * 1024 * 1024 // 10MB > 5MB limit
          }
        ]
      };
      const parsed = SendMessageSchema.safeParse(oversizedAttachment);
      expect(parsed.success).toBe(false);
    });

    it("1.4 CreateNegotiationSchema rejects amount <= 0", () => {
      const zeroAmount = { amountDZD: 0 };
      const negativeAmount = { amountDZD: -5000 };
      expect(CreateNegotiationSchema.safeParse(zeroAmount).success).toBe(false);
      expect(CreateNegotiationSchema.safeParse(negativeAmount).success).toBe(false);
    });

    it("1.5 ResolveNegotiationSchema requires counterAmountDZD on COUNTER action", () => {
      const counterWithoutAmount = {
        offerId: "off_123",
        action: "COUNTER" as const
      };
      const counterWithAmount = {
        offerId: "off_123",
        action: "COUNTER" as const,
        counterAmountDZD: 45000
      };
      expect(ResolveNegotiationSchema.safeParse(counterWithoutAmount).success).toBe(false);
      expect(ResolveNegotiationSchema.safeParse(counterWithAmount).success).toBe(true);
    });
  });

  describe("2. DLP & Server-Side Message Moderation (MessageModerationService)", () => {
    it("2.1 Masks Algerian mobile numbers (05, 06, 07)", () => {
      const raw = "Contactez-moi au 0550123456 ou au 0661987654";
      const result = MessageModerationService.moderateText(raw);

      expect(result.violationDetected).toBe(true);
      expect(result.cleanText).toContain("[NUMÉRO MASQUÉ]");
      expect(result.cleanText).not.toContain("0550123456");
      expect(result.cleanText).not.toContain("0661987654");
    });

    it("2.2 Masks Algerian international format numbers (+213 / 00213)", () => {
      const raw = "Appelez le +213770123456";
      const result = MessageModerationService.moderateText(raw);

      expect(result.violationDetected).toBe(true);
      expect(result.cleanText).toContain("[NUMÉRO MASQUÉ]");
    });

    it("2.3 Masks social media keywords and external contact attempts", () => {
      const raw = "On continue la discussion sur WhatsApp ou Telegram svp";
      const result = MessageModerationService.moderateText(raw);

      expect(result.violationDetected).toBe(true);
      expect(result.cleanText).toContain("[MOT INTERDIT]");
    });

    it("2.4 Masks external links and URLs", () => {
      const raw = "Regardez mon profil sur https://myexternalportfolio.dz/contact";
      const result = MessageModerationService.moderateText(raw);

      expect(result.violationDetected).toBe(true);
      expect(result.cleanText).toContain("[LIEN INTERDIT]");
    });

    it("2.5 Clean text passes without violation", () => {
      const raw = "Bonjour, quel est le délai estimé de livraison pour Alger ?";
      const result = MessageModerationService.moderateText(raw);

      expect(result.violationDetected).toBe(false);
      expect(result.cleanText).toBe(raw);
    });
  });

  describe("3. Negotiation State Machine & ACID Authority (NegotiationService)", () => {
    it("3.1 Rejects negotiation resolution if caller is NOT targetUid (BOLA protection)", async () => {
      const { db } = await import("../config/firebase-admin");

      const mockConversation: ConversationDocument = {
        id: "conv_123",
        type: "REAL_ESTATE_INQUIRY",
        participants: ["client.buyer1@olmart.dz", "client.owner2@olmart.dz"],
        participantDetails: {
          "client.buyer1@olmart.dz": { uid: "client.buyer1@olmart.dz", role: "buyer", displayName: "Acheteur", unreadCount: 0 },
          "client.owner2@olmart.dz": { uid: "client.owner2@olmart.dz", role: "owner", displayName: "Propriétaire", unreadCount: 0 }
        },
        context: { referenceTitle: "Appartement F3" },
        activeNegotiation: {
          offerId: "off_abc",
          amountDZD: 50000,
          initialPriceDZD: 60000,
          currency: "DZD",
          status: "PENDING",
          proposedByUid: "client.buyer1@olmart.dz",
          targetUid: "client.owner2@olmart.dz",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString()
        },
        isArchived: false,
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (db) {
        vi.spyOn(db, "runTransaction").mockImplementation(async (cb) => {
          const fakeTx = {
            get: vi.fn().mockResolvedValue({
              exists: true,
              data: () => mockConversation
            }),
            set: vi.fn(),
            update: vi.fn()
          };
          return cb(fakeTx as unknown as Transaction);
        });
      }

      // Proposer attempts to accept their own offer
      await expect(
        NegotiationService.resolveOffer({
          callerUid: "client.buyer1@olmart.dz",
          conversationId: "conv_123",
          payload: { offerId: "off_abc", action: "ACCEPT" }
        })
      ).rejects.toThrow("UNAUTHORIZED_OFFER_RESOLUTION");
    });

    it("3.2 TargetUid can ACCEPT a valid PENDING offer", async () => {
      const { db } = await import("../config/firebase-admin");

      const mockConversation: ConversationDocument = {
        id: "conv_123",
        type: "REAL_ESTATE_INQUIRY",
        participants: ["client.buyer1@olmart.dz", "client.owner2@olmart.dz"],
        participantDetails: {
          "client.buyer1@olmart.dz": { uid: "client.buyer1@olmart.dz", role: "buyer", displayName: "Acheteur", unreadCount: 0 },
          "client.owner2@olmart.dz": { uid: "client.owner2@olmart.dz", role: "owner", displayName: "Propriétaire", unreadCount: 0 }
        },
        context: { referenceTitle: "Appartement F3" },
        activeNegotiation: {
          offerId: "off_abc",
          amountDZD: 50000,
          initialPriceDZD: 60000,
          currency: "DZD",
          status: "PENDING",
          proposedByUid: "client.buyer1@olmart.dz",
          targetUid: "client.owner2@olmart.dz",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString()
        },
        isArchived: false,
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (db) {
        vi.spyOn(db, "runTransaction").mockImplementation(async (cb) => {
          const fakeTx = {
            get: vi.fn().mockResolvedValue({
              exists: true,
              data: () => mockConversation
            }),
            set: vi.fn(),
            update: vi.fn()
          };
          return cb(fakeTx as unknown as Transaction);
        });
      }

      const result = await NegotiationService.resolveOffer({
        callerUid: "client.owner2@olmart.dz",
        conversationId: "conv_123",
        payload: { offerId: "off_abc", action: "ACCEPT" }
      });

      expect(result.status).toBe("ACCEPTED");
      expect(result.resolvedAt).toBeDefined();
    });

    it("3.3 TargetUid can COUNTER an offer, creating a new pending offer reversed", async () => {
      const { db } = await import("../config/firebase-admin");

      const mockConversation: ConversationDocument = {
        id: "conv_123",
        type: "REAL_ESTATE_INQUIRY",
        participants: ["client.buyer1@olmart.dz", "client.owner2@olmart.dz"],
        participantDetails: {
          "client.buyer1@olmart.dz": { uid: "client.buyer1@olmart.dz", role: "buyer", displayName: "Acheteur", unreadCount: 0 },
          "client.owner2@olmart.dz": { uid: "client.owner2@olmart.dz", role: "owner", displayName: "Propriétaire", unreadCount: 0 }
        },
        context: { referenceTitle: "Appartement F3" },
        activeNegotiation: {
          offerId: "off_abc",
          amountDZD: 50000,
          initialPriceDZD: 60000,
          currency: "DZD",
          status: "PENDING",
          proposedByUid: "client.buyer1@olmart.dz",
          targetUid: "client.owner2@olmart.dz",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString()
        },
        isArchived: false,
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (db) {
        vi.spyOn(db, "runTransaction").mockImplementation(async (cb) => {
          const fakeTx = {
            get: vi.fn().mockResolvedValue({
              exists: true,
              data: () => mockConversation
            }),
            set: vi.fn(),
            update: vi.fn()
          };
          return cb(fakeTx as unknown as Transaction);
        });
      }

      const counterResult = await NegotiationService.resolveOffer({
        callerUid: "client.owner2@olmart.dz",
        conversationId: "conv_123",
        payload: { offerId: "off_abc", action: "COUNTER", counterAmountDZD: 55000 }
      });

      expect(counterResult.status).toBe("PENDING");
      expect(counterResult.amountDZD).toBe(55000);
      expect(counterResult.proposedByUid).toBe("client.owner2@olmart.dz");
      expect(counterResult.targetUid).toBe("client.buyer1@olmart.dz");
    });

    it("3.4 Proposer can CANCEL their own pending offer, but target cannot", async () => {
      const { db } = await import("../config/firebase-admin");

      const mockConversation: ConversationDocument = {
        id: "conv_123",
        type: "REAL_ESTATE_INQUIRY",
        participants: ["client.buyer1@olmart.dz", "client.owner2@olmart.dz"],
        participantDetails: {
          "client.buyer1@olmart.dz": { uid: "client.buyer1@olmart.dz", role: "buyer", displayName: "Acheteur", unreadCount: 0 },
          "client.owner2@olmart.dz": { uid: "client.owner2@olmart.dz", role: "owner", displayName: "Propriétaire", unreadCount: 0 }
        },
        context: { referenceTitle: "Appartement F3" },
        activeNegotiation: {
          offerId: "off_abc",
          amountDZD: 50000,
          initialPriceDZD: 60000,
          currency: "DZD",
          status: "PENDING",
          proposedByUid: "client.buyer1@olmart.dz",
          targetUid: "client.owner2@olmart.dz",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString()
        },
        isArchived: false,
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (db) {
        vi.spyOn(db, "runTransaction").mockImplementation(async (cb) => {
          const fakeTx = {
            get: vi.fn().mockResolvedValue({
              exists: true,
              data: () => mockConversation
            }),
            set: vi.fn(),
            update: vi.fn()
          };
          return cb(fakeTx as unknown as Transaction);
        });
      }

      // Target tries to cancel proposer's offer -> fails
      await expect(
        NegotiationService.cancelOffer("client.owner2@olmart.dz", "conv_123", "off_abc")
      ).rejects.toThrow("UNAUTHORIZED_OFFER_CANCELLATION");

      // Proposer cancels their offer -> succeeds
      const cancelResult = await NegotiationService.cancelOffer("client.buyer1@olmart.dz", "conv_123", "off_abc");
      expect(cancelResult.status).toBe("CANCELLED");
    });

    it("3.5 Rejects transition from non-PENDING offer (e.g. from ACCEPTED)", async () => {
      const { db } = await import("../config/firebase-admin");

      const mockConversation: ConversationDocument = {
        id: "conv_123",
        type: "REAL_ESTATE_INQUIRY",
        participants: ["client.buyer1@olmart.dz", "client.owner2@olmart.dz"],
        participantDetails: {
          "client.buyer1@olmart.dz": { uid: "client.buyer1@olmart.dz", role: "buyer", displayName: "Acheteur", unreadCount: 0 },
          "client.owner2@olmart.dz": { uid: "client.owner2@olmart.dz", role: "owner", displayName: "Propriétaire", unreadCount: 0 }
        },
        context: { referenceTitle: "Appartement F3" },
        activeNegotiation: {
          offerId: "off_abc",
          amountDZD: 50000,
          initialPriceDZD: 60000,
          currency: "DZD",
          status: "ACCEPTED",
          proposedByUid: "client.buyer1@olmart.dz",
          targetUid: "client.owner2@olmart.dz",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          resolvedAt: new Date().toISOString()
        },
        isArchived: false,
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (db) {
        vi.spyOn(db, "runTransaction").mockImplementation(async (cb) => {
          const fakeTx = {
            get: vi.fn().mockResolvedValue({
              exists: true,
              data: () => mockConversation
            }),
            set: vi.fn(),
            update: vi.fn()
          };
          return cb(fakeTx as unknown as Transaction);
        });
      }

      await expect(
        NegotiationService.resolveOffer({
          callerUid: "client.owner2@olmart.dz",
          conversationId: "conv_123",
          payload: { offerId: "off_abc", action: "REJECT" }
        })
      ).rejects.toThrow("CANNOT_TRANSITION_FROM_ACCEPTED");
    });
  });

  describe("4. IDOR / BOLA Context Validation in MessagingService", () => {
    it("4.1 Rejects conversation initiation with oneself (SELF_CONVERSATION_FORBIDDEN)", async () => {
      const { db } = await import("../config/firebase-admin");

      if (db) {
        vi.spyOn(db, "collection").mockReturnValue({
          doc: vi.fn().mockReturnValue({
            get: vi.fn().mockResolvedValue({
              exists: true,
              data: () => ({
                ownerId: "client.self@olmart.dz",
                title: "Mon propre appartement",
                images: []
              })
            })
          })
        } as unknown as CollectionReference);
      }

      await expect(
        MessagingService.initiateConversation("client.self@olmart.dz", {
          type: "REAL_ESTATE_INQUIRY",
          recipientId: "fake_id_in_body",
          context: { propertyId: "prop_own" },
          initialMessage: "Je me parle à moi même"
        })
      ).rejects.toThrow("SELF_CONVERSATION_FORBIDDEN");
    });

    it("4.2 Prevents non-participants from viewing conversation (FORBIDDEN_NOT_PARTICIPANT)", async () => {
      const { db } = await import("../config/firebase-admin");

      if (db) {
        vi.spyOn(db, "collection").mockReturnValue({
          doc: vi.fn().mockReturnValue({
            get: vi.fn().mockResolvedValue({
              exists: true,
              id: "conv_private_999",
              data: () => ({
                participants: ["client.alice@olmart.dz", "client.bob@olmart.dz"]
              })
            })
          })
        } as unknown as CollectionReference);
      }

      await expect(
        MessagingService.getConversation("audit.eve@olmart.dz", "conv_private_999", false)
      ).rejects.toThrow("FORBIDDEN_NOT_PARTICIPANT");
    });

    it("4.3 Allows admin to inspect conversation under compliance/audit RBAC", async () => {
      const { db } = await import("../config/firebase-admin");

      if (db) {
        vi.spyOn(db, "collection").mockReturnValue({
          doc: vi.fn().mockReturnValue({
            get: vi.fn().mockResolvedValue({
              exists: true,
              id: "conv_private_999",
              data: () => ({
                participants: ["client.alice@olmart.dz", "client.bob@olmart.dz"]
              })
            })
          })
        } as unknown as CollectionReference);
      }

      const conv = await MessagingService.getConversation("admin.security@olmart.dz", "conv_private_999", true);
      expect(conv.id).toBe("conv_private_999");
    });
  });

  describe("5. Authentication Middleware Security", () => {
    it("5.1 Rejects unauthenticated request with 401", async () => {
      const mockReq = { headers: {} } as AuthenticatedRequest;
      await authenticateToken(mockReq, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Authentification requise") })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
