import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockCollection,
  mockDoc,
  mockSet,
  mockDelete,
  mockGet,
  mockSendEachForMulticast,
} = vi.hoisted(() => ({
  mockCollection: vi.fn(),
  mockDoc: vi.fn(),
  mockSet: vi.fn(),
  mockDelete: vi.fn(),
  mockGet: vi.fn(),
  mockSendEachForMulticast: vi.fn(),
}));

vi.mock("../config/firebase-admin", () => {
  return {
    admin: {
      firestore: {
        FieldValue: {
          serverTimestamp: vi.fn(() => "server-timestamp"),
        },
      },
      messaging: () => ({
        sendEachForMulticast: mockSendEachForMulticast,
      }),
    },
    db: {
      collection: mockCollection,
    },
  };
});

import { PushNotificationService } from "../domains/notifications/services/PushNotificationService";

describe("PushNotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCollection.mockImplementation(() => ({
      doc: mockDoc,
      get: mockGet,
    }));

    mockDoc.mockImplementation(() => ({
      collection: mockCollection,
      set: mockSet,
      delete: mockDelete,
      get: mockGet,
    }));
  });

  it("should register push token successfully", async () => {
    await PushNotificationService.registerPushToken("user-123", "fcm-token-abc", "ios");

    expect(mockCollection).toHaveBeenCalledWith("users");
    expect(mockDoc).toHaveBeenCalledWith("user-123");
    expect(mockCollection).toHaveBeenCalledWith("pushTokens");
    expect(mockSet).toHaveBeenCalledWith({
      token: "fcm-token-abc",
      uid: "user-123",
      deviceType: "ios",
      updatedAt: "server-timestamp",
    });
  });

  it("should unregister push token successfully", async () => {
    await PushNotificationService.unregisterPushToken("user-123", "fcm-token-abc");

    expect(mockCollection).toHaveBeenCalledWith("users");
    expect(mockDoc).toHaveBeenCalledWith("user-123");
    expect(mockCollection).toHaveBeenCalledWith("pushTokens");
    expect(mockDelete).toHaveBeenCalled();
  });

  it("should throw error if push token is invalid on registration", async () => {
    await expect(PushNotificationService.registerPushToken("user-123", "")).rejects.toThrow("INVALID_PUSH_TOKEN");
  });

  it("should throw error if push token is invalid on unregistration", async () => {
    await expect(PushNotificationService.unregisterPushToken("user-123", "")).rejects.toThrow("INVALID_PUSH_TOKEN");
  });

  it("should send messaging push successfully", async () => {
    // Mock blocked check
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ isBlocked: false }),
    });

    // Mock logs check (idempotency)
    mockGet.mockResolvedValueOnce({
      exists: false,
    });

    // Mock fetch recipient push tokens
    mockGet.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          id: "token-hash-1",
          data: () => ({ token: "fcm-token-123" }),
        },
      ],
    });

    mockSendEachForMulticast.mockResolvedValueOnce({
      successCount: 1,
      failureCount: 0,
      responses: [{ success: true }],
    });

    await PushNotificationService.sendMessagingPush("conv-1", "sender-abc", "recipient-xyz", {
      messageId: "msg-123",
      text: "Hello testing notifications",
      violationDetected: false,
    });

    expect(mockSendEachForMulticast).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalled();
  });
});
