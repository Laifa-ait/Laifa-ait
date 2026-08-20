import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../services/api/products.api";
import { queryKeys } from "../lib/queryKeys";

export const useProductLogic = () => {
  const { id } = useParams<{ id: string }>();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showStickyBuyBar, setShowStickyBuyBar] = useState(false);

  // Fetch product detail via React Query
  const { data: detailData, isLoading: isProductLoading } = useQuery({
    queryKey: queryKeys.products.detail(id || ""),
    queryFn: () => productsApi.getProductById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch reviews via React Query
  const { data: reviewsData } = useQuery({
    queryKey: queryKeys.products.reviews(id || ""),
    queryFn: () => productsApi.getProductReviews(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const product = detailData?.product || null;
  const shop = detailData?.shop || null;
  const reviews = reviewsData || [];

  // Scroll to top & side effects when product changes
  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    if (!product) return;

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }

    // Track recently viewed products
    try {
      const stored = localStorage.getItem("olma_recently_viewed");
      let recents: string[] = stored ? JSON.parse(stored) : [];
      recents = recents.filter((productId) => productId !== product.id);
      recents.unshift(product.id);
      if (recents.length > 20) recents = recents.slice(0, 20);
      localStorage.setItem("olma_recently_viewed", JSON.stringify(recents));
    } catch (storageErr) {
      console.error("Could not update recently viewed:", storageErr);
    }
  }, [product, selectedColor, selectedSize]);

  const images = useMemo(() => {
    if (!product) return [];
    return [product.images?.[0] || product.image, ...(product.images?.slice(1) || [])].filter(Boolean) as string[];
  }, [product]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    const isFlashActive = !!(
      product.flashSaleActive &&
      product.flashPrice &&
      (!product.flashEndDate || new Date(product.flashEndDate).getTime() > Date.now())
    );
    if (isFlashActive) return product.flashPrice;
    return product.promoPrice || product.price;
  }, [product]);

  return {
    product,
    shop,
    loading: isProductLoading,
    selectedImageIndex,
    setSelectedImageIndex,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    showVideo,
    setShowVideo,
    isLightboxOpen,
    setIsLightboxOpen,
    showStickyBuyBar,
    setShowStickyBuyBar,
    images,
    currentPrice,
    reviews,
  };
};
