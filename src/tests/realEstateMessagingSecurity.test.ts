import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  PropertyVisitCreateSchema,
  PropertyVisitUpdateStatusSchema,
} from "../schemas/realEstate";
import {
  InitiateConversationSchema,
  CreateNegotiationSchema,
} from "../schemas/messaging";
import { MessagingService } from "../domains/messaging/services/MessagingService";
import { NegotiationService } from "../domains/messaging/services/NegotiationService";
import { ConversationDocument, NegotiationOfferPayload } from "../types/messaging";

// Mock Firebase Admin
vi.mock("../config/firebase-admin", () => {
  const mockTransaction = {
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const createMockDoc = (id = "mock_doc_id", data: any = {}) => ({
    id,
    get: vi.fn().mockResolvedValue({
      exists: true,
      id,
      data: () => data,
    }),
    collection: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn(),
    set: vi.fn(),
  });

  const mockDb = {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockImplementation((id: string) => createMockDoc(id)),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    add: vi.fn().mockResolvedValue({ id: "mock_doc_id" }),
    runTransaction: vi.fn(async (cb: (tx: typeof mockTransaction) => Promise<unknown>) => cb(mockTransaction)),
  };

  const mockAuth = {
    verifyIdToken: vi.fn(),
  };

  return {
    admin: {
      auth: vi.fn(() => mockAuth),
      firestore: {
        FieldValue: {
          serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
          increment: vi.fn((n: number) => n),
        },
      },
    },
    db: mockDb,
    auth: mockAuth,
  };
});

describe("OLMA IMMO Phase 1.4 — Real Estate Messaging, Negotiation & Visits Security Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Real Estate Conversation Schema & Context Validation", () => {
    it("should validate a valid REAL_ESTATE_INQUIRY conversation payload", () => {
      const validPayload = {
        type: "REAL_ESTATE_INQUIRY",
        recipientId: "owner_user_456",
        initialMessage: "Bonjour, le bien est-il disponible ?",
        context: {
          propertyId: "PROP-ALG-002",
          referenceTitle: "Appartement F4 Standing Vue Mer",
          referencePriceDZD: 18500000,
        },
      };

      const parsed = InitiateConversationSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.type).toBe("REAL_ESTATE_INQUIRY");
        expect(parsed.data.context.propertyId).toBe("PROP-ALG-002");
      }
    });

    it("should reject conversation initiation without required recipientId", () => {
      const invalidPayload = {
        type: "REAL_ESTATE_INQUIRY",
        recipientId: "",
        context: {
          propertyId: "PROP-ALG-002",
        },
      };

      const parsed = InitiateConversationSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
    });
  });

  describe("2. BOLA & Ownership Authorization on Real Estate Conversations", () => {
    it("should prevent non-participants from viewing real estate conversations", async () => {
      const mockConversationDoc: Partial<ConversationDocument> = {
        id: "conv_immo_123",
        participants: ["buyer_101", "owner_202"],
        type: "REAL_ESTATE_INQUIRY",
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        context: { propertyId: "PROP-ALG-001", referenceTitle: "Appartement" },
      };

      // Mock Firestore returning a conversation that caller is NOT part of
      const dbModule = await import("../config/firebase-admin");
      (dbModule.db as any).doc = vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => mockConversationDoc,
          id: "conv_immo_123",
        })
      });

      const unauthorizedCaller = "unauthorized_user_999";
      await expect(
        MessagingService.listMessages(unauthorizedCaller, "conv_immo_123")
      ).rejects.toThrow(/FORBIDDEN_NOT_PARTICIPANT/i);
    });

    it("should allow verified participants to access real estate messages", async () => {
      const mockConversationDoc: Partial<ConversationDocument> = {
        id: "conv_immo_123",
        participants: ["buyer_101", "owner_202"],
        type: "REAL_ESTATE_INQUIRY",
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        context: { propertyId: "PROP-ALG-001", referenceTitle: "Appartement" },
      };

      const dbModule = await import("../config/firebase-admin");
      dbModule.db.collection = vi.fn().mockImplementation((colName: string) => {
        if (colName === "conversations") {
          return {
            doc: vi.fn().mockReturnValue({
              get: vi.fn().mockResolvedValue({
                exists: true,
                id: "conv_immo_123",
                data: () => mockConversationDoc,
              }),
              collection: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                get: vi.fn().mockResolvedValue({
                  docs: [
                    {
                      id: "msg_1",
                      data: () => ({
                        id: "msg_1",
                        conversationId: "conv_immo_123",
                        senderId: "buyer_101",
                        text: "Bonjour, le bien est-il toujours disponible ?",
                        createdAt: new Date().toISOString(),
                      }),
                    },
                  ],
                }),
              }),
            }),
          };
        }
        return {
          doc: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          get: vi.fn().mockResolvedValue({ docs: [] }),
        };
      });

      const result = await MessagingService.listMessages("buyer_101", "conv_immo_123");
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].text).toContain("disponible");
    });
  });

  describe("3. Price Negotiation State Machine & Permission Controls", () => {
    it("should validate negotiation offer creation schema", () => {
      const validOffer = {
        amountDZD: 17000000,
        terms: "Paiement comptant sous 30 jours",
      };

      const parsed = CreateNegotiationSchema.safeParse(validOffer);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.amountDZD).toBe(17000000);
      }
    });

    it("should reject negative or zero negotiation price offers", () => {
      const invalidOffer = {
        amountDZD: -50000,
      };

      const parsed = CreateNegotiationSchema.safeParse(invalidOffer);
      expect(parsed.success).toBe(false);
    });

    it("should prevent non-target users from accepting a negotiation offer", async () => {
      const activeOffer: NegotiationOfferPayload = {
        offerId: "off_101",
        proposedByUid: "buyer_101",
        targetUid: "owner_202",
        amountDZD: 16500000,
        status: "PENDING",
        terms: "Offre initiale",
        initialPriceDZD: 18500000,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        currency: "DZD",
      };

      const convWithOffer: Partial<ConversationDocument> = {
        id: "conv_immo_123",
        participants: ["buyer_101", "owner_202"],
        activeNegotiation: activeOffer,
      };

      const dbModule = await import("../config/firebase-admin");
      dbModule.db.collection = vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue({
            doc: vi.fn().mockReturnValue({ id: "mock_msg_id" }),
          }),
        }),
      });

      const mockTx = {
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => convWithOffer,
        }),
        update: vi.fn(),
        set: vi.fn(),
      };

      dbModule.db.runTransaction = vi.fn(async (cb) => cb(mockTx as any));

      // Buyer (proposer) tries to accept their own offer
      await expect(
        NegotiationService.resolveOffer({
          conversationId: "conv_immo_123",
          callerUid: "buyer_101",
          payload: {
            offerId: "off_101",
            action: "ACCEPT",
          },
        })
      ).rejects.toThrow(/UNAUTHORIZED_OFFER_RESOLUTION/i);
    });
  });

  describe("4. Property Visit Request Schema & Status Updates", () => {
    it("should validate property visit creation schema with valid Algerian phone and date", () => {
      const validVisitRequest = {
        propertyId: "PROP-ALG-002",
        visitorName: "Karim Benali",
        visitorPhone: "0550123456",
        preferredDate: "2026-09-01",
        timeSlot: "14:00 - 16:00 (Sur place)",
      };

      const parsed = PropertyVisitCreateSchema.safeParse(validVisitRequest);
      expect(parsed.success).toBe(true);
    });

    it("should validate visit status update schema with allowed status values", () => {
      const validUpdate = { status: "accepted" };
      const parsed = PropertyVisitUpdateStatusSchema.safeParse(validUpdate);
      expect(parsed.success).toBe(true);

      const invalidUpdate = { status: "unknown_status" };
      const parsedInvalid = PropertyVisitUpdateStatusSchema.safeParse(invalidUpdate);
      expect(parsedInvalid.success).toBe(false);
    });
  });
});
