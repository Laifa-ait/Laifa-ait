import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../services/api/products.api';
import { campaignApi } from '../../services/api/campaign.api';
import { queryKeys } from '../../lib/queryKeys';

export const useProducts = (category?: string, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.products.category(category || '', limit),
    queryFn: () => productsApi.getProducts({ category, limit }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedProducts = (limit = 100, offset = 0) => {
  return useQuery({
    queryKey: queryKeys.products.featured(limit, offset),
    queryFn: () => productsApi.getFeaturedProducts(limit, offset),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFlashSaleProducts = (limit = 100, offset = 0) => {
  return useQuery({
    queryKey: queryKeys.products.flashSales(limit),
    queryFn: () => productsApi.getFlashSaleProducts(limit, offset),
    staleTime: 2 * 60 * 1000,
  });
};

export const useTagProducts = (tagId: string) => {
  return useQuery({
    queryKey: queryKeys.products.tag(tagId),
    queryFn: () => productsApi.getTagProducts(tagId),
    staleTime: 5 * 60 * 1000,
    enabled: !!tagId,
  });
};

export const useCollectionProducts = (collectionName: string) => {
  return useQuery({
    queryKey: queryKeys.products.collection(collectionName),
    queryFn: () => productsApi.getCollectionProducts(collectionName),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCampaignBanner = (bannerId: string) => {
  return useQuery({
    queryKey: queryKeys.campaign.banner(bannerId),
    queryFn: () => campaignApi.getBannerCampaign(bannerId),
    staleTime: 5 * 60 * 1000,
    enabled: !!bannerId,
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => productsApi.getProductById(productId),
    staleTime: 5 * 60 * 1000,
    enabled: !!productId,
  });
};
