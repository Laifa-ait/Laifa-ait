import React from "react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../domains/product/product.types";
import { MiniProductCard } from "./MiniProductCard";

interface ProductRecommendationsSectionProps {
  products: Product[];
  loading: boolean;
  currentLang?: string;
}

export const ProductRecommendationsSection: React.FC<ProductRecommendationsSectionProps> = ({
  products,
  loading,
  currentLang = "fr",
}) => {
  const { t } = useTranslation();

  return (
    <section className="mt-4 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-200 px-3 sm:px-0">
      {/* Title only, no extra labels */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          {t("product.you_might_also_like") || "Vous aimerez aussi"}
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 p-2.5 animate-pulse space-y-2.5 shadow-xs"
            >
              <div className="aspect-[3/4] bg-slate-100 rounded-xl" />
              <div className="h-3 bg-zinc-200/80 rounded w-1/2" />
              <div className="h-3.5 bg-zinc-200/80 rounded w-3/4" />
              <div className="h-3 bg-zinc-200/80 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        /* Full 2-column mobile grid expanding to 4-6 columns on desktop - fills screen evenly */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5">
          {products.map((p) => (
            <div key={p.id} className="w-full">
              <MiniProductCard product={p} currentLang={currentLang} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 italic text-sm py-2">
          {t("product.no_recommendations") || "Aucune recommandation pour le moment."}
        </p>
      )}
    </section>
  );
};
