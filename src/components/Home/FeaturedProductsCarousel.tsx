import React, { useEffect, useState, useMemo } from "react";
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
  sellerId?: string;
  rating?: number;
}

interface FeaturedProductsCarouselProps {
  products?: Product[];
}

export const FeaturedProductsCarousel: React.FC<FeaturedProductsCarouselProps> = ({ products: initialProducts }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(!initialProducts || initialProducts.length === 0);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isRTL = i18n.dir() === "rtl" || lang === "ar";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setAllProducts(initialProducts);
      setLoading(false);
      return;
    }
    const fetchFeatured = async () => {
      try {
        const data = await apiGet<{ products?: FeaturedApiProduct[] }>("/api/v1/ui-elements/homepage_featured");
        const items: Product[] = (data?.products || []).map((p) => ({
          id: p.productId || p.id || "",
          name: p.name,
          price: p.price,
          promoPrice: p.promoPrice,
          image: p.image || "/images/placeholders/product.svg",
          category: p.category || "",
          sellerName: p.sellerName || "",
          sellerId: p.sellerId || "",
          wilaya: "",
          rating: p.rating || 5,
          description: "",
          stock: 99,
          status: "approved" as const,
        }));
        setAllProducts(items);
      } catch {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [initialProducts]);

  const displayProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const hasFlash = typeof p.flashPrice === "number" && p.flashPrice > 0 && p.flashPrice < p.price;
      const hasPromo = typeof p.promoPrice === "number" && p.promoPrice > 0 && p.promoPrice < p.price;
      return hasFlash || hasPromo;
    });
  }, [allProducts]);

  const itemsPerPage = isMobile ? 4 : Math.min(8, displayProducts.length || 1);
  const totalPages = Math.max(1, Math.ceil(displayProducts.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(0);
  }, [isMobile]);

  const handleNext = () => setCurrentPage((prev) => (isRTL ? (prev - 1 + totalPages) % totalPages : (prev + 1) % totalPages));
  const handlePrev = () => setCurrentPage((prev) => (isRTL ? (prev + 1) % totalPages : (prev - 1 + totalPages) % totalPages));

  const currentProducts = displayProducts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  if (loading) {
    return (
      <div className="w-full bg-transparent py-8 px-4">
        <div className="w-full max-w-[90rem] mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-zinc-200 animate-pulse rounded-2xl border border-zinc-200" />
          ))}
        </div>
      </div>
    );
  }

  if (displayProducts.length === 0) return null;

  return (
    <section className="mb-6 sm:mb-8 bg-transparent relative z-20">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 p-5 sm:p-6 lg:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 pb-2 px-2 gap-4">
            <div className="flex flex-col items-start text-start justify-center">
              <span className="text-xs font-sans font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-2 select-none">
                {t("home.promotions_badge", "Bons Plans")}
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-zinc-900 leading-[1.1] mb-1.5 tracking-tight">
                {t("home.promotions_of_the_moment", "Promotions du moment")}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 font-medium">
                {t("home.promotions_subtitle", "Profitez des meilleures réductions et ventes flash en Algérie")}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
              {totalPages > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={handlePrev}
                    className="w-10 h-10 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors active:scale-95 shadow-sm cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-10 h-10 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors active:scale-95 shadow-sm cursor-pointer"
                    aria-label="Next page"
                  >
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              )}
              <button
                onClick={() => navigate("/shop")}
                className="group flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-zinc-900 text-white font-sans font-medium text-xs sm:text-sm hover:bg-zinc-800 active:scale-95 transition-all shadow-md cursor-pointer border-none"
              >
                <span>{t("home.featured.explore_all", "TOUT EXPLORER")}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mt-4 sm:mt-6 pb-6">
            {currentProducts.map((product, idx) => {
              const isPromo = Boolean(product.promoPrice && product.promoPrice < product.price) || Boolean(product.flashPrice && product.flashPrice < product.price);
              const translatedName = getTranslatedField(product, "name", lang) || product.name;
              const coverImage = getOptimizedImageUrl(product.image, 800) || "/images/placeholders/product.svg";
              const bentoClass = idx === 0 ? "col-span-2 row-span-2 aspect-square" : "col-span-1 row-span-1 aspect-square";

              return (
                <div key={`${product.id}-${currentPage}-${idx}`} className={`${bentoClass} transition-all duration-300 hover:-translate-y-0.5`}>
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer w-full h-full transition-all duration-300 ease-out bg-white border border-zinc-200/70 shadow-sm hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-zinc-900/5 mix-blend-multiply group-hover:bg-zinc-900/10 transition-colors duration-500 z-10 pointer-events-none" />
                    <img
                      src={coverImage}
                      alt={translatedName}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/placeholders/product.svg"; }}
                    />
                    <div className="absolute top-4 start-4 z-20 flex flex-col gap-2 items-start">
                      {idx === 0 && (
                        <span className="bg-white/90 backdrop-blur-md text-zinc-800 text-xs font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm select-none border border-zinc-200/50">
                          {t("unique_artisan_piece", "Pièce Unique Artisanale")}
                        </span>
                      )}
                      {isPromo && (
                        <span className="bg-rose-600 text-white text-xs font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm select-none">
                          {t("promo_label", "💎 Promo")}
                        </span>
                      )}
                      <span className="bg-zinc-900/80 backdrop-blur-md text-white border border-white/20 text-xs font-sans font-medium uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm select-none">
                        {product.category || t("premium_label", "Premium")}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-1/2 z-[1] bg-gradient-to-t from-zinc-900/90 via-zinc-900/30 to-transparent pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5 flex flex-col items-start justify-end h-full">
                      <h4 className="font-sans font-bold text-white text-base sm:text-lg leading-tight drop-shadow-sm line-clamp-2 mb-1.5 w-full">
                        {translatedName}
                      </h4>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-sans font-semibold text-zinc-200 text-sm sm:text-base whitespace-nowrap" dir="ltr">
                          {formatPrice(product.flashPrice || product.promoPrice || product.price)}
                        </span>
                        <div className="text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all -translate-x-2 rtl:translate-x-2">
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
