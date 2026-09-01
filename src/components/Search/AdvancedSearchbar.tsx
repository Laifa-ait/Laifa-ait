import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X, Loader2, ArrowRight, TrendingUp, History, Flame, Store, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { apiGet } from "../../lib/api";
import { Product } from "../../domains/product/product.types";
import { formatPrice } from "../../utils/format";
import { useTrendingSearches } from "../../hooks/useTrendingSearches";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import { useDebounce } from "../../hooks/useDebounce";

const ROTATING_HINTS = [
  "Robe de soirée luxe & Caftan",
  "Sneakers en cuir DZ & Chaussures",
  "Smartphones & Accessoires Tech",
  "Électroménager & Maison",
  "Pack mariée traditionnel",
  "Outillage & Bricolage pro",
];

interface AdvancedSearchbarProps {
  className?: string;
  isMobile?: boolean;
  variant?: "default" | "glass";
}

export const AdvancedSearchbar: React.FC<AdvancedSearchbarProps> = ({
  className = "",
  isMobile: _isMobile = false,
  variant: _variant = "default",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const trendingSearches = useTrendingSearches();
  const { setSearchQuery, searchQuery: globalSearchQuery } = useShop();

  const [localQuery, setLocalQuery] = useState("");
  const debouncedQuery = useDebounce(localQuery, 300);
  const [results, setResults] = useState<Product[]>([]);
  const [hintIndex, setHintIndex] = useState(0);

  interface SearchStoreResult {
  id?: string;
  uid?: string;
  shopName?: string;
  displayName?: string;
  logoUrl?: string;
  wilaya?: string | number;
}
  const [matchedStores, setMatchedStores] = useState<SearchStoreResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const isOverlayActive = isFocused || showDropdown;

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [fallbackProducts, setFallbackProducts] = useState<Product[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  useEffect(() => {
    let resizeTimer: number | undefined;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setIsMobileView(window.innerWidth < 768);
      }, 100);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Load recent searches and fallback recommendations on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("olma_recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("localStorage loading failed in search-bar:", e);
      setRecentSearches([]);
    }

    // Pre-fetch a few popular/fallback products for zero results or empty state recommendations
    const fetchFallbacks = async () => {
      try {
        const data = await apiGet<{ products?: Product[] }>("/api/v1/products?limit=4");
        if (data && Array.isArray(data.products)) {
          setFallbackProducts(data.products);
        }
      } catch (e) {
        console.warn("Error loading fallback products for search-bar:", e);
      }
    };
    fetchFallbacks();
  }, []);

  // Rotate placeholder hints
  useEffect(() => {
    if (localQuery) return;
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % ROTATING_HINTS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [localQuery]);

  // Sync with global query if cleared externally
  useEffect(() => {
    if (!globalSearchQuery) {
      setLocalQuery("");
    }
  }, [globalSearchQuery]);

  // Click away listener to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setShowDropdown(false);
        inputRef.current?.blur();
      }
    };

    if (isOverlayActive) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOverlayActive]);

  // Execute Search
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setTotalProductsCount(0);
        return;
      }

      setIsSearching(true);

      try {
        const response = await fetch(`/api/v1/search?q=${encodeURIComponent(debouncedQuery)}`, { signal });
        if (!response.ok) {
          throw new Error("HTTP search error");
        }
        const data = await response.json();
        const found = data.products || [];
        setTotalProductsCount(found.length);
        setResults(found.slice(0, 10)); // Show up to 10 visual results (suggestions)
        setMatchedStores(data.stores || []);
      } catch (error: unknown) {
        if (!(error instanceof Error) || error.name !== "AbortError") {
          console.error("Search error:", error);
        }
      } finally {
        if (!signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    performSearch();
    setSelectedIndex(-1); // reset selection index on query change

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("olma_recent_searches", JSON.stringify(updated));
    } catch (e) {
      console.warn("localStorage item set failed:", e);
    }
  };

  const getNavigationItems = () => {
    if (!localQuery.trim()) {
      return [
        ...recentSearches.map(term => ({ type: "recent" as const, value: term })),
        ...trendingSearches.map(term => ({ type: "trending" as const, value: term }))
      ];
    } else {
      return [
        ...matchedStores.map(store => ({ type: "store" as const, value: store.id || store.uid, name: store.shopName || store.displayName })),
        ...results.map(prod => ({ type: "product" as const, value: prod.id, name: prod.name }))
      ];
    }
  };

  const handleSearchSubmit = () => {
    if (localQuery.trim()) {
      saveSearchTerm(localQuery);
      setSearchQuery(localQuery);
      setShowDropdown(false);
      setIsFocused(false);
      navigate("/shop");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = getNavigationItems();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault();
        const item = items[selectedIndex];
        if (item.type === "recent" || item.type === "trending") {
          selectTrendingOrRecent(item.value);
        } else if (item.type === "store") {
          navigate(`/store/${item.value}`);
          setShowDropdown(false);
          setIsFocused(false);
        } else if (item.type === "product") {
          navigateToProduct(item.value, item.name || "");
        }
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setLocalQuery("");
    setSearchQuery("");
    setResults([]);
  };

  const navigateToProduct = (id: string, name: string) => {
    saveSearchTerm(name);
    setShowDropdown(false);
    setIsFocused(false);
    navigate(`/product/${id}`);
  };

  const selectTrendingOrRecent = (term: string) => {
    setLocalQuery(term);
    saveSearchTerm(term);
    setSearchQuery(term);
    setShowDropdown(false);
    setIsFocused(false);
    navigate("/shop");
  };

  const deleteRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem("olma_recent_searches", JSON.stringify(updated));
    } catch (err) {
      console.warn("localStorage recent search delete failed:", err);
    }
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem("olma_recent_searches");
    } catch (err) {
      console.warn("localStorage clear failed:", err);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <strong key={i} className="text-orange-600 bg-orange-50/80 font-bold px-1 rounded">
              {part}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <>
      {/* Search Backdrop Overlay */}
      {isOverlayActive &&
        createPortal(
          <div
            onClick={() => {
              setIsFocused(false);
              setShowDropdown(false);
              inputRef.current?.blur();
            }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[90] transition-opacity duration-200"
          />,
          document.body
        )}

      <div
        ref={containerRef}
        className={`relative w-full ${isOverlayActive ? "z-[50]" : "z-[10]"} ${className}`}
      >
        <div
          className={`flex items-center w-full h-10 sm:h-11 rounded-full p-0.5 sm:p-1 bg-white transition-all duration-200 ${
            isOverlayActive
              ? "border-2 border-orange-500 shadow-md ring-2 ring-orange-500/20"
              : "border border-slate-300 hover:border-orange-500 shadow-xs"
          }`}
        >
          {/* Search Icon */}
          <div className="flex items-center justify-center shrink-0 text-orange-500 ps-3 pe-1.5">
            <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[2.2]" />
          </div>

          {/* Input with animated rotating hint when empty */}
          <div className="relative flex-1 h-full flex items-center overflow-hidden">
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowDropdown(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={localQuery ? "" : ROTATING_HINTS[hintIndex]}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className="bg-transparent border-none text-[13px] sm:text-[14px] focus:outline-none w-full h-full px-1 font-medium shadow-none text-slate-900 placeholder:text-slate-400 text-ellipsis whitespace-nowrap"
            />
          </div>

          {/* Clear or Loader */}
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-orange-500 animate-spin mx-1 shrink-0 animate-infinite" />
          ) : localQuery ? (
            <button
              onClick={clearSearch}
              className="p-1 hover:text-orange-500 text-slate-400 transition-colors bg-transparent border-none flex items-center justify-center cursor-pointer mx-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          ) : null}

          {/* Solid Vibrant Orange Search Button */}
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="h-full px-3.5 sm:px-5 bg-gradient-to-r from-[#FF5000] to-[#FF7A00] hover:from-[#e04500] hover:to-[#e66c00] text-white font-bold text-xs sm:text-[13px] rounded-full shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all duration-150 shrink-0 cursor-pointer border-none"
          >
            <span>{isMobileView ? "Recherche" : "Rechercher"}</span>
          </button>
        </div>

        {/* Predictive & Interactive Mega Search Dropdown Overlay */}
        {isOverlayActive && (
          <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] md:left-1/2 md:-translate-x-1/2 w-full md:w-[750px] lg:w-[850px] bg-white border border-slate-200/90 shadow-2xl z-[150] rounded-2xl md:rounded-3xl overflow-hidden max-h-[75vh] md:max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-5">
              {/* Overlay Header with Close Button for Mobile */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {localQuery.trim() ? "Résultats de recherche" : "Explorer sur Olmart"}
                </span>
                <button
                  onClick={() => {
                    setIsFocused(false);
                    setShowDropdown(false);
                    inputRef.current?.blur();
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>

              {/* Case A: Search bar is Empty -> Show History and Trending Categories */}
              {!localQuery.trim() ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* 1. Recent Searches */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-orange-500" />
                        <span>{t("recent_searches") || "Recherches récentes"}</span>
                      </h4>
                      {recentSearches.length > 0 && (
                        <button
                          onClick={clearAllRecentSearches}
                          className="text-[11px] text-slate-400 hover:text-red-500 font-medium flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Effacer</span>
                        </button>
                      )}
                    </div>
                    {recentSearches.length > 0 ? (
                      <ul className="space-y-1">
                        {recentSearches.map((term, i) => (
                          <li
                            key={i}
                            onClick={() => selectTrendingOrRecent(term)}
                            className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-orange-50/50 text-[13px] font-medium text-slate-700 hover:text-orange-600 transition-colors cursor-pointer group"
                          >
                            <span className="truncate flex items-center gap-2">
                              <History className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 shrink-0" />
                              {term}
                            </span>
                            <button
                              onClick={(e) => deleteRecentSearch(term, e)}
                              className="text-slate-300 hover:text-red-500 p-1 bg-transparent border-none cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-xs px-2 py-3 italic">
                        {t("no_search_history") || "Aucun historique pour le moment."}
                      </p>
                    )}
                  </div>

                  {/* 2. Trending Searches */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>{t("trending_searches") || "Tendances populaires"}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {trendingSearches.map((tag, i) => (
                        <button
                          key={i}
                          onClick={() => selectTrendingOrRecent(tag)}
                          className="px-3 py-1.5 text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 active:scale-95 text-slate-700 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <TrendingUp className="w-3 h-3 text-orange-500/70" />
                          <span>{tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Case B: Search bar has typing -> Show completion results or fallback recommendations
                <div className="space-y-5">
                  {isSearching ? (
                    <div className="py-12 flex justify-center items-center">
                      <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
                    </div>
                  ) : results.length > 0 || matchedStores.length > 0 ? (
                    <div className="space-y-5">
                      {/* Stores Section */}
                      {matchedStores.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider flex items-center gap-2">
                            <Store className="w-3.5 h-3.5 text-orange-500" />
                            <span>{t("matching_stores") || "Boutiques certifiées"}</span>
                          </h4>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {matchedStores.map((store) => (
                              <li key={store.id || store.uid}>
                                <button
                                  onClick={() => {
                                    navigate(`/store/${store.id || store.uid}`);
                                    setShowDropdown(false);
                                  }}
                                  className="w-full text-left p-2.5 bg-slate-50/70 hover:bg-orange-50/50 border border-slate-100 hover:border-orange-200 flex items-center gap-3 group transition-colors rounded-xl outline-none cursor-pointer"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                                    {store.logoUrl ? (
                                      <img
                                        loading="lazy"
                                        src={store.logoUrl}
                                        alt={store.shopName || store.displayName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                                        <span className="text-orange-600 font-bold text-base uppercase">
                                          {(store.shopName || store.displayName || "B").charAt(0)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                                    <span className="font-bold text-[13px] text-slate-800 group-hover:text-orange-600 truncate transition-colors">
                                      {store.shopName || store.displayName}
                                    </span>
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                                      {t("Wilaya")} {store.wilaya ? store.wilaya : "58"}
                                    </span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Products Section */}
                      {results.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-1">
                            <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                              {t("matching_creations") || "Produits correspondants"}
                            </h4>
                            {totalProductsCount > 5 && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                {t("showing_5_of_total", { count: totalProductsCount }) || `5 sur ${totalProductsCount} résultats`}
                              </span>
                            )}
                          </div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {results.map((product) => {
                              return (
                                <li key={product.id}>
                                  <button
                                    onClick={() => navigateToProduct(product.id, product.name)}
                                    className="w-full text-left p-2.5 hover:bg-orange-50/40 border border-slate-100 hover:border-orange-200 flex items-center gap-3 group transition-colors rounded-xl outline-none bg-white cursor-pointer"
                                  >
                                    <div className="w-12 h-12 rounded-lg bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                                      <img
                                        loading="lazy"
                                        src={getOptimizedImageUrl(product.image, 200)}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      />
                                    </div>
                                    <div className="flex flex-col text-left overflow-hidden min-w-0 flex-1">
                                      <span className="font-semibold text-[13px] text-slate-800 group-hover:text-orange-600 transition-colors truncate">
                                        {highlightMatch(product.name, localQuery)}
                                      </span>
                                      <span className="text-[10.5px] font-medium text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                                        {product.category} {product.wilaya ? `• W.${product.wilaya}` : ""}
                                      </span>
                                      <span className="text-xs font-bold text-orange-600 mt-1">
                                        {formatPrice(product.price)}
                                      </span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={handleSearchSubmit}
                          className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#FF5000] to-[#FF7A00] hover:from-[#e04500] hover:to-[#e66c00] rounded-full shadow-xs transition-all cursor-pointer border-none flex items-center gap-1.5"
                        >
                          <span>{t("see_all_results") || "Voir tous les résultats"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Case C: Absolute Zero Results -> Show clean fallback
                    <div className="space-y-6">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2">
                        <Search className="w-6 h-6 text-slate-300" />
                        <span className="text-sm font-bold text-slate-800">
                          {t("no_results_for") || "Aucun résultat pour"} "{localQuery}"
                        </span>
                        <p className="text-xs text-slate-400 max-w-sm">
                          {t("no_exact_match_fallback") ||
                            "Vérifiez l'orthographe ou essayez d'autres mots-clés."}
                        </p>
                      </div>

                      {fallbackProducts.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                            {t("recommended_creations") || "Suggestions populaires"}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            {fallbackProducts.map((p) => (
                              <div
                                key={p.id}
                                onClick={() => navigateToProduct(p.id, p.name)}
                                className="p-2.5 border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 rounded-xl transition-all cursor-pointer flex gap-3 text-left group"
                              >
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                                  <img
                                    loading="lazy"
                                    src={getOptimizedImageUrl(p.image, 200)}
                                    alt={p.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                                <div className="flex flex-col min-w-0 justify-center flex-1">
                                  <span className="font-semibold text-xs text-slate-800 group-hover:text-orange-600 truncate transition-colors">
                                    {p.name}
                                  </span>
                                  <span className="text-xs font-bold text-orange-600 mt-0.5">
                                    {formatPrice(p.price)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
