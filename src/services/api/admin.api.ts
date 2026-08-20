import { apiGet } from '../../lib/api';

export interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  image?: string;
  banner?: string;
  parentId?: string | null;
}

export interface AdminCategoriesResponse {
  categories: CategoryItem[];
}

export const adminApi = {
  getAdminCategories: async (): Promise<AdminCategoriesResponse> => {
    return apiGet<AdminCategoriesResponse>('/api/v1/admin/categories');
  },
};
