import { apiGet } from '../../lib/api';
import { HomepageSection, Banner } from '../../domains/home/homepage.types';
import { Product } from '../../domains/product/product.types';

export interface HomeTag {
  id: string;
  name: string;
  slug?: string;
}

export interface HomeCategory {
  id: string;
  name: string;
  image?: string;
  slug?: string;
  title?: string;
  subtitle?: string;
  gradient?: string;
  featuredProductIds?: string[];
}

export interface HomeSeller {
  id: string;
  shopName: string;
  logoUrl?: string;
  verified?: boolean;
  trustScore?: number;
}

export interface HomeDataResponse {
  banners?: Banner[];
  tags?: HomeTag[];
  sections?: HomepageSection[];
  featuredProducts?: Product[];
  categories?: HomeCategory[];
  sellers?: HomeSeller[];
}

export const homeApi = {
  getHomeData: async (): Promise<HomeDataResponse> => {
    return apiGet<HomeDataResponse>('/api/v1/public/home-data');
  },
};
