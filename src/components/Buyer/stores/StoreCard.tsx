import React from "react";
import { UserCheck, Plus, MapPin, ArrowUpRight, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Product } from "../../../domains/product/product.types";
import { getRetroAvatar } from "../../../utils/avatar";

export interface StoreCardData {
  id: string;
  sellerId: string;
  name: string;
  logo?: string | null;
  location?: string;
  description?: string;
  isFollowed: boolean;
}

interface StoreCardProps {
  store: StoreCardData;
  products?: Product[];
  isLoadingAction?: boolean;
  onToggleFollow: (store: StoreCardData) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  products = [],
  isLoadingAction = false,
  onToggleFollow,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/store/${store.sellerId || store.id}`);
  };

  const storeLogo =
    store.logo && !store.logo.startsWith("data:")
      ? store.logo
      : getRetroAvatar(store.name || store.sellerId || "store");

  return (
    <div className="bg-white rounded-[24px] border border-[#dadce0] hover:border-[#bdc1c6] transition-all p-5 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            onClick={handleCardClick}
            className="w-12 h-12 rounded-2xl bg-[#f0f4f9] border border-[#dadce0] p-0.5 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer shadow-xs"
          >
            <img
              src={storeLogo}
              alt={store.name}
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getRetroAvatar(store.name || store.sellerId);
              }}
            />
          </div>

          <div className="min-w-0">
            <h4
              onClick={handleCardClick}
              className="text-base font-semibold text-[#202124] truncate hover:text-[#1a73e8] cursor-pointer"
            >
              {store.name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-[#5f6368] mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#5f6368]" />
              <span className="truncate">{store.location || t("Algérie")}</span>
            </div>
          </div>
        </div>

        {/* Follow/Unfollow Button */}
        <button
          type="button"
          disabled={isLoadingAction}
          onClick={() => onToggleFollow(store)}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
            store.isFollowed
              ? "bg-[#e8f0fe] border-[#1a73e8]/30 text-[#1a73e8] hover:bg-[#d2e3fc]"
              : "bg-white border-[#dadce0] text-[#202124] hover:border-[#1a73e8] hover:bg-[#f8fafd]"
          }`}
        >
          {isLoadingAction ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : store.isFollowed ? (
            <UserCheck className="w-3.5 h-3.5 text-[#1a73e8]" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>{store.isFollowed ? t("Abonné") : t("Suivre")}</span>
        </button>
      </div>

      {/* Description */}
      {store.description && (
        <p className="text-xs text-[#5f6368] line-clamp-2 leading-relaxed">
          {store.description}
        </p>
      )}

      {/* Product Previews */}
      {products.length > 0 && (
        <div className="pt-2 border-t border-[#f1f3f4]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#5f6368] uppercase tracking-wider">
              {t("Aperçu des articles")}
            </span>
            <button
              type="button"
              onClick={handleCardClick}
              className="text-[11px] font-semibold text-[#1a73e8] hover:underline flex items-center gap-0.5 cursor-pointer border-none bg-transparent"
            >
              <span>{t("Voir la boutique")}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {products.slice(0, 3).map((prod) => {
              const prodImg = prod.images?.[0] || getRetroAvatar(prod.title || prod.id);
              return (
                <div
                  key={prod.id}
                  onClick={() => navigate(`/product/${prod.id}`)}
                  className="group rounded-xl border border-[#dadce0] bg-[#f8fafd] p-1.5 cursor-pointer hover:border-[#1a73e8] transition-all"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-white mb-1.5 flex items-center justify-center">
                    <img
                      src={prodImg}
                      alt={prod.title || "Produit"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getRetroAvatar(prod.title || prod.id);
                      }}
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-[#202124] text-center truncate">
                    {prod.price?.toLocaleString()} DA
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
