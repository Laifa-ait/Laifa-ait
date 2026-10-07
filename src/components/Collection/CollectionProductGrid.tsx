import React from "react";
import { useTranslation } from "react-i18next";
import { Product } from "../../domains/product/product.types";
import { CollectionProductCard } from "./CollectionProductCard";
import { Sparkles, PackageSearch } from "lucide-react";

interface CollectionProductGridProps {
  products: Product[];
  isLoading: boolean;
  displayLimit: number;
  onLoadMore: () => void;
  onResetFilters: () => void;
}

export const CollectionProductGrid: React.FC<CollectionProductGridProps> = ({
  products,
  isLoading,
  displayLimit,
  onLoadMore,
  onResetFilters,
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-slate-100 animate-pulse rounded-2xl border border-slate-200/60"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 px-4 text-center max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto mb-3 flex items-center justify-center">
          <PackageSearch className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="font-black text-lg sm:text-xl text-slate-900 mb-1">
          {t("no_pieces_found", "Aucun article trouvé")}
        </h3>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
          {t("no_pieces_desc", "Aucun produit ne correspond à vos filtres actuels. Essayez d'élargir votre recherche ou de réinitialiser les critères.")}
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
        >
          {t("common_reset_filters", "Réinitialiser les filtres")}
        </button>
      </div>
    );
  }

  const visibleProducts = products.slice(0, displayLimit);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-6">
        {visibleProducts.map((prod, index) => (
          <CollectionProductCard key={prod.id} product={prod} index={index} />
        ))}
      </div>

      {displayLimit < products.length && (
        <div className="flex justify-center pt-6 pb-12">
          <button
            type="button"
            onClick={onLoadMore}
            className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-900 text-slate-800 hover:text-white border border-slate-300 hover:border-slate-900 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md flex items-center gap-2.5 cursor-pointer select-none active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t("load_more_pieces", "Afficher plus d'articles")}</span>
          </button>
        </div>
      )}
    </div>
  );
};
