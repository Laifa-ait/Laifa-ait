import { apiGet, apiPost, apiPut, apiDelete } from "../../lib/api";
import { HomepageSection } from "../../domains/home/homepage.types";

export interface CategoryV2Config {
  id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  gradient?: string;
  featuredProductIds?: string[];
  subImages?: Record<string, string>;
  updatedAt?: string;
}

export interface VersionSnapshot {
  id: string;
  name: string;
  sections: HomepageSection[];
  categories?: CategoryV2Config[];
  adminEmail: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const adminHomepageApi = {
  getSections: async (): Promise<HomepageSection[]> => {
    const res = await apiGet<ApiResponse<HomepageSection[]>>("/api/v1/admin/homepage/sections");
    return res.data || [];
  },

  createSection: async (section: Partial<HomepageSection>): Promise<HomepageSection> => {
    const res = await apiPost<ApiResponse<HomepageSection>>("/api/v1/admin/homepage/sections", section);
    return res.data;
  },

  updateSection: async (id: string, section: Partial<HomepageSection>): Promise<HomepageSection> => {
    const res = await apiPut<ApiResponse<HomepageSection>>(`/api/v1/admin/homepage/sections/${id}`, section);
    return res.data;
  },

  deleteSection: async (id: string): Promise<void> => {
    await apiDelete<ApiResponse<{ id: string }>>(`/api/v1/admin/homepage/sections/${id}`);
  },

  reorderSections: async (orderedIds: string[]): Promise<void> => {
    await apiPut<ApiResponse<{ count: number }>>("/api/v1/admin/homepage/sections/reorder", { orderedIds });
  },

  getCategories: async (): Promise<CategoryV2Config[]> => {
    const res = await apiGet<ApiResponse<CategoryV2Config[]>>("/api/v1/admin/homepage/categories");
    return res.data || [];
  },

  updateCategory: async (id: string, config: Partial<CategoryV2Config>): Promise<CategoryV2Config> => {
    const res = await apiPut<ApiResponse<CategoryV2Config>>(`/api/v1/admin/homepage/categories/${id}`, config);
    return res.data;
  },

  getVersions: async (): Promise<VersionSnapshot[]> => {
    const res = await apiGet<ApiResponse<VersionSnapshot[]>>("/api/v1/admin/homepage/versions");
    return res.data || [];
  },

  createVersion: async (name?: string): Promise<VersionSnapshot> => {
    const res = await apiPost<ApiResponse<VersionSnapshot>>("/api/v1/admin/homepage/versions", { name });
    return res.data;
  },

  restoreVersion: async (id: string): Promise<void> => {
    await apiPost<ApiResponse<{ restoredCount: number }>>(`/api/v1/admin/homepage/versions/${id}/restore`, {});
  },

  deleteVersion: async (id: string): Promise<void> => {
    await apiDelete<ApiResponse<{ id: string }>>(`/api/v1/admin/homepage/versions/${id}`);
  },

  syncCache: async (): Promise<void> => {
    await apiPost<ApiResponse<{ message: string }>>("/api/v1/admin/homepage/sync-cache", {});
  },
};
