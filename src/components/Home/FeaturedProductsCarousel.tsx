import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../lib/api";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../domains/product/product.types";
import { getTranslatedField } from "../../utils/translations";
import { formatPrice } from "../../utils/format";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

interface FeaturedApiProduct {
  productId?: string;
  id?: string;
  name: string;
  price: number;
  promoPrice?: number;
  image?: string;
  category?: string;
  sellerName?: string;
  rating?: number;
}

export const FeaturedProductsCarousel: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 100);
    };
    handleResize(); // trigger on mount
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await apiGet<{ products?: FeaturedApiProduct[] }>("/api/v1/ui-elements/homepage_featured");

        let items: Product[] = [];
        if (data && data.products) {
          const aggregated = data.products || [];
          const formatted = aggregated.map((p) => ({
            id: p.productId || p.id || "",
            name: p.name,
            price: p.price,
            promoPrice: p.promoPrice,
            image: p.image,
            category: p.category,
            sellerName: p.sellerName,
            rating: p.rating,
            status: "approved" as const,
          })) as Product[];

          items = formatted;
        }

        setAllProducts(items);
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.warn("Could not fetch featured products:", errMsg);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const displayProducts = [...allProducts];

  const itemsPerPage = isMobile ? 5 : displayProducts.length || 1;
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);

  // Reset page when switching mobile/desktop to avoid out of bounds
  useEffect(() => {
    setCurrentPage(0);
  }, [isMobile]);

  const handleNext = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const handlePrev = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  const currentProducts = displayProducts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  if (loading) {
    return (
      <div className="w-full bg-transparent py-8 px-4">
        <div className="w-full max-w-[90rem] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pb-12">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i, idx) => {
              const bentoClass =
                idx === 0
                  ? "col-span-2 row-span-2 aspect-square md:aspect-[4/4]"
                  : "col-span-1 row-span-1 aspect-[4/5]";
              return (
                <div
                  key={i}
                  className={`${bentoClass} bg-zinc-200 animate-pulse rounded-none border border-zinc-200`}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (allProducts.length === 0) return null;

  return (
    <section className="mb-6 sm:mb-8 bg-transparent relative z-20">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 p-5 sm:p-6 lg:p-8 relative">

        {/* Luxury Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-6 pb-2 relative px-2 gap-6">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-start justify-center relative">
            <div className="flex items-center gap-4 mb-4 select-none">
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.2em] text-zinc-500 uppercase">
                {t("home.featured.title_premium")}
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold text-zinc-900 leading-[1.1] mb-3 tracking-tight">
              {t("home.featured.title_prefix")}
            </h3>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:bg-transparent hover:text-zinc-900 transition-colors active:scale-95 shadow-sm cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:bg-transparent hover:text-zinc-900 transition-colors active:scale-95 shadow-sm cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            )}
            <button
              onClick={() => navigate("/premium-collection")}
              className="group flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white font-sans font-medium text-sm hover:bg-zinc-800 active:scale-95 transition-all shadow-md cursor-pointer border-none"
            >
              {t("home.featured.explore_all")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Neo-Heritage Bento Grid for Featured Products */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mt-4 sm:mt-8 pb-12">
          {currentProducts.map((product, idx) => {
            const isPromo = product.promoPrice && product.promoPrice < product.price;
            const translatedName = getTranslatedField(product, "name", lang) || product.name;
            const coverImage =
              getOptimizedImageUrl(product.image, 800) ||
              "/images/placeholders/product.svg";

            const bentoClass =
              idx === 0
                ? "col-span-2 row-span-2 aspect-square"
                : "col-span-1 row-span-1 aspect-square";

            return (
              <div
                key={`${product.id}-${currentPage}-${idx}`}
                className={`${bentoClass} transition-all duration-300 hover:-translate-y-0.5`}
              >
                <div
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="group relative flex flex-col rounded-2xl sm:rounded-2xl overflow-hidden cursor-pointer w-full h-full transition-all duration-300 ease-out bg-white border border-zinc-200/70 shadow-sm hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-zinc-900/5 mix-blend-multiply group-hover:bg-zinc-900/10 transition-colors duration-500 z-10 pointer-events-none" />

                  <img
                    src={coverImage}
                    alt={translatedName}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/images/placeholders/product.svg";
                    }}
                  />

                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 items-start">
                    {idx === 0 && (
                      <span className="bg-white/90 backdrop-blur-md text-zinc-800 text-[9px] sm:text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm select-none border border-zinc-200/50">
                        {t("PIÈCE UNIQUE ARTISANALE")}
                      </span>
                    )}
                    {isPromo && (
                      <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm select-none">
                        PROMO
                      </span>
                    )}
                    <span className="bg-zinc-900/80 backdrop-blur-md text-white border border-white/20 text-[9px] sm:text-[10px] font-sans font-medium uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm select-none">
                      {product.category || "PREMIUM"}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-1/2 z-[1] bg-gradient-to-t from-zinc-900/90 via-zinc-900/30 to-transparent pointer-events-none transition-opacity duration-300" />

                  <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5 flex flex-col items-start justify-end h-full">
                    <h4 className="font-sans font-bold text-white text-[15px] sm:text-[18px] leading-tight drop-shadow-sm line-clamp-2 transition-colors mb-1.5 w-full">
                      {translatedName}
                    </h4>

                    <div className="flex items-center justify-between w-full">
                      <span
                        className="font-sans font-semibold text-zinc-200 text-[14px] sm:text-[15px] whitespace-nowrap"
                        dir="ltr"
                      >
                        {formatPrice(product.promoPrice || product.price)}
                      </span>
                      <div className="text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all -translate-x-2">
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
};
