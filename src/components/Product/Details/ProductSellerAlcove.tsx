import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Store, UserCheck, UserPlus, Phone, MessageCircle } from "lucide-react";
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

  return (
    <>
      {shop && (
        <div className="bg-white rounded-[2rem] p-4 border border-[#EAE3D5] shadow-sm flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-t-full rounded-b-xl bg-[#FAF6F0] flex items-center justify-center overflow-hidden border-2 border-[#008BB5] shrink-0">
                {shop.logoUrl ? (
                  <img
                    loading="lazy"
                    src={shop.logoUrl}
                    alt={shop.shopName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store className="w-5 h-5 text-[#008BB5]" />
                )}
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#008BB5] uppercase tracking-wider mb-0.5">
                  {t("product.details.sold_by") || "Vendu par"}
                </p>
                <Link
                  to={`/shop/${shop.id}`}
                  className="text-sm font-sans font-bold text-[#2C2C28] hover:text-[#008BB5] transition-all line-clamp-1"
                >
                  {shop.shopName}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onFollowToggle}
                disabled={followLoading}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all border shadow-sm cursor-pointer ${
                  isFollowing
                    ? "bg-transparent text-stone-600 border-stone-200 hover:bg-stone-100"
                    : "bg-[#008BB5] text-white border-[#008BB5] hover:bg-[#007CA7]"
                }`}
              >
                {isFollowing ? (
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> {t("product.details.following") || "Abonné"}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <UserPlus className="w-3.5 h-3.5" /> {t("product.details.follow") || "Suivre"}
                  </span>
                )}
              </button>
              <Link
                to={`/shop/${shop.id}`}
                className="flex-1 sm:flex-none text-center px-4 py-2 bg-white text-stone-600 border border-stone-200 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-transparent"
              >
                {t("product.details.view_shop") || "Boutique"}
              </Link>
            </div>
          </div>

          {/* Direct Free Contact Bar */}
          {Boolean(shop.supportPhone || shop.phone || product.sellerPhone) && (
            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                ⚡ Contact Direct Vendeur
              </span>

              {(shop.supportPhone || shop.phone || product.sellerPhone) && (
                <a
                  href={`tel:${shop.supportPhone || shop.phone || product.sellerPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white hover:bg-stone-800 rounded-full text-[11px] font-bold transition-all shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{shop.supportPhone || shop.phone || product.sellerPhone}</span>
                </a>
              )}

              {(shop.supportPhone || shop.phone || product.sellerPhone) && (
                <a
                  href={`https://wa.me/213${String(shop.supportPhone || shop.phone || product.sellerPhone)
                    .replace(/^0/, "")
                    .replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[11px] font-bold transition-all shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Vendeur</span>
                </a>
              )}
            </div>
          )}

          {/* Discrete Seller Promo Coupon Banner */}
          <SellerCouponBanner sellerId={shop.id || product.sellerId} className="mt-1" />
        </div>
      )}

      {/* Discrete Seller Promo Coupon Banner (if no shop block rendered) */}
      {!shop && product.sellerId && (
        <SellerCouponBanner sellerId={product.sellerId} className="mt-2" />
      )}
    </>
  );
};
