import React from "react";
import { Zap, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../../utils/format";
import { getOptimizedImageUrl } from "../../../../utils/imageUtils";
import { SellerOverviewTopProduct } from "../../../../types/seller";

interface OverviewTopProductsProps {
  topProducts: SellerOverviewTopProduct[];
}

export const OverviewTopProducts: React.FC<OverviewTopProductsProps> = ({ topProducts }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8" id="seller-top-products-card">
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-md font-sans font-bold flex items-center gap-3 text-zinc-950">
          <Zap className="w-5 h-5 text-blue-600" />
          {t("seller.overview.top_products", "Produits les plus vendus")}
        </h4>
        <button
          type="button"
          id="seller-manage-inventory-btn"
          onClick={() => navigate("/dashboard/seller/catalog")}
          className="text-[10px] font-sans font-bold text-blue-600 uppercase tracking-widest rtl:tracking-normal hover:underline cursor-pointer border-none bg-transparent"
        >
          {t("seller.overview.manage_inventory", "Gérer Inventaire")}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {topProducts.map((p, i) => (
          <div
            key={p.id || i}
            className="flex items-center gap-4 p-4 rounded-3xl bg-zinc-50/50 hover:bg-zinc-50 transition-colors group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-100 overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <img
                loading="lazy"
                src={getOptimizedImageUrl(p.image, 200) || "/images/placeholders/product.svg"}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-sans font-bold text-zinc-950 truncate mb-1">{p.name}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest rtl:tracking-normal">
                {p.count} {t("seller.overview.sales_separators", "Ventes • ")}
                {formatPrice(p.total)}
              </p>
            </div>
            <button
              type="button"
              className="p-2 rounded-xl bg-white border border-zinc-100 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        ))}
        {topProducts.length === 0 && (
          <p className="col-span-2 text-center text-[10px] font-bold text-zinc-400 italic py-8">
            {t("seller.overview.no_products_sold", "Aucun produit vendu ce mois-ci.")}
          </p>
        )}
      </div>
    </div>
  );
};
