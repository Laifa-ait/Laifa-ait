/* eslint-disable max-lines */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  CheckCircle, 
  Pin, 
  Star, 
  Plus, 
  Sparkles,
} from 'lucide-react';
import { Product } from '../../domains/product/product.types';
import { formatPrice } from '../../utils/format';

interface ComparatorTableProps {
  products: Product[];
  pinnedProductId: string | null;
  onSetPinnedProduct: (id: string | null) => void;
  onRemoveProduct: (id: string) => void;
  onOpenAddModal: () => void;
  showOnlyDifferences: boolean;
  specFilter: string;
  selectedCategory?: string;
  viewMode?: 'matrix' | 'cards';
}

export const ComparatorTable: React.FC<ComparatorTableProps> = ({
  products,
  pinnedProductId,
  onSetPinnedProduct,
  onRemoveProduct,
  onOpenAddModal,
  showOnlyDifferences,
  specFilter,
  selectedCategory: _selectedCategory,
  viewMode = 'matrix',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (products.length === 0) return null;

  // Find price bounds
  const prices = products.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Find rating bounds
  const ratings = products.map((p) => p.stats?.averageRating || p.rating || 0);
  const maxRating = Math.max(...ratings);

  // Helper score computation
  const computeScore = (p: Product) => {
    const priceScore = maxPrice === minPrice ? 100 : 100 - ((p.price - minPrice) / (maxPrice - minPrice || 1)) * 40;
    const productRating = p.stats?.averageRating || p.rating || null;
    const ratingScore = productRating ? (productRating / 5) * 100 : 0;
    const stockScore = (p.stock || 0) > 0 ? 100 : 0;
    const shippingScore = p.freeShipping ? 100 : 60;
    return Math.round(priceScore * 0.4 + ratingScore * 0.3 + stockScore * 0.15 + shippingScore * 0.15);
  };

  const scores = products.map(computeScore);
  const maxScore = Math.max(...scores);

  // Standardize / Fallback Specs Engine so specs are never empty
  const getProductSpecsMap = (p: Product): Record<string, string> => {
    const raw = p.specs || {};
    const fallback: Record<string, string> = {
      "Catégorie": p.category || "Électronique / Divers",
      "Marque": p.brand || "Marque Officielle",
      "Disponibilité": (p.stock || 0) > 0 ? "En Stock Direct" : "Sur Commande",
      "Garantie": p.warranty || "12 Mois Garantie Olmart",
      "Livraison Wilayas": p.freeShipping ? "Gratuite (58 Wilayas)" : "Standard Rapide",
      "Paiement": "À la livraison (Cash / CIB)",
      "État": "Neuf sous emballage",
      "Support Client": "24/7 Assistance dédiée",
    };
    return { ...fallback, ...raw };
  };

  // Extract merged spec keys across products
  const productSpecsList = products.map(getProductSpecsMap);
  const allSpecKeysSet = new Set<string>();
  productSpecsList.forEach((sMap) => {
    Object.keys(sMap).forEach((k) => allSpecKeysSet.add(k));
  });

  let specKeys = Array.from(allSpecKeysSet);

  // Filter keys based on text search
  if (specFilter.trim()) {
    const q = specFilter.toLowerCase();
    specKeys = specKeys.filter((k) => k.toLowerCase().includes(q));
  }

  // Filter keys based on differences toggle
  if (showOnlyDifferences && products.length > 1) {
    specKeys = specKeys.filter((key) => {
      const firstVal = productSpecsList[0][key];
      return productSpecsList.some((sMap) => sMap[key] !== firstVal);
    });
  }

  const pinnedProduct = products.find((p) => p.id === pinnedProductId);
  const pinnedSpecs = pinnedProduct ? getProductSpecsMap(pinnedProduct) : null;

  // ----------------------------------------------------
  // CARDS VIEW (Côte-à-Côte Grid)
  // ----------------------------------------------------
  if (viewMode === 'cards') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {products.map((p, idx) => {
            const isPinned = p.id === pinnedProductId;
            const score = scores[idx];
            const isWinner = score === maxScore && products.length > 1;
            const isMinPrice = p.price === minPrice && products.length > 1;
            const specs = productSpecsList[idx];

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl sm:rounded-2xl border p-3 sm:p-5 flex flex-col justify-between transition-all shadow-sm ${
                  isPinned
                    ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                    : "border-zinc-200/80 hover:border-amber-300"
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <button
                      onClick={() => onSetPinnedProduct(isPinned ? null : p.id)}
                      className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full transition-all ${
                        isPinned
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      <Pin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>{isPinned ? "Référence" : "Comparer"}</span>
                    </button>

                    <button
                      onClick={() => onRemoveProduct(p.id)}
                      className="w-5 h-5 sm:w-6 sm:h-6 bg-zinc-100 hover:bg-red-100 hover:text-red-600 text-zinc-400 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail & Badges */}
                  <div 
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="relative w-full h-28 sm:h-40 bg-zinc-50 rounded-2xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-4 border border-zinc-100 flex items-center justify-center cursor-pointer group"
                  >
                    <img loading="lazy" decoding="async" src={p.image} alt={p.name} className="h-full object-contain p-1.5 sm:p-2 group-hover:scale-105 transition-transform duration-300" />
                    {isWinner && (
                      <span className="absolute top-1.5 right-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Best Choice
                      </span>
                    )}
                  </div>

                  {/* Product Title & Price */}
                  <h3
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="font-bold text-xs sm:text-sm text-zinc-900 line-clamp-2 hover:text-amber-600 transition-colors cursor-pointer mb-1 sm:mb-2"
                  >
                    {p.name}
                  </h3>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2 sm:mb-3">
                    <span className="text-sm sm:text-lg font-black text-amber-700">{formatPrice(p.price)}</span>
                    {isMinPrice && (
                      <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full w-max">
                        Meilleur Prix
                      </span>
                    )}
                  </div>

                  {/* Score Bar */}
                  <div className="bg-zinc-50 rounded-2xl sm:rounded-2xl p-2 sm:p-3 border border-zinc-100 mb-3 sm:mb-4">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold mb-1">
                      <span className="text-zinc-500">Score</span>
                      <span className={isWinner ? "text-amber-600 font-black" : "text-zinc-800"}>
                        {score}/100
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 h-1.5 sm:h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isWinner ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-zinc-700"
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  {/* Specs List in Card */}
                  <div className="space-y-1 sm:space-y-2 border-t border-zinc-100 pt-2 sm:pt-3 text-[10px] sm:text-xs">
                    {specKeys.map((key) => {
                      const val = specs[key] || "-";
                      const isDiff = pinnedSpecs && pinnedSpecs[key] !== val;
                      return (
                        <div key={key} className={`flex justify-between p-1 sm:p-1.5 rounded-lg ${isDiff ? "bg-amber-50/70 font-bold text-amber-900" : "text-zinc-700"}`}>
                          <span className="text-zinc-400 font-medium capitalize truncate me-1">{key}:</span>
                          <span className="font-semibold text-end shrink-0">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {products.length < 4 && (
            <div
              onClick={onOpenAddModal}
              className="border-2 border-dashed border-zinc-300 hover:border-amber-500 hover:bg-amber-50/20 rounded-2xl sm:rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center gap-2 sm:gap-3 cursor-pointer text-zinc-400 hover:text-amber-700 transition-all min-h-[250px] sm:min-h-[350px]"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-center">Ajouter un produit</span>
              <span className="text-[10px] sm:text-xs text-zinc-400 text-center">Comparez jusqu'à 4 articles</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MATRIX TABLE VIEW (Clean, No Empty Gaps)
  // ----------------------------------------------------
  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-full sm:min-w-[700px]">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-30 bg-white shadow-sm border-b border-zinc-200">
            <tr>
              {/* Product Info Column Header */}
              <th className="p-2 sm:p-4 bg-zinc-100 sm:bg-zinc-50 w-20 sm:w-48 md:w-56 min-w-[80px] sm:min-w-[140px] border-r border-zinc-200/60 align-bottom sticky left-0 z-40 shadow-[4px_0_8px_rgba(0,0,0,0.08)]">
                <div className="pb-1">
                  <span className="text-[9px] sm:text-xs font-extrabold text-zinc-400 uppercase tracking-wider block">
                    {t("Caractéristique") || "Caractéristique"}
                  </span>
                  <p className="text-[9px] sm:text-[11px] text-zinc-500 font-medium hidden sm:block">
                    {t("Composant ou spec") || "Composant ou spec"}
                  </p>
                </div>
              </th>

              {/* Product Columns */}
              {products.map((p, idx) => {
                const isPinned = p.id === pinnedProductId;
                const score = scores[idx];
                const isWinner = score === maxScore && products.length > 1;

                return (
                  <th
                    key={p.id}
                    className={`p-2 sm:p-4 relative align-top min-w-[125px] sm:min-w-[180px] max-w-[160px] sm:max-w-none border-r border-zinc-100 last:border-r-0 ${
                      isPinned ? "bg-amber-50/40" : ""
                    }`}
                  >
                    {/* Header Action Bar */}
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <button
                        onClick={() => onSetPinnedProduct(isPinned ? null : p.id)}
                        className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 rounded-full transition-all ${
                          isPinned
                            ? "bg-amber-500 text-white shadow-sm"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                        title={isPinned ? "Détacher la référence" : "Fixer comme référence"}
                      >
                        <Pin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="hidden sm:inline">{isPinned ? (t("Référence") || "Référence") : (t("Comparer à") || "Comparer à")}</span>
                      </button>

                      <button
                        onClick={() => onRemoveProduct(p.id)}
                        className="w-5 h-5 sm:w-6 sm:h-6 bg-zinc-100 hover:bg-red-100 hover:text-red-600 text-zinc-400 rounded-full flex items-center justify-center transition-colors ms-auto"
                        title="Retirer"
                      >
                        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>

                    {/* Product Card Content */}
                    <div
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="flex flex-col items-center text-center cursor-pointer group"
                    >
                      <div className="relative w-14 h-14 sm:w-24 sm:h-24 rounded-2xl sm:rounded-2xl overflow-hidden mb-1.5 sm:mb-2 border border-zinc-200/80 bg-zinc-50 group flex items-center justify-center">
                        <img loading="lazy" decoding="async" src={p.image}
                          alt={p.name}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                        {isWinner && (
                          <div
                            className="absolute top-1 right-1 bg-amber-500 text-white p-0.5 sm:p-1 rounded-full shadow-md"
                            title="Meilleur score global"
                          >
                            <Sparkles className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <h3
                        onClick={() => navigate(`/product/${p.id}`)}
                        className="font-bold text-[11px] sm:text-sm text-zinc-900 line-clamp-2 hover:text-amber-600 transition-colors cursor-pointer mb-1 min-h-[28px] sm:min-h-[36px]"
                      >
                        {p.name}
                      </h3>

                      <p className="text-amber-700 font-black text-xs sm:text-base mb-1.5 whitespace-nowrap">
                        {formatPrice(p.price)}
                      </p>

                      {/* Olmart Score Progress */}
                      <div className="w-full bg-zinc-100 rounded-lg sm:rounded-2xl p-1 sm:p-2">
                        <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-bold mb-0.5 sm:mb-1">
                          <span className="text-zinc-500">{t("Score") || "Score"}</span>
                          <span className={isWinner ? "text-amber-600 font-extrabold" : "text-zinc-800"}>
                            {score} / 100
                          </span>
                        </div>
                        <div className="w-full bg-zinc-200 h-1 sm:h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isWinner ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-zinc-700"
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body Specs */}
          <tbody className="divide-y divide-zinc-100 text-xs">
            {/* Section: Tarifs & Offres */}
            <tr className="bg-zinc-100 border-y border-zinc-200/80">
              <td colSpan={products.length + 1} className="p-0 bg-zinc-100">
                <div className="sticky left-0 z-20 w-max px-2.5 sm:px-4 py-1.5 sm:py-2 font-extrabold text-zinc-800 text-[10px] sm:text-[11px] uppercase tracking-wider">
                  📌 {t("Informations Clés & Tarifs") || "Informations Clés & Tarifs"}
                </div>
              </td>
            </tr>

            {/* Price Comparison */}
            <tr>
              <td className="p-2 sm:p-4 font-semibold text-zinc-700 text-[10px] sm:text-xs bg-zinc-100 sm:bg-zinc-50 border-r border-zinc-200/60 sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                {t("Prix & Offre") || "Prix & Offre"}
              </td>
              {products.map((p) => {
                const isMinPrice = p.price === minPrice && products.length > 1;
                const deltaPercent =
                  pinnedProduct && pinnedProduct.id !== p.id
                    ? Math.round(((p.price - pinnedProduct.price) / pinnedProduct.price) * 100)
                    : null;

                return (
                  <td key={p.id} className="p-2 sm:p-4 text-center border-r border-zinc-100">
                    <span className={`font-bold text-xs sm:text-sm ${isMinPrice ? "text-emerald-600" : "text-zinc-900"}`}>
                      {formatPrice(p.price)}
                    </span>
                    {isMinPrice && (
                      <span className="block mt-0.5 text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full w-max mx-auto">
                        {t("Moins cher") || "Moins cher"}
                      </span>
                    )}
                    {deltaPercent !== null && (
                      <span className={`block mt-0.5 text-[9px] sm:text-[10px] font-bold ${deltaPercent < 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {deltaPercent < 0 ? `${deltaPercent}%` : `+${deltaPercent}%`} vs réf.
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Brand */}
            <tr>
              <td className="p-2 sm:p-4 font-semibold text-zinc-700 text-[10px] sm:text-xs bg-zinc-100 sm:bg-zinc-50 border-r border-zinc-200/60 sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                {t("Marque") || "Marque"}
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-2 sm:p-4 text-center font-medium text-zinc-800 text-[10px] sm:text-xs border-r border-zinc-100">
                  {p.brand || "Marque Officielle"}
                </td>
              ))}
            </tr>

            {/* Stock Availability */}
            <tr>
              <td className="p-2 sm:p-4 font-semibold text-zinc-700 text-[10px] sm:text-xs bg-zinc-100 sm:bg-zinc-50 border-r border-zinc-200/60 sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                {t("Disponibilité") || "Disponibilité"}
              </td>
              {products.map((p) => {
                const inStock = (p.stock || 0) > 0;
                return (
                  <td key={p.id} className="p-2 sm:p-4 text-center border-r border-zinc-100">
                    {inStock ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-bold text-[9px] sm:text-xs">
                        <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
                        {t("En Stock") || "En Stock"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-bold text-[9px] sm:text-xs">
                        {t("Rupture") || "Rupture"}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Rating */}
            <tr>
              <td className="p-2 sm:p-4 font-semibold text-zinc-700 text-[10px] sm:text-xs bg-zinc-100 sm:bg-zinc-50 border-r border-zinc-200/60 sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                {t("Avis Client") || "Avis Client"}
              </td>
              {products.map((p) => {
                const rating = p.stats?.averageRating || p.rating || null;
                const isTopRating = rating && rating === maxRating && products.length > 1;
                return (
                  <td key={p.id} className="p-2 sm:p-4 text-center border-r border-zinc-100">
                    {rating !== null ? (
                      <>
                        <div className="inline-flex items-center gap-1 font-bold text-zinc-900 bg-amber-50 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-amber-200 text-[9px] sm:text-xs">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{rating.toFixed(1)} / 5</span>
                        </div>
                        {isTopRating && (
                          <span className="block mt-0.5 text-[9px] sm:text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-full w-max mx-auto">
                            {t("Mieux noté") || "Mieux noté"}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-zinc-400 font-bold text-[10px] sm:text-xs">{t("Aucun avis") || "Aucun avis"}</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Section: Logistique & Services */}
            <tr className="bg-zinc-100 border-y border-zinc-200/80">
              <td colSpan={products.length + 1} className="p-0 bg-zinc-100">
                <div className="sticky left-0 z-20 w-max px-2.5 sm:px-4 py-1.5 sm:py-2 font-extrabold text-zinc-800 text-[10px] sm:text-[11px] uppercase tracking-wider">
                  🚚 {t("Logistique & Service Olmart") || "Logistique & Service Olmart"}
                </div>
              </td>
            </tr>

            {/* Shipping */}
            <tr>
              <td className="p-2 sm:p-4 font-semibold text-zinc-700 text-[10px] sm:text-xs bg-zinc-100 sm:bg-zinc-50 border-r border-zinc-200/60 sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                {t("Livraison") || "Livraison"}
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-2 sm:p-4 text-center border-r border-zinc-100 text-[10px] sm:text-xs font-medium">
                  {p.freeShipping ? (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-bold">
                      {t("Gratuite") || "Gratuite"}
                    </span>
                  ) : (
                    <span className="text-zinc-600">{t("Standard Express") || "Standard Express"}</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Warranty */}
            <tr>
              <td className="p-2 sm:p-4 font-semibold text-zinc-700 text-[10px] sm:text-xs bg-zinc-100 sm:bg-zinc-50 border-r border-zinc-200/60 sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                {t("Garantie") || "Garantie"}
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-2 sm:p-4 text-center border-r border-zinc-100 text-[10px] sm:text-xs font-medium text-zinc-800">
                  {p.warranty || t("12 Mois Garantie Officielle") || "12 Mois Garantie Officielle"}
                </td>
              ))}
            </tr>

            {/* Dynamic Specs Section */}
            {specKeys.length > 0 && (
              <tr className="bg-zinc-100 border-y border-zinc-200/80">
                <td colSpan={products.length + 1} className="p-0 bg-zinc-100">
                  <div className="sticky left-0 z-20 w-max px-2.5 sm:px-4 py-1.5 sm:py-2 font-extrabold text-zinc-800 text-[10px] sm:text-[11px] uppercase tracking-wider">
                    ⚡ {t("Spécifications Techniques Completes") || "Spécifications Techniques Completes"}
                  </div>
                </td>
              </tr>
            )}

            {specKeys.map((key) => (
              <tr key={key} className="hover:bg-zinc-50/40 transition-colors">
                <td className="p-2 sm:p-4 font-semibold text-zinc-700 text-[10px] sm:text-xs bg-zinc-100 sm:bg-zinc-50 border-r border-zinc-200/60 sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.04)] capitalize">
                  {key}
                </td>
                {products.map((p, idx) => {
                  const val = productSpecsList[idx][key] || "-";
                  const isPinnedVal = pinnedSpecs?.[key];
                  const isDiffFromPinned = pinnedProduct && pinnedProduct.id !== p.id && val !== isPinnedVal;

                  return (
                    <td
                      key={p.id}
                      className={`p-2 sm:p-4 text-center border-r border-zinc-100 text-[10px] sm:text-xs font-medium ${
                        isDiffFromPinned ? "bg-amber-50/50 text-amber-900 font-bold" : "text-zinc-800"
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
