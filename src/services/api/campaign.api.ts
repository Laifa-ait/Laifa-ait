import { apiGet } from '../../lib/api';
import { Product } from '../../domains/product/product.types';

export interface BannerCampaign {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  desktopImage?: string;
  products?: Product[];
  translations?: Record<string, Record<string, string>>;
  [key: string]: unknown;
}

export const campaignApi = {
  getBannerCampaign: async (bannerId: string): Promise<BannerCampaign> => {
    return apiGet<BannerCampaign>(`/api/v1/banners/${encodeURIComponent(bannerId)}`);
  },
};
