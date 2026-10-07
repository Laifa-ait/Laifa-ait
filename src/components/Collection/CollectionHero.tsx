import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, SlidersHorizontal, Search, X, Sparkles, Truck, ShieldCheck, Banknote } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CollectionHeroProps {
  title: string;
  totalCartCount: number;
  onOpenCart: () => void;
  onOpenFilters: () => void;
  activeFiltersCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const CollectionHero: React.FC<CollectionHeroProps> = ({
  title,
  totalCartCount,
  onOpenCart,
  onOpenFilters,
  activeFiltersCount,
  searchQuery,
  onSearchChange,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white border-b border-slate-200/80 text-slate-900 transition-colors">
      {/* Top Header: Friendly, Modern & Elevated */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t("common_back", "Retour")}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-700 transition-all cursor-pointer border border-slate-200/60"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Brand Typographic Identity with Cheerful Accent */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer select-none">
          <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 via-emerald-700 to-rose-600 bg-clip-text text-transparent">
            OLMART
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-rose-500 text-white shadow-2xs">
            MARKETPLACE
          </span>
        </Link>

        {/* Cart Trigger with Lively Indicator */}
        <button
          type="button"
          onClick={onOpenCart}
          aria-label={t("cart_title", "Panier")}
          className="relative w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-800 transition-all cursor-pointer border border-slate-200/60"
        >
          <ShoppingBag className="w-4 h-4" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-[10px] flex items-center justify-center shadow-md animate-pulse">
              {totalCartCount}
            </span>
          )}
        </button>
      </div>

      {/* Hero Showcase Banner: Joyful, Vibrant, Harmonious */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-6 sm:pb-8">
        <div className="relative rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-emerald-500/10 border border-amber-200/60 shadow-xs overflow-hidden">
          {/* Subtle Ambient Decorative Circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-rose-400/15 blur-2xl pointer-events-none" />

          {/* Breadcrumbs with subtle color */}
          <nav aria-label="Fil d'Ariane" className="relative z-10 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Link to="/" className="hover:text-emerald-700 transition-colors">
              {t("Accueil", "Accueil")}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-rose-600 font-extrabold">{t("Tendances DZ", "Tendances DZ")}</span>
          </nav>

          {/* Title & Trust Highlights */}
          <div className="relative z-10 mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-amber-300/60 text-amber-900 text-xs font-bold mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("selection_populaire", "Sélection Tendance & Coup de Cœur")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1.5 max-w-2xl leading-relaxed">
              {t("collection_luxury_desc", "Découvrez les meilleures offres au meilleur prix avec livraison express garantie à domicile sur l'ensemble des 58 Wilayas d'Algérie.")}
            </p>

            {/* Quick Trust Highlights with Fun Colors */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>58 Wilayas Livrées</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/70">
                <Banknote className="w-3.5 h-3.5 text-amber-600" />
                <span>Paiement à la Livraison (COD)</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200/70">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Garantie 100% Satisfait</span>
              </span>
            </div>
          </div>

          {/* Search & Filter Bar: Modern, Responsive & Punchy */}
          <div className="relative z-10 flex items-center gap-2.5 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t("collection_search_placeholder", "Rechercher un produit, une marque, une catégorie...")}
                className="w-full h-11 ps-10 pe-9 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:outline-none transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label={t("common_clear", "Effacer")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button in Vibrant Coral Gradient */}
            <button
              type="button"
              onClick={onOpenFilters}
              className={`h-11 px-4 sm:px-5 rounded-2xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer select-none shrink-0 shadow-md active:scale-95 ${
                activeFiltersCount > 0
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/25"
                  : "bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white shadow-rose-500/20"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>{t("common_filters", "Filtres")}</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-emerald-800 text-[10px] font-black flex items-center justify-center shadow-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
