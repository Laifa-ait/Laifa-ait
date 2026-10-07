import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../domains/product/product.types";
import { ProductCard } from "../Product/ProductCard";
import { MobileSwipeIndicator } from "../ui/MobileSwipeIndicator";

interface SectionLayoutProps {
  products: Product[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  cardStyle?: string;
  styleVariant?: string;
  limit?: number;
}

export const CarouselLayout: React.FC<SectionLayoutProps> = ({
  products,
  isLoading,
  hasMore,
  loadMore,
  cardStyle,
  styleVariant = "clean",
  limit = 8,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      const scrollAmount = clientWidth * 0.75;
      containerRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, products]);

  if (isLoading && products.length === 0) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {[...Array(limit)].map((_, i) => (
          <div
            key={i}
            className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.666rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)] shrink-0 aspect-[3/4] bg-white/20 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative group/carousel">
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white text-slate-800 border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 hover:scale-105 active:scale-95 transition-all shadow-md md:flex hidden cursor-pointer"
          aria-label={t("Précédent")}
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
      )}

      <div
        ref={containerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory flex-nowrap"
      >
        {products.map((product, i) => (
          <div
            key={`${product.id}-${i}`}
            className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.666rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)] shrink-0 snap-start"
          >
            <ProductCard product={product} index={i} sectionStyle={cardStyle} styleVariant={styleVariant} />
          </div>
        ))}

        {hasMore && (
          <div className="shrink-0 flex items-center justify-center px-4">
            <button
              type="button"
              onClick={loadMore}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 hover:text-emerald-700 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border border-slate-200 shadow-xs"
            >
              {t("Charger plus")}
            </button>
          </div>
        )}
      </div>

      {showRightArrow && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white text-slate-800 border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 hover:scale-105 active:scale-95 transition-all shadow-md md:flex hidden cursor-pointer"
          aria-label={t("Suivant")}
        >
          <ChevronRight className="w-5 h-5 text-slate-700" />
        </button>
      )}

      <MobileSwipeIndicator className="-mt-2 mb-1" />
    </div>
  );
};

export const StandardGridLayout: React.FC<SectionLayoutProps> = ({
  products,
  isLoading,
  hasMore,
  loadMore,
  cardStyle,
  styleVariant = "clean",
  limit = 8,
}) => {
  const { t } = useTranslation();

  if (isLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-slate-200/60 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product, i) => (
          <div key={`${product.id}-${i}`}>
            <ProductCard product={product} index={i} sectionStyle={cardStyle} styleVariant={styleVariant} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={loadMore}
            className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 hover:text-emerald-700 border border-slate-200 shadow-xs text-xs font-bold transition-all cursor-pointer"
          >
            {t("Voir plus de produits")}
          </button>
        </div>
      )}
    </div>
  );
};

export const BentoHeroLayout: React.FC<SectionLayoutProps> = ({
  products,
  isLoading,
  cardStyle,
  styleVariant = "clean",
  limit = 6,
}) => {
  if (isLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 aspect-[3/4] bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;
  const [heroProduct, ...secondaryProducts] = products;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4">
      {/* Featured Lead Product Card */}
      {heroProduct && (
        <div className="md:col-span-5 flex flex-col">
          <div className="relative h-full">
            <span className="absolute top-3 left-3 z-30 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white shadow-md">
              <Zap className="w-3 h-3 fill-current" /> Vedette
            </span>
            <ProductCard product={heroProduct} index={0} sectionStyle={cardStyle} styleVariant={styleVariant} variant="premium_immersive" />
          </div>
        </div>
      )}

      {/* Complementary Products Grid */}
      <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {secondaryProducts.slice(0, limit - 1).map((p, i) => (
          <div key={p.id}>
            <ProductCard product={p} index={i + 1} sectionStyle={cardStyle} styleVariant={styleVariant} />
          </div>
        ))}
      </div>
    </div>
  );
};
