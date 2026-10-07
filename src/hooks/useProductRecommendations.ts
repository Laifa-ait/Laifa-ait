import { useState, useEffect } from "react";
import { Product } from "../domains/product/product.types";
import { useShop } from "../context/ShopContext";
import { UserAffinityAccumulator } from "../services/UserAffinityAccumulator";

export function useProductRecommendations(product: Product | null) {
  const { fetchProductsByCategory, fetchCrossSellProducts, fetchFeaturedProducts } = useShop();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingRecom, setLoadingRecom] = useState(true);

  useEffect(() => {
    if (!product) return;

    UserAffinityAccumulator.track({
      productId: product.id,
      category: product.category,
      subcategory: product.subcategory,
      price: Number(product.promoPrice || product.price) || 0,
      type: "view",
      timestamp: Date.now(),
    });

    const loadRecommendations = async () => {
      try {
        setLoadingRecom(true);
        let list: Product[] = [];
        if (product.category) {
          const sameCategory = await fetchProductsByCategory(product.category, 12);
          list = (sameCategory || []).filter((p) => p.id !== product.id);
        }
        if (list.length < 6) {
          const fallback = await fetchCrossSellProducts(product, 8);
          const seen = new Set(list.map((p) => p.id));
          for (const item of fallback || []) {
            if (item.id !== product.id && !seen.has(item.id)) {
              list.push(item);
              seen.add(item.id);
            }
          }
        }
        if (list.length < 4) {
          const featured = await fetchFeaturedProducts(8);
          const seen = new Set(list.map((p) => p.id));
          for (const item of featured || []) {
            if (item.id !== product.id && !seen.has(item.id)) {
              list.push(item);
              seen.add(item.id);
            }
          }
        }
        setRecommendedProducts(list.slice(0, 8));
      } catch (err) {
        console.error("Error loading recommended products", err);
      } finally {
        setLoadingRecom(false);
      }
    };

    loadRecommendations();
  }, [product, fetchProductsByCategory, fetchCrossSellProducts, fetchFeaturedProducts]);

  return { recommendedProducts, loadingRecom };
}
