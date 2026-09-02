import { vi } from "vitest";

export const mockGet = vi.fn();
export const mockSet = vi.fn();
export const mockDelete = vi.fn();
export const mockUpdate = vi.fn();
export const mockAdd = vi.fn();

export const mockStartAfter = vi.fn();
export const mockLimit = vi.fn();
export const mockOrderBy = vi.fn();
export const mockWhere = vi.fn();
export const mockDoc = vi.fn();
export const mockCollection = vi.fn();
export const mockRunTransaction = vi.fn();

export const mockFieldValue = {
  serverTimestamp: vi.fn(() => "mock-timestamp"),
  increment: vi.fn((val) => ({ val, type: "increment" })),
};

export const mockAdmin = {
  firestore: {
    FieldValue: mockFieldValue,
  },
};

export const resetFirebaseMocks = () => {
  mockGet.mockReset();
  mockSet.mockReset();
  mockDelete.mockReset();
  mockUpdate.mockReset();
  mockAdd.mockReset();
  mockStartAfter.mockReset();
  mockLimit.mockReset();
  mockOrderBy.mockReset();
  mockWhere.mockReset();
  mockDoc.mockReset();
  mockCollection.mockReset();
  mockRunTransaction.mockReset();

  // Establish chainable mock implementations as default
  mockCollection.mockImplementation(() => ({
    doc: mockDoc,
    where: mockWhere,
    limit: mockLimit,
    get: mockGet,
    add: mockAdd,
  }));

  mockDoc.mockImplementation(() => ({
    collection: mockCollection,
    get: mockGet,
    set: mockSet,
    delete: mockDelete,
    update: mockUpdate,
  }));

  mockWhere.mockImplementation(() => ({
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: mockLimit,
    get: mockGet,
  }));

  mockOrderBy.mockImplementation(() => ({
    startAfter: mockStartAfter,
    limit: mockLimit,
    get: mockGet,
  }));

  mockStartAfter.mockImplementation(() => ({
    limit: mockLimit,
    get: mockGet,
  }));

  mockLimit.mockImplementation(() => ({
    get: mockGet,
  }));
};

// Apply initial setup
resetFirebaseMocks();
