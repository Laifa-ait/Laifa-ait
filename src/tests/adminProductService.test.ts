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

import { checkProductExternalContact, AdminProductService } from "../domains/admin/services/adminProduct.service";

describe("AdminProductService", () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  describe("checkProductExternalContact", () => {
    it("should detect Algerian phone numbers", () => {
      expect(checkProductExternalContact("Contact: 0555123456")).toBe(true);
      expect(checkProductExternalContact("No contact info here!")).toBe(false);
    });

    it("should detect email addresses", () => {
      expect(checkProductExternalContact("Mail me at test@olmart.dz")).toBe(true);
    });

    it("should detect web URLs", () => {
      expect(checkProductExternalContact("Visit www.olmart.dz")).toBe(true);
    });
  });

  describe("Firestore Integration Methods", () => {
    it("should list simple categories", async () => {
      mockGet.mockResolvedValueOnce({
        docs: [
          { id: "cat-1", data: () => ({ name: "Mode", slug: "mode" }) },
        ],
      });

      const res = await AdminProductService.listCategoriesSimple();
      expect(mockCollection).toHaveBeenCalledWith("categories");
      expect(res).toEqual([{ id: "cat-1", name: "Mode", slug: "mode" }]);
    });

    it("should list tags", async () => {
      mockGet.mockResolvedValueOnce({
        docs: [
          { id: "tag-1", data: () => ({ name: "Crafts" }) },
        ],
      });

      const res = await AdminProductService.listTags();
      expect(mockCollection).toHaveBeenCalledWith("tags");
      expect(res).toEqual([{ id: "tag-1", name: "Crafts" }]);
    });
  });
});
