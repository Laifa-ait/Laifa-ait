import React from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../domains/product/product.types";

interface CurationPendingListProps {
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const CurationPendingList: React.FC<CurationPendingListProps> = ({
  products,
  filteredProducts,
  selectedProduct,
  loading,
  searchTerm,
  onSearchChange,
  onSelectProduct,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full lg:w-[350px] shrink-0 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-sans font-bold text-zinc-900 uppercase tracking-wider">
            {t("Produits en attente")}
          </h2>
          <span className="bg-amber-100 text-amber-800 text-xs font-sans font-bold px-2.5 py-1 rounded-full">
            {products.length}
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("Rechercher un produit ou vendeur...")}
            className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-[#ea580c] font-medium"
          />
        </div>
      </div>

      <div className="space-y-4 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto pr-1">
        {loading ? (
          <div className="bg-white rounded-2xl p-10 border border-zinc-100 flex flex-col items-center justify-center gap-3 text-zinc-400 font-bold text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span>{t("Chargement des produits...")}</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-zinc-100 text-center text-zinc-400 font-bold text-xs">
            {t("Aucun produit en attente.")}
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isSelected = selectedProduct?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className={`w-full text-start p-4 rounded-2xl border transition-all duration-200 flex gap-4 cursor-pointer outline-none ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 shadow-sm"
                    : "bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-sm"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-zinc-100 relative">
                  {p.image ? (
                    <img loading="lazy" decoding="async" src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-sans font-bold text-zinc-800 line-clamp-1 uppercase tracking-tight">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                      {t("Par:")} {p.sellerName || t("Créateur")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-sans font-bold text-zinc-900">{p.price} DA</span>
                    <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                      {p.category || t("Divers")}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
