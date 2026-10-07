import { useState, useEffect, useCallback } from "react";
import { HomepageSection } from "../domains/home/homepage.types";
import { Product } from "../domains/product/product.types";

export interface UseSectionProductsResult {
  products: Product[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useSectionProducts(section: HomepageSection): UseSectionProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [limitState, setLimitState] = useState(8);

  const sectionId = section.id;
  const sectionCategory = section.category;
  const sectionTag = section.tag;
  const sectionType = section.type;
  const sectionLimit = section.limit;
  const sectionRulesMaxItems = section.rules?.maxItems;
  const manualProductsKey = section.manualProducts ? section.manualProducts.join(",") : "";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setLimitState(8);
      else if (window.innerWidth >= 768) setLimitState(6);
      else setLimitState(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const buildQueryUrl = useCallback(
    (offset = 0, fetchLimit: number) => {
      if (section.manualProducts && section.manualProducts.length > 0) {
        const idList = section.manualProducts.slice(offset, offset + fetchLimit);
        return idList.length > 0 ? `/api/v1/products?ids=${idList.join(",")}` : "";
      }
      if (sectionCategory) {
        return `/api/v1/products?category=${encodeURIComponent(sectionCategory)}&limit=${fetchLimit}&offset=${offset}`;
      }
      if (sectionTag) {
        return `/api/v1/products?tag=${encodeURIComponent(sectionTag)}&limit=${fetchLimit}&offset=${offset}`;
      }
      if (sectionType === "flash_sale") {
        return `/api/v1/products?flash=true&limit=${fetchLimit}&offset=${offset}`;
      }
      return `/api/v1/products?limit=${fetchLimit}&offset=${offset}`;
    },
    [section.manualProducts, sectionCategory, sectionTag, sectionType]
  );

  useEffect(() => {
    let isCancelled = false;
    const fetchInitial = async () => {
      setIsLoading(true);
      const targetLimit = sectionLimit || sectionRulesMaxItems || limitState;
      const url = buildQueryUrl(0, targetLimit);

      if (!url) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP products query failed");
        const data = await res.json();
        const docs: Product[] = data.products || [];
        const inStockDocs = docs.filter((d) => d && (d.stock === undefined || d.stock > 0));

        if (!isCancelled) {
          setProducts(inStockDocs);
          if (section.manualProducts && section.manualProducts.length > 0) {
            setHasMore(section.manualProducts.length > targetLimit);
          } else {
            setHasMore(docs.length === targetLimit);
          }
        }
      } catch {
        if (!isCancelled) setProducts([]);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchInitial();
    return () => {
      isCancelled = true;
    };
  }, [
    sectionId,
    sectionCategory,
    sectionTag,
    sectionType,
    sectionLimit,
    sectionRulesMaxItems,
    manualProductsKey,
    limitState,
    buildQueryUrl,
    section.manualProducts,
  ]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    const fetchLimit = 6;
    const url = buildQueryUrl(products.length, fetchLimit);

    if (!url) {
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP loadMore query failed");
      const data = await res.json();
      const docs: Product[] = data.products || [];
      const validDocs = docs.filter((d) => d && (d.stock === undefined || d.stock > 0));

      setProducts((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const added = validDocs.filter((p) => !existing.has(p.id));
        return [...prev, ...added];
      });

      if (section.manualProducts && section.manualProducts.length > 0) {
        setHasMore(products.length + docs.length < section.manualProducts.length);
      } else {
        setHasMore(docs.length === fetchLimit);
      }
    } catch {
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, buildQueryUrl, products.length, section.manualProducts]);

  return { products, isLoading, hasMore, loadMore };
}
