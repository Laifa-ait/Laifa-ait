import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../lib/api";
import { ArrowRight, ArrowLeft, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../domains/product/product.types";
import { useCart } from "../../context/CartContext";
import { FeaturedProductCard } from "./FeaturedProductCard";

interface FeaturedApiProduct {
  productId?: string;
  id?: string;
  name: string;
  price: number;
  promoPrice?: number;
  flashPrice?: number;
  image?: string;
  category?: string;
  sellerName?: string;
  sellerId?: string;
  rating?: number;
}

interface FeaturedProductsCarouselProps {
  products?: Product[];
}

export const FeaturedProductsCarousel: React.FC<FeaturedProductsCarouselProps> = ({
  products: initialProducts,
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(!initialProducts || initialProducts.length === 0);
  const [isMobile, setIsMobile] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();
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
        const data = await apiGet<{ products?: FeaturedApiProduct[] }>(
          "/api/v1/ui-elements/homepage_featured"
        );
        const items: Product[] = (data?.products || []).map((p) => ({
          id: p.productId || p.id || "",
          name: p.name,
          price: p.price,
          promoPrice: p.promoPrice,
          flashPrice: p.flashPrice,
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
    const discounted = allProducts.filter((p) => {
      const hasFlash = typeof p.flashPrice === "number" && p.flashPrice > 0 && p.flashPrice < p.price;
      const hasPromo = typeof p.promoPrice === "number" && p.promoPrice > 0 && p.promoPrice < p.price;
      return hasFlash || hasPromo;
    });
    if (discounted.length > 0) return discounted;
    return allProducts.map((p) => ({
      ...p,
      promoPrice: p.promoPrice || Math.round(p.price * 0.88),
    }));
  }, [allProducts]);

  const itemsPerPage = isMobile ? 4 : Math.min(8, displayProducts.length || 1);
  const totalPages = Math.max(1, Math.ceil(displayProducts.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(0);
  }, [isMobile]);

  const handleNext = () =>
    setCurrentPage((prev) => (isRTL ? (prev - 1 + totalPages) % totalPages : (prev + 1) % totalPages));
  const handlePrev = () =>
    setCurrentPage((prev) => (isRTL ? (prev + 1) % totalPages : (prev - 1 + totalPages) % totalPages));

  const handleQuickAdd = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    addToCart(prod);
    setAddedProductId(prod.id);
    setTimeout(() => setAddedProductId(null), 1400);
  };

  const currentProducts = displayProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  if (loading) {
    return (
      <div className="w-full bg-transparent py-6 px-4">
        <div className="w-full max-w-[90rem] mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 pb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-zinc-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (displayProducts.length === 0) return null;

  return (
    <section className="mb-8 sm:mb-12 bg-transparent relative z-20">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200/80 p-5 sm:p-7 lg:p-9 relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-2 gap-4">
            <div className="flex flex-col items-start text-start">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5 fill-rose-600 text-rose-600 animate-pulse" />
                <span>{t("home.flash_badge", "Ventes Flash & Bons Plans")}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-sans font-black text-zinc-950 tracking-tight leading-tight">
                {t("home.promotions_of_the_moment", "Promotions du moment")}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
                {t("home.promotions_subtitle", "Jusqu'à -50% de réduction immédiate sur une sélection limitée")}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
              {totalPages > 1 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="w-10 h-10 rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition-all active:scale-95 shadow-2xs cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-10 h-10 rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition-all active:scale-95 shadow-2xs cursor-pointer"
                    aria-label="Next page"
                  >
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate("/shop?filter=promotions")}
                className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 text-white font-sans font-bold text-xs sm:text-sm hover:bg-zinc-800 active:scale-95 transition-all shadow-md cursor-pointer border-none"
              >
                <span>{t("home.featured.explore_all", "Tout voir")}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5 pt-2">
            {currentProducts.map((product) => (
              <FeaturedProductCard
                key={product.id}
                product={product}
                isAdded={addedProductId === product.id}
                onQuickAdd={handleQuickAdd}
                lang={lang}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
