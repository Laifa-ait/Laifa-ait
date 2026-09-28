import React from 'react';
import { Store, Package, Star, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Order, OrderItem } from '../../domains/order/order.types';
import { Shop } from '../../domains/seller/shop.types';
import { formatPrice } from '../../utils/format';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

interface OrderSellerItemsProps {
  order: Order;
  shops: Record<string, Shop>;
  onOpenReviewModal: (item: OrderItem) => void;
}

export const OrderSellerItems: React.FC<OrderSellerItemsProps> = ({
  order,
  shops,
  onOpenReviewModal,
}) => {
  const { t } = useTranslation();

  // Group items per sellerId
  const groupedItems = (order.items || []).reduce<Record<string, OrderItem[]>>((acc, item) => {
    const sid = item.sellerId || 'unknown';
    if (!acc[sid]) acc[sid] = [];
    acc[sid].push(item);
    return acc;
  }, {});

  const isDelivered = (order.status || '').toLowerCase() === 'delivered';

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 px-1">
        {t("Articles commandés") || "Articles commandés"} ({order.items?.length || 0})
      </h2>

      <div className="space-y-4">
        {Object.entries(groupedItems).map(([sellerId, items]) => {
          const shop = shops[sellerId];
          const shopName = shop?.shopName || t("Boutique Partenaire Olmart") || "Boutique Partenaire Olmart";
          const shopLogo = shop?.logo;

          return (
            <div
              key={sellerId}
              className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden"
            >
              {/* Seller Sub-header */}
              <div className="bg-stone-50/70 px-4 py-3 border-b border-stone-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-stone-200/80 overflow-hidden flex items-center justify-center shrink-0">
                    {shopLogo ? (
                      <img
                        src={getOptimizedImageUrl(shopLogo, 80)}
                        alt={shopName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Store className="w-3.5 h-3.5 text-stone-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-900 line-clamp-1">
                      {shopName}
                    </span>
                  </div>
                </div>

                {sellerId !== 'unknown' && (
                  <Link
                    to={`/store/${sellerId}`}
                    className="text-[11px] font-medium text-orange-600 hover:text-orange-700 flex items-center gap-0.5 transition-colors cursor-pointer"
                  >
                    <span>{t("Voir la boutique") || "Voir la boutique"}</span>
                    <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                  </Link>
                )}
              </div>

              {/* Items in this shop */}
              <div className="divide-y divide-stone-100 p-2 sm:p-4">
                {items.map((item, idx) => {
                  const itemId = item.productId || `prod_${idx}`;
                  const review = order.reviewsSubmitted?.[itemId];

                  return (
                    <div
                      key={`${itemId}-${idx}`}
                      className="py-3 sm:py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Image */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-stone-100 border border-stone-200/60 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.productImage ? (
                            <img
                              src={getOptimizedImageUrl(item.productImage, 180)}
                              alt={item.name || item.productName || "Produit"}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-stone-300" />
                          )}
                        </div>

                        {/* Title & metadata */}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug line-clamp-2">
                            {item.name || item.productName || t("Article sans titre")}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-stone-500">
                            {item.selectedVariant && (
                              <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                {item.selectedVariant}
                              </span>
                            )}
                            <span>{t("Qté :")} <strong className="font-semibold text-stone-800">{item.quantity}</strong></span>
                            <span>·</span>
                            <span className="text-stone-600 font-medium">{formatPrice(item.price)} / unité</span>
                          </div>
                        </div>
                      </div>

                      {/* Line Price & Review Button */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pl-19 sm:pl-0 pt-1 sm:pt-0">
                        <div className="text-sm font-bold text-stone-900 tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </div>

                        {isDelivered && (
                          <div className="mt-1">
                            {review ? (
                              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>{review.rating}/5</span>
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              </div>
                            ) : (
                              <button
                                onClick={() => onOpenReviewModal(item)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 hover:text-orange-800 bg-orange-50 hover:bg-orange-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                <Star className="w-3 h-3 text-orange-600" />
                                <span>{t("Donner mon avis") || "Donner mon avis"}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
