import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockCollection,
  mockAdd,
  mockUpdate,
  mockSet,
  mockDocGet,
  mockOrderBy,
  mockWhere,
  mockCountGet,
  mockLimit,
} = vi.hoisted(() => ({
  mockCollection: vi.fn(),
  mockAdd: vi.fn(),
  mockUpdate: vi.fn(),
  mockSet: vi.fn(),
  mockDocGet: vi.fn(),
  mockOrderBy: vi.fn(),
  mockWhere: vi.fn(),
  mockCountGet: vi.fn(),
  mockLimit: vi.fn(),
}));

vi.mock("../config/firebase-admin", () => {
  return {
    db: {
      collection: mockCollection,
    },
  };
});

import { FirebaseNewsletterRepository } from "../domains/newsletter/newsletter.repository";

describe("FirebaseNewsletterRepository", () => {
  let repository: FirebaseNewsletterRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new FirebaseNewsletterRepository();

    // Default mock behavior
    mockCollection.mockImplementation(() => ({
      add: mockAdd,
      doc: vi.fn((_id) => ({
        update: mockUpdate,
        set: mockSet,
        get: mockDocGet,
      })),
      orderBy: mockOrderBy,
      where: mockWhere,
    }));

    mockOrderBy.mockImplementation(() => ({
      limit: mockLimit,
    }));

    mockLimit.mockImplementation(() => ({
      get: vi.fn(async () => ({
        docs: [
          { id: "doc-1", data: () => ({ email: "test1@example.com", createdAt: "2026-09-01" }) },
          { id: "doc-2", data: () => ({ email: "test2@example.com", createdAt: "2026-09-01" }) },
        ],
      })),
    }));

    mockWhere.mockImplementation(() => ({
      count: vi.fn(() => ({
        get: mockCountGet,
      })),
    }));
  });

  it("should add a campaign successfully", async () => {
    mockAdd.mockResolvedValueOnce({ id: "campaign-123" });
    const data = { title: "Summer Sale", content: "Sale is here!" };
    const id = await repository.addCampaign(data);

    expect(mockCollection).toHaveBeenCalledWith("newsletter_campaigns");
    expect(mockAdd).toHaveBeenCalledWith(data);
    expect(id).toBe("campaign-123");
  });

  it("should update a campaign successfully", async () => {
    mockUpdate.mockResolvedValueOnce(undefined);
    const updates = { status: "sent" };
    await repository.updateCampaign("campaign-123", updates);

    expect(mockCollection).toHaveBeenCalledWith("newsletter_campaigns");
    expect(mockUpdate).toHaveBeenCalledWith(updates);
  });

  it("should get campaigns ordered and limited", async () => {
    const campaigns = await repository.getCampaigns(5);

    expect(mockCollection).toHaveBeenCalledWith("newsletter_campaigns");
    expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc");
    expect(mockLimit).toHaveBeenCalledWith(5);
    expect(campaigns).toEqual([
      { id: "doc-1", email: "test1@example.com", createdAt: "2026-09-01" },
      { id: "doc-2", email: "test2@example.com", createdAt: "2026-09-01" },
    ]);
  });

  it("should get subscribers count by status", async () => {
    mockCountGet.mockResolvedValueOnce({
      data: () => ({ count: 42 }),
    });

    const count = await repository.getSubscribersCount("active");

    expect(mockCollection).toHaveBeenCalledWith("newsletter_subscribers");
    expect(mockWhere).toHaveBeenCalledWith("status", "==", "active");
    expect(count).toBe(42);
  });

  it("should get subscribers with default limit", async () => {
    const subscribers = await repository.getSubscribers();

    expect(mockCollection).toHaveBeenCalledWith("newsletter_subscribers");
    expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc");
    expect(mockLimit).toHaveBeenCalledWith(500);
    expect(subscribers).toEqual([
      { id: "doc-1", email: "test1@example.com", createdAt: "2026-09-01" },
      { id: "doc-2", email: "test2@example.com", createdAt: "2026-09-01" },
    ]);
  });

  it("should add subscriber successfully", async () => {
    mockAdd.mockResolvedValueOnce({ id: "sub-123" });
    const subscriberData = { email: "new@example.com", status: "active" };
    const id = await repository.addSubscriber(subscriberData);

    expect(mockCollection).toHaveBeenCalledWith("newsletter_subscribers");
    expect(mockAdd).toHaveBeenCalledWith(subscriberData);
    expect(id).toBe("sub-123");
  });

  it("should get global settings if existing", async () => {
    mockDocGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ enabled: true, frequency: "weekly" }),
    });

    const settings = await repository.getSettings();

    expect(mockCollection).toHaveBeenCalledWith("global_settings");
    expect(settings).toEqual({ enabled: true, frequency: "weekly" });
  });

  it("should return null if global settings do not exist", async () => {
    mockDocGet.mockResolvedValueOnce({
      exists: false,
    });

    const settings = await repository.getSettings();

    expect(settings).toBeNull();
  });

  it("should update global settings", async () => {
    mockSet.mockResolvedValueOnce(undefined);
    const settings = { enabled: false };
    await repository.updateSettings(settings);

    expect(mockCollection).toHaveBeenCalledWith("global_settings");
    expect(mockSet).toHaveBeenCalledWith(settings, { merge: true });
  });
});
