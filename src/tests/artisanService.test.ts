import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mockCollection,
  mockGet,
  resetFirebaseMocks,
} from "./firebaseMockHelper";

vi.mock("../config/firebase-admin", () => {
  return {
    db: {
      collection: mockCollection,
    },
  };
});

import { ArtisanPublicService } from "../domains/artisan/services/artisanPublic.service";

describe("ArtisanPublicService", () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  it("should return empty list if db is undefined", async () => {
    // temporarily mock db as null/undefined
    const originalDb = (await import("../config/firebase-admin")).db;
    const adminConfig = await import("../config/firebase-admin");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminConfig as any).db = null;

    const res = await ArtisanPublicService.listApprovedArtisans({});
    expect(res).toEqual([]);

    // Restore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminConfig as any).db = originalDb;
  });

  it("should query approved artisans with filter successfully", async () => {
    mockGet.mockResolvedValueOnce({
      docs: [
        {
          id: "art-1",
          data: () => ({
            fullName: "Ahmed Ben",
            professionalName: "Ahmed Custom",
            tradeName: "Carpentry",
            bio: "Expert woodwork",
            specialties: ["table", "chair"],
            commune: "Chéraga",
            wilaya: "16 Alger",
            status: "approved",
          }),
        },
      ],
    });

    const res = await ArtisanPublicService.listApprovedArtisans({
      tradeId: "carp-1",
      wilaya: "16 Alger",
      commune: "Chéraga",
      isAvailable: true,
      search: "Ahmed",
    });

    expect(mockCollection).toHaveBeenCalledWith("artisan_profiles");
    expect(res.length).toBe(1);
    expect(res[0].fullName).toBe("Ahmed Ben");
  });
});
