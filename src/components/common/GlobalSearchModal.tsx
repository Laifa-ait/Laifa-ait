/* eslint-disable max-lines */
import React, { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Store,
  Truck,
  Building2,
  Wrench,
  Laptop,
  Shirt,
  X,
  ArrowRight,
  Zap
} from "lucide-react";
import { apiGet } from "../../lib/api";
import { Product } from "../../domains/product/product.types";
import { SearchStoreResult, SearchApiResponse } from "../../types/search";
import { formatPrice } from "../../utils/format";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import { safeLogger } from "../../utils/logger";

export const GlobalSearchModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<SearchStoreResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar" || i18n.language?.startsWith("ar");

  // Toggle with Ctrl+K / Cmd+K or Custom Event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-global-search", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-global-search", handleCustomOpen);
    };
  }, [open]);

  // Dynamic live search when search term changes
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setProducts([]);
      setStores([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const queryParam = encodeURIComponent(search.trim());
        const searchRes = await apiGet<SearchApiResponse>(`/api/v1/search?q=${queryParam}&limit=5`).catch(() => null);

        if (active) {
          if (searchRes && Array.isArray(searchRes.products)) {
            setProducts(searchRes.products);
          } else {
            setProducts([]);
          }

          if (searchRes && Array.isArray(searchRes.stores)) {
            setStores(searchRes.stores);
          } else {
            setStores([]);
          }
        }
      } catch (err) {
        if (active) {
          safeLogger.error("Global search error", { err: err instanceof Error ? err.message : String(err) });
          setProducts([]);
          setStores([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  const handleSelect = useCallback((action: () => void) => {
    setOpen(false);
    setSearch("");
    action();
  }, []);

  if (!open) return null;

  return (
    <div
      id="global-search-modal-backdrop"
      className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-200"
      onClick={() => setOpen(false)}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        id="global-search-modal-card"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="flex flex-col w-full h-full"
          label={t("search_cmd_label") || "Recherche globale Olmart"}
          shouldFilter={false}
        >
          {/* Header Input */}
          <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <Search className="w-5 h-5 text-orange-500 shrink-0 me-3" />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder={t("search_cmd_placeholder") || "Rechercher un produit, une boutique, une catégorie (Ctrl+K)..."}
              className="w-full py-4 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none border-none ring-0"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors bg-transparent border-none cursor-pointer"
                aria-label="Effacer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-slate-200/60 dark:bg-slate-800 dark:text-slate-400 rounded ms-2 border border-slate-300 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          {/* List Area */}
          <Command.List className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 max-h-[60vh]">
            {isLoading && (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span>{t("searching") || "Recherche en cours..."}</span>
              </div>
            )}

            {/* Live Products Results */}
            {products.length > 0 && (
              <Command.Group
                heading={<span className="text-[11px] font-bold uppercase tracking-wider text-orange-500 px-2 py-1 block">{t("products") || "Produits correspondants"}</span>}
              >
                {products.map((product) => (
                  <Command.Item
                    key={product.id}
                    onSelect={() => handleSelect(() => navigate(`/product/${product.id}`))}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img loading="lazy" decoding="async" src={getOptimizedImageUrl(product.image || (product.images && product.images[0]) || "", 80)}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/60 dark:border-slate-700/60"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {product.name}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {product.category || "Général"}
                        </span>
                      </div>
                    </div>
                    <div className="text-end shrink-0 ps-3">
                      <span className="text-xs font-bold text-orange-500">
                        {formatPrice(product.price)} DA
                      </span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Live Stores Results */}
            {stores.length > 0 && (
              <Command.Group
                heading={<span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 px-2 py-1 block">{t("shops") || "Boutiques certifiées"}</span>}
              >
                {stores.map((store) => (
                  <Command.Item
                    key={store.id || store.shopName}
                    onSelect={() => handleSelect(() => navigate(`/shop/${store.id || store.shopName}`))}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {store.shopName || store.displayName}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          Wilaya {store.wilaya || "Algérie"}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Quick Navigation Links */}
            {!search && (
              <>
                <Command.Group
                  heading={<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">{t("popular_categories") || "Univers & Catégories"}</span>}
                >
                  <Command.Item
                    onSelect={() => handleSelect(() => navigate("/shop?category=electronics"))}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <Laptop className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t("cat_electronics") || "Électroménager & Tech"}</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => handleSelect(() => navigate("/shop?category=fashion"))}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <Shirt className="w-4 h-4 text-pink-500" />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t("cat_fashion") || "Mode & Vêtements"}</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => handleSelect(() => navigate("/immo"))}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t("cat_immo") || "OlmaImmo — Immobilier"}</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => handleSelect(() => navigate("/bricolage"))}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <Wrench className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t("cat_bricolage") || "Bricolage & Équipements Pro"}</span>
                  </Command.Item>
                </Command.Group>

                <Command.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                <Command.Group
                  heading={<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">{t("shortcuts") || "Accès Rapide"}</span>}
                >
                  <Command.Item
                    onSelect={() => handleSelect(() => navigate("/shops"))}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t("nav_all_shops") || "Annuaire des Boutiques"}</span>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => handleSelect(() => navigate("/shipping-calculator"))}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-teal-500" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t("nav_shipping_calc") || "Calculateur de frais de livraison 58 Wilayas"}</span>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => handleSelect(() => navigate("/seller-onboarding"))}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t("nav_become_seller") || "Ouvrir une boutique (Devenir Vendeur)"}</span>
                    </div>
                  </Command.Item>
                </Command.Group>
              </>
            )}

            {search && !isLoading && products.length === 0 && stores.length === 0 && (
              <Command.Empty className="py-8 text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("no_results_for", { query: search }) || `Aucun résultat pour "${search}"`}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {t("try_another_keyword") || "Essayez avec un autre mot-clé ou parcourez nos catégories"}
                </p>
                <button
                  onClick={() => handleSelect(() => navigate(`/shop?q=${encodeURIComponent(search)}`)) }
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors"
                >
                  <span>{t("view_in_shop") || "Voir tous les résultats dans la boutique"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Command.Empty>
            )}
          </Command.List>

          {/* Footer Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-mono">↓</kbd>
                <span>{t("navigate") || "Naviguer"}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-mono">↵</kbd>
                <span>{t("select") || "Ouvrir"}</span>
              </span>
            </div>
            <span className="font-semibold text-orange-500">OLMART Search</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
