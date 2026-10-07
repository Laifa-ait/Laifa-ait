import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Store, UserCheck, UserPlus, MessageCircle, Phone, BadgeCheck } from "lucide-react";
import { Shop } from "../../../domains/seller/shop.types";
import { Product } from "../../../domains/product/product.types";
import { SellerCouponBanner } from "../../Shop/SellerCouponBanner";

export interface ProductSellerAlcoveProps {
  shop: Shop | null;
  product: Product;
  isFollowing: boolean;
  followLoading: boolean;
  onFollowToggle: () => void;
}

export const ProductSellerAlcove: React.FC<ProductSellerAlcoveProps> = ({
  shop,
  product,
  isFollowing,
  followLoading,
  onFollowToggle,
}) => {
  const { t } = useTranslation();

  const sellerPhone = shop?.supportPhone || shop?.phone || product.sellerPhone;

  return (
    <div className="space-y-2">
      {shop && (
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-zinc-200/70 shadow-2xs flex items-center justify-between gap-3">
          {/* Seller Profile Summary */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              to={`/shop/${shop.id}`}
              className="w-11 h-11 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
            >
              {shop.logoUrl ? (
                <img
                  loading="lazy"
                  src={shop.logoUrl}
                  alt={shop.shopName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-5 h-5 text-zinc-500" />
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  {t("product.details.sold_by") || "Vendeur certifié"}
                </span>
                <BadgeCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              </div>
              <Link
                to={`/shop/${shop.id}`}
                className="font-bold text-sm text-zinc-950 hover:text-amber-600 transition-colors truncate block"
              >
                {shop.shopName}
              </Link>
            </div>
          </div>

          {/* Quick Actions (Follow & Direct Contact) */}
          <div className="flex items-center gap-2 shrink-0">
            {sellerPhone && (
              <a
                href={`https://wa.me/213${String(sellerPhone).replace(/^0/, "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Bonjour, je vous contacte concernant l'article ${product.name} sur Olmart.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contacter le vendeur sur WhatsApp"
                className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 flex items-center justify-center transition-all shadow-2xs active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}

            {sellerPhone && (
              <a
                href={`tel:${sellerPhone}`}
                aria-label="Appeler le vendeur"
                className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-all shadow-2xs active:scale-95"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={onFollowToggle}
              disabled={followLoading}
              className={`h-9 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs active:scale-95 ${
                isFollowing
                  ? "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200"
                  : "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">{t("product.details.following") || "Abonné"}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t("product.details.follow") || "Suivre"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Discrete Coupon Banner */}
      <SellerCouponBanner sellerId={shop?.id || product.sellerId} className="mt-1" />
    </div>
  );
};
