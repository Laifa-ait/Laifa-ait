import { useQuery } from "@tanstack/react-query";
import { homeApi } from "../services/api/home.api";
import { queryKeys } from "../lib/queryKeys";

export const useHomeData = () => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.home.data(),
    queryFn: () => homeApi.getHomeData(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache TTL
  });

  return {
    dbBanners: data?.banners || [],
    dbTags: data?.tags || [],
    isBannersLoading: isLoading,
    homepageSections: data?.sections || [],
    featuredProducts: data?.featuredProducts || [],
    isLoadingProducts: isLoading,
    customCategories: data?.categories || [],
    dbSellers: data?.sellers || [],
    isSellersLoading: isLoading,
  };
};
