import React, { useMemo } from "react";
import { ShoppingBag, Package, Trash2, Plus, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { SideDrawer } from "../SideDrawer";
import { formatPrice } from "../../utils/format";
import { getTranslatedField } from "../../utils/translations";
import { Language } from "../../domains/home/homepage.types";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import { useConfirm } from "../../hooks/useConfirm";
import { CartItem } from "../../domains/product/product.types";
import { CartDrawerFooter } from "./CartDrawerFooter";

export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, totalPrice, getCartItemPrice } = useCart();
  const { confirm: showConfirmModal, ConfirmationDialog } = useConfirm();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language as Language;

  // Group items by seller
  const groupedCart = useMemo(() => {
    const groups: Record<string, { sellerName: string; items: (CartItem & { originalIndex: number })[]; total: number }> = {};
    cart.forEach((item, index) => {
      const sellerId = item.sellerId || "unknown";
      const sellerName = item.sellerName || item.shopName || "Boutique Partenaire";
      if (!groups[sellerId]) {
        groups[sellerId] = { sellerName, items: [], total: 0 };
      }
      groups[sellerId].items.push({ ...item, originalIndex: index });
      groups[sellerId].total += getCartItemPrice(item) * item.quantity;
    });
    return groups;
  }, [cart, getCartItemPrice]);

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("Mon Panier") || "Mon Panier"}
      icon={<ShoppingBag className="w-5 h-5" />}
    >
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-zinc-50/50">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4 py-12">
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-600 mb-2">
              <Package className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-xs">
              <h3 className="text-lg font-sans font-bold text-zinc-950">{t("Votre panier est curieusement vide")}</h3>
              <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">{t("Découvrez nos sélections exclusives et trouvez votre bonheur.")}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/shop");
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
            >
              {t("Explorer la boutique")}
            </button>
          </div>
        ) : (
          Object.values(groupedCart).map((group, groupIdx) => {
            // Free shipping threshold logic (example threshold: 5000 DA)
            const threshold = 5000;
            const remaining = Math.max(0, threshold - group.total);
            const progress = Math.min(100, (group.total / threshold) * 100);

            return (
              <div
                key={groupIdx}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-zinc-200/80 flex flex-col gap-4"
              >
                {/* Seller Header */}
                <div className="flex flex-col gap-2 border-b border-zinc-100 pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="bg-zinc-900 text-white text-[10px] rtl:text-xs font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                        {t("Colis")} {groupIdx + 1}
                      </span>
                      <h3 className="font-sans font-bold text-sm text-zinc-900 leading-none">
                        {group.sellerName}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-zinc-500">
                      {group.items.length} {t("article(s)")}
                    </span>
                  </div>

                  {/* Incentive Progress Bar */}
                  {remaining > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] sm:text-xs font-semibold text-zinc-600">
                        {t("Ajoutez encore")}{" "}
                        <span className="text-amber-600 font-bold">{formatPrice(remaining)}</span>{" "}
                        {t("pour amortir la livraison !")}
                      </p>
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] sm:text-xs font-bold text-emerald-600">
                        {t("🎉 Frais de livraison optimisés pour ce vendeur !")}
                      </p>
                      <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-full rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-3.5 divide-y divide-zinc-100">
                  {group.items.map((item: CartItem & { originalIndex: number }, i: number) => (
                    <div key={i} className={`flex gap-3.5 group/item ${i > 0 ? "pt-3.5" : ""}`}>
                      <div className="w-20 h-24 sm:w-22 sm:h-26 rounded-xl overflow-hidden bg-zinc-50 shrink-0 border border-zinc-200/80 relative">
                        <img
                          loading="lazy"
                          src={getOptimizedImageUrl(item.image, 200)}
                          className="w-full h-full object-cover"
                          alt={getTranslatedField(item, "name", lang)}
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-zinc-950 line-clamp-2 leading-snug">
                              {getTranslatedField(item, "name", lang)}
                            </h4>
                            {/* Accessible touch-friendly delete button */}
                            <button
                              type="button"
                              aria-label="Supprimer l'article"
                              onClick={async () => {
                                const ok = await showConfirmModal(
                                  t("Êtes-vous sûr de vouloir retirer cet article de votre panier ?") || "Êtes-vous sûr de vouloir retirer cet article de votre panier ?",
                                  t("Retirer un article") || "Retirer un article"
                                );
                                if (ok) {
                                  removeFromCart(item.originalIndex);
                                }
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer border-none bg-transparent active:scale-95"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {item.selectedVariant && (
                            <p className="text-[11px] font-semibold text-zinc-500 mt-0.5 truncate">
                              {item.selectedVariant}
                            </p>
                          )}
                          <p className="text-xs font-bold text-amber-600 mt-1 tabular-nums">
                            {formatPrice(getCartItemPrice(item))}
                          </p>
                        </div>

                        {/* Quantity Controls - WCAG 44px touch ergonomics */}
                        <div className="flex items-center justify-between mt-2 pt-1">
                          <div className="flex items-center gap-1.5 bg-zinc-100/90 rounded-xl p-0.5 border border-zinc-200/70">
                            <button
                              type="button"
                              aria-label="Diminuer la quantité"
                              disabled={item.quantity <= 1}
                              onClick={() => updateQuantity(item.originalIndex, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-800 disabled:text-zinc-300 hover:bg-white active:scale-90 transition-all cursor-pointer border-none bg-transparent"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs sm:text-sm font-sans font-black min-w-[24px] text-center text-zinc-950 tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label="Augmenter la quantité"
                              onClick={() => updateQuantity(item.originalIndex, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-800 hover:bg-white active:scale-90 transition-all cursor-pointer border-none bg-transparent"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-sm sm:text-base font-sans font-black text-zinc-950 tabular-nums">
                            {formatPrice(getCartItemPrice(item) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {cart.length > 0 && (
        <CartDrawerFooter totalPrice={totalPrice} onClose={onClose} />
      )}
      <ConfirmationDialog />
    </SideDrawer>
  );
};
