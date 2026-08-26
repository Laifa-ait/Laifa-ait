import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowRight,
} from "lucide-react";
import { HomepageSection } from "../../domains/home/homepage.types";
import { Product } from "../../domains/product/product.types";
import { ProductCard } from "../Product/ProductCard";
import { MobileSwipeIndicator } from "../ui/MobileSwipeIndicator";

export const DynamicSection: React.FC<{ section: HomepageSection; isFramed?: boolean }> = ({
  section,
  isFramed = false,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customTheme] = useState<{ name?: string; imageUrl?: string } | null>(null);
  const hasActiveImage = !!customTheme;

  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      const scrollAmount = clientWidth * 0.75;
      const target = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      containerRef.current.scrollTo({
        left: target,
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
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });

      // Delay initial calculation to allow DOM/images to paint expanding the scrollWidth
      handleScroll();
      const t1 = setTimeout(handleScroll, 150);
      const t2 = setTimeout(handleScroll, 500);
      const t3 = setTimeout(handleScroll, 1500);

      let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
      const resizeObserver = new ResizeObserver(() => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleScroll, 150);
      });
      resizeObserver.observe(container);

      return () => {
        container.removeEventListener("scroll", handleScroll);
        resizeObserver.disconnect();
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        if (resizeTimeout) clearTimeout(resizeTimeout);
      };
    }
  }, [handleScroll, products]);

  const [limitState, setLimitState] = useState(10);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // First load limits
        if (products.length === 0 && !isLoading) {
          if (window.innerWidth >= 1024) setLimitState(10);
          else if (window.innerWidth >= 768) setLimitState(8);
          else setLimitState(6);
        }
      }, 150);
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [products.length, isLoading]);

  const sectionId = section.id;
  const sectionCategory = section.category;
  const sectionTag = section.tag;
  const sectionType = section.type;
  const sectionLimit = section.limit;
  const sectionRulesMaxItems = section.rules?.maxItems;
  const manualProductsKey = section.manualProducts ? section.manualProducts.join(",") : "";

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);

      const maxRequested = sectionLimit || sectionRulesMaxItems;
      const fetchLimit = maxRequested || limitState; // Using our dynamic limit

      try {
        let url = "";
        if (section.manualProducts && section.manualProducts.length > 0) {
          const idList = section.manualProducts.slice(0, fetchLimit);
          url = `/api/v1/products?ids=${idList.join(",")}`;
        } else if (sectionCategory) {
          url = `/api/v1/products?category=${encodeURIComponent(sectionCategory)}&limit=${fetchLimit}`;
        } else if (sectionTag) {
          url = `/api/v1/products?tag=${encodeURIComponent(sectionTag)}&limit=${fetchLimit}`;
        } else {
          switch (sectionType) {
            case "flash_sale":
              url = `/api/v1/products?flash=true&limit=${fetchLimit}`;
              break;
            case "new_arrivals":
            case "top_picks":
            case "trending":
            case "recommended":
            default:
              url = `/api/v1/products?limit=${fetchLimit}`;
              break;
          }
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP products query failed");
        const data = await res.json();
        const docs = data.products || [];

        const filteredDocs = (docs as Product[]).filter((d) => d && (d.stock === undefined || d.stock > 0));
        setProducts(filteredDocs);
        
        if (section.manualProducts && section.manualProducts.length > 0) {
          setHasMore(section.manualProducts.length > fetchLimit);
        } else {
          setHasMore(docs.length === fetchLimit);
        }
      } catch (err) {
        (process.env.NODE_ENV === "development" ? console.log : function () {})("Error fetching section items:", err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [
    sectionId,
    sectionCategory,
    sectionTag,
    sectionType,
    sectionLimit,
    sectionRulesMaxItems,
    manualProductsKey,
    limitState,
    section.manualProducts
  ]);

  const loadMore = async () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);

    try {
      const fetchLimit = 6;
      let url = "";

      if (section.manualProducts && section.manualProducts.length > products.length) {
        const nextIds = section.manualProducts.slice(products.length, products.length + fetchLimit);
        if (nextIds.length === 0) {
          setHasMore(false);
          setIsLoading(false);
          return;
        }
        url = `/api/v1/products?ids=${nextIds.join(",")}`;
      } else if (sectionCategory) {
        url = `/api/v1/products?category=${encodeURIComponent(sectionCategory)}&limit=${fetchLimit}&offset=${products.length}`;
      } else if (sectionTag) {
        url = `/api/v1/products?tag=${encodeURIComponent(sectionTag)}&limit=${fetchLimit}&offset=${products.length}`;
      } else {
        switch (sectionType) {
          case "flash_sale":
            url = `/api/v1/products?flash=true&limit=${fetchLimit}&offset=${products.length}`;
            break;
          case "new_arrivals":
          case "top_picks":
          case "trending":
          case "recommended":
          default:
            url = `/api/v1/products?limit=${fetchLimit}&offset=${products.length}`;
            break;
        }
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP products loadMore query failed");
      const data = await res.json();
      const docs = data.products || [];

      const validNewDocs = (docs as Product[]).filter((d) => d && (d.stock === undefined || d.stock > 0));

      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const toAdd = validNewDocs.filter((d) => !existingIds.has(d.id));
        return [...prev, ...toAdd];
      });

      if (section.manualProducts && section.manualProducts.length > 0) {
        setHasMore(products.length + docs.length < section.manualProducts.length);
      } else {
        setHasMore(docs.length === fetchLimit);
      }
    } catch (err) {
      console.error("Error running loadMore:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCustomTheme = async () => {
      if (section.themeImage) {
        setCustomTheme({
          name: section.themeName || "",
          imageUrl: section.themeImage,
        });
      } else if (section.theme && section.theme !== "none") {
        try {
          const themeData = await apiGet<{ name?: string; imageUrl?: string }>(`/api/v1/seasonal-themes/${section.theme}`);
          if (themeData && themeData.imageUrl) {
            setCustomTheme(themeData);
          } else {
            setCustomTheme(null);
          }
        } catch (e) {
          console.error("Error fetching theme:", e);
        }
      } else {
        setCustomTheme(null);
      }
    };
    fetchCustomTheme();
  }, [section.theme, section.themeImage, section.themeName]);

  if (!section.isActive) return null;

  const getSectionTitle = () => {
    const rawValue = section.title || section.name;
    if (!rawValue) {
      switch (section.type) {
        case "new_arrivals":
          return t("home.sections.new_arrivals");
        case "top_picks":
          return t("home.sections.top_picks");
        case "trending":
          return t("home.sections.trending");
        case "flash_sale":
          return t("home.sections.flash_sale");
        default:
          return t("home.sections.default");
      }
    }
    return rawValue;
  };

  const renderHeader = () => {
    const hasImage = hasActiveImage;
    const titleColor = "text-slate-900";
    const subtitleColor = hasImage ? "text-slate-900/80" : "text-slate-900/60";
    const seeMoreLabel = t("home.sections.see_more");

    if (hasImage) {
      return (
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-4 group/header relative border-b border-slate-200/10 pb-3">
          <div className="flex flex-col">
            <h2
              className={`text-xl sm:text-2xl font-black tracking-tight rtl:tracking-normal leading-tight ${titleColor}`}
            >
              {getSectionTitle()}
            </h2>
            {section.subtitle && (
              <p className={`text-xs rtl:text-sm sm:text-sm font-semibold mt-1 max-w-xl leading-snug ${subtitleColor}`}>
                {section.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/collection/" + encodeURIComponent(section.id || getSectionTitle()))}
              className="group relative flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 bg-white/50 hover:bg-white/80 text-[8.5px] font-sans font-bold text-slate-900 uppercase tracking-[0.1em] transition-all cursor-pointer shadow-sm"
            >
              <span>{seeMoreLabel}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-300 text-zinc-900 stroke-[2.5]" />
            </button>

            {userProfile?.role === "admin" && (
              <button
                onClick={() => navigate(`/dashboard/admin/homepage`)}
                className="bg-black/60 text-white font-bold text-[10px] rtl:text-[12px] px-2.5 py-1.5 rounded-full opacity-0 group-hover/header:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
              >
                {t("common.edit")}
              </button>
            )}
          </div>
        </div>
      );
    }

    const titleText = getSectionTitle().toUpperCase();
    const words = titleText.split(" ");
    const headPart = words.slice(0, words.length - 1).join(" ");
    const tailPart = words[words.length - 1] || "";

    return (
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2.5">
        <h3 className="text-lg sm:text-xl font-extralight text-slate-900 tracking-tight rtl:tracking-normal leading-none font-display flex items-center gap-2">
          {section.subtitle && (
            <span className="text-[9px] rtl:text-[11px] font-sans font-bold tracking-[0.15em] text-zinc-900 select-none animate-pulse hidden sm:inline uppercase me-2">
              ✦ {section.subtitle} ✦
            </span>
          )}
          {headPart ? (
            <>
              {headPart}{" "}
              <span className="font-semibold tracking-tighter rtl:tracking-normal text-slate-900">{tailPart}</span>
            </>
          ) : (
            <span className="font-semibold tracking-tighter rtl:tracking-normal text-slate-900">{tailPart}</span>
          )}
        </h3>

        <button
          onClick={() => navigate("/collection/" + encodeURIComponent(section.id || getSectionTitle()))}
          className="group relative flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:bg-transparent text-[8.5px] sm:text-[9.2px] font-bold text-slate-900 uppercase tracking-[0.25em] transition-all shadow-sm hover:shadow-md cursor-pointer animate-fade-in"
        >
          <span>{seeMoreLabel}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-300 text-zinc-900 stroke-[2.5]" />
        </button>
      </div>
    );
  };

  const getCardStyle = () => {
    switch (section.style) {
      case "glass":
        return "bg-white/40 backdrop-blur-md border border-white/60 shadow-sm rounded-[1.5rem] hover:bg-white/60";
      case "minimal":
        return "bg-transparent border border-zinc-200 rounded-[1.5rem] hover:border-zinc-300";
      case "immersive":
        return "bg-slate-900 rounded-[1.5rem] overflow-hidden shadow-lg border border-slate-200/20 hover:shadow-2xl hover:-translate-y-1 relative";
      case "premium":
      default:
        return "bg-white rounded-[1.5rem] shadow-sm border border-teal-800/20 hover:border-teal-800/60 hover:shadow-md hover:-translate-y-1";
    }
  };

  const getGridClasses = () => {
    return "flex gap-4 overflow-x-auto pb-6 desktop-scrollbar snap-x snap-mandatory flex-nowrap";
  };

  const renderThemeWrapper = () => {
    if (!customTheme || !customTheme.imageUrl) return null;

    return (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Real background image, perfectly sharp, gracefully fading out at top and bottom to blend with page color */}
        <div
          className="absolute inset-0 bg-cover bg-center object-cover opacity-90"
          style={{
            backgroundImage: `url('${customTheme.imageUrl}')`,
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        />

        {/* Very subtle gradient overlay to ensure the white text is legible without killing the crispness of the BG */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/30 via-black/10 to-[#FAF8F5]/30" />
      </div>
    );
  };

  if (section.type === "flash_sale") {
    return (
    <section className="mb-6 sm:mb-8 relative z-20">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-5 sm:p-6 lg:p-8 relative">
        <div className="w-full mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center p-1.5 bg-rose-100 text-rose-600 rounded-lg shadow-sm border border-rose-200/60">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-teal-950">
                    {t("home.flash.title", "Ventes Flash")}
                  </h2>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/ventes-flash")}
              className="px-4 py-2 sm:px-6 sm:py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-sans font-medium shadow-sm transition-all active:scale-95 flex items-center gap-2 group border border-teal-600 cursor-pointer shrink-0"
            >
              <span>{t("view_all", "Voir tout")}</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Content */}
          <div className="flex gap-4 overflow-x-auto pb-4 desktop-scrollbar snap-x snap-mandatory">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.666rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(16.666%-0.833rem)] shrink-0 aspect-[2/3] bg-teal-900/5 border border-teal-800/10 animate-pulse rounded-[1.5rem]"
                />
              ))
            ) : products.length > 0 ? (
              <>
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.666rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(16.666%-0.833rem)] shrink-0 snap-start snap-always"
                  >
                    <ProductCard product={product} index={i} variant="flash_sale" />
                  </div>
                ))}
                {hasMore && (
                  <div className="shrink-0 flex items-center justify-center p-4">
                    <button
                      onClick={loadMore}
                      className="px-6 py-3 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap border border-teal-200/50"
                    >
                      {t("Afficher plus")}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-teal-900/50 font-bold text-center py-10 w-full">{t("Aucun produit trouvé.")}</p>
            )}
          </div>
          <MobileSwipeIndicator className="-mt-2 mb-2 text-teal-900/40" />
        </div>
        </div>
      </div>
    </section>
    );
  }

  if (isFramed) {
    return (
      <div className="w-full relative z-10 animate-fade-in">
        {renderHeader()}

        {isLoading ? (
          <div className={getGridClasses()}>
            {[...Array(section.limit || section.rules?.maxItems || 8)].map((_, i) => (
              <div
                key={i}
                className="snap-start snap-always shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)] xl:w-[calc((100%-5rem)/6)] aspect-[4/5] bg-stone-200/50 animate-pulse rounded-none"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="relative group/carousel px-4 sm:px-0">
            {showLeftArrow && (
              <button
                type="button"
                onClick={() => scroll("left")}
                className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white text-slate-900 border border-slate-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 md:flex hidden shadow-md hover:shadow-lg cursor-pointer"
                aria-label={t("Voir les produits précédents")}
              >
                <ChevronLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
              </button>
            )}

            <div ref={containerRef} className={`${getGridClasses()} no-scrollbar`} style={{ scrollBehavior: "smooth" }}>
              {products.map((product, i) => (
                <div
                  key={`${product.id}-${i}`}
                  className="snap-start snap-always shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)] xl:w-[calc((100%-5rem)/6)]"
                >
                  <ProductCard product={product} index={i} sectionStyle={getCardStyle()} />
                </div>
              ))}
            </div>

            {showRightArrow && (
              <button
                type="button"
                onClick={() => scroll("right")}
                className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white text-slate-900 border border-slate-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 md:flex hidden shadow-md hover:shadow-lg cursor-pointer"
                aria-label={t("Voir plus de produits")}
              >
                <ChevronRight className="w-5 h-5 text-slate-700 stroke-[2.5]" />
              </button>
            )}

            <MobileSwipeIndicator className="-mt-3 mb-2" />
          </div>
        ) : (
          <p className="text-zinc-500 font-bold text-center py-10">{t("Aucun produit trouvé pour cette section.")}</p>
        )}
      </div>
    );
  }

  const containerBgClass = hasActiveImage
    ? "relative z-10 p-4 sm:p-6 pb-5 sm:pb-7 rounded-[2rem] animate-fade-in " +
      "bg-gradient-to-b from-white/10 via-white/5 to-transparent border-[1.5px] border-white/30 " +
      "shadow-sm"
    : "bg-white rounded-[2rem] p-5 sm:p-6 lg:p-8 shadow-sm border border-slate-100 relative animate-fade-in";

  return (
    <section
      className="py-4 sm:py-6 relative mb-6 sm:mb-8"
    >
      {renderThemeWrapper()}

      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className={containerBgClass}>
          <div className="relative z-10">
            {renderHeader()}

          {isLoading ? (
            <div className={getGridClasses()}>
              {[...Array(section.limit || section.rules?.maxItems || 8)].map((_, i) => (
                <div
                  key={i}
                  className="snap-start snap-always shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)] xl:w-[calc((100%-5rem)/6)] aspect-[4/5] bg-stone-200/50 animate-pulse rounded-none"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="relative group/carousel px-4 sm:px-0">
              {showLeftArrow && (
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white text-slate-900 border border-slate-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 md:flex hidden shadow-md hover:shadow-lg cursor-pointer"
                  aria-label={t("Voir les produits précédents")}
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
                </button>
              )}

              <div
                ref={containerRef}
                className={`${getGridClasses()} no-scrollbar`}
                style={{ scrollBehavior: "smooth" }}
              >
                {products.map((product, i) => (
                  <div
                    key={`${product.id}-${i}`}
                    className="snap-start snap-always shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)] xl:w-[calc((100%-5rem)/6)]"
                  >
                    <ProductCard product={product} index={i} sectionStyle={getCardStyle()} />
                  </div>
                ))}
              </div>

              {showRightArrow && (
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white text-slate-900 border border-slate-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 md:flex hidden shadow-md hover:shadow-lg cursor-pointer"
                  aria-label={t("Voir plus de produits")}
                >
                  <ChevronRight className="w-5 h-5 text-slate-700 stroke-[2.5]" />
                </button>
              )}

              <MobileSwipeIndicator className="-mt-3 mb-2" />
            </div>
          ) : (
            <p className="text-zinc-500 font-bold text-center py-10 relative z-10">{t("Aucun produit trouvé pour cette section.")}</p>
          )}
          </div>
        </div>
      </div>
    </section>
  );
};
